from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('urugwiro', '0032_systemlog'),
    ]

    operations = [
        migrations.CreateModel(
            name='Announcement',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text',       models.CharField(max_length=200, help_text='Text shown in the scrolling ticker')),
                ('icon',       models.CharField(
                    max_length=40, default='campaign',
                    choices=[
                        ('campaign','Campaign'),('home_work','Home / Property'),
                        ('real_estate_agent','Agent'),('verified','Verified'),
                        ('star','Star'),('info','Info'),('warning','Warning'),
                        ('celebration','Celebration'),('local_offer','Offer'),('schedule','Schedule'),
                    ]
                )),
                ('is_active',  models.BooleanField(default=True, help_text='Uncheck to hide without deleting')),
                ('order',      models.PositiveSmallIntegerField(default=0, help_text='Lower = shown first')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={'ordering': ['order', 'created_at'], 'verbose_name': 'Announcement', 'verbose_name_plural': 'Announcements'},
        ),
    ]
