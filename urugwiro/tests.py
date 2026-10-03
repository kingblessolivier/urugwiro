from unittest.mock import AsyncMock, Mock, patch

import requests

from asgiref.sync import async_to_sync
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import connection
from django.test import TestCase, override_settings
from django.test.utils import CaptureQueriesContext
from django.urls import resolve
from django.utils import timezone
from rest_framework.test import APIClient

from .consumers import ChatConsumer
from .models import (
    Announcement, Asset, CommissionRule, Customer, Listing, ListingProposal, Message, Offer,
    PropertyInquiry, Visit,
    ResidentialSpec, SellerPayment, SellerProfile, SystemSetting, Transaction, User,
    VerificationDocument, SystemLog,
)


NO_THROTTLE = {**settings.REST_FRAMEWORK, 'DEFAULT_THROTTLE_CLASSES': []}


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class ApiSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username='owner', email='owner@example.com', password='Owner-pass-123!', role='owner'
        )
        self.seller_user = User.objects.create_user(
            username='seller', email='seller@example.com', password='Seller-pass-123!', role='seller'
        )
        self.seller = SellerProfile.objects.create(
            user=self.seller_user, name='Seller', email='seller@example.com',
            phone_number='0788000000', address='Private address', id_number='PRIVATE-ID',
            status='approved', is_verified=False,
        )
        self.asset = Asset.objects.create(
            asset_type='BUILDING', name='Kigali home', province='Kigali',
            district='Gasabo', sector='Remera',
        )
        ResidentialSpec.objects.create(
            asset=self.asset, bedrooms=3, bathrooms=2, is_furnished=True,
        )
        self.published = Listing.objects.create(
            asset=self.asset, seller=self.seller, title='Published home',
            description='A published home', price=100_000_000, address='Remera',
            status='published', verification_level='verified', slug='published-home',
        )
        self.draft = Listing.objects.create(
            asset=self.asset, seller=self.seller, title='Private draft',
            description='A draft', price=10, address='Private', status='draft', slug='private-draft',
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_public_registration_cannot_request_privileged_role(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'attacker', 'email': 'attacker@example.com',
            'password': 'Strong-pass-123!', 'role': 'admin',
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(username='attacker').exists())

    def test_readiness_checks_dependencies(self):
        response = self.client.get('/api/ready/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {'status': 'ready'})

    def test_system_logs_are_real_and_only_owner_can_clear_them(self):
        entry = SystemLog.objects.create(
            level='WARNING', category='SECURITY', message='Test security event',
            user=self.owner, path='/api/test/', method='POST',
        )
        admin = User.objects.create_user(
            username='log-admin', password='Admin-pass-123!', role='admin', is_staff=True,
        )
        self.authenticate(admin)
        listed = self.client.get('/api/admin/system-logs/')
        denied = self.client.delete('/api/admin/system-logs/')
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.data['results'][0]['id'], entry.pk)
        self.assertEqual(listed.data['results'][0]['user_name'], self.owner.username)
        self.assertEqual(denied.status_code, 403)

        self.authenticate(self.owner)
        cleared = self.client.delete('/api/admin/system-logs/')
        self.assertEqual(cleared.status_code, 200)
        self.assertFalse(SystemLog.objects.exists())

    def test_announcements_have_restricted_crud_and_public_active_feed(self):
        finance = User.objects.create_user(
            username='finance-user', password='Finance-pass-123!', role='finance',
        )
        self.authenticate(finance)
        denied = self.client.post('/api/admin/announcements/', {
            'text': 'Not allowed', 'icon': 'info', 'is_active': True, 'order': 0,
        }, format='json')
        self.assertEqual(denied.status_code, 403)

        self.authenticate(self.owner)
        created = self.client.post('/api/admin/announcements/', {
            'text': 'Public notice', 'icon': 'campaign', 'is_active': True, 'order': 2,
        }, format='json')
        hidden = Announcement.objects.create(text='Internal draft', is_active=False, order=1)
        self.assertEqual(created.status_code, 201)

        listed = self.client.get('/api/admin/announcements/')
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.data['count'], 2)

        updated = self.client.patch(
            f"/api/admin/announcements/{created.data['id']}/",
            {'order': 0}, format='json',
        )
        self.client.force_authenticate(user=None)
        public = self.client.get('/api/announcements/')
        self.assertEqual(updated.status_code, 200)
        self.assertEqual([item['text'] for item in public.data], ['Public notice'])
        self.assertNotIn(hidden.text, [item['text'] for item in public.data])

        self.authenticate(self.owner)
        deleted = self.client.delete(f'/api/admin/announcements/{hidden.pk}/')
        self.assertEqual(deleted.status_code, 204)
        self.assertFalse(Announcement.objects.filter(pk=hidden.pk).exists())

    @patch('urugwiro.services.requests.post')
    def test_ai_connection_probe_uses_stored_secret(self, mock_post):
        SystemSetting.objects.create(key='NVIDIA_AI_API_KEY', value='stored-secret')
        mock_post.return_value.raise_for_status.return_value = None
        self.authenticate(self.owner)

        response = self.client.post('/api/admin/settings/test-ai/', {
            'model': 'meta/test-model',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['model'], 'meta/test-model')
        headers = mock_post.call_args.kwargs['headers']
        self.assertEqual(headers['Authorization'], 'Bearer stored-secret')
        self.assertNotContains(response, 'stored-secret')

    def test_ai_connection_probe_requires_configuration_and_permission(self):
        self.authenticate(self.owner)
        missing = self.client.post('/api/admin/settings/test-ai/', {}, format='json')
        self.client.force_authenticate(user=None)
        anonymous = self.client.post('/api/admin/settings/test-ai/', {}, format='json')

        self.assertEqual(missing.status_code, 503)
        self.assertIn(anonymous.status_code, (401, 403))

    @patch('urugwiro.services.requests.post')
    def test_ai_connection_probe_reports_provider_rejection_safely(self, mock_post):
        SystemSetting.objects.create(key='NVIDIA_AI_API_KEY', value='never-return-this')
        provider_response = Mock(status_code=401)
        mock_post.return_value.raise_for_status.side_effect = requests.HTTPError(
            response=provider_response,
        )
        self.authenticate(self.owner)

        response = self.client.post('/api/admin/settings/test-ai/', {}, format='json')

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.data['provider_status'], 401)
        self.assertNotContains(response, 'never-return-this', status_code=502)

    def test_public_registration_creates_customer_and_validates_password(self):
        weak = self.client.post('/api/auth/register/', {
            'username': 'weak', 'email': 'weak@example.com', 'password': 'x', 'role': 'buyer',
        }, format='json')
        self.assertEqual(weak.status_code, 400)
        valid = self.client.post('/api/auth/register/', {
            'username': 'buyer', 'email': 'buyer@example.com',
            'password': 'Strong-pass-123!', 'role': 'buyer',
        }, format='json')
        self.assertEqual(valid.status_code, 201)
        self.assertEqual(User.objects.get(username='buyer').role, 'customer')

    def test_self_profile_cannot_change_privileges(self):
        customer = User.objects.create_user(username='customer', password='Customer-pass-123!')
        self.authenticate(customer)
        response = self.client.put('/api/auth/me/', {
            'first_name': 'Updated', 'role': 'owner', 'is_staff': True, 'is_superuser': True,
        }, format='json')
        customer.refresh_from_db()
        self.assertEqual(response.status_code, 400)
        self.assertEqual(customer.role, 'customer')
        self.assertFalse(customer.is_staff)
        self.assertFalse(customer.is_superuser)

    def test_auth_profile_reports_real_seller_verification_state(self):
        self.authenticate(self.seller_user)
        response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['seller_is_verified'])
        self.assertEqual(response.data['seller_status'], 'approved')

    def test_public_listing_detail_only_exposes_published_safe_fields(self):
        draft = self.client.get(f'/api/listings/{self.draft.pk}/')
        published = self.client.get(f'/api/listings/{self.published.pk}/')
        self.assertEqual(draft.status_code, 404)
        self.assertEqual(published.status_code, 200)
        self.assertNotIn('id_number', published.data['seller'])
        self.assertNotIn('address', published.data['seller'])
        self.assertNotIn('phone_number', published.data['seller'])

    def test_slug_and_visual_search_routes_resolve_correctly(self):
        self.assertEqual(self.client.get('/api/listings/published-home/').status_code, 200)
        self.assertEqual(resolve('/api/listings/visual-search/').url_name, 'api_visual_search')
        self.assertEqual(self.client.post('/api/listings/visual-search/', {}, format='multipart').status_code, 400)

    def test_listing_filters_are_applied(self):
        cases = {
            'bedrooms=4': 0, 'bathrooms=2': 1, 'province=Kigali': 1,
            'sector=Kacyiru': 0, 'furnished=true': 1,
            'verification_level=professional': 0,
        }
        for query, expected in cases.items():
            with self.subTest(query=query):
                response = self.client.get(f'/api/listings/?{query}')
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data['count'], expected, response.data)

    def test_valuation_uses_consistent_market_segment_and_area(self):
        self.asset.total_area = 100
        self.asset.save(update_fields=['total_area'])
        second_asset = Asset.objects.create(
            asset_type='BUILDING', name='Second home', province='Kigali',
            district='Gasabo', sector='Remera', total_area=100,
        )
        Listing.objects.create(
            asset=second_asset, seller=self.seller, title='Second sale',
            description='Comparable sale', purpose='sale', category='house',
            price=200_000_000, currency='RWF', address='Remera',
            status='published', slug='second-sale',
        )
        Listing.objects.create(
            asset=second_asset, seller=self.seller, title='Monthly rental',
            description='Rental should not enter sale estimate', purpose='rent',
            rental_frequency='per_month', category='house', price=500_000,
            currency='RWF', address='Remera', status='published', slug='monthly-rental',
        )
        Listing.objects.create(
            asset=second_asset, seller=self.seller, title='Dollar sale',
            description='USD should not enter RWF estimate', purpose='sale',
            category='house', price=1_000, currency='USD', address='Remera',
            status='published', slug='dollar-sale',
        )

        response = self.client.post('/api/valuation/estimate/', {
            'category': 'house', 'purpose': 'sale', 'currency': 'RWF',
            'district': 'Gasabo', 'sector': 'Remera', 'area_sqm': 200,
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['estimated_value'], 300_000_000)
        self.assertEqual(response.data['comparables_count'], 2)
        self.assertEqual(response.data['analyzed_count'], 2)
        self.assertEqual(response.data['method'], 'median_price_per_sqm')
        self.assertEqual(response.data['search_level'], 'sector')
        self.assertEqual({item['currency'] for item in response.data['comparables']}, {'RWF'})
        self.assertEqual({item['purpose'] for item in response.data['comparables']}, {'sale'})

    def test_valuation_rejects_ambiguous_rental_period(self):
        missing_purpose = self.client.post('/api/valuation/estimate/', {
            'category': 'house',
        }, format='json')
        missing_period = self.client.post('/api/valuation/estimate/', {
            'category': 'house', 'purpose': 'rent',
        }, format='json')

        self.assertEqual(missing_purpose.status_code, 400)
        self.assertEqual(missing_period.status_code, 400)

    def test_listing_intent_returns_validated_filter_contract(self):
        response = self.client.get(
            '/api/listings/search-intent/',
            {'q': 'furnished 3 bedroom house for rent in Gasabo under 1 million'},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['filters'], {
            'category': 'house', 'purpose': 'rent', 'bedrooms': 3,
            'furnished': True, 'max_price': 1_000_000, 'district': 'Gasabo',
        })

    def test_public_listing_query_budget_is_constant_for_twenty_results(self):
        Listing.objects.bulk_create([
            Listing(
                asset=self.asset, seller=self.seller, title=f'Query budget {index}',
                description='Performance fixture', price=1_000_000 + index,
                address='Remera', status='published', slug=f'query-budget-{index}',
            )
            for index in range(19)
        ])
        with CaptureQueriesContext(connection) as queries:
            response = self.client.get('/api/listings/?page_size=20')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 20)
        self.assertLessEqual(len(queries), 10)

    def test_seller_cannot_publish_or_self_verify(self):
        self.authenticate(self.seller_user)
        response = self.client.patch(f'/api/seller/listings/{self.draft.pk}/', {
            'status': 'published', 'verification_level': 'professional', 'owner_verified': True,
        }, format='json')
        self.draft.refresh_from_db()
        self.seller.refresh_from_db()
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.draft.status, 'draft')
        self.assertEqual(self.draft.verification_level, 'none')
        self.assertFalse(self.seller.is_verified)

    def test_invalid_seller_update_rolls_back_related_changes(self):
        self.authenticate(self.seller_user)
        response = self.client.patch(f'/api/seller/listings/{self.draft.pk}/', {
            'district': 'Changed', 'price': 'invalid',
        }, format='json')
        self.asset.refresh_from_db()
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.asset.district, 'Gasabo')

    def test_seller_listing_detail_exposes_owned_workflow_records(self):
        customer = Customer.objects.create(
            full_name='Interested customer', phone='0788111222', email='buyer@example.com',
        )
        inquiry = PropertyInquiry.objects.create(
            listing=self.published, name=customer.full_name, phone=customer.phone,
            email=customer.email, message='Please share viewing times.',
        )
        offer = Offer.objects.create(
            listing=self.published, seller=self.seller, customer=customer,
            asking_price=self.published.price, offered_amount=95_000_000, currency='RWF',
        )
        visit = Visit.objects.create(
            listing=self.published, seller=self.seller, customer=customer,
            preferred_date=timezone.localdate(), phone=customer.phone,
        )
        self.authenticate(self.seller_user)

        response = self.client.get(f'/api/seller/listings/{self.published.pk}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['inquiries'][0]['id'], inquiry.pk)
        self.assertEqual(response.data['offers'][0]['id'], offer.pk)
        self.assertEqual(response.data['visits'][0]['id'], visit.pk)
        self.assertEqual(response.data['offers_count'], 1)

    def test_logout_revokes_refresh_token(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'owner', 'password': 'Owner-pass-123!',
        }, format='json')
        refresh = response.data['refresh']
        self.client.post('/api/auth/logout/', {'refresh': refresh}, format='json')
        self.assertEqual(
            self.client.post('/api/token/refresh/', {'refresh': refresh}, format='json').status_code,
            401,
        )

    def test_public_proposal_uses_server_generated_reference(self):
        response = self.client.post('/api/proposals/', {
            'full_name': 'Property Owner', 'phone_number': '0788111111',
            'email': 'property-owner@example.com', 'title': 'Family home in Remera',
            'asset_type': 'house', 'purpose': 'sale', 'district': 'Gasabo',
            'address': 'Remera', 'proposed_price': '50000000',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['proposal_code'].startswith('PROP-'))
        self.assertEqual(response.data['status'], 'pending')

    def test_settings_upsert_and_hide_secret_values(self):
        self.authenticate(self.owner)
        first = self.client.post('/api/admin/settings/', {
            'key': 'NVIDIA_AI_API_KEY', 'value': 'secret-one', 'description': 'Provider key',
        }, format='json')
        second = self.client.post('/api/admin/settings/', {
            'key': 'NVIDIA_AI_API_KEY', 'value': 'secret-two', 'description': 'Provider key',
        }, format='json')
        listed = self.client.get('/api/admin/settings/')
        self.assertIn(first.status_code, {200, 201})
        self.assertEqual(second.status_code, 200)
        self.assertEqual(SystemSetting.objects.get(key='NVIDIA_AI_API_KEY').value, 'secret-two')
        self.assertEqual(listed.data[0]['value'], '')
        self.assertTrue(listed.data[0]['is_secret'])

    def test_authenticated_offer_cannot_claim_guest_customer_by_phone(self):
        guest = Customer.objects.create(
            full_name='Guest', phone='0788222222', email='guest@example.com', source='website'
        )
        Offer.objects.create(
            listing=self.published, customer=guest, seller=self.seller,
            asking_price=self.published.price, offered_amount=90_000_000,
        )
        account = User.objects.create_user(
            username='other', email='other@example.com', password='Other-pass-123!'
        )
        self.authenticate(account)
        response = self.client.post('/api/admin/offers/', {
            'listing': self.published.pk, 'amount': 91_000_000,
            'name': 'Guest', 'phone': guest.phone,
        }, format='json')
        guest.refresh_from_db()
        self.assertEqual(response.status_code, 201)
        self.assertIsNone(guest.user_id)
        self.assertNotEqual(str(response.data['customer']), str(guest.pk))

    def test_saved_properties_returns_public_listing_contract(self):
        customer = User.objects.create_user(username='saver', password='Saver-pass-123!')
        self.published.saved_by.create(user=customer)
        self.authenticate(customer)
        response = self.client.get('/api/consumer/saved-properties/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.published.pk)
        self.assertIn('asset', response.data['results'][0])
        self.assertNotIn('phone_number', response.data['results'][0]['seller'])

    def test_seller_saved_interest_is_aggregate_and_hides_customer_identity(self):
        customer = User.objects.create_user(username='private-saver', password='Saver-pass-123!')
        self.published.saved_by.create(user=customer)
        self.authenticate(self.seller_user)

        response = self.client.get('/api/seller/likes/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'], [{
            'listing_id': self.published.pk,
            'listing_title': self.published.title,
            'saves_count': 1,
        }])
        self.assertNotIn('user', response.data['results'][0])

    def test_chat_directory_and_new_threads_are_role_scoped(self):
        customer = User.objects.create_user(username='chat-customer', password='Customer-pass-123!')
        other_customer = User.objects.create_user(username='other-customer', password='Customer-pass-123!')
        self.authenticate(customer)

        directory = self.client.get('/api/chat/new-users/')
        denied = self.client.post('/api/chat/send/', {
            'recipient_id': other_customer.pk,
            'content': 'Unsolicited message',
        }, format='json')

        self.assertEqual(directory.status_code, 200)
        self.assertIn(self.owner.pk, [entry['id'] for entry in directory.data])
        self.assertNotIn(other_customer.pk, [entry['id'] for entry in directory.data])
        self.assertEqual(denied.status_code, 403)

        Message.objects.create(sender=other_customer, recipient=customer, content='Established thread')
        continued = self.client.post('/api/chat/send/', {
            'recipient_id': other_customer.pk,
            'content': 'Allowed reply',
        }, format='json')
        self.assertEqual(continued.status_code, 201)

    def test_admin_customer_directory_contract_and_query_budget(self):
        self.authenticate(self.owner)
        created = self.client.post('/api/admin/customers/', {
            'full_name': 'CRM Customer', 'phone': '0788444444',
            'email': 'crm@example.com', 'location': 'Kigali', 'source': 'referral',
        }, format='json')
        self.assertEqual(created.status_code, 201)

        with CaptureQueriesContext(connection) as captured:
            listed = self.client.get('/api/admin/customers/?search=CRM&source=referral&page_size=100')

        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.data['count'], 1)
        self.assertEqual(listed.data['results'][0]['full_name'], 'CRM Customer')
        self.assertEqual(listed.data['results'][0]['conversations_count'], 0)
        self.assertLessEqual(len(captured), 6)

    def test_report_summary_uses_commission_revenue_and_currency_segments(self):
        rule = CommissionRule.objects.create(
            name='Report commission', rule_type='percentage', percentage=5,
            is_default=True, is_active=True,
        )
        Transaction.objects.create(
            listing=self.published, seller=self.seller, transaction_type='sale',
            agreed_price=100_000_000, currency='RWF', commission_rule=rule,
            status='completed', completed_at=timezone.now(),
        )
        self.authenticate(self.owner)

        response = self.client.get(f'/api/reports/summary/?year={timezone.now().year}')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['metrics']['transactions'], 1)
        self.assertEqual(response.data['currency_totals'], [{
            'currency': 'RWF',
            'transaction_volume': 100_000_000.0,
            'completed_revenue': 5_000_000.0,
        }])
        self.assertEqual(sum(row['amount'] for row in response.data['monthly_revenue']), 5_000_000.0)

    def test_csv_exports_require_permission_and_escape_formulas(self):
        Customer.objects.create(
            full_name='=HYPERLINK("https://example.invalid")',
            phone='0788555555', source='website',
        )
        self.authenticate(self.owner)
        exported = self.client.get('/api/reports/export/customers/')
        unknown = self.client.get('/api/reports/export/not-a-report/')
        self.client.force_authenticate(user=None)
        anonymous = self.client.get('/api/reports/export/customers/')

        self.assertEqual(exported.status_code, 200)
        self.assertIn("'=HYPERLINK", exported.content.decode('utf-8'))
        self.assertEqual(unknown.status_code, 400)
        self.assertIn(anonymous.status_code, (401, 403))

    def test_admin_cannot_manage_owner_or_assign_protected_role(self):
        admin = User.objects.create_user(
            username='admin-user', password='Admin-pass-123!', role='admin', is_staff=True
        )
        customer = User.objects.create_user(username='managed-user', password='Managed-pass-123!')
        self.authenticate(admin)
        role_response = self.client.post(
            f'/api/admin/users/{customer.pk}/set-role/', {'role': 'owner'}, format='json'
        )
        reset_response = self.client.post(
            f'/api/admin/users/{self.owner.pk}/reset-password/',
            {'password': 'Replacement-pass-123!'}, format='json',
        )
        self.assertEqual(role_response.status_code, 403)
        self.assertEqual(reset_response.status_code, 403)
        customer.refresh_from_db()
        self.assertEqual(customer.role, 'customer')

    def test_admin_user_update_cannot_set_superuser_and_delete_deactivates(self):
        customer = User.objects.create_user(username='preserved-user', password='Managed-pass-123!')
        self.authenticate(self.owner)
        escalation = self.client.patch(
            f'/api/admin/users/{customer.pk}/', {'is_superuser': True}, format='json'
        )
        deletion = self.client.delete(f'/api/admin/users/{customer.pk}/')
        customer.refresh_from_db()
        self.assertEqual(escalation.status_code, 400)
        self.assertEqual(deletion.status_code, 204)
        self.assertFalse(customer.is_superuser)
        self.assertFalse(customer.is_active)

    def test_proposal_patch_and_conversion_create_asset_backed_draft(self):
        proposal = ListingProposal.objects.create(
            full_name='Owner', phone_number='0788333333', email='proposal@example.com',
            title='Apartment proposal', asset_type='apartment', purpose='sale',
            district='Gasabo', sector='Kacyiru', address='Kacyiru',
            proposed_price=75_000_000, bedrooms=2, bathrooms=2,
        )
        self.authenticate(self.owner)
        patched = self.client.patch(
            f'/api/proposals/{proposal.pk}/', {'status': 'inspected'}, format='json'
        )
        converted = self.client.post(f'/api/proposals/{proposal.pk}/convert/', {}, format='json')
        proposal.refresh_from_db()
        self.assertEqual(patched.status_code, 200)
        self.assertEqual(converted.status_code, 201)
        self.assertEqual(proposal.status, 'approved')
        self.assertIsNotNone(proposal.converted_listing.asset_id)
        self.assertEqual(proposal.converted_listing.category, 'house')
        self.assertEqual(proposal.converted_listing.asset.residential_spec.sub_type, 'Apartment')

    def test_sold_listing_creates_one_transaction_and_payment_atomically(self):
        CommissionRule.objects.create(
            name='Default five percent', rule_type='percentage', percentage=5,
            is_default=True, is_active=True,
        )
        self.authenticate(self.owner)
        first = self.client.patch(
            f'/api/admin/properties/{self.published.pk}/', {'status': 'sold'}, format='json'
        )
        second = self.client.patch(
            f'/api/admin/properties/{self.published.pk}/', {'status': 'sold'}, format='json'
        )
        rejected_edit = self.client.patch(
            f'/api/admin/properties/{self.published.pk}/', {'price': 1}, format='json'
        )
        transaction_record = Transaction.objects.get(listing=self.published)
        payment = SellerPayment.objects.get(transaction=transaction_record)
        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(rejected_edit.status_code, 400)
        self.assertEqual(Transaction.objects.filter(listing=self.published).count(), 1)
        self.assertEqual(payment.commission_amount, 5_000_000)
        self.assertEqual(payment.seller_entitlement, 95_000_000)

    def test_verification_requires_all_documents_and_downgrades_on_rejection(self):
        first = VerificationDocument.objects.create(
            listing=self.draft,
            file=SimpleUploadedFile('first.pdf', b'%PDF-1.4 first', content_type='application/pdf'),
            document_type='Title deed',
        )
        second = VerificationDocument.objects.create(
            listing=self.draft,
            file=SimpleUploadedFile('second.pdf', b'%PDF-1.4 second', content_type='application/pdf'),
            document_type='Identity',
        )
        self.addCleanup(first.file.delete, save=False)
        self.addCleanup(second.file.delete, save=False)
        self.authenticate(self.owner)
        first_approval = self.client.post(
            f'/api/admin/verification/review/{first.pk}/', {'status': 'approved'}, format='json'
        )
        self.draft.refresh_from_db()
        self.assertEqual(first_approval.status_code, 201)
        self.assertEqual(self.draft.verification_level, 'submitted')

        self.client.post(
            f'/api/admin/verification/review/{second.pk}/', {'status': 'approved'}, format='json'
        )
        self.draft.refresh_from_db()
        self.assertEqual(self.draft.verification_level, 'verified')

        self.client.post(
            f'/api/admin/verification/review/{first.pk}/', {'status': 'rejected'}, format='json'
        )
        self.draft.refresh_from_db()
        self.assertEqual(self.draft.verification_level, 'submitted')

    def test_verification_upload_rejects_unsupported_file_type(self):
        self.authenticate(self.seller_user)
        response = self.client.post(
            f'/api/listings/{self.draft.pk}/verify/',
            {
                'document_type': 'Executable',
                'file': SimpleUploadedFile('payload.exe', b'MZ', content_type='application/x-msdownload'),
            },
            format='multipart',
        )
        self.assertEqual(response.status_code, 400)


class ChatAuthorizationTests(TestCase):
    def test_nonparticipant_is_rejected_before_history_is_loaded(self):
        first = User.objects.create_user(username='first')
        second = User.objects.create_user(username='second')
        outsider = User.objects.create_user(username='outsider')

        async def run_probe():
            consumer = ChatConsumer()
            consumer.scope = {
                'url_route': {'kwargs': {'room_id': f'{first.pk}_{second.pk}'}},
                'user': outsider,
            }
            consumer.channel_layer = AsyncMock()
            consumer.channel_name = 'test-channel'
            consumer.accept = AsyncMock()
            consumer.close = AsyncMock()
            consumer.get_history = AsyncMock(return_value=[])
            await consumer.connect()
            return consumer

        consumer = async_to_sync(run_probe)()
        consumer.close.assert_awaited_once_with(code=4403)
        consumer.accept.assert_not_awaited()
        consumer.get_history.assert_not_awaited()
