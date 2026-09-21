# Urugwiro Template Migration Tracker

This document tracks the transition from legacy Django HTML templates to the React "Black Edition" frontend.

**Migration Rule**: 
1. Implement React Page $\rightarrow$ 2. Implement DRF Endpoint/View $\rightarrow$ 3. Delete Legacy Template/View.

## 1. Public Discovery (Phase 1)
- [x] `home/explore.html` $\rightarrow$ `DiscoveryPage.tsx`
- [x] `home/sale_listings.html` $\rightarrow$ `DiscoveryPage.tsx`
- [x] `home/listing_detail.html` $\rightarrow$ `ListingDetail.tsx` (In progress)
- [x] `home/details.html` $\rightarrow$ `ListingDetail.tsx` (In progress)

## 2. Authentication Module
- [x] `home/Login.html` $\rightarrow$ `LoginPage.tsx`
- [x] `home/Register.html` $\rightarrow$ `RegisterPage.tsx`

## 3. Public Information
- [x] `home/about.html` $\rightarrow$ `AboutPage.tsx`
- [x] `home/contact.html` $\rightarrow$ `ContactPage.tsx`
- [x] `home/updates.html` $\rightarrow$ `UpdatesPage.tsx`

## 4. Admin Command Center
- [x] `admin/admin_base/dashboard.html` $\rightarrow$ `AdminHub.tsx`
- [x] `admin/marketplace/sale_properties.html` $\rightarrow$ `AdminPropertyManager.tsx`
- [x] `admin/users/users.html` $\rightarrow$ `AdminUserManager.tsx`
- [x] `admin/tenants/tenants.html` $\rightarrow$ `AdminTenantManager.tsx`
- [x] `admin/owners/owners.html` $\rightarrow$ `AdminOwnerManager.tsx`
- [x] `admin/marketplace/agents.html` $\rightarrow$ `AdminAgentManager.tsx`
- [x] `admin/marketplace/sellers.html` $\rightarrow$ `AdminSellerManager.tsx`
- [x] `admin/system_logs/system_logs.html` $\rightarrow$ `SystemLogsPage.tsx`
- [x] `admin/announcements/announcements.html` $\rightarrow$ `AnnouncementManager.tsx`
- [x] `admin/reports/reports.html` $\rightarrow$ `AdminReports.tsx`
- [x] `admin/Customer_Enquires/customer_enquires.html` $\rightarrow$ `EnquiryManager.tsx`
- [x] `admin/Leases/leases.html` $\rightarrow$ `AdminLeaseManager.tsx`
- [x] `admin/maintenance/admin_maintenance.html` $\rightarrow$ `AdminMaintenance.tsx`
- [x] `admin/messages/admin_inbox.html` $\rightarrow$ `AdminInbox.tsx`

## 5. Agent Dashboard
- [x] `Others_dashboard/agents/agent_dashboard.html` $\rightarrow$ `AgentLaunchpad.tsx`
- [x] `Others_dashboard/agents/agent_properties.html` $\rightarrow$ `AgentPropertyManager.tsx`
- [x] `Others_dashboard/agents/agent_visits.html` $\rightarrow$ `AgentVisitKanban.tsx`
- [x] `Others_dashboard/agents/agent_offers.html` $\rightarrow$ `AgentOfferManager.tsx`
- [ ] `Others_dashboard/agents/schedule_visit.html` $\rightarrow$ `ScheduleVisitModal.tsx`

## 6. Seller/Owner Dashboard
- [x] `Others_dashboard/sellers/seller_dashboard.html` $\rightarrow$ `SellerLaunchpad.tsx`
- [x] `Others_dashboard/sellers/seller_add_property.html` $\rightarrow$ `ListingWizard.tsx`
- [x] `Others_dashboard/sellers/seller_edit_property.html` $\rightarrow$ `ListingWizard.tsx`
- [ ] `Others_dashboard/sellers/seller_offers.html` $\rightarrow$ `SellerOfferManager.tsx`
- [x] `Others_dashboard/sellers/seller_inquiries.html` $\rightarrow$ `SellerInquiryManager.tsx`
- [x] `Others_dashboard/owners/owner_dashboard.html` $\rightarrow$ `OwnerLaunchpad.tsx`
- [x] `Others_dashboard/owners/owner_maintenance.html` $\rightarrow$ `OwnerMaintenance.tsx`

## 7. Tenant Portal
- [ ] `Others_dashboard/Tenants/tenant_dashboard.html` $\rightarrow$ `TenantLaunchpad.tsx`
- [ ] `Others_dashboard/Tenants/tenant_maintenance.html` $\rightarrow$ `TenantMaintenance.tsx`
- [ ] `Others_dashboard/Tenants/new_maintenance_request.html` $\rightarrow$ `MaintenanceRequestModal.tsx`
- [ ] `Others_dashboard/Tenants/tenant_messages.html` $\rightarrow$ `TenantMessages.tsx`

## 8. Social & Notifications
- [ ] `social/feed.html` $\rightarrow$ `SocialFeedPage.tsx`
- [ ] `social/post_detail.html` $\rightarrow$ `PostDetailPage.tsx`
- [ ] `notifications/notifications.html` $\rightarrow$ `NotificationCenter.tsx`
