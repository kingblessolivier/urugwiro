from django.urls import path
from . import views
from .api_views import (
    ListingListView, ListingDetailView, toggle_like,
    submit_verification_docs, admin_review_document, listing_audit_log,
    get_land_articles, get_article_categories, get_article_detail,
    manage_system_settings, api_login, api_register, api_logout,
    valuation_estimate, lifestyle_intent_search, visual_search,
    api_about, api_contact_submit, api_public_updates,
    list_verification_requests, get_verification_request_detail
)
from django.contrib.auth import views as auth_views
urlpatterns = [
    # API Endpoints
    path('api/listings/', ListingListView.as_view(), name='api_listings'),
    path('api/listings/<slug:slug>/', ListingDetailView.as_view(), name='api_listing_detail'),
    path('api/listings/<int:pk>/', ListingDetailView.as_view(), name='api_listing_detail_pk'),
    path('api/listings/<int:pk>/like/', toggle_like, name='api_listing_like'),
    path('api/listings/<int:pk>/verify/', submit_verification_docs, name='api_listing_verify'),
    path('api/verification/', list_verification_requests, name='api_verification_list'),
    path('api/verification/<int:pk>/', get_verification_request_detail, name='api_verification_detail'),
    path('api/verification/review/<int:doc_id>/', admin_review_document, name='api_verify_review'),
    path('api/listings/<int:pk>/audit/', listing_audit_log, name='api_listing_audit'),
    path('api/land-info/articles/', get_land_articles, name='api_land_articles'),
    path('api/land-info/categories/', get_article_categories, name='api_land_categories'),
    path('api/land-info/articles/<slug:slug>/', get_article_detail, name='api_land_article_detail'),
    path('api/system/settings/', manage_system_settings, name='api_system_settings'),
    path('api/auth/login/', api_login, name='api_login'),
    path('api/auth/register/', api_register, name='api_register'),
    path('api/auth/logout/', api_logout, name='api_logout'),
    path('api/valuation/estimate/', valuation_estimate, name='api_valuation_estimate'),
    path('api/listings/intent/', lifestyle_intent_search, name='api_listings_intent'),
    path('api/listings/visual-search/', visual_search, name='api_listings_visual_search'),
    path('api/public/about/', api_about, name='api_public_about'),
    path('api/public/contact/', api_contact_submit, name='api_public_contact'),
    path('api/public/updates/', api_public_updates, name='api_public_updates'),

    path('api/properties', views.properties, name='properties'),
    path('api/properties/<pk>', views.property_details, name='property_details'),

    path('api/tenants', views.tenants, name='tenants'),
    path('api/tenants/<pk>', views.tenant_details, name='tenant_details'),
    path('api/units', views.units, name='units'),
    path('api/units/<pk>', views.unit_details, name='unit_details'),
    path('api/leases', views.leases, name='leases'),
    path('api/leases/<pk>', views.lease_details, name='lease_details'),












    path('api/chat/contacts/',              views.chat_contacts_api,  name='chat_contacts_api'),
    path('api/chat/history/<int:contact_id>/', views.chat_history_api, name='chat_history_api'),
    path('api/chat/send/',                  views.chat_send_api,      name='chat_send_api'),
    path('api/chat/new-users/',             views.chat_new_users_api, name='chat_new_users_api'),
]





