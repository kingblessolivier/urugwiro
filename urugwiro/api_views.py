import json
import logging
import re
from decimal import Decimal, InvalidOperation
import requests
from django.core.cache import cache
from django.db import connection, transaction
from django.db.models import Q, Sum, Count, Avg, F, Exists, OuterRef
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError
from .permissions import has_capability
from django.contrib.auth import authenticate, login, logout
from django.utils.text import slugify
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken

# Import models
from .models import (
    User, Listing, ListingMedia, SellerProfile, SavedProperty, ListingReview, PropertyInquiry, Updates,
    VerificationDocument, VerificationReview, ListingAuditLog, Offer, Visit, Customer, Conversation, ConversationEvent, Message,
    FollowUp, Transaction, SellerPayment, CommissionRule, BusinessExpense, ListingProposal, SystemSetting, SystemLog, ArticleCategory, Article, Announcement, Asset, ResidentialSpec, LandSpec, VehicleSpec, CommercialSpec, HotelSpec, Notification,
)

# Import serializers
from .serializers import (
    ListingSerializer, ListingReviewSerializer, UserSerializer, SellerProfileSerializer, UpdatesSerializer,
    ArticleSerializer, ArticleCategorySerializer, VerificationDocumentSerializer, VerificationReviewSerializer,
    ListingAuditLogSerializer, ListingCreateSerializer, ListingMediaSerializer, OfferSerializer, VisitSerializer,
    PropertyInquirySerializer, CustomerSerializer, ConversationSerializer, FollowUpSerializer, VisitCreateSerializer,
    TransactionSerializer, SellerPaymentSerializer, CommissionRuleSerializer, BusinessExpenseSerializer,
    ListingProposalSerializer, PublicListingProposalSerializer, SystemSettingSerializer, SystemLogSerializer, SavedPropertySerializer, ConversationEventSerializer,
    AdminUserCreateSerializer, AdminUserUpdateSerializer, RegistrationSerializer, SelfProfileSerializer, SellerListingWriteSerializer
)

# Services
from .services import (
    ValuationService, analyze_offer, describe_listing_image, generate_listing_narrative,
    test_ai_connection,
)
from .catalog import ListingFilters, PublicListingSerializer, parse_listing_intent, public_listings

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# ==========================================
# Permission Helpers
# ==========================================

def check_admin_permission(request, capability='operations'):
    if not request.user or not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    if not has_capability(request.user, capability):
        return Response({'error': 'You do not have permission for this operation.'}, status=status.HTTP_403_FORBIDDEN)
    return None

def check_seller_permission(request):
    if not request.user or not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    if request.user.role not in ['seller', 'admin', 'owner', 'staff']:
        if not request.user.is_superuser:
            return Response({'error': 'Seller permissions required'}, status=status.HTTP_403_FORBIDDEN)
    profile = getattr(request.user, 'seller_profile', None)
    if profile and profile.status in {'suspended', 'archived'}:
        return Response({'error': 'Seller account is not active.'}, status=status.HTTP_403_FORBIDDEN)
    return None


PROTECTED_ACCOUNT_ROLES = {'owner', 'admin', 'finance'}


def check_account_management_permission(request, target=None, requested_role=None):
    actor_is_owner = request.user.is_superuser or request.user.role == 'owner'
    if target and target.pk == request.user.pk and (
        requested_role and requested_role != target.role
    ):
        return Response({'error': 'You cannot change your own role.'}, status=status.HTTP_400_BAD_REQUEST)
    if target and target.pk == request.user.pk and request.data.get('is_active') is False:
        return Response({'error': 'You cannot deactivate your own account.'}, status=status.HTTP_400_BAD_REQUEST)
    if target and target.role in PROTECTED_ACCOUNT_ROLES and not actor_is_owner:
        return Response({'error': 'Only an owner can manage protected accounts.'}, status=status.HTTP_403_FORBIDDEN)
    if requested_role in PROTECTED_ACCOUNT_ROLES and not actor_is_owner:
        return Response({'error': 'Only an owner can assign this role.'}, status=status.HTTP_403_FORBIDDEN)
    return None

def get_seller_profile(request):
    user = request.user
    if not user or not user.is_authenticated:
        return None
    profile = getattr(user, 'seller_profile', None)
    if profile:
        return profile
    # Auto-provision a profile for permitted users so they can list and manage
    # immediately instead of hitting "No seller profile found" on every endpoint.
    if user.role not in ['seller', 'admin', 'owner', 'staff'] and not user.is_superuser:
        return None
    profile, _ = SellerProfile.objects.get_or_create(
        user=user,
        defaults={
            'name': user.get_full_name() or user.username,
            'email': user.email or f'{user.username}@urugwiro.rw',
            'phone_number': getattr(user, 'phone_number', None) or 'Not provided',
            'status': 'pending',
            'is_verified': False,
        },
    )
    return profile

def parse_decimal(val):
    if val is None or val == '':
        return None
    try:
        return Decimal(str(val))
    except (InvalidOperation, TypeError, ValueError):
        return None

def parse_int(val, default=None):
    if val is None or val == '':
        return default
    try:
        return int(float(val))
    except (TypeError, ValueError):
        return default

def parse_bool(val):
    if isinstance(val, bool):
        return val
    return str(val).strip().lower() in ['true', '1', 'yes']


def create_customer_for_intake(request, name, phone='', email=''):
    """Resolve an account's customer profile without claiming guest CRM records."""
    name = (name or '').strip() or 'Customer'
    phone = (phone or '').strip()
    email = (email or '').strip()
    if request.user.is_authenticated:
        customer = getattr(request.user, 'customer_profile', None)
        if customer:
            return customer
        return Customer.objects.create(
            user=request.user,
            full_name=name,
            phone=phone,
            email=email or request.user.email,
            source='website',
        )
    return Customer.objects.create(
        full_name=name,
        phone=phone,
        email=email,
        source='website',
    )

def create_listing_asset(data, category, title):
    asset_type = 'LAND' if category == 'land' else 'VEHICLE' if category in ['car', 'motorbike'] else 'BUILDING'
    raw_area = (
        data.get('total_area') or data.get('area_sqm') or
        data.get('plotSizeSqm') or data.get('plot_size_sqm') or
        data.get('builtAreaSqm') or data.get('built_up_area_sqm') or
        data.get('grossArea') or data.get('gross_area') or
        data.get('netArea') or data.get('net_area_sqm')
    )
    asset = Asset.objects.create(
        asset_type=data.get('asset_type') or asset_type,
        name=data.get('asset_name') or title or 'Property asset',
        province=data.get('province') or '',
        district=data.get('district') or '',
        sector=data.get('sector') or '',
        cell=data.get('cell') or '',
        village=data.get('village') or '',
        total_area=parse_decimal(raw_area),
        latitude=parse_decimal(data.get('latitude')),
        longitude=parse_decimal(data.get('longitude')),
        boundary_geojson=data.get('boundary_geojson') or '',
    )
    if category == 'land':
        land_data = data.get('land_spec') if isinstance(data.get('land_spec'), dict) else data
        LandSpec.objects.create(
            asset=asset,
            upi_number=land_data.get('upi_number') or land_data.get('upiNumber') or None,
            title_deed_number=land_data.get('title_deed_number') or land_data.get('titleDeedNumber') or None,
            terrain=land_data.get('terrain') or None,
            zoning_code=land_data.get('zoningCode') or land_data.get('zoning_code') or None,
            road_type=land_data.get('landRoadType') or land_data.get('road_type') or land_data.get('roadType') or None,
            water_onsite=parse_bool(land_data.get('waterOnsite', land_data.get('water_onsite', False))),
            electricity_onsite=parse_bool(land_data.get('electricityOnsite', land_data.get('electricity_onsite', False))),
            is_encumbrance_free=parse_bool(land_data.get('isEncumbranceFree', land_data.get('is_encumbrance_free', True))),
            has_fiber_conduit=parse_bool(land_data.get('hasFiberConduit', land_data.get('has_fiber_conduit', False))),
            is_in_wetland_buffer_zone=parse_bool(land_data.get('wetlandBuffer', land_data.get('is_in_wetland_buffer_zone', False))),
            soil_type=land_data.get('soilType') or land_data.get('soil_type') or None,
            drainage_system=land_data.get('drainageSystem') or land_data.get('drainage_system') or None,
            land_use_category=land_data.get('landUse') or land_data.get('land_use_category') or 'Residential',
            tenure_type=land_data.get('tenure') or land_data.get('tenure_type') or 'EmphyteuticLease',
            lease_years_remaining=parse_int(land_data.get('leaseYears') or land_data.get('lease_years_remaining')),
            floor_area_ratio=parse_decimal(land_data.get('far') or land_data.get('floor_area_ratio')),
            building_coverage_ratio=parse_decimal(land_data.get('bcr') or land_data.get('building_coverage_ratio')),
            slope_gradient_percent=parse_decimal(land_data.get('slopePercent') or land_data.get('slope_gradient_percent')),
            max_permitted_floors=land_data.get('maxFloors') or land_data.get('max_permitted_floors') or None,
        )
    elif category in ['car', 'motorbike']:
        veh_data = data.get('vehicle_spec') if isinstance(data.get('vehicle_spec'), dict) else data
        VehicleSpec.objects.create(
            asset=asset,
            vehicle_type='Motorcycle' if category == 'motorbike' else (veh_data.get('vehicle_type') or veh_data.get('vehicleType') or 'Car'),
            make=veh_data.get('make') or 'Not specified',
            model=veh_data.get('model') or 'Not specified',
            year=parse_int(veh_data.get('year'), default=2020),
            mileage=parse_int(veh_data.get('mileage'), default=0),
            fuel_type=veh_data.get('fuelType') or veh_data.get('fuel_type') or 'Petrol',
            transmission=veh_data.get('transmission') or 'Automatic',
            drivetrain=veh_data.get('drivetrain') or 'FWD',
            engine_capacity=veh_data.get('engineCc') or veh_data.get('engine_capacity') or None,
            horsepower=parse_int(veh_data.get('horsepower')),
            condition=veh_data.get('condition') or None,
            body_type=veh_data.get('bodyType') or veh_data.get('body_type') or None,
            seating_capacity=parse_int(veh_data.get('seats') or veh_data.get('seating_capacity')),
            plate_number=veh_data.get('plateNumber') or veh_data.get('plate_number') or None,
            plate_type=veh_data.get('plateType') or veh_data.get('plate_type') or 'Private',
            vin_chassis_number=veh_data.get('vinChassis') or veh_data.get('vin_chassis_number') or None,
            rra_customs_status=veh_data.get('rraCustoms') or veh_data.get('rra_customs_status') or 'DutyPaid',
            has_air_conditioning=parse_bool(veh_data.get('hasAc', veh_data.get('has_air_conditioning', True))),
            has_leather_seats=parse_bool(veh_data.get('hasLeather', veh_data.get('has_leather_seats', False))),
            has_sunroof=parse_bool(veh_data.get('hasSunroof', veh_data.get('has_sunroof', False))),
            has_reverse_camera=parse_bool(veh_data.get('hasReverseCamera', veh_data.get('has_reverse_camera', False))),
            has_service_history=parse_bool(veh_data.get('hasServiceHistory', veh_data.get('has_service_history', False))),
            includes_driver=parse_bool(veh_data.get('includesDriver', veh_data.get('includes_driver', False))),
            includes_helmet=parse_bool(veh_data.get('includesHelmet', veh_data.get('includes_helmet', False))),
            has_delivery_rack=parse_bool(veh_data.get('hasDeliveryRack', veh_data.get('has_delivery_rack', False))),
        )
    elif category == 'commercial':
        comm_data = data.get('commercial_spec') if isinstance(data.get('commercial_spec'), dict) else data
        CommercialSpec.objects.create(
            asset=asset,
            zoning_type=comm_data.get('commercialZoning') or comm_data.get('zoning_type') or 'Office',
            power_capacity=parse_decimal(comm_data.get('powerCapacity') or comm_data.get('power_capacity') or comm_data.get('power_capacity_kva')),
            loading_bays=parse_int(comm_data.get('loadingBays') or comm_data.get('loading_bays') or comm_data.get('loading_bays_count') or (1 if parse_bool(comm_data.get('hasLoadingBay')) else 0), default=0),
            parking_spaces=parse_int(comm_data.get('parkingSpaces') or comm_data.get('parkingSpacesCommercial') or comm_data.get('parking_spaces') or comm_data.get('parking_capacity'), default=0),
            foot_traffic_score=parse_int(comm_data.get('footTrafficScore') or comm_data.get('foot_traffic_score') or comm_data.get('avg_daily_foot_traffic'), default=0),
            total_floors=parse_int(comm_data.get('commercialFloors') or comm_data.get('total_floors')),
            has_backup_generator=parse_bool(comm_data.get('hasCommercialGenerator', comm_data.get('hasGenerator', comm_data.get('has_backup_generator', comm_data.get('has_generator', False))))),
        )
    elif category == 'hotel':
        hotel_data = data.get('hotel_spec') if isinstance(data.get('hotel_spec'), dict) else data
        HotelSpec.objects.create(
            asset=asset,
            star_rating=parse_int(hotel_data.get('starRating') or hotel_data.get('star_rating'), default=1),
            total_rooms=parse_int(hotel_data.get('totalRooms') or hotel_data.get('total_rooms'), default=0),
            conference_halls=parse_int(hotel_data.get('conferenceHallsCount') or hotel_data.get('conference_halls') or hotel_data.get('conference_halls_count'), default=0),
            has_restaurant_bar=parse_bool(hotel_data.get('hasRestaurantBar', hotel_data.get('has_restaurant_bar', False))),
            has_commercial_license=parse_bool(hotel_data.get('hasCommercialLicense', hotel_data.get('has_commercial_license', True))),
            occupancy_rate=parse_decimal(hotel_data.get('occupancyRate') or hotel_data.get('occupancy_rate')),
            management_type=hotel_data.get('managementType') or hotel_data.get('management_type') or 'Independent',
        )
    else:
        res_data = data.get('residential_spec') if isinstance(data.get('residential_spec'), dict) else data
        raw_res_area = res_data.get('builtAreaSqm') or res_data.get('built_up_area_sqm') or raw_area
        ResidentialSpec.objects.create(
            asset=asset,
            sub_type=res_data.get('sub_type') or res_data.get('subType') or 'SingleFamily',
            bedrooms=parse_int(res_data.get('bedrooms'), default=0),
            bathrooms=parse_int(res_data.get('bathrooms'), default=0),
            built_up_area_sqm=parse_decimal(raw_res_area),
            compound_size_sqm=parse_decimal(res_data.get('compoundSizeSqm') or res_data.get('compound_size_sqm')),
            is_furnished=parse_bool(res_data.get('isFurnished', res_data.get('is_furnished', False))),
            year_built=parse_int(res_data.get('yearBuilt') or res_data.get('year_built')),
            parking_spaces=parse_int(res_data.get('parkingSpaces') or res_data.get('parking_spaces'), default=0),
            has_garden=parse_bool(res_data.get('hasGarden', res_data.get('has_garden', False))),
            has_water_tank=parse_bool(res_data.get('hasWaterTank', res_data.get('has_water_tank', False))),
            water_tank_capacity_liters=parse_int(res_data.get('waterTankLiters') or res_data.get('water_tank_capacity_liters')),
            has_swimming_pool=parse_bool(res_data.get('hasSwimmingPool', res_data.get('has_swimming_pool', False))),
            has_staff_quarters=parse_bool(res_data.get('hasStaffQuarters', res_data.get('has_staff_quarters', False))),
            has_backup_generator=parse_bool(res_data.get('hasGenerator', res_data.get('has_backup_generator', False))),
            backup_generator_kva=parse_decimal(res_data.get('generatorKva') or res_data.get('backup_generator_kva')),
            has_solar_water_heater=parse_bool(res_data.get('hasSolarWater', res_data.get('has_solar_water_heater', False))),
            has_three_phase_power=parse_bool(res_data.get('hasThreePhase', res_data.get('has_three_phase_power', False))),
            has_fiber_internet=parse_bool(res_data.get('hasFiber', res_data.get('has_fiber_internet', False))),
            has_cctv=parse_bool(res_data.get('hasCctv', res_data.get('has_cctv', False))),
            has_elevator=parse_bool(res_data.get('hasElevator', res_data.get('has_elevator', False))),
            kitchen_type=res_data.get('kitchenType') or res_data.get('kitchen_type') or None,
            balcony=parse_bool(res_data.get('balcony', False)),
            master_plan_zoning=res_data.get('masterPlanZoning') or res_data.get('master_plan_zoning') or None,
            security_type=res_data.get('securityType') or res_data.get('security_type') or None,
            electricity_meter=res_data.get('electricityMeter') or res_data.get('electricity_meter') or None,
            road_access_type=res_data.get('roadAccess') or res_data.get('road_access_type') or None,
        )
    return asset

