from django.urls import path
from . import views
from .api_views import (
    ListingListView, ListingDetailView, toggle_like,
    submit_verification_docs, admin_review_document, listing_audit_log,
    get_land_articles, get_article_categories, get_article_detail,
    manage_system_settings, api_login, api_register, api_me, api_logout,
    valuation_estimate, lifestyle_intent_search, visual_search,
    api_about, api_contact_submit, api_public_updates,
    list_verification_requests, get_verification_request_detail,
    seller_create_listing, generate_ai_narrative,
    test_nvidia_connection, ai_analyze_offer, ai_verify_milestone_document, api_ai_chat,
    list_create_offers, update_offer_status,
    list_create_site_visits, update_site_visit_status,
    list_create_deals, get_deal_detail, advance_deal_stage, upload_deal_document,
    api_proposals_view, api_proposal_detail_view, api_convert_proposal_to_listing,
    admin_users_list_create, admin_user_detail_update_delete,
    admin_user_set_role, admin_user_toggle_status, admin_user_reset_password
)
from django.contrib.auth import views as auth_views

urlpatterns = [
    # API Endpoints
    path('api/listings/', ListingListView.as_view(), name='api_listings'),
    path('api/listings/intent/', lifestyle_intent_search, name='api_listings_intent'),
    path('api/listings/visual-search/', visual_search, name='api_listings_visual_search'),
    path('api/listings/<int:pk>/', ListingDetailView.as_view(), name='api_listing_detail_pk'),
    path('api/listings/<slug:slug>/', ListingDetailView.as_view(), name='api_listing_detail'),
    path('api/listings/<int:pk>/like/', toggle_like, name='api_listing_like'),
    path('api/listings/<int:pk>/verify/', submit_verification_docs, name='api_listing_verify'),
    path('api/seller/listings/create/', seller_create_listing, name='api_seller_create_listing'),
    path('api/seller/ai/generate-narrative/', generate_ai_narrative, name='api_generate_narrative'),
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
    path('api/auth/me/', api_me, name='api_me'),
    path('api/auth/logout/', api_logout, name='api_logout'),
    path('api/valuation/estimate/', valuation_estimate, name='api_valuation_estimate'),
    path('api/public/about/', api_about, name='api_public_about'),
    path('api/public/updates/', api_public_updates, name='api_public_updates'),

    # Offers & Negotiations
    path('api/offers/', list_create_offers, name='api_offers'),
    path('api/offers/<int:pk>/status/', update_offer_status, name='api_offer_status'),

    # Site Visits & Showings
    path('api/visits/', list_create_site_visits, name='api_site_visits'),
    path('api/visits/<int:pk>/status/', update_site_visit_status, name='api_site_visit_status'),

    # Asset Proposals & Verification Intake
    path('api/proposals/', api_proposals_view, name='api_proposals'),
    path('api/proposals/<int:pk>/', api_proposal_detail_view, name='api_proposal_detail'),
    path('api/proposals/<int:pk>/convert/', api_convert_proposal_to_listing, name='api_convert_proposal'),

    # Deals & Stage Conveyance Pipeline
    path('api/deals/', list_create_deals, name='api_deals'),
    path('api/deals/<uuid:pk>/', get_deal_detail, name='api_deal_detail'),
    path('api/deals/<uuid:pk>/advance-stage/', advance_deal_stage, name='api_deal_advance_stage'),
    path('api/deals/<uuid:pk>/upload-document/', upload_deal_document, name='api_deal_upload_doc'),

    # NVIDIA AI Automations
    path('api/ai/test-connection/', test_nvidia_connection, name='api_ai_test_nvidia'),
    path('api/ai/analyze-offer/', ai_analyze_offer, name='api_ai_analyze_offer'),
    path('api/ai/verify-milestone/', ai_verify_milestone_document, name='api_ai_verify_milestone'),
    path('api/ai/chat/', api_ai_chat, name='api_ai_chat'),

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

    # Sovereign Reports Export
    path('api/reports/export/<str:report_type>/', views.admin_reports_export, name='api_reports_export'),

    # Admin User Management APIs
    path('api/admin/users/', admin_users_list_create, name='api_admin_users_list_create'),
    path('api/admin/users/<int:pk>/', admin_user_detail_update_delete, name='api_admin_user_detail_update_delete'),
    path('api/admin/users/<int:pk>/set-role/', admin_user_set_role, name='api_admin_user_set_role'),
    path('api/admin/users/<int:pk>/toggle-status/', admin_user_toggle_status, name='api_admin_user_toggle_status'),
    path('api/admin/users/<int:pk>/reset-password/', admin_user_reset_password, name='api_admin_user_reset_password'),
]





