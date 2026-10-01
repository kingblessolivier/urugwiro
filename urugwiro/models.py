import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now


# ─── Global Constants ───

user_roles = (
    ('customer', 'Customer'),
    ('seller', 'Seller'),
    ('staff', 'Staff'),
    ('admin', 'Admin'),
    ('finance', 'Finance'),
    ('owner', 'Owner'),
)

listing_status = (
    ('draft', 'Draft'),
    ('submitted', 'Submitted'),
    ('under_review', 'Under Review'),
    ('published', 'Published'),
    ('under_offer', 'Under Offer'),
    ('sold', 'Sold'),
    ('rented', 'Rented'),
    ('completed', 'Completed'),
    ('archived', 'Archived'),
)

asset_types = (
    ('LAND', 'Land'),
    ('BUILDING', 'Building'),
    ('UNIT', 'Unit'),
    ('VEHICLE', 'Vehicle'),
    ('SERVICE', 'Service'),
)

verification_levels = (
    ('none', 'Not Verified'),
    ('submitted', 'Documents Submitted'),
    ('verified', 'Urugwiro Verified'),
    ('professional', 'Professionally Inspected'),
)


# ─── User ───

class User(AbstractUser):
    role = models.CharField(max_length=20, choices=user_roles, default='customer')

    def __str__(self):
        return self.username


# ─── Asset-Centric Foundation ───