def update_listing_asset_and_specs(listing, data):
    """Safely updates or creates the Asset, its category-specific Spec models,
    and associated SellerProfile from incoming dictionary data.
    Handles type conversions, null/empty strings, nested specs, and flat payload structures.
    Supports both camelCase and snake_case field names from wizard and admin edit interfaces.
    """
    if not listing:
        return None

    category = data.get('category') or listing.category or 'house'
    asset = listing.asset
    if not asset:
        default_asset_type = 'LAND' if category == 'land' else 'VEHICLE' if category in ['car', 'motorbike'] else 'BUILDING'
        asset = Asset.objects.create(
            asset_type=data.get('asset_type') or default_asset_type,
            name=data.get('asset_name') or data.get('name') or listing.title or 'Property asset',
        )
        listing.asset = asset
        listing.save(update_fields=['asset'])

    asset_changed = False

    # Location Hierarchy
    for loc_field in ['province', 'district', 'sector', 'cell', 'village']:
        if loc_field in data:
            setattr(asset, loc_field, data[loc_field] or '')
            asset_changed = True

    # Area
    raw_area = (
        data.get('total_area') or data.get('area_sqm') or
        data.get('plotSizeSqm') or data.get('plot_size_sqm') or
        data.get('builtAreaSqm') or data.get('built_up_area_sqm') or
        data.get('grossArea') or data.get('gross_area') or
        data.get('netArea') or data.get('net_area_sqm')
    )
    if raw_area is not None:
        asset.total_area = parse_decimal(raw_area)
        asset_changed = True

    # Coordinates
    if 'latitude' in data:
        asset.latitude = parse_decimal(data.get('latitude'))
        asset_changed = True
    if 'longitude' in data:
        asset.longitude = parse_decimal(data.get('longitude'))
        asset_changed = True

    # Asset name and type
    if 'asset_name' in data and data.get('asset_name'):
        asset.name = data['asset_name']
        asset_changed = True
    elif 'name' in data and data.get('name') and not any(k in data for k in ['owner_name', 'full_name', 'seller_name']):
        asset.name = data['name']
        asset_changed = True

    if 'asset_type' in data and data.get('asset_type'):
        asset.asset_type = data['asset_type']
        asset_changed = True

    if 'boundary_geojson' in data:
        asset.boundary_geojson = data.get('boundary_geojson') or ''
        asset_changed = True

    if asset_changed:
        asset.save()

    # Spec Updates
    # 1. Residential Spec
    res_data = data.get('residential_spec')
    has_res_fields = any(k in data for k in [
        'bedrooms', 'bathrooms', 'built_up_area_sqm', 'builtAreaSqm', 'sub_type', 'subType',
        'is_furnished', 'isFurnished', 'parking_spaces', 'parkingSpaces', 'yearBuilt', 'year_built',
        'kitchenType', 'kitchen_type', 'masterPlanZoning', 'master_plan_zoning', 'balcony',
        'floorNumber', 'floor_number', 'unitNumber', 'unit_number', 'balconySqm', 'balcony_area_sqm'
    ])
    if isinstance(res_data, dict) or (listing.category in ['house', 'apartment']) or has_res_fields:
        res_dict = res_data if isinstance(res_data, dict) else data
        spec, _ = ResidentialSpec.objects.get_or_create(asset=asset)
        
        string_mappings = [
            ('sub_type', ['sub_type', 'subType']),
            ('kitchen_type', ['kitchen_type', 'kitchenType']),
            ('master_plan_zoning', ['master_plan_zoning', 'masterPlanZoning', 'zoning']),
            ('security_type', ['security_type', 'securityType']),
            ('electricity_meter', ['electricity_meter', 'electricityMeter']),
            ('road_access_type', ['road_access_type', 'roadAccess', 'road_access']),
            ('apartment_selling_mode', ['apartment_selling_mode', 'sellingMode', 'selling_mode']),
            ('unit_number', ['unit_number', 'unitNumber']),
            ('unit_orientation', ['unit_orientation', 'unitOrientation']),
            ('parking_slot_number', ['parking_slot_number', 'parkingSlot', 'parking_slot']),
        ]
        for field, keys in string_mappings:
            for k in keys:
                if k in res_dict:
                    setattr(spec, field, res_dict[k] or None)
                    break

        int_mappings = [
            ('bedrooms', ['bedrooms']),
            ('bathrooms', ['bathrooms']),
            ('year_built', ['year_built', 'yearBuilt']),
            ('water_tank_capacity_liters', ['water_tank_capacity_liters', 'waterTankLiters']),
            ('parking_spaces', ['parking_spaces', 'parkingSpaces']),
            ('floor_number', ['floor_number', 'floorNumber']),
            ('total_building_floors', ['total_building_floors', 'totalBuildingFloors']),
        ]
        for field, keys in int_mappings:
            for k in keys:
                if k in res_dict:
                    setattr(spec, field, parse_int(res_dict[k]))
                    break

        dec_mappings = [
            ('built_up_area_sqm', ['built_up_area_sqm', 'builtAreaSqm', 'built_area_sqm']),
            ('compound_size_sqm', ['compound_size_sqm', 'compoundSizeSqm']),
            ('backup_generator_kva', ['backup_generator_kva', 'generatorKva', 'generator_kva']),
            ('monthly_service_charge', ['monthly_service_charge', 'serviceCharge', 'service_charge']),
            ('balcony_area_sqm', ['balcony_area_sqm', 'balconySqm', 'balcony_sqm']),
        ]
        for field, keys in dec_mappings:
            for k in keys:
                if k in res_dict:
                    setattr(spec, field, parse_decimal(res_dict[k]))
                    break

        bool_mappings = [
            ('balcony', ['balcony']),
            ('is_furnished', ['is_furnished', 'isFurnished']),
            ('has_swimming_pool', ['has_swimming_pool', 'hasSwimmingPool']),
            ('has_staff_quarters', ['has_staff_quarters', 'hasStaffQuarters']),
            ('has_garden', ['has_garden', 'hasGarden']),
            ('has_water_tank', ['has_water_tank', 'hasWaterTank']),
            ('has_solar_water_heater', ['has_solar_water_heater', 'hasSolarWater']),
            ('has_backup_generator', ['has_backup_generator', 'hasGenerator']),
            ('has_three_phase_power', ['has_three_phase_power', 'hasThreePhase']),
            ('has_fiber_internet', ['has_fiber_internet', 'hasFiber']),
            ('has_cctv', ['has_cctv', 'hasCctv']),
            ('has_elevator', ['has_elevator', 'hasElevator']),
        ]
        for field, keys in bool_mappings:
            for k in keys:
                if k in res_dict:
                    setattr(spec, field, parse_bool(res_dict[k]))
                    break

        floor_plan_val = res_dict.get('apartment_floor_plan') or res_dict.get('floorPlan')
        if floor_plan_val is not None:
            if isinstance(floor_plan_val, str):
                try:
                    spec.apartment_floor_plan = json.loads(floor_plan_val)
                except Exception:
                    spec.apartment_floor_plan = floor_plan_val
            else:
                spec.apartment_floor_plan = floor_plan_val

        spec.save()

    # 2. Land Spec
    land_data = data.get('land_spec')
    has_land_fields = any(k in data for k in [
        'upi_number', 'upiNumber', 'title_deed_number', 'titleDeedNumber', 'terrain',
        'zoning_code', 'zoningCode', 'land_use_category', 'landUse', 'tenure_type', 'tenure',
        'plotSizeSqm', 'plot_size_sqm', 'maxFloors', 'max_permitted_floors', 'slopePercent', 'slope_gradient_percent',
        'landRoadType', 'roadType', 'road_type', 'waterOnsite', 'water_onsite', 'electricityOnsite', 'electricity_onsite',
        'wetlandBuffer', 'is_in_wetland_buffer_zone', 'soilType', 'soil_type', 'drainageSystem', 'drainage_system',
        'isEncumbranceFree', 'is_encumbrance_free', 'waterLineDistance', 'water_line_distance_meters',
        'powerPoleDistance', 'power_pole_distance_meters', 'hasFiberConduit', 'has_fiber_conduit', 'far', 'floor_area_ratio',
        'bcr', 'building_coverage_ratio', 'leaseYears', 'lease_years_remaining'
    ])
    if isinstance(land_data, dict) or (listing.category == 'land') or has_land_fields:
        land_dict = land_data if isinstance(land_data, dict) else data
        spec, _ = LandSpec.objects.get_or_create(asset=asset)
        
        string_mappings = [
            ('land_use_category', ['land_use_category', 'landUse']),
            ('tenure_type', ['tenure_type', 'tenure']),
            ('upi_number', ['upi_number', 'upiNumber']),
            ('zoning_code', ['zoning_code', 'zoningCode']),
            ('max_permitted_floors', ['max_permitted_floors', 'maxFloors']),
            ('terrain', ['terrain']),
            ('road_type', ['road_type', 'landRoadType', 'roadType']),
            ('soil_type', ['soil_type', 'soilType']),
            ('topography', ['topography']),
            ('title_deed_number', ['title_deed_number', 'titleDeedNumber']),
            ('drainage_system', ['drainage_system', 'drainageSystem']),
        ]
        for field, keys in string_mappings:
            for k in keys:
                if k in land_dict:
                    setattr(spec, field, land_dict[k] or None)
                    break

        int_mappings = [
            ('lease_years_remaining', ['lease_years_remaining', 'leaseYears']),
            ('water_line_distance_meters', ['water_line_distance_meters', 'waterLineDistance']),
            ('power_pole_distance_meters', ['power_pole_distance_meters', 'powerPoleDistance']),
        ]
        for field, keys in int_mappings:
            for k in keys:
                if k in land_dict:
                    setattr(spec, field, parse_int(land_dict[k]))
                    break

        dec_mappings = [
            ('floor_area_ratio', ['floor_area_ratio', 'far']),
            ('building_coverage_ratio', ['building_coverage_ratio', 'bcr']),
            ('slope_gradient_percent', ['slope_gradient_percent', 'slopePercent']),
        ]
        for field, keys in dec_mappings:
            for k in keys:
                if k in land_dict:
                    setattr(spec, field, parse_decimal(land_dict[k]))
                    break

        bool_mappings = [
            ('road_access', ['road_access', 'roadAccess']),
            ('is_encumbrance_free', ['is_encumbrance_free', 'isEncumbranceFree']),
            ('water_onsite', ['water_onsite', 'waterOnsite']),
            ('electricity_onsite', ['electricity_onsite', 'electricityOnsite']),
            ('has_fiber_conduit', ['has_fiber_conduit', 'hasFiberConduit']),
            ('is_in_wetland_buffer_zone', ['is_in_wetland_buffer_zone', 'wetlandBuffer']),
        ]
        for field, keys in bool_mappings:
            for k in keys:
                if k in land_dict:
                    setattr(spec, field, parse_bool(land_dict[k]))
                    break

        spec.save()

    # 3. Commercial Spec
    comm_data = data.get('commercial_spec')
    has_comm_fields = any(k in data for k in [
        'zoning_type', 'commercialZoning', 'total_floors', 'commercialFloors',
        'power_capacity', 'power_capacity_kva', 'powerCapacity', 'loading_bays',
        'loading_bays_count', 'loadingBays', 'hasLoadingBay', 'parking_spaces',
        'parking_capacity', 'parkingSpaces', 'parkingSpacesCommercial', 'foot_traffic_score',
        'avg_daily_foot_traffic', 'footTrafficScore', 'has_backup_generator', 'has_generator',
        'hasGenerator', 'hasCommercialGenerator', 'building_use', 'buildingUse',
        'ceiling_height_meters', 'ceilingHeight', 'has_showroom', 'hasShowroom',
        'has_warehouse', 'hasWarehouse', 'has_office_space', 'hasOfficeSpace',
        'gross_leasable_area_sqm', 'grossArea', 'net_area_sqm', 'netArea'
    ])
    if isinstance(comm_data, dict) or (listing.category == 'commercial') or has_comm_fields:
        comm_dict = comm_data if isinstance(comm_data, dict) else data
        spec, _ = CommercialSpec.objects.get_or_create(asset=asset)
        
        for k in ['zoning_type', 'commercialZoning']:
            if k in comm_dict:
                spec.zoning_type = comm_dict[k] or None
                break

        for k in ['power_capacity', 'power_capacity_kva', 'powerCapacity']:
            if k in comm_dict:
                spec.power_capacity = parse_decimal(comm_dict[k])
                break

        for k in ['loading_bays', 'loading_bays_count', 'loadingBays']:
            if k in comm_dict:
                spec.loading_bays = parse_int(comm_dict[k], default=0)
                break
        else:
            if 'hasLoadingBay' in comm_dict:
                spec.loading_bays = 1 if parse_bool(comm_dict['hasLoadingBay']) else 0

        for k in ['parking_spaces', 'parking_capacity', 'parkingSpaces', 'parkingSpacesCommercial']:
            if k in comm_dict:
                spec.parking_spaces = parse_int(comm_dict[k], default=0)
                break

        for k in ['foot_traffic_score', 'avg_daily_foot_traffic', 'footTrafficScore']:
            if k in comm_dict:
                spec.foot_traffic_score = parse_int(comm_dict[k], default=0)
                break

        for k in ['total_floors', 'commercialFloors']:
            if k in comm_dict:
                spec.total_floors = parse_int(comm_dict[k])
                break

        for k in ['has_backup_generator', 'has_generator', 'hasGenerator', 'hasCommercialGenerator']:
            if k in comm_dict:
                spec.has_backup_generator = parse_bool(comm_dict[k])
                break

        spec.save()

    # 4. Hotel Spec
    hotel_data = data.get('hotel_spec')
    has_hotel_fields = any(k in data for k in [
        'star_rating', 'starRating', 'total_rooms', 'totalRooms', 'management_type', 'managementType',
        'conference_halls', 'conference_halls_count', 'conferenceHallsCount', 'has_restaurant_bar', 'hasRestaurantBar',
        'occupancy_rate', 'occupancyRate', 'commercial_license_number', 'commercialLicenseNumber',
        'has_commercial_license', 'hasCommercialLicense', 'hasHotelPool', 'hasPool', 'hasSpa', 'hasGym',
        'includesBreakfast', 'averageDailyRate', 'totalKeys'
    ])
    if isinstance(hotel_data, dict) or (listing.category == 'hotel') or has_hotel_fields:
        hotel_dict = hotel_data if isinstance(hotel_data, dict) else data
        spec, _ = HotelSpec.objects.get_or_create(asset=asset)
        
        for k in ['star_rating', 'starRating']:
            if k in hotel_dict:
                spec.star_rating = parse_int(hotel_dict[k])
                break

        for k in ['total_rooms', 'totalRooms']:
            if k in hotel_dict:
                spec.total_rooms = parse_int(hotel_dict[k])
                break

        for k in ['conference_halls', 'conference_halls_count', 'conferenceHallsCount']:
            if k in hotel_dict:
                spec.conference_halls = parse_int(hotel_dict[k], default=0)
                break

        for k in ['has_restaurant_bar', 'hasRestaurantBar']:
            if k in hotel_dict:
                spec.has_restaurant_bar = parse_bool(hotel_dict[k])
                break

        for k in ['has_commercial_license', 'hasCommercialLicense']:
            if k in hotel_dict:
                spec.has_commercial_license = parse_bool(hotel_dict[k])
                break

        for k in ['occupancy_rate', 'occupancyRate']:
            if k in hotel_dict:
                spec.occupancy_rate = parse_decimal(hotel_dict[k])
                break

        for k in ['management_type', 'managementType']:
            if k in hotel_dict:
                spec.management_type = hotel_dict[k] or None
                break

        amenities = spec.amenities if isinstance(spec.amenities, dict) else {}
        if 'amenities' in hotel_dict and isinstance(hotel_dict['amenities'], dict):
            amenities.update(hotel_dict['amenities'])
        for k in ['commercial_license_number', 'commercialLicenseNumber']:
            if k in hotel_dict:
                amenities['commercial_license_number'] = hotel_dict[k]
        for k in ['hasHotelPool', 'hasPool']:
            if k in hotel_dict:
                amenities['has_swimming_pool'] = parse_bool(hotel_dict[k])
        for k in ['hasSpa']:
            if k in hotel_dict:
                amenities['has_spa'] = parse_bool(hotel_dict[k])
        for k in ['hasGym']:
            if k in hotel_dict:
                amenities['has_gym'] = parse_bool(hotel_dict[k])
        for k in ['includesBreakfast']:
            if k in hotel_dict:
                amenities['includes_breakfast'] = parse_bool(hotel_dict[k])
        for k in ['averageDailyRate', 'average_daily_rate']:
            if k in hotel_dict:
                amenities['average_daily_rate'] = str(hotel_dict[k])
        for k in ['totalKeys', 'total_keys']:
            if k in hotel_dict:
                amenities['total_keys'] = parse_int(hotel_dict[k])
        spec.amenities = amenities
        spec.save()

    # 5. Vehicle Spec
    veh_data = data.get('vehicle_spec')
    has_veh_fields = any(k in data for k in [
        'make', 'model', 'year', 'mileage', 'plate_number', 'plateNumber', 'fuel_type', 'fuelType',
        'transmission', 'drivetrain', 'engine_capacity', 'engineCc', 'horsepower', 'seats',
        'seating_capacity', 'body_type', 'bodyType', 'condition', 'plate_type', 'plateType',
        'vin_chassis_number', 'vinChassis', 'rra_customs_status', 'rraCustoms', 'hasAc', 'has_air_conditioning',
        'hasLeather', 'has_leather_seats', 'hasSunroof', 'has_sunroof', 'hasReverseCamera', 'has_reverse_camera',
        'hasServiceHistory', 'has_service_history', 'includesDriver', 'includes_driver', 'includesHelmet',
        'includes_helmet', 'hasDeliveryRack', 'has_delivery_rack', 'controleTechniqueExpiry', 'controle_technique_expiry',
        'insuranceExpiry', 'insurance_expiry'
    ])
    if isinstance(veh_data, dict) or (listing.category in ['car', 'motorbike']) or has_veh_fields:
        veh_dict = veh_data if isinstance(veh_data, dict) else data
        spec, _ = VehicleSpec.objects.get_or_create(asset=asset, defaults={
            'make': veh_dict.get('make') or 'Not specified',
            'model': veh_dict.get('model') or 'Not specified',
            'year': parse_int(veh_dict.get('year'), default=2020),
        })
        string_mappings = [
            ('vehicle_type', ['vehicle_type', 'vehicleType']),
            ('make', ['make']),
            ('model', ['model']),
            ('fuel_type', ['fuel_type', 'fuelType']),
            ('transmission', ['transmission']),
            ('drivetrain', ['drivetrain']),
            ('engine_capacity', ['engine_capacity', 'engineCc']),
            ('condition', ['condition']),
            ('body_type', ['body_type', 'bodyType']),
            ('plate_number', ['plate_number', 'plateNumber']),
            ('plate_type', ['plate_type', 'plateType']),
            ('vin_chassis_number', ['vin_chassis_number', 'vinChassis']),
            ('rra_customs_status', ['rra_customs_status', 'rraCustoms']),
        ]
        for field, keys in string_mappings:
            for k in keys:
                if k in veh_dict:
                    setattr(spec, field, veh_dict[k] or None)
                    break

        int_mappings = [
            ('year', ['year']),
            ('mileage', ['mileage']),
            ('horsepower', ['horsepower']),
            ('seating_capacity', ['seating_capacity', 'seats']),
        ]
        for field, keys in int_mappings:
            for k in keys:
                if k in veh_dict:
                    setattr(spec, field, parse_int(veh_dict[k]))
                    break

        bool_mappings = [
            ('has_air_conditioning', ['has_air_conditioning', 'hasAc']),
            ('has_leather_seats', ['has_leather_seats', 'hasLeather']),
            ('has_sunroof', ['has_sunroof', 'hasSunroof']),
            ('has_reverse_camera', ['has_reverse_camera', 'hasReverseCamera']),
            ('has_service_history', ['has_service_history', 'hasServiceHistory']),
            ('includes_driver', ['includes_driver', 'includesDriver']),
            ('includes_helmet', ['includes_helmet', 'includesHelmet']),
            ('has_delivery_rack', ['has_delivery_rack', 'hasDeliveryRack']),
        ]
        for field, keys in bool_mappings:
            for k in keys:
                if k in veh_dict:
                    setattr(spec, field, parse_bool(veh_dict[k]))
                    break

        for date_field, keys in [
            ('controle_technique_expiry', ['controle_technique_expiry', 'controleTechniqueExpiry']),
            ('insurance_expiry', ['insurance_expiry', 'insuranceExpiry']),
        ]:
            for k in keys:
                if k in veh_dict:
                    val = veh_dict[k]
                    setattr(spec, date_field, val if val else None)
                    break

        spec.save()

    # Seller Reassignment & Details
    seller_id = data.get('seller_id') or data.get('owner_id')
    if seller_id:
        new_seller = SellerProfile.objects.filter(Q(id=seller_id) | Q(user_id=seller_id)).first()
        if new_seller:
            listing.seller = new_seller
            listing.save(update_fields=['seller'])

    if listing.seller:
        seller = listing.seller
        seller_changed = False
        if 'owner_name' in data and data['owner_name']:
            seller.name = data['owner_name']
            seller_changed = True
        elif 'full_name' in data and data['full_name'] and not any(k in data for k in ['title', 'category']):
            seller.name = data['full_name']
            seller_changed = True

        if 'owner_email' in data:
            seller.email = data['owner_email'] or seller.email
            seller_changed = True
        elif 'email' in data and not any(k in data for k in ['title', 'category']):
            seller.email = data['email'] or seller.email
            seller_changed = True

        if 'owner_phone' in data:
            seller.phone_number = data['owner_phone'] or seller.phone_number
            seller_changed = True
        elif 'phone' in data and not any(k in data for k in ['title', 'category']):
            seller.phone_number = data['phone'] or seller.phone_number
            seller_changed = True

        if 'owner_id_number' in data:
            seller.id_number = data['owner_id_number'] or ''
            seller_changed = True
        elif 'id_number' in data and not any(k in data for k in ['title', 'category']):
            seller.id_number = data['id_number'] or ''
            seller_changed = True

        if 'owner_bio' in data:
            seller.bio = data['owner_bio'] or ''
            seller_changed = True
        elif 'bio' in data and not any(k in data for k in ['title', 'category']):
            seller.bio = data['bio'] or ''
            seller_changed = True

        if 'owner_verified' in data:
            seller.is_verified = parse_bool(data['owner_verified'])
            seller_changed = True

        if seller_changed:
            seller.save()

    return asset

