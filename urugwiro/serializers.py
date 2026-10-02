from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import (
    Listing, ListingMedia, Asset, ResidentialSpec, CommercialSpec, LandSpec,
    HotelSpec, VehicleSpec, SellerProfile, Customer, Conversation,
    ConversationEvent, FollowUp, Visit, Offer, CommissionRule, Transaction,
    SellerPayment, BusinessExpense, DocumentTemplate, GeneratedDocument,
    DocumentSignature, VerificationDocument, VerificationReview,
    ListingAuditLog, AuditLog, ArticleCategory, Article, ListingReview,
    SavedProperty, ListingProposal, Notification, Announcement,
    PropertyInquiry, Updates, Message, SystemSetting, User,
    SystemLog,
)


# ─── Asset Specs ───

class ResidentialSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResidentialSpec
        exclude = ['asset']


class CommercialSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommercialSpec
        exclude = ['asset']


class LandSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandSpec
        exclude = ['asset']


class HotelSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelSpec
        exclude = ['asset']


class VehicleSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleSpec
        exclude = ['asset']


class AssetSerializer(serializers.ModelSerializer):
    residential_spec = ResidentialSpecSerializer(read_only=True)
    commercial_spec = CommercialSpecSerializer(read_only=True)
    land_spec = LandSpecSerializer(read_only=True)
    hotel_spec = HotelSpecSerializer(read_only=True)
    vehicle_spec = VehicleSpecSerializer(read_only=True)
    upi_number = serializers.SerializerMethodField()
    title_deed_number = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = [
            'id', 'asset_type', 'name', 'latitude', 'longitude', 'boundary_geojson',
            'province', 'district', 'sector', 'cell', 'village', 'total_area',
            'upi_number', 'title_deed_number',
            'residential_spec', 'commercial_spec', 'land_spec', 'hotel_spec', 'vehicle_spec',
        ]

    def get_upi_number(self, obj):
        if hasattr(obj, 'land_spec') and obj.land_spec:
            return obj.land_spec.upi_number
        return None

    def get_title_deed_number(self, obj):
        if hasattr(obj, 'land_spec') and obj.land_spec:
            return obj.land_spec.title_deed_number
        return None


# ─── Media ───

class ListingMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingMedia
        fields = ['id', 'file', 'media_type', 'category', 'caption', 'room_name', 'order', 'uploaded_at']


# ─── Seller ───

class SellerProfileSerializer(serializers.ModelSerializer):
    listings_count = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = SellerProfile
        fields = [
            'id', 'user_id', 'username', 'name', 'email', 'phone_number', 'phone',
            'address', 'id_number', 'image', 'bio', 'is_verified', 'status',
            'commission_rule', 'date_joined', 'listings_count',
        ]
        read_only_fields = ['date_joined', 'is_verified', 'status']

    def get_listings_count(self, obj):
        return obj.listings.count()


class SellerProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = ['name', 'email', 'phone_number', 'address', 'id_number', 'image', 'bio']


# ─── Listing ───

class ListingSerializer(serializers.ModelSerializer):
    media = ListingMediaSerializer(many=True, read_only=True)
    asset = AssetSerializer(read_only=True)
    seller = SellerProfileSerializer(read_only=True)
    seller_name = serializers.CharField(source='seller.name', read_only=True, default='')
    seller_phone = serializers.CharField(source='seller.phone_number', read_only=True, default='')
    seller_user_id = serializers.IntegerField(source='seller.user_id', read_only=True, default=None)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    inquiries_count = serializers.SerializerMethodField()
    conversations_count = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'description', 'purpose', 'category',
            'price', 'currency', 'rental_frequency', 'security_deposit', 'negotiable',
            'address', 'asset', 'status', 'verification_level',
            'is_featured', 'listed_by_role', 'views_count', 'slug', 'media',
            'seller', 'seller_name', 'seller_phone', 'seller_user_id',
            'likes_count', 'is_liked', 'inquiries_count', 'conversations_count',
            'date_listed', 'date_updated',
        ]
        read_only_fields = ['views_count', 'date_listed', 'date_updated', 'slug']

    def get_likes_count(self, obj):
        return obj.saved_by.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.saved_by.filter(user=request.user).exists()
        return False

    def get_inquiries_count(self, obj):
        return obj.inquiries.count()

    def get_conversations_count(self, obj):
        return obj.conversations.count()


