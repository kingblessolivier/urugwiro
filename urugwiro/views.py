from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Q
import csv

from .models import (
    Listing, Customer, Conversation, Visit, Offer, Transaction,
    SellerPayment, BusinessExpense, SavedProperty, PropertyInquiry,
    Message, User
)
from .permissions import has_capability


def can_export_reports(user):
    return has_capability(user, 'finance')


def csv_safe(value):
    """Prevent exported user-controlled values from becoming spreadsheet formulas."""
    text = '' if value is None else str(value)
    if text.startswith(('=', '+', '-', '@', '\t', '\r')):
        return f"'{text}"
    return text


# ─── Chat API (kept from legacy) ───

@api_view(['GET'])
def chat_contacts_api(request):
    """Get chat contacts for current user."""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    sent = Message.objects.filter(sender=request.user).values_list('recipient_id', flat=True).distinct()
    received = Message.objects.filter(recipient=request.user).values_list('sender_id', flat=True).distinct()
    contact_ids = set(list(sent) + list(received))
    
    contacts = []
    for uid in contact_ids:
        try:
            u = User.objects.get(id=uid)
            last_msg = Message.objects.filter(
                (Q(sender=request.user, recipient=u) | Q(sender=u, recipient=request.user))
            ).order_by('-sent_date').first()
            unread = Message.objects.filter(sender=u, recipient=request.user, is_read=False).count()
            contacts.append({
                'id': u.id,
                'username': u.username,
                'name': u.get_full_name() or u.username,
                'last_message': last_msg.content[:50] if last_msg else '',
                'last_message_date': last_msg.sent_date.isoformat() if last_msg else '',
                'unread_count': unread,
            })
        except User.DoesNotExist:
            continue
    
    contacts.sort(key=lambda c: c.get('last_message_date', ''), reverse=True)
    return Response(contacts)


@api_view(['GET'])
def chat_history_api(request, contact_id):
    """Get chat history with a specific user."""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    messages = Message.objects.filter(
        Q(sender=request.user, recipient_id=contact_id) |
        Q(sender_id=contact_id, recipient=request.user)
    ).order_by('sent_date')
    
    # Mark as read
    messages.filter(sender_id=contact_id, recipient=request.user, is_read=False).update(is_read=True)
    
    data = [{
        'id': m.id,
        'sender_id': m.sender_id,
        'recipient_id': m.recipient_id,
        'content': m.content,
        'sent_date': m.sent_date.isoformat(),
        'is_read': m.is_read,
        'is_mine': m.sender_id == request.user.id,
    } for m in messages]
    
    return Response(data)


@api_view(['POST'])
def chat_send_api(request):
    """Send a chat message."""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    recipient_id = request.data.get('recipient_id')
    content = request.data.get('content', '').strip()
    listing_id = request.data.get('listing_id')
    
    if not recipient_id or not content:
        return Response({'error': 'recipient_id and content are required'}, status=400)
    
    try:
        recipient = User.objects.get(id=recipient_id)
    except User.DoesNotExist:
        return Response({'error': 'Recipient not found'}, status=404)
    if recipient.pk == request.user.pk:
        return Response({'error': 'You cannot message your own account.'}, status=400)

    has_existing_thread = Message.objects.filter(
        Q(sender=request.user, recipient=recipient)
        | Q(sender=recipient, recipient=request.user)
    ).exists()
    recipient_is_support = recipient.is_superuser or recipient.role in {'admin', 'owner', 'staff'}
    if not has_capability(request.user, 'operations') and not recipient_is_support and not has_existing_thread:
        return Response({'error': 'You cannot start a conversation with this account.'}, status=403)
    
    listing = None
    if listing_id:
        listing = Listing.objects.filter(id=listing_id).first()
    
    msg = Message.objects.create(
        sender=request.user,
        recipient=recipient,
        content=content,
        listing=listing,
    )

    from .consumers import push_notification
    if recipient.role == 'seller':
        notification_link = '/seller/conversations'
    elif has_capability(recipient, 'operations'):
        notification_link = '/admin/conversations'
    else:
        notification_link = '/'
    push_notification(
        recipient=recipient,
        actor=request.user,
        notification_type='new_message',
        message=f"{request.user.get_full_name() or request.user.username}: {content[:80]}",
        link=notification_link,
    )
    
    return Response({
        'id': msg.id,
        'sender_id': msg.sender_id,
        'recipient_id': msg.recipient_id,
        'content': msg.content,
        'sent_date': msg.sent_date.isoformat(),
        'is_read': False,
    }, status=201)


