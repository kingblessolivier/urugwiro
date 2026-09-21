from rest_framework import serializers
from .models import (
    Listing, ListingMedia, RentalExtension, SaleExtension,
    LandExtension, VehicleExtension, ServiceExtension,
    VerificationDocument, VerificationReview, ListingAuditLog,
    ArticleCategory, Article, Asset, SystemSetting, User,
    ResidentialSpec, CommercialSpec, LandSpec, HotelSpec, VehicleSpec,
    Payment, Message, Offer, SiteVisit, TransactionDeal, DealDocument,
    ListingProposal
)

class ListingMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingMedia
        fields = [
            'id', 'file', 'media_type', 'category', 'caption',
            'room_name', 'initial_yaw', 'initial_pitch', 'hotspots', 'order'
        ]

class ResidentialSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResidentialSpec
        fields = '__all__'

class CommercialSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommercialSpec
        fields = '__all__'

class LandSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandSpec
        fields = '__all__'

class HotelSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelSpec
        fields = '__all__'

class VehicleSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleSpec
        fields = '__all__'

class RentalExtensionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalExtension
        fields = ['property_type', 'number_of_units']

class SaleExtensionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleExtension
        fields = ['negotiable', 'size_sqm', 'bedrooms', 'bathrooms', 'year_built', 'has_title_deed', 'has_parking', 'has_garden', 'is_furnished']

class LandExtensionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandExtension
        fields = ['land_type', 'plot_size', 'size_unit', 'terrain', 'road_access', 'utilities']

class VehicleExtensionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleExtension
        fields = ['vehicle_type', 'make', 'model', 'year', 'mileage', 'fuel_type', 'transmission', 'engine_capacity', 'condition']

class ServiceExtensionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceExtension
        fields = ['service_category', 'experience_years', 'certifications']

class VerificationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationDocument
        fields = ['id', 'listing', 'file', 'document_type', 'uploaded_at', 'is_verified']

class VerificationReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationReview
        fields = ['id', 'document', 'reviewer', 'status', 'notes', 'reviewed_at']

class ListingAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingAuditLog
        fields = ['id', 'listing', 'field_changed', 'old_value', 'new_value', 'changed_by', 'timestamp']

class AssetSerializer(serializers.ModelSerializer):
    residential_spec = ResidentialSpecSerializer(read_only=True)
    commercial_spec = CommercialSpecSerializer(read_only=True)
    land_spec = LandSpecSerializer(read_only=True)
    hotel_spec = HotelSpecSerializer(read_only=True)
    vehicle_spec = VehicleSpecSerializer(read_only=True)

    class Meta:
        model = Asset
        fields = [
            'id', 'asset_type', 'name', 'latitude', 'longitude', 'boundary_geojson',
            'province', 'district', 'sector', 'cell', 'village', 'total_area',
            'residential_spec', 'commercial_spec', 'land_spec', 'hotel_spec', 'vehicle_spec'
        ]

class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = ['id', 'key', 'value', 'description', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

class ArticleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleCategory
        fields = ['id', 'name', 'description', 'icon']

class ArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_icon = serializers.ReadOnlyField(source='category.icon')

    class Meta:
        model = Article
        fields = ['id', 'category', 'category_name', 'category_icon', 'title', 'slug', 'content', 'excerpt', 'image', 'author', 'created_at', 'is_published']

class ListingSerializer(serializers.ModelSerializer):
    media = ListingMediaSerializer(many=True, read_only=True)
    asset = AssetSerializer(read_only=True)

    # Dynamic legacy extension fields (for backward compatibility)
    rental_data = RentalExtensionSerializer(read_only=True)
    sale_data = SaleExtensionSerializer(read_only=True)
    land_data = LandExtensionSerializer(read_only=True)
    vehicle_data = VehicleExtensionSerializer(read_only=True)
    service_data = ServiceExtensionSerializer(read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'description', 'listing_type', 'purpose', 'category',
            'price', 'currency', 'rental_frequency', 'security_deposit', 'address',
            'asset', 'status', 'verification_level',
            'is_featured', 'views_count', 'slug', 'media',
            'rental_data', 'sale_data', 'land_data', 'vehicle_data', 'service_data'
        ]

    def to_representation(self, instance):
        """Clean up extension fields to only show the relevant one for legacy listing types."""
        rep = super().to_representation(instance)
        # Remove all legacy extension fields except the one that matches the listing_type
        extensions = {
            'rental': 'rental_data',
            'sale': 'sale_data',
            'land': 'land_data',
            'vehicle': 'vehicle_data',
            'service': 'service_data',
        }

        active_extension = extensions.get(instance.listing_type)
        for field in extensions.values():
            if field != active_extension:
                rep.pop(field, None)

        return rep

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.username')
    recipient_name = serializers.ReadOnlyField(source='recipient.username')

    class Meta:
        model = Message
        fields = ['id', 'listing', 'sender', 'sender_name', 'recipient', 'recipient_name', 'content', 'sent_date', 'is_read']


class OfferSerializer(serializers.ModelSerializer):
    buyer_name = serializers.ReadOnlyField(source='buyer.get_full_name')
    buyer_username = serializers.ReadOnlyField(source='buyer.username')
    listing_title = serializers.ReadOnlyField(source='listing.title')
    listing_price = serializers.ReadOnlyField(source='listing.price')
    listing_currency = serializers.ReadOnlyField(source='listing.currency')
    agent_name = serializers.ReadOnlyField(source='agent.name')

    class Meta:
        model = Offer
        fields = '__all__'


class SiteVisitSerializer(serializers.ModelSerializer):
    visitor_name = serializers.ReadOnlyField(source='visitor.get_full_name')
    visitor_username = serializers.ReadOnlyField(source='visitor.username')
    listing_title = serializers.ReadOnlyField(source='listing.title')
    agent_name = serializers.ReadOnlyField(source='agent.name')

    class Meta:
        model = SiteVisit
        fields = '__all__'


class DealDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.username')
    document_type_label = serializers.CharField(source='get_document_type_display', read_only=True)

    class Meta:
        model = DealDocument
        fields = '__all__'


class TransactionDealSerializer(serializers.ModelSerializer):
    listing_title = serializers.ReadOnlyField(source='listing.title')
    listing_category = serializers.ReadOnlyField(source='listing.category')
    listing_purpose = serializers.ReadOnlyField(source='listing.purpose')
    buyer_name = serializers.ReadOnlyField(source='buyer_or_tenant.get_full_name')
    buyer_email = serializers.ReadOnlyField(source='buyer_or_tenant.email')
    seller_name = serializers.ReadOnlyField(source='seller_or_landlord.name')
    agent_name = serializers.ReadOnlyField(source='assigned_agent.name')
    documents = DealDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = TransactionDeal
        fields = '__all__'


class ListingProposalSerializer(serializers.ModelSerializer):
    assigned_agent_name = serializers.ReadOnlyField(source='assigned_agent.name')
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    asset_type_label = serializers.CharField(source='get_asset_type_display', read_only=True)
    purpose_label = serializers.CharField(source='get_purpose_display', read_only=True)
    relationship_label = serializers.CharField(source='get_owner_relationship_display', read_only=True)

    class Meta:
        model = ListingProposal
        fields = '__all__'
        read_only_fields = ['proposal_code', 'created_at', 'updated_at']


