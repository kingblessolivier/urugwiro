from django.contrib import admin
from .models import (
    User, Asset, ResidentialSpec, CommercialSpec, LandSpec, HotelSpec, VehicleSpec,
    SellerProfile, Listing, ListingMedia,
    Customer, Conversation, ConversationEvent, FollowUp, Visit, Offer,
    CommissionRule, Transaction, SellerPayment, BusinessExpense,
    DocumentTemplate, GeneratedDocument, DocumentSignature,
    VerificationDocument, VerificationReview, ListingAuditLog, AuditLog,
    ArticleCategory, Article, ListingReview, SavedProperty, ListingProposal,
    Notification, Announcement, PropertyInquiry, Updates, Message,
    SystemLog, SystemSetting
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('name', 'asset_type', 'district', 'sector', 'total_area', 'created_at')
    list_filter = ('asset_type', 'district')
    search_fields = ('name', 'district', 'sector')


@admin.register(ResidentialSpec)
class ResidentialSpecAdmin(admin.ModelAdmin):
    list_display = ('asset', 'sub_type', 'bedrooms', 'bathrooms', 'built_up_area_sqm', 'is_furnished')
    list_filter = ('sub_type', 'is_furnished')
    search_fields = ('asset__name',)


@admin.register(CommercialSpec)
class CommercialSpecAdmin(admin.ModelAdmin):
    list_display = ('asset', 'zoning_type', 'parking_spaces', 'total_floors')
    list_filter = ('zoning_type',)


@admin.register(LandSpec)
class LandSpecAdmin(admin.ModelAdmin):
    list_display = ('asset', 'land_use_category', 'tenure_type', 'upi_number', 'terrain', 'road_access')
    list_filter = ('land_use_category', 'tenure_type', 'road_access')
    search_fields = ('upi_number', 'asset__name')


@admin.register(HotelSpec)
class HotelSpecAdmin(admin.ModelAdmin):
    list_display = ('asset', 'star_rating', 'total_rooms', 'conference_halls', 'management_type')
    list_filter = ('star_rating', 'management_type')


@admin.register(VehicleSpec)
class VehicleSpecAdmin(admin.ModelAdmin):
    list_display = ('make', 'model', 'year', 'vehicle_type', 'plate_number', 'condition')
    list_filter = ('vehicle_type', 'fuel_type', 'transmission')
    search_fields = ('make', 'model', 'plate_number')


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone_number', 'status', 'is_verified', 'date_joined')
    list_filter = ('status', 'is_verified')
    search_fields = ('name', 'email', 'phone_number', 'id_number')


class ListingMediaInline(admin.TabularInline):
    model = ListingMedia
    extra = 1
    fields = ('file', 'media_type', 'category', 'caption', 'order')


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'purpose', 'price', 'currency', 'status', 'verification_level', 'is_featured', 'seller', 'date_listed')
    list_filter = ('status', 'category', 'purpose', 'verification_level', 'is_featured')
    search_fields = ('title', 'address', 'seller__name')
    list_editable = ('status', 'is_featured')
    inlines = [ListingMediaInline]


@admin.register(ListingMedia)
class ListingMediaAdmin(admin.ModelAdmin):
    list_display = ('listing', 'media_type', 'category', 'caption', 'order', 'uploaded_at')
    list_filter = ('media_type', 'category')
    search_fields = ('listing__title', 'caption')


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone', 'email', 'location', 'source', 'last_activity_at')
    list_filter = ('source', 'created_at')
    search_fields = ('full_name', 'phone', 'email', 'location')


class ConversationEventInline(admin.TabularInline):
    model = ConversationEvent
    extra = 0
    readonly_fields = ('event_type', 'description', 'channel', 'performed_by', 'created_at')
    can_delete = False


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('customer', 'listing', 'seller', 'status', 'source', 'assigned_staff', 'last_interaction_at')
    list_filter = ('status', 'source')
    search_fields = ('customer__full_name', 'customer__phone', 'listing__title', 'seller__name')
    inlines = [ConversationEventInline]


@admin.register(ConversationEvent)
class ConversationEventAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'event_type', 'channel', 'performed_by', 'created_at')
    list_filter = ('event_type', 'channel')
    search_fields = ('conversation__customer__full_name', 'description')


@admin.register(FollowUp)
class FollowUpAdmin(admin.ModelAdmin):
    list_display = ('customer', 'listing', 'assigned_to', 'due_date', 'status', 'created_at')
    list_filter = ('status', 'due_date')
    search_fields = ('customer__full_name', 'note')


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ('customer', 'listing', 'seller', 'preferred_date', 'preferred_time', 'status', 'phone')
    list_filter = ('status', 'preferred_date')
    search_fields = ('customer__full_name', 'listing__title', 'phone')


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('listing', 'customer', 'seller', 'offered_amount', 'currency', 'asking_price', 'status', 'created_at')
    list_filter = ('status', 'currency', 'created_at')
    search_fields = ('listing__title', 'customer__full_name', 'seller__name')


