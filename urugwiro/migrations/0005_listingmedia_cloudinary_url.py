from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('urugwiro', '0004_unique_listing_review_per_account'),
    ]

    operations = [
        migrations.AlterField(
            model_name='listingmedia',
            name='file',
            field=models.FileField(blank=True, upload_to='listing_media/'),
        ),
        migrations.AddField(
            model_name='listingmedia',
            name='url',
            field=models.URLField(blank=True, max_length=1000),
        ),
    ]
