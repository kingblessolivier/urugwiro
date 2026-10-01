from django.db.models import Count
from .models import Message, Notification, Announcement


def global_context(request):
    """Provide common template context: unread message/notification counts and role flags."""
    user = getattr(request, 'user', None)
    unread_messages = 0
    is_seller = False
    is_admin = False
    is_owner = False
    unread_notifications_count = 0
    recent_notifications = []

    if user and user.is_authenticated:
        unread_messages = Message.objects.filter(recipient=user, is_read=False).count()
        role = getattr(user, 'role', '')
        is_seller = role == 'seller' or hasattr(user, 'seller_profile')
        is_admin = role == 'admin' or user.is_staff or user.is_superuser
        is_owner = role == 'owner'
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
        'unread_messages': unread_messages,
        'is_seller': is_seller,
        'is_admin': is_admin,
        'is_owner': is_owner,
        'unread_notifications_count': unread_notifications_count,
        'recent_notifications': recent_notifications,
    }