class ListingCreateSerializer(serializers.ModelSerializer):
    """Used when creating/updating a listing via API."""
    class Meta:
        model = Listing
        fields = [
            'title', 'description', 'purpose', 'category',
            'price', 'currency', 'rental_frequency', 'security_deposit', 'negotiable',
            'address', 'asset', 'status', 'verification_level', 'listed_by_role', 'is_featured',
            'views_count', 'slug',
        ]
        extra_kwargs = {
            'title': {'required': False},
            'description': {'required': False, 'allow_blank': True},
            'price': {'required': False},
            'address': {'required': False, 'allow_blank': True},
            'slug': {'required': False, 'allow_null': True, 'allow_blank': True},
            'views_count': {'required': False},
            'security_deposit': {'required': False, 'allow_null': True},
            'rental_frequency': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

    def to_internal_value(self, data):
        if hasattr(data, 'copy'):
            data = data.copy()
        else:
            data = dict(data)
        if data.get('security_deposit') == '':
            data['security_deposit'] = None
        if data.get('rental_frequency') == '':
            data['rental_frequency'] = None
        if data.get('views_count') == '':
            data['views_count'] = 0
        if data.get('price') == '':
            data.pop('price', None)
        if data.get('slug') == '':
            data['slug'] = None
        if 'is_featured' in data:
            val = data.get('is_featured')
            data['is_featured'] = str(val).lower() in ['true', '1', 'yes'] if val is not None else False
        if 'negotiable' in data:
            val = data.get('negotiable')
            data['negotiable'] = str(val).lower() in ['true', '1', 'yes'] if val is not None else True
        return super().to_internal_value(data)


# ─── Customer ───

class SellerListingWriteSerializer(ListingCreateSerializer):
    def validate(self, attrs):
        forbidden = {
            'asset', 'seller_id', 'owner_id', 'verification_level', 'is_featured',
            'listed_by_role', 'views_count', 'slug', 'owner_verified',
        }.intersection(self.initial_data)
        if forbidden:
            raise serializers.ValidationError({key: 'Only platform staff can change this field.' for key in forbidden})
        if 'status' in attrs and attrs['status'] not in {'draft', 'submitted', 'archived'}:
            raise serializers.ValidationError({'status': 'Sellers can save drafts, submit for review, or archive.'})
        if self.instance and self.instance.status in {'sold', 'rented', 'completed'}:
            raise serializers.ValidationError('Completed listings cannot be edited by sellers.')
        if attrs.get('price', 1) <= 0:
            raise serializers.ValidationError({'price': 'Price must be positive.'})
        return attrs


class CustomerSerializer(serializers.ModelSerializer):
    conversations_count = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id', 'full_name', 'phone', 'email', 'location', 'source',
            'notes', 'created_at', 'last_activity_at', 'user', 'conversations_count',
        ]
        read_only_fields = ['id', 'created_at', 'last_activity_at']

    def get_conversations_count(self, obj):
        return obj.conversations.count()


class CustomerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['full_name', 'phone', 'email', 'location', 'source', 'notes']


# ─── Conversation ───

class ConversationEventSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.username', read_only=True, default='')

    class Meta:
        model = ConversationEvent
        fields = [
            'id', 'event_type', 'description', 'channel',
            'performed_by', 'performed_by_name', 'metadata', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    listing_price = serializers.DecimalField(source='listing.price', read_only=True, max_digits=15, decimal_places=2)
    listing_category = serializers.CharField(source='listing.category', read_only=True)
    seller_name = serializers.CharField(source='seller.name', read_only=True)
    assigned_staff_name = serializers.CharField(source='assigned_staff.username', read_only=True, default='')
    events = ConversationEventSerializer(many=True, read_only=True)
    recent_events = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'customer', 'customer_name', 'customer_phone',
            'listing', 'listing_title', 'listing_price', 'listing_category',
            'seller', 'seller_name', 'assigned_staff', 'assigned_staff_name',
            'status', 'source', 'notes', 'last_interaction_at', 'created_at',
            'events', 'recent_events',
        ]
        read_only_fields = ['id', 'last_interaction_at', 'created_at']

    def get_recent_events(self, obj):
        recent = obj.events.order_by('-created_at')[:5]
        return ConversationEventSerializer(recent, many=True).data