class Asset(models.Model):
    """The physical source of truth. Decoupled from marketing."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    asset_type = models.CharField(max_length=20, choices=asset_types)
    name = models.CharField(max_length=255)

    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    boundary_geojson = models.TextField(blank=True, null=True, help_text="GeoJSON polygon for land assets")

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
    kitchen_type = models.CharField(
        max_length=50,
        choices=[('Open', 'Open'), ('Closed', 'Closed'), ('American', 'American')],
        null=True, blank=True,
    )
    balcony = models.BooleanField(default=False)
    is_furnished = models.BooleanField(default=False)
    year_built = models.IntegerField(null=True, blank=True)

    has_swimming_pool = models.BooleanField(default=False)
    has_staff_quarters = models.BooleanField(default=False)
    has_garden = models.BooleanField(default=False)
    has_water_tank = models.BooleanField(default=False)
    water_tank_capacity_liters = models.IntegerField(null=True, blank=True)
    has_solar_water_heater = models.BooleanField(default=False)
    has_backup_generator = models.BooleanField(default=False)
    backup_generator_kva = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    has_three_phase_power = models.BooleanField(default=False)
    has_fiber_internet = models.BooleanField(default=False)
    has_cctv = models.BooleanField(default=False)
    parking_spaces = models.IntegerField(default=1, null=True, blank=True)
    master_plan_zoning = models.CharField(max_length=50, blank=True, null=True)
    security_type = models.CharField(max_length=50, blank=True, null=True)

    electricity_meter = models.CharField(max_length=50, blank=True, null=True)
    road_access_type = models.CharField(max_length=50, blank=True, null=True)

    floor_number = models.IntegerField(null=True, blank=True)
    has_elevator = models.BooleanField(default=False)
    monthly_service_charge = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    apartment_selling_mode = models.CharField(max_length=20, choices=APARTMENT_SELLING_MODE, blank=True, null=True)
    total_building_floors = models.IntegerField(null=True, blank=True)
    unit_number = models.CharField(max_length=50, blank=True, null=True)
    unit_orientation = models.CharField(max_length=100, blank=True, null=True)
    balcony_area_sqm = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    parking_slot_number = models.CharField(max_length=30, blank=True, null=True)
    apartment_floor_plan = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.sub_type} Spec ({self.bedrooms} Beds, {self.bathrooms} Baths)"


class CommercialSpec(models.Model):
    asset = models.OneToOneField(Asset, on_delete=models.CASCADE, related_name='commercial_spec')
    zoning_type = models.CharField(
        max_length=50,
        choices=[('Retail', 'Retail'), ('Office', 'Office'), ('Industrial', 'Industrial'), ('Mixed', 'Mixed')],
        null=True, blank=True,
    )
    power_capacity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="KVA")
    loading_bays = models.IntegerField(default=0)
    parking_spaces = models.IntegerField(default=0)
    foot_traffic_score = models.IntegerField(default=0, help_text="1-10")
    total_floors = models.IntegerField(null=True, blank=True)
    has_backup_generator = models.BooleanField(default=False)

    def __str__(self):
        return f"Commercial ({self.zoning_type})"


class LandSpec(models.Model):
    TERRAIN_CHOICES = [
        ('Flat', 'Flat'), ('Gentle Slope', 'Gentle Slope'), ('Sloped', 'Sloped'),
        ('Hilly', 'Hilly'), ('Rocky', 'Rocky'), ('Valley', 'Valley'),
    ]
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
    lease_years_remaining = models.IntegerField(null=True, blank=True)
    upi_number = models.CharField(max_length=100, blank=True, null=True)
    zoning_code = models.CharField(max_length=50, blank=True, null=True)
    max_permitted_floors = models.CharField(max_length=20, blank=True, null=True)
    floor_area_ratio = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    building_coverage_ratio = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    terrain = models.CharField(max_length=50, choices=TERRAIN_CHOICES, null=True, blank=True)
    slope_gradient_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    road_access = models.BooleanField(default=False)
    road_type = models.CharField(max_length=50, blank=True, null=True)
    soil_type = models.CharField(max_length=100, blank=True, null=True)
    topography = models.TextField(blank=True, null=True)
    title_deed_number = models.CharField(max_length=100, blank=True, null=True)
    is_encumbrance_free = models.BooleanField(default=True)

    water_onsite = models.BooleanField(default=False)
    water_line_distance_meters = models.IntegerField(null=True, blank=True)
    electricity_onsite = models.BooleanField(default=False)
    power_pole_distance_meters = models.IntegerField(null=True, blank=True)
    has_fiber_conduit = models.BooleanField(default=False)
    drainage_system = models.CharField(max_length=50, blank=True, null=True)
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
    amenities = models.JSONField(default=dict, blank=True)
    occupancy_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    management_type = models.CharField(
        max_length=50,
        choices=[('Owner-Managed', 'Owner-Managed'), ('Franchise', 'Franchise'), ('Corporate', 'Corporate')],
        null=True, blank=True,
    )

    def __str__(self):
        return f"Hotel Spec ({self.total_rooms} Rooms, {self.star_rating or '-'} Stars)"


class VehicleSpec(models.Model):
    VEHICLE_TYPES = (('Car', 'Car'), ('Motorcycle', 'Motorcycle'))
    DRIVETRAIN_CHOICES = (
        ('4WD', '4WD / 4x4'), ('AWD', 'All-Wheel Drive'),
        ('FWD', 'Front-Wheel Drive'), ('RWD', 'Rear-Wheel Drive'),
    )
    CUSTOMS_STATUS_CHOICES = (
        ('DutyPaid', 'Customs Duty Paid'),
        ('InBond', 'In-Bond / Transit'),
        ('Exempt', 'Duty-Free Exemption'),
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
    engine_capacity = models.CharField(max_length=50, blank=True, null=True)
    horsepower = models.IntegerField(null=True, blank=True)
    condition = models.CharField(max_length=50, blank=True, null=True)
    body_type = models.CharField(max_length=50, blank=True, null=True)
    seating_capacity = models.IntegerField(null=True, blank=True)

    plate_number = models.CharField(max_length=50, blank=True, null=True)
    plate_type = models.CharField(max_length=50, blank=True, null=True)
    vin_chassis_number = models.CharField(max_length=100, blank=True, null=True)
    rra_customs_status = models.CharField(max_length=30, choices=CUSTOMS_STATUS_CHOICES, default='DutyPaid')
    controle_technique_expiry = models.DateField(null=True, blank=True)
    insurance_expiry = models.DateField(null=True, blank=True)

    has_air_conditioning = models.BooleanField(default=True)
    has_leather_seats = models.BooleanField(default=False)
    has_sunroof = models.BooleanField(default=False)
    has_reverse_camera = models.BooleanField(default=False)
    has_service_history = models.BooleanField(default=False)

    includes_driver = models.BooleanField(default=False)
    includes_helmet = models.BooleanField(default=False)
    has_delivery_rack = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.vehicle_type}: {self.year} {self.make} {self.model}"


# ─── Seller Profile ───

class SellerProfile(models.Model):
    """Profile for anyone listing assets on Urugwiro."""
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('suspended', 'Suspended'),
        ('archived', 'Archived'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller_profile')
    name = models.CharField(max_length=150)
    email = models.EmailField(max_length=150)
    phone_number = models.CharField(max_length=20)
    address = models.CharField(max_length=250, blank=True)
    id_number = models.CharField(max_length=50, blank=True, help_text="National ID or Passport")
    image = models.ImageField(upload_to='seller_profiles/', blank=True)
    bio = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    commission_rule = models.ForeignKey(
        'CommissionRule', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_sellers',
        help_text="Seller-specific commission override. If null, default rule applies.",
    )
    date_joined = models.DateTimeField(auto_now_add=True)

    @property
    def phone(self):
        return self.phone_number

    def __str__(self):
        return f"Seller: {self.name}"

ListingOwner = SellerProfile


# ─── Unified Listing ───

class Listing(models.Model):
    """The marketing representation of an asset on the platform."""
    PURPOSE_CHOICES = (('sale', 'For Sale'), ('rent', 'For Rent'))
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
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=200)
    description = models.TextField()
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='sale', db_index=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='house', db_index=True)
    price = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=10, default='RWF')
    rental_frequency = models.CharField(max_length=20, choices=RENTAL_FREQUENCY_CHOICES, blank=True, null=True)
    security_deposit = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    negotiable = models.BooleanField(default=True)

    address = models.CharField(max_length=300)

    status = models.CharField(max_length=20, choices=listing_status, default='draft')
    verification_level = models.CharField(max_length=20, choices=verification_levels, default='none')
    is_featured = models.BooleanField(default=False)
    listed_by_role = models.CharField(
        max_length=20,
        choices=[('admin', 'Admin'), ('seller', 'Seller'), ('staff', 'Staff')],
        default='seller',
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
    """Media files attached to a listing."""
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('floor_plan', 'Floor Plan'),
    ]
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='listing_media/')
    media_type = models.CharField(max_length=30, choices=MEDIA_TYPES, default='image')
    category = models.CharField(max_length=50, blank=True, help_text="e.g. Interior, Exterior, Drone")
    caption = models.CharField(max_length=200, blank=True)
    room_name = models.CharField(max_length=100, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'uploaded_at']

    def __str__(self):
        return f"{self.media_type} for {self.listing.title}"


# ─── Customer & CRM ───

class Customer(models.Model):
    """
    Every person who has shown interest in a property.
    Not necessarily a registered user. Identified by phone/email.
    One customer can have conversations about many different properties.
    """
    SOURCE_CHOICES = (
        ('website', 'Website Form'),
        ('whatsapp', 'WhatsApp'),
        ('phone', 'Phone Call'),
        ('email', 'Email'),
        ('walk_in', 'Walk-in'),
        ('referral', 'Referral'),
        ('social_media', 'Social Media'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='customer_profile',
    )
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(max_length=150, blank=True, db_index=True)
    location = models.CharField(max_length=255, blank=True)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='website')
    notes = models.TextField(blank=True, help_text="Internal notes about this customer")
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_activity_at']

    def __str__(self):
        return f"{self.full_name} ({self.phone})"


class Conversation(models.Model):
    """
    Customer + Property + Seller = Conversation.
    One customer can have different conversations about different properties.
    Each conversation has its own status and timeline.
    """
    STATUS_CHOICES = (
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('talking', 'Talking'),
        ('visit_requested', 'Visit Requested'),
        ('visit_scheduled', 'Visit Scheduled'),
        ('visited', 'Visited'),
        ('negotiating', 'Negotiating'),
        ('offer_made', 'Offer Made'),
        ('completed', 'Completed'),
        ('lost', 'Lost'),
    )
    SOURCE_CHOICES = (
        ('website', 'Website'),
        ('whatsapp', 'WhatsApp'),
        ('phone', 'Phone Call'),
        ('email', 'Email'),
        ('walk_in', 'Walk-in'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='conversations')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='conversations')
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name='conversations')
    assigned_staff = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_conversations',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='website')
    notes = models.TextField(blank=True)
    last_interaction_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-last_interaction_at']
        unique_together = ('customer', 'listing')

    def __str__(self):
        return f"{self.customer.full_name} ↔ {self.listing.title} ({self.get_status_display()})"


class ConversationEvent(models.Model):
    """A single entry in a conversation's activity timeline. Append-only."""
    EVENT_TYPES = (
        ('viewed', 'Viewed Property'),
        ('contacted', 'Contacted'),
        ('message', 'Message'),
        ('call', 'Phone Call'),
        ('whatsapp', 'WhatsApp Message'),
        ('email', 'Email'),
        ('visit_requested', 'Visit Requested'),
        ('visit_scheduled', 'Visit Scheduled'),
        ('visit_completed', 'Visit Completed'),
        ('visit_cancelled', 'Visit Cancelled'),
        ('offer_made', 'Offer Made'),
        ('offer_responded', 'Offer Responded'),
        ('note', 'Internal Note'),
        ('status_change', 'Status Changed'),
        ('follow_up_created', 'Follow-up Created'),
        ('follow_up_completed', 'Follow-up Completed'),
    )
    CHANNEL_CHOICES = (
        ('website', 'Website'),
        ('phone', 'Phone'),
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
        ('in_person', 'In Person'),
        ('internal', 'Internal'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    description = models.TextField()
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='website')
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.get_event_type_display()} at {self.created_at}"