def ensure_transaction_for_sold_listing(listing, agreed_price=None, customer=None):
    """When a listing transitions to 'sold' or 'rented', create a completed Transaction
    and a pending SellerPayment so the listing price shows up in seller earnings & payouts.

    Idempotent: if a Transaction already exists for this listing (OneToOne), do nothing.
    """
    if listing.status not in ('sold', 'rented'):
        return None
    if not getattr(listing, 'seller', None):
        return None

    from django.utils import timezone

    tx_type = 'rental' if listing.status == 'rented' else 'sale'
    price = agreed_price or listing.price
    if not price:
        return None

    try:
        price_decimal = Decimal(price)
    except (InvalidOperation, TypeError, ValueError):
        return None

    customer_id = getattr(customer, 'pk', customer)
    if not customer_id:
        customer_id = (
            Offer.objects
            .filter(listing=listing, status__in=('accepted',))
            .order_by('-updated_at')
            .values_list('customer', flat=True)
            .first()
        )

    tx, created = Transaction.objects.get_or_create(
        listing=listing,
        defaults={
            'seller': listing.seller,
            'customer_id': customer_id,
            'transaction_type': tx_type,
            'agreed_price': price_decimal,
            'currency': getattr(listing, 'currency', 'RWF') or 'RWF',
            'status': 'completed',
            'completed_at': timezone.now(),
            'notes': 'Auto-generated when listing was marked as ' + listing.status,
        },
    )
    if created:
        SellerPayment.objects.create(
            transaction=tx,
            seller=tx.seller,
            listing=listing,
            gross_amount=tx.agreed_price,
            commission_amount=tx.commission_amount,
            seller_entitlement=tx.seller_amount,
            amount_paid=Decimal('0'),
            status='pending',
            payment_method='bank_transfer',
        )
    return tx


