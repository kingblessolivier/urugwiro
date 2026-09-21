from django.db.models import Count

from .models import Message, Tenant, Owner, Agent, Seller, Notification, Announcement


def global_context(request):
    """Provide common template context: unread message/notification counts and role flags."""
    user = getattr(request, 'user', None)
    message_total = 0
    unread_messages = 0
    is_tenant = False
    is_owner = False
    is_agent = False
    is_seller = False
    tenant_user = None
    owner_user = None
    agent_user = None
    seller_user = None
    unread_notifications_count = 0
    recent_notifications = []

    if user and user.is_authenticated:
        message_total = Message.objects.filter(recipient=user).count()
        unread_messages = Message.objects.filter(recipient=user, is_read=False).count()
        is_tenant = hasattr(user, 'tenant_profile')
        is_owner = hasattr(user, 'owner_profile')
        is_agent = hasattr(user, 'agent_profile')
        is_seller = hasattr(user, 'seller_profile')
        if is_tenant:
            tenant_user = user.tenant_profile
        if is_owner:
            owner_user = user.owner_profile
        if is_agent:
            agent_user = user.agent_profile
        if is_seller:
            seller_user = user.seller_profile
        unread_notifications_count = Notification.objects.filter(
            recipient=user, is_read=False
        ).count()
        recent_notifications = list(
            Notification.objects.filter(recipient=user)
            .select_related('actor')
            .order_by('-created_at')[:5]
        )

    announcements = list(Announcement.objects.filter(is_active=True))

    return {
        'announcements': announcements,
        'message_total': message_total,
        'unread_messages': unread_messages,
        'is_tenant': is_tenant,
        'is_owner': is_owner,
        'is_agent': is_agent,
        'is_seller': is_seller,
        'tenant_user': tenant_user,
        'owner_user': owner_user,
        'agent_user': agent_user,
        'seller_user': seller_user,
        'unread_notifications_count': unread_notifications_count,
        'recent_notifications': recent_notifications,
    }