class FollowUp(models.Model):
    """A task/reminder to follow up with a customer about a property."""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='follow_ups')
    listing = models.ForeignKey(Listing, on_delete=models.SET_NULL, null=True, blank=True, related_name='follow_ups')
    conversation = models.ForeignKey(Conversation, on_delete=models.SET_NULL, null=True, blank=True, related_name='follow_ups')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follow_ups')
    due_date = models.DateField()
    note = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        return f"Follow up with {self.customer.full_name} on {self.due_date}"


# ─── Visits ───

class Visit(models.Model):
    """A scheduled property visit by a customer."""
    STATUS_CHOICES = (
        ('requested', 'Requested'),
        ('confirmed', 'Confirmed'),
        ('rescheduled', 'Rescheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    )
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='visits')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='property_visits')
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name='visits')
    conversation = models.ForeignKey(Conversation, on_delete=models.SET_NULL, null=True, blank=True, related_name='visits')
    preferred_date = models.DateField()
    preferred_time = models.TimeField(null=True, blank=True)
    confirmed_date = models.DateField(null=True, blank=True)
    confirmed_time = models.TimeField(null=True, blank=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    number_of_visitors = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True)
    staff_notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-preferred_date', '-preferred_time']

    @property
    def scheduled_date(self):
        return self.confirmed_date or self.preferred_date

    @property
    def scheduled_time(self):
        return self.confirmed_time or self.preferred_time

    def __str__(self):
        return f"Visit: {self.customer.full_name} → {self.listing.title} on {self.preferred_date}"


