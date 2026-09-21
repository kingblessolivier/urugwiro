from django.contrib import admin
from .models import (
    Property, Unit, Tenant, Lease, User,
    CustomerMessage, Owner, Updates, Email,
    CustRequest, MaintenanceRequest, Payment, Message, Visit, LikedProperties,
    Agent, Seller, SaleProperty, Offer, AgentAssignment, SiteVisit, PropertyInquiry, AgentReview,
    Post, PostMedia, Hashtag, PostHashtag, PostComment, PostLike, Notification,
    Announcement, PropertyImage,
)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_active', 'role')
    list_filter = ('is_staff', 'is_active', 'role')
    search_fields = ('username', 'email')


@admin.register(Owner)
class OwnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone_number', 'address', 'image')
    search_fields = ('name',)


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'types', 'description', 'image', 'number_of_units')
    list_filter = ('types',)
    search_fields = ('name',)


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('unit_number', 'rent', 'bathrooms', 'bedrooms', 'is_available')
    list_filter = ('is_available',)
    search_fields = ('unit_number',)


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone_number', 'address', 'image')
    search_fields = ('name',)


@admin.register(Lease)
class LeaseAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'listing', 'start_date', 'end_date')
    list_filter = ('start_date',)
    search_fields = ('tenant__name',)


@admin.register(CustomerMessage)
class CustomerMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'message', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email')


@admin.register(Updates)
class UpdatesAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title',)


@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ('sender_email', 'subject')


@admin.register(CustRequest)
class CustRequestAdmin(admin.ModelAdmin):
    list_display = ('listing', 'name', 'email', 'created_at', 'is_archived', 'is_read')
    list_filter = ('created_at', 'is_archived', 'is_read')
    search_fields = ('listing__title', 'name', 'email')


@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = ('listing', 'tenant', 'title', 'request_date', 'status')
    list_filter = ('status', 'request_date')
    search_fields = ('title', 'tenant__user__username')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('listing', 'tenant', 'amount', 'date_paid')
    list_filter = ('date_paid',)
    search_fields = ('tenant__user__username',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'sent_date', 'is_read')
    list_filter = ('sent_date', 'is_read')
    search_fields = ('sender__username', 'recipient__username')


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ('listing', 'tenant', 'visit_date')
    list_filter = ('visit_date',)
    search_fields = ('tenant__user__username',)
@admin.register(LikedProperties)
class LikedPropertiesAdmin(admin.ModelAdmin):
    list_display = ('user', 'listing')
    search_fields = ('user__username', 'listing__title')


# ═══════════════════════════════════════════════════════════
#   REAL ESTATE MARKETPLACE ADMIN
# ═══════════════════════════════════════════════════════════

@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone_number', 'specialization', 'is_verified', 'rating', 'total_deals')
    list_filter = ('is_verified', 'specialization')
    search_fields = ('name', 'email', 'license_number')


@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone_number', 'is_verified', 'date_joined')
    list_filter = ('is_verified',)
    search_fields = ('name', 'email', 'id_number')


@admin.register(SaleProperty)
class SalePropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'property_type', 'price', 'city', 'status', 'seller', 'assigned_agent', 'is_featured', 'date_listed')
    list_filter = ('property_type', 'status', 'city', 'is_featured', 'listing_type')
    search_fields = ('title', 'address', 'city', 'district')
    list_editable = ('is_featured', 'status')


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('listing', 'buyer', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('listing__title', 'buyer__username')


@admin.register(AgentAssignment)
class AgentAssignmentAdmin(admin.ModelAdmin):
    list_display = ('agent', 'listing', 'assigned_date', 'is_active')
    list_filter = ('is_active',)


@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    list_display = ('listing', 'agent', 'visitor', 'scheduled_date', 'status')
    list_filter = ('status', 'scheduled_date')
    search_fields = ('listing__title', 'agent__name')


@admin.register(PropertyInquiry)
class PropertyInquiryAdmin(admin.ModelAdmin):
    list_display = ('listing', 'name', 'email', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('listing__title', 'name', 'email')


@admin.register(AgentReview)
class AgentReviewAdmin(admin.ModelAdmin):
    list_display = ('agent', 'reviewer', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('agent__name', 'reviewer__username')


# ═══════════════════════════════════════════════════════════
#   SOCIAL FEED ADMIN
# ═══════════════════════════════════════════════════════════

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('author', 'content_preview', 'location', 'is_public', 'created_at')
    list_filter = ('is_public', 'created_at')
    search_fields = ('author__username', 'content')

    def content_preview(self, obj):
        import re
        text = re.sub(r'<[^>]+>', '', obj.content)
        return text[:80]
    content_preview.short_description = 'Content'


@admin.register(PostMedia)
class PostMediaAdmin(admin.ModelAdmin):
    list_display = ('post', 'media_type', 'order')
    list_filter = ('media_type',)


@admin.register(Hashtag)
class HashtagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(PostHashtag)
class PostHashtagAdmin(admin.ModelAdmin):
    list_display = ('post', 'hashtag')


@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'guest_name', 'content_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'guest_name', 'content')

    def content_preview(self, obj):
        return obj.content[:80]
    content_preview.short_description = 'Comment'


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'actor', 'notification_type', 'message', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('recipient__username', 'actor__username', 'message')

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display  = ('text', 'icon', 'is_active', 'order', 'created_at')
    list_editable = ('is_active', 'order')
    list_filter   = ('is_active',)
    search_fields = ('text',)
    ordering      = ('order', 'created_at')

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ('image', 'caption', 'order')

@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display  = ('property', 'caption', 'order', 'uploaded_at')
    list_filter   = ('property',)
    search_fields = ('property__name', 'caption')