@admin.register(CommissionRule)
class CommissionRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'rule_type', 'percentage', 'fixed_amount', 'category', 'is_default', 'is_active')
    list_filter = ('rule_type', 'is_default', 'is_active')
    search_fields = ('name', 'description')


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('listing', 'seller', 'customer', 'transaction_type', 'agreed_price', 'commission_amount', 'seller_amount', 'status', 'completed_at')
    list_filter = ('transaction_type', 'status')
    search_fields = ('listing__title', 'seller__name', 'customer__full_name')


@admin.register(SellerPayment)
class SellerPaymentAdmin(admin.ModelAdmin):
    list_display = ('seller', 'listing', 'seller_entitlement', 'amount_paid', 'remaining_balance', 'status', 'payment_date', 'payment_method')
    list_filter = ('status', 'payment_method')
    search_fields = ('seller__name', 'listing__title', 'payment_reference')


@admin.register(BusinessExpense)
class BusinessExpenseAdmin(admin.ModelAdmin):
    list_display = ('category', 'amount', 'currency', 'date', 'vendor', 'recorded_by')
    list_filter = ('category', 'date')
    search_fields = ('description', 'vendor', 'reference')


@admin.register(DocumentTemplate)
class DocumentTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'template_type', 'is_active', 'created_at')
    list_filter = ('template_type', 'is_active')
    search_fields = ('name', 'content')


@admin.register(GeneratedDocument)
class GeneratedDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'template', 'listing', 'seller', 'customer', 'status', 'generated_by', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'seller__name', 'customer__full_name')


@admin.register(DocumentSignature)
class DocumentSignatureAdmin(admin.ModelAdmin):
    list_display = ('document', 'signer_name', 'signer_email', 'status', 'signed_at')
    list_filter = ('status',)
    search_fields = ('signer_name', 'signer_email')


@admin.register(VerificationDocument)
class VerificationDocumentAdmin(admin.ModelAdmin):
    list_display = ('listing', 'document_type', 'is_verified', 'uploaded_at')
    list_filter = ('is_verified', 'document_type')
    search_fields = ('listing__title', 'document_type')


@admin.register(VerificationReview)
class VerificationReviewAdmin(admin.ModelAdmin):
    list_display = ('document', 'reviewer', 'status', 'reviewed_at')
    list_filter = ('status',)


@admin.register(ListingAuditLog)
class ListingAuditLogAdmin(admin.ModelAdmin):
    list_display = ('listing', 'field_changed', 'changed_by', 'timestamp')
    list_filter = ('field_changed',)
    search_fields = ('listing__title',)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'entity_type', 'entity_id', 'created_at')
    list_filter = ('action', 'entity_type')
    search_fields = ('description', 'entity_id')


@admin.register(ArticleCategory)
class ArticleCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon')


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author', 'is_published', 'created_at')
    list_filter = ('is_published', 'category')
    search_fields = ('title', 'content')


@admin.register(ListingReview)
class ListingReviewAdmin(admin.ModelAdmin):
    list_display = ('listing', 'reviewer_name', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('listing__title', 'reviewer_name')


@admin.register(SavedProperty)
class SavedPropertyAdmin(admin.ModelAdmin):
    list_display = ('user', 'listing', 'saved_at')
    search_fields = ('user__username', 'listing__title')


@admin.register(ListingProposal)
class ListingProposalAdmin(admin.ModelAdmin):
    list_display = ('proposal_code', 'title', 'asset_type', 'purpose', 'proposed_price', 'status', 'full_name', 'created_at')
    list_filter = ('status', 'asset_type', 'purpose')
    search_fields = ('proposal_code', 'title', 'full_name', 'phone_number')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'actor', 'notification_type', 'message', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('recipient__username', 'message')


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('text', 'icon', 'is_active', 'order', 'created_at')
    list_editable = ('is_active', 'order')
    list_filter = ('is_active',)


@admin.register(PropertyInquiry)
class PropertyInquiryAdmin(admin.ModelAdmin):
    list_display = ('listing', 'name', 'email', 'phone', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'phone')


@admin.register(Updates)
class UpdatesAdmin(admin.ModelAdmin):
    list_display = ('title', 'end_date', 'created_at')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'sent_date', 'is_read')
    list_filter = ('is_read',)
    search_fields = ('sender__username', 'recipient__username')


@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ('level', 'category', 'message', 'user', 'timestamp')
    list_filter = ('level', 'category')
    search_fields = ('message', 'path')


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'description', 'updated_at')
    search_fields = ('key', 'description')
