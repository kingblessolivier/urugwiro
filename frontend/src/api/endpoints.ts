import apiClient from './client';

export const api = {
    // Auth
    auth: {
        login: (data: any) => apiClient.post('/auth/login/', data),
        register: (data: any) => apiClient.post('/auth/register/', data),
    },

    // Listings
    listings: {
        list: (params?: any) => apiClient.get('/listings/', { params }),
        detail: (slug: string) => apiClient.get(`/listings/${slug}/`),
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
        users: () => apiClient.get('/admin/users/'),
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
            list: () => apiClient.get('/api/verification/'),
            detail: (id: string) => apiClient.get(`/api/verification/${id}/`),
            review: (id: string, decision: string, notes: string) =>
                apiClient.post(`/api/verification/review/${id}/`, { status: decision, notes }),
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

    // Settings
    settings: {
        get: () => apiClient.get('/system-settings/'),
        update: (data: any) => apiClient.patch('/system-settings/', data),
    },
};