def get_paginated_response(queryset, serializer_class, request, context=None):
    serializer_context = context or {'request': request}
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(queryset, request)
    if page is not None:
        serializer = serializer_class(page, many=True, context=serializer_context)
        return paginator.get_paginated_response(serializer.data)
    serializer = serializer_class(queryset, many=True, context=serializer_context)
    return Response(serializer.data)

# ==========================================
# Public Endpoints
# ==========================================

class ListingListView(generics.ListAPIView):
    serializer_class = PublicListingSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        # QueryDict is treated as an HTML form by DRF, which injects False for
        # absent BooleanFields. A plain dict preserves truly optional filters.
        filters = ListingFilters(data=self.request.query_params.dict())
        filters.is_valid(raise_exception=True)
        return filters.apply(public_listings(self.request.user))

class ListingDetailView(generics.RetrieveAPIView):
    queryset = Listing.objects.none()
    serializer_class = PublicListingSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        lookup = {'pk': self.kwargs['pk']} if 'pk' in self.kwargs else {'slug': self.kwargs['slug']}
        obj = get_object_or_404(public_listings(self.request.user), **lookup)
        Listing.objects.filter(pk=obj.pk).update(views_count=F('views_count') + 1)
        obj.views_count += 1
        return obj


@api_view(['GET'])
@permission_classes([AllowAny])
def listing_search_intent(request):
    intent = request.query_params.get('q', '').strip()
    if not intent:
        return Response({'error': 'Search intent is required.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'filters': parse_listing_intent(intent)})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request, pk):
    listing = get_object_or_404(Listing, pk=pk, status='published')
    saved_prop, created = SavedProperty.objects.get_or_create(user=request.user, listing=listing)
    
    if not created:
        saved_prop.delete()
        return Response({'status': 'unliked', 'liked': False, 'total_likes': listing.saved_by.count()}, status=status.HTTP_200_OK)
    return Response({'status': 'liked', 'liked': True, 'total_likes': listing.saved_by.count()}, status=status.HTTP_201_CREATED)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def listing_reviews(request, pk):
    listing = get_object_or_404(Listing, pk=pk, status='published')
    if request.method == 'GET':
        reviews = ListingReview.objects.filter(listing=listing).order_by('-created_at')
        return get_paginated_response(reviews, ListingReviewSerializer, request)
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        data = request.data.copy()
        data['listing'] = listing.id
        serializer = ListingReviewSerializer(data=data)
        if serializer.is_valid():
            serializer.save(reviewer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def api_login(request):
    raw_identifier = (request.data.get('username') or request.data.get('email') or '').strip()
    password = request.data.get('password')
    
    if not raw_identifier or not password:
        return Response({'error': 'Username/email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    username = raw_identifier
    if '@' in raw_identifier:
        user_by_email = User.objects.filter(email__iexact=raw_identifier).first()
        if user_by_email:
            username = user_by_email.username

    user = authenticate(username=username, password=password)
    if not user and '@' not in raw_identifier:
        user_by_email = User.objects.filter(email__iexact=raw_identifier).first()
        if user_by_email:
            user = authenticate(username=user_by_email.username, password=password)
    
    if user:
        if not user.is_active:
            return Response({'error': 'Account is inactive'}, status=status.HTTP_403_FORBIDDEN)
            
        login(request, user)
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        
        return Response({
            'message': 'Login successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_data,
        }, status=status.HTTP_200_OK)
        
    return Response({'error': 'Invalid username/email or password'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def api_register(request):
    serializer = RegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
        
    login(request, user)
    refresh = RefreshToken.for_user(user)
    user_data = UserSerializer(user).data
    
    return Response({
        'message': 'Registration successful',
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': user_data,
    }, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def api_me(request):
    if request.method == 'GET':
        user_data = UserSerializer(request.user).data
        return Response({
            'user': user_data,
            **user_data
        })
    elif request.method == 'PUT':
        serializer = SelfProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user_data = UserSerializer(request.user).data
            return Response({
                'user': user_data,
                **user_data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_logout(request):
    token = request.data.get('refresh')
    if token:
        from rest_framework_simplejwt.exceptions import TokenError
        try:
            RefreshToken(token).blacklist()
        except TokenError:
            pass
    logout(request)
    return Response({'message': 'Logged out'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_about(request):
    return Response({'about': 'Urugwiro is a real estate platform.'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    notifications = Notification.objects.filter(recipient=request.user)[:50]
    return Response({
        'results': [
            {
                'id': item.id,
                'type': item.notification_type,
                'message': item.message,
                'link': item.link,
                'is_read': item.is_read,
                'created_at': item.created_at,
                'actor': item.actor.username if item.actor else '',
            }
            for item in notifications
        ],
        'unread_count': Notification.objects.filter(recipient=request.user, is_read=False).count(),
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notifications_mark_all_read(request):
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'unread_count': 0})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_mark_read(request, pk):
    notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
    notification.is_read = True
    notification.save(update_fields=['is_read'])
    return Response({'id': notification.id, 'is_read': True})

@api_view(['POST'])
@permission_classes([AllowAny])
def api_contact_submit(request):
    serializer = PropertyInquirySerializer(data=request.data)
    if serializer.is_valid():
        inquiry = serializer.save()
        
        # Unified CRM Customer & Conversation creation
        name = request.data.get('name') or request.data.get('full_name') or 'Customer'
        phone = request.data.get('phone') or ''
        email = request.data.get('email') or ''
        message = request.data.get('message') or ''
        listing_id = request.data.get('listing_id') or request.data.get('listing') or getattr(inquiry.listing, 'id', None)
        
        customer = create_customer_for_intake(request, name, phone, email)
            
        if listing_id:
            listing = Listing.objects.filter(pk=listing_id).first()
            if listing and listing.seller:
                conversation, _ = Conversation.objects.get_or_create(
                    customer=customer,
                    listing=listing,
                    seller=listing.seller
                )
                ConversationEvent.objects.create(
                    conversation=conversation,
                    event_type='contacted',
                    channel='website',
                    description=message or f"Customer contacted about {listing.title}",
                    performed_by=request.user if request.user.is_authenticated else None
                )
                if request.user.is_authenticated and message and listing.seller.user_id and request.user.id != listing.seller.user_id:
                    Message.objects.create(
                        sender=request.user,
                        recipient=listing.seller.user,
                        listing=listing,
                        content=message,
                    )
                from .consumers import push_notification
                push_notification(
                    recipient=listing.seller.user,
                    actor=request.user if request.user.is_authenticated else None,
                    notification_type='new_contact',
                    message=f'New inquiry about {listing.title}',
                    link='/admin/enquiries/',
                )
                for admin_user in User.objects.filter(role__in=['admin', 'owner', 'staff']).exclude(id=listing.seller.user_id):
                    push_notification(
                        recipient=admin_user,
                        actor=request.user if request.user.is_authenticated else None,
                        notification_type='new_contact',
                        message=f'New inquiry about {listing.title}',
                        link='/admin/enquiries/',
                    )
                
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_public_updates(request):
    updates = Updates.objects.all().order_by('-created_at')
    return get_paginated_response(updates, UpdatesSerializer, request)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_platform_stats(request):
    listings_count = Listing.objects.filter(status='published').count()
    sellers_count = SellerProfile.objects.filter(status='approved').count()
    return Response({
        'listings_count': listings_count,
        'sellers_count': sellers_count
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_land_articles(request):
    articles = Article.objects.filter(is_published=True).order_by('-created_at')
    return get_paginated_response(articles, ArticleSerializer, request)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_article_categories(request):
    categories = ArticleCategory.objects.all()
    return Response(ArticleCategorySerializer(categories, many=True).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_article_detail(request, slug):
    article = get_object_or_404(Article, slug=slug, is_published=True)
    return Response(ArticleSerializer(article).data)

# ==========================================
# Verification Endpoints
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_verification_docs(request, pk):
    listing = get_object_or_404(Listing, pk=pk)
    # Seller check
    if not request.user.is_superuser and listing.seller.user != request.user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
    data = request.data.copy()
    data['listing'] = listing.id
    serializer = VerificationDocumentSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def list_verification_requests(request):
    err = check_admin_permission(request)
    if err: return err
    docs = VerificationDocument.objects.all().order_by('-uploaded_at')
    return get_paginated_response(docs, VerificationDocumentSerializer, request)

@api_view(['GET'])
def get_verification_request_detail(request, pk):
    err = check_admin_permission(request)
    if err: return err
    doc = get_object_or_404(VerificationDocument, pk=pk)
    return Response(VerificationDocumentSerializer(doc).data)

@api_view(['POST'])
def admin_review_document(request, doc_id):
    err = check_admin_permission(request)
    if err: return err
    doc = get_object_or_404(VerificationDocument, pk=doc_id)
    data = request.data.copy()
    data['document'] = doc.id
    serializer = VerificationReviewSerializer(data=data)
    if serializer.is_valid():
        serializer.save(reviewer=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def listing_audit_log(request, pk):
    err = check_admin_permission(request)
    if err: return err
    listing = get_object_or_404(Listing, pk=pk)
    logs = ListingAuditLog.objects.filter(listing=listing).order_by('-timestamp')
    return get_paginated_response(logs, ListingAuditLogSerializer, request)

# ==========================================
# Seller Endpoints
# ==========================================

@api_view(['GET'])
def seller_listings_list(request):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    if not profile:
        return Response({'error': 'No seller profile found'}, status=status.HTTP_404_NOT_FOUND)
    
    listings = Listing.objects.filter(seller=profile).order_by('-date_listed')
    return get_paginated_response(listings, ListingSerializer, request)

@api_view(['POST'])
def seller_create_listing(request):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    if not profile:
        return Response({'error': 'No seller profile found'}, status=status.HTTP_404_NOT_FOUND)
        
    data = request.data.copy()
    if not data.get('description'):
        data['description'] = f"{data.get('title') or 'Property'} in {data.get('district') or 'Rwanda'}. Contact Urugwiro to arrange a viewing and verify the property details."
    if not data.get('address'):
        data['address'] = ', '.join(filter(None, [data.get('sector'), data.get('district'), data.get('province')])) or 'Rwanda'
    serializer = SellerListingWriteSerializer(data=data)
    if serializer.is_valid():
        asset = create_listing_asset(data, data.get('category') or 'house', data.get('title'))
        listing = serializer.save(seller=profile, asset=asset)
        update_listing_asset_and_specs(listing, data)
        # Handle verification documents
        has_docs = False
        for field_name, doc_type in [
            ('title_deed', 'Title Deed / UPI Certificate'),
            ('id_document', 'National ID / Passport'),
            ('proof_of_ownership', 'Proof of Ownership'),
        ]:
            doc_file = request.FILES.get(field_name)
            if doc_file:
                VerificationDocument.objects.create(
                    listing=listing,
                    file=doc_file,
                    document_type=doc_type,
                    is_verified=False
                )
                has_docs = True
        if has_docs:
            listing.verification_level = 'submitted'
        # Create a default slug
        listing.slug = slugify(f"{listing.title}-{listing.id}")
        listing.save()
        listing.refresh_from_db()
        return Response(ListingSerializer(listing, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def seller_listing_detail_manage(request, pk):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    listing = get_object_or_404(Listing, pk=pk, seller=profile)
    
    if request.method == 'GET':
        return Response(ListingSerializer(listing, context={'request': request}).data)
    elif request.method in ['PUT', 'PATCH']:
        serializer = SellerListingWriteSerializer(listing, data=request.data, partial=True)
        if serializer.is_valid():
            update_listing_asset_and_specs(listing, request.data)
            serializer.save()
            if listing.status == 'published':
                listing.status = 'submitted'
                listing.verification_level = 'submitted' if listing.verification_docs.exists() else 'none'
                listing.save(update_fields=['status', 'verification_level'])
            listing.refresh_from_db()
            return Response(ListingSerializer(listing, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        listing.status = 'archived'
        listing.save(update_fields=['status'])
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def seller_listing_toggle_status(request, pk):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    listing = get_object_or_404(Listing, pk=pk, seller=profile)
    serializer = SellerListingWriteSerializer(listing, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    if 'status' not in serializer.validated_data:
        raise ValidationError({'status': 'Required.'})
    serializer.save()
    return Response(ListingSerializer(listing).data)

@api_view(['POST'])
def seller_upload_listing_media(request, pk):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    listing = get_object_or_404(Listing, pk=pk, seller=profile)
    
    data = request.data.copy()
    data['listing'] = listing.id
    serializer = ListingMediaSerializer(data=data)
    if serializer.is_valid():
        serializer.save(listing=listing)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def seller_manage_listing_media(request, pk):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    media = get_object_or_404(ListingMedia, pk=pk, listing__seller=profile)
    
    if request.method == 'PUT':
        serializer = ListingMediaSerializer(media, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        media.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def seller_reviews(request):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    reviews = ListingReview.objects.filter(listing__seller=profile).order_by('-created_at')
    return get_paginated_response(reviews, ListingReviewSerializer, request)

@api_view(['GET'])
def seller_offers_list(request):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    offers = Offer.objects.filter(seller=profile).order_by('-created_at')
    return get_paginated_response(offers, OfferSerializer, request)

@api_view(['POST'])
def seller_offer_respond(request, pk):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    offer = get_object_or_404(Offer, pk=pk, seller=profile)

    # Frontend sends {action, amount}; also accept a raw {status} for API callers.
    action = request.data.get('action') or request.data.get('status')
    amount = request.data.get('amount', request.data.get('offered_amount'))

    status_map = {
        'accept': 'accepted', 'accepted': 'accepted',
        'reject': 'declined', 'rejected': 'declined', 'declined': 'declined',
        'counter': 'negotiating', 'countered': 'negotiating', 'negotiating': 'negotiating',
    }
    new_status = status_map.get(action)
    if not new_status:
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

    if new_status == 'negotiating':
        try:
            offer.offered_amount = Decimal(str(amount))
        except (InvalidOperation, TypeError, ValueError):
            return Response({'error': 'Counter requires a valid amount'}, status=status.HTTP_400_BAD_REQUEST)

    offer.status = new_status
    offer.save()
    return Response(OfferSerializer(offer).data)

@api_view(['GET'])
def seller_inquiries_list(request):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    inquiries = PropertyInquiry.objects.filter(listing__seller=profile).order_by('-created_at')
    return get_paginated_response(inquiries, PropertyInquirySerializer, request)

@api_view(['GET', 'PUT'])
def seller_inquiry_detail(request, pk):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    inquiry = get_object_or_404(PropertyInquiry, pk=pk, listing__seller=profile)
    
    if request.method == 'GET':
        return Response(PropertyInquirySerializer(inquiry).data)
    elif request.method == 'PUT':
        serializer = PropertyInquirySerializer(inquiry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def seller_visits_list(request):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    visits = Visit.objects.filter(seller=profile).order_by('-preferred_date')
    return get_paginated_response(visits, VisitSerializer, request)

@api_view(['PUT'])
def seller_visit_update(request, pk):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    visit = get_object_or_404(Visit, pk=pk, seller=profile)
    
    serializer = VisitSerializer(visit, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def seller_likes_list(request):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    saved_props = SavedProperty.objects.filter(listing__seller=profile).order_by('-saved_at')
    return get_paginated_response(saved_props, SavedPropertySerializer, request)

@api_view(['GET'])
def seller_conversations_list(request):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    conversations = Conversation.objects.filter(seller=profile).order_by('-last_interaction_at')
    return get_paginated_response(conversations, ConversationSerializer, request)

@api_view(['GET', 'PUT'])
def seller_conversation_detail(request, pk):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    conv = get_object_or_404(Conversation, pk=pk, seller=profile)
    if request.method == 'GET':
        return Response(ConversationSerializer(conv).data)
    elif request.method == 'PUT':
        serializer = ConversationSerializer(conv, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def seller_conversation_add_event(request, pk):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    conv = get_object_or_404(Conversation, pk=pk, seller=profile)
    data = request.data.copy()
    data['conversation'] = conv.id
    serializer = ConversationEventSerializer(data=data)
    if serializer.is_valid():
        serializer.save(performed_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def seller_earnings(request):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    transactions = Transaction.objects.filter(seller=profile).order_by('-created_at')
    payments = SellerPayment.objects.filter(seller=profile).order_by('-created_at')
    
    total_earned = transactions.filter(status='completed').aggregate(Sum('seller_amount'))['seller_amount__sum'] or 0
    total_paid = payments.filter(status='paid').aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
    total_pending = payments.exclude(status='paid').aggregate(Sum('remaining_balance'))['remaining_balance__sum'] or (total_earned - total_paid)
    
    return Response({
        'summary': {
            'total_earned': float(total_earned),
            'total_paid': float(total_paid),
            'total_pending': float(max(0, total_pending)),
            'currency': 'RWF',
        },
        'transactions': TransactionSerializer(transactions, many=True).data,
        'payments': SellerPaymentSerializer(payments, many=True).data,
    })

# ==========================================
# Customer/Consumer Endpoints
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consumer_dashboard_metrics(request):
    user = request.user
    customer = getattr(user, 'customer_profile', None)
    
    saved_count = SavedProperty.objects.filter(user=user).count()
    offers_count = Offer.objects.filter(customer=customer).count() if customer else 0
    visits_count = Visit.objects.filter(customer=customer).count() if customer else 0
    
    return Response({
        'saved_properties': saved_count,
        'my_offers': offers_count,
        'my_visits': visits_count
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consumer_offers_list(request):
    customer = getattr(request.user, 'customer_profile', None)
    if not customer:
        return Response([])
    offers = Offer.objects.filter(customer=customer).order_by('-created_at')
    return get_paginated_response(offers, OfferSerializer, request)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consumer_visits_list(request):
    customer = getattr(request.user, 'customer_profile', None)
    if not customer:
        return Response([])
    visits = Visit.objects.filter(customer=customer).order_by('-preferred_date')
    return get_paginated_response(visits, VisitSerializer, request)

@api_view(['POST'])
@permission_classes([AllowAny])
def consumer_visit_book(request):
    listing_id = request.data.get('listing') or request.data.get('listing_id')
    if not listing_id:
        return Response({'error': 'Listing ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    listing = get_object_or_404(Listing, pk=listing_id)
    
    name = request.data.get('name') or request.data.get('full_name') or (request.user.get_full_name() if request.user.is_authenticated else '') or 'Customer'
    phone = request.data.get('phone') or getattr(request.user, 'phone_number', '')
    email = request.data.get('email') or (request.user.email if request.user.is_authenticated else '')
    
    customer = create_customer_for_intake(request, name, phone, email)
        
    conversation = None
    if listing.seller:
        conversation, _ = Conversation.objects.get_or_create(
            customer=customer,
            listing=listing,
            seller=listing.seller
        )
        
    preferred_date = request.data.get('preferred_date') or request.data.get('scheduled_date')
    preferred_time_val = request.data.get('preferred_time') or request.data.get('scheduled_time')
    
    time_obj = None
    if preferred_time_val:
        from datetime import time
        if ':' in str(preferred_time_val):
            try:
                part = str(preferred_time_val).split('-')[0].strip()
                h, m = part.split(':')[:2]
                time_obj = time(int(h), int(m))
            except Exception:
                time_obj = None
                
    if not preferred_date:
        from django.utils import timezone
        preferred_date = timezone.now().date()
        
    visit = Visit.objects.create(
        customer=customer,
        listing=listing,
        seller=listing.seller,
        conversation=conversation,
        preferred_date=preferred_date,
        preferred_time=time_obj,
        phone=phone,
        email=email,
        notes=request.data.get('notes', '') or (f"Time slot: {preferred_time_val}" if preferred_time_val else ''),
        status='requested'
    )

    if listing.seller and listing.seller.user_id:
        from .consumers import push_notification
        push_notification(
            recipient=listing.seller.user,
            actor=request.user if request.user.is_authenticated else None,
            notification_type='visit_request',
            message=f'New visit request for {listing.title}',
            link='/seller/visits/',
        )
        for admin_user in User.objects.filter(role__in=['admin', 'owner', 'staff']).exclude(id=listing.seller.user_id):
            push_notification(
                recipient=admin_user,
                actor=request.user if request.user.is_authenticated else None,
                notification_type='visit_request',
                message=f'New visit request for {listing.title}',
                link='/admin/visits/',
            )
    
    if conversation:
        ConversationEvent.objects.create(
            conversation=conversation,
            event_type='visit_requested',
            channel='website',
            description=f"Visit requested for {preferred_date} ({preferred_time_val or 'Any time'})",
            performed_by=request.user if request.user.is_authenticated else None
        )
        
    return Response(VisitSerializer(visit).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def consumer_visit_cancel(request, pk):
    customer = getattr(request.user, 'customer_profile', None)
    if not customer:
        return Response({'error': 'No customer profile'}, status=status.HTTP_400_BAD_REQUEST)
        
    visit = get_object_or_404(Visit, pk=pk, customer=customer)
    visit.status = 'cancelled'
    visit.save()
    return Response(VisitSerializer(visit).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consumer_saved_properties(request):
    listings = public_listings(request.user).filter(
        saved_by__user=request.user,
    ).order_by('-saved_by__saved_at')
    return get_paginated_response(listings, PublicListingSerializer, request)

# ==========================================
# Admin CRM Endpoints
# ==========================================

@api_view(['GET', 'POST'])
def admin_customers_list(request):
    err = check_admin_permission(request)
    if err: return err
    if request.method == 'GET':
        customers = Customer.objects.all().order_by('-last_activity_at')
        return get_paginated_response(customers, CustomerSerializer, request)
    elif request.method == 'POST':
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def admin_customer_detail(request, pk):
    err = check_admin_permission(request)
    if err: return err
    customer = get_object_or_404(Customer, pk=pk)
    
    if request.method == 'GET':
        return Response(CustomerSerializer(customer).data)
    elif request.method == 'PUT':
        serializer = CustomerSerializer(customer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        customer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def admin_conversations_list(request):
    err = check_admin_permission(request)
    if err: return err
    conversations = Conversation.objects.all().order_by('-last_interaction_at')
    return get_paginated_response(conversations, ConversationSerializer, request)

@api_view(['GET', 'PUT'])
def admin_conversation_detail(request, pk):
    err = check_admin_permission(request)
    if err: return err
    conv = get_object_or_404(Conversation, pk=pk)
    
    if request.method == 'GET':
        return Response(ConversationSerializer(conv).data)
    elif request.method == 'PUT':
        serializer = ConversationSerializer(conv, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def admin_conversation_add_event(request, pk):
    err = check_admin_permission(request)
    if err: return err
    conv = get_object_or_404(Conversation, pk=pk)
    
    data = request.data.copy()
    data['conversation'] = conv.id
    serializer = ConversationEventSerializer(data=data)
    if serializer.is_valid():
        serializer.save(performed_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def admin_follow_ups_list(request):
    err = check_admin_permission(request)
    if err: return err
    if request.method == 'GET':
        follow_ups = FollowUp.objects.all().order_by('due_date')
        return get_paginated_response(follow_ups, FollowUpSerializer, request)
    elif request.method == 'POST':
        serializer = FollowUpSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
def admin_follow_up_detail(request, pk):
    err = check_admin_permission(request)
    if err: return err
    follow_up = get_object_or_404(FollowUp, pk=pk)
    
    if request.method == 'GET':
        return Response(FollowUpSerializer(follow_up).data)
    elif request.method == 'PUT':
        serializer = FollowUpSerializer(follow_up, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ==========================================
# Admin Visit & Offer management
# ==========================================

@api_view(['GET'])
def admin_visits_list(request):
    err = check_admin_permission(request)
    if err: return err
    visits = Visit.objects.all().order_by('-preferred_date')
    return get_paginated_response(visits, VisitSerializer, request)

@api_view(['GET', 'PUT', 'PATCH'])
def admin_visit_detail_update(request, pk):
    err = check_admin_permission(request)
    if err: return err
    visit = get_object_or_404(Visit, pk=pk)
    if request.method == 'GET':
        return Response(VisitSerializer(visit).data)
    serializer = VisitSerializer(visit, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def admin_likes_list(request):
    err = check_admin_permission(request)
    if err: return err
    likes = SavedProperty.objects.all().order_by('-saved_at')
    return get_paginated_response(likes, SavedPropertySerializer, request)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def list_create_offers(request):
    if request.method == 'GET':
        err = check_admin_permission(request)
        if err: return err
        offers = Offer.objects.all().order_by('-created_at')
        return get_paginated_response(offers, OfferSerializer, request)
    elif request.method == 'POST':
        listing_id = request.data.get('listing') or request.data.get('listing_id')
        if not listing_id:
            return Response({'error': 'Listing ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        listing = get_object_or_404(Listing, pk=listing_id)
        
        amount = request.data.get('amount') or request.data.get('offered_amount')
        if not amount:
            return Response({'error': 'Offer amount is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        message = request.data.get('notes') or request.data.get('message', '')
        name = request.data.get('name') or (request.user.get_full_name() if request.user.is_authenticated else '') or 'Customer'
        phone = request.data.get('phone') or getattr(request.user, 'phone_number', '')
        email = request.data.get('email') or (request.user.email if request.user.is_authenticated else '')
        
        customer = create_customer_for_intake(request, name, phone, email)
            
        conversation = None
        if listing.seller:
            conversation, _ = Conversation.objects.get_or_create(
                customer=customer,
                listing=listing,
                seller=listing.seller
            )
            
        offer = Offer.objects.create(
            listing=listing,
            customer=customer,
            seller=listing.seller,
            conversation=conversation,
            asking_price=listing.price or 0,
            offered_amount=amount,
            currency=listing.currency or 'RWF',
            message=message,
            status='new'
        )
        
        if conversation:
            ConversationEvent.objects.create(
                conversation=conversation,
                event_type='offer_made',
                channel='website',
                description=f"Offer submitted: {float(amount):,.0f} {listing.currency or 'RWF'}",
                performed_by=request.user if request.user.is_authenticated else None
            )
            
        return Response(OfferSerializer(offer).data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
def update_offer_status(request, pk):
    err = check_admin_permission(request)
    if err: return err
    offer = get_object_or_404(Offer, pk=pk)
    serializer = OfferSerializer(offer, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ==========================================
# Admin Listing management
# ==========================================

@api_view(['GET', 'POST'])
def admin_properties_list_create(request):
    err = check_admin_permission(request)
    if err: return err
    if request.method == 'GET':
        listings = Listing.objects.all().order_by('-date_listed')
        return get_paginated_response(listings, ListingSerializer, request)
    elif request.method == 'POST':
        data = request.data.copy()
        if not data.get('description'):
            data['description'] = f"{data.get('title') or 'Property'} in {data.get('district') or 'Rwanda'}. Contact Urugwiro to arrange a viewing and verify the property details."
        if not data.get('address'):
            data['address'] = ', '.join(filter(None, [data.get('sector'), data.get('district'), data.get('province')])) or 'Rwanda'
        serializer = ListingCreateSerializer(data=data)
        if serializer.is_valid():
            seller_id = request.data.get('seller_id')
            seller = get_object_or_404(SellerProfile, pk=seller_id) if seller_id else getattr(request.user, 'seller_profile', None)
            if not seller and request.user.is_authenticated:
                seller = SellerProfile.objects.create(
                    user=request.user,
                    name=request.user.get_full_name() or request.user.username,
                    email=request.user.email or 'admin@urugwiro.rw',
                    phone_number='Not provided',
                    status='approved',
                    is_verified=True,
                )
            if not seller:
                return Response({'error': 'Create a seller profile before adding a property.'}, status=status.HTTP_400_BAD_REQUEST)
            asset = create_listing_asset(data, data.get('category') or 'house', data.get('title'))
            listing = serializer.save(seller=seller, asset=asset)
            update_listing_asset_and_specs(listing, data)
            # Handle verification documents
            has_docs = False
            for field_name, doc_type in [
                ('title_deed', 'Title Deed / UPI Certificate'),
                ('id_document', 'National ID / Passport'),
                ('proof_of_ownership', 'Proof of Ownership'),
            ]:
                doc_file = request.FILES.get(field_name)
                if doc_file:
                    VerificationDocument.objects.create(
                        listing=listing,
                        file=doc_file,
                        document_type=doc_type,
                        is_verified=False
                    )
                    has_docs = True
            if has_docs:
                listing.verification_level = 'submitted'
            listing.slug = slugify(f"{listing.title}-{listing.id}")
            listing.save()
            listing.refresh_from_db()
            return Response(ListingSerializer(listing, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def admin_property_detail_manage(request, pk):
    err = check_admin_permission(request)
    if err: return err
    listing = get_object_or_404(Listing, pk=pk)
    
    if request.method == 'GET':
        return Response(ListingSerializer(listing, context={'request': request}).data)
    elif request.method in ['PUT', 'PATCH']:
        serializer = ListingCreateSerializer(listing, data=request.data, partial=True)
        if serializer.is_valid():
            if listing.status in {'sold', 'rented'}:
                changed_fields = {
                    key for key, value in serializer.validated_data.items()
                    if key != 'status' or value != listing.status
                }
                changed_fields.update(set(request.data) - {'status'})
                if changed_fields:
                    raise ValidationError({'status': 'Completed listings are immutable.'})
            with transaction.atomic():
                update_listing_asset_and_specs(listing, request.data)
                serializer.save()
                ensure_transaction_for_sold_listing(listing)
            listing.refresh_from_db()
            return Response(ListingSerializer(listing, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        listing.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def admin_upload_listing_media(request, pk):
    err = check_admin_permission(request)
    if err: return err
    listing = get_object_or_404(Listing, pk=pk)
    data = request.data.copy()
    data['listing'] = listing.id
    serializer = ListingMediaSerializer(data=data)
    if serializer.is_valid():
        serializer.save(listing=listing)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def admin_manage_listing_media(request, pk):
    err = check_admin_permission(request)
    if err: return err
    media = get_object_or_404(ListingMedia, pk=pk)
    
    if request.method == 'PUT':
        serializer = ListingMediaSerializer(media, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        media.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['DELETE'])
def admin_listing_delete(request, pk):
    err = check_admin_permission(request)
    if err: return err
    listing = get_object_or_404(Listing, pk=pk)
    listing.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# ==========================================
# Admin Seller management
# ==========================================

@api_view(['GET', 'POST'])
def admin_sellers_list_create(request):
    err = check_admin_permission(request)
    if err: return err
    if request.method == 'GET':
        sellers = SellerProfile.objects.all().order_by('-date_joined')
        return get_paginated_response(sellers, SellerProfileSerializer, request)
    elif request.method == 'POST':
        serializer = SellerProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def admin_seller_detail_manage(request, pk):
    err = check_admin_permission(request)
    if err: return err
    seller = get_object_or_404(SellerProfile, pk=pk)
    
    if request.method == 'GET':
        return Response(SellerProfileSerializer(seller).data)
    elif request.method == 'PUT':
        serializer = SellerProfileSerializer(seller, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        seller.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ==========================================
# Admin User management
# ==========================================

@api_view(['GET', 'POST'])
def admin_users_list_create(request):
    err = check_admin_permission(request, 'accounts')
    if err: return err
    if request.method == 'GET':
        users = User.objects.all().order_by('-date_joined')
        search = request.query_params.get('search', '').strip()
        role = request.query_params.get('role', '').strip()
        status_filter = request.query_params.get('status', '').strip()
        if search:
            users = users.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        if role:
            users = users.filter(role=role)
        if status_filter == 'active':
            users = users.filter(is_active=True)
        elif status_filter == 'inactive':
            users = users.filter(is_active=False)
        return get_paginated_response(users, UserSerializer, request)
    elif request.method == 'POST':
        serializer = AdminUserCreateSerializer(data=request.data)
        if serializer.is_valid():
            role = serializer.validated_data.get('role', 'customer')
            hierarchy_error = check_account_management_permission(request, requested_role=role)
            if hierarchy_error: return hierarchy_error
            user = serializer.save(is_staff=role in {'admin', 'owner'})
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def admin_user_detail_update_delete(request, pk):
    err = check_admin_permission(request, 'accounts')
    if err: return err
    user = get_object_or_404(User, pk=pk)
    
    if request.method == 'GET':
        return Response(UserSerializer(user).data)
    elif request.method in ['PUT', 'PATCH']:
        requested_role = request.data.get('role')
        hierarchy_error = check_account_management_permission(request, user, requested_role)
        if hierarchy_error: return hierarchy_error
        serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            role = serializer.validated_data.get('role', user.role)
            serializer.save(is_staff=role in {'admin', 'owner'})
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        hierarchy_error = check_account_management_permission(request, user)
        if hierarchy_error: return hierarchy_error
        if user.pk == request.user.pk:
            return Response({'error': 'You cannot deactivate your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = False
        user.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def admin_user_set_role(request, pk):
    err = check_admin_permission(request, 'accounts')
    if err: return err
    user = get_object_or_404(User, pk=pk)
    role = request.data.get('role')
    hierarchy_error = check_account_management_permission(request, user, role)
    if hierarchy_error: return hierarchy_error
    if role in dict(User._meta.get_field('role').choices):
        user.role = role
        user.is_staff = role in {'admin', 'owner'}
        user.save(update_fields=['role', 'is_staff'])
        return Response(UserSerializer(user).data)
    return Response({'error': 'Role required'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def admin_user_toggle_status(request, pk):
    err = check_admin_permission(request, 'accounts')
    if err: return err
    user = get_object_or_404(User, pk=pk)
    hierarchy_error = check_account_management_permission(request, user)
    if hierarchy_error: return hierarchy_error
    if user.pk == request.user.pk:
        return Response({'error': 'You cannot deactivate your own account.'}, status=status.HTTP_400_BAD_REQUEST)
    user.is_active = not user.is_active
    user.save(update_fields=['is_active'])
    return Response(UserSerializer(user).data)

@api_view(['POST'])
def admin_user_reset_password(request, pk):
    err = check_admin_permission(request, 'accounts')
    if err: return err
    user = get_object_or_404(User, pk=pk)
    hierarchy_error = check_account_management_permission(request, user)
    if hierarchy_error: return hierarchy_error
    new_password = request.data.get('password') or request.data.get('new_password')
    if new_password:
        try:
            validate_password(new_password, user)
        except DjangoValidationError as exc:
            raise ValidationError({'password': exc.messages})
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successful'})
    return Response({'error': 'Password required'}, status=status.HTTP_400_BAD_REQUEST)

# ==========================================
# Admin Financial
# ==========================================

@api_view(['GET', 'POST'])
def admin_transactions_list(request):
    err = check_admin_permission(request, 'finance')
    if err: return err
    if request.method == 'GET':
        transactions = Transaction.objects.all().order_by('-created_at')
        return get_paginated_response(transactions, TransactionSerializer, request)
    elif request.method == 'POST':
        serializer = TransactionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
def admin_transaction_detail(request, pk):
    err = check_admin_permission(request, 'finance')
    if err: return err
    transaction = get_object_or_404(Transaction, pk=pk)
    
    if request.method == 'GET':
        return Response(TransactionSerializer(transaction).data)
    elif request.method in ['PUT', 'PATCH']:
        serializer = TransactionSerializer(transaction, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def admin_seller_payments_list(request):
    err = check_admin_permission(request, 'finance')
    if err: return err
    if request.method == 'GET':
        payments = SellerPayment.objects.all().order_by('-created_at')
        return get_paginated_response(payments, SellerPaymentSerializer, request)
    elif request.method == 'POST':
        serializer = SellerPaymentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
def admin_seller_payment_detail(request, pk):
    err = check_admin_permission(request, 'finance')
    if err: return err
    payment = get_object_or_404(SellerPayment, pk=pk)
    
    if request.method == 'GET':
        return Response(SellerPaymentSerializer(payment).data)
    elif request.method == 'PUT':
        serializer = SellerPaymentSerializer(payment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def admin_commission_rules_list(request):
    err = check_admin_permission(request, 'finance')
    if err: return err
    if request.method == 'GET':
        rules = CommissionRule.objects.all().order_by('name')
        return get_paginated_response(rules, CommissionRuleSerializer, request)
    elif request.method == 'POST':
        serializer = CommissionRuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def admin_commission_rule_detail(request, pk):
    err = check_admin_permission(request, 'finance')
    if err: return err
    rule = get_object_or_404(CommissionRule, pk=pk)
    
    if request.method == 'GET':
        return Response(CommissionRuleSerializer(rule).data)
    elif request.method == 'PUT':
        serializer = CommissionRuleSerializer(rule, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        rule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
def admin_expenses_list(request):
    err = check_admin_permission(request, 'finance')
    if err: return err
    if request.method == 'GET':
        expenses = BusinessExpense.objects.all().order_by('-date')
        return get_paginated_response(expenses, BusinessExpenseSerializer, request)
    elif request.method == 'POST':
        serializer = BusinessExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(recorded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def admin_expense_detail(request, pk):
    err = check_admin_permission(request, 'finance')
    if err: return err
    expense = get_object_or_404(BusinessExpense, pk=pk)
    
    if request.method == 'GET':
        return Response(BusinessExpenseSerializer(expense).data)
    elif request.method == 'PUT':
        serializer = BusinessExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ==========================================
# Admin Proposals
# ==========================================

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_proposals_view(request):
    if request.method == 'GET':
        err = check_admin_permission(request)
        if err: return err
        proposals = ListingProposal.objects.all().order_by('-created_at')
        return get_paginated_response(proposals, ListingProposalSerializer, request)
    elif request.method == 'POST':
        serializer = PublicListingProposalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH'])
def api_proposal_detail_view(request, pk):
    err = check_admin_permission(request)
    if err: return err
    proposal = get_object_or_404(ListingProposal, pk=pk)
    
    if request.method == 'GET':
        return Response(ListingProposalSerializer(proposal).data)
    elif request.method in ['PUT', 'PATCH']:
        serializer = ListingProposalSerializer(proposal, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def api_convert_proposal_to_listing(request, pk):
    err = check_admin_permission(request)
    if err: return err
    proposal = get_object_or_404(ListingProposal, pk=pk)
    
    if proposal.converted_listing_id:
        return Response({'error': 'Already converted'}, status=status.HTTP_400_BAD_REQUEST)

    seller = get_seller_profile(request)
    category = {
        'apartment': 'house', 'vehicle': 'car', 'commercial': 'commercial',
    }.get(proposal.asset_type, proposal.asset_type)
    asset_data = {
        'province': '', 'district': proposal.district, 'sector': proposal.sector,
        'cell': proposal.cell, 'total_area': proposal.size_sqm,
        'bedrooms': proposal.bedrooms, 'bathrooms': proposal.bathrooms,
        'sub_type': proposal.sub_type or ('Apartment' if proposal.asset_type == 'apartment' else None),
        **proposal.specifications,
    }
    with transaction.atomic():
        asset = create_listing_asset(asset_data, category, proposal.title)
        listing = Listing.objects.create(
            asset=asset,
            seller=seller,
            title=proposal.title,
            description=proposal.description or proposal.title,
            price=proposal.proposed_price,
            currency=proposal.currency,
            category=category,
            purpose=proposal.purpose,
            address=proposal.address,
            status='draft',
            listed_by_role=request.user.role if request.user.role in {'admin', 'staff'} else 'admin',
        )
        listing.slug = slugify(f"{listing.title}-{listing.id}")
        listing.save(update_fields=['slug'])
        proposal.status = 'approved'
        proposal.converted_listing = listing
        proposal.save(update_fields=['status', 'converted_listing', 'updated_at'])
    
    return Response(ListingSerializer(listing).data, status=status.HTTP_201_CREATED)

# ==========================================
# Admin Enquiries
# ==========================================

@api_view(['GET'])
def admin_enquiries_list(request):
    err = check_admin_permission(request)
    if err: return err
    enquiries = PropertyInquiry.objects.all().order_by('-created_at')
    return get_paginated_response(enquiries, PropertyInquirySerializer, request)

@api_view(['GET', 'PUT'])
def admin_enquiry_detail_update(request, pk):
    err = check_admin_permission(request)
    if err: return err
    enquiry = get_object_or_404(PropertyInquiry, pk=pk)
    
    if request.method == 'GET':
        return Response(PropertyInquirySerializer(enquiry).data)
    elif request.method == 'PUT':
        serializer = PropertyInquirySerializer(enquiry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ==========================================
# Owner Dashboard
# ==========================================

@api_view(['GET'])
def owner_dashboard_metrics(request):
    err = check_admin_permission(request, 'finance')
    if err: return err
    
    total_listings = Listing.objects.count()
    active_listings = Listing.objects.filter(status='published').count()
    in_flight_deals = Transaction.objects.filter(status='pending').count()
    closed_deals = Transaction.objects.filter(status='completed').count()
    total_revenue = Transaction.objects.filter(status='completed').aggregate(Sum('commission_amount'))['commission_amount__sum'] or 0
    total_expenses = BusinessExpense.objects.aggregate(Sum('amount'))['amount__sum'] or 0
    net_earnings = total_revenue - total_expenses
    
    # Timeline monthly aggregates for current year
    from django.utils import timezone
    now = timezone.now()
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    properties_curve = [0] * 12
    revenue_curve = [0] * 12
    
    for l in Listing.objects.filter(date_listed__year=now.year):
        m = l.date_listed.month - 1
        if 0 <= m < 12:
            properties_curve[m] += 1
            
    for t in Transaction.objects.filter(status='completed', completed_at__year=now.year):
        if t.completed_at:
            m = t.completed_at.month - 1
            if 0 <= m < 12:
                revenue_curve[m] += float(t.commission_amount or 0)
                
    recent_transactions = Transaction.objects.select_related('listing', 'seller', 'customer').order_by('-created_at')[:10]
    recent_deals = [{
        'id': str(t.id),
        'property_title': t.listing.title if t.listing else 'Untitled',
        'seller_name': t.seller.name if t.seller else 'Seller',
        'customer_name': t.customer.full_name if t.customer else 'Direct Customer',
        'amount': float(t.agreed_price),
        'commission': float(t.commission_amount),
        'status': t.status,
        'date': t.created_at.strftime('%Y-%m-%d'),
    } for t in recent_transactions]
    
    recent_listings = Listing.objects.order_by('-date_listed')[:10]
    
    return Response({
        'metrics': {
            'total_properties': total_listings,
            'active_listings': active_listings,
            'in_flight_deals': in_flight_deals,
            'closed_deals': closed_deals,
            'total_revenue': float(total_revenue),
            'total_expenses': float(total_expenses),
            'net_earnings': float(net_earnings),
            'currency': 'RWF',
        },
        'timeline': {
            'labels': labels,
            'properties_curve': properties_curve,
            'revenue_curve': revenue_curve,
        },
        'listings': ListingSerializer(recent_listings, many=True).data,
        'recent_deals': recent_deals,
        'revenue': float(total_revenue),
        'expenses': float(total_expenses),
        'total_listings': total_listings,
    })


# ==========================================
# System
# ==========================================

@api_view(['GET', 'POST'])
def manage_system_settings(request):
    err = check_admin_permission(request, 'settings')
    if err: return err
    if request.method == 'GET':
        settings = SystemSetting.objects.all()
        return Response(SystemSettingSerializer(settings, many=True).data)
    elif request.method == 'POST':
        serializer = SystemSettingSerializer(data=request.data)
        if serializer.is_valid():
            setting, created = SystemSetting.objects.update_or_create(
                key=serializer.validated_data['key'],
                defaults={
                    'value': serializer.validated_data['value'],
                    'description': serializer.validated_data.get('description', ''),
                },
            )
            return Response(
                SystemSettingSerializer(setting).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def test_system_ai_connection(request):
    err = check_admin_permission(request, 'settings')
    if err:
        return err
    model = str(request.data.get('model') or '').strip() or None
    if model and (len(model) > 200 or not re.fullmatch(r'[A-Za-z0-9._/-]+', model)):
        return Response({'error': 'Invalid model identifier'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        return Response(test_ai_connection(model=model))
    except RuntimeError as exc:
        return Response({'error': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except requests.Timeout:
        return Response(
            {'error': 'NVIDIA NIM did not respond before the connection test timed out.'},
            status=status.HTTP_504_GATEWAY_TIMEOUT,
        )
    except requests.RequestException as exc:
        response_status = getattr(exc.response, 'status_code', None)
        message = 'NVIDIA NIM rejected the connection test.' if response_status else 'NVIDIA NIM is unreachable.'
        return Response(
            {'error': message, 'provider_status': response_status},
            status=status.HTTP_502_BAD_GATEWAY,
        )


@api_view(['GET', 'DELETE'])
def manage_system_logs(request):
    err = check_admin_permission(request, 'settings')
    if err: return err
    if request.method == 'DELETE':
        if request.user.role != 'owner' and not request.user.is_superuser:
            return Response({'error': 'Only an owner can clear system logs.'}, status=status.HTTP_403_FORBIDDEN)
        deleted, _ = SystemLog.objects.all().delete()
        return Response({'deleted': deleted})

    logs = SystemLog.objects.select_related('user').all()
    level = request.query_params.get('level', '').strip().upper()
    category = request.query_params.get('category', '').strip().upper()
    search = request.query_params.get('search', '').strip()
    if level:
        logs = logs.filter(level=level)
    if category:
        logs = logs.filter(category=category)
    if search:
        logs = logs.filter(
            Q(message__icontains=search) | Q(path__icontains=search)
            | Q(user__username__icontains=search)
        )
    return get_paginated_response(logs, SystemLogSerializer, request)

# ==========================================
# Valuation
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def valuation_estimate(request):
    category = str(request.data.get('category') or request.data.get('property_type') or '').strip().lower()
    purpose = str(request.data.get('purpose') or '').strip().lower()
    currency = str(request.data.get('currency') or 'RWF').strip().upper()
    rental_frequency = str(request.data.get('rental_frequency') or '').strip().lower() or None
    size = request.data.get('area_sqm') or request.data.get('size')
    if not category:
        return Response({'error': 'Property category is required'}, status=status.HTTP_400_BAD_REQUEST)
    if category not in dict(Listing.CATEGORY_CHOICES):
        return Response({'error': 'Unsupported property category'}, status=status.HTTP_400_BAD_REQUEST)
    if purpose not in dict(Listing.PURPOSE_CHOICES):
        return Response({'error': 'Purpose must be sale or rent'}, status=status.HTTP_400_BAD_REQUEST)
    if not re.fullmatch(r'[A-Z]{3,10}', currency):
        return Response({'error': 'Currency must be a 3-10 letter code'}, status=status.HTTP_400_BAD_REQUEST)
    if purpose == 'rent' and rental_frequency not in dict(Listing.RENTAL_FREQUENCY_CHOICES):
        return Response(
            {'error': 'Rental frequency is required for rental estimates'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if size not in (None, ''):
        try:
            if Decimal(str(size)) <= 0:
                raise ValueError
        except (InvalidOperation, TypeError, ValueError):
            return Response({'error': 'Area must be a positive number'}, status=status.HTTP_400_BAD_REQUEST)

    estimate = ValuationService.get_valuation_estimate(
        category=category,
        purpose=purpose,
        currency=currency,
        province=request.data.get('province'),
        district=request.data.get('district'),
        sector=request.data.get('sector'),
        size=size,
        rental_frequency=rental_frequency,
    )
    return Response({
        **estimate,
        'currency': currency,
        'property_type': category,
        'purpose': purpose,
        'rental_frequency': rental_frequency,
        'size': size,
    })

@api_view(['POST'])
def ai_listing_narrative(request):
    err = check_seller_permission(request)
    if err: return err
    return Response(generate_listing_narrative(request.data))

@api_view(['POST'])
def ai_offer_analysis(request):
    err = check_seller_permission(request)
    if err: return err
    return Response(analyze_offer(request.data))

@api_view(['POST'])
@permission_classes([AllowAny])
def visual_search(request):
    image = request.FILES.get('image')
    if not image:
        return Response({'error': 'An image is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        descriptor = describe_listing_image(image)
    except RuntimeError as exc:
        return Response({'error': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception:
        logger.exception('Visual search failed')
        return Response({'error': 'Visual search is temporarily unavailable'}, status=status.HTTP_502_BAD_GATEWAY)

    queryset = Listing.objects.filter(status='published').select_related('asset', 'seller').prefetch_related('media')
    category = str(descriptor.get('category') or '').lower()
    category_map = {'apartment': 'house', 'vehicle': 'car'}
    if category in category_map:
        category = category_map[category]
    if category in {'house', 'land', 'car', 'commercial', 'hotel'}:
        queryset = queryset.filter(category=category)
    keywords = str(descriptor.get('keywords') or '').strip()
    if keywords:
        queryset = queryset.filter(Q(title__icontains=keywords) | Q(description__icontains=keywords))
    return Response({'listings': ListingSerializer(queryset[:20], many=True, context={'request': request}).data, 'analysis': descriptor})

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Process liveness check; dependency checks live at /api/ready/."""
    return Response({
        'status': 'ok',
        'service': 'urugwiro-backend',
        'healthy': True
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def readiness_check(request):
    failures = []
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
    except Exception:
        logger.exception('Readiness database probe failed')
        failures.append('database')
    try:
        cache.set('urugwiro-readiness', 'ok', timeout=10)
        if cache.get('urugwiro-readiness') != 'ok':
            raise RuntimeError('Cache read-after-write failed')
    except Exception:
        logger.exception('Readiness cache probe failed')
        failures.append('cache')
    return Response(
        {'status': 'unavailable', 'dependencies': failures} if failures else {'status': 'ready'},
        status=status.HTTP_503_SERVICE_UNAVAILABLE if failures else status.HTTP_200_OK,
    )
