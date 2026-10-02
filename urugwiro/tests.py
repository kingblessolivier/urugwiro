from unittest.mock import AsyncMock

from asgiref.sync import async_to_sync
from django.conf import settings
from django.test import TestCase, override_settings
from django.urls import resolve
from rest_framework.test import APIClient

from .consumers import ChatConsumer
from .models import Asset, Customer, Listing, Offer, ResidentialSpec, SellerProfile, SystemSetting, User


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
