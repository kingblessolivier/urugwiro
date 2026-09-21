from django.core.management.base import BaseCommand
from urugwiro.models import (
    User, Owner, Seller, ListingOwner,
    Property, SaleProperty, Listing,
    RentalExtension, SaleExtension,
    Unit, Lease, MaintenanceRequest, Payment, Visit, LikedProperties, CustRequest,
)
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Migrates legacy Property and SaleProperty data to the Unified Listing architecture'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting Unified Listing Migration...'))

        # 1. Migrate Owners and Sellers to ListingOwner
        self.stdout.write('Migrating Owners and Sellers...')
        legacy_owners = Owner.objects.all()
        for lo in legacy_owners:
            ListingOwner.objects.get_or_create(
                user=lo.user,
                defaults={
                    'name': lo.name,
                    'email': lo.email,
                    'phone_number': lo.phone_number,
                    'address': lo.address,
                    'image': lo.image,
                }
            )

        legacy_sellers = Seller.objects.all()
        for ls in legacy_sellers:
            ListingOwner.objects.get_or_create(
                user=ls.user,
                defaults={
                    'name': ls.name,
                    'email': ls.email,
                    'phone_number': ls.phone_number,
                    'address': ls.address,
                    'image': ls.image,
                    'is_verified': ls.is_verified,
                }
            )

        # 2. Migrate Rentals (Property -> Listing + RentalExtension)
        self.stdout.write('Migrating Rental Properties...')
        properties = Property.objects.all()
        prop_to_listing_map = {}

        for p in properties:
            owner_profile = ListingOwner.objects.get(user=p.owner.user)
            listing = Listing.objects.create(
                title=p.name,
                description=p.description,
                listing_type='rental',
                price=p.price,
                address=p.address,
                owner=owner_profile,
                status='listed' if p.status == 'Available' else 'rented',
                is_featured=False,
                slug=slugify(p.name)
            )
            RentalExtension.objects.create(
                listing=listing,
                property_type=p.types,
                number_of_units=p.number_of_units
            )
            prop_to_listing_map[p.id] = listing

        # 3. Migrate Sales (SaleProperty -> Listing + SaleExtension)
        self.stdout.write('Migrating Sale Properties...')
        sale_properties = SaleProperty.objects.all()
        sale_prop_to_listing_map = {}

        for sp in sale_properties:
            owner_profile = ListingOwner.objects.get(user=sp.seller.user)
            listing = Listing.objects.create(
                title=sp.title,
                description=sp.description,
                listing_type='sale',
                price=sp.price,
                address=sp.address,
                city=sp.city,
                district=sp.district,
                sector=sp.sector,
                owner=owner_profile,
                status=sp.status,
                is_featured=sp.is_featured,
                views_count=sp.views_count,
                slug=slugify(sp.title)
            )
            SaleExtension.objects.create(
                listing=listing,
                negotiable=sp.negotiable,
                size_sqm=sp.size_sqm,
                bedrooms=sp.bedrooms,
                bathrooms=sp.bathrooms,
                year_built=sp.year_built,
                has_title_deed=sp.has_title_deed,
                has_parking=sp.has_parking,
                has_garden=sp.has_garden,
                is_furnished=sp.is_furnished
            )
            sale_prop_to_listing_map[sp.id] = listing

        # 4. Update Operational Relationships
        self.stdout.write('Updating relationships...')

        # Units
        for u in Unit.objects.all():
            if u.property_id in prop_to_listing_map:
                u.listing = prop_to_listing_map[u.property_id]
                u.save()

        # Leases
        for l in Lease.objects.all():
            if l.property_id in prop_to_listing_map:
                l.listing = prop_to_listing_map[l.property_id]
                l.save()

        # Maintenance Requests
        for mr in MaintenanceRequest.objects.all():
            if mr.property_id in prop_to_listing_map:
                mr.listing = prop_to_listing_map[mr.property_id]
                mr.save()

        # Payments
        for pay in Payment.objects.all():
            if pay.property_id in prop_to_listing_map:
                pay.listing = prop_to_listing_map[pay.property_id]
                pay.save()

        # Visits
        for v in Visit.objects.all():
            if v.property_id in prop_to_listing_map:
                v.listing = prop_to_listing_map[v.property_id]
                v.save()

        # Liked Properties
        for lp in LikedProperties.objects.all():
            if lp.property_id in prop_to_listing_map:
                lp.listing = prop_to_listing_map[lp.property_id]
                lp.save()

        # Customer Requests
        for cr in CustRequest.objects.all():
            if cr.property_id in prop_to_listing_map:
                cr.listing = prop_to_listing_map[cr.property_id]
                cr.save()

        self.stdout.write(self.style.SUCCESS('Migration completed successfully!'))
