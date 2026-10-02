from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import VerificationReview, VerificationDocument, Listing, ListingAuditLog

@receiver(post_save, sender=VerificationReview)
def handle_verification_review(sender, instance, created, **kwargs):
    if not created:
        return

    doc = instance.document
    listing = doc.listing
    doc.is_verified = instance.status == 'approved'
    doc.save(update_fields=['is_verified'])

    documents = listing.verification_docs.all()
    new_level = 'verified' if documents.exists() and not documents.filter(is_verified=False).exists() else 'submitted'
    old_level = listing.verification_level
    if old_level != new_level:
        listing.verification_level = new_level
        listing.save(update_fields=['verification_level'])
        ListingAuditLog.objects.create(
            listing=listing,
            field_changed='verification_level',
            old_value=old_level,
            new_value=new_level,
            changed_by=instance.reviewer,
        )
