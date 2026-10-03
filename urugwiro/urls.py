from django.urls import path
from . import api_views
from . import views

urlpatterns = [
    # ─── Health check & Root ───
    path('', api_views.health_check, name='root_health'),
    path('api/', api_views.health_check, name='api_root_health'),
    path('api/health/', api_views.health_check, name='api_health'),
    path('api/ready/', api_views.readiness_check, name='api_ready'),
    path('health/', api_views.health_check, name='health'),

    # ─── Auth & Profile ───
    path('api/auth/login/', api_views.api_login, name='api_login'),
    path('api/auth/register/', api_views.api_register, name='api_register'),
    path('api/auth/me/', api_views.api_me, name='api_me'),
    path('api/auth/logout/', api_views.api_logout, name='api_logout'),
    path('api/notifications/', api_views.notifications_list, name='api_notifications'),
    path('api/notifications/read-all/', api_views.notifications_mark_all_read, name='api_notifications_read_all'),
    path('api/notifications/<int:pk>/read/', api_views.notification_mark_read, name='api_notification_read'),

    # ─── Public Listings ───
    path('api/listings/', api_views.ListingListView.as_view(), name='api_listings'),
    path('api/listings/search-intent/', api_views.listing_search_intent, name='api_listing_search_intent'),
    path('api/listings/visual-search/', api_views.visual_search, name='api_visual_search'),
    path('api/listings/<int:pk>/', api_views.ListingDetailView.as_view(), name='api_listing_detail'),
    path('api/listings/<slug:slug>/', api_views.ListingDetailView.as_view(), name='api_listing_detail_slug'),
    path('api/listings/<int:pk>/like/', api_views.toggle_like, name='api_listing_like'),
    path('api/listings/<int:pk>/reviews/', api_views.listing_reviews, name='api_listing_reviews'),
    path('api/listings/<int:pk>/verify/', api_views.submit_verification_docs, name='api_listing_verify'),
    path('api/listings/<int:pk>/audit/', api_views.listing_audit_log, name='api_listing_audit'),

    # ─── Public Content ───
    path('api/articles/', api_views.get_land_articles, name='api_articles'),
    path('api/articles/categories/', api_views.get_article_categories, name='api_article_categories'),
    path('api/articles/<slug:slug>/', api_views.get_article_detail, name='api_article_detail'),
    path('api/about/', api_views.api_about, name='api_about'),
    path('api/contact/submit/', api_views.api_contact_submit, name='api_contact_submit'),
    path('api/updates/', api_views.api_public_updates, name='api_public_updates'),
    path('api/announcements/', api_views.api_public_announcements, name='api_public_announcements'),
    path('api/platform-stats/', api_views.api_platform_stats, name='api_platform_stats'),
    path('api/valuation/estimate/', api_views.valuation_estimate, name='api_valuation'),
    path('api/ai/listing-narrative/', api_views.ai_listing_narrative, name='api_ai_listing_narrative'),
    path('api/ai/offer-analysis/', api_views.ai_offer_analysis, name='api_ai_offer_analysis'),

    # ─── Proposals (Public Intake) ───
    path('api/proposals/', api_views.api_proposals_view, name='api_proposals'),
    path('api/proposals/<int:pk>/', api_views.api_proposal_detail_view, name='api_proposal_detail'),
    path('api/proposals/<int:pk>/convert/', api_views.api_convert_proposal_to_listing, name='api_convert_proposal'),

    # ─── Consumer Dashboard ───
    path('api/consumer/dashboard/', api_views.consumer_dashboard_metrics, name='api_consumer_dashboard'),
    path('api/consumer/offers/', api_views.consumer_offers_list, name='api_consumer_offers'),
    path('api/consumer/visits/', api_views.consumer_visits_list, name='api_consumer_visits'),
    path('api/consumer/visits/book/', api_views.consumer_visit_book, name='api_consumer_visit_book'),
    path('api/consumer/visits/<int:pk>/cancel/', api_views.consumer_visit_cancel, name='api_consumer_visit_cancel'),
    path('api/consumer/saved-properties/', api_views.consumer_saved_properties, name='api_consumer_saved'),

    # ─── Seller Dashboard ───
    path('api/seller/listings/', api_views.seller_listings_list, name='api_seller_listings'),
    path('api/seller/listings/create/', api_views.seller_create_listing, name='api_seller_listing_create'),
    path('api/seller/listings/<int:pk>/', api_views.seller_listing_detail_manage, name='api_seller_listing_manage'),
    path('api/seller/listings/<int:pk>/status/', api_views.seller_listing_toggle_status, name='api_seller_listing_status'),
    path('api/seller/listings/<int:pk>/media/', api_views.seller_upload_listing_media, name='api_seller_media_upload'),
    path('api/seller/media/<int:pk>/', api_views.seller_manage_listing_media, name='api_seller_media_manage'),
    path('api/seller/reviews/', api_views.seller_reviews, name='api_seller_reviews'),
    path('api/seller/offers/', api_views.seller_offers_list, name='api_seller_offers'),
    path('api/seller/offers/<int:pk>/respond/', api_views.seller_offer_respond, name='api_seller_offer_respond'),
    path('api/seller/inquiries/', api_views.seller_inquiries_list, name='api_seller_inquiries'),
    path('api/seller/inquiries/<int:pk>/', api_views.seller_inquiry_detail, name='api_seller_inquiry_detail'),
    path('api/seller/visits/', api_views.seller_visits_list, name='api_seller_visits'),
    path('api/seller/visits/<int:pk>/', api_views.seller_visit_update, name='api_seller_visit_update'),
    path('api/seller/likes/', api_views.seller_likes_list, name='api_seller_likes'),
    path('api/seller/conversations/', api_views.seller_conversations_list, name='api_seller_conversations'),
    path('api/seller/conversations/<uuid:pk>/', api_views.seller_conversation_detail, name='api_seller_conversation_detail'),
    path('api/seller/conversations/<uuid:pk>/events/', api_views.seller_conversation_add_event, name='api_seller_conversation_add_event'),
    path('api/seller/earnings/', api_views.seller_earnings, name='api_seller_earnings'),


    # ─── Owner Dashboard ───
    path('api/owner/dashboard/', api_views.owner_dashboard_metrics, name='api_owner_dashboard'),

    # ─── Admin: Verification ───
    path('api/admin/verification/', api_views.list_verification_requests, name='api_admin_verification'),
    path('api/admin/verification/<int:pk>/', api_views.get_verification_request_detail, name='api_admin_verification_detail'),
    path('api/admin/verification/review/<int:doc_id>/', api_views.admin_review_document, name='api_admin_verification_review'),

    # ─── Admin: Listings ───
    path('api/admin/properties/', api_views.admin_properties_list_create, name='api_admin_properties'),
    path('api/admin/properties/<int:pk>/', api_views.admin_property_detail_manage, name='api_admin_property_detail'),
    path('api/admin/properties/<int:pk>/media/', api_views.admin_upload_listing_media, name='api_admin_media_upload'),
    path('api/admin/media/<int:pk>/', api_views.admin_manage_listing_media, name='api_admin_media_manage'),
    path('api/admin/listings/<int:pk>/', api_views.admin_listing_delete, name='api_admin_listing_delete'),

    # ─── Admin: Users ───
    path('api/admin/users/', api_views.admin_users_list_create, name='api_admin_users'),
    path('api/admin/users/<int:pk>/', api_views.admin_user_detail_update_delete, name='api_admin_user_detail'),
    path('api/admin/users/<int:pk>/set-role/', api_views.admin_user_set_role, name='api_admin_user_role'),
    path('api/admin/users/<int:pk>/toggle-status/', api_views.admin_user_toggle_status, name='api_admin_user_toggle'),
    path('api/admin/users/<int:pk>/reset-password/', api_views.admin_user_reset_password, name='api_admin_user_pwd'),

    # ─── Admin: Sellers ───
    path('api/admin/sellers/', api_views.admin_sellers_list_create, name='api_admin_sellers'),
    path('api/admin/sellers/<int:pk>/', api_views.admin_seller_detail_manage, name='api_admin_seller_detail'),

    # ─── Admin: Enquiries ───
    path('api/admin/enquiries/', api_views.admin_enquiries_list, name='api_admin_enquiries'),
    path('api/admin/enquiries/<int:pk>/', api_views.admin_enquiry_detail_update, name='api_admin_enquiry_detail'),

    # ─── Admin: CRM ───
    path('api/admin/customers/', api_views.admin_customers_list, name='api_admin_customers'),
    path('api/admin/customers/<uuid:pk>/', api_views.admin_customer_detail, name='api_admin_customer_detail'),
    path('api/admin/conversations/', api_views.admin_conversations_list, name='api_admin_conversations'),
    path('api/admin/conversations/<uuid:pk>/', api_views.admin_conversation_detail, name='api_admin_conversation_detail'),
    path('api/admin/conversations/<uuid:pk>/events/', api_views.admin_conversation_add_event, name='api_admin_conversation_event'),
    path('api/admin/follow-ups/', api_views.admin_follow_ups_list, name='api_admin_follow_ups'),
    path('api/admin/follow-ups/<int:pk>/', api_views.admin_follow_up_detail, name='api_admin_follow_up_detail'),

    # ─── Admin: Financial ───
    path('api/admin/offers/', api_views.list_create_offers, name='api_admin_offers'),
    path('api/admin/offers/<int:pk>/', api_views.update_offer_status, name='api_admin_offer_update'),
    path('api/admin/visits/', api_views.admin_visits_list, name='api_admin_visits'),
    path('api/admin/visits/<int:pk>/', api_views.admin_visit_detail_update, name='api_admin_visit_detail'),
    path('api/admin/likes/', api_views.admin_likes_list, name='api_admin_likes'),
    path('api/admin/transactions/', api_views.admin_transactions_list, name='api_admin_transactions'),
    path('api/admin/transactions/<uuid:pk>/', api_views.admin_transaction_detail, name='api_admin_transaction_detail'),
    path('api/admin/seller-payments/', api_views.admin_seller_payments_list, name='api_admin_seller_payments'),
    path('api/admin/seller-payments/<uuid:pk>/', api_views.admin_seller_payment_detail, name='api_admin_seller_payment_detail'),
    path('api/admin/commission-rules/', api_views.admin_commission_rules_list, name='api_admin_commission_rules'),
    path('api/admin/commission-rules/<int:pk>/', api_views.admin_commission_rule_detail, name='api_admin_commission_rule_detail'),
    path('api/admin/expenses/', api_views.admin_expenses_list, name='api_admin_expenses'),
    path('api/admin/expenses/<int:pk>/', api_views.admin_expense_detail, name='api_admin_expense_detail'),

    # ─── Admin: System ───
    path('api/admin/settings/', api_views.manage_system_settings, name='api_admin_settings'),
    path('api/admin/settings/test-ai/', api_views.test_system_ai_connection, name='api_admin_test_ai'),
    path('api/admin/system-logs/', api_views.manage_system_logs, name='api_admin_system_logs'),
    path('api/admin/announcements/', api_views.manage_announcements, name='api_admin_announcements'),
    path('api/admin/announcements/<int:pk>/', api_views.manage_announcement_detail, name='api_admin_announcement_detail'),

    # ─── Chat ───
    path('api/chat/contacts/', views.chat_contacts_api, name='api_chat_contacts'),
    path('api/chat/history/<int:contact_id>/', views.chat_history_api, name='api_chat_history'),
    path('api/chat/send/', views.chat_send_api, name='api_chat_send'),
    path('api/chat/new-users/', views.chat_new_users_api, name='api_chat_new_users'),

    # ─── Reports ───
    path('api/reports/summary/', api_views.admin_report_summary, name='api_reports_summary'),
    path('api/reports/export/<str:report_type>/', views.admin_reports_export, name='api_reports_export'),
]
