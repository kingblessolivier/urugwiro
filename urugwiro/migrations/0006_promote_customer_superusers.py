from django.db import migrations


def promote_customer_superusers(apps, schema_editor):
    User = apps.get_model('urugwiro', 'User')
    User.objects.filter(is_superuser=True, role='customer').update(role='admin', is_staff=True)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('urugwiro', '0005_listingmedia_cloudinary_url'),
    ]

    operations = [
        migrations.RunPython(promote_customer_superusers, noop_reverse),
    ]
