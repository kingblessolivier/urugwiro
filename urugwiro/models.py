from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now

# ─── Global Constants ───
asset_types = (
    ('LAND', 'Land'),
    ('BUILDING', 'Building'),
    ('UNIT', 'Unit'),
    ('VEHICLE', 'Vehicle'),
    ('SERVICE', 'Service'),
)

user_roles = (
    ('Buyer', 'Buyer'),
    ('Seller', 'Seller'),
    ('Agent', 'Agent'),
    ('Admin', 'Admin'),
    ('RentalManager', 'Rental Manager'),
    ('Tenant', 'Tenant'),
    ('Owner', 'Owner'),
)

listing_status = (
    ('listed', 'Listed'),
    ('under_negotiation', 'Under Negotiation'),
    ('sold', 'Sold'),
    ('rented', 'Rented'),
    ('withdrawn', 'Withdrawn'),
)

listing_type = (
    ('rental', 'Rental'),
    ('sale', 'Sale'),
    ('land', 'Land'),
    ('vehicle', 'Vehicle'),
    ('service', 'Service'),
)

verification_levels = (
    ('none', 'Not Verified'),
    ('submitted', 'Documents Submitted'),
    ('verified', 'Urugwiro Verified'),
    ('professional', 'Professionally Inspected'),
)

# ─── Asset-Centric Foundation ───

