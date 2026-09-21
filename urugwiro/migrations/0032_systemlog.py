import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('urugwiro', '0031_chatconversation_chatmessage'),
    ]

    operations = [
        migrations.CreateModel(
            name='SystemLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('level', models.CharField(
                    choices=[
                        ('DEBUG',    'Debug'),
                        ('INFO',     'Info'),
                        ('WARNING',  'Warning'),
                        ('ERROR',    'Error'),
                        ('CRITICAL', 'Critical'),
                    ],
                    db_index=True,
                    default='INFO',
                    max_length=10,
                )),
                ('category', models.CharField(
                    choices=[
                        ('AUTH',        'Authentication'),
                        ('USER',        'User Management'),
                        ('PROPERTY',    'Property'),
                        ('LEASE',       'Lease'),
                        ('PAYMENT',     'Payment'),
                        ('MAINTENANCE', 'Maintenance'),
                        ('MARKETPLACE', 'Marketplace'),
                        ('MESSAGING',   'Messaging'),
                        ('SECURITY',    'Security'),
                        ('API',         'API'),
                        ('CHAT',        'AI Chatbot'),
                        ('SYSTEM',      'System'),
                    ],
                    db_index=True,
                    default='SYSTEM',
                    max_length=20,
                )),
                ('message',     models.TextField()),
                ('ip_address',  models.GenericIPAddressField(blank=True, null=True)),
                ('path',        models.CharField(blank=True, max_length=500)),
                ('method',      models.CharField(blank=True, max_length=10)),
                ('status_code', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('details',     models.JSONField(blank=True, default=dict)),
                ('user', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='system_logs',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name':        'System Log',
                'verbose_name_plural': 'System Logs',
                'ordering':            ['-timestamp'],
            },
        ),
    ]
