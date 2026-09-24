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
    generate_deal_contract, get_contract_detail, send_contract_otp, sign_contract, verify_contract_public,
    api_proposals_view, api_proposal_detail_view, api_convert_proposal_to_listing,
    admin_users_list_create, admin_user_detail_update_delete,
    admin_user_set_role, admin_user_toggle_status, admin_user_reset_password,
    api_platform_stats, admin_enquiries_list, admin_enquiry_detail_update,
    seller_listings_list, seller_listing_detail_manage, seller_listing_toggle_status,
    seller_deals_earnings, seller_agents_list, seller_assign_agent,
    seller_offers_list, seller_offer_respond, seller_inquiries_list, seller_inquiry_detail,
    seller_visits_list, seller_visit_update, seller_likes_list,
    admin_visits_list, admin_likes_list,
    owner_dashboard_metrics,
    agent_dashboard_metrics, agent_properties_list, agent_property_detail,
    agent_visits_list_create, agent_visit_update,
    agent_offers_list, agent_offer_counter,
    agent_deals_pipeline, agent_deal_advance_stage,
    agent_earnings_ledger, agent_leads_list, agent_lead_mark_read,
    agent_profile_manage,
    consumer_dashboard_metrics, consumer_offers_list, consumer_offer_respond,
    consumer_visits_list, consumer_visit_book, consumer_visit_cancel,
    consumer_purchased_assets, consumer_leases_list, consumer_rent_payments,
    consumer_maintenance_requests, consumer_saved_properties,
    consumer_market_trends, consumer_ai_recommendations,
    admin_properties_list_create, admin_property_detail_manage, admin_property_assign_agent,
    admin_tenants_list_create, admin_tenant_detail_manage,
    admin_owners_list_create, admin_owner_detail_manage,
    admin_sellers_list_create, admin_seller_detail_manage,
    admin_agents_list_create, admin_agent_detail_manage,
    admin_leases_list_create, admin_lease_detail_manage,
    admin_maintenance_list_create, admin_maintenance_detail_manage,
    admin_listing_delete
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
    path('api/listings/<slug:slug>/like/', toggle_like, name='api_listing_like_slug'),
    path('api/listings/<int:pk>/verify/', submit_verification_docs, name='api_listing_verify'),
    
    # Seller Studio & Inventory Management
    path('api/seller/listings/', seller_listings_list, name='api_seller_listings'),
    path('api/seller/listings/create/', seller_create_listing, name='api_seller_create_listing'),
    path('api/seller/listings/<int:pk>/', seller_listing_detail_manage, name='api_seller_listing_detail_manage'),
    path('api/seller/listings/<int:pk>/status/', seller_listing_toggle_status, name='api_seller_listing_toggle_status'),
    path('api/seller/listings/<int:pk>/assign-agent/', seller_assign_agent, name='api_seller_assign_agent'),
    path('api/seller/deals/', seller_deals_earnings, name='api_seller_deals_earnings'),
    path('api/seller/agents/', seller_agents_list, name='api_seller_agents_list'),
    path('api/seller/ai/generate-narrative/', generate_ai_narrative, name='api_generate_narrative'),
    path('api/seller/offers/', seller_offers_list, name='api_seller_offers'),
    path('api/seller/offers/<int:pk>/respond/', seller_offer_respond, name='api_seller_offer_respond'),
    path('api/seller/inquiries/', seller_inquiries_list, name='api_seller_inquiries'),
    path('api/seller/inquiries/<str:pk>/', seller_inquiry_detail, name='api_seller_inquiry_detail'),
    path('api/seller/visits/', seller_visits_list, name='api_seller_visits'),
    path('api/seller/visits/<int:pk>/', seller_visit_update, name='api_seller_visit_update'),
    path('api/seller/likes/', seller_likes_list, name='api_seller_likes'),
    path('api/admin/visits/', admin_visits_list, name='api_admin_visits'),
    path('api/admin/visits/<int:pk>/', seller_visit_update, name='api_admin_visit_update'),
    path('api/admin/likes/', admin_likes_list, name='api_admin_likes'),

    # Property Owner Cockpit
    path('api/owner/dashboard/', owner_dashboard_metrics, name='api_owner_dashboard'),

    # Certified Field Broker & Agent Studio
    path('api/agent/dashboard/', agent_dashboard_metrics, name='api_agent_dashboard'),
    path('api/agent/properties/', agent_properties_list, name='api_agent_properties'),
    path('api/agent/properties/<int:pk>/', agent_property_detail, name='api_agent_property_detail'),
    path('api/agent/visits/', agent_visits_list_create, name='api_agent_visits'),
    path('api/agent/visits/<int:pk>/', agent_visit_update, name='api_agent_visit_update'),
    path('api/agent/offers/', agent_offers_list, name='api_agent_offers'),
    path('api/agent/offers/<int:pk>/counter/', agent_offer_counter, name='api_agent_offer_counter'),
    path('api/agent/deals/', agent_deals_pipeline, name='api_agent_deals'),
    path('api/agent/deals/<uuid:pk>/advance/', agent_deal_advance_stage, name='api_agent_deal_advance'),
    path('api/agent/earnings/', agent_earnings_ledger, name='api_agent_earnings'),
    path('api/agent/leads/', agent_leads_list, name='api_agent_leads'),
    path('api/agent/leads/<int:pk>/read/', agent_lead_mark_read, name='api_agent_lead_read'),
    path('api/agent/profile/', agent_profile_manage, name='api_agent_profile'),

    # Buyer & Tenant Consumer Studio
    path('api/consumer/dashboard/', consumer_dashboard_metrics, name='api_consumer_dashboard'),
    path('api/consumer/offers/', consumer_offers_list, name='api_consumer_offers'),
    path('api/consumer/offers/<int:pk>/respond/', consumer_offer_respond, name='api_consumer_offer_respond'),
    path('api/consumer/visits/', consumer_visits_list, name='api_consumer_visits'),
    path('api/consumer/visits/book/', consumer_visit_book, name='api_consumer_visit_book'),
    path('api/consumer/visits/<int:pk>/cancel/', consumer_visit_cancel, name='api_consumer_visit_cancel'),
    path('api/consumer/purchased-assets/', consumer_purchased_assets, name='api_consumer_purchased_assets'),
    path('api/consumer/leases/', consumer_leases_list, name='api_consumer_leases'),
    path('api/consumer/payments/', consumer_rent_payments, name='api_consumer_payments'),
    path('api/consumer/maintenance/', consumer_maintenance_requests, name='api_consumer_maintenance'),
    path('api/consumer/saved-properties/', consumer_saved_properties, name='api_consumer_saved_properties'),
    path('api/consumer/market-trends/', consumer_market_trends, name='api_consumer_market_trends'),
    path('api/consumer/ai-recommendations/', consumer_ai_recommendations, name='api_consumer_ai_recommendations'),
    path('api/tenant/dashboard/', consumer_dashboard_metrics, name='api_tenant_dashboard_legacy'),

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
    path('api/public/platform-stats/', api_platform_stats, name='api_platform_stats'),
    path('api/contact/submit/', api_contact_submit, name='api_contact_submit'),

    # Admin Customer Enquiries
    path('api/admin/enquiries/', admin_enquiries_list, name='api_admin_enquiries'),
    path('api/admin/enquiries/<int:pk>/', admin_enquiry_detail_update, name='api_admin_enquiry_detail'),
    path('api/api/admin/enquiries/', admin_enquiries_list, name='api_api_admin_enquiries_fallback'),
    path('api/api/admin/enquiries/<int:pk>/', admin_enquiry_detail_update, name='api_api_admin_enquiry_detail_fallback'),

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

    # Digital Contract Signing & Sovereign Legal Suite
    path('api/deals/<uuid:pk>/contracts/generate/', generate_deal_contract, name='api_deal_contract_generate'),
    path('api/contracts/<uuid:pk>/', get_contract_detail, name='api_contract_detail'),
    path('api/contracts/<uuid:pk>/send-otp/', send_contract_otp, name='api_contract_send_otp'),
    path('api/contracts/<uuid:pk>/sign/', sign_contract, name='api_contract_sign'),
    path('api/contracts/verify/<str:token>/', verify_contract_public, name='api_contract_verify'),

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

    # Admin User Management APIs (Primary and fallback paths)
    path('api/admin/users/', admin_users_list_create, name='api_admin_users_list_create'),
    path('api/admin/users/<int:pk>/', admin_user_detail_update_delete, name='api_admin_user_detail_update_delete'),
    path('api/admin/users/<int:pk>/set-role/', admin_user_set_role, name='api_admin_user_set_role'),
    path('api/admin/users/<int:pk>/toggle-status/', admin_user_toggle_status, name='api_admin_user_toggle_status'),
    path('api/admin/users/<int:pk>/reset-password/', admin_user_reset_password, name='api_admin_user_reset_password'),

    # Admin Entity Managers CRUD & Inspection APIs
    path('api/admin/properties/', admin_properties_list_create, name='api_admin_properties'),
    path('api/admin/properties/<int:pk>/', admin_property_detail_manage, name='api_admin_property_detail'),
    path('api/admin/properties/<int:pk>/assign-agent/', admin_property_assign_agent, name='api_admin_property_assign_agent'),
    path('api/admin/tenants/', admin_tenants_list_create, name='api_admin_tenants'),
    path('api/admin/tenants/<int:pk>/', admin_tenant_detail_manage, name='api_admin_tenant_detail'),
    path('api/admin/owners/', admin_owners_list_create, name='api_admin_owners'),
    path('api/admin/owners/<int:pk>/', admin_owner_detail_manage, name='api_admin_owner_detail'),
    path('api/admin/sellers/', admin_sellers_list_create, name='api_admin_sellers'),
    path('api/admin/sellers/<int:pk>/', admin_seller_detail_manage, name='api_admin_seller_detail'),
    path('api/admin/agents/', admin_agents_list_create, name='api_admin_agents'),
    path('api/admin/agents/<int:pk>/', admin_agent_detail_manage, name='api_admin_agent_detail'),
    path('api/admin/leases/', admin_leases_list_create, name='api_admin_leases'),
    path('api/admin/leases/<int:pk>/', admin_lease_detail_manage, name='api_admin_lease_detail'),
    path('api/admin/maintenance/', admin_maintenance_list_create, name='api_admin_maintenance'),
    path('api/admin/maintenance/<int:pk>/', admin_maintenance_detail_manage, name='api_admin_maintenance_detail'),
    path('api/admin/listings/<int:pk>/', admin_listing_delete, name='api_admin_listing_delete'),

    # Double-prefix fallback guardrail (ensures requests succeed even if client or proxy appends /api twice)
    path('api/api/admin/users/', admin_users_list_create, name='api_api_admin_users_list_create_fallback'),
    path('api/api/admin/users/<int:pk>/', admin_user_detail_update_delete, name='api_api_admin_user_detail_fallback'),
    path('api/api/admin/users/<int:pk>/set-role/', admin_user_set_role, name='api_api_admin_user_role_fallback'),
    path('api/api/admin/users/<int:pk>/toggle-status/', admin_user_toggle_status, name='api_api_admin_user_status_fallback'),
    path('api/api/admin/users/<int:pk>/reset-password/', admin_user_reset_password, name='api_api_admin_user_pwd_fallback'),
]