class Asset(models.Model):
    """The physical source of truth. Decoupled from marketing."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    asset_type = models.CharField(max_length=20, choices=asset_types)
    name = models.CharField(max_length=255)

    # Simplified Spatial (for SQLite/Dev) - Migratable to PostGIS
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    boundary_geojson = models.TextField(blank=True, null=True, help_text="GeoJSON polygon for land assets")

    # Rwanda Administrative Hierarchy
    province = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    sector = models.CharField(max_length=100, blank=True, null=True)
    cell = models.CharField(max_length=100, blank=True, null=True)
    village = models.CharField(max_length=100, blank=True, null=True)

    total_area = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_asset_type_display()} - {self.name}"

class ResidentialSpec(models.Model):
    SUB_TYPES = (
        ('Villa', 'Villa'),
        ('Apartment', 'Apartment'),
        ('SingleFamily', 'Single Family House'),
        ('Townhouse', 'Townhouse'),
        ('ModestHouse', 'Modest / Small House'),
        ('Duplex', 'Duplex'),
        ('Studio', 'Studio'),
        ('Penthouse', 'Penthouse'),
    )
    APARTMENT_SELLING_MODE = (
        ('whole_building', 'Entire Building'),
        ('per_floor', 'Per Floor'),
        ('per_unit', 'Per Unit / Room'),
    )
    asset = models.OneToOneField(Asset, on_delete=models.CASCADE, related_name='residential_spec')
    sub_type = models.CharField(max_length=50, choices=SUB_TYPES, default='SingleFamily')
    bedrooms = models.IntegerField(null=True, blank=True)
    bathrooms = models.IntegerField(null=True, blank=True)
    built_up_area_sqm = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    compound_size_sqm = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    kitchen_type = models.CharField(max_length=50, choices=[('Open', 'Open'), ('Closed', 'Closed'), ('American', 'American')], null=True, blank=True)
    balcony = models.BooleanField(default=False)
    is_furnished = models.BooleanField(default=False)
    year_built = models.IntegerField(null=True, blank=True)

    # Luxury & Compound Specs
    has_swimming_pool = models.BooleanField(default=False)
    has_staff_quarters = models.BooleanField(default=False)
    has_garden = models.BooleanField(default=False)
    has_water_tank = models.BooleanField(default=False)
    water_tank_capacity_liters = models.IntegerField(null=True, blank=True, help_text="Reserve water capacity e.g. 5000L")
    has_solar_water_heater = models.BooleanField(default=False)
    has_backup_generator = models.BooleanField(default=False)
    backup_generator_kva = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="Generator capacity in KVA")
    has_three_phase_power = models.BooleanField(default=False, help_text="3-Phase electricity connection")
    has_fiber_internet = models.BooleanField(default=False, help_text="Optical fiber internet installed")
    has_cctv = models.BooleanField(default=False)
    parking_spaces = models.IntegerField(default=1, null=True, blank=True)
    master_plan_zoning = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. R1, R1A, R2, R3")
    security_type = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. Gated, Electric Fence, Perimeter Wall")

    # Modest House & Utility Specs
    electricity_meter = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. Cash Power Dedicated, Shared")
    road_access_type = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. Tarmac, Cobblestone, Murram, Pedestrian")

    # Apartment Specifics
    floor_number = models.IntegerField(null=True, blank=True)
    has_elevator = models.BooleanField(default=False)
    monthly_service_charge = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Apartment Building & Unit Structure
    apartment_selling_mode = models.CharField(
        max_length=20, choices=APARTMENT_SELLING_MODE, blank=True, null=True,
        help_text="How the apartment is being sold/rented: entire building, per floor, or per unit"
    )
    total_building_floors = models.IntegerField(null=True, blank=True, help_text="Total floors in the apartment building")
    unit_number = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. Suite 302, Unit A4")
    unit_orientation = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. North-East Skyline, Golf Course View, Courtyard")
    balcony_area_sqm = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    parking_slot_number = models.CharField(max_length=30, blank=True, null=True, help_text="e.g. B1-14, P2-07")
    apartment_floor_plan = models.JSONField(
        null=True, blank=True,
        help_text="JSON: floor-by-floor breakdown [{floor: 1, units: [{unit: '101', beds: 2, baths: 1, sqm: 80, view: 'Garden', price: 500000, status: 'available'}]}]"
    )

    def __str__(self):
        return f"{self.sub_type} Spec ({self.bedrooms} Beds, {self.bathrooms} Baths)"

class CommercialSpec(models.Model):
    asset = models.OneToOneField(Asset, on_delete=models.CASCADE, related_name='commercial_spec')
    zoning_type = models.CharField(max_length=50, choices=[('Retail', 'Retail'), ('Office', 'Office'), ('Industrial', 'Industrial'), ('Mixed', 'Mixed')], null=True, blank=True)
    power_capacity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="KVA")
    loading_bays = models.IntegerField(default=0)
    parking_spaces = models.IntegerField(default=0)
    foot_traffic_score = models.IntegerField(default=0, help_text="1-10")
    total_floors = models.IntegerField(null=True, blank=True)
    has_backup_generator = models.BooleanField(default=False)

    def __str__(self):
        return f"Commercial ({self.zoning_type})"

class LandSpec(models.Model):
    TERRAIN_CHOICES = [('Flat', 'Flat'), ('Gentle Slope', 'Gentle Slope'), ('Sloped', 'Sloped'), ('Hilly', 'Hilly'), ('Rocky', 'Rocky'), ('Valley', 'Valley')]
    LAND_USE_CHOICES = [
        ('Residential', 'Residential Building Land'),
        ('Commercial', 'Commercial / Mixed-Use Land'),
        ('Agricultural', 'Agricultural / Farming Land'),
        ('Industrial', 'Industrial / Logistics Land'),
        ('Forestry', 'Forestry / Conservation'),
        ('WetlandBuffer', 'Wetland Buffer / Environmental Protection'),
    ]
    TENURE_CHOICES = [
        ('EmphyteuticLease', 'Emphyteutic Lease (State 99-Year Leasehold)'),
        ('Freehold', 'Freehold (Ubukonde)'),
    ]
    asset = models.OneToOneField(Asset, on_delete=models.CASCADE, related_name='land_spec')
    land_use_category = models.CharField(max_length=50, choices=LAND_USE_CHOICES, default='Residential')
    tenure_type = models.CharField(max_length=50, choices=TENURE_CHOICES, default='EmphyteuticLease')
    lease_years_remaining = models.IntegerField(null=True, blank=True, help_text="Years remaining on state leasehold (e.g. 85)")
    upi_number = models.CharField(max_length=100, blank=True, null=True, help_text="Unique Parcel Identifier (UPI) e.g. 1/03/05/02/1234")
    zoning_code = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. R1, R1A, R2, R3, C1, C2, A1, Industrial, Agricultural")
    max_permitted_floors = models.CharField(max_length=20, blank=True, null=True, help_text="e.g. G+1, G+2, G+4 under Master Plan")
    floor_area_ratio = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="FAR index")
    building_coverage_ratio = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Max BCR percentage e.g. 50%")
    terrain = models.CharField(max_length=50, choices=TERRAIN_CHOICES, null=True, blank=True)
    slope_gradient_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Gradient slope percentage")
    road_access = models.BooleanField(default=False)
    road_type = models.CharField(max_length=50, blank=True, null=True, help_text="Asphalt/Tarmac, Cobblestone, Murram/Dirt, Footpath")
    soil_type = models.CharField(max_length=100, blank=True, null=True)
    topography = models.TextField(blank=True, null=True)
    title_deed_number = models.CharField(max_length=100, blank=True, null=True, help_text="UPI / Title Deed Number")
    is_encumbrance_free = models.BooleanField(default=True, help_text="Free of bank mortgages, caveats, or court disputes")

    # Utilities & Infrastructure Proximity
    water_onsite = models.BooleanField(default=False)
    water_line_distance_meters = models.IntegerField(null=True, blank=True)
    electricity_onsite = models.BooleanField(default=False)
    power_pole_distance_meters = models.IntegerField(null=True, blank=True)
    has_fiber_conduit = models.BooleanField(default=False)
    drainage_system = models.CharField(max_length=50, blank=True, null=True, help_text="Covered, Open, Natural")
    is_in_wetland_buffer_zone = models.BooleanField(default=False)
    cadastral_sketch = models.ImageField(upload_to='cadastral_sketches/', blank=True, null=True)

    def __str__(self):
        return f"Land Spec (UPI: {self.upi_number or self.title_deed_number or 'N/A'})"

class HotelSpec(models.Model):
    asset = models.OneToOneField(Asset, on_delete=models.CASCADE, related_name='hotel_spec')
    star_rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], null=True, blank=True)
    total_rooms = models.IntegerField(null=True, blank=True)
    conference_halls = models.IntegerField(default=0)
    has_restaurant_bar = models.BooleanField(default=False)
    has_commercial_license = models.BooleanField(default=True)
    amenities = models.JSONField(default=dict, blank=True, help_text="e.g. {'pool': true, 'gym': true}")
    occupancy_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    management_type = models.CharField(max_length=50, choices=[('Owner-Managed', 'Owner-Managed'), ('Franchise', 'Franchise'), ('Corporate', 'Corporate')], null=True, blank=True)

    def __str__(self):
        return f"Hotel Spec ({self.total_rooms} Rooms, {self.star_rating or '-'} Stars)"

class VehicleSpec(models.Model):
    VEHICLE_TYPES = (
        ('Car', 'Car'),
        ('Motorcycle', 'Motorcycle'),
    )
    DRIVETRAIN_CHOICES = (
        ('4WD', '4WD / 4x4'),
        ('AWD', 'All-Wheel Drive (AWD)'),
        ('FWD', 'Front-Wheel Drive (FWD)'),
        ('RWD', 'Rear-Wheel Drive (RWD)'),
    )
    CUSTOMS_STATUS_CHOICES = (
        ('DutyPaid', 'RRA Customs Duty Paid (Rwanda Cleared)'),
        ('InBond', 'In-Bond / Transit (Customs Duty Unpaid)'),
        ('Exempt', 'Diplomatic / NGO Duty-Free Exemption'),
    )
    asset = models.OneToOneField(Asset, on_delete=models.CASCADE, related_name='vehicle_spec')
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPES, default='Car')
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    mileage = models.IntegerField(default=0)
    fuel_type = models.CharField(max_length=50, default='Petrol')
    transmission = models.CharField(max_length=50, default='Automatic')
    drivetrain = models.CharField(max_length=20, choices=DRIVETRAIN_CHOICES, default='FWD')
    engine_capacity = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. 2000cc or 150cc")
    horsepower = models.IntegerField(null=True, blank=True, help_text="Engine Horsepower (HP)")
    condition = models.CharField(max_length=50, blank=True, null=True, help_text="Brand New, Used Foreign, Used Local")
    body_type = models.CharField(max_length=50, blank=True, null=True, help_text="SUV, Sedan, Pickup, Minibus, Sportbike, Cruiser")
    seating_capacity = models.IntegerField(null=True, blank=True)

    # Rwandan Legal & Customs Status
    plate_number = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. RAC 456 D or IT Yellow Plate")
    plate_type = models.CharField(max_length=50, blank=True, null=True, help_text="Private (RAx), Commercial Yellow Plate, Temporary")
    vin_chassis_number = models.CharField(max_length=100, blank=True, null=True, help_text="Chassis / VIN number")
    rra_customs_status = models.CharField(max_length=30, choices=CUSTOMS_STATUS_CHOICES, default='DutyPaid')
    controle_technique_expiry = models.DateField(null=True, blank=True)
    insurance_expiry = models.DateField(null=True, blank=True)

    # Features & Equipment
    has_air_conditioning = models.BooleanField(default=True)
    has_leather_seats = models.BooleanField(default=False)
    has_sunroof = models.BooleanField(default=False)
    has_reverse_camera = models.BooleanField(default=False)
    has_service_history = models.BooleanField(default=False)

    # Rental / Usage flags
    includes_driver = models.BooleanField(default=False)
    includes_helmet = models.BooleanField(default=False, help_text="For motorbikes")
    has_delivery_rack = models.BooleanField(default=False, help_text="For delivery motorbikes")

    def __str__(self):
        return f"{self.vehicle_type}: {self.year} {self.make} {self.model}"

# ─── User & Profile Architecture ───

class User(AbstractUser):
    role = models.CharField(max_length=20, choices=user_roles, default='Buyer')

    def __str__(self):
        return self.username

class ListingOwner(models.Model):
    """Unified profile for anyone listing an asset on Urugwiro."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='listing_owner_profile')
    name = models.CharField(max_length=150)
    email = models.EmailField(max_length=150)
    phone_number = models.CharField(max_length=20)
    address = models.CharField(max_length=250, blank=True)
    image = models.ImageField(upload_to='owner_profiles', blank=True)
    is_verified = models.BooleanField(default=False)
    bio = models.TextField(blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Owner: {self.name}"

# ─── Unified Listing Architecture ───

class Listing(models.Model):
    """The Base Model for every asset on the platform."""
    PURPOSE_CHOICES = (
        ('sale', 'For Sale'),
        ('rent', 'For Rent'),
    )
    CATEGORY_CHOICES = (
        ('house', 'House / Apartment'),
        ('land', 'Land'),
        ('car', 'Car'),
        ('motorbike', 'Motorbike'),
        ('hotel', 'Hotel / Commercial'),
        ('service', 'Service'),
    )
    RENTAL_FREQUENCY_CHOICES = (
        ('per_day', 'Per Day'),
        ('per_month', 'Per Month'),
        ('per_year', 'Per Year'),
    )

    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='listings', null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    listing_type = models.CharField(max_length=20, choices=listing_type)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='sale', db_index=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='house', db_index=True)
    price = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=10, default='RWF')
    rental_frequency = models.CharField(max_length=20, choices=RENTAL_FREQUENCY_CHOICES, blank=True, null=True)
    security_deposit = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    # Location Intelligence - Now delegated to Asset
    address = models.CharField(max_length=300)

    # Management & Trust
    owner = models.ForeignKey(ListingOwner, on_delete=models.CASCADE, related_name='listings')
    status = models.CharField(max_length=20, choices=listing_status, default='listed')
    verification_level = models.CharField(max_length=20, choices=verification_levels, default='none')
    is_featured = models.BooleanField(default=False)
    listed_by_role = models.CharField(
        max_length=20,
        choices=[('admin', 'Admin'), ('seller', 'Seller'), ('agent', 'Agent')],
        default='seller',
        help_text="Which dashboard role created this listing"
    )
    views_count = models.IntegerField(default=0)

    date_listed = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    slug = models.SlugField(unique=True, blank=True, null=True)

    class Meta:
        ordering = ['-date_listed']

    def __str__(self):
        return f"[{self.get_purpose_display()} - {self.get_category_display()}] {self.title}"

