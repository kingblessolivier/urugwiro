from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Real-time chat — room_id is "{min_user_id}_{max_user_id}"
    re_path(r'ws/chat/(?P<room_id>[^/]+)/$', consumers.ChatConsumer.as_asgi()),
    # Real-time notifications per user
    re_path(r'ws/notifications/(?P<user_id>\d+)/$', consumers.NotificationConsumer.as_asgi()),
]