# ─── Offers ───

class Offer(models.Model):
    """A customer's offer on a property. Simple and organized."""
    STATUS_CHOICES = (
        ('new', 'New'),
        ('reviewing', 'Reviewing'),
        ('negotiating', 'Negotiating'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('withdrawn', 'Withdrawn'),
    )
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='offers')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='offers')
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name='offers_received')
    conversation = models.ForeignKey(Conversation, on_delete=models.SET_NULL, null=True, blank=True, related_name='offers')
    asking_price = models.DecimalField(max_digits=15, decimal_places=2, help_text="Listing price at time of offer")
    offered_amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=10, default='RWF')
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Offer: {self.offered_amount} {self.currency} on {self.listing.title} ({self.status})"


# ─── Financial ───

class CommissionRule(models.Model):
    """Configurable business rules for commission calculation."""
    RULE_TYPES = (
        ('percentage', 'Percentage of Price'),
        ('fixed', 'Fixed Amount'),
        ('custom', 'Custom Agreement'),
    )
    name = models.CharField(max_length=100)
    rule_type = models.CharField(max_length=20, choices=RULE_TYPES, default='percentage')
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="e.g. 5.00 for 5%")
    fixed_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    category = models.CharField(max_length=30, blank=True, null=True, help_text="Applies only to this listing category")
    description = models.TextField(blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def calculate(self, price):
        """Given a price, return the commission amount."""
        if self.rule_type == 'percentage' and self.percentage:
            return (price * self.percentage) / 100
        elif self.rule_type == 'fixed' and self.fixed_amount:
            return self.fixed_amount
        return 0

    def __str__(self):
        if self.rule_type == 'percentage':
            return f"{self.name} ({self.percentage}%)"
        elif self.rule_type == 'fixed':
            return f"{self.name} ({self.fixed_amount} RWF)"
        return self.name


class Transaction(models.Model):
    """A completed property sale or rental."""
    TYPE_CHOICES = (('sale', 'Sale'), ('rental', 'Rental'))
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.OneToOneField(Listing, on_delete=models.CASCADE, related_name='transaction')
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name='transactions')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    agreed_price = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=10, default='RWF')
    commission_rule = models.ForeignKey(CommissionRule, on_delete=models.SET_NULL, null=True, related_name='transactions')
    commission_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    seller_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def calculate_commission(self):
        """Calculate commission using priority: seller-specific > category > default."""
        rule = self.commission_rule
        if not rule:
            if self.seller.commission_rule:
                rule = self.seller.commission_rule
            else:
                rule = CommissionRule.objects.filter(
                    category=self.listing.category, is_active=True
                ).first()
            if not rule:
                rule = CommissionRule.objects.filter(
                    is_default=True, is_active=True
                ).first()
        if rule:
            self.commission_rule = rule
            self.commission_amount = rule.calculate(self.agreed_price)
        else:
            self.commission_amount = 0
        self.seller_amount = self.agreed_price - self.commission_amount

    def save(self, *args, **kwargs):
        if not self.commission_amount and not self.seller_amount:
            self.calculate_commission()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Transaction: {self.listing.title} — {self.agreed_price} {self.currency}"


