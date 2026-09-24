from rest_framework import serializers
from .models import (
    Listing, ListingMedia, RentalExtension, SaleExtension,
    LandExtension, VehicleExtension, ServiceExtension,
    VerificationDocument, VerificationReview, ListingAuditLog,
    ArticleCategory, Article, Asset, SystemSetting, User,
    ResidentialSpec, CommercialSpec, LandSpec, HotelSpec, VehicleSpec,
    Payment, Message, Offer, SiteVisit, TransactionDeal, DealDocument, ContractAgreement,
    ListingProposal, Tenant, Owner, Seller, Agent, Property, SaleProperty, Lease, MaintenanceRequest
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
    listings_count = serializers.SerializerMethodField()
    offers_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login', 'listings_count', 'offers_count'
        ]

    def get_listings_count(self, obj):
        try:
            from .models import Listing
            if hasattr(obj, 'listing_owner_profile'):
                return obj.listing_owner_profile.listings.count()
            return Listing.objects.filter(owner__user=obj).count()
        except Exception:
            return 0

    def get_offers_count(self, obj):
        try:
            from .models import Offer
            return Offer.objects.filter(buyer=obj).count()
        except Exception:
            return 0


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
    owner_user_id = serializers.IntegerField(source='owner.user_id', read_only=True, default=None)
    owner_name = serializers.CharField(source='owner.name', read_only=True, default='')
    custom_sections = serializers.SerializerMethodField()

    def get_custom_sections(self, obj):
        import os, json
        from django.conf import settings
        disc_file = os.path.join(settings.BASE_DIR, 'urugwiro', 'data', 'discoveries', f"{obj.id}.json")
        if os.path.exists(disc_file):
            try:
                with open(disc_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                return []
        return []

    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    inquiries_count = serializers.SerializerMethodField()
    visits_count = serializers.SerializerMethodField()
    owner_phone = serializers.CharField(source='owner.phone_number', read_only=True, default='')

    def get_likes_count(self, obj):
        try:
            from .models import LikedProperties
            return LikedProperties.objects.filter(listing=obj).count()
        except Exception:
            return 0

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            try:
                from .models import LikedProperties
                return LikedProperties.objects.filter(listing=obj, user=request.user).exists()
            except Exception:
                return False
        return False

    def get_inquiries_count(self, obj):
        try:
            from .models import PropertyInquiry, CustRequest
            return PropertyInquiry.objects.filter(listing=obj).count() + CustRequest.objects.filter(listing=obj).count()
        except Exception:
            return 0

    def get_visits_count(self, obj):
        try:
            from .models import SiteVisit
            return SiteVisit.objects.filter(listing=obj).count()
        except Exception:
            return 0

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
            'is_featured', 'listed_by_role', 'views_count', 'slug', 'media',
            'owner_user_id', 'owner_name', 'owner_phone', 'custom_sections',
            'likes_count', 'is_liked', 'inquiries_count', 'visits_count',
            'rental_data', 'sale_data', 'land_data', 'vehicle_data', 'service_data'
        ]

    def to_representation(self, instance):
        """Clean up extension fields to only show the relevant one for legacy listing types, and attach leads ledger if requester is staff, admin, or listing owner."""
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

        # Inbound Leads & Customer Follow-Up Ledger for Admins & Listing Owner
        request = self.context.get('request')
        user = request.user if request and request.user and request.user.is_authenticated else None
        is_admin = bool(user and (user.is_staff or user.is_superuser or getattr(user, 'role', '').lower() == 'admin'))
        is_owner = bool(user and hasattr(instance, 'owner') and instance.owner and (
            (hasattr(instance.owner, 'user_id') and instance.owner.user_id == user.id) or
            (hasattr(instance.owner, 'id') and instance.owner.id == user.id) or
            getattr(user, 'role', '').lower() == 'seller'
        ))

        if is_admin or is_owner:
            from .models import CustRequest, PropertyInquiry, SiteVisit, LikedProperties
            import re

            # Inquiries
            inquiries_list = []
            seen_leads = set()
            for pi in PropertyInquiry.objects.filter(listing=instance).order_by('-created_at'):
                inquiries_list.append({
                    'id': f"pi-{pi.id}",
                    'name': pi.name or 'Prospective Client',
                    'email': pi.email or '',
                    'phone': pi.phone or '',
                    'location': pi.location or '',
                    'message': pi.message,
                    'is_read': pi.is_read,
                    'created_at': pi.created_at.isoformat() if pi.created_at else None,
                })
                seen_leads.add((pi.email.lower() if pi.email else '', (pi.message or '')[:30]))

            for cr in CustRequest.objects.filter(listing=instance).order_by('-created_at'):
                sig = (cr.email.lower() if cr.email else '', (cr.message or '')[:30])
                if sig not in seen_leads:
                    phone_match = re.search(r'Phone:\s*([+\d\s\-()]+)', cr.message or '')
                    phone_val = phone_match.group(1).strip() if phone_match else ''
                    inquiries_list.append({
                        'id': f"cr-{cr.id}",
                        'name': cr.name or 'Prospective Client',
                        'email': cr.email or '',
                        'phone': phone_val,
                        'message': cr.message,
                        'is_read': cr.is_read,
                        'created_at': cr.created_at.isoformat() if cr.created_at else None,
                    })
                    seen_leads.add(sig)

            rep['leads_inquiries'] = inquiries_list

            # Showing Visits
            visits_list = []
            for sv in SiteVisit.objects.filter(listing=instance).select_related('visitor', 'agent').order_by('-scheduled_date'):
                v_name = sv.visitor.name if sv.visitor and hasattr(sv.visitor, 'name') and sv.visitor.name else (sv.visitor.username if sv.visitor else 'Prospective Buyer')
                v_phone = sv.visitor.phone_number if sv.visitor and hasattr(sv.visitor, 'phone_number') and sv.visitor.phone_number else ''
                v_email = sv.visitor.email if sv.visitor and sv.visitor.email else ''

                p_match = re.search(r'Prospect:\s*([^|\n]+)', sv.notes or '')
                if p_match: v_name = p_match.group(1).strip()
                ph_match = re.search(r'Phone:\s*([^|\n]+)', sv.notes or '')
                if ph_match: v_phone = ph_match.group(1).strip()
                em_match = re.search(r'Email:\s*([^|\n]+)', sv.notes or '')
                if em_match: v_email = em_match.group(1).strip()

                visits_list.append({
                    'id': sv.id,
                    'visitor_name': v_name,
                    'visitor_phone': v_phone,
                    'visitor_email': v_email,
                    'scheduled_date': str(sv.scheduled_date),
                    'status': sv.status,
                    'notes': sv.notes,
                    'report': sv.report,
                })
            rep['leads_visits'] = visits_list

            # Likes / Interested Buyers
            likes_list = []
            for lk in LikedProperties.objects.filter(listing=instance).select_related('user').order_by('-id'):
                u = lk.user
                if u:
                    u_name = u.name if hasattr(u, 'name') and u.name else (f"{u.first_name} {u.last_name}".strip() or u.username)
                    u_phone = u.phone_number if hasattr(u, 'phone_number') and u.phone_number else ''
                    u_email = u.email or ''
                    likes_list.append({
                        'id': lk.id,
                        'name': u_name,
                        'phone': u_phone,
                        'email': u_email,
                    })
            rep['leads_likes'] = likes_list

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
    visitor_name = serializers.SerializerMethodField()
    visitor_username = serializers.ReadOnlyField(source='visitor.username')
    visitor_email = serializers.SerializerMethodField()
    visitor_phone = serializers.SerializerMethodField()
    listing_title = serializers.ReadOnlyField(source='listing.title')
    agent_name = serializers.ReadOnlyField(source='agent.name')

    class Meta:
        model = SiteVisit
        fields = '__all__'

    def get_visitor_name(self, obj):
        import re
        if obj.notes:
            m = re.search(r'(?:Prospect|Visitor|Name):\s*([^|\n]+)', obj.notes)
            if m:
                return m.group(1).strip()
        if obj.visitor:
            full = obj.visitor.get_full_name()
            return full.strip() if full.strip() else obj.visitor.username
        return 'Prospective Client'

    def get_visitor_email(self, obj):
        import re
        if obj.notes:
            m = re.search(r'Email:\s*([^|\n]+)', obj.notes)
            if m:
                return m.group(1).strip()
        if obj.visitor and obj.visitor.email:
            return obj.visitor.email
        return ''

    def get_visitor_phone(self, obj):
        import re
        if obj.notes:
            m = re.search(r'Phone:\s*([^|\n]+)', obj.notes)
            if m:
                return m.group(1).strip()
        if obj.visitor:
            owner_profile = getattr(obj.visitor, 'listing_owner_profile', None)
            if owner_profile and owner_profile.phone_number:
                return owner_profile.phone_number
        return ''


class DealDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.username')
    document_type_label = serializers.CharField(source='get_document_type_display', read_only=True)

    class Meta:
        model = DealDocument
        fields = '__all__'


class ContractAgreementSerializer(serializers.ModelSerializer):
    contract_type_label = serializers.CharField(source='get_contract_type_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    deal_title = serializers.ReadOnlyField(source='deal.listing.title')
    deal_id = serializers.ReadOnlyField(source='deal.id')

    class Meta:
        model = ContractAgreement
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
    contracts = ContractAgreementSerializer(many=True, read_only=True)

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


class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['id', 'name', 'email', 'phone_number', 'address', 'user', 'image']


class OwnerSerializer(serializers.ModelSerializer):
    properties_count = serializers.SerializerMethodField()

    class Meta:
        model = Owner
        fields = ['id', 'name', 'email', 'phone_number', 'address', 'user', 'image', 'properties_count']

    def get_properties_count(self, obj):
        return obj.properties.count()


class SellerSerializer(serializers.ModelSerializer):
    listing_count = serializers.SerializerMethodField()

    class Meta:
        model = Seller
        fields = ['id', 'name', 'email', 'phone', 'phone_number', 'address', 'id_number', 'image', 'is_verified', 'date_joined', 'listing_count']

    def get_listing_count(self, obj):
        return obj.sale_properties.count()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # normalize phone and phone_number
        if not ret.get('phone') and ret.get('phone_number'):
            ret['phone'] = ret['phone_number']
        return ret


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ['id', 'name', 'email', 'phone', 'phone_number', 'license_number', 'bio', 'specialization', 'image', 'is_verified', 'rating', 'total_deals', 'date_joined']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if not ret.get('phone') and ret.get('phone_number'):
            ret['phone'] = ret['phone_number']
        return ret


class SalePropertySerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    agent = AgentSerializer(source='assigned_agent', read_only=True)

    class Meta:
        model = SaleProperty
        fields = '__all__'


class PropertySerializer(serializers.ModelSerializer):
    owner = OwnerSerializer(read_only=True)

    class Meta:
        model = Property
        fields = '__all__'


class LeaseSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    property_name = serializers.CharField(source='property.name', default='', read_only=True)

    class Meta:
        model = Lease
        fields = ['id', 'tenant', 'tenant_name', 'property', 'property_name', 'listing', 'start_date', 'end_date', 'rent_amount', 'contract_details', 'contract_signed', 'contract_archived', 'contract_accepted']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.contract_archived:
            ret['status'] = 'archived'
        elif instance.contract_signed:
            ret['status'] = 'signed'
        else:
            ret['status'] = 'unsigned'
        return ret


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    property_name = serializers.CharField(source='property.name', default='', read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = ['id', 'title', 'description', 'property_name', 'tenant_name', 'request_date', 'completion_date', 'status']