class ConversationCreateSerializer(serializers.Serializer):
    """Creates a conversation, auto-creating or finding the customer."""
    listing_id = serializers.IntegerField()
    full_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False, allow_blank=True, default='')
    location = serializers.CharField(required=False, allow_blank=True, default='')
    message = serializers.CharField(required=False, allow_blank=True, default='')
    source = serializers.ChoiceField(choices=Customer.SOURCE_CHOICES, default='website')


# ─── Follow-Up ───

class FollowUpSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    listing_title = serializers.CharField(source='listing.title', read_only=True, default='')
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = FollowUp
        fields = [
            'id', 'customer', 'customer_name', 'listing', 'listing_title',
            'conversation', 'assigned_to', 'assigned_to_name',
            'due_date', 'note', 'status', 'completed_at', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'completed_at']


# ─── Visit ───

class VisitSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    seller_name = serializers.CharField(source='seller.name', read_only=True)

    class Meta:
        model = Visit
        fields = [
            'id', 'customer', 'customer_name', 'listing', 'listing_title',
            'seller', 'seller_name', 'conversation',
            'preferred_date', 'preferred_time', 'confirmed_date', 'confirmed_time',
            'scheduled_date', 'scheduled_time',
            'phone', 'email', 'number_of_visitors', 'notes', 'staff_notes',
            'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'scheduled_date', 'scheduled_time']


class VisitCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = [
            'listing', 'preferred_date', 'preferred_time',
            'phone', 'email', 'number_of_visitors', 'notes',
        ]


# ─── Offer ───

class OfferSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    listing_price = serializers.DecimalField(source='listing.price', read_only=True, max_digits=15, decimal_places=2)
    seller_name = serializers.CharField(source='seller.name', read_only=True)

    class Meta:
        model = Offer
        fields = [
            'id', 'listing', 'listing_title', 'listing_price',
            'customer', 'customer_name', 'seller', 'seller_name', 'conversation',
            'asking_price', 'offered_amount', 'currency', 'message',
            'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ─── Financial ───

class CommissionRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommissionRule
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    seller_name = serializers.CharField(source='seller.name', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True, default='')

    class Meta:
        model = Transaction
        fields = [
            'id', 'listing', 'listing_title', 'seller', 'seller_name',
            'customer', 'customer_name', 'transaction_type',
            'agreed_price', 'currency', 'commission_rule',
            'commission_amount', 'seller_amount',
            'status', 'notes', 'completed_at', 'created_at',
        ]
        read_only_fields = ['id', 'commission_amount', 'seller_amount', 'created_at']


class SellerPaymentSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.name', read_only=True)
    listing_title = serializers.CharField(source='listing.title', read_only=True)

    class Meta:
        model = SellerPayment
        fields = [
            'id', 'seller', 'seller_name', 'transaction', 'listing', 'listing_title',
            'gross_amount', 'commission_amount', 'seller_entitlement',
            'amount_paid', 'remaining_balance',
            'payment_date', 'payment_method', 'payment_reference', 'notes',
            'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'remaining_balance', 'created_at', 'updated_at']


class BusinessExpenseSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.username', read_only=True, default='')

    class Meta:
        model = BusinessExpense
        fields = [
            'id', 'category', 'amount', 'currency', 'date', 'description',
            'reference', 'vendor', 'attachment', 'recorded_by', 'recorded_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


# ─── Documents ───

class DocumentTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTemplate
        fields = '__all__'


class DocumentSignatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentSignature
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class GeneratedDocumentSerializer(serializers.ModelSerializer):
    signatures = DocumentSignatureSerializer(many=True, read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True, default='')
    listing_title = serializers.CharField(source='listing.title', read_only=True, default='')
    seller_name = serializers.CharField(source='seller.name', read_only=True, default='')
    customer_name = serializers.CharField(source='customer.full_name', read_only=True, default='')
    generated_by_name = serializers.CharField(source='generated_by.username', read_only=True, default='')

    class Meta:
        model = GeneratedDocument
        fields = [
            'id', 'template', 'template_name', 'title',
            'listing', 'listing_title', 'seller', 'seller_name',
            'customer', 'customer_name', 'generated_content', 'file',
            'status', 'generated_by', 'generated_by_name',
            'signatures', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ─── Verification ───

class VerificationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationDocument
        fields = ['id', 'listing', 'file', 'document_type', 'uploaded_at', 'is_verified']
        read_only_fields = ['id', 'uploaded_at', 'is_verified']


class VerificationReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationReview
        fields = ['id', 'document', 'reviewer', 'status', 'notes', 'reviewed_at']
        read_only_fields = ['id', 'reviewer', 'reviewed_at']


# ─── Content ───

class ArticleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleCategory
        fields = ['id', 'name', 'description', 'icon']


class ArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_icon = serializers.ReadOnlyField(source='category.icon')

    class Meta:
        model = Article
        fields = [
            'id', 'category', 'category_name', 'category_icon',
            'title', 'slug', 'content', 'excerpt', 'image',
            'author', 'created_at', 'updated_at', 'is_published',
        ]


class ListingReviewSerializer(serializers.ModelSerializer):
    reviewer_display_name = serializers.SerializerMethodField()
    listing_title = serializers.CharField(source='listing.title', read_only=True, default='')

    class Meta:
        model = ListingReview
        fields = [
            'id', 'listing', 'listing_title', 'reviewer', 'reviewer_name',
            'reviewer_display_name', 'rating', 'comment', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_reviewer_display_name(self, obj):
        if obj.reviewer_name:
            return obj.reviewer_name
        if obj.reviewer:
            full = obj.reviewer.get_full_name()
            return full.strip() if full.strip() else obj.reviewer.username
        return 'Customer'


# ─── Saved Properties ───

class SavedPropertySerializer(serializers.ModelSerializer):
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    listing_price = serializers.DecimalField(source='listing.price', read_only=True, max_digits=15, decimal_places=2)
    listing_category = serializers.CharField(source='listing.category', read_only=True)
    listing_purpose = serializers.CharField(source='listing.purpose', read_only=True)

    class Meta:
        model = SavedProperty
        fields = [
            'id', 'user', 'listing', 'listing_title', 'listing_price',
            'listing_category', 'listing_purpose', 'saved_at',
        ]
        read_only_fields = ['id', 'saved_at']


# ─── Listing Proposals ───

class ListingProposalSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    asset_type_label = serializers.CharField(source='get_asset_type_display', read_only=True)
    purpose_label = serializers.CharField(source='get_purpose_display', read_only=True)
    relationship_label = serializers.CharField(source='get_owner_relationship_display', read_only=True)

    class Meta:
        model = ListingProposal
        fields = '__all__'
        read_only_fields = ['proposal_code', 'created_at', 'updated_at']


class PublicListingProposalSerializer(serializers.ModelSerializer):
    """Fields accepted from the unauthenticated property intake form."""

    class Meta:
        model = ListingProposal
        fields = [
            'id', 'proposal_code', 'full_name', 'phone_number', 'email',
            'id_number', 'owner_relationship', 'title', 'asset_type', 'purpose',
            'district', 'sector', 'cell', 'address', 'land_upi',
            'proposed_price', 'currency', 'size_sqm', 'bedrooms', 'bathrooms',
            'sub_type', 'specifications', 'description', 'preferred_visit_date',
            'preferred_time_slot', 'site_contact_name', 'site_contact_phone',
            'site_access_notes', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'proposal_code', 'status', 'created_at', 'updated_at',
        ]


# ─── Audit ───

class ListingAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingAuditLog
        fields = ['id', 'listing', 'field_changed', 'old_value', 'new_value', 'changed_by', 'timestamp']


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True, default='')

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_name', 'action', 'entity_type', 'entity_id',
            'description', 'old_value', 'new_value', 'ip_address', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


# ─── Notifications ───

class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', read_only=True, default='')

    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'actor', 'actor_name', 'notification_type',
            'message', 'link', 'is_read', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'text', 'icon', 'is_active', 'order', 'created_at']


# ─── Inquiry (Legacy) ───

class PropertyInquirySerializer(serializers.ModelSerializer):
    listing_title = serializers.CharField(source='listing.title', read_only=True, default='')

    class Meta:
        model = PropertyInquiry
        fields = [
            'id', 'listing', 'listing_title', 'name', 'email', 'phone',
            'location', 'message', 'is_read', 'created_at',
        ]


# ─── System ───

class SystemSettingSerializer(serializers.ModelSerializer):
    is_secret = serializers.SerializerMethodField()

    class Meta:
        model = SystemSetting
        fields = ['id', 'key', 'value', 'description', 'is_secret', 'updated_at']
        extra_kwargs = {'key': {'validators': []}}

    @staticmethod
    def _is_secret_key(key):
        key = key.upper()
        return any(marker in key for marker in ('KEY', 'SECRET', 'TOKEN', 'PASSWORD', 'CREDENTIAL'))

    def get_is_secret(self, obj):
        return self._is_secret_key(obj.key)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if self._is_secret_key(instance.key):
            data['value'] = ''
        return data


class SystemLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemLog
        fields = '__all__'


# ─── User ───

class UserSerializer(serializers.ModelSerializer):
    listings_count = serializers.SerializerMethodField()
    offers_count = serializers.SerializerMethodField()
    is_seller = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login', 'listings_count', 'offers_count', 'is_seller',
        ]

    def get_listings_count(self, obj):
        profile = getattr(obj, 'seller_profile', None)
        return profile.listings.count() if profile else 0

    def get_is_seller(self, obj):
        return hasattr(obj, 'seller_profile')

    def get_offers_count(self, obj):
        profile = getattr(obj, 'seller_profile', None)
        return profile.offers_received.count() if profile else 0


class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'role', 'password', 'is_active', 'is_staff']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def validate(self, attrs):
        try:
            validate_password(attrs['password'], User(**{
                key: value for key, value in attrs.items() if key != 'password'
            }))
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': exc.messages})
        return attrs


class SelfProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name']

    def validate(self, attrs):
        forbidden = set(self.initial_data) - set(self.fields)
        if forbidden:
            raise serializers.ValidationError({key: 'This field cannot be changed here.' for key in forbidden})
        return attrs


class RegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    full_name = serializers.CharField(max_length=300, required=False, allow_blank=True)
    role = serializers.CharField(required=False, default='customer')

    def validate(self, attrs):
        role = attrs.pop('role').lower()
        if role not in {'customer', 'buyer', 'tenant'}:
            raise serializers.ValidationError({'role': 'Public registration creates customer accounts only.'})
        for field in ('is_staff', 'is_superuser', 'is_active'):
            if field in self.initial_data:
                raise serializers.ValidationError({field: 'This field is managed by administrators.'})
        attrs['username'] = attrs.get('username') or attrs['email'].split('@')[0]
        for field in ('username', 'email'):
            if User.objects.filter(**{f'{field}__iexact': attrs[field]}).exists():
                raise serializers.ValidationError({field: 'Already registered.'})
        User._meta.get_field('username').run_validators(attrs['username'])
        try:
            validate_password(attrs['password'], User(username=attrs['username'], email=attrs['email']))
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': exc.messages})
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '').split(' ', 1)
        return User.objects.create_user(
            **validated_data, role='customer', first_name=full_name[0],
            last_name=full_name[1] if len(full_name) > 1 else '',
        )


class UpdatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Updates
        fields = '__all__'


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.username')
    recipient_name = serializers.ReadOnlyField(source='recipient.username')

    class Meta:
        model = Message
        fields = [
            'id', 'listing', 'sender', 'sender_name',
            'recipient', 'recipient_name', 'content', 'sent_date', 'is_read',
        ]