class ListingMedia(models.Model):
    """Unified media system for all asset types, supporting 3D digital twins and 360 tours."""
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('360', '360 Tour'),
        ('model_3d', '3D Digital Twin (.glb)'),
        ('cadastral_sketch', 'UPI Cadastral Sketch'),
    ]
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='listing_media/')
    media_type = models.CharField(max_length=30, choices=MEDIA_TYPES, default='image')
    category = models.CharField(max_length=50, blank=True, help_text="e.g. Interior, Exterior, Drone, FloorPlan")
    caption = models.CharField(max_length=200, blank=True)
    room_name = models.CharField(max_length=100, blank=True, help_text="e.g. Living Room, Master Bedroom, Compound")
    initial_yaw = models.FloatField(default=0.0, blank=True, null=True)
    initial_pitch = models.FloatField(default=0.0, blank=True, null=True)
    hotspots = models.JSONField(default=list, blank=True, help_text="Navigation pins linking to other rooms")
    order = models.PositiveSmallIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'uploaded_at']

# ─── Specialized Listing Extensions ───

class RentalExtension(models.Model):
    """Extension for Properties intended for Rent."""
    listing = models.OneToOneField(Listing, on_delete=models.CASCADE, related_name='rental_data')
    property_type = models.CharField(max_length=50, choices=[('Apartment', 'Apartment'), ('House', 'House'), ('Commercial', 'Commercial')])
    number_of_units = models.IntegerField(default=1)

