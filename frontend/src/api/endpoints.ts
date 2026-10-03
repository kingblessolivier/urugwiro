import apiClient from './client';
import type { Listing, Review, ReviewSummary, Offer, AIAnalysisResult, PaginatedResponse, ListingsListParams } from '../types';
import type { ListingCategory, ListingPurpose } from '../types/listing';

export const api = {
    // Auth
    auth: {
        login: (data: { username?: string; email?: string; password: string }) => apiClient.post('/auth/login/', data),
        register: (data: { username?: string; email: string; password: string; role?: string; full_name?: string; first_name?: string; last_name?: string; phone_number?: string }) => apiClient.post('/auth/register/', data),
        me: () => apiClient.get('/auth/me/'),
        logout: (refresh?: string) => apiClient.post('/auth/logout/', { refresh }),
    },

    notifications: {
        list: () => apiClient.get('/notifications/'),
        markRead: (id: number | string) => apiClient.post(`/notifications/${id}/read/`),
        markAllRead: () => apiClient.post('/notifications/read-all/'),
    },

    // Public Listings
    listings: {
        list: (params?: ListingsListParams) => apiClient.get<PaginatedResponse<Listing>>('/listings/', { params }),
        detail: (slugOrId: string | number) => apiClient.get<Listing>(`/listings/${slugOrId}/`),
        get: (slugOrId: string | number) => apiClient.get<Listing>(`/listings/${slugOrId}/`),
        like: (id: string | number, data?: { name?: string; phone?: string; email?: string }) => apiClient.post<{ liked: boolean; total_likes: number }>(`/listings/${id}/like/`, data),
        estimateValuation: (data: { category: ListingCategory; purpose: ListingPurpose; currency?: string; rental_frequency?: 'per_day' | 'per_month' | 'per_year'; province?: string; district?: string; sector?: string; bedrooms?: number; bathrooms?: number; area_sqm?: number }) => apiClient.post<{ estimated_value: number | null; low_range: number | null; high_range: number | null; currency: string; confidence: 'high' | 'medium' | 'low' | 'insufficient_data'; method: string; comparables_count: number; limitations: string[] }>('/valuation/estimate/', data),
        reviews: (id: string | number) => apiClient.get<ReviewSummary>(`/listings/${id}/reviews/`),
        submitReview: (id: string | number, data: { rating: number; comment?: string; reviewer_name?: string }) =>
            apiClient.post<Review>(`/listings/${id}/reviews/`, data),
        deleteReview: (reviewId: string | number) => apiClient.delete(`/reviews/${reviewId}/`),
        audit: (id: string | number) => apiClient.get(`/listings/${id}/audit/`),
        searchIntent: (intent: string) => apiClient.get<{ filters: Record<string, string | string[] | number | boolean | undefined> }>('/listings/search-intent/', { params: { q: intent } }),
        visualSearch: (image: File) => apiClient.post<{ listings: Listing[] }>('/listings/visual-search/', { image }, { headers: { 'Content-Type': 'multipart/form-data' } }),
    },

    // Public Platform Data
    public: {
        about: () => apiClient.get('/about/'),
        updates: () => apiClient.get('/updates/'),
        announcements: () => apiClient.get('/announcements/'),
        platformStats: () => apiClient.get('/platform-stats/'),
        contactSubmit: (data: { name: string; email: string; phone?: string; message: string; subject?: string; listing_id?: string | number }) =>
            apiClient.post('/contact/submit/', data),
        articles: () => apiClient.get('/articles/'),
        articleCategories: () => apiClient.get('/articles/categories/'),
        articleDetail: (slug: string) => apiClient.get(`/articles/${slug}/`),
    },

    // Proposals / Intake
    proposals: {
        create: (data: Record<string, unknown>) => apiClient.post('/proposals/', data),
        list: (params?: { status?: string; search?: string }) => apiClient.get('/proposals/', { params }),
        get: (id: number | string) => apiClient.get(`/proposals/${id}/`),
        update: (id: number | string, data: Record<string, unknown>) => apiClient.patch(`/proposals/${id}/`, data),
        convert: (id: number | string) => apiClient.post(`/proposals/${id}/convert/`),
    },

    // Consumer / Buyer
    consumer: {
        dashboard: () => apiClient.get('/consumer/dashboard/'),
        offers: () => apiClient.get('/consumer/offers/'),
        visits: () => apiClient.get('/consumer/visits/'),
        bookVisit: (data: { listing_id: number | string; scheduled_date?: string; preferred_date?: string; notes?: string }) =>
            apiClient.post('/consumer/visits/book/', data),
        cancelVisit: (id: number | string) => apiClient.post(`/consumer/visits/${id}/cancel/`),
        savedProperties: () => apiClient.get<PaginatedResponse<Listing>>('/consumer/saved-properties/'),
    },

    // Offers (Convenience alias)
    offers: {
        list: (params?: Record<string, string>) => apiClient.get<Offer[]>('/admin/offers/', { params }),
        create: (data: { listing: number | string; amount: number; notes?: string }) => apiClient.post<Offer>('/admin/offers/', data),
        updateStatus: (id: number | string, data: { status: string; counter_amount?: number; offered_amount?: number; message?: string }) => apiClient.put<Offer>(`/admin/offers/${id}/`, data),
    },

    // Visits (Convenience alias)
    visits: {
        list: (params?: Record<string, string>) => apiClient.get('/admin/visits/', { params }),
        create: (data: { listing_id: number | string; name: string; phone: string; scheduled_date: string; scheduled_time: string }) => apiClient.post('/consumer/visits/book/', data),
        updateStatus: (id: number | string, data: { status?: string; notes?: string; report?: string }) => apiClient.put(`/admin/visits/${id}/`, data),
    },

    // Deals (Convenience alias)
    deals: {
        list: (params?: Record<string, string>) => apiClient.get('/admin/transactions/', { params }),
    },

    // Seller Studio & Inventory Management
    seller: {
        dashboard: () => apiClient.get('/seller/listings/'),
        listings: (params?: { category?: string; search?: string }) => apiClient.get<Listing[]>('/seller/listings/', { params }),
        createListing: (data: FormData) => apiClient.post('/seller/listings/create/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
        wizard: (data: FormData) => apiClient.post('/seller/listings/create/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
        listingDetail: (id: string | number) => apiClient.get<Listing>(`/seller/listings/${id}/`),
        updateListing: (id: string | number, data: Record<string, unknown>) => apiClient.put(`/seller/listings/${id}/`, data),
        deleteListing: (id: string | number) => apiClient.delete(`/seller/listings/${id}/`),
        toggleStatus: (id: string | number, status?: string) => apiClient.post(`/seller/listings/${id}/status/`, { status }),
        uploadMedia: (listingId: string | number, formData: FormData) =>
            apiClient.post(`/seller/listings/${listingId}/media/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        deleteMedia: (mediaId: string | number) => apiClient.delete(`/seller/media/${mediaId}/`),
        updateMedia: (id: string | number, data: Record<string, unknown>) => apiClient.put(`/seller/media/${id}/`, data),
        reviews: () => apiClient.get('/seller/reviews/'),
        offers: () => apiClient.get<Offer[]>('/seller/offers/'),
        respondOffer: (id: string | number, action: string, amount?: string | number) =>
            apiClient.post(`/seller/offers/${id}/respond/`, { action, amount }),
        inquiries: (params?: Record<string, string>) => apiClient.get('/seller/inquiries/', { params }),
        inquiryDetail: (id: string | number) => apiClient.get(`/seller/inquiries/${id}/`),
        updateInquiry: (id: string | number, data: Record<string, unknown>) => apiClient.put(`/seller/inquiries/${id}/`, data),
        deleteInquiry: (id: string | number) => apiClient.delete(`/seller/inquiries/${id}/`),
        visits: (params?: Record<string, string>) => apiClient.get('/seller/visits/', { params }),
        updateVisit: (id: string | number, data: { status?: string; notes?: string; report?: string }) =>
            apiClient.put(`/seller/visits/${id}/`, data),
        likes: () => apiClient.get('/seller/likes/'),
        conversations: () => apiClient.get('/seller/conversations/'),
        conversationDetail: (id: string) => apiClient.get(`/seller/conversations/${id}/`),
        addConversationEvent: (id: string, data: Record<string, unknown>) => apiClient.post(`/seller/conversations/${id}/events/`, data),
        earnings: () => apiClient.get('/seller/earnings/'),
        assignAgent: (id: string | number, data: { agent_id: number | string }) => apiClient.post(`/seller/listings/${id}/assign-agent/`, data),
        generateNarrative: (data: { title: string; category: string; subType: string; city: string; district: string; price: string; description?: string }) =>
            apiClient.post('/ai/listing-narrative/', data),
    },

    // Owner Executive Dashboard
    owner: {
        dashboard: () => apiClient.get('/owner/dashboard/'),
    },

    // Admin & Staff Operations
    admin: {
        // Users
        users: Object.assign(
            (params?: Record<string, string>) => apiClient.get('/admin/users/', { params }),
            {
                list: (params?: Record<string, string | number>) => apiClient.get('/admin/users/', { params }),
                create: (data: Record<string, unknown>) => apiClient.post('/admin/users/', data),
                detail: (id: number | string) => apiClient.get(`/admin/users/${id}/`),
                update: (id: number | string, data: Record<string, unknown>) => apiClient.patch(`/admin/users/${id}/`, data),
                setRole: (id: number | string, role: string) => apiClient.post(`/admin/users/${id}/set-role/`, { role }),
                toggleStatus: (id: number | string, is_active?: boolean) => apiClient.post(`/admin/users/${id}/toggle-status/`, { is_active }),
                resetPassword: (id: number | string, new_password: string) => apiClient.post(`/admin/users/${id}/reset-password/`, { password: new_password }),
                delete: (id: number | string) => apiClient.delete(`/admin/users/${id}/`),
            }
        ),

        // Properties / Listings
        properties: (params?: Record<string, string>) => apiClient.get('/admin/properties/', { params }),
        createProperty: (data: Record<string, unknown> | FormData, config?: any) => apiClient.post('/admin/properties/', data, config),
        propertyDetail: (id: number | string) => apiClient.get(`/admin/properties/${id}/`),
        updateProperty: (id: number | string, data: Record<string, unknown>) => apiClient.patch(`/admin/properties/${id}/`, data),
        deleteProperty: (id: number | string) => apiClient.delete(`/admin/listings/${id}/`),
        deleteListing: (id: number | string) => apiClient.delete(`/admin/listings/${id}/`),
        uploadMedia: (listingId: string | number, formData: FormData) =>
            apiClient.post(`/admin/properties/${listingId}/media/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        deleteMedia: (mediaId: string | number) =>
            apiClient.delete(`/admin/media/${mediaId}/`),
        updateMedia: (id: string | number, data: Record<string, unknown>) =>
            apiClient.put(`/admin/media/${id}/`, data),
        assignPropertyAgent: (id: number | string, agentId: number | string) => apiClient.post(`/admin/properties/${id}/assign-agent/`, { agent_id: agentId }),

        // Sellers
        sellers: (params?: Record<string, string>) => apiClient.get('/admin/sellers/', { params }),
        createSeller: (data: Record<string, unknown>) => apiClient.post('/admin/sellers/', data),
        sellerDetail: (id: number | string) => apiClient.get(`/admin/sellers/${id}/`),
        updateSeller: (id: number | string, data: Record<string, unknown>) => apiClient.put(`/admin/sellers/${id}/`, data),
        deleteSeller: (id: number | string) => apiClient.delete(`/admin/sellers/${id}/`),

        // Customers
        customers: (params?: Record<string, string>) => apiClient.get('/admin/customers/', { params }),
        customerDetail: (id: string) => apiClient.get(`/admin/customers/${id}/`),
        createCustomer: (data: Record<string, unknown>) => apiClient.post('/admin/customers/', data),
        updateCustomer: (id: string, data: Record<string, unknown>) => apiClient.put(`/admin/customers/${id}/`, data),

        // Conversations
        conversations: (params?: Record<string, string>) => apiClient.get('/admin/conversations/', { params }),
        conversationDetail: (id: string) => apiClient.get(`/admin/conversations/${id}/`),
        addConversationEvent: (id: string, data: Record<string, unknown>) => apiClient.post(`/admin/conversations/${id}/events/`, data),

        // Follow-ups & Leads
        followUps: (params?: Record<string, string>) => apiClient.get('/admin/follow-ups/', { params }),
        followUpDetail: (id: number) => apiClient.get(`/admin/follow-ups/${id}/`),
        createFollowUp: (data: Record<string, unknown>) => apiClient.post('/admin/follow-ups/', data),
        updateFollowUp: (id: number, data: Record<string, unknown>) => apiClient.put(`/admin/follow-ups/${id}/`, data),

        // Enquiries
        enquiries: (params?: { status?: string; search?: string; page_size?: number }) => apiClient.get('/admin/enquiries/', { params }),
        updateEnquiry: (id: string | number, data: { is_read?: boolean }) => apiClient.put(`/admin/enquiries/${id}/`, data),

        // Visits
        visits: (params?: Record<string, string>) => apiClient.get('/admin/visits/', { params }),
        updateVisit: (id: string | number, data: { status?: string; notes?: string; report?: string }) =>
            apiClient.put(`/admin/visits/${id}/`, data),
        updateVisitStatus: (id: string | number, data: { status?: string; notes?: string; report?: string }) =>
            apiClient.put(`/admin/visits/${id}/`, data),

        // Offers
        offers: (params?: Record<string, string>) => apiClient.get('/admin/offers/', { params }),
        updateOfferStatus: (id: string | number, data: { status?: string }) =>
            apiClient.put(`/admin/offers/${id}/`, data),

        // Likes / Saved
        likes: () => apiClient.get('/admin/likes/'),

        // Transactions & Financial
        transactions: (params?: Record<string, string>) => apiClient.get('/admin/transactions/', { params }),
        transactionDetail: (id: string) => apiClient.get(`/admin/transactions/${id}/`),
        createTransaction: (data: Record<string, unknown>) => apiClient.post('/admin/transactions/', data),

        sellerPayments: (params?: Record<string, string>) => apiClient.get('/admin/seller-payments/', { params }),
        sellerPaymentDetail: (id: string) => apiClient.get(`/admin/seller-payments/${id}/`),
        createSellerPayment: (data: Record<string, unknown>) => apiClient.post('/admin/seller-payments/', data),

        commissionRules: () => apiClient.get('/admin/commission-rules/'),
        commissionRuleDetail: (id: number) => apiClient.get(`/admin/commission-rules/${id}/`),
        createCommissionRule: (data: Record<string, unknown>) => apiClient.post('/admin/commission-rules/', data),
        updateCommissionRule: (id: number, data: Record<string, unknown>) => apiClient.put(`/admin/commission-rules/${id}/`, data),

        expenses: (params?: Record<string, string>) => apiClient.get('/admin/expenses/', { params }),
        expenseDetail: (id: number) => apiClient.get(`/admin/expenses/${id}/`),
        createExpense: (data: Record<string, unknown>) => apiClient.post('/admin/expenses/', data),
        updateExpense: (id: number, data: Record<string, unknown>) => apiClient.put(`/admin/expenses/${id}/`, data),
        deleteExpense: (id: number) => apiClient.delete(`/admin/expenses/${id}/`),

        // Verification
        verification: {
            list: () => apiClient.get('/admin/verification/'),
            detail: (id: string | number) => apiClient.get(`/admin/verification/${id}/`),
            review: (docId: string | number, decision: string, notes: string) =>
                apiClient.post(`/admin/verification/review/${docId}/`, { status: decision, notes }),
        },

        // System Settings
        settings: {
            get: () => apiClient.get('/admin/settings/'),
            update: (data: Record<string, unknown>) => apiClient.post('/admin/settings/', data),
        },

        systemLogs: {
            list: (params?: { search?: string; level?: string; category?: string; page_size?: number }) =>
                apiClient.get('/admin/system-logs/', { params }),
            clear: () => apiClient.delete('/admin/system-logs/'),
        },

        // Announcements
        announcements: () => apiClient.get('/admin/announcements/'),
        createAnnouncement: (data: Record<string, unknown>) => apiClient.post('/admin/announcements/', data),
        updateAnnouncement: (id: number, data: Record<string, unknown>) => apiClient.patch(`/admin/announcements/${id}/`, data),
        deleteAnnouncement: (id: number) => apiClient.delete(`/admin/announcements/${id}/`),

        // Legacy compatibility
        agents: () => apiClient.get('/admin/sellers/'),

        inbox: () => apiClient.get('/chat/contacts/'),
    },

    // AI helpers
    ai: {
        analyzeOffer: (data: { offer_amount: number; asking_price: number; property_title: string }) =>
            apiClient.post<AIAnalysisResult>('/ai/offer-analysis/', data),
    },

    // Settings
    settings: {
        get: () => apiClient.get('/admin/settings/'),
        update: (data: Record<string, unknown>) => apiClient.post('/admin/settings/', data),
        testAI: (model?: string) => apiClient.post<{ success: boolean; status: string; message: string; model: string }>('/admin/settings/test-ai/', { model }),
    },

    // Chat
    chat: {
        contacts: () => apiClient.get('/chat/contacts/'),
        history: (contactId: number | string) => apiClient.get(`/chat/history/${contactId}/`),
        send: (data: { recipient_id: number | string; content: string; listing_id?: number | string }) =>
            apiClient.post('/chat/send/', data),
        newUsers: () => apiClient.get('/chat/new-users/'),
    },

    // Reports & CSV Exports
    reports: {
        summary: (year?: number) => apiClient.get('/reports/summary/', { params: { year } }),
        download: (reportType: string) => apiClient.get(`/reports/export/${reportType}/`, { responseType: 'blob' }),
    },
};
