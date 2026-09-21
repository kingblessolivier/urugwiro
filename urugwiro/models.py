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
    asset = models.OneToOneField(Asset, on_delete=models.CASCADE, related_name='residential_spec')
    bedrooms = models.IntegerField(null=True, blank=True)
    bathrooms = models.IntegerField(null=True, blank=True)
    kitchen_type = models.CharField(max_length=50, choices=[('Open', 'Open'), ('Closed', 'Closed'), ('American', 'American')], null=True, blank=True)
    balcony = models.BooleanField(default=False)
    is_furnished = models.BooleanField(default=False)
    year_built = models.IntegerField(null=True, blank=True)

class CommercialSpec(models.Model):
    asset = models.OneToOneField(Asset, on_delete=models.CASCADE, related_name='commercial_spec')
    zoning_type = models.CharField(max_length=50, choices=[('Retail', 'Retail'), ('Office', 'Office'), ('Industrial', 'Industrial'), ('Mixed', 'Mixed')], null=True, blank=True)
    power_capacity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="KVA")
    loading_bays = models.IntegerField(default=0)
    parking_spaces = models.IntegerField(default=0)
    foot_traffic_score = models.IntegerField(default=0, help_text="1-10")

class LandSpec(models.Model):
    asset = models.OneToOneField(Asset, on_delete=models.CASCADE, related_name='land_spec')
    terrain = models.CharField(max_length=50, choices=[('Flat', 'Flat'), ('Sloped', 'Sloped'), ('Hilly', 'Hilly'), ('Rocky', 'Rocky')], null=True, blank=True)
    road_access = models.BooleanField(default=False)
    soil_type = models.CharField(max_length=100, blank=True, null=True)
    topography = models.TextField(blank=True, null=True)
    title_deed_number = models.CharField(max_length=100, blank=True, null=True, help_text="UPT Number")

class HotelSpec(models.Model):
    asset = models.OneToOneField(Asset, on_delete=models.CASCADE, related_name='hotel_spec')
    star_rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], null=True, blank=True)
    total_rooms = models.IntegerField(null=True, blank=True)
    amenities = models.JSONField(default=dict, blank=True, help_text="e.g. {'pool': true, 'gym': true}")
    occupancy_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    management_type = models.CharField(max_length=50, choices=[('Owner-Managed', 'Owner-Managed'), ('Franchise', 'Franchise'), ('Corporate', 'Corporate')], null=True, blank=True)

class VehicleSpec(models.Model):
    asset = models.OneToOneField(Asset, on_delete=models.CASCADE, related_name='vehicle_spec')
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    mileage = models.IntegerField()
    fuel_type = models.CharField(max_length=50)
    transmission = models.CharField(max_length=50)
    engine_capacity = models.CharField(max_length=50, blank=True, null=True)

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
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='listings', null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    listing_type = models.CharField(max_length=20, choices=listing_type)
    price = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=10, default='RWF')

    # Location Intelligence - Now delegated to Asset
    address = models.CharField(max_length=300)

    # Management & Trust
    owner = models.ForeignKey(ListingOwner, on_delete=models.CASCADE, related_name='listings')
    status = models.CharField(max_length=20, choices=listing_status, default='listed')
    verification_level = models.CharField(max_length=20, choices=verification_levels, default='none')
    is_featured = models.BooleanField(default=False)
    views_count = models.IntegerField(default=0)

    date_listed = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    slug = models.SlugField(unique=True, blank=True, null=True)

    class Meta:
        ordering = ['-date_listed']

    def __str__(self):
        return f"[{self.get_listing_type_display()}] {self.title}"

class ListingMedia(models.Model):
    """Unified media system for all asset types."""
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='media')
    file = models.ImageField(upload_to='listing_media/')
    media_type = models.CharField(max_length=20, choices=[('image', 'Image'), ('video', 'Video'), ('360', '360 Tour')], default='image')
    category = models.CharField(max_length=50, blank=True, help_text="e.g. Interior, Exterior, Drone")
    caption = models.CharField(max_length=200, blank=True)
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
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='offers', null=True, blank=True)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='offers_made')
    agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True, related_name='offers_handled')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    counter_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('countered', 'Countered'), ('expired', 'Expired')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(blank=True, null=True)

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
    email = models.EmailField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

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
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    property = models.ForeignKey('Property', on_delete=models.CASCADE, null=True, blank=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='payments')
    amount = models.IntegerField()
    date_paid = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    sent_date = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

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