class SaleExtension(models.Model):
    """Extension for Properties intended for Sale."""
    listing = models.OneToOneField(Listing, on_delete=models.CASCADE, related_name='sale_data')
    negotiable = models.BooleanField(default=True)
    size_sqm = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    bedrooms = models.IntegerField(blank=True, null=True)
    bathrooms = models.IntegerField(blank=True, null=True)
    year_built = models.IntegerField(blank=True, null=True)
    has_title_deed = models.BooleanField(default=False)
    has_parking = models.BooleanField(default=False)
    has_garden = models.BooleanField(default=False)
    is_furnished = models.BooleanField(default=False)

class LandExtension(models.Model):
    """Extension for Land Listings."""
    listing = models.OneToOneField(Listing, on_delete=models.CASCADE, related_name='land_data')
    land_type = models.CharField(max_length=50, choices=[('Residential', 'Residential'), ('Commercial', 'Commercial'), ('Agricultural', 'Agricultural')])
    plot_size = models.DecimalField(max_digits=12, decimal_places=2)
    size_unit = models.CharField(max_length=20, default='sqm')
    terrain = models.CharField(max_length=100, blank=True)
    road_access = models.BooleanField(default=False)
    utilities = models.TextField(blank=True, help_text="Electricity, Water, etc.")

class VehicleExtension(models.Model):
    """Extension for Cars and Motorcycles."""
    listing = models.OneToOneField(Listing, on_delete=models.CASCADE, related_name='vehicle_data')
    vehicle_type = models.CharField(max_length=20, choices=[('Car', 'Car'), ('Motorcycle', 'Motorcycle')])
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    mileage = models.IntegerField()
    fuel_type = models.CharField(max_length=50)
    transmission = models.CharField(max_length=50)
    engine_capacity = models.CharField(max_length=50, blank=True)
    condition = models.CharField(max_length=100)

class ServiceExtension(models.Model):
    """Extension for Professional Services."""
    listing = models.OneToOneField(Listing, on_delete=models.CASCADE, related_name='service_data')
    service_category = models.CharField(max_length=100)
    experience_years = models.IntegerField(default=0)
    certifications = models.TextField(blank=True)

# ─── Trust & Verification Engine ───

class VerificationDocument(models.Model):
    """Proof of ownership or identity submitted for verification."""
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='verification_docs')
    file = models.FileField(upload_to='verification_docs/')
    document_type = models.CharField(max_length=100, help_text="e.g. Title Deed, Registration, ID")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Doc for {self.listing.title} - {self.document_type}"

class VerificationReview(models.Model):
    """Audit trail for the verification process of a document."""
    document = models.ForeignKey(VerificationDocument, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='verification_reviews')
    status = models.CharField(max_length=20, choices=[('approved', 'Approved'), ('rejected', 'Rejected')], default='rejected')
    notes = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review of {self.document} - {self.status}"

class ListingAuditLog(models.Model):
    """Immutable history of all critical changes to a listing."""
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='audit_log')
    field_changed = models.CharField(max_length=100)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='listing_audits')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Audit: {self.listing.title} - {self.field_changed} changed at {self.timestamp}"

# ─── Specialized Ecosystems ───

