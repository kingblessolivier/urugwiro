import re

from django.db.models import Count, Exists, OuterRef, Q
from rest_framework import serializers

from .models import Listing, SavedProperty
from .serializers import (
    AssetSerializer, LandSpecSerializer, ListingSerializer,
    SellerProfileSerializer, VehicleSpecSerializer,
)


class PublicSellerSerializer(SellerProfileSerializer):
    class Meta(SellerProfileSerializer.Meta):
        fields = ['id', 'name', 'image', 'bio', 'is_verified']
        read_only_fields = fields


class PublicLandSerializer(LandSpecSerializer):
    class Meta(LandSpecSerializer.Meta):
        exclude = ['asset', 'upi_number', 'title_deed_number', 'cadastral_sketch']


class PublicVehicleSerializer(VehicleSpecSerializer):
    class Meta(VehicleSpecSerializer.Meta):
        exclude = ['asset', 'plate_number', 'vin_chassis_number']


class PublicAssetSerializer(AssetSerializer):
    land_spec = PublicLandSerializer(read_only=True)
    vehicle_spec = PublicVehicleSerializer(read_only=True)

    class Meta(AssetSerializer.Meta):
        fields = [field for field in AssetSerializer.Meta.fields if field not in {'upi_number', 'title_deed_number'}]


class PublicListingSerializer(ListingSerializer):
    asset = PublicAssetSerializer(read_only=True)
    seller = PublicSellerSerializer(read_only=True)

    class Meta(ListingSerializer.Meta):
        fields = [field for field in ListingSerializer.Meta.fields if field not in {
            'seller_phone', 'inquiries_count', 'conversations_count', 'listed_by_role',
        }]

    def get_likes_count(self, obj) -> int:
        return obj.like_total

    def get_is_liked(self, obj) -> bool:
        return bool(getattr(obj, 'liked_by_user', False))


def public_listings(user=None):
    queryset = Listing.objects.filter(status='published').select_related(
        'seller', 'asset', 'asset__residential_spec', 'asset__commercial_spec',
        'asset__land_spec', 'asset__hotel_spec', 'asset__vehicle_spec',
    ).prefetch_related('media').annotate(like_total=Count('saved_by', distinct=True))
    if user and user.is_authenticated:
        queryset = queryset.annotate(liked_by_user=Exists(
            SavedProperty.objects.filter(listing=OuterRef('pk'), user=user)
        ))
    return queryset


def _intent_amount(raw_value, unit=''):
    value = float(raw_value.replace(',', ''))
    multiplier = {'k': 1_000, 'm': 1_000_000, 'million': 1_000_000, 'billion': 1_000_000_000}.get(unit, 1)
    return int(value * multiplier)


