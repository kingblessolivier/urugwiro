import apiClient from './client';

export const api = {
    // Auth
    auth: {
        login: (data: any) => apiClient.post('/auth/login/', data),
        register: (data: any) => apiClient.post('/auth/register/', data),
        me: () => apiClient.get('/auth/me/'),
        logout: (refresh?: string) => apiClient.post('/auth/logout/', { refresh }),
    },

    // Listings
    listings: {
        list: (params?: any) => apiClient.get('/listings/', { params }),
        detail: (slug: string) => apiClient.get(`/listings/${slug}/`),
        get: (slugOrId: string) => apiClient.get(`/listings/${slugOrId}/`),
        like: (id: string | number, data?: any) => apiClient.post(`/listings/${id}/like/`, data),
        searchIntent: (intent: string) => apiClient.post('/listings/intent/', { intent }),
        visualSearch: (image: File) => {
            const formData = new FormData();
            formData.append('image', image);
            return apiClient.post('/listings/visual-search/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        estimateValuation: (data: any) => apiClient.post('/valuation/estimate/', data),
    },

    // Admin
    admin: {
        users: Object.assign(
            (params?: any) => apiClient.get('/admin/users/', { params }),
            {
                list: (params?: any) => apiClient.get('/admin/users/', { params }),
                create: (data: any) => apiClient.post('/admin/users/', data),
                detail: (id: number | string) => apiClient.get(`/admin/users/${id}/`),
                update: (id: number | string, data: any) => apiClient.patch(`/admin/users/${id}/`, data),
                setRole: (id: number | string, role: string) => apiClient.post(`/admin/users/${id}/set-role/`, { role }),
                toggleStatus: (id: number | string, is_active?: boolean) => apiClient.post(`/admin/users/${id}/toggle-status/`, { is_active }),
                resetPassword: (id: number | string, new_password: string) => apiClient.post(`/admin/users/${id}/reset-password/`, { new_password }),
                delete: (id: number | string) => apiClient.delete(`/admin/users/${id}/`),
            }
        ),
        properties: () => apiClient.get('/admin/properties/'),
        createProperty: (data: any) => apiClient.post('/admin/properties/', data),
        propertyDetail: (id: number | string) => apiClient.get(`/admin/properties/${id}/`),
        updateProperty: (id: number | string, data: any) => apiClient.patch(`/admin/properties/${id}/`, data),
        deleteProperty: (id: number | string) => apiClient.delete(`/admin/properties/${id}/`),
        assignPropertyAgent: (id: number | string, agentId: number | string) => apiClient.post(`/admin/properties/${id}/assign-agent/`, { agent_id: agentId }),

        tenants: () => apiClient.get('/admin/tenants/'),
        createTenant: (data: any) => apiClient.post('/admin/tenants/', data),
        tenantDetail: (id: number | string) => apiClient.get(`/admin/tenants/${id}/`),
        updateTenant: (id: number | string, data: any) => apiClient.patch(`/admin/tenants/${id}/`, data),
        deleteTenant: (id: number | string) => apiClient.delete(`/admin/tenants/${id}/`),

        owners: () => apiClient.get('/admin/owners/'),
        createOwner: (data: any) => apiClient.post('/admin/owners/', data),
        ownerDetail: (id: number | string) => apiClient.get(`/admin/owners/${id}/`),
        updateOwner: (id: number | string, data: any) => apiClient.patch(`/admin/owners/${id}/`, data),
        deleteOwner: (id: number | string) => apiClient.delete(`/admin/owners/${id}/`),

        sellers: () => apiClient.get('/admin/sellers/'),
        createSeller: (data: any) => apiClient.post('/admin/sellers/', data),
        sellerDetail: (id: number | string) => apiClient.get(`/admin/sellers/${id}/`),
        updateSeller: (id: number | string, data: any) => apiClient.patch(`/admin/sellers/${id}/`, data),
        deleteSeller: (id: number | string) => apiClient.delete(`/admin/sellers/${id}/`),

        agents: () => apiClient.get('/admin/agents/'),
        createAgent: (data: any) => apiClient.post('/admin/agents/', data),
        agentDetail: (id: number | string) => apiClient.get(`/admin/agents/${id}/`),
        updateAgent: (id: number | string, data: any) => apiClient.patch(`/admin/agents/${id}/`, data),
        deleteAgent: (id: number | string) => apiClient.delete(`/admin/agents/${id}/`),

        logs: () => apiClient.get('/admin/logs/'),
        announcements: () => apiClient.get('/admin/announcements/'),
        reports: () => apiClient.get('/admin/reports/'),
        enquiries: (params?: { status?: string; search?: string }) => apiClient.get('/admin/enquiries/', { params }),
        updateEnquiry: (id: string | number, data: { status?: string }) => apiClient.patch(`/admin/enquiries/${id}/`, data),
        deleteEnquiry: (id: string | number) => apiClient.delete(`/admin/enquiries/${id}/`),
        visits: () => apiClient.get('/admin/visits/'),
        updateVisit: (id: string | number, data: { status?: string; notes?: string; report?: string }) =>
            apiClient.patch(`/admin/visits/${id}/`, data),
        updateVisitStatus: (id: string | number, data: { status?: string; report?: string; notes?: string }) =>
            apiClient.patch(`/admin/visits/${id}/`, data),
        likes: () => apiClient.get('/admin/likes/'),

        leases: () => apiClient.get('/admin/leases/'),
        createLease: (data: any) => apiClient.post('/admin/leases/', data),
        leaseDetail: (id: number | string) => apiClient.get(`/admin/leases/${id}/`),
        updateLease: (id: number | string, data: any) => apiClient.patch(`/admin/leases/${id}/`, data),
        deleteLease: (id: number | string) => apiClient.delete(`/admin/leases/${id}/`),

        maintenance: () => apiClient.get('/admin/maintenance/'),
        createMaintenance: (data: any) => apiClient.post('/admin/maintenance/', data),
        maintenanceDetail: (id: number | string) => apiClient.get(`/admin/maintenance/${id}/`),
        updateMaintenance: (id: number | string, data: any) => apiClient.patch(`/admin/maintenance/${id}/`, data),
        deleteMaintenance: (id: number | string) => apiClient.delete(`/admin/maintenance/${id}/`),

        deleteListing: (id: number | string) => apiClient.delete(`/admin/listings/${id}/`),
        inbox: () => apiClient.get('/admin/inbox/'),
        verification: {
            list: () => apiClient.get('/verification/'),
            detail: (id: string) => apiClient.get(`/verification/${id}/`),
            review: (id: string, decision: string, notes: string) =>
                apiClient.post(`/verification/review/${id}/`, { status: decision, notes }),
        },
    },

    // Public Platform Data
    public: {
        about: () => apiClient.get('/public/about/'),
        updates: () => apiClient.get('/public/updates/'),
        platformStats: () => apiClient.get('/public/platform-stats/'),
        contactSubmit: (data: { name: string; email: string; phone?: string; message: string; subject?: string; listing_id?: string | number }) =>
            apiClient.post('/contact/submit/', data),
    },

    // Seller Studio & Inventory Management
    seller: {
        dashboard: () => apiClient.get('/seller/dashboard/'),
        listings: (params?: { category?: string; search?: string }) => apiClient.get('/seller/listings/', { params }),
        listingDetail: (id: string | number) => apiClient.get(`/seller/listings/${id}/`),
        updateListing: (id: string | number, data: any) => apiClient.patch(`/seller/listings/${id}/`, data),
        deleteListing: (id: string | number) => apiClient.delete(`/seller/listings/${id}/`),
        toggleStatus: (id: string | number, status?: string) => apiClient.post(`/seller/listings/${id}/status/`, { status }),
        assignAgent: (id: string | number, data: { agent_id: number; notes?: string }) =>
            apiClient.post(`/seller/listings/${id}/assign-agent/`, data),
        deals: () => apiClient.get('/seller/deals/'),
        agents: () => apiClient.get('/seller/agents/'),
        wizard: (data: any) => apiClient.post('/seller/listings/create/', data),
        generateNarrative: (data: any) => apiClient.post('/seller/ai/generate-narrative/', data),
        offers: () => apiClient.get('/seller/offers/'),
        inquiries: () => apiClient.get('/seller/inquiries/'),
        inquiryDetail: (id: string | number) => apiClient.get(`/seller/inquiries/${id}/`),
        updateInquiry: (id: string | number, data: any) => apiClient.patch(`/seller/inquiries/${id}/`, data),
        deleteInquiry: (id: string | number) => apiClient.delete(`/seller/inquiries/${id}/`),
        visits: () => apiClient.get('/seller/visits/'),
        updateVisit: (id: string | number, data: { status?: string; notes?: string; report?: string }) =>
            apiClient.patch(`/seller/visits/${id}/`, data),
        likes: () => apiClient.get('/seller/likes/'),
        respondOffer: (id: string | number, action: string, amount?: string | number) =>
            apiClient.post(`/seller/offers/${id}/respond/`, { action, amount }),
    },

    // Certified Field Broker & Agent Studio
    agent: {
        dashboard: () => apiClient.get('/agent/dashboard/'),
        properties: (params?: any) => apiClient.get('/agent/properties/', { params }),
        propertyDetail: (id: string | number) => apiClient.get(`/agent/properties/${id}/`),
        visits: (params?: any) => apiClient.get('/agent/visits/', { params }),
        createVisit: (data: any) => apiClient.post('/agent/visits/', data),
        updateVisit: (id: string | number, data: { status?: string; report?: string; notes?: string }) =>
            apiClient.patch(`/agent/visits/${id}/`, data),
        offers: (params?: any) => apiClient.get('/agent/offers/', { params }),
        counterOffer: (id: string | number, data: { action: string; counter_amount?: number; notes?: string }) =>
            apiClient.post(`/agent/offers/${id}/counter/`, data),
        deals: (params?: any) => apiClient.get('/agent/deals/', { params }),
        advanceDeal: (id: string, data: { next_stage?: string; notes?: string; irembo_bill_id?: string; escrow_status?: string }) =>
            apiClient.post(`/agent/deals/${id}/advance/`, data),
        earnings: () => apiClient.get('/agent/earnings/'),
        leads: () => apiClient.get('/agent/leads/'),
        markLeadRead: (id: string | number) => apiClient.post(`/agent/leads/${id}/read/`),
        profile: () => apiClient.get('/agent/profile/'),
        updateProfile: (data: any) => apiClient.put('/agent/profile/', data),
    },

    // Owner
    owner: {
        dashboard: () => apiClient.get('/owner/dashboard/'),
        maintenance: () => apiClient.get('/owner/maintenance/'),
        updateMaintenance: (id: string, status: string) => apiClient.patch(`/owner/maintenance/${id}/`, { status }),
    },

    // Tenant (Legacy and compatibility)
    tenant: {
        dashboard: () => apiClient.get('/consumer/dashboard/'),
        maintenance: (data: any) => apiClient.post('/consumer/maintenance/', data),
        messages: () => apiClient.get('/tenant/messages/'),
    },

    // Buyer & Tenant (Consumer) Studio
    consumer: {
        dashboard: () => apiClient.get('/consumer/dashboard/'),
        offers: () => apiClient.get('/consumer/offers/'),
        respondOffer: (id: number | string, data: { action: 'accept' | 're_counter' | 'withdraw'; new_amount?: number; message?: string }) =>
            apiClient.post(`/consumer/offers/${id}/respond/`, data),
        visits: () => apiClient.get('/consumer/visits/'),
        bookVisit: (data: { listing_id: number | string; scheduled_date: string; notes?: string }) =>
            apiClient.post('/consumer/visits/book/', data),
        cancelVisit: (id: number | string) => apiClient.post(`/consumer/visits/${id}/cancel/`),
        purchasedAssets: () => apiClient.get('/consumer/purchased-assets/'),
        leases: () => apiClient.get('/consumer/leases/'),
        payments: () => apiClient.get('/consumer/payments/'),
        payRent: (data: { amount: number; payment_method: 'momo' | 'airtel' | 'card'; phone_number?: string; lease_id?: number | string }) =>
            apiClient.post('/consumer/payments/', data),
        maintenanceRequests: () => apiClient.get('/consumer/maintenance/'),
        createMaintenance: (data: { title: string; description: string; listing_id?: number | string }) =>
            apiClient.post('/consumer/maintenance/', data),
        savedProperties: () => apiClient.get('/consumer/saved-properties/'),
        marketTrends: () => apiClient.get('/consumer/market-trends/'),
        aiRecommendations: (data?: { purpose?: string; category?: string; max_budget?: number; district?: string }) =>
            apiClient.post('/consumer/ai-recommendations/', data || {}),
    },

    // Deals & Transaction Pipeline
    deals: {
        list: () => apiClient.get('/deals/'),
        get: (id: string) => apiClient.get(`/deals/${id}/`),
        create: (data: any) => apiClient.post('/deals/', data),
        advanceStage: (id: string, data: { next_stage?: string; notes?: string; escrow_status?: string; irembo_bill_id?: string }) =>
            apiClient.post(`/deals/${id}/advance-stage/`, data),
        uploadDocument: (id: string, formData: FormData) =>
            apiClient.post(`/deals/${id}/upload-document/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
    },

    // Digital Contracts & Sovereign Closing Suite
    contracts: {
        generate: (dealId: string, data?: { contract_type?: string; custom_terms?: string; requires_spousal_consent?: boolean }) =>
            apiClient.post(`/deals/${dealId}/contracts/generate/`, data || {}),
        get: (contractId: string) => apiClient.get(`/contracts/${contractId}/`),
        sendOtp: (contractId: string, role: string) => apiClient.post(`/contracts/${contractId}/send-otp/`, { role }),
        sign: (contractId: string, payload: { role: string; signature_data: string; signature_type?: string; otp_code: string }) =>
            apiClient.post(`/contracts/${contractId}/sign/`, payload),
        verify: (token: string) => apiClient.get(`/contracts/verify/${token}/`),
    },

    // Offers & Negotiations
    offers: {
        list: (params?: any) => apiClient.get('/offers/', { params }),
        create: (data: any) => apiClient.post('/offers/', data),
        updateStatus: (id: number | string, data: { status: 'accepted' | 'rejected' | 'countered'; counter_amount?: number }) =>
            apiClient.post(`/offers/${id}/status/`, data),
    },

    // Site Visits & Showings
    visits: {
        list: () => apiClient.get('/visits/'),
        create: (data: any) => apiClient.post('/visits/', data),
        updateStatus: (id: number | string, data: { status?: string; report?: string }) =>
            apiClient.post(`/visits/${id}/status/`, data),
    },

    // NVIDIA AI Automations
    ai: {
        testConnection: (apiKey?: string, model?: string) => apiClient.post('/ai/test-connection/', { api_key: apiKey, model }),
        analyzeOffer: (listingId: string | number, amount: number) =>
            apiClient.post('/ai/analyze-offer/', { listing_id: listingId, amount }),
        verifyMilestone: (dealId: string, docType: string, extractedText: string) =>
            apiClient.post('/ai/verify-milestone/', { deal_id: dealId, document_type: docType, extracted_text: extractedText }),
        chat: (messages: Array<{ role: string; content: string }>, context = 'public', propertyContext?: any) =>
            apiClient.post('/ai/chat/', { messages, context, property_context: propertyContext }),
    },

    // Settings
    settings: {
        get: () => apiClient.get('/system/settings/'),
        update: (data: any) => apiClient.post('/system/settings/', data),
    },

    // Real-Time Chat & Sovereign Communications
    chat: {
        contacts: () => apiClient.get('/chat/contacts/'),
        history: (contactId: number | string, sinceId?: number) =>
            apiClient.get(`/chat/history/${contactId}/`, { params: sinceId ? { since_id: sinceId } : undefined }),
        send: (toId: number | string, content: string) =>
            apiClient.post('/chat/send/', { to_id: toId, content }),
        newUsers: (query?: string) => apiClient.get('/chat/new-users/', { params: query ? { q: query } : undefined }),
    },

    // Asset Proposals & Physical Inspection Intake
    proposals: {
        create: (data: any) => apiClient.post('/proposals/', data),
        list: (params?: { status?: string; search?: string }) => apiClient.get('/proposals/', { params }),
        get: (id: number | string) => apiClient.get(`/proposals/${id}/`),
        update: (id: number | string, data: any) => apiClient.patch(`/proposals/${id}/`, data),
        convert: (id: number | string) => apiClient.post(`/proposals/${id}/convert/`),
    },

    // Sovereign Reports & CSV Exports
    reports: {
        exportUrl: (reportType: string) => `/api/reports/export/${reportType}/`,
    },
};