class SellerPayment(models.Model):
    """Payment record from Urugwiro to a seller."""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('processing', 'Processing'),
        ('partially_paid', 'Partially Paid'),
        ('paid', 'Paid'),
        ('disputed', 'Disputed'),
    )
    PAYMENT_METHODS = (
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_money', 'Mobile Money'),
        ('cash', 'Cash'),
        ('check', 'Check'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name='payments')
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='seller_payments')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='seller_payments')
    gross_amount = models.DecimalField(max_digits=15, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=15, decimal_places=2)
    seller_entitlement = models.DecimalField(max_digits=15, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    remaining_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    payment_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        self.remaining_balance = self.seller_entitlement - self.amount_paid
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payment to {self.seller.name}: {self.amount_paid}/{self.seller_entitlement} RWF"


class BusinessExpense(models.Model):
    """Business expense tracking for the owner."""
    CATEGORY_CHOICES = (
        ('marketing', 'Marketing'),
        ('advertising', 'Advertising'),
        ('transport', 'Transport'),
        ('photography', 'Photography'),
        ('video', 'Video Production'),
        ('staff', 'Staff / Salaries'),
        ('hosting', 'Hosting & Technology'),
        ('office', 'Office & Rent'),
        ('legal', 'Legal & Compliance'),
        ('communication', 'Communication'),
        ('other', 'Other'),
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=10, default='RWF')
    date = models.DateField()
    description = models.TextField()
    reference = models.CharField(max_length=100, blank=True)
    vendor = models.CharField(max_length=150, blank=True)
    attachment = models.FileField(upload_to='expense_attachments/', null=True, blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='recorded_expenses')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.get_category_display()}: {self.amount} RWF on {self.date}"


# ─── Documents ───

