import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone


# ─────────────────────────────────────────────────────────────
# Helper: create a Notification and push it over WebSocket
# Called from sync views via: from asgiref.sync import async_to_sync
# ─────────────────────────────────────────────────────────────

def push_notification(recipient, actor, notification_type, message, link=''):
    """
    Sync-safe helper. Creates a Notification row and sends it to the
    user's personal WebSocket group.
    Usage in views:
        from urugwiro.consumers import push_notification
        push_notification(post.author, request.user, 'like', '...', '/feed/post/1/')
    """
    from asgiref.sync import async_to_sync
    from channels.layers import get_channel_layer
    from .models import Notification

    notif = Notification.objects.create(
        recipient=recipient,
        actor=actor,
        notification_type=notification_type,
        message=message,
        link=link,
    )
    unread_count = Notification.objects.filter(recipient=recipient, is_read=False).count()

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'notif_{recipient.id}',
        {
            'type': 'send_notification',
            'notification_id': notif.id,
            'notification_type': notification_type,
            'message': message,
            'link': link,
            'actor': actor.username if actor else '',
            'unread_count': unread_count,
            'created_at': notif.created_at.strftime('%Y-%m-%d %H:%M'),
        }
    )
    return notif


# ─────────────────────────────────────────────────────────────
# Chat Consumer
# Group name: chat_{min_id}_{max_id}  (sorted so both sides join same group)
# ─────────────────────────────────────────────────────────────

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.group_name = f'chat_{self.room_id}'
        self.user = self.scope['user']

        # Reject unauthenticated connections
        if not self.user.is_authenticated:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Send last 50 messages as history
        history = await self.get_history()
        if history:
            await self.send(text_data=json.dumps({'type': 'history', 'messages': history}))

        # Broadcast user-joined for online indicator
        await self.channel_layer.group_send(
            self.group_name,
            {'type': 'user_status', 'user_id': self.user.id, 'status': 'online'}
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_send(
            self.group_name,
            {'type': 'user_status', 'user_id': self.user.id, 'status': 'offline'}
        )
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action', 'send')

        if action == 'typing':
            await self.channel_layer.group_send(
                self.group_name,
                {'type': 'typing_indicator', 'user_id': self.user.id,
                 'sender_name': self.user.get_full_name() or self.user.username,
                 'is_typing': data.get('is_typing', False)}
            )
            return

        if action == 'mark_read':
            await self.mark_messages_read()
            await self.channel_layer.group_send(
                self.group_name,
                {'type': 'read_receipt', 'reader_id': self.user.id}
            )
            return

        if action == 'delete':
            message_id = data.get('message_id')
            if message_id:
                deleted = await self.delete_message(message_id)
                if deleted:
                    await self.channel_layer.group_send(
                        self.group_name,
                        {'type': 'message_deleted', 'message_id': message_id,
                         'sender_id': self.user.id}
                    )
            return

        # Default: send a message
        content = data.get('message', '').strip()
        if not content:
            return

        # Parse room_id to get recipient
        parts = self.room_id.split('_')
        if len(parts) != 2:
            return
        id_a, id_b = int(parts[0]), int(parts[1])
        recipient_id = id_b if self.user.id == id_a else id_a

        # Save to DB
        msg = await self.save_message(recipient_id, content)
        if not msg:
            return

        # Broadcast to group
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message_id': msg['id'],
                'message': content,
                'sender_id': self.user.id,
                'sender_name': self.user.get_full_name() or self.user.username,
                'sender_avatar': self.user.username[:1].upper(),
                'timestamp': msg['timestamp'],
                'full_timestamp': msg['full_timestamp'],
            }
        )

        # Push notification to recipient (non-blocking)
        await self.send_message_notification(recipient_id, content)

    # ── Group event handlers ──

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message_id': event['message_id'],
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'sender_avatar': event['sender_avatar'],
            'timestamp': event['timestamp'],
            'full_timestamp': event.get('full_timestamp', ''),
        }))

    async def typing_indicator(self, event):
        # Don't echo typing back to the typer
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'sender_name': event['sender_name'],
                'is_typing': event['is_typing'],
            }))

    async def read_receipt(self, event):
        if event['reader_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'read_receipt',
                'reader_id': event['reader_id'],
            }))

    async def message_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'deleted',
            'message_id': event['message_id'],
            'sender_id': event['sender_id'],
        }))

    async def user_status(self, event):
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'status',
                'user_id': event['user_id'],
                'status': event['status'],
            }))

    # ── DB helpers ──

    @database_sync_to_async
    def save_message(self, recipient_id, content):
        from .models import Message, User
        try:
            recipient = User.objects.get(id=recipient_id)
            msg = Message.objects.create(
                sender=self.user,
                recipient=recipient,
                content=content,
            )
            return {
                'id': msg.id,
                'timestamp': msg.sent_date.strftime('%H:%M'),
                'full_timestamp': msg.sent_date.strftime('%b %d, %I:%M %p'),
            }
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def get_history(self):
        from .models import Message
        from django.db.models import Q
        parts = self.room_id.split('_')
        if len(parts) != 2:
            return []
        id_a, id_b = int(parts[0]), int(parts[1])
        msgs = Message.objects.filter(
            Q(sender_id=id_a, recipient_id=id_b) | Q(sender_id=id_b, recipient_id=id_a)
        ).order_by('-sent_date')[:50]
        return [
            {
                'message_id': m.id,
                'message': m.content,
                'sender_id': m.sender_id,
                'sender_name': m.sender.get_full_name() or m.sender.username,
                'sender_avatar': m.sender.username[:1].upper(),
                'timestamp': m.sent_date.strftime('%H:%M'),
                'full_timestamp': m.sent_date.strftime('%b %d, %I:%M %p'),
                'is_read': m.is_read,
            }
            for m in reversed(list(msgs))
        ]

    @database_sync_to_async
    def mark_messages_read(self):
        from .models import Message
        parts = self.room_id.split('_')
        if len(parts) != 2:
            return
        id_a, id_b = int(parts[0]), int(parts[1])
        other_id = id_b if self.user.id == id_a else id_a
        Message.objects.filter(
            sender_id=other_id, recipient_id=self.user.id, is_read=False
        ).update(is_read=True)

    @database_sync_to_async
    def delete_message(self, message_id):
        from .models import Message
        try:
            msg = Message.objects.get(id=message_id, sender=self.user)
            msg.delete()
            return True
        except Message.DoesNotExist:
            return False

    @database_sync_to_async
    def send_message_notification(self, recipient_id, content):
        from .models import User
        try:
            recipient = User.objects.get(id=recipient_id)
            push_notification(
                recipient=recipient,
                actor=self.user,
                notification_type='message',
                message=f'{self.user.get_full_name() or self.user.username}: {content[:60]}',
                link='',
            )
        except User.DoesNotExist:
            pass


