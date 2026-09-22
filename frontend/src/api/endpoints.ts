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
        like: (id: string) => apiClient.post(`/listings/${id}/like/`),
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
        tenants: () => apiClient.get('/admin/tenants/'),
        owners: () => apiClient.get('/admin/owners/'),
        agents: () => apiClient.get('/admin/agents/'),
        sellers: () => apiClient.get('/admin/sellers/'),
        logs: () => apiClient.get('/admin/logs/'),
        announcements: () => apiClient.get('/admin/announcements/'),
        reports: () => apiClient.get('/admin/reports/'),
        enquiries: () => apiClient.get('/admin/enquiries/'),
        leases: () => apiClient.get('/admin/leases/'),
        maintenance: () => apiClient.get('/admin/maintenance/'),
        inbox: () => apiClient.get('/admin/inbox/'),
        verification: {
            list: () => apiClient.get('/verification/'),
            detail: (id: string) => apiClient.get(`/verification/${id}/`),
            review: (id: string, decision: string, notes: string) =>
                apiClient.post(`/verification/review/${id}/`, { status: decision, notes }),
        },
    },

    // Agent
    agent: {
        dashboard: () => apiClient.get('/agent/dashboard/'),
        properties: () => apiClient.get('/agent/properties/'),
        visits: () => apiClient.get('/agent/visits/'),
        offers: () => apiClient.get('/agent/offers/'),
        updateVisit: (id: string, status: string) => apiClient.patch(`/agent/visits/${id}/`, { status }),
    },

    // Seller
    seller: {
        dashboard: () => apiClient.get('/seller/dashboard/'),
        wizard: (data: any) => apiClient.post('/seller/listings/create/', data),
        generateNarrative: (data: any) => apiClient.post('/seller/ai/generate-narrative/', data),
        offers: () => apiClient.get('/seller/offers/'),
        inquiries: () => apiClient.get('/seller/inquiries/'),
        respondOffer: (id: string, action: string, amount?: string) =>
            apiClient.post(`/seller/offers/${id}/respond/`, { action, amount }),
    },

    // Owner
    owner: {
        dashboard: () => apiClient.get('/owner/dashboard/'),
        maintenance: () => apiClient.get('/owner/maintenance/'),
        updateMaintenance: (id: string, status: string) => apiClient.patch(`/owner/maintenance/${id}/`, { status }),
    },

    // Tenant
    tenant: {
        dashboard: () => apiClient.get('/tenant/dashboard/'),
        maintenance: (data: any) => apiClient.post('/tenant/maintenance/create/', data),
        messages: () => apiClient.get('/tenant/messages/'),
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


