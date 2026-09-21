import os
import django
from django.db import transaction

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from urugwiro.models import (
    Property, SaleProperty, Asset, ResidentialSpec, CommercialSpec,
    LandSpec, HotelSpec, VehicleSpec, Listing, ListingOwner
)

def migrate_properties():
    print("Migrating legacy Property models...")
    properties = Property.objects.all()
    for prop in properties:
        with transaction.atomic():
            # Create Asset
            asset = Asset.objects.create(
                name=prop.name,
                province="Kigali",
                district="Unknown",
                sector="Unknown",
                cell="Unknown",
                village="Unknown",
                asset_type='BUILDING' if prop.types in ['Apartment', 'House', 'Commercial'] else 'UNIT',
                total_area=0
            )

            # Create Spec based on type
            if prop.types in ['Apartment', 'House']:
                ResidentialSpec.objects.create(asset=asset, bedrooms=0, bathrooms=0)
            elif prop.types == 'Commercial':
                CommercialSpec.objects.create(asset=asset, zoning_type='Retail')

            # Find or create ListingOwner
            owner_profile, created = ListingOwner.objects.get_or_create(
                user=prop.owner.user,
                defaults={
                    'name': prop.owner.name,
                    'email': prop.owner.email,
                    'phone_number': prop.owner.phone_number,
                }
            )

            Listing.objects.create(
                asset=asset,
                title=prop.name,
                description=prop.description,
                listing_type='rental' if prop.status == 'Available' else 'sale',
                price=prop.price,
                owner=owner_profile,
                status='listed'
            )
            print(f"  Migrated Property: {prop.name} -> Asset: {asset.name}")

def migrate_saleproperties():
    print("Migrating legacy SaleProperty models...")
    sales = SaleProperty.objects.all()
    for sale in sales:
        with transaction.atomic():
            # Determine Asset Type
            asset_type = 'BUILDING'
            if sale.property_type == 'Land': asset_type = 'LAND'
            elif sale.property_type in ['Car', 'Motorcycle']: asset_type = 'VEHICLE'

            # Create Asset
            asset = Asset.objects.create(
                name=sale.title,
                province=sale.city,
                district=sale.district,
                sector=sale.sector,
                cell="Unknown",
                village="Unknown",
                asset_type=asset_type,
                total_area=sale.size_sqm if sale.size_sqm else 0
            )

            # Create Spec
            if sale.property_type in ['House', 'Apartment', 'Villa']:
                ResidentialSpec.objects.create(
                    asset=asset,
                    bedrooms=sale.bedrooms,
                    bathrooms=sale.bathrooms,
                    year_built=sale.year_built,
                    is_furnished=sale.is_furnished
                )
            elif sale.property_type == 'Land':
                LandSpec.objects.create(asset=asset, road_access=sale.has_title_deed)

            # Find or create ListingOwner
            owner_profile, created = ListingOwner.objects.get_or_create(
                user=sale.seller.user,
                defaults={
                    'name': sale.seller.name,
                    'email': sale.seller.email,
                    'phone_number': sale.seller.phone_number,
                }
            )

            Listing.objects.create(
                asset=asset,
                title=sale.title,
                description=sale.description,
                listing_type='sale' if sale.listing_type == 'sale' else 'rental',
                price=sale.price,
                owner=owner_profile,
                status='listed' if sale.status == 'listed' else 'withdrawn'
            )
            print(f"  Migrated SaleProperty: {sale.title} -> Asset: {asset.name}")

if __name__ == "__main__":
    try:
        migrate_properties()
        migrate_saleproperties()
        print("Migration successfully completed.")
    except Exception as e:
        print(f"Migration failed: {e}")