class DocumentTemplate(models.Model):
    """Templates for generating pre-filled business documents."""
    TEMPLATE_TYPES = (
        ('seller_agreement', 'Seller Agreement'),
        ('listing_authorization', 'Listing Authorization'),
        ('visit_form', 'Visit Form'),
        ('offer_form', 'Offer Form'),
        ('commission_agreement', 'Commission Agreement'),
        ('payment_confirmation', 'Payment Confirmation'),
        ('seller_payment_receipt', 'Seller Payment Receipt'),
        ('property_handover', 'Property Handover Form'),
        ('custom', 'Custom Document'),
    )
    name = models.CharField(max_length=200)
    template_type = models.CharField(max_length=30, choices=TEMPLATE_TYPES)
    content = models.TextField(help_text="Document body with merge fields: {{seller_name}}, {{property_title}}, {{price}}, etc.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"


class GeneratedDocument(models.Model):
    """A document generated from a template with real data."""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('review', 'Under Review'),
        ('sent', 'Sent for Signing'),
        ('signed', 'Signed'),
        ('completed', 'Completed'),
    )
    template = models.ForeignKey(DocumentTemplate, on_delete=models.SET_NULL, null=True, related_name='documents')
    title = models.CharField(max_length=200)
    listing = models.ForeignKey(Listing, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    seller = models.ForeignKey(SellerProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    generated_content = models.TextField()
    file = models.FileField(upload_to='generated_documents/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='generated_documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class DocumentSignature(models.Model):
    """Signature record for a generated document."""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('signed', 'Signed'),
        ('declined', 'Declined'),
    )
    document = models.ForeignKey(GeneratedDocument, on_delete=models.CASCADE, related_name='signatures')
    signer_name = models.CharField(max_length=150)
    signer_email = models.EmailField(blank=True)
    signer_phone = models.CharField(max_length=20, blank=True)
    signature_data = models.TextField(blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Signature: {self.signer_name} on {self.document.title} ({self.status})"


# ─── Trust & Verification ───

class VerificationDocument(models.Model):
    """Proof of ownership or identity submitted for verification."""
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='verification_docs')
    file = models.FileField(upload_to='verification_docs/')
    document_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Doc for {self.listing.title} - {self.document_type}"


class VerificationReview(models.Model):
    """Audit trail for the verification process."""
    document = models.ForeignKey(VerificationDocument, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='verification_reviews')
    status = models.CharField(max_length=20, choices=[('approved', 'Approved'), ('rejected', 'Rejected')], default='rejected')
    notes = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review of {self.document} - {self.status}"


# ─── Content & Updates ───

class ArticleCategory(models.Model):
    """Categories for informational articles."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name


class Article(models.Model):
    """Content articles — tips, guides, market info."""
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


class ListingReview(models.Model):
    """Customer review on a listing."""
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listing_reviews', null=True, blank=True)
    reviewer_name = models.CharField(max_length=120, blank=True)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rating}/5 on {self.listing.title}"


# ─── Saved Properties ───

class SavedProperty(models.Model):
    """A property saved/favorited by a user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_properties')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'listing')
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.username} saved {self.listing.title}"


# ─── Listing Proposals (Public Intake) ───

class ListingProposal(models.Model):
    """Public intake for property owners submitting assets for onboarding."""
    RELATIONSHIP_CHOICES = (
        ('direct_owner', 'Direct Property Owner'),
        ('representative', 'Authorized Representative'),
        ('broker', 'Licensed Broker / Agency'),
        ('developer', 'Real Estate Developer'),
    )
    ASSET_TYPE_CHOICES = (
        ('house', 'Residential House'),
        ('land', 'Land Parcel'),
        ('apartment', 'Apartment'),
        ('commercial', 'Commercial Building'),
        ('vehicle', 'Vehicle'),
    )
    PURPOSE_CHOICES = (('sale', 'For Sale'), ('rent', 'For Rent'))
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('visit_scheduled', 'Visit Scheduled'),
        ('inspected', 'Inspected'),
        ('approved', 'Approved & Converted'),
        ('rejected', 'Rejected'),
    )
    TIME_SLOT_CHOICES = (
        ('morning', 'Morning (09:00 - 12:00)'),
        ('afternoon', 'Afternoon (14:00 - 17:00)'),
        ('anytime', 'Anytime'),
    )

    proposal_code = models.CharField(max_length=30, unique=True, blank=True)
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=30)
    email = models.EmailField(max_length=150)
    id_number = models.CharField(max_length=50, blank=True)
    owner_relationship = models.CharField(max_length=30, choices=RELATIONSHIP_CHOICES, default='direct_owner')

    title = models.CharField(max_length=200)
    asset_type = models.CharField(max_length=30, choices=ASSET_TYPE_CHOICES, default='house')
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='sale')
    district = models.CharField(max_length=100)
    sector = models.CharField(max_length=100, blank=True)
    cell = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=250)
    land_upi = models.CharField(max_length=50, blank=True)

    proposed_price = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=10, default='RWF')
    size_sqm = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    bedrooms = models.IntegerField(null=True, blank=True)
    bathrooms = models.IntegerField(null=True, blank=True)
    sub_type = models.CharField(max_length=50, blank=True)
    specifications = models.JSONField(default=dict, blank=True)
    description = models.TextField(blank=True)

    preferred_visit_date = models.DateField(null=True, blank=True)
    preferred_time_slot = models.CharField(max_length=20, choices=TIME_SLOT_CHOICES, default='morning')
    site_contact_name = models.CharField(max_length=150, blank=True)
    site_contact_phone = models.CharField(max_length=30, blank=True)
    site_access_notes = models.TextField(blank=True)

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
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
            self.proposal_code = f"PROP-{timezone.now().year}-{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.proposal_code}] {self.title} ({self.get_status_display()})"