@api_view(['GET'])
def chat_new_users_api(request):
    """Get users available for new chat."""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    chat_roles = {'admin', 'owner', 'staff', 'seller'}
    users = User.objects.exclude(id=request.user.id).filter(is_active=True, role__in=chat_roles)
    if not has_capability(request.user, 'operations'):
        users = users.filter(role__in={'admin', 'owner', 'staff'})
    users = users.order_by('first_name', 'username')[:50]
    data = [{
        'id': u.id,
        'username': u.username,
        'name': u.get_full_name() or u.username,
        'role': u.role,
    } for u in users]
    return Response(data)


# ─── Reports Export ───

@api_view(['GET'])
def admin_reports_export(request, report_type):
    """Export report data as CSV."""
    if not can_export_reports(request.user):
        return Response({'error': 'Finance reporting access required'}, status=403)
    
    supported = {'listings', 'customers', 'conversations', 'visits', 'offers', 'transactions', 'expenses'}
    if report_type not in supported:
        return Response({'error': 'Unsupported report type'}, status=400)

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{report_type}_report.csv"'
    writer = csv.writer(response)
    
    if report_type == 'listings':
        writer.writerow(['ID', 'Title', 'Category', 'Purpose', 'Price', 'Currency', 'Status', 'Seller', 'Date Listed'])
        for l in Listing.objects.select_related('seller').all():
            writer.writerow([csv_safe(value) for value in [l.id, l.title, l.category, l.purpose, l.price, l.currency, l.status, l.seller.name if l.seller else '', l.date_listed.strftime('%Y-%m-%d')]])
    
    elif report_type == 'customers':
        writer.writerow(['ID', 'Name', 'Phone', 'Email', 'Location', 'Source', 'Created'])
        for c in Customer.objects.all():
            writer.writerow([csv_safe(value) for value in [str(c.id), c.full_name, c.phone, c.email, c.location, c.source, c.created_at.strftime('%Y-%m-%d')]])
    
    elif report_type == 'conversations':
        writer.writerow(['ID', 'Customer', 'Listing', 'Seller', 'Status', 'Source', 'Created'])
        for c in Conversation.objects.select_related('customer', 'listing', 'seller').all():
            writer.writerow([csv_safe(value) for value in [str(c.id), c.customer.full_name, c.listing.title, c.seller.name, c.status, c.source, c.created_at.strftime('%Y-%m-%d')]])
    
    elif report_type == 'visits':
        writer.writerow(['ID', 'Customer', 'Listing', 'Date', 'Time', 'Status', 'Phone'])
        for v in Visit.objects.select_related('customer', 'listing').all():
            writer.writerow([csv_safe(value) for value in [v.id, v.customer.full_name, v.listing.title, v.preferred_date, v.preferred_time or '', v.status, v.phone]])
    
    elif report_type == 'offers':
        writer.writerow(['ID', 'Listing', 'Customer', 'Offered Amount', 'Asking Price', 'Currency', 'Status', 'Date'])
        for o in Offer.objects.select_related('listing', 'customer').all():
            writer.writerow([csv_safe(value) for value in [o.id, o.listing.title, o.customer.full_name, o.offered_amount, o.asking_price, o.currency, o.status, o.created_at.strftime('%Y-%m-%d')]])
    
    elif report_type == 'transactions':
        writer.writerow(['ID', 'Listing', 'Seller', 'Customer', 'Type', 'Agreed Price', 'Currency', 'Commission', 'Seller Amount', 'Status', 'Date'])
        for t in Transaction.objects.select_related('listing', 'seller', 'customer').all():
            writer.writerow([csv_safe(value) for value in [str(t.id), t.listing.title, t.seller.name, t.customer.full_name if t.customer else '', t.transaction_type, t.agreed_price, t.currency, t.commission_amount, t.seller_amount, t.status, t.created_at.strftime('%Y-%m-%d')]])
    
    elif report_type == 'expenses':
        writer.writerow(['ID', 'Category', 'Amount', 'Currency', 'Date', 'Vendor', 'Description'])
        for e in BusinessExpense.objects.all():
            writer.writerow([csv_safe(value) for value in [e.id, e.category, e.amount, e.currency, e.date, e.vendor, e.description]])
    
    return response