class ArticleCategory(models.Model):
    """Categories for Land Information Center articles (e.g. 'Ownership', 'Registration')."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Material icon name")

    def __str__(self):
        return self.name

class Article(models.Model):
    """Educational content for the Land Information Center."""
    category = models.ForeignKey(ArticleCategory, on_delete=models.CASCADE, related_name='articles')
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True)
    image = models.ImageField(upload_to='articles/', blank=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class Unit(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='units', null=True, blank=True)
    property = models.ForeignKey('Property', on_delete=models.CASCADE, null=True, blank=True)
    unit_number = models.IntegerField()
    bedrooms = models.IntegerField()
    bathrooms = models.IntegerField()
    rent = models.IntegerField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"Unit {self.unit_number} in {self.listing.title}"

class Lease(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='leases', null=True, blank=True)
    property = models.ForeignKey('Property', on_delete=models.CASCADE, null=True, blank=True)
    tenant = models.ForeignKey('Tenant', on_delete=models.CASCADE, related_name='leases')
    contract_details = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    contract_accepted = models.BooleanField(default=False)
    contract_signed = models.BooleanField(default=False)
    contract_archived = models.BooleanField(default=False)
    rent_amount = models.IntegerField()

    class Meta:
        verbose_name_plural = "Leases"

class Tenant(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    phone_number = models.CharField(max_length=15)
    address = models.CharField(max_length=200)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tenant_profile')
    image = models.ImageField(upload_to='tenant_images', blank=True)

    def __str__(self):
        return self.name

# Legacy models for migration period
class Property(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    types = models.CharField(max_length=10, choices=[('Apartment', 'Apartment'), ('House', 'House'), ('Commercial', 'Commercial')])
    description = models.TextField()
    image = models.ImageField(upload_to='property_images', blank=True)
    number_of_units = models.IntegerField()
    status = models.CharField(max_length=20, choices=[('Available', 'Available'), ('Rented', 'Rented')], default='Available')
    price = models.IntegerField()
    owner = models.ForeignKey('Owner', on_delete=models.CASCADE, related_name='properties')
    date_added = models.DateTimeField(auto_now_add=True)

class SaleProperty(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    property_type = models.CharField(max_length=20, choices=[('House', 'House'), ('Land', 'Land'), ('Apartment', 'Apartment'), ('Commercial', 'Commercial'), ('Villa', 'Villa'), ('Warehouse', 'Warehouse')])
    listing_type = models.CharField(max_length=10, choices=[('sale', 'For Sale'), ('rent', 'For Rent')], default='sale')
    price = models.DecimalField(max_digits=15, decimal_places=2)
    negotiable = models.BooleanField(default=True)
    address = models.CharField(max_length=300)
    city = models.CharField(max_length=100, default='Kigali')
    district = models.CharField(max_length=100, blank=True)
    sector = models.CharField(max_length=100, blank=True)
    size_sqm = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    bedrooms = models.IntegerField(blank=True, null=True)
    bathrooms = models.IntegerField(blank=True, null=True)
    year_built = models.IntegerField(blank=True, null=True)
    has_title_deed = models.BooleanField(default=False)
    has_parking = models.BooleanField(default=False)
    has_garden = models.BooleanField(default=False)
    is_furnished = models.BooleanField(default=False)
    image = models.ImageField(upload_to='sale_property_images')
    image_2 = models.ImageField(upload_to='sale_property_images', blank=True)
    image_3 = models.ImageField(upload_to='sale_property_images', blank=True)
    image_4 = models.ImageField(upload_to='sale_property_images', blank=True)
    image_5 = models.ImageField(upload_to='sale_property_images', blank=True)
    video_url = models.URLField(blank=True)
    seller = models.ForeignKey('Seller', on_delete=models.CASCADE, related_name='sale_properties')
    assigned_agent = models.ForeignKey('Agent', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_properties')
    status = models.CharField(max_length=20, choices=[('listed', 'Listed'), ('under_negotiation', 'Under Negotiation'), ('sold', 'Sold'), ('withdrawn', 'Withdrawn')], default='listed')
    is_featured = models.BooleanField(default=False)
    views_count = models.IntegerField(default=0)
    date_listed = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

class Owner(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    phone_number = models.CharField(max_length=15)
    address = models.CharField(max_length=200)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='owner_profile')
    image = models.ImageField(upload_to='owner_images', blank=True)

class Seller(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller_profile')
    name = models.CharField(max_length=150)
    email = models.EmailField(max_length=150)
    phone_number = models.CharField(max_length=20)
    address = models.CharField(max_length=250, blank=True)
    id_number = models.CharField(max_length=50, blank=True)
    image = models.ImageField(upload_to='seller_images', blank=True)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

class Agent(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_profile')
    name = models.CharField(max_length=150)
    email = models.EmailField(max_length=150)
    phone_number = models.CharField(max_length=20)
    license_number = models.CharField(max_length=50, blank=True)
    bio = models.TextField(blank=True)
    specialization = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='agent_images', blank=True)
    is_verified = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_deals = models.IntegerField(default=0)
    date_joined = models.DateTimeField(auto_now_add=True)

class Offer(models.Model):
    FINANCING_CHOICES = (
        ('cash', 'Cash / Direct Escrow'),
        ('bank_mortgage', 'Bank Mortgage / Financing'),
        ('installment', 'Staged Installments'),
    )

    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='offers', null=True, blank=True)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='offers_made')
    agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True, related_name='offers_handled')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    counter_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    escrow_proposed_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10.0, blank=True)
    financing_type = models.CharField(max_length=50, choices=FINANCING_CHOICES, default='cash')
    proposed_closing_date = models.DateField(null=True, blank=True)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('countered', 'Countered'), ('expired', 'Expired')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Offer {self.id}: {self.amount} for {self.listing.title if self.listing else 'Asset'} ({self.status})"


class TransactionDeal(models.Model):
    """End-to-End Deal Conveyance Pipeline for Sales and Rentals."""
    DEAL_TYPES = (
        ('sale', 'Property Sale Conveyance'),
        ('rental', 'Rental Lease Agreement'),
    )

    SALE_STAGES = (
        ('offer_accepted', 'Offer Agreed & Terms Locked'),
        ('escrow_funded', 'Earnest Escrow Deposited (5-10%)'),
        ('due_diligence', 'RLMUA Title Search & Caveat Check'),
        ('irembo_filing', 'Irembo Notary Filing Submitted'),
        ('notary_signing', 'Notary Deed Conveyance Signed'),
        ('settled_closed', 'Settlement Completed & Title Conveyed'),
        ('cancelled', 'Deal Cancelled'),
    )

    RENTAL_STAGES = (
        ('viewing_approved', 'Viewing & Tenant Profile Approved'),
        ('terms_agreed', 'Rent & Lease Duration Agreed'),
        ('deposit_funded', 'Security Deposit Committed in Escrow'),
        ('contract_signed', 'Lease Agreement Executed'),
        ('keys_handed', 'État des Lieux & Keys Handed Over'),
        ('active_lease', 'Active Tenancy Under Management'),
        ('terminated', 'Lease Terminated'),
    )

    ESCROW_STATUS_CHOICES = (
        ('pending_deposit', 'Awaiting Escrow Deposit'),
        ('held_in_escrow', 'Held in Bank Escrow'),
        ('released_to_seller', 'Disbursed to Seller'),
        ('refunded', 'Refunded to Buyer'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='deals')
    offer = models.OneToOneField('Offer', on_delete=models.SET_NULL, null=True, blank=True, related_name='deal')
    deal_type = models.CharField(max_length=20, choices=DEAL_TYPES, default='sale')

    buyer_or_tenant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deals_as_buyer')
    seller_or_landlord = models.ForeignKey(ListingOwner, on_delete=models.CASCADE, related_name='deals_as_seller')
    assigned_agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True, related_name='deals_managed')

    agreed_price = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=10, default='RWF')
    escrow_deposit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    escrow_status = models.CharField(max_length=30, choices=ESCROW_STATUS_CHOICES, default='pending_deposit')

    current_stage = models.CharField(max_length=40, default='offer_accepted')
    progress_percentage = models.IntegerField(default=15)

    # Sovereign Legal Rwandan Registry Details
    irembo_bill_id = models.CharField(max_length=100, blank=True, help_text="Irembo Gov Notary Application ID")
    land_upi = models.CharField(max_length=50, blank=True, help_text="Rwandan Parcel UPI Number")
    notary_office = models.CharField(max_length=150, blank=True, help_text="e.g. Gasabo District Notary Office")
    target_closing_date = models.DateField(null=True, blank=True)

    notes = models.TextField(blank=True)
    timeline = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Deal {self.id} [{self.deal_type.upper()}] - {self.listing.title} ({self.current_stage})"


class DealDocument(models.Model):
    """Paperwork, Contracts, Deeds, and Receipts for a Transaction Deal."""
    DOCUMENT_TYPES = (
        ('title_deed', 'Official Title Deed / UPI Certificate'),
        ('sales_contract', 'Bilateral Sales Agreement'),
        ('lease_contract', 'Residential / Commercial Lease Agreement'),
        ('escrow_receipt', 'Bank Escrow Deposit Confirmation'),
        ('irembo_receipt', 'Irembo Notary Application Bill / Receipt'),
        ('inspection_report', 'État des Lieux / Technical Inspection'),
        ('tax_clearance', 'RRA Property Tax Clearance Certificate'),
        ('id_proof', 'National ID / Passport Verification'),
        ('vehicle_carte_jaune', 'Vehicle Logbook (Carte Jaune)'),
        ('controle_technique', 'Police Vehicle Inspection Certificate'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    deal = models.ForeignKey(TransactionDeal, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=40, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='deal_paperwork/%Y/%m/')

    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_deal_docs')
    ai_extracted_data = models.JSONField(default=dict, blank=True)
    ai_validation_notes = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return f"Document: {self.title} ({self.get_document_type_display()}) for Deal {self.deal.id}"


class ContractAgreement(models.Model):
    """Digital Contract & Legal Agreement for a Transaction Deal."""
    CONTRACT_TYPE_CHOICES = (
        ('property_sale', 'Bilateral Property Sale Agreement (Compromis de Vente)'),
        ('apartment_unit_sale', 'Condominium Unit Purchase Agreement'),
        ('land_sale', 'Bilateral Land Conveyance Agreement'),
        ('residential_lease', 'Residential Tenancy Agreement'),
        ('commercial_lease', 'Commercial Lease Agreement'),
        ('vehicle_sale', 'Motor Vehicle Bill of Sale'),
        ('spousal_consent', 'Spousal Consent Affidavit'),
        ('handover_protocol', 'Inspection & Key Handover Protocol'),
    )
    STATUS_CHOICES = (
        ('draft', 'Drafting & Review'),
        ('pending_signatures', 'Awaiting Signatures'),
        ('partially_signed', 'Partially Signed'),
        ('fully_executed', 'Fully Executed & Sealed'),
        ('voided', 'Voided / Expired'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    deal = models.ForeignKey(TransactionDeal, on_delete=models.CASCADE, related_name='contracts')
    contract_type = models.CharField(max_length=40, choices=CONTRACT_TYPE_CHOICES, default='property_sale')
    title = models.CharField(max_length=255)

    # Rendered Legal Terms (HTML & optional PDF)
    contract_html_content = models.TextField(blank=True)
    contract_pdf = models.FileField(upload_to='signed_contracts/%Y/%m/', null=True, blank=True)

    # Cryptographic integrity
    sha256_hash = models.CharField(max_length=64, blank=True, help_text="Cryptographic document fingerprint")
    qr_verification_token = models.CharField(max_length=64, blank=True, unique=True)

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')

    # Structured signers manifest
    # List of dicts: [
    #   {"role": "seller", "user_id": 2, "name": "...", "phone": "...", "nida": "...", "status": "signed|pending",
    #    "signature_data": "data:image/png...", "signature_type": "draw|type", "signed_at": "...", "ip_address": "...", "otp_verified": True},
    #   ...
    # ]
    signers_manifest = models.JSONField(default=list, blank=True)
    requires_spousal_consent = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    executed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Contract: {self.title} ({self.status}) for Deal {self.deal.id}"


class AgentAssignment(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='assignments')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='agent_assignments', null=True, blank=True)
    assigned_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

class SiteVisit(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='site_visits', null=True, blank=True)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='site_visits')
    visitor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='booked_visits')
    scheduled_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=[('scheduled', 'Scheduled'), ('completed', 'Completed'), ('cancelled', 'Cancelled'), ('no_show', 'No Show')], default='scheduled')
    notes = models.TextField(blank=True)
    report = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class PropertyInquiry(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='inquiries', null=True, blank=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(max_length=150, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class ListingProposal(models.Model):
    """Intake for public property owners submitting assets for inspection & onboarding."""
    RELATIONSHIP_CHOICES = (
        ('direct_owner', 'Direct Property Owner'),
        ('representative', 'Authorized Representative (POA)'),
        ('broker', 'Licensed Broker / Agency'),
        ('developer', 'Real Estate Developer'),
    )
    ASSET_TYPE_CHOICES = (
        ('house', 'Residential Villa / House'),
        ('land', 'Land Parcel'),
        ('apartment', 'Apartment / Condominium'),
        ('commercial', 'Commercial / Office Building'),
        ('vehicle', 'Mobility / Vehicle'),
    )
    PURPOSE_CHOICES = (
        ('sale', 'For Sale'),
        ('rent', 'For Rent / Lease'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending Cadastral Review'),
        ('visit_scheduled', 'Physical Visit Scheduled'),
        ('inspected', 'Inspected & Surveyed'),
        ('approved', 'Approved & Converted to Listing'),
        ('rejected', 'Rejected / Ineligible'),
    )
    TIME_SLOT_CHOICES = (
        ('morning', 'Morning (09:00 - 12:00)'),
        ('afternoon', 'Afternoon (14:00 - 17:00)'),
        ('anytime', 'Anytime during working hours'),
    )

    proposal_code = models.CharField(max_length=30, unique=True, blank=True)
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=30)
    email = models.EmailField(max_length=150)
    id_number = models.CharField(max_length=50, blank=True, help_text="National ID or Passport Number")
    owner_relationship = models.CharField(max_length=30, choices=RELATIONSHIP_CHOICES, default='direct_owner')

    title = models.CharField(max_length=200, help_text="e.g. Modern 4BR Villa in Nyarutarama")
    asset_type = models.CharField(max_length=30, choices=ASSET_TYPE_CHOICES, default='house')
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='sale')
    district = models.CharField(max_length=100)
    sector = models.CharField(max_length=100, blank=True)
    cell = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=250)
    land_upi = models.CharField(max_length=50, blank=True, help_text="Rwandan Land UPI Number")

    proposed_price = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=10, default='RWF')
    size_sqm = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    bedrooms = models.IntegerField(null=True, blank=True)
    bathrooms = models.IntegerField(null=True, blank=True)
    sub_type = models.CharField(max_length=50, blank=True, help_text="e.g. Villa, Apartment, Plot, Office, SUV")
    specifications = models.JSONField(default=dict, blank=True, help_text="Dynamic domain-specific specs (vehicle, land, commercial, residential)")
    description = models.TextField(blank=True)

    preferred_visit_date = models.DateField(null=True, blank=True)
    preferred_time_slot = models.CharField(max_length=20, choices=TIME_SLOT_CHOICES, default='morning')
    site_contact_name = models.CharField(max_length=150, blank=True)
    site_contact_phone = models.CharField(max_length=30, blank=True)
    site_access_notes = models.TextField(blank=True, help_text="Gate codes, landmarks, caretaker details")

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    assigned_agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_proposals')
    converted_listing = models.ForeignKey(Listing, on_delete=models.SET_NULL, null=True, blank=True, related_name='origin_proposal')
    admin_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.proposal_code:
            import random
            from django.utils import timezone
            year = timezone.now().year
            code_num = random.randint(1000, 9999)
            self.proposal_code = f"PROP-{year}-{code_num}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.proposal_code}] {self.title} ({self.get_status_display()})"

class AgentReview(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='agent_reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    location = models.CharField(max_length=200, blank=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    original_post = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='reposts')
    repost_comment = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

class PostMedia(models.Model):
    MEDIA_TYPES = [('image', 'Image'), ('video', 'Video')]
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='posts/media/')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, default='image')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

class Hashtag(models.Model):
    name = models.CharField(max_length=100, unique=True)

class PostHashtag(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_hashtags')
    hashtag = models.ForeignKey(Hashtag, on_delete=models.CASCADE, related_name='post_hashtags')

    class Meta:
        unique_together = ('post', 'hashtag')

class PostComment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='post_comments')
    guest_name = models.CharField(max_length=100, blank=True)
    guest_email = models.EmailField(blank=True)
    content = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

class PostLike(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')

class Notification(models.Model):
    NOTIFICATION_TYPES = [('message', 'New Message'), ('like', 'Post Liked'), ('comment', 'New Comment'), ('repost', 'Post Reposted'), ('system', 'System')]
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='sent_notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    message = models.CharField(max_length=300)
    link = models.CharField(max_length=300, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class Announcement(models.Model):
    ICON_CHOICES = [('campaign', 'Campaign'), ('home_work', 'Home / Property'), ('real_estate_agent','Agent'), ('verified', 'Verified'), ('star', 'Star'), ('info', 'Info'), ('warning', 'Warning'), ('celebration', 'Celebration'), ('local_offer', 'Offer'), ('schedule', 'Schedule')]
    text = models.CharField(max_length=200)
    icon = models.CharField(max_length=40, choices=ICON_CHOICES, default='campaign')
    is_active = models.BooleanField(default=True)
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='extra_images')
    image = models.ImageField(upload_to='property_images')
    caption = models.CharField(max_length=100, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'uploaded_at']

class CustomerMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_archived = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)

class Updates(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    end_date = models.DateField()

    class Meta:
        verbose_name_plural = "Updates"

class Email(models.Model):
    sender_email = models.EmailField(max_length=255)
    recipient_email = models.EmailField(max_length=255)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    timestamp = models.DateTimeField(default=now)
    is_read = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Emails"

class CustRequest(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='cust_requests', null=True, blank=True)
    property = models.ForeignKey('Property', on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_archived = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)

class MaintenanceRequest(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='maint_requests', null=True, blank=True)
    property = models.ForeignKey('Property', on_delete=models.CASCADE, null=True, blank=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='maint_requests')
    title = models.CharField(max_length=100)
    description = models.TextField()
    request_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=[('open', 'Open'), ('in_progress', 'In Progress'), ('completed', 'Completed')], default='open')

class Payment(models.Model):
    PAYMENT_METHODS = [
        ('momo', 'MTN Mobile Money'),
        ('airtel', 'Airtel Money'),
        ('card', 'Credit / Debit Card'),
        ('bank', 'Bank Transfer'),
        ('cash', 'Cash'),
    ]
    PAYMENT_TYPES = [
        ('rent', 'Rent Payment'),
        ('deposit', 'Security Deposit / Escrow'),
        ('purchase', 'Asset Purchase'),
        ('booking', 'Site Visit / Inspection Fee'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    property = models.ForeignKey('Property', on_delete=models.CASCADE, null=True, blank=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    payer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments_made')
    amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    currency = models.CharField(max_length=10, default='RWF')
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHODS, default='momo')
    payment_type = models.CharField(max_length=30, choices=PAYMENT_TYPES, default='rent')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    transaction_reference = models.CharField(max_length=100, blank=True, null=True, unique=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    date_paid = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.payment_method.upper()} - {self.amount} {self.currency} ({self.status})"

class Message(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    sent_date = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Msg from {self.sender} to {self.recipient}"

class Visit(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='visits', null=True, blank=True)
    property = models.ForeignKey('Property', on_delete=models.CASCADE, null=True, blank=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='visits')
    visit_date = models.DateTimeField(auto_now_add=True)
    description = models.TextField()

class LikedProperties(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liked_properties')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='liked_by', null=True, blank=True)
    property = models.ForeignKey('Property', on_delete=models.CASCADE, null=True, blank=True)
    total_likes = models.IntegerField(default=0)

class ChatConversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='chat_conversations')
    session_key = models.CharField(max_length=40, null=True, blank=True)
    title = models.CharField(max_length=120, default='New Chat')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

class ChatMessage(models.Model):
    conversation = models.ForeignKey(ChatConversation, on_delete=models.CASCADE, related_name='chat_messages')
    role = models.CharField(max_length=10)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

class SystemLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    level = models.CharField(max_length=10, choices=[('DEBUG', 'Debug'), ('INFO', 'Info'), ('WARNING', 'Warning'), ('ERROR', 'Error'), ('CRITICAL', 'Critical')], default='INFO', db_index=True)
    category = models.CharField(max_length=20, choices=[('AUTH', 'Authentication'), ('USER', 'User Management'), ('PROPERTY', 'Property'), ('LEASE', 'Lease'), ('PAYMENT', 'Payment'), ('MAINTENANCE', 'Maintenance'), ('MARKETPLACE', 'Marketplace'), ('MESSAGING', 'Messaging'), ('SECURITY', 'Security'), ('API', 'API'), ('CHAT', 'AI Chatbot'), ('SYSTEM', 'System')], default='SYSTEM', db_index=True)
    message = models.TextField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='system_logs')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    path = models.CharField(max_length=500, blank=True)
    method = models.CharField(max_length=10, blank=True)
    status_code = models.PositiveSmallIntegerField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'System Log'
        verbose_name_plural = 'System Logs'

class SystemSetting(models.Model):
    """Secure storage for system-wide API keys and configuration."""
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.CharField(max_length=255, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key
