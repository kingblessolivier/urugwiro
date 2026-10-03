from django.db import migrations, models


def deduplicate_account_reviews(apps, schema_editor):
    ListingReview = apps.get_model('urugwiro', 'ListingReview')
    duplicates = (
        ListingReview.objects.exclude(reviewer_id__isnull=True)
        .values('listing_id', 'reviewer_id')
        .annotate(total=models.Count('id'))
        .filter(total__gt=1)
    )
    for group in duplicates.iterator():
        reviews = ListingReview.objects.filter(
            listing_id=group['listing_id'],
            reviewer_id=group['reviewer_id'],
        ).order_by('-created_at', '-id')
        keep_id = reviews.values_list('id', flat=True).first()
        reviews.exclude(id=keep_id).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('urugwiro', '0003_alter_hotelspec_has_commercial_license_and_more'),
    ]

    operations = [
        migrations.RunPython(deduplicate_account_reviews, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name='listingreview',
            constraint=models.UniqueConstraint(
                fields=('listing', 'reviewer'),
                name='unique_listing_review_per_account',
            ),
        ),
    ]