def parse_listing_intent(intent):
    text = ' '.join(intent.lower().split())[:500]
    filters = {}

    categories = [
        ('apartment', ('apartment', 'flat', 'condo')),
        ('land', ('land', 'plot', 'parcel')),
        ('commercial', ('commercial', 'office', 'warehouse', 'shop')),
        ('hotel', ('hotel', 'guest house', 'lodge')),
        ('motorbike', ('motorbike', 'motorcycle', 'moto')),
        ('car', ('car', 'vehicle', 'suv', 'sedan')),
        ('house', ('house', 'home', 'villa', 'residential')),
    ]
    for category, keywords in categories:
        if any(keyword in text for keyword in keywords):
            filters['category'] = category
            break

    if any(keyword in text for keyword in ('for rent', 'to rent', 'rental', 'lease')):
        filters['purpose'] = 'rent'
    elif any(keyword in text for keyword in ('for sale', 'to buy', 'buying', 'purchase')):
        filters['purpose'] = 'sale'

    bedroom_match = re.search(r'\b(\d+)\s*(?:bed|bedroom)s?\b', text)
    bathroom_match = re.search(r'\b(\d+)\s*(?:bath|bathroom)s?\b', text)
    if bedroom_match:
        filters['bedrooms'] = int(bedroom_match.group(1))
    if bathroom_match:
        filters['bathrooms'] = int(bathroom_match.group(1))
    if 'unfurnished' in text:
        filters['furnished'] = False
    elif 'furnished' in text:
        filters['furnished'] = True
    if 'professionally verified' in text:
        filters['verification_level'] = 'professional'
    elif 'verified' in text:
        filters['verification_level'] = 'verified'

    amount_pattern = r'([\d,.]+)\s*(billion|million|m|k)?'
    between = re.search(rf'\bbetween\s+{amount_pattern}\s+(?:and|to)\s+{amount_pattern}', text)
    if between:
        filters['min_price'] = _intent_amount(between.group(1), between.group(2) or '')
        filters['max_price'] = _intent_amount(between.group(3), between.group(4) or '')
    else:
        maximum = re.search(rf'\b(?:under|below|up to|max(?:imum)?)\s+{amount_pattern}', text)
        minimum = re.search(rf'\b(?:over|above|from|min(?:imum)?)\s+{amount_pattern}', text)
        if maximum:
            filters['max_price'] = _intent_amount(maximum.group(1), maximum.group(2) or '')
        if minimum:
            filters['min_price'] = _intent_amount(minimum.group(1), minimum.group(2) or '')

    location_rows = Listing.objects.filter(status='published').values_list(
        'asset__province', 'asset__district', 'asset__sector',
    ).distinct()
    for province, district, sector in location_rows:
        for field, value in (('sector', sector), ('district', district), ('province', province)):
            if value and re.search(rf'\b{re.escape(value.lower())}\b', text):
                filters[field] = value

    if not filters:
        filters['search'] = intent.strip()[:200]
    return filters


class ListingFilters(serializers.Serializer):
    search = serializers.CharField(required=False, max_length=200)
    category = serializers.ChoiceField(choices=[choice[0] for choice in Listing.CATEGORY_CHOICES] + ['apartment'], required=False)
    purpose = serializers.ChoiceField(choices=['sale', 'rent'], required=False)
    min_price = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=0, required=False)
    max_price = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=0, required=False)
    bedrooms = serializers.IntegerField(min_value=0, required=False)
    bathrooms = serializers.IntegerField(min_value=0, required=False)
    province = serializers.CharField(max_length=100, required=False)
    district = serializers.CharField(max_length=100, required=False)
    sector = serializers.CharField(max_length=100, required=False)
    verification_level = serializers.ChoiceField(choices=['none', 'submitted', 'verified', 'professional'], required=False)
    furnished = serializers.BooleanField(required=False)
    is_featured = serializers.BooleanField(required=False)
    sort = serializers.ChoiceField(choices=['newest', 'price_asc', 'price_desc'], default='newest')

    def validate(self, attrs):
        if attrs.get('min_price', 0) > attrs.get('max_price', float('inf')):
            raise serializers.ValidationError('Minimum price must not exceed maximum price.')
        return attrs

    def apply(self, queryset):
        filters = self.validated_data.copy()
        search = filters.pop('search', '')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
                | Q(address__icontains=search) | Q(asset__district__icontains=search)
                | Q(asset__sector__icontains=search) | Q(asset__province__icontains=search)
            )
        ordering = {'newest': '-date_listed', 'price_asc': 'price', 'price_desc': '-price'}[filters.pop('sort')]
        if filters.get('category') == 'apartment':
            filters['category'] = 'house'
            queryset = queryset.filter(asset__residential_spec__sub_type='Apartment')
        lookups = {
            'min_price': 'price__gte', 'max_price': 'price__lte',
            'bedrooms': 'asset__residential_spec__bedrooms__gte',
            'bathrooms': 'asset__residential_spec__bathrooms__gte',
            'furnished': 'asset__residential_spec__is_furnished',
            **{field: f'asset__{field}__iexact' for field in ('province', 'district', 'sector')},
        }
        return queryset.filter(**{lookups.get(key, key): value for key, value in filters.items()}).order_by(ordering, '-pk')