# ─── Notifications & System ───

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('new_message', 'New Message'),
        ('new_offer', 'New Offer'),
        ('new_conversation', 'New Conversation'),
        ('new_contact', 'New Contact'),
        ('visit_request', 'Visit Request'),
        ('visit_confirmed', 'Visit Confirmed'),
        ('visit_changed', 'Visit Changed'),
        ('listing_approved', 'Listing Approved'),
        ('listing_rejected', 'Listing Rejected'),
        ('payment_status', 'Payment Status'),
        ('document_signing', 'Document Signing'),
        ('follow_up', 'Follow-up Reminder'),
        ('system', 'System'),
    ]
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='sent_notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    message = models.CharField(max_length=300)
    link = models.CharField(max_length=300, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification to {self.recipient}: {self.message[:50]}"


class Announcement(models.Model):
    ICON_CHOICES = [
        ('campaign', 'Campaign'), ('home_work', 'Property'),
        ('verified', 'Verified'), ('star', 'Star'),
        ('info', 'Info'), ('warning', 'Warning'),
        ('celebration', 'Celebration'), ('local_offer', 'Offer'),
        ('schedule', 'Schedule'),
    ]
    text = models.CharField(max_length=200)
    icon = models.CharField(max_length=40, choices=ICON_CHOICES, default='campaign')
    is_active = models.BooleanField(default=True)
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.text


class PropertyInquiry(models.Model):
    """Legacy inquiry model — kept for data migration. New inquiries should create Customer + Conversation."""
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='inquiries', null=True, blank=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(max_length=150, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inquiry from {self.name} about {self.listing.title if self.listing else 'N/A'}"


class Updates(models.Model):
    """Platform updates and announcements."""
    title = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    end_date = models.DateField()

    class Meta:
        verbose_name_plural = "Updates"

    def __str__(self):
        return self.title


class Message(models.Model):
    """Internal messaging between users."""
    listing = models.ForeignKey(Listing, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    sent_date = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Msg from {self.sender} to {self.recipient}"


# ─── Audit ───

class ListingAuditLog(models.Model):
    """Immutable history of listing changes."""
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='audit_log')
    field_changed = models.CharField(max_length=100)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='listing_audits')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Audit: {self.listing.title} - {self.field_changed}"


class AuditLog(models.Model):
    """Unified audit log for all important system actions."""
    ACTION_CHOICES = (
        ('created', 'Created'), ('updated', 'Updated'), ('deleted', 'Deleted'),
        ('status_change', 'Status Changed'), ('approved', 'Approved'),
        ('rejected', 'Rejected'), ('payment', 'Payment Recorded'),
        ('login', 'Logged In'), ('export', 'Data Exported'),
    )
    ENTITY_CHOICES = (
        ('listing', 'Listing'), ('seller', 'Seller'), ('customer', 'Customer'),
        ('conversation', 'Conversation'), ('offer', 'Offer'), ('visit', 'Visit'),
        ('transaction', 'Transaction'), ('seller_payment', 'Seller Payment'),
        ('expense', 'Business Expense'), ('document', 'Document'),
        ('user', 'User'), ('commission_rule', 'Commission Rule'),
        ('system_setting', 'System Setting'),
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    entity_type = models.CharField(max_length=30, choices=ENTITY_CHOICES)
    entity_id = models.CharField(max_length=50)
    description = models.TextField()
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user} {self.action} {self.entity_type} at {self.created_at}"


class SystemLog(models.Model):
    """System-level operational logs."""
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    level = models.CharField(max_length=10, choices=[
        ('DEBUG', 'Debug'), ('INFO', 'Info'), ('WARNING', 'Warning'),
        ('ERROR', 'Error'), ('CRITICAL', 'Critical'),
    ], default='INFO', db_index=True)
    category = models.CharField(max_length=20, choices=[
        ('AUTH', 'Authentication'), ('USER', 'User Management'),
        ('PROPERTY', 'Property'), ('PAYMENT', 'Payment'),
        ('MARKETPLACE', 'Marketplace'), ('SECURITY', 'Security'),
        ('API', 'API'), ('SYSTEM', 'System'),
    ], default='SYSTEM', db_index=True)
    message = models.TextField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='system_logs')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    path = models.CharField(max_length=500, blank=True)
    method = models.CharField(max_length=10, blank=True)
    status_code = models.PositiveSmallIntegerField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.level}] {self.message[:80]}"


class SystemSetting(models.Model):
    """System-wide configuration keys."""
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.CharField(max_length=255, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key
