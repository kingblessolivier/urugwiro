from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import VerificationReview, VerificationDocument, Listing, ListingAuditLog

@receiver(post_save, sender=VerificationReview)
def handle_verification_review(sender, instance, created, **kwargs):
    if created:
        doc = instance.document
        listing = doc.listing

        # 1. Update document status
        if instance.status == 'approved':
            doc.is_verified = True
            doc.save()

            # 2. Evaluate Listing Verification Level
            # If at least one document is verified, we move to 'verified'
            # In a more complex system, we might require specific types of docs
            old_level = listing.verification_level
            new_level = 'verified'

            if old_level != new_level:
                listing.verification_level = new_level
                listing.save()

                # 3. Audit the change
                ListingAuditLog.objects.create(
                    listing=listing,
                    field_changed='verification_level',
                    old_value=old_level,
                    new_value=new_level,
                    changed_by=instance.reviewer
                )
        else:
            # If rejected, ensure it's not verified
            doc.is_verified = False
            doc.save()
