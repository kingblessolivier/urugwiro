from rest_framework import serializers
from .models import (
    Listing, ListingMedia, RentalExtension, SaleExtension,
    LandExtension, VehicleExtension, ServiceExtension,
    VerificationDocument, VerificationReview, ListingAuditLog,
    ArticleCategory, Article, Asset, SystemSetting, User
)

class ListingMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingMedia
        fields = ['id', 'file', 'media_type', 'category', 'caption', 'order']

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
    class Meta:
        model = Asset
        fields = ['id', 'name', 'latitude', 'longitude', 'province', 'district', 'sector', 'cell', 'village', 'total_area']

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

    # Dynamic extension fields
    rental_data = RentalExtensionSerializer(read_only=True)
    sale_data = SaleExtensionSerializer(read_only=True)
    land_data = LandExtensionSerializer(read_only=True)
    vehicle_data = VehicleExtensionSerializer(read_only=True)
    service_data = ServiceExtensionSerializer(read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'description', 'listing_type', 'price', 'currency',
            'asset', 'status', 'verification_level',
            'is_featured', 'views_count', 'slug', 'media',
            'rental_data', 'sale_data', 'land_data', 'vehicle_data', 'service_data'
        ]

    def to_representation(self, instance):
        """Clean up extension fields to only show the relevant one for the listing type."""
        rep = super().to_representation(instance)
        # Remove all extension fields except the one that matches the listing_type
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