# ─────────────────────────────────────────────────────────────
# Notification Consumer
# Group name: notif_{user_id}
# ─────────────────────────────────────────────────────────────

class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'notif_{self.user_id}'
        self.user = self.scope['user']

        # Only allow the matching authenticated user
        if not self.user.is_authenticated or str(self.user.id) != str(self.user_id):
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Send current unread count on connect
        count = await self.get_unread_count()
        await self.send(text_data=json.dumps({'type': 'init', 'unread_count': count}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        # Client can send mark-read requests
        data = json.loads(text_data)
        if data.get('action') == 'mark_read':
            await self.mark_all_read()
            await self.send(text_data=json.dumps({'type': 'init', 'unread_count': 0}))

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification_id': event.get('notification_id'),
            'notification_type': event.get('notification_type'),
            'message': event.get('message'),
            'link': event.get('link', ''),
            'actor': event.get('actor', ''),
            'unread_count': event.get('unread_count', 1),
            'created_at': event.get('created_at', ''),
        }))

    @database_sync_to_async
    def get_unread_count(self):
        from .models import Notification
        return Notification.objects.filter(recipient_id=self.user_id, is_read=False).count()

    @database_sync_to_async
    def mark_all_read(self):
        from .models import Notification
        Notification.objects.filter(recipient_id=self.user_id, is_read=False).update(is_read=True)
