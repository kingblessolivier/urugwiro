from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
import random
from urugwiro.models import (
    User, ListingOwner, Agent, Tenant, Asset, LandSpec, ResidentialSpec, VehicleSpec,
    Listing, SaleExtension, RentalExtension, LandExtension, AgentAssignment,
    Offer, TransactionDeal, DealDocument, SiteVisit, PropertyInquiry,
    Lease, Payment, MaintenanceRequest, VerificationDocument
)

class Command(BaseCommand):
    help = 'Seeds authentic, verified Rwandan real estate ecosystem data (parcels, deals, offers, leases, payments).'

    def handle(self, *args, **options):
        self.stdout.write('=====================================================')
        self.stdout.write('Urugwiro Sovereign Ecosystem Seeder Initiating...')
        self.stdout.write('=====================================================')

        # 1. Create Core Users
        self.stdout.write('[1/10] Provisioning verified platform stakeholders...')

        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@urugwiro.rw',
                'first_name': 'Sovereign',
                'last_name': 'Administrator',
                'role': 'Admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if not admin_user.has_usable_password():
            admin_user.set_password('Admin@1234')
            admin_user.save()

        # Agents
        agent_user1, _ = User.objects.get_or_create(
            username='claire_agent',
            defaults={
                'email': 'claire.mukamana@urugwiro.rw',
                'first_name': 'Claire',
                'last_name': 'Mukamana',
                'role': 'Agent',
                'is_active': True,
            }
        )
        agent_user1.set_password('Claire@1234')
        agent_user1.save()

        agent_user2, _ = User.objects.get_or_create(
            username='jeanpaul_agent',
            defaults={
                'email': 'jp.habimana@urugwiro.rw',
                'first_name': 'Jean-Paul',
                'last_name': 'Habimana',
                'role': 'Agent',
                'is_active': True,
            }
        )
        agent_user2.set_password('JeanPaul@1234')
        agent_user2.save()

        agent_mukamana, _ = Agent.objects.get_or_create(
            user=agent_user1,
            defaults={
                'name': 'Claire Mukamana',
                'email': agent_user1.email,
                'phone_number': '+250788349120',
                'license_number': 'RERA-RW-2023-0042',
                'specialization': 'Luxury Residential & Nyarutarama Estates',
                'is_verified': True,
                'rating': 4.95,
                'total_deals': 18,
            }
        )

        agent_habimana, _ = Agent.objects.get_or_create(
            user=agent_user2,
            defaults={
                'name': 'Jean-Paul Habimana',
                'email': agent_user2.email,
                'phone_number': '+250788592014',
                'license_number': 'RERA-RW-2022-0019',
                'specialization': 'Commercial Parcels & RLMUA Cadastre',
                'is_verified': True,
                'rating': 4.88,
                'total_deals': 24,
            }
        )

        # Sellers
        seller_user1, _ = User.objects.get_or_create(
            username='emmanuel_gasana',
            defaults={
                'email': 'emmanuel.gasana@kigalireal.rw',
                'first_name': 'Emmanuel',
                'last_name': 'Gasana',
                'role': 'Seller',
                'is_active': True,
            }
        )
        seller_user1.set_password('Gasana@1234')
        seller_user1.save()

        owner_gasana, _ = ListingOwner.objects.get_or_create(
            user=seller_user1,
            defaults={
                'name': 'Emmanuel Gasana',
                'email': seller_user1.email,
                'phone_number': '+250788112233',
                'address': 'Nyarutarama, Gasabo, Kigali',
                'is_verified': True,
                'bio': 'Accredited high-net-worth real estate developer and prime land investor in Kigali.'
            }
        )

        seller_user2, _ = User.objects.get_or_create(
            username='diane_uwase',
            defaults={
                'email': 'diane.uwase@estateholdings.rw',
                'first_name': 'Diane',
                'last_name': 'Uwase',
                'role': 'Seller',
                'is_active': True,
            }
        )
        seller_user2.set_password('Uwase@1234')
        seller_user2.save()

        owner_uwase, _ = ListingOwner.objects.get_or_create(
            user=seller_user2,
            defaults={
                'name': 'Diane Uwase',
                'email': seller_user2.email,
                'phone_number': '+250788445566',
                'address': 'Kicukiro, Kigali',
                'is_verified': True,
                'bio': 'Commercial asset manager specializing in transport corridors and logistics plots.'
            }
        )

        # Property Owner
        owner_user3, _ = User.objects.get_or_create(
            username='patrick_nkurunziza',
            defaults={
                'email': 'patrick.n@medinvest.rw',
                'first_name': 'Dr. Patrick',
                'last_name': 'Nkurunziza',
                'role': 'Owner',
                'is_active': True,
            }
        )
        owner_user3.set_password('Patrick@1234')
        owner_user3.save()

        owner_nkurunziza, _ = ListingOwner.objects.get_or_create(
            user=owner_user3,
            defaults={
                'name': 'Dr. Patrick Nkurunziza',
                'email': owner_user3.email,
                'phone_number': '+250788778899',
                'address': 'Kiyovu, Nyarugenge, Kigali',
                'is_verified': True,
                'bio': 'Portfolio owner holding residential estates and rental condominiums across Kigali.'
            }
        )

        # Buyer
        buyer_user, _ = User.objects.get_or_create(
            username='aline_ingabire',
            defaults={
                'email': 'aline.ingabire@diasporainvest.rw',
                'first_name': 'Aline',
                'last_name': 'Ingabire',
                'role': 'Buyer',
                'is_active': True,
            }
        )
        buyer_user.set_password('Aline@1234')
        buyer_user.save()

        # Tenant
        tenant_user, _ = User.objects.get_or_create(
            username='kevin_mugisha',
            defaults={
                'email': 'kevin.mugisha@techkigali.rw',
                'first_name': 'Kevin',
                'last_name': 'Mugisha',
                'role': 'Tenant',
                'is_active': True,
            }
        )
        tenant_user.set_password('Kevin@1234')
        tenant_user.save()

        tenant_profile, _ = Tenant.objects.get_or_create(
            user=tenant_user,
            defaults={
                'name': 'Kevin Mugisha',
                'email': tenant_user.email,
                'phone_number': '+250788223344',
                'address': 'Kacyiru, Gasabo, Kigali',
            }
        )

        # 2. Provision Physical Assets & Cadastral Specs
        self.stdout.write('[2/10] Synthesizing RLMUA cadastral assets and spatial specs...')

        # Asset 1: Nyarutarama Villa
        asset1, _ = Asset.objects.get_or_create(
            name='The Grand Nyarutarama Panorama Villa',
            defaults={
                'asset_type': 'BUILDING',
                'province': 'City of Kigali',
                'district': 'Gasabo',
                'sector': 'Remera',
                'cell': 'Nyarutarama',
                'village': 'Kangondo',
                'latitude': -1.9394,
                'longitude': 30.0967,
                'total_area': 850.0,
            }
        )
        ResidentialSpec.objects.get_or_create(
            asset=asset1,
            defaults={
                'sub_type': 'Villa',
                'bedrooms': 5,
                'bathrooms': 5,
                'built_up_area_sqm': 420.0,
                'compound_size_sqm': 850.0,
                'has_swimming_pool': True,
                'has_garden': True,
                'has_staff_quarters': True,
                'has_solar_water_heater': True,
                'has_backup_generator': True,
                'water_tank_capacity_liters': 5000,
                'backup_generator_kva': 25.0,
                'has_three_phase_power': True,
                'has_fiber_internet': True,
                'has_cctv': True,
                'parking_spaces': 4,
                'master_plan_zoning': 'R1A',
                'security_type': 'Perimeter Wall & Electric Fence',
                'road_access_type': 'Cobblestone',
                'is_furnished': True,
            }
        )

        # Asset 2: Kibagabaga Land Plot
        asset2, _ = Asset.objects.get_or_create(
            name='Prime Kibagabaga Hillside View Parcel',
            defaults={
                'asset_type': 'LAND',
                'province': 'City of Kigali',
                'district': 'Gasabo',
                'sector': 'Kimironko',
                'cell': 'Kibagabaga',
                'village': 'Ruyenzi',
                'latitude': -1.9288,
                'longitude': 30.1245,
                'total_area': 1200.0,
            }
        )
        LandSpec.objects.get_or_create(
            asset=asset2,
            defaults={
                'land_use_category': 'Residential',
                'tenure_type': 'EmphyteuticLease',
                'lease_years_remaining': 82,
                'upi_number': '1/02/11/04/1820',
                'title_deed_number': 'UPI 1/02/11/04/1820',
                'zoning_code': 'R1A Single Family',
                'max_permitted_floors': 'G+1',
                'floor_area_ratio': 0.8,
                'building_coverage_ratio': 45.0,
                'terrain': 'Gentle Slope',
                'slope_gradient_percent': 6.5,
                'road_access': True,
                'road_type': 'Cobblestone',
                'water_onsite': True,
                'electricity_onsite': True,
                'has_fiber_conduit': True,
                'drainage_system': 'Covered Concrete',
                'is_encumbrance_free': True,
            }
        )

        # Asset 3: Gacuriro Luxury Apartment
        asset3, _ = Asset.objects.get_or_create(
            name='Gacuriro View Heights - Residence 3B',
            defaults={
                'asset_type': 'UNIT',
                'province': 'City of Kigali',
                'district': 'Gasabo',
                'sector': 'Kinyinya',
                'cell': 'Gacuriro',
                'village': 'Ubumwe',
                'latitude': -1.9167,
                'longitude': 30.0892,
                'total_area': 185.0,
            }
        )
        ResidentialSpec.objects.get_or_create(
            asset=asset3,
            defaults={
                'sub_type': 'Apartment',
                'bedrooms': 3,
                'bathrooms': 3,
                'built_up_area_sqm': 185.0,
                'compound_size_sqm': 0.0,
                'floor_number': 3,
                'has_elevator': True,
                'balcony': True,
                'is_furnished': True,
                'road_access_type': 'Tarmac',
                'monthly_service_charge': 75000.0,
                'water_tank_capacity_liters': 10000,
                'has_fiber_internet': True,
                'has_cctv': True,
                'parking_spaces': 2,
            }
        )

        # Asset 4: Gahanga Corridor Commercial Plot
        asset4, _ = Asset.objects.get_or_create(
            name='Bugesera Highway Link Mixed-Use Commercial Plot',
            defaults={
                'asset_type': 'LAND',
                'province': 'City of Kigali',
                'district': 'Kicukiro',
                'sector': 'Gahanga',
                'cell': 'Kagasa',
                'village': 'Nunga',
                'latitude': -2.0125,
                'longitude': 30.1089,
                'total_area': 2500.0,
            }
        )
        LandSpec.objects.get_or_create(
            asset=asset4,
            defaults={
                'land_use_category': 'Commercial',
                'tenure_type': 'EmphyteuticLease',
                'lease_years_remaining': 78,
                'upi_number': '1/03/05/02/8821',
                'title_deed_number': 'UPI 1/03/05/02/8821',
                'zoning_code': 'C1 Mixed-Use Commercial',
                'max_permitted_floors': 'G+4',
                'floor_area_ratio': 2.5,
                'building_coverage_ratio': 60.0,
                'terrain': 'Flat',
                'slope_gradient_percent': 1.2,
                'road_access': True,
                'road_type': 'Asphalt / 4-Lane Highway',
                'water_onsite': True,
                'electricity_onsite': True,
                'has_fiber_conduit': True,
                'drainage_system': 'Open Culvert',
                'is_encumbrance_free': True,
            }
        )

        # Asset 5: Old Kiyovu Ambassadorial Estate
        asset5, _ = Asset.objects.get_or_create(
            name='Prestige Old Kiyovu Ambassadorial Residence',
            defaults={
                'asset_type': 'BUILDING',
                'province': 'City of Kigali',
                'district': 'Nyarugenge',
                'sector': 'Nyarugenge',
                'cell': 'Kiyovu',
                'village': 'Inyange',
                'latitude': -1.9542,
                'longitude': 30.0611,
                'total_area': 1500.0,
            }
        )
        ResidentialSpec.objects.get_or_create(
            asset=asset5,
            defaults={
                'sub_type': 'Villa',
                'bedrooms': 6,
                'bathrooms': 6,
                'built_up_area_sqm': 550.0,
                'compound_size_sqm': 1500.0,
                'has_swimming_pool': True,
                'has_garden': True,
                'has_staff_quarters': True,
                'has_backup_generator': True,
                'water_tank_capacity_liters': 15000,
                'backup_generator_kva': 45.0,
                'has_three_phase_power': True,
                'has_fiber_internet': True,
                'has_cctv': True,
                'parking_spaces': 6,
                'master_plan_zoning': 'R1',
                'security_type': 'Perimeter Wall & Guard Post',
                'road_access_type': 'Tarmac',
                'is_furnished': True,
            }
        )

        # Asset 6: Luxury 4x4 Fleet (Toyota Land Cruiser 300 V6 GR-Sport)
        asset6, _ = Asset.objects.get_or_create(
            name='Toyota Land Cruiser 300 V6 GR-Sport (2023)',
            defaults={
                'asset_type': 'VEHICLE',
                'province': 'City of Kigali',
                'district': 'Gasabo',
                'sector': 'Kacyiru',
                'cell': 'Kamatamu',
                'village': 'Kabagari',
                'latitude': -1.9441,
                'longitude': 30.0782,
                'total_area': 0.0,
            }
        )
        VehicleSpec.objects.get_or_create(
            asset=asset6,
            defaults={
                'vehicle_type': 'Car',
                'make': 'Toyota',
                'model': 'Land Cruiser 300 GR-Sport',
                'year': 2023,
                'mileage': 38500,
                'fuel_type': 'Diesel',
                'transmission': 'Automatic',
                'drivetrain': '4WD',
                'engine_capacity': '3300cc V6 Twin-Turbo',
                'horsepower': 304,
                'condition': 'Used Foreign',
                'body_type': 'SUV',
                'seating_capacity': 7,
                'plate_number': 'RAC 892 X',
                'plate_type': 'Private (RAx)',
                'vin_chassis_number': 'JT7HJ300X049281',
                'rra_customs_status': 'DutyPaid',
                'controle_technique_expiry': (datetime.now() + timedelta(days=240)).date(),
                'insurance_expiry': (datetime.now() + timedelta(days=200)).date(),
                'has_air_conditioning': True,
                'has_leather_seats': True,
                'has_sunroof': True,
                'has_reverse_camera': True,
                'has_service_history': True,
                'includes_driver': False,
            }
        )

        # Asset 7: Executive Sedan (Mercedes-Benz GLE 450 4MATIC)
        asset7, _ = Asset.objects.get_or_create(
            name='Mercedes-Benz GLE 450 4MATIC AMG Line (2022)',
            defaults={
                'asset_type': 'VEHICLE',
                'province': 'City of Kigali',
                'district': 'Nyarugenge',
                'sector': 'Kiyovu',
                'cell': 'Kiyovu',
                'village': 'Rugenge',
                'latitude': -1.9560,
                'longitude': 30.0630,
                'total_area': 0.0,
            }
        )
        VehicleSpec.objects.get_or_create(
            asset=asset7,
            defaults={
                'vehicle_type': 'Car',
                'make': 'Mercedes-Benz',
                'model': 'GLE 450 4MATIC',
                'year': 2022,
                'mileage': 41000,
                'fuel_type': 'Petrol',
                'transmission': 'Automatic',
                'drivetrain': 'AWD',
                'engine_capacity': '3000cc EQ Boost',
                'horsepower': 362,
                'condition': 'Used Foreign',
                'body_type': 'SUV',
                'seating_capacity': 5,
                'plate_number': 'RAD 104 T',
                'plate_type': 'Private (RAx)',
                'vin_chassis_number': 'W1N1671591A39182',
                'rra_customs_status': 'DutyPaid',
                'controle_technique_expiry': (datetime.now() + timedelta(days=180)).date(),
                'insurance_expiry': (datetime.now() + timedelta(days=150)).date(),
                'has_air_conditioning': True,
                'has_leather_seats': True,
                'has_sunroof': True,
                'has_reverse_camera': True,
                'has_service_history': True,
                'includes_driver': True,
            }
        )

        # Asset 8: Touring Motorcycle (BMW R1250 GS Adventure)
        asset8, _ = Asset.objects.get_or_create(
            name='BMW R1250 GS Adventure Triple Black (2023)',
            defaults={
                'asset_type': 'VEHICLE',
                'province': 'City of Kigali',
                'district': 'Gasabo',
                'sector': 'Remera',
                'cell': 'Rukiri I',
                'village': 'Amarembo',
                'latitude': -1.9612,
                'longitude': 30.1120,
                'total_area': 0.0,
            }
        )
        VehicleSpec.objects.get_or_create(
            asset=asset8,
            defaults={
                'vehicle_type': 'Motorcycle',
                'make': 'BMW',
                'model': 'R1250 GS Adventure',
                'year': 2023,
                'mileage': 12400,
                'fuel_type': 'Petrol',
                'transmission': 'Manual',
                'drivetrain': 'RWD',
                'engine_capacity': '1254cc Boxer',
                'horsepower': 136,
                'condition': 'Used Foreign',
                'body_type': 'Sportbike',
                'seating_capacity': 2,
                'plate_number': 'RAC 312 M',
                'plate_type': 'Private (RAx)',
                'vin_chassis_number': 'WB10J9204PZL0291',
                'rra_customs_status': 'DutyPaid',
                'controle_technique_expiry': (datetime.now() + timedelta(days=300)).date(),
                'insurance_expiry': (datetime.now() + timedelta(days=280)).date(),
                'has_service_history': True,
                'includes_driver': False,
                'includes_helmet': True,
                'has_delivery_rack': True,
            }
        )

        # Asset 9: Bugesera Agricultural Farmland (5 Hectares / 50,000 sqm)
        asset9, _ = Asset.objects.get_or_create(
            name='Bugesera Fertile Agricultural Estate (5 Hectares)',
            defaults={
                'asset_type': 'LAND',
                'province': 'Eastern Province',
                'district': 'Bugesera',
                'sector': 'Nyamata',
                'cell': 'Maranyundo',
                'village': 'Kibungo',
                'latitude': -2.1480,
                'longitude': 30.1250,
                'total_area': 50000.0,
            }
        )
        LandSpec.objects.get_or_create(
            asset=asset9,
            defaults={
                'land_use_category': 'Agricultural',
                'tenure_type': 'EmphyteuticLease',
                'lease_years_remaining': 89,
                'upi_number': '5/02/08/03/4921',
                'title_deed_number': 'UPI 5/02/08/03/4921',
                'zoning_code': 'A1 Agricultural',
                'terrain': 'Flat',
                'slope_gradient_percent': 0.8,
                'soil_type': 'Deep Loamy Volcanic Soil',
                'topography': 'Fertile arable basin suitable for horticulture, avocado cultivation, or dairy husbandry.',
                'road_access': True,
                'road_type': 'Murram/Dirt',
                'water_onsite': True,
                'water_line_distance_meters': 0,
                'electricity_onsite': False,
                'power_pole_distance_meters': 180,
                'drainage_system': 'Natural',
                'is_in_wetland_buffer_zone': False,
                'is_encumbrance_free': True,
            }
        )

        # 3. Create Modern Listings
        self.stdout.write('[3/10] Publishing certified marketplace listings...')

        listing1, _ = Listing.objects.get_or_create(
            title='The Grand Nyarutarama Panorama Villa',
            defaults={
                'asset': asset1,
                'description': 'Architectural masterpiece overlooking the Kigali Golf Course in prime Nyarutarama. Features 5 en-suite bedrooms, private infinity pool, solar hot water system, landscaped compound, and 2-bedroom detached staff quarters.',
                'listing_type': 'sale',
                'purpose': 'sale',
                'category': 'house',
                'price': 480000000.0,
                'currency': 'RWF',
                'address': 'KG 9 Ave, Nyarutarama, Gasabo, Kigali',
                'owner': owner_gasana,
                'status': 'listed',
                'verification_level': 'verified',
                'views_count': 342,
                'date_listed': timezone.now() - timedelta(days=60),
            }
        )

        listing2, _ = Listing.objects.get_or_create(
            title='Prime Kibagabaga Hillside View Parcel',
            defaults={
                'asset': asset2,
                'description': 'Elevated titled residential parcel offering panoramic hillside views in Kibagabaga. Fully serviced with direct water connection, three-phase power line, and cobblestone frontage. Ready for immediate villa construction under R1A zoning.',
                'listing_type': 'land',
                'purpose': 'sale',
                'category': 'land',
                'price': 135000000.0,
                'currency': 'RWF',
                'address': 'KG 28 Ave, Kibagabaga, Gasabo, Kigali',
                'owner': owner_gasana,
                'status': 'listed',
                'verification_level': 'verified',
                'views_count': 218,
                'date_listed': timezone.now() - timedelta(days=45),
            }
        )

        listing3, _ = Listing.objects.get_or_create(
            title='Gacuriro View Heights - Executive Residence 3B',
            defaults={
                'asset': asset3,
                'description': 'Fully furnished luxury apartment in the Gacuriro diplomatic corridor. High-speed fiber connectivity, modern imported Italian kitchen, elevator access, 24/7 manned security, and covered basement parking.',
                'listing_type': 'rental',
                'purpose': 'rent',
                'category': 'house',
                'price': 1800000.0,
                'rental_frequency': 'per_month',
                'security_deposit': 3600000.0,
                'currency': 'RWF',
                'address': 'KG 303 St, Gacuriro, Gasabo, Kigali',
                'owner': owner_nkurunziza,
                'status': 'listed',
                'verification_level': 'verified',
                'views_count': 415,
                'date_listed': timezone.now() - timedelta(days=120),
            }
        )

        listing4, _ = Listing.objects.get_or_create(
            title='Bugesera Highway Link Commercial Plot',
            defaults={
                'asset': asset4,
                'description': 'High-exposure 2,500 sqm commercial development parcel on the primary expressway link to Bugesera International Airport. Designated for light logistics, hotel, or retail complex under Kigali Master Plan C1.',
                'listing_type': 'land',
                'purpose': 'sale',
                'category': 'land',
                'price': 210000000.0,
                'currency': 'RWF',
                'address': 'KK 15 Rd, Gahanga, Kicukiro, Kigali',
                'owner': owner_uwase,
                'status': 'under_negotiation',
                'verification_level': 'verified',
                'views_count': 520,
                'date_listed': timezone.now() - timedelta(days=90),
            }
        )

        listing5, _ = Listing.objects.get_or_create(
            title='Prestige Old Kiyovu Ambassadorial Residence',
            defaults={
                'asset': asset5,
                'description': 'Distinguished ambassadorial residence on a massive 1,500 sqm parcel in historic Old Kiyovu. Mature tropical gardens, expansive ballroom living area, heated swimming pool, high-security gatehouse, and complete privacy.',
                'listing_type': 'sale',
                'purpose': 'sale',
                'category': 'house',
                'price': 650000000.0,
                'currency': 'RWF',
                'address': 'KN 41 St, Kiyovu, Nyarugenge, Kigali',
                'owner': owner_nkurunziza,
                'status': 'sold',
                'verification_level': 'professional',
                'views_count': 680,
                'date_listed': timezone.now() - timedelta(days=180),
            }
        )

        listing6, _ = Listing.objects.get_or_create(
            title='Toyota Land Cruiser 300 V6 GR-Sport (2023)',
            defaults={
                'asset': asset6,
                'description': 'Flagship luxury off-road sovereign transport. 3.3L V6 Twin-Turbo Diesel, full 4WD differential locks, biometric fingerprint start, red/black bespoke leather, 14-speaker JBL audio. RRA Customs cleared with genuine private RAC plate.',
                'listing_type': 'vehicle',
                'purpose': 'sale',
                'category': 'car',
                'price': 135000000.0,
                'currency': 'RWF',
                'address': 'KG 7 Ave, Kacyiru, Gasabo, Kigali',
                'owner': owner_gasana,
                'status': 'listed',
                'verification_level': 'verified',
                'views_count': 412,
                'date_listed': timezone.now() - timedelta(days=20),
            }
        )

        listing7, _ = Listing.objects.get_or_create(
            title='Mercedes-Benz GLE 450 4MATIC AMG Line (2022)',
            defaults={
                'asset': asset7,
                'description': 'Executive diplomatic crossover with EQ Boost hybrid intelligence. Panoramic dual sunroof, Burmester surround sound, Airmatic adaptive suspension, and 360-degree autonomous parking. Available for corporate acquisition or VIP chauffeur lease.',
                'listing_type': 'vehicle',
                'purpose': 'sale',
                'category': 'car',
                'price': 98000000.0,
                'currency': 'RWF',
                'address': 'KN 3 Ave, Kiyovu, Nyarugenge, Kigali',
                'owner': owner_nkurunziza,
                'status': 'listed',
                'verification_level': 'verified',
                'views_count': 329,
                'date_listed': timezone.now() - timedelta(days=15),
            }
        )

        listing8, _ = Listing.objects.get_or_create(
            title='BMW R1250 GS Adventure Triple Black (2023)',
            defaults={
                'asset': asset8,
                'description': 'The definitive trans-continental overland expedition motorcycle. ShiftCam Boxer engine, dynamic electronic suspension (ESA), full aluminum adventure pannier system, heated grips, and auxiliary LED floodlights.',
                'listing_type': 'vehicle',
                'purpose': 'sale',
                'category': 'motorbike',
                'price': 24500000.0,
                'currency': 'RWF',
                'address': 'KG 11 Ave, Remera, Gasabo, Kigali',
                'owner': owner_uwase,
                'status': 'listed',
                'verification_level': 'verified',
                'views_count': 188,
                'date_listed': timezone.now() - timedelta(days=10),
            }
        )

        listing9, _ = Listing.objects.get_or_create(
            title='Bugesera Fertile Agricultural Farmland (5 Hectares)',
            defaults={
                'asset': asset9,
                'description': 'Expansive 50,000 sqm titled agricultural estate located in the fertile Maranyundo corridor. Deep loamy soil, permanent water connection on boundary, completely free of environmental caveats, and ideal for commercial agro-export or greenhouse cultivation.',
                'listing_type': 'land',
                'purpose': 'sale',
                'category': 'land',
                'price': 85000000.0,
                'currency': 'RWF',
                'address': 'RN 15 Corridor, Nyamata, Bugesera',
                'owner': owner_uwase,
                'status': 'listed',
                'verification_level': 'verified',
                'views_count': 275,
                'date_listed': timezone.now() - timedelta(days=35),
            }
        )

        # 4. Agent Assignments
        AgentAssignment.objects.get_or_create(listing=listing1, agent=agent_mukamana, defaults={'is_active': True})
        AgentAssignment.objects.get_or_create(listing=listing2, agent=agent_mukamana, defaults={'is_active': True})
        AgentAssignment.objects.get_or_create(listing=listing3, agent=agent_mukamana, defaults={'is_active': True})
        AgentAssignment.objects.get_or_create(listing=listing4, agent=agent_habimana, defaults={'is_active': True})
        AgentAssignment.objects.get_or_create(listing=listing5, agent=agent_habimana, defaults={'is_active': False})
        AgentAssignment.objects.get_or_create(listing=listing6, agent=agent_habimana, defaults={'is_active': True})
        AgentAssignment.objects.get_or_create(listing=listing7, agent=agent_mukamana, defaults={'is_active': True})
        AgentAssignment.objects.get_or_create(listing=listing8, agent=agent_habimana, defaults={'is_active': True})
        AgentAssignment.objects.get_or_create(listing=listing9, agent=agent_mukamana, defaults={'is_active': True})

        # 5. Offers & Counter Offers
        self.stdout.write('[5/10] Logging real offers, counter-offers, and bilateral agreements...')

        offer1, _ = Offer.objects.get_or_create(
            listing=listing1,
            buyer=buyer_user,
            defaults={
                'agent': agent_mukamana,
                'amount': 460000000.0,
                'counter_amount': 470000000.0,
                'escrow_proposed_percent': 10.0,
                'financing_type': 'cash',
                'status': 'countered',
                'message': 'Offer submitted subject to clean RLMUA cadastral audit and 60-day Irembo conveyance timeline.',
                'proposed_closing_date': (datetime.now() + timedelta(days=45)).date(),
            }
        )

        offer2, _ = Offer.objects.get_or_create(
            listing=listing4,
            buyer=buyer_user,
            defaults={
                'agent': agent_habimana,
                'amount': 200000000.0,
                'escrow_proposed_percent': 10.0,
                'financing_type': 'cash',
                'status': 'accepted',
                'message': 'Commercial offer with immediate 10% escrow funding upon deed review.',
                'proposed_closing_date': (datetime.now() + timedelta(days=30)).date(),
            }
        )

        offer3, _ = Offer.objects.get_or_create(
            listing=listing5,
            buyer=buyer_user,
            defaults={
                'agent': agent_habimana,
                'amount': 640000000.0,
                'escrow_proposed_percent': 10.0,
                'financing_type': 'bank_mortgage',
                'status': 'accepted',
                'message': 'Full cash settlement guaranteed via BNR escrow account.',
                'proposed_closing_date': (datetime.now() - timedelta(days=30)).date(),
            }
        )

        # 6. Transaction Deals across the 6 Sovereign Conveyance Stages
        self.stdout.write('[6/10] Generating end-to-end deal conveyance pipeline & sovereign notary deeds...')

        # Deal 1: Gahanga Plot (In-flight: irembo_filing stage)
        deal1, _ = TransactionDeal.objects.get_or_create(
            listing=listing4,
            offer=offer2,
            defaults={
                'deal_type': 'sale',
                'buyer_or_tenant': buyer_user,
                'seller_or_landlord': owner_uwase,
                'assigned_agent': agent_habimana,
                'agreed_price': 200000000.0,
                'currency': 'RWF',
                'escrow_deposit_amount': 20000000.0,
                'escrow_status': 'held_in_escrow',
                'current_stage': 'irembo_filing',
                'progress_percentage': 65,
                'irembo_bill_id': 'IREMBO-2026-GH-99120',
                'land_upi': '1/03/05/02/8821',
                'notary_office': 'Kicukiro District Land Notary',
                'target_closing_date': (datetime.now() + timedelta(days=21)).date(),
                'notes': 'Cadastral search completed with zero caveat recorded. Irembo transfer tax bill generated and awaiting notary appointment.',
            }
        )

        # Deal 2: Kiyovu Residence (Closed conveyance: settled_closed)
        deal2, _ = TransactionDeal.objects.get_or_create(
            listing=listing5,
            offer=offer3,
            defaults={
                'deal_type': 'sale',
                'buyer_or_tenant': buyer_user,
                'seller_or_landlord': owner_nkurunziza,
                'assigned_agent': agent_habimana,
                'agreed_price': 640000000.0,
                'currency': 'RWF',
                'escrow_deposit_amount': 64000000.0,
                'escrow_status': 'released_to_seller',
                'current_stage': 'settled_closed',
                'progress_percentage': 100,
                'irembo_bill_id': 'IREMBO-2026-KY-44819',
                'land_upi': '1/01/03/08/3304',
                'notary_office': 'Nyarugenge District Land Registry',
                'target_closing_date': (datetime.now() - timedelta(days=25)).date(),
                'notes': 'Title fully transferred at RLMUA. Escrow deposit released to seller account at Bank of Kigali.',
            }
        )

        # Deal 3: Nyarutarama Villa (Early stage: escrow_funded)
        deal3, _ = TransactionDeal.objects.get_or_create(
            listing=listing1,
            offer=offer1,
            defaults={
                'deal_type': 'sale',
                'buyer_or_tenant': buyer_user,
                'seller_or_landlord': owner_gasana,
                'assigned_agent': agent_mukamana,
                'agreed_price': 470000000.0,
                'currency': 'RWF',
                'escrow_deposit_amount': 47000000.0,
                'escrow_status': 'held_in_escrow',
                'current_stage': 'escrow_funded',
                'progress_percentage': 30,
                'irembo_bill_id': 'IREMBO-2026-NY-11209',
                'land_upi': '1/02/11/04/1820',
                'notary_office': 'Gasabo District Land Notary',
                'target_closing_date': (datetime.now() + timedelta(days=45)).date(),
                'notes': 'Earnest 10% escrow confirmed by depository partner. Initiating official title search at RLMUA.',
            }
        )

        # Attach Deal Documents
        DealDocument.objects.get_or_create(
            deal=deal1,
            document_type='title_deed',
            defaults={
                'title': 'Official Land UPI Certificate 1/03/05/02/8821',
                'uploaded_by': seller_user2,
                'is_verified': True,
                'verified_by': admin_user,
                'ai_validation_notes': 'Verified clean title with no registered mortgages or caveats at RLMUA.',
            }
        )
        DealDocument.objects.get_or_create(
            deal=deal1,
            document_type='sales_contract',
            defaults={
                'title': 'Bilateral Land Purchase Agreement',
                'uploaded_by': agent_user2,
                'is_verified': True,
                'verified_by': admin_user,
            }
        )
        DealDocument.objects.get_or_create(
            deal=deal1,
            document_type='irembo_receipt',
            defaults={
                'title': 'IremboGov Notary Filing Slip #IREMBO-2026-GH-99120',
                'uploaded_by': agent_user2,
                'is_verified': True,
                'verified_by': admin_user,
            }
        )

        DealDocument.objects.get_or_create(
            deal=deal2,
            document_type='title_deed',
            defaults={
                'title': 'Conveyed e-Title Deed - UPI 1/01/03/08/3304',
                'uploaded_by': agent_user2,
                'is_verified': True,
                'verified_by': admin_user,
                'ai_validation_notes': 'Title transfer fully ratified by Chief Registrar of Land Titles.',
            }
        )
        DealDocument.objects.get_or_create(
            deal=deal2,
            document_type='tax_clearance',
            defaults={
                'title': 'RRA Property Tax & Transfer Clearance Certificate',
                'uploaded_by': owner_user3,
                'is_verified': True,
                'verified_by': admin_user,
            }
        )

        # 7. Site Visits & Inspections
        self.stdout.write('[7/10] Scheduling physical site visits and showing records...')

        SiteVisit.objects.get_or_create(
            listing=listing1,
            agent=agent_mukamana,
            visitor=buyer_user,
            defaults={
                'scheduled_date': timezone.now() + timedelta(days=2, hours=3),
                'status': 'scheduled',
                'notes': 'High-priority buyer requesting full technical inspection of perimeter wall and solar water systems.',
            }
        )

        SiteVisit.objects.get_or_create(
            listing=listing2,
            agent=agent_mukamana,
            visitor=buyer_user,
            defaults={
                'scheduled_date': timezone.now() - timedelta(days=5),
                'status': 'completed',
                'notes': 'Cadastral beacons located and verified against master plan sketch.',
                'report': 'Showing went excellently. Buyer confirmed slope is suitable for two-level split architectural design.',
            }
        )

        SiteVisit.objects.get_or_create(
            listing=listing4,
            agent=agent_habimana,
            visitor=buyer_user,
            defaults={
                'scheduled_date': timezone.now() - timedelta(days=12),
                'status': 'completed',
                'notes': 'Commercial feasibility showing with buyer civil engineer.',
                'report': 'Highway frontage confirmed at 48 meters. Excellent commercial visibility.',
            }
        )

        # 8. Residential Tenancy Leases & Rent Payments
        self.stdout.write('[8/10] Activating 12-month lease contracts & rent payments...')

        lease1, _ = Lease.objects.get_or_create(
            listing=listing3,
            tenant=tenant_profile,
            defaults={
                'start_date': (datetime.now() - timedelta(days=180)).date(),
                'end_date': (datetime.now() + timedelta(days=185)).date(),
                'rent_amount': 1800000,
                'contract_details': 'Standard 12-Month Executive Residential Lease for Gacuriro View Heights #3B. Inclusive of 24/7 security and service charge.',
                'contract_accepted': True,
                'contract_signed': True,
                'contract_archived': False,
            }
        )

        # 6 Monthly rent payments across past 6 months
        for i in range(6):
            p_date = timezone.now() - timedelta(days=(150 - (i * 30)))
            ref = f"MOMO-RW-2026-0{i+1}-884{i}"
            Payment.objects.get_or_create(
                transaction_reference=ref,
                defaults={
                    'listing': listing3,
                    'tenant': tenant_profile,
                    'payer': tenant_user,
                    'amount': 1800000.0,
                    'currency': 'RWF',
                    'payment_method': 'momo',
                    'payment_type': 'rent',
                    'status': 'completed',
                    'date_paid': p_date,
                }
            )

        # 9. Maintenance Tickets
        self.stdout.write('[9/10] Creating maintenance tickets and inspection work orders...')

        MaintenanceRequest.objects.get_or_create(
            listing=listing3,
            tenant=tenant_profile,
            title='Solar Water Heater Sensor Calibration',
            defaults={
                'description': 'Water temperature sensor on the roof panel requires periodic calibration for optimal night-time warmth.',
                'status': 'completed',
                'completion_date': timezone.now() - timedelta(days=40),
            }
        )

        MaintenanceRequest.objects.get_or_create(
            listing=listing3,
            tenant=tenant_profile,
            title='Balcony Drainage Leaf Clearing',
            defaults={
                'description': 'Heavy rain wash cleared leaves into balcony drain channel. Maintenance requested to inspect rooftop outlet.',
                'status': 'in_progress',
            }
        )

        # 10. Buyer Inquiries
        self.stdout.write('[10/10] Logging genuine buyer property inquiries...')

        inquiries_data = [
            {
                'listing': listing1,
                'name': 'Gervais Nkurunziza',
                'email': 'gervais.n@kigaliholdings.rw',
                'phone': '+250788661122',
                'message': 'Hello, does the villa in Nyarutarama have freehold title or 99-year state emphyteutic lease? Also inquiring if bank mortgage guarantee can be accommodated.',
                'is_read': False,
            },
            {
                'listing': listing2,
                'name': 'Sandrine Uwitonze',
                'email': 'sandrine.u@diaspora.org',
                'phone': '+250788773344',
                'message': 'Interested in the Kibagabaga parcel. Can your agent provide the official RLMUA cadastral shapefile and zoning certificate?',
                'is_read': True,
            },
            {
                'listing': listing4,
                'name': 'Jean-Damascene Kayitare',
                'email': 'jd.kayitare@logisticgroup.rw',
                'phone': '+250788995511',
                'message': 'We are looking to establish a warehousing transshipment depot along the Bugesera highway. Is this plot zoned for C1 or heavy logistics?',
                'is_read': False,
            },
            {
                'listing': listing3,
                'name': 'Chantal Mukamana',
                'email': 'chantal.m@unops.org',
                'phone': '+250788114477',
                'message': 'Looking for corporate tenancy for an expatriate starting next month. Is the monthly service charge included in the 1.8M RWF asking rent?',
                'is_read': True,
            },
        ]

        for inq in inquiries_data:
            PropertyInquiry.objects.get_or_create(
                listing=inq['listing'],
                name=inq['name'],
                email=inq['email'],
                defaults={
                    'phone': inq['phone'],
                    'message': inq['message'],
                    'is_read': inq['is_read'],
                }
            )

        self.stdout.write('=====================================================')
        self.stdout.write('SUCCESS: Urugwiro Sovereign Ecosystem Seeding Complete!')
        self.stdout.write('=====================================================')
        self.stdout.write(f"  - Total Users: {User.objects.count()}")
        self.stdout.write(f"  - Active Listings: {Listing.objects.count()}")
        self.stdout.write(f"  - Transaction Deals: {TransactionDeal.objects.count()}")
        self.stdout.write(f"  - Deal Documents: {DealDocument.objects.count()}")
        self.stdout.write(f"  - Offers: {Offer.objects.count()}")
        self.stdout.write(f"  - Site Visits: {SiteVisit.objects.count()}")
        self.stdout.write(f"  - Leases: {Lease.objects.count()}")
        self.stdout.write(f"  - Payments: {Payment.objects.count()}")
        self.stdout.write(f"  - Maintenance Tickets: {MaintenanceRequest.objects.count()}")
        self.stdout.write(f"  - Inquiries: {PropertyInquiry.objects.count()}")
