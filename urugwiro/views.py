from django.db.models import Q, Min, Max, Avg
from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator
from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpResponse, JsonResponse
from django.utils.timezone import now, timedelta
from django.utils.text import slugify
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import paypalrestsdk

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    User, Listing, ListingOwner, ListingMedia,
    RentalExtension, SaleExtension, LandExtension, VehicleExtension, ServiceExtension,
    Unit, Lease, Tenant, MaintenanceRequest, Payment, Visit, LikedProperties, CustRequest,
    Property, SaleProperty, Owner, Seller, Agent, Offer, AgentAssignment, SiteVisit,
    PropertyInquiry, AgentReview, Post, PostMedia, Hashtag, PostHashtag, PostComment,
    PostLike, Notification, Announcement, PropertyImage, CustomerMessage, Updates, Email, Message
)
from .forms import *
from .serializers import *


def is_admin(user):
    return user.is_authenticated and user.role == 'Admin'


@csrf_exempt
@api_view(['GET', 'POST', 'DELETE'])
def properties(request):
    if request.method == 'GET':
        property_list = Property.objects.all()
        serializer = PropertySerializer(property_list, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = PropertySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        Property.objects.all().delete()
        return Response(status=204)


@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
def property_details(request, pk):
    try:
        property = Property.objects.get(pk=pk)
    except Property.DoesNotExist:
        return Response(status=404)

    if request.method == 'GET':
        serializer = PropertySerializer(property)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = PropertySerializer(property, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        property.delete()
        return Response(status=204)


@csrf_exempt
@api_view(['GET', 'POST', 'DELETE'])
def tenants(request):
    if request.method == 'GET':
        tenant_list = Tenant.objects.all()
        serializer = TenantSerializer(tenant_list, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = TenantSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        Tenant.objects.all().delete()
        return Response(status=204)


@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
def tenant_details(request, pk):
    try:
        tenant = Tenant.objects.get(pk=pk)
    except Tenant.DoesNotExist:
        return Response(status=404)

    if request.method == 'GET':
        serializer = TenantSerializer(tenant)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = TenantSerializer(tenant, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        tenant.delete()
        return Response(status=204)


@csrf_exempt
@api_view(['GET', 'POST', 'DELETE'])
def units(request):
    if request.method == 'GET':
        unit_list = Unit.objects.all()
        serializer = UnitSerializer(unit_list, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = UnitSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        Unit.objects.all().delete()
        return Response(status=204)


@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
def unit_details(request, pk):
    try:
        unit = Unit.objects.get(pk=pk)
    except Unit.DoesNotExist:
        return Response(status=404)

    if request.method == 'GET':
        serializer = UnitSerializer(unit)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = UnitSerializer(unit, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        unit.delete()
        return Response(status=204)


@csrf_exempt
@api_view(['GET', 'POST', 'DELETE'])
def leases(request):
    if request.method == 'GET':
        lease_list = Lease.objects.all()
        serializer = LeaseSerializer(lease_list, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = LeaseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        Lease.objects.all().delete()
        return Response(status=204)


@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
def lease_details(request, pk):
    try:
        lease = Lease.objects.get(pk=pk)
    except Lease.DoesNotExist:
        return Response(status=404)
    if request.method == 'GET':
        serializer = LeaseSerializer(lease)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = LeaseSerializer(lease, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        lease.delete()
        return Response(status=204)


@csrf_exempt
def index(request):
    user = request.user.id
    owner_user = Owner.objects.filter(user_id=user).exists()
    tenant_user = Tenant.objects.filter(user_id=user).exists()
    featured_properties = Property.objects.all().order_by('-date_added')[:3]
    tenant = Tenant.objects.all()
    property = Property.objects.all()
    # Add statistics
    total_properties = Property.objects.count()
    total_users = User.objects.count()
    total_owners = Owner.objects.count()
    total_tenants = Tenant.objects.count()
    # Marketplace data
    sale_properties_featured = SaleProperty.objects.filter(status='listed').order_by('-is_featured', '-date_listed')[:6]
    featured_agents = Agent.objects.filter(is_verified=True).order_by('-rating', '-total_deals')[:4]

    property_types = [
        ('Apartments', 'property_list', 'apartment', 'For Rent', 'type=apartment'),
        ('Houses', 'sale_listings', 'home', 'Buy or Rent', 'property_type=house'),
        ('Land', 'sale_listings', 'landscape', 'For Sale', 'property_type=land'),
        ('Commercial', 'property_list', 'store', 'For Rent', 'type=commercial'),
        ('Villas', 'sale_listings', 'villa', 'Luxury', 'property_type=villa'),
        ('All', 'sale_listings', 'grid_view', 'Browse All', ''),
    ]

    value_props = [
        ('verified_user', 'Verified Listings', 'Every property is inspected and verified by our team before going live — no scams, no surprises.'),
        ('price_check', 'Best Price Guarantee', 'We compare market prices to ensure you\'re always getting a fair deal on every listing.'),
        ('support_agent', 'Dedicated Support 24/7', 'Our team is always available to answer questions, resolve issues, and guide your property journey.'),
        ('contract', 'Paperless Agreements', 'Sign leases and agreements digitally — fast, secure, and legally valid from any device.'),
        ('trending_up', 'Market Insights', 'Access real-time data and analytics to make smarter buying, renting, or selling decisions.'),
        ('forum', 'Direct Agent Chat', 'Message agents and property owners directly — no middlemen, no delays, just clear communication.'),
    ]

    context = {
        'owner_user': owner_user,
        'tenant': tenant,
        'property': property,
        'featured_properties': featured_properties,
        'tenant_user': tenant_user,
        'total_properties': total_properties,
        'total_users': total_users,
        'total_owners': total_owners,
        'total_tenants': total_tenants,
        'sale_properties_featured': sale_properties_featured,
        'featured_agents': featured_agents,
        'property_types': property_types,
        'value_props': value_props,
        'show_infobar': True,
    }
    return render(request, 'home/home.html', context)


def explore(request):
    """
    Unified Discovery Experience: Handles all asset types with advanced filtering.
    Implements the Triple-Pane layout: Filters | Listings | Map.
    """
    listings = Listing.objects.all().select_related('owner')

    # --- Filter Intelligence ---
    search = request.GET.get('search', '')
    asset_type = request.GET.get('type', 'All')
    status = request.GET.get('status', 'All')
    price_min = request.GET.get('min_price', '')
    price_max = request.GET.get('max_price', '')
    city = request.GET.get('city', 'Kigali')
    sort = request.GET.get('sort', 'newest')

    # Search filter
    if search:
        listings = listings.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(address__icontains=search)
        )

    # Asset type filter
    if asset_type != 'All':
        listings = listings.filter(listing_type=asset_type.lower())

    # Status filter
    if status != 'All':
        listings = listings.filter(status=status.lower())

    # Price range filter
    if price_min:
        listings = listings.filter(price__gte=price_min)
    if price_max:
        listings = listings.filter(price__lte=price_max)

    # City filter
    if city:
        listings = listings.filter(city__icontains=city)

    # --- Sorting ---
    if sort == 'price_asc':
        listings = listings.order_by('price')
    elif sort == 'price_desc':
        listings = listings.order_by('-price')
    elif sort == 'newest':
        listings = listings.order_by('-date_listed')
    else:
        listings = listings.order_by('-date_listed')

    # Pagination
    paginator = Paginator(listings, 12)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Map Data (GeoJSON-like)
    map_listings = json.dumps([
        {
            'id': l.id,
            'title': l.title,
            'price': float(l.price),
            'type': l.get_listing_type_display(),
            'address': l.address,
            'url': f'/listing/{l.slug or l.id}',
        }
        for l in listings
    ])

    context = {
        'listings': page_obj,
        'page_obj': page_obj,
        'num_results': listings.count(),
        'filters': {
            'search': search,
            'type': asset_type,
            'status': status,
            'min_price': price_min,
            'max_price': price_max,
            'city': city,
            'sort': sort,
        },
        'map_listings': map_listings,
    }
    return render(request, 'home/explore.html', context)



@csrf_exempt
def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            if user.role == 'Admin':
                return redirect('index')
            elif user.role == 'Owner':
                return redirect('index')
            elif user.role == 'Agent':
                # Redirect to create profile if they don't have one
                if not hasattr(user, 'agent_profile'):
                    return redirect('create_agent_profile', user.id)
                return redirect('agent_dashboard', user.id)
            elif user.role == 'Seller':
                # Redirect to create profile if they don't have one
                if not hasattr(user, 'seller_profile'):
                    return redirect('create_seller_profile', user.id)
                return redirect('seller_dashboard', user.id)
            elif user.role == 'Tenant':
                return redirect('index')
        else:
            if User.objects.filter(username=username).exists() and not User.objects.get(username=username).is_active:
                messages.error(request, 'Account is not active. Please contact admin')
                return redirect('user_login')
            elif User.objects.filter(username=username).exists() and User.objects.get(username=username).is_active:
                messages.error(request, 'Password is incorrect')
                return redirect('user_login')
            else:
                messages.error(request, 'Credentials you provided is not familiar with us. Please try again')
                return redirect('user_login')
    else:
        return render(request, 'home/Login.html')


@csrf_exempt
def user_logout(request):
    logout(request)
    return redirect('index')


@csrf_exempt
def register(request):
    return render(request, 'home/Register.html')


@csrf_exempt
def user_register(request):
    from .log_service import syslog
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        email = request.POST['email']
        # All users register as Tenant by default. Admin assigns roles later.
        role = 'Tenant'
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists')
            return redirect('register')
        elif User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists')
            return redirect('register')
        else:
            user = User(username=username, email=email, role=role)
            user.set_password(password)
            user.save()
            syslog('AUTH', f"New account registered: '{username}'", request=request, username=username)
            messages.success(request, 'Account created successfully')
            return redirect('user_login')
    else:
        return render(request, 'home/Register.html')


@csrf_exempt
def about(request):
    return render(request, 'home/about.html')


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='../')
def admin_dashboard(request):
    total_enquiries = CustRequest.objects.filter(is_read=False).count()
    property_list = Property.objects.all()
    property_total = Property.objects.all().count()
    owner_list = Owner.objects.all()
    owner_total = Owner.objects.all().count()
    tenant_list = Tenant.objects.all()
    tenant_total = Tenant.objects.all().count()
    message_list = CustomerMessage.objects.filter(is_read=False)
    message_total = message_list.count()
    all_messages = CustomerMessage.objects.all()
    read_messages = CustomerMessage.objects.filter(is_read=True)
    unread_messages = CustomerMessage.objects.filter(is_read=False)
    read_enquiries = CustRequest.objects.filter(is_read=True).count()
    unread_enquiries = CustRequest.objects.filter(is_read=False).count()
    archived_enquiries = CustRequest.objects.filter(is_archived=True).count()
    unit_total = Unit.objects.all().count()
    lease_total = Lease.objects.all().count()
    maintenance_total = MaintenanceRequest.objects.all().count()
    payment_total = Payment.objects.all().count()
    revenue_total = Payment.objects.aggregate(Sum('amount'))['amount__sum'] or 0
    today = now().date()
    last_7_days = [today - timedelta(days=i) for i in range(6, -1, -1)]

    daily_data = [
        {'date': day, 'count': User.objects.filter(date_joined__date=day).count()}
        for day in last_7_days
    ]

    context = {
        'property_list': property_list,
        'property_total': property_total,
        'owner_list': owner_list,
        'owner_total': owner_total,
        'tenant_list': tenant_list,
        'tenant_total': tenant_total,
        'message_list': message_list,
        'message_total': message_total,
        'all_messages': all_messages,
        'read_messages': read_messages,
        'unread_messages': unread_messages,
        'total_enquiries': total_enquiries,
        'unread_enquiries': unread_enquiries,
        'archived_enquiries': archived_enquiries,
        'read_enquiries': read_enquiries,
        'unit_total': unit_total,
        'lease_total': lease_total,
        'maintenance_total': maintenance_total,
        'payment_total': payment_total,
        'revenue_total': revenue_total,
        'daily_user_registration_dates': [data['date'].strftime('%Y-%m-%d') for data in daily_data],
        'daily_user_registration_counts': [data['count'] for data in daily_data]
    }
    return render(request, 'admin/admin_base/dashboard.html', context)


@csrf_exempt
def contact(request):
    return render(request, 'home/contact.html')


@csrf_exempt
def updates(request):
    updates = Updates.objects.filter(end_date__gte=now()).order_by('-created_at')
    context = {'updates': updates}
    return render(request, 'home/updates.html', context)


@csrf_exempt
def property_lists(request):
    property_lists = Property.objects.all()
    context = {'property_lists': property_lists}
    if search := request.GET.get('search'):
        query = Property.objects.filter(name__icontains=search)
        context['property_list'] = query
        context['search'] = search
        num_results = len(query)
        context['num_results'] = num_results
    else:
        num_results = len(property_lists)
        context['num_results'] = num_results
    return render(request, 'admin/admin_base/admin.html', context)


@csrf_exempt
def tenant_list(request):
    tenant_list = Tenant.objects.all()
    context = {'tenant_list': tenant_list}
    if search := request.GET.get('search'):
        context['search'] = search
        query = Tenant.objects.filter(name__icontains=search)
        context['tenant_list'] = query
        num_results = len(query)
        context['num_results'] = num_results
    else:
        num_results = len(tenant_list)
        context['num_results'] = num_results
    return render(request, 'admin/admin_base/admin.html', context)


@csrf_exempt
def message_list(request):
    message_list = CustomerMessage.objects.all()
    context = {'message_list': message_list}
    if search := request.GET.get('search'):
        context['search'] = search
        query = CustomerMessage.objects.filter(name__icontains=search)
        context['message_list'] = query
        num_results = len(query)
        context['num_results'] = num_results
    else:
        num_results = len(message_list)
        context['num_results'] = num_results
    return render(request, 'admin/admin_base/admin.html', context)


@csrf_exempt
def owner_list(request):
    owner_list = User.objects.filter(role='Owner')
    context = {'owner_list': owner_list}
    if search := request.GET.get('search'):
        context['search'] = search
        query = User.objects.filter(username__icontains=search, role='Owner')
        context['owner_list'] = query
        num_results = len(query)
        context['num_results'] = num_results
    else:
        num_results = len(owner_list)
        context['num_results'] = num_results
    return render(request, 'admin/admin_base/admin.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def totals(request):
    property_total = Property.objects.all().count()
    tenant_total = Tenant.objects.all().count()
    unit_total = Unit.objects.all().count()
    lease_total = Lease.objects.all().count()
    message_total = CustomerMessage.objects.all().count()
    context = {
        'property_total': property_total,
        'tenant_total': tenant_total,
        'unit_total': unit_total,
        'lease_total': lease_total,
        'message_total': message_total
    }
    return render(request, 'admin/admin_base/admin.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def delete_property(request, id):
    from .log_service import syslog
    property = Property.objects.get(id=id)
    syslog('PROPERTY', f"Property deleted: '{property.name}' (id={id})", level='WARNING', user=request.user, request=request, property_id=id)
    property.delete()
    messages.success(request, 'Property deleted successfully')
    return redirect('admin_properties')


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def add_property(request):
    owner_list = Owner.objects.all()

    if request.method == 'POST':
        try:
            name = request.POST.get('name')
            address = request.POST.get('address')
            types = request.POST.get('property_type')
            description = request.POST.get('description')
            number_of_units = request.POST.get('number_of_units')
            price = request.POST.get('price')
            image = request.FILES.get('image')
            owner_id = request.POST.get('owner')

            property_instance = Property.objects.create(
                name=name,
                address=address,
                types=types,
                description=description,
                price=price,
                image=image,
                number_of_units=number_of_units,
                owner_id=owner_id,
            )

            unit_numbers = request.POST.getlist('unit_number[]')
            bedrooms = request.POST.getlist('bedrooms[]')
            bathrooms = request.POST.getlist('bathrooms[]')
            rents = request.POST.getlist('rent[]')
            availabilities = request.POST.getlist('is_available[]')

            if not (len(unit_numbers) == len(bedrooms) == len(bathrooms) == len(rents)):
                messages.error(request, 'Mismatched number of unit details submitted.')
                return redirect('add_property')

            for i in range(len(unit_numbers)):
                Unit.objects.create(
                    property=property_instance,
                    unit_number=unit_numbers[i],
                    bedrooms=bedrooms[i],
                    bathrooms=bathrooms[i],
                    rent=rents[i],
                    is_available=availabilities[i] == 'on' if availabilities[i] else False
                )

            for img in request.FILES.getlist('extra_images'):
                PropertyImage.objects.create(property=property_instance, image=img)

            from .log_service import syslog
            syslog('PROPERTY', f"Property added: '{name}' (id={property_instance.pk})", user=request.user, request=request, property_id=property_instance.pk)
            messages.success(request, 'Property added successfully')
            return redirect('admin_properties')
        except Exception as e:
            messages.error(request, f'Error adding property: {e}')
            return redirect('add_property')

    return render(request, 'admin/properties/add_property.html', {'owner_list': owner_list})


@csrf_exempt
def property_view(request, id):
    """Legacy view: Redirects to the unified listing detail experience."""
    return redirect('listing_detail_pk', pk=id)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def admin_properties(request):
    properties = Property.objects.all()
    property_total = Property.objects.all().count()
    owner_list = Owner.objects.all()
    owner_total = Owner.objects.all().count()
    tenant_list = Tenant.objects.all()
    tenant_total = Tenant.objects.all().count()
    message_list = CustomerMessage.objects.filter(is_read=False)
    message_total = message_list.count()
    type_list = Property.objects.values_list('types', flat=True).distinct()
    paginator = Paginator(properties, 10)
    page_number = request.GET.get('page')
    properties = paginator.get_page(page_number)
    context = {
        'properties': properties,
        'property_total': property_total,
        'owner_list': owner_list,
        'owner_total': owner_total,
        'tenant_list': tenant_list,
        'tenant_total': tenant_total,
        'message_list': message_list,
        'message_total': message_total,
        'type_list': type_list
    }

    query = request.GET.get('search')
    property_type = request.GET.get('type')
    owner_id = request.GET.get('owner')
    search_query = request.GET.get('search')

    if property_type:
        properties = Property.objects.filter(types=property_type)
        context['property_type'] = property_type
    if owner_id:
        properties = Property.objects.filter(owner_id=owner_id)
        context['owner_id'] = owner_id

    if search_query:
        if search_query.isdigit():
            properties = Property.objects.filter(price__lte=search_query)
            context['search_query'] = search_query
        else:
            properties = Property.objects.filter(address__icontains=search_query)
            context['search_query'] = search_query
    context['properties'] = properties
    num_results = len(properties)
    context['num_results'] = num_results
    return render(request, 'admin/properties/properties.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def adding_property(request):
    properties = Property.objects.all()
    property_total = Property.objects.all().count()
    owner_list = Owner.objects.all()
    owner_total = Owner.objects.all().count()
    tenant_list = Tenant.objects.all()
    tenant_total = Tenant.objects.all().count()
    message_list = CustomerMessage.objects.filter(is_read=False)
    message_total = message_list.count()
    context = {
        'properties': properties,
        'property_total': property_total,
        'owner_list': owner_list,
        'owner_total': owner_total,
        'tenant_list': tenant_list,
        'tenant_total': tenant_total,
        'message_list': message_list,
        'message_total': message_total
    }
    search = request.GET.get('search')

    return render(request, 'admin/properties/add_property.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def editing_property(request, id):
    property = Property.objects.get(id=id)
    owner_list = Owner.objects.all()
    context = {'property': property, 'owner_list': owner_list}
    return render(request, 'admin/properties/edit_property.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def edit_property(request, id):
    property_instance = get_object_or_404(Property, id=id)

    if request.method == 'POST':
        property_instance.name = request.POST['name']
        property_instance.address = request.POST['address']
        property_instance.types = request.POST['type']
        property_instance.price = request.POST['price']
        property_instance.description = request.POST['description']
        property_instance.owner_id = request.POST['owner_id']
        property_instance.number_of_units = request.POST['number_of_units']
        property_instance.status = request.POST['status']

        if 'image' in request.FILES:
            property_instance.image = request.FILES['image']

        property_instance.save()

        # delete individually selected extra images
        for del_id in request.POST.getlist('delete_images'):
            PropertyImage.objects.filter(pk=del_id, property=property_instance).delete()

        # save newly uploaded extra images
        for img in request.FILES.getlist('extra_images'):
            PropertyImage.objects.create(property=property_instance, image=img)

        from .log_service import syslog
        syslog('PROPERTY', f"Property updated: '{property_instance.name}' (id={id})", user=request.user, request=request, property_id=id)
        messages.success(request, 'Property updated successfully!')
        return redirect('admin_properties')

    extra_images = property_instance.extra_images.all()
    return render(request, 'admin/properties/edit_property.html', {'property': property_instance, 'extra_images': extra_images})


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def admin_users(request):
    users = User.objects.all()
    user_total = users.count()
    property_list = Property.objects.all()
    property_total = property_list.count()
    owner_list = Owner.objects.all()
    owner_total = owner_list.count()
    tenant_list = Tenant.objects.all()
    tenant_total = tenant_list.count()
    message_list = CustomerMessage.objects.filter(is_read=False)
    message_total = message_list.count()
    role_list = User.objects.values_list('role', flat=True).distinct()
    status_list = User.objects.values_list('is_active', flat=True).distinct()
    paginator = Paginator(users, 7)
    page_number = request.GET.get('page')
    users = paginator.get_page(page_number)
    context = {
        'users': users,
        'user_total': user_total,
        'total_users': User.objects.count(),
        'property_list': property_list,
        'property_total': property_total,
        'owner_list': owner_list,
        'owner_total': owner_total,
        'tenant_list': tenant_list,
        'tenant_total': tenant_total,
        'message_list': message_list,
        'message_total': message_total,
        'role_list': role_list,
        'status_list': status_list
    }

    role = request.GET.get('role')
    status = request.GET.get('status')
    search_query = request.GET.get('search')

    if role:
        users = users.filter(role=role)
        context['role'] = role
        context['users'] = users

    if status:
        users = users.filter(is_active=status)
        context['status'] = status
        context['users'] = users

    if search_query:
        users = users.filter(username__icontains=search_query)
        context['search_query'] = search_query
        context['users'] = users
        context['num_results'] = users.count()

    return render(request, 'admin/users/users.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def adding_user(request):
    users = User.objects.all()
    user_total = User.objects.all().count()
    property_list = Property.objects.all()
    property_total = Property.objects.all().count()
    owner_list = Owner.objects.all()
    owner_total = Owner.objects.all().count()
    tenant_list = Tenant.objects.all()
    tenant_total = Tenant.objects.all().count()
    message_list = CustomerMessage.objects.filter(is_read=False)
    message_total = message_list.count()
    context = {
        'users': users,
        'user_total': user_total,
        'property_list': property_list,
        'property_total': property_total,
        'owner_list': owner_list,
        'owner_total': owner_total,
        'tenant_list': tenant_list,
        'tenant_total': tenant_total,
        'message_list': message_list,
        'message_total': message_total
    }
    return render(request, 'admin/users/add_users.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def editing_user(request, id):
    user = User.objects.get(id=id)
    context = {'user': user}
    return render(request, 'admin/users/edit_user.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def edit_user(request, id):
    user = get_object_or_404(User, id=id)

    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        role = request.POST.get('role')
        join_date = request.POST.get('join_date')
        is_active = 'is_active' in request.POST
        is_staff = 'is_staff' in request.POST

        if password and password == confirm_password:
            user.set_password(password)
        elif password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return redirect('edit_user', user_id=user.id)

        user.username = username
        user.email = email
        user.is_active = is_active
        user.role = role
        user.is_staff = is_staff
        user.date_joined = timezone.datetime.strptime(join_date, '%Y-%m-%d')
        user.save()

        messages.success(request, "User details updated successfully.")
        return redirect('admin_users')

    return render(request, 'admin/users/edit_user.html', {'user': user})


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def add_user(request):
    try:
        if request.method == 'POST':
            username = request.POST['username']
            email = request.POST['email']
            password = request.POST['password']
            confirm_password = request.POST['confirm_password']
            role = request.POST['role']
            join_date = request.POST['join_date']
            is_active = 'is_active' in request.POST
            is_staff = 'is_staff' in request.POST

            if password and password == confirm_password:
                user = User.objects.create_user(username=username, email=email, password=password, role=role, is_active=is_active, is_staff=is_staff, date_joined=join_date)
                user.save()
                messages.success(request, 'User added successfully!')
                return redirect('admin_users')
            elif password != confirm_password:
                messages.error(request, "Passwords do not match.")
                return redirect('add_user')
            else:
                messages.error(request, "Error adding user.")
                return redirect('add_user')
        return render(request, 'admin/users/add_users.html')
    except Exception as e:
        messages.error(request, "Error occurred while adding user.")
        return redirect('adding_user')


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def delete_user(request, id):
    from .log_service import syslog
    user = User.objects.get(id=id)
    if user.is_superuser:
        messages.error(request, 'You can\'t delete this user')
        return redirect('admin_users')
    else:
        syslog('USER', f"User account deleted: '{user.username}' (role: {user.role})", level='WARNING', user=request.user, request=request, deleted_user_id=id, deleted_username=user.username)
        user.delete()
        messages.success(request, 'User deleted successfully')
        return redirect('admin_users')


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def disapprove_user(request, id):
    from .log_service import syslog
    user = User.objects.get(id=id)
    if user.role == 'Admin':
        messages.error(request, 'Admin cannot be deactivated')
        return redirect('admin_users')
    elif user.is_superuser:
        messages.error(request, 'Superuser cannot be deactivated')
    else:
        user.is_active = False
        user.save()
        syslog('USER', f"User deactivated: '{user.username}'", level='WARNING', user=request.user, request=request, target_user=user.username)
        messages.success(request, 'User deactivated successfully')
    return redirect('admin_users')


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def approve_user(request, id):
    from .log_service import syslog
    user = User.objects.get(id=id)
    if user.role == 'Admin':
        messages.error(request, 'Admin cannot be activated')
        return redirect('admin_users')
    elif user.is_superuser:
        messages.error(request, 'Superuser cannot be activated')
    else:
        user.is_active = True
        user.save()
        syslog('USER', f"User activated: '{user.username}'", user=request.user, request=request, target_user=user.username)
    messages.success(request, 'User activated successfully')
    return redirect('admin_users')


@csrf_exempt
def admin_owners(request):
    owners = Owner.objects.all()
    owner_total = owners.count()
    property_list = Property.objects.all()
    property_total = property_list.count()
    tenant_list = Tenant.objects.all()
    tenant_total = tenant_list.count()
    message_list = CustomerMessage.objects.filter(is_read=False)
    message_total = message_list.count()
    search_query = request.GET.get('search', '')
    if search_query:
        owners = owners.filter(name__icontains=search_query) | owners.filter(email__icontains=search_query)

    paginator = Paginator(owners, 10)
    page_number = request.GET.get('page')
    owners = paginator.get_page(page_number)
    context = {
        'owners': owners,
        'owner_total': owner_total,
        'property_list': property_list,
        'property_total': property_total,
        'tenant_list': tenant_list,
        'tenant_total': tenant_total,
        'message_list': message_list,
        'message_total': message_total
    }
    return render(request, 'admin/owners/owners.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def adding_owner(request):
    user_list = User.objects.all()
    used_users = Owner.objects.values_list('user', flat=True)
    available_users = User.objects.exclude(id__in=used_users)
    user_total = User.objects.all().count()
    owners = Owner.objects.all()
    owner_total = Owner.objects.all().count()
    property_list = Property.objects.all()
    property_total = Property.objects.all().count()
    tenant_list = Tenant.objects.all()
    tenant_total = Tenant.objects.all().count()
    message_list = CustomerMessage.objects.filter(is_read=False)
    message_total = message_list.count()

    context = {
        'owners': owners,
        'owner_total': owner_total,
        'property_list': property_list,
        'property_total': property_total,
        'tenant_list': tenant_list,
        'tenant_total': tenant_total,
        'message_list': message_list,
        'message_total': message_total,
        'user_list': user_list,
        'user_total': user_total,
        'available_users': available_users,
        'used_users': used_users,
    }

    search = request.GET.get('search')
    if search:
        query = Owner.objects.filter(name__icontains=search)
        context['search'] = search
        context['owners'] = query
    return render(request, 'admin/owners/add_owner.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def add_owner(request):
    from .log_service import syslog
    if request.method == 'POST':
        name = request.POST['name']
        email = request.POST['email']
        phone = request.POST['phone_number']
        address = request.POST['address']
        user_id = request.POST['user_id']
        image = request.FILES['image']
        new_owner = Owner.objects.create(
            name=name,
            email=email,
            phone_number=phone,
            address=address,
            user_id=user_id,
            image=image
        )
        new_owner.save()
        syslog('USER', f"Owner profile created: '{name}' (id={new_owner.pk})", user=request.user, request=request, owner_id=new_owner.pk)
        messages.success(request, 'Owner added successfully!')
        return redirect('admin_owners')
    return render(request, 'admin/owners/add_owner.html')


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def editing_owner(request, id):
    owner = Owner.objects.get(id=id)
    available_users = User.objects.exclude(id=owner.user_id)
    used_users = Owner.objects.values_list('user', flat=True)

    context = {'owner': owner, 'available_users': available_users, 'used_users': used_users}
    return render(request, 'admin/owners/edit_owner.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def edit_owner(request, id):
    owner = get_object_or_404(Owner, id=id)
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        address = request.POST.get('address')
        user_id = request.POST.get('user_id')
        image = request.FILES.get('image')
        if image:
            owner.image = image
        owner.name = name
        owner.email = email
        owner.phone = phone
        owner.user = user_id
        owner.address = address
        owner.save()
        messages.success(request, 'Owner details updated successfully.')
        return redirect('admin_owners')
    return render(request, 'admin/owners/edit_owner.html', {'owner': owner})


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def delete_owner(request, id):
    from .log_service import syslog
    owner = Owner.objects.get(id=id)
    syslog('USER', f"Owner deleted: '{owner.name}' (id={id})", level='WARNING', user=request.user, request=request, owner_id=id)
    owner.delete()
    messages.success(request, 'Owner deleted successfully')
    return redirect('admin_owners')


@csrf_exempt
def admin_updates(request):
    updates = Updates.objects.all()
    update_total = updates.count()
    property_list = Property.objects.all()
    property_total = property_list.count()
    owner_list = Owner.objects.all()
    owner_total = owner_list.count()
    tenant_list = Tenant.objects.all()
    tenant_total = tenant_list.count()
    message_list = CustomerMessage.objects.filter(is_read=False)
    message_total = message_list.count()
    context = {
        'updates': updates,
        'update_total': update_total,
        'property_list': property_list,
        'property_total': property_total,
        'owner_list': owner_list,
        'owner_total': owner_total,
        'tenant_list': tenant_list,
        'tenant_total': tenant_total,
        'message_list': message_list,
        'message_total': message_total
    }
    search = request.GET.get('search')
    if search:
        query = Updates.objects.filter(title__icontains=search)
        context['search'] = search
        context['updates'] = query
    return render(request, 'admin/updates/updates.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def adding_update(request):
    property_list = Property.objects.all()
    property_total = property_list.count()
    owner_list = Owner.objects.all()
    owner_total = owner_list.count()
    tenant_list = Tenant.objects.all()
    tenant_total = tenant_list.count()
    message_list = CustomerMessage.objects.filter(is_read=False)
    message_total = message_list.count()
    context = {
        'property_list': property_list,
        'property_total': property_total,
        'owner_list': owner_list,
        'owner_total': owner_total,
        'tenant_list': tenant_list,
        'tenant_total': tenant_total,
        'message_list': message_list,
        'message_total': message_total
    }

    return render(request, 'admin/updates/add_update.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def add_update(request):
    if request.method == 'POST':
        title = request.POST['title']
        description = request.POST['description']
        created_at = request.POST['created_at']
        end_date = request.POST['end_date']
        updates = Updates.objects.create(title=title, description=description, created_at=created_at, end_date=end_date)
        updates.save()
        messages.success(request, 'Update added successfully!')
        return redirect('admin_updates')
    return render(request, 'admin/updates/add_update.html')


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def editing_update(request, id):
    update = Updates.objects.get(id=id)
    context = {'update': update}
    return render(request, 'admin/updates/edit_update.html', context)


@csrf_exempt
@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='user_login')
def edit_update(request, id):
    update = get_object_or_404(Updates, id=id)
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        created_at = request.POST.get('created_at')
        end_date = request.POST.get('end_date')
        update.title = title
        update.description = description
        update.created_at = created_at
        update.end_date = end_date
        update.save()
        messages.success(request, 'Update details updated successfully.')
        return redirect('admin_updates')
    return render(request, 'admin/updates/edit_update.html', {'update': update})


@csrf_exempt
def delete_update(request, id):
    update = Updates.objects.get(id=id)
    update.delete()
    messages.success(request, 'Update deleted successfully')
    return redirect('admin_updates')


@csrf_exempt
def message_list_view(request):
    unread_messages = CustomerMessage.objects.filter(is_read=False).order_by('-created_at')
    read_messages = CustomerMessage.objects.filter(is_read=True, is_archived=False).order_by('-created_at')
    archived_messages = CustomerMessage.objects.filter(is_archived=True, is_read=True).order_by('-created_at')
    category_list = CustomerMessage.objects.all()
    message_total = unread_messages.count()
    total_enquiries = CustRequest.objects.filter(is_read=False).count()
    paginator = Paginator(category_list, 10)
    page_number = request.GET.get('page')
    messages = paginator.get_page(page_number)

    context = {
        'unread_messages': unread_messages,
        'read_messages': read_messages,
        'archived_messages': archived_messages,
        'message_total': message_total,
        'category_list': category_list,
        'total_enquiries': total_enquiries
    }
    return render(request, 'admin/messages/messages.html', context)


@csrf_exempt
def mark_as_read_view(request, message_id):
    message = get_object_or_404(CustomerMessage, id=message_id)
    if not message.is_read:
        message.is_read = True
        message.created_at = timezone.now()
        message.save()
    return redirect('message_list')


@csrf_exempt
def delete_message_view(request, message_id):
    message = get_object_or_404(CustomerMessage, id=message_id)
    message.delete()
    return redirect('message_list')


@csrf_exempt
def archive_message_view(request, message_id):
    message = get_object_or_404(CustomerMessage, id=message_id)
    if not message.is_archived:
        message.is_archived = True
        message.created_at = timezone.now()
        message.save()
    return redirect('message_list')


@csrf_exempt
def customer_message(request):
    if request.method == 'POST':
        name = request.POST['name']
        email = request.POST['email']
        message_content = request.POST['message']
        message = CustomerMessage.objects.create(name=name, email=email, message=message_content)
        message.save()
        messages.success(request, 'Message sent successfully!')
        return redirect('contact')
    return render(request, 'home/contact.html')


@csrf_exempt
def send_email(request):
    if request.method == 'POST':
        sender_email = request.POST['sender_email']
        recipient_email = request.POST['recipient_email']
        subject = request.POST['subject']
        body = request.POST['body']
        send_mail(subject, body, sender_email, [recipient_email])
        messages.success(request, 'Email sent successfully!')
        return redirect('message_list')
    return render(request, 'admin/messages/reply.html')


@csrf_exempt
def mail(request, message_id):
    message = get_object_or_404(CustomerMessage, id=message_id)
    context = {'message': message}
    return render(request, 'admin/messages/reply.html', context)


@csrf_exempt
def read_message(request, message_id):
    message = get_object_or_404(CustomerMessage, id=message_id)
    return render(request, 'admin/messages/message_body.html', {'message': message})


@csrf_exempt
def admin_tenants(request):
    tenants = Tenant.objects.all()
    tenant_total = tenants.count()
    property_list = Property.objects.all()
    property_total = property_list.count()
    owner_list = Owner.objects.all()
    owner_total = owner_list.count()
    message_list = CustomerMessage.objects.filter(is_read=False)
    message_total = message_list.count()
    context = {
        'tenants': tenants,
        'tenant_total': tenant_total,
        'property_list': property_list,
        'property_total': property_total,
        'owner_list': owner_list,
        'owner_total': owner_total,
        'message_list': message_list,
        'message_total': message_total
    }
    search = request.GET.get('search')
    if search:
        query = Tenant.objects.filter(name__icontains=search)
        context['search'] = search
        context['tenants'] = query

    return render(request, 'admin/tenants/tenants.html', context)


@csrf_exempt
def delete_tenant(request, tenant_id):
    from .log_service import syslog
    if request.method == "POST":
        tenant = get_object_or_404(Tenant, id=tenant_id)
        syslog('USER', f"Tenant deleted (id={tenant_id})", level='WARNING', user=request.user, request=request, tenant_id=tenant_id)
        tenant.delete()
        return redirect('admin_tenants')


@csrf_exempt
def manage_leases(request):
    leases = Lease.objects.all()
    unsigned_leases = leases.filter(contract_signed=False, contract_archived=False)
    signed_leases = leases.filter(contract_signed=True, contract_archived=False)
    archived_leases = leases.filter(contract_archived=True)
    message_total = CustomerMessage.objects.filter(is_read=False).count()
    total_enquiries = CustRequest.objects.filter(is_read=False).count()

    context = {
        'leases': leases,
        'unsigned_leases': unsigned_leases,
        'signed_leases': signed_leases,
        'archived_leases': archived_leases,
        'message_total': message_total,
        'total_enquiries': total_enquiries,
    }
    return render(request, 'admin/Leases/leases.html', context)


@csrf_exempt
def lease_details(request, lease_id):
    lease = get_object_or_404(Lease, id=lease_id)
    return render(request, 'lease_details.html', {'lease': lease})


@csrf_exempt
def sign_lease(request, lease_id):
    from .log_service import syslog
    lease = get_object_or_404(Lease, id=lease_id)
    lease.contract_signed = True
    lease.save()
    syslog('LEASE', f"Lease signed (id={lease_id})", user=request.user, request=request, lease_id=lease_id)
    messages.success(request, 'Lease marked as signed.')
    return redirect('manage_leases')


@csrf_exempt
def delete_lease(request, lease_id):
    from .log_service import syslog
    lease = get_object_or_404(Lease, id=lease_id)
    syslog('LEASE', f"Lease deleted (id={lease_id})", level='WARNING', user=request.user, request=request, lease_id=lease_id)
    lease.delete()
    messages.success(request, 'Lease deleted successfully.')
    return redirect('manage_leases')


@csrf_exempt
def archive_lease(request, lease_id):
    from .log_service import syslog
    lease = get_object_or_404(Lease, id=lease_id)
    lease.contract_archived = True
    lease.save()
    syslog('LEASE', f"Lease archived (id={lease_id})", user=request.user, request=request, lease_id=lease_id)
    messages.success(request, 'Lease archived successfully.')
    return redirect('manage_leases')


@csrf_exempt
def admin_inquiries(request):
    all_enquiries = CustRequest.objects.all()
    read_enquiries = CustRequest.objects.filter(is_read=True, is_archived=False).order_by('-created_at')
    unread_enquires = CustRequest.objects.filter(is_read=False, is_archived=False).order_by('-created_at')
    archived_enquiries = CustRequest.objects.filter(is_archived=True, is_read=True).order_by('-created_at')
    total_enquiries = CustRequest.objects.filter(is_read=False).count()
    message_list = CustomerMessage.objects.filter(is_read=False)
    message_total = message_list.count()

    context = {
        'all_enquiries': all_enquiries,
        'read_enquiries': read_enquiries,
        'unread_enquires': unread_enquires,
        'archived_enquiries': archived_enquiries,
        'total_enquiries': total_enquiries,
        'message_total': message_total,
    }
    return render(request, 'admin/Customer_Enquires/customer_enquires.html', context)


@csrf_exempt
def viewEnquiry(request, pk):
    enquiry = get_object_or_404(CustRequest, id=pk)
    context = {'enquiry': enquiry}
    return render(request, 'admin/Customer_Enquires/enquiry_body.html', context)


@csrf_exempt
def mark_as_read_enquiry(request, pk):
    enquiry = get_object_or_404(CustRequest, id=pk)
    if not enquiry.is_read:
        enquiry.is_read = True
        enquiry.created_at = timezone.now()
        enquiry.save()
        return redirect('admin_inquiries')


@csrf_exempt
def delete_enquiry(request, pk):
    enquiry = get_object_or_404(CustRequest, id=pk)
    enquiry.delete()
    return redirect('admin_inquiries')


@csrf_exempt
def archive_enquiry(request, pk):
    enquiry = get_object_or_404(CustRequest, id=pk)
    if not enquiry.is_archived:
        enquiry.is_archived = True
        enquiry.created_at = timezone.now()
        enquiry.save()
        return redirect('admin_inquiries')


@csrf_exempt
def customer_enquiry(request, id):
    if request.method == 'POST':
        listing = get_object_or_404(Listing, id=id)
        name = request.POST['name']
        email = request.POST['email']
        message = request.POST['enquiry']
        enquiry = CustRequest.objects.create(listing=listing, name=name, email=email, message=message)
        enquiry.save()
        messages.success(request, 'Enquiry sent successfully!')
        return redirect('listing_detail_pk', pk=id)
    return render(request, 'home/details.html')


@csrf_exempt
def unarchive_enquiry(request, pk):
    enquiry = get_object_or_404(CustRequest, id=pk)
    enquiry.is_archived = False
    enquiry.save()
    return redirect('admin_inquiries')


@csrf_exempt
def send_enquiry_email(request):
    if request.method == 'POST':
        sender_email = request.POST['sender_email']
        recipient_email = request.POST['recipient_email']
        subject = request.POST['subject']
        body = request.POST['body']
        send_mail(subject, body, sender_email, [recipient_email])
        messages.success(request, 'Email sent successfully!')
        return redirect('message_list')
    return render(request, 'admin/Customer_Enquires/reply.html')


@csrf_exempt
def mail_enquiry(request, id):
    enquiry = get_object_or_404(CustRequest, id=id)
    context = {'enquiry': enquiry}
    return render(request, 'admin/Customer_Enquires/reply.html', context)


@csrf_exempt
@login_required
@user_passes_test(is_admin)
def make_owner(request, user_id):
    from .log_service import syslog
    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        user.role = 'Owner'
        user.save()
        syslog('USER', f"Role changed → Owner: '{user.username}'", user=request.user, request=request, target_user=user.username)
        messages.success(request, 'User made Owner successfully.')
        return redirect('admin_users')

    return render(request, 'admin/users/users.html', {'user': user})


@csrf_exempt
@login_required
@user_passes_test(is_admin)
def make_admin(request, user_id):
    from .log_service import syslog
    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        user.role = 'Admin'
        user.save()
        syslog('USER', f"Role changed → Admin: '{user.username}'", level='WARNING', user=request.user, request=request, target_user=user.username)
        messages.success(request, 'User made Admin successfully.')
        return redirect('admin_users')

    return render(request, 'admin/users/users.html', {'user': user})


@csrf_exempt
def unmake_owner(request, user_id):
    from .log_service import syslog
    user = get_object_or_404(User, id=user_id)
    user.role = 'Tenant'
    user.save()
    syslog('USER', f"Role revoked (Owner → Tenant): '{user.username}'", user=request.user, request=request, target_user=user.username)
    messages.success(request, 'User made Tenant successfully.')
    return redirect('admin_users')


@csrf_exempt
def unmake_admin(request, user_id):
    from .log_service import syslog
    user = get_object_or_404(User, id=user_id)
    user.role = 'Tenant'
    user.save()
    syslog('USER', f"Role revoked (Admin → Tenant): '{user.username}'", level='WARNING', user=request.user, request=request, target_user=user.username)
    messages.success(request, 'User made Tenant successfully.')
    return redirect('admin_users')


@csrf_exempt
@login_required
@user_passes_test(is_admin)
def make_agent(request, user_id):
    from .log_service import syslog
    user = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        user.role = 'Agent'
        user.save()
        syslog('USER', f"Role changed → Agent: '{user.username}'", user=request.user, request=request, target_user=user.username)
        messages.success(request, 'User made Agent successfully.')
        return redirect('admin_users')
    return render(request, 'admin/users/users.html', {'user': user})


@csrf_exempt
@login_required
@user_passes_test(is_admin)
def make_seller(request, user_id):
    from .log_service import syslog
    user = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        user.role = 'Seller'
        user.save()
        syslog('USER', f"Role changed → Seller: '{user.username}'", user=request.user, request=request, target_user=user.username)
        messages.success(request, 'User made Seller successfully.')
        return redirect('admin_users')
    return render(request, 'admin/users/users.html', {'user': user})


@csrf_exempt
@login_required
@user_passes_test(is_admin)
def unmake_agent(request, user_id):
    user = get_object_or_404(User, id=user_id)
    user.role = 'Tenant'
    user.save()
    messages.success(request, 'User role reset to Tenant successfully.')
    return redirect('admin_users')


@csrf_exempt
@login_required
@user_passes_test(is_admin)
def unmake_seller(request, user_id):
    user = get_object_or_404(User, id=user_id)
    user.role = 'Tenant'
    user.save()
    messages.success(request, 'User role reset to Tenant successfully.')
    return redirect('admin_users')


@csrf_exempt
def owner_dashboard(request, user_id):
    user = get_object_or_404(User, id=user_id)
    owner = get_object_or_404(Owner, user=user)
    properties = Property.objects.filter(owner_id=user_id)
    leases = Lease.objects.filter(property__owner=owner)
    revenue = leases.aggregate(Sum('rent_amount'))['rent_amount__sum']
    contracts_made = leases.filter(contract_accepted=False)
    contracts_accepted = leases.filter(contract_accepted=True)
    contracts_signed = leases.filter(contract_signed=True)
    tenant = Tenant.objects.filter(leases__in=leases)
    tenants = tenant.count()

    context = {
        'user': user,
        'owner': owner,
        'properties': properties,
        'contracts_made': contracts_made,
        'contracts_accepted': contracts_accepted,
        'contracts_signed': contracts_signed,
        'leases': leases,
        'revenue': revenue,
        'tenants': tenants
    }
    return render(request, 'Others_dashboard/owners/owner_dashboard.html', context)


@csrf_exempt
def owner_profile(request, user_id):
    user = get_object_or_404(User, id=user_id)
    owner = get_object_or_404(Owner, user=user)
    return render(request, 'Others_dashboard/owners/owner_profile/owner_profile.html', {'user': user, 'owner': owner})


@csrf_exempt
def edit_owner_profile(request, id):
    owner = get_object_or_404(Owner, id=id)
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        address = request.POST.get('address')
        user_id = request.POST.get('user_id')
        image = request.FILES.get('image')
        if image:
            owner.image = image
        owner.name = name
        owner.email = email
        owner.phone = phone
        owner.user = user_id
        owner.address = address
        owner.save()
        messages.success(request, 'Owner details updated successfully.')
        return redirect('owner_profile', owner.user.id)
    return render(request, 'Others_dashboard/owners/owner_profile/owner_profile.html', {'owner': owner})


@csrf_exempt
def view_profile(request, user_id):
    user = get_object_or_404(User, id=user_id)
    owner = get_object_or_404(Owner, user=user)
    return render(request, 'Others_dashboard/owners/owner_profile/view_details.html', {'user': user, 'owner': owner})


@csrf_exempt
def create_owner_profile(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone_number = request.POST.get('phone_number')
        address = request.POST.get('address')
        image = request.FILES.get('image')
        user_id = user.id
        owner = Owner.objects.create(name=name, email=email, phone_number=phone_number, address=address, image=image, user_id=user_id)
        owner.save()
        messages.success(request, 'Owner profile created successfully.')
        return redirect('owner_profile', owner.user.id)
    return render(request, 'Others_dashboard/owners/owner_profile/create_profile.html', {'user': user})


@csrf_exempt
def owner_properties(request, user_id):
    user = get_object_or_404(User, id=user_id)
    owner = get_object_or_404(Owner, user=user)
    properties = Property.objects.filter(owner=owner)
    return render(request, 'Others_dashboard/owners/owner_properties/owner_properties.html', {'user': user, 'owner': owner, 'properties': properties})


@csrf_exempt
def owner_add_property(request, user_id):
    user = get_object_or_404(User, id=user_id)
    owner = get_object_or_404(Owner, user=user)
    if request.method == 'POST':
        try:
            name = request.POST.get('name')
            address = request.POST.get('address')
            types = request.POST.get('property_type')
            description = request.POST.get('description')
            number_of_units = request.POST.get('number_of_units')
            price = request.POST.get('price')
            image = request.FILES.get('image')
            owner_id = request.POST.get('owner')

            property_instance = Property.objects.create(
                name=name,
                address=address,
                types=types,
                description=description,
                price=price,
                image=image,
                number_of_units=number_of_units,
                owner_id=owner_id,
            )

            unit_numbers = request.POST.getlist('unit_number[]')
            bedrooms = request.POST.getlist('bedrooms[]')
            bathrooms = request.POST.getlist('bathrooms[]')
            rents = request.POST.getlist('rent[]')
            availabilities = request.POST.getlist('is_available[]')

            if not (len(unit_numbers) == len(bedrooms) == len(bathrooms) == len(rents)):
                messages.error(request, 'Mismatched number of unit details submitted.')
                return redirect('owner_add_property', owner.user.id)

            for i in range(len(unit_numbers)):
                Unit.objects.create(
                    property=property_instance,
                    unit_number=unit_numbers[i],
                    bedrooms=bedrooms[i],
                    bathrooms=bathrooms[i],
                    rent=rents[i],
                    is_available=availabilities[i] == 'on' if availabilities[i] else False
                )

            for img in request.FILES.getlist('extra_images'):
                PropertyImage.objects.create(property=property_instance, image=img)

            messages.success(request, 'Property added successfully')
            return redirect('owner_properties', owner.user.id)
        except Exception as e:
            messages.error(request, f'Error adding property: {e}')
            return redirect('owner_add_property')

    return render(request, 'Others_dashboard/owners/owner_properties/owner_addproperty.html', {'user': user, 'owner': owner})


@csrf_exempt
def owner_contracts(request, user_id):
    user = get_object_or_404(User, id=user_id)
    owner = get_object_or_404(Owner, user=user)
    properties = Property.objects.filter(owner=owner)
    leases = Lease.objects.filter(property__owner=owner)
    made_leases = leases.filter(contract_accepted=False)
    accepted_leases = leases.filter(contract_accepted=True)
    signed_leases = leases.filter(contract_signed=True)
    context = {
        'user': user,
        'owner': owner,
        'properties': properties,
        'made_leases': made_leases,
        'accepted_leases': accepted_leases,
        'signed_leases': signed_leases,
        'leases': leases
    }
    return render(request, 'Others_dashboard/owners/leases/owner_contracts.html', context)


@csrf_exempt
def new_contract(request, user_id):
    user = get_object_or_404(User, id=user_id)
    owner = get_object_or_404(Owner, user=user)
    properties = Property.objects.filter(owner=owner)
    tenants = Tenant.objects.all()
    if request.method == 'POST':
        try:
            property_id = request.POST.get('property')
            tenant_id = request.POST.get('tenant')
            start_date = request.POST.get('start_date')
            end_date = request.POST.get('end_date')
            rent_amount = request.POST.get('rent_amount')
            contract_details = request.POST.get('contract_details')
            Lease.objects.create(
                property_id=property_id,
                tenant_id=tenant_id,
                start_date=start_date,
                end_date=end_date,
                rent_amount=rent_amount,
                contract_details=contract_details,
            )

            return redirect('owner_contracts', owner.user.id)
        except Exception as e:
            messages.error(request, f'Error creating contract: {e}')
            return redirect('new_contract', owner.user.id)

    return render(request, 'Others_dashboard/owners/leases/new_contract.html', {'user': user, 'owner': owner, 'properties': properties, 'tenants': tenants})


@csrf_exempt
def owner_view_contract(request, lease_id):
    user = request.user
    owner = get_object_or_404(Owner, user=user)
    lease = get_object_or_404(Lease, id=lease_id)
    return render(request, 'Others_dashboard/owners/leases/view_contract.html', {'user': user, 'owner': owner, 'lease': lease})


@csrf_exempt
def download_contract(request, lease_id):
    lease = get_object_or_404(Lease, id=lease_id)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{lease.property.name}_contract.pdf"'
    _generate_contract_pdf(response, lease)
    return response


@csrf_exempt
def delete_contract(request, lease_id):
    lease = get_object_or_404(Lease, id=lease_id)
    lease.delete()
    return redirect('owner_contracts', lease.property.owner.user.id)


@csrf_exempt
def owner_edit_property(request, property_id):
    property_instance = get_object_or_404(Property, id=property_id)
    owner = property_instance.owner
    user = owner.user

    if request.method == 'POST':
        try:
            property_instance.name = request.POST.get('name')
            property_instance.address = request.POST.get('address')
            property_instance.types = request.POST.get('property_type')
            property_instance.description = request.POST.get('description')
            property_instance.number_of_units = request.POST.get('number_of_units')
            property_instance.price = request.POST.get('price')

            if 'image' in request.FILES:
                property_instance.image = request.FILES.get('image')

            property_instance.save()

            unit_numbers = request.POST.getlist('unit_number[]')
            bedrooms = request.POST.getlist('bedrooms[]')
            bathrooms = request.POST.getlist('bathrooms[]')
            rents = request.POST.getlist('rent[]')
            availabilities = request.POST.getlist('is_available[]')

            if not (len(unit_numbers) == len(bedrooms) == len(bathrooms) == len(rents)):
                messages.error(request, 'Mismatched number of unit details submitted.')
                return redirect('owner_edit_property', property_instance.id)

            existing_units = list(property_instance.units.all())

            for i in range(len(unit_numbers)):
                if i < len(existing_units):
                    unit = existing_units[i]
                    unit.unit_number = unit_numbers[i]
                    unit.bedrooms = bedrooms[i]
                    unit.bathrooms = bathrooms[i]
                    unit.rent = rents[i]
                    unit.is_available = availabilities[i] == 'on' if availabilities[i] else False
                    unit.save()
                else:
                    Unit.objects.create(
                        property=property_instance,
                        unit_number=unit_numbers[i],
                        bedrooms=bedrooms[i],
                        bathrooms=bathrooms[i],
                        rent=rents[i],
                        is_available=availabilities[i] == 'on' if availabilities[i] else False
                    )

            for del_id in request.POST.getlist('delete_images'):
                PropertyImage.objects.filter(pk=del_id, property=property_instance).delete()

            for img in request.FILES.getlist('extra_images'):
                PropertyImage.objects.create(property=property_instance, image=img)

            messages.success(request, 'Property updated successfully')
            return redirect('owner_properties', owner.user.id)
        except Exception as e:
            messages.error(request, f'Error updating property: {e}')
            return redirect('owner_edit_property', property_instance.id)

    units = property_instance.units.all()
    unit_data = []
    for unit in units:
        unit_data.append({
            'unit_number': unit.unit_number,
            'bedrooms': unit.bedrooms,
            'bathrooms': unit.bathrooms,
            'rent': unit.rent,
            'is_available': unit.is_available
        })

    extra_images = property_instance.extra_images.all()
    return render(request, 'Others_dashboard/owners/owner_properties/owner_editproperty.html', {
        'user': user,
        'owner': owner,
        'property_instance': property_instance,
        'units': units,
        'unit_data': unit_data,
        'extra_images': extra_images,
    })


@csrf_exempt
def owner_delete_property(request, property_id):
    property_instance = get_object_or_404(Property, id=property_id)
    property_instance.delete()
    return redirect('owner_properties', property_instance.owner.user.id)


@csrf_exempt
def owner_view_property(request, property_id):
    user = request.user
    units = Unit.objects.filter(property_id=property_id)
    owner = get_object_or_404(Owner, user=user)
    property_instance = get_object_or_404(Property, id=property_id)
    return render(request, 'Others_dashboard/owners/owner_properties/view_properties.html', {'user': user, 'owner': owner, 'property_instance': property_instance, 'units': units})


@csrf_exempt

@login_required
def tenant_dashboard(request, user_id):
    user = get_object_or_404(User, id=user_id)
    tenant = get_object_or_404(Tenant, user=user)
    # Authorization: allow if the logged-in user is the tenant themselves or an admin
    if request.user.id != user.id and not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        messages.error(request, 'You do not have permission to view this dashboard.')
        return redirect('index')
    # Properties related to tenant via leases (only include properties for which tenant has a lease)
    properties = Property.objects.filter(leases__tenant__user_id__in=[user_id]).distinct()

    # Lease breakdown for dashboard cards
    leases = Lease.objects.filter(tenant=tenant)
    made_leases = leases.filter(contract_accepted=False)
    accepted_leases = leases.filter(contract_accepted=True, contract_signed=False)
    signed_leases = leases.filter(contract_signed=True)

    # Payments made by this tenant
    payments = Payment.objects.filter(tenant=tenant).order_by('-date_paid')

    # Prepare payment chart data (last 6 payments, chronological)
    payment_list = list(payments[:6])
    payment_list.reverse()
    payment_labels = [p.date_paid.strftime('%b %d') for p in payment_list]
    payment_amounts = [p.amount for p in payment_list]

    # Total paid amount
    total_paid = payments.aggregate(Sum('amount'))['amount__sum'] or 0

    # Maintenance requests for this tenant
    maintenance_requests = MaintenanceRequest.objects.filter(tenant=tenant).order_by('-request_date')

    # Messages involving this user (sent or received)
    user_messages = Message.objects.filter(recipient__id=user.id).order_by('-sent_date')

    # Contract countdowns: days until end_date for active leases
    today = now().date()
    contract_countdowns = []
    for lease in leases:
        try:
            end = lease.end_date
            days_left = (end - today).days
        except Exception:
            days_left = None
        contract_countdowns.append({
            'lease': lease,
            'days_left': days_left,
            'end_date': lease.end_date,
        })

    # Determine next contract to expire
    upcoming = [c for c in contract_countdowns if c['days_left'] is not None and c['days_left'] >= 0]
    upcoming_sorted = sorted(upcoming, key=lambda x: x['days_left'])
    next_expiry = upcoming_sorted[0] if upcoming_sorted else None

    context = {
        'user': user,
        'tenant': tenant,
        'properties': properties,
        'made_leases': made_leases,
        'accepted_leases': accepted_leases,
        'signed_leases': signed_leases,
        'leases': leases,
        'payments': payments,
        'payment_labels_json': json.dumps(payment_labels),
        'payment_amounts_json': json.dumps(payment_amounts),
        'total_paid': total_paid,
        'next_expiry': next_expiry,
        'contract_countdowns': contract_countdowns,
        'maintenance_requests': maintenance_requests,
        'messages': user_messages,
    }
    return render(request, 'Others_dashboard/Tenants/tenant_dashboard.html', context)


@csrf_exempt
@login_required
def new_tenant(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        form = TenantProfileForm(request.POST, request.FILES)
        if form.is_valid():
            tenant = form.save(commit=False)
            tenant.user = user
            tenant.save()
            return redirect('tenant_dashboard', user.id)
    else:
        form = TenantProfileForm()

    return render(request, 'Others_dashboard/Tenants/profile/new_tenant.html', {'form': form})

@csrf_exempt
@login_required
def like_property(request, property_id):
    listing = get_object_or_404(Listing, id=property_id)
    liked_property, created = LikedProperties.objects.get_or_create(user=request.user, listing=listing)
    if created:
        liked_property.total_likes += 1
        liked_property.save()
        messages.success(request, "You have liked this property!")
        return redirect('listing_detail_pk', pk=listing.id)
    else:
        messages.info(request, "You have already liked this property!")
    return redirect('listing_detail_pk', pk=listing.id)


def _get_conversations(current_user):
    """Return sorted list of dicts {contact, last_message, unread} for current_user."""
    contact_ids = set(
        Message.objects.filter(sender=current_user).values_list('recipient_id', flat=True)
    ) | set(
        Message.objects.filter(recipient=current_user).values_list('sender_id', flat=True)
    )
    convos = []
    for contact in User.objects.filter(id__in=contact_ids):
        thread = Message.objects.filter(
            Q(sender=current_user, recipient=contact) | Q(sender=contact, recipient=current_user)
        ).order_by('-sent_date')
        convos.append({
            'contact': contact,
            'last_message': thread.first(),
            'unread': thread.filter(recipient=current_user, is_read=False).count(),
        })
    convos = [c for c in convos if c['last_message'] is not None]
    convos.sort(key=lambda x: x['last_message'].sent_date, reverse=True)
    return convos


def tenant_messages(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id and not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        messages.error(request, 'You do not have permission to view these messages.')
        return redirect('index')

    allowed_recipients = User.objects.filter(role__in=['Admin', 'Owner']).exclude(id=user.id)

    if request.method == 'POST':
        form = MessageForm(request.POST, allowed_recipients=allowed_recipients)
        if form.is_valid():
            msg = form.save(commit=False)
            msg.sender = request.user
            msg.save()
            messages.success(request, 'Message sent.')
            return redirect('tenant_conversation', user.id, msg.recipient.id)
    else:
        form = MessageForm(allowed_recipients=allowed_recipients)

    conversations = _get_conversations(user)
    total_unread = sum(c['unread'] for c in conversations)
    message_total = Message.objects.filter(recipient=user, is_read=False).count()

    context = {
        'user': user,
        'conversations': conversations,
        'total_unread': total_unread,
        'form': form,
        'message_total': message_total,
    }
    return render(request, 'Others_dashboard/Tenants/tenant_messages.html', context)


@csrf_exempt
@login_required
def tenant_conversation(request, user_id, contact_id):
    user = get_object_or_404(User, id=user_id)
    contact = get_object_or_404(User, id=contact_id)
    if request.user.id != user.id and not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        messages.error(request, 'You do not have permission.')
        return redirect('index')

    # Mark messages from contact to user as read
    Message.objects.filter(sender=contact, recipient=user, is_read=False).update(is_read=True)

    if request.method == 'POST':
        content = request.POST.get('content', '').strip()
        if content:
            Message.objects.create(sender=request.user, recipient=contact, content=content)
        return redirect('tenant_conversation', user.id, contact.id)

    thread_messages = Message.objects.filter(
        Q(sender=user, recipient=contact) | Q(sender=contact, recipient=user)
    ).order_by('sent_date')

    message_total = Message.objects.filter(recipient=user, is_read=False).count()
    context = {
        'user': user,
        'contact': contact,
        'thread_messages': thread_messages,
        'message_total': message_total,
    }
    return render(request, 'Others_dashboard/Tenants/tenant_conversation.html', context)


@csrf_exempt
@login_required
def tenant_delete_message(request, user_id, message_id):
    user = get_object_or_404(User, id=user_id)
    msg = get_object_or_404(Message, id=message_id)
    if request.user == msg.sender or request.user == msg.recipient:
        contact_id = msg.recipient.id if msg.sender == request.user else msg.sender.id
        msg.delete()
        return redirect('tenant_conversation', user.id, contact_id)
    messages.error(request, 'You cannot delete this message.')
    return redirect('tenant_messages', user.id)


@login_required
def admin_tenant_inbox(request):
    if not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        return redirect('index')

    all_users = User.objects.exclude(id=request.user.id)

    if request.method == 'POST':
        form = MessageForm(request.POST, allowed_recipients=all_users)
        if form.is_valid():
            msg = form.save(commit=False)
            msg.sender = request.user
            msg.save()
            messages.success(request, 'Message sent.')
            return redirect('admin_conversation', msg.recipient.id)
    else:
        form = MessageForm(allowed_recipients=all_users)

    conversations = _get_conversations(request.user)
    total_unread = sum(c['unread'] for c in conversations)
    message_total = CustomerMessage.objects.filter(is_read=False).count()
    total_enquiries = CustRequest.objects.filter(is_read=False).count()

    context = {
        'conversations': conversations,
        'total_unread': total_unread,
        'form': form,
        'message_total': message_total,
        'total_enquiries': total_enquiries,
    }
    return render(request, 'admin/messages/admin_inbox.html', context)


@csrf_exempt
@login_required
def admin_conversation(request, contact_id):
    if not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        return redirect('index')

    contact = get_object_or_404(User, id=contact_id)
    admin_user = request.user

    Message.objects.filter(sender=contact, recipient=admin_user, is_read=False).update(is_read=True)

    if request.method == 'POST':
        content = request.POST.get('content', '').strip()
        if content:
            Message.objects.create(sender=admin_user, recipient=contact, content=content)
        return redirect('admin_conversation', contact.id)

    thread_messages = Message.objects.filter(
        Q(sender=admin_user, recipient=contact) | Q(sender=contact, recipient=admin_user)
    ).order_by('sent_date')

    message_total = CustomerMessage.objects.filter(is_read=False).count()
    total_enquiries = CustRequest.objects.filter(is_read=False).count()
    context = {
        'contact': contact,
        'thread_messages': thread_messages,
        'message_total': message_total,
        'total_enquiries': total_enquiries,
    }
    return render(request, 'admin/messages/admin_conversation.html', context)


@csrf_exempt
@login_required
def admin_delete_message(request, message_id):
    if not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        return redirect('index')
    msg = get_object_or_404(Message, id=message_id)
    contact_id = msg.recipient.id if msg.sender == request.user else msg.sender.id
    if request.user == msg.sender or request.user == msg.recipient:
        msg.delete()
    return redirect('admin_conversation', contact_id)


@csrf_exempt
@login_required
def tenant_maintenance(request, user_id):
    user = get_object_or_404(User, id=user_id)
    tenant = get_object_or_404(Tenant, user=user)
    # authorization
    if request.user.id != user.id and not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        messages.error(request, 'You do not have permission to view maintenance requests.')
        return redirect('index')

    maintenance_requests = MaintenanceRequest.objects.filter(tenant=tenant).order_by('-request_date')

    context = {
        'user': user,
        'tenant': tenant,
        'maintenance_requests': maintenance_requests,
    }
    return render(request, 'Others_dashboard/Tenants/tenant_maintenance.html', context)


@csrf_exempt
@login_required
def new_maintenance_request(request, user_id):
    user = get_object_or_404(User, id=user_id)
    tenant = get_object_or_404(Tenant, user=user)
    # authorization
    if request.user.id != user.id and not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        messages.error(request, 'You do not have permission to create requests.')
        return redirect('index')

    # restrict property choices to properties tenant has leases for
    allowed_properties = Property.objects.filter(leases__tenant=tenant).distinct()

    if request.method == 'POST':
        form = MaintenanceRequestForm(request.POST)
        form.fields['property'].queryset = allowed_properties
        if form.is_valid():
            req = form.save(commit=False)
            req.tenant = tenant
            req.request_date = now()
            req.status = 'open'
            req.save()
            messages.success(request, 'Maintenance request submitted')
            return redirect('tenant_maintenance', user.id)
    else:
        form = MaintenanceRequestForm()
        form.fields['property'].queryset = allowed_properties

    context = {
        'user': user,
        'tenant': tenant,
        'form': form,
    }
    return render(request, 'Others_dashboard/Tenants/new_maintenance_request.html', context)

@csrf_exempt
@login_required
def schedule_visit(request, property_id):
    listing = get_object_or_404(Listing, id=property_id)
    tenant = get_object_or_404(Tenant, user=request.user)
    if request.method == 'POST':
        visit_date = request.POST.get('visit_date')
        description = request.POST.get('description')
        Visit.objects.create(listing=listing, tenant=tenant, visit_date=visit_date, description=description)
        messages.success(request, "Your visit has been scheduled!")
        return redirect('listing_detail_pk', pk=listing.id)

    return render(request, 'home/details.html', {'listing': listing})


@csrf_exempt
def tenant_profile(request,user_id):
    tenant = get_object_or_404(Tenant, user_id=user_id)
    user = get_object_or_404(User, id=user_id)
    context = {'user': user, 'tenant': tenant}
    return render(request, 'Others_dashboard/Tenants/profile/Tenant_profile.html', context)

@csrf_exempt
def tenant_edit_profile(request, user_id):
    user = get_object_or_404(User, id=user_id)
    tenant = get_object_or_404(Tenant, user=user)
    if request.method == 'POST':
        form = TenantProfileForm(request.POST, request.FILES, instance=tenant)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully')
            return redirect('tenant_profile', user.id)
    else:
        form = TenantProfileForm(instance=tenant)
        return render(request, 'Others_dashboard/Tenants/profile/tenant_edit_profile.html', {'form': form, 'user': user})

@csrf_exempt
def tenant_properties(request, user_id):
    user = get_object_or_404(User, id=user_id)
    tenant = get_object_or_404(Tenant, user=user)

    # Filter leases by the tenant and signed is true
    leases = Lease.objects.filter(tenant=tenant , contract_signed=True)

    # Initialize properties list
    properties = [lease.property for lease in leases]

    # Apply search filters
    search_query = request.GET.get('search', '')
    type_filter = request.GET.get('type', '')
    owner_filter = request.GET.get('owner', '')

    if search_query:
        properties = [p for p in properties if
                      search_query.lower() in p.address.lower() or str(search_query) in str(p.price)]

    if type_filter:
        properties = [p for p in properties if p.types == type_filter]

    if owner_filter:
        properties = [p for p in properties if p.owner.id == int(owner_filter)]

    # Pagination
    paginator = Paginator(properties, 10)  # Show 10 properties per page
    page_number = request.GET.get('page')
    properties = paginator.get_page(page_number)

    # Prepare context
    context = {
        'user': user,
        'tenant': tenant,
        'properties': properties,
        'type_list': Property.objects.values_list('types', flat=True).distinct(),
        'owner_list': Property.objects.values_list('owner', flat=True).distinct()
    }

    return render(request, 'Others_dashboard/Tenants/owner_properties/tenant_properties.html', context)

@csrf_exempt
def tenant_contracts(request, user_id):
    user = get_object_or_404(User, id=user_id)
    tenant = get_object_or_404(Tenant, user=user)
    leases = Lease.objects.filter(tenant=tenant)
    signed_contracts = [lease for lease in leases if lease.contract_signed ]
    unaccepted_contracts = [lease for lease in leases if not lease.contract_accepted and not lease.contract_signed]
    accepted_contracts = [lease for lease in leases if lease.contract_accepted and not lease.contract_signed]
    total_signed_contracts = len(signed_contracts)
    total_accepted_contracts = len(accepted_contracts)
    total_unaccepted_contracts = len(unaccepted_contracts)

    context = {
        'user': user,
        'tenant': tenant,
        'signed_contracts': signed_contracts,
        'accepted_contracts': accepted_contracts,
        'unaccepted_contracts': unaccepted_contracts,
        'total_signed_contracts': total_signed_contracts,
        'total_accepted_contracts': total_accepted_contracts,
        'total_unaccepted_contracts': total_unaccepted_contracts
    }
    return render(request, 'Others_dashboard/Tenants/contracts/tenant_contracts.html', context)
@csrf_exempt
def tenant_accept_contract(request, lease_id):
    lease = get_object_or_404(Lease, id=lease_id)
    lease.contract_accepted = True
    lease.save()
    messages.success(request, "Contract accepted successfully!")
    return redirect('tenant_contracts', lease.tenant.user.id)
@csrf_exempt
def tenant_sign_contract(request, lease_id):
    lease = get_object_or_404(Lease, id=lease_id)
    lease.contract_signed = True
    lease.save()
    messages.success(request, "Contract signed successfully!")
    return redirect('tenant_contracts', lease.tenant.user.id)

@csrf_exempt
def tenant_view_contract(request, lease_id):
    lease = get_object_or_404(Lease, id=lease_id)
    return render(request, 'Others_dashboard/Tenants/contracts/view_contract.html', {'lease': lease})

@csrf_exempt
def tenant_download_contract(request, lease_id):
    lease = get_object_or_404(Lease, id=lease_id)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{lease.property.name}_contract.pdf"'
    _generate_contract_pdf(response, lease)
    return response

@csrf_exempt
def tenant_view_property(request, property_id):
    property_instance = get_object_or_404(Property, id=property_id)
    units = property_instance.units.all()
    tenant = get_object_or_404(Tenant, user=request.user)
    leases = Lease.objects.filter(property=property_instance, tenant=tenant)

    context = {
        'property_instance': property_instance,
        'units': units,
        'leases': leases,
    }
    return render(request, 'Others_dashboard/Tenants/owner_properties/view_property.html', context)


paypalrestsdk.configure({
    "mode": settings.PAYPAL_MODE,  # sandbox or live
    "client_id": settings.PAYPAL_CLIENT_ID,
    "client_secret": settings.PAYPAL_CLIENT_SECRET
})

@csrf_exempt
def process_payment(request):
    if request.method == 'POST':
        property_id = request.POST.get('property')
        amount = request.POST.get('amount')
        date_paid = request.POST.get('date_paid')

        property_instance = get_object_or_404(Property, id=property_id)
        tenant = get_object_or_404(Tenant, user=request.user)

        # Create a payment object
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "transactions": [{
                "amount": {
                    "total": amount,
                    "currency": "USD"  # Change currency as needed
                },
                "description": f"Payment for property {property_instance.name}"
            }],
            "redirect_urls": {
                "return_url": f"{settings.SITE_URL}/payment/execute/",
                "cancel_url": f"{settings.SITE_URL}/payment/cancel/"
            }
        })

        if payment.create():
            for link in payment.links:
                if link.rel == "approval_url":
                    return redirect(link.href)
        else:
            messages.error(request, 'Error creating payment on PayPal.')
            return redirect('make_payment')
    else:
        tenant = get_object_or_404(Tenant, user=request.user)
        leases = Lease.objects.filter(tenant=tenant)

        context = {
            'leases': leases,
        }
        return render(request, 'Others_dashboard/Tenants/payments/tenant_payment.html', context)

@csrf_exempt
def execute_payment(request):
    payment_id = request.GET.get('paymentId')
    payer_id = request.GET.get('PayerID')

    payment = paypalrestsdk.Payment.find(payment_id)

    if payment.execute({"payer_id": payer_id}):
        # Save the payment to the database
        property_id = payment.transactions[0].description.split()[-1]
        property_instance = get_object_or_404(Property, id=property_id)
        tenant = get_object_or_404(Tenant, user=request.user)

        Payment.objects.create(
            property=property_instance,
            tenant=tenant,
            amount=payment.transactions[0].amount.total,
            date_paid=payment.transactions[0].related_resources[0].sale.create_time
        )

        messages.success(request, 'Payment successful.')
        # Redirect tenant back to their dashboard after successful payment
        try:
            return redirect('tenant_dashboard', request.user.id)
        except Exception:
            # Fallback to index if tenant dashboard reverse fails
            return redirect('index')
    else:
        messages.error(request, 'Error executing payment on PayPal.')
        return redirect('make_payment')


# ─── PDF Helper ─────────────────────────────────────────────────────────────

def _generate_contract_pdf(response, lease):
    """Shared PDF generation for download_contract and tenant_download_contract."""
    from reportlab.lib import colors
    import textwrap
    from datetime import date as date_type

    p = canvas.Canvas(response, pagesize=letter)
    width, height = letter
    margin = 0.75 * inch

    # ── Header bar ──────────────────────────────────────────────────────────
    header_h = 1.1 * inch
    p.setFillColorRGB(0.184, 0.310, 0.310)  # #2F4F4F dark slate green
    p.rect(0, height - header_h, width, header_h, fill=1, stroke=0)

    p.setFillColorRGB(1, 1, 1)
    p.setFont("Helvetica-Bold", 20)
    p.drawString(margin, height - 0.55 * inch, "AFRIMASTER PROPERTIES")
    p.setFont("Helvetica", 11)
    p.drawString(margin, height - 0.82 * inch, "Rental Agreement / Lease Contract")

    # Contract # and date top-right
    p.setFont("Helvetica", 9)
    today_str = date_type.today().strftime("%B %d, %Y")
    ref = f"Contract #{lease.id}   |   Generated: {today_str}"
    p.drawRightString(width - margin, height - 0.55 * inch, ref)

    # ── Thin accent line below header ────────────────────────────────────────
    p.setFillColorRGB(0.82, 0.55, 0.12)  # gold accent
    p.rect(0, height - header_h - 0.04 * inch, width, 0.04 * inch, fill=1, stroke=0)

    y = height - header_h - 0.35 * inch

    # ── Two-column property/party info ────────────────────────────────────────
    col1_x = margin
    col2_x = width / 2 + 0.1 * inch
    col_w = width / 2 - margin - 0.1 * inch

    def label_val(canvas_obj, x, y_pos, label, value, font_size=10):
        canvas_obj.setFont("Helvetica-Bold", font_size)
        canvas_obj.setFillColorRGB(0.184, 0.310, 0.310)
        canvas_obj.drawString(x, y_pos, label + ":")
        canvas_obj.setFont("Helvetica", font_size)
        canvas_obj.setFillColorRGB(0.2, 0.2, 0.2)
        canvas_obj.drawString(x + 1.1 * inch, y_pos, str(value))

    # Section: Property Details
    p.setFont("Helvetica-Bold", 11)
    p.setFillColorRGB(0.184, 0.310, 0.310)
    p.drawString(col1_x, y, "PROPERTY DETAILS")
    p.setFont("Helvetica-Bold", 11)
    p.drawString(col2_x, y, "PARTIES INVOLVED")
    y -= 0.22 * inch

    # Horizontal rule under section headers
    p.setStrokeColorRGB(0.8, 0.8, 0.8)
    p.line(col1_x, y, col1_x + col_w, y)
    p.line(col2_x, y, col2_x + col_w, y)
    y -= 0.25 * inch

    row_gap = 0.28 * inch
    prop = lease.property
    tenant = lease.tenant

    label_val(p, col1_x, y, "Property", prop.name)
    label_val(p, col2_x, y, "Owner", prop.owner.name)
    y -= row_gap
    label_val(p, col1_x, y, "Address", prop.address[:35] if prop.address else "-")
    label_val(p, col2_x, y, "Tenant", tenant.name)
    y -= row_gap
    label_val(p, col1_x, y, "Type", prop.get_types_display())
    label_val(p, col2_x, y, "Phone", getattr(tenant, 'phone_number', '-') or '-')
    y -= row_gap
    label_val(p, col1_x, y, "Units", str(prop.number_of_units))
    label_val(p, col2_x, y, "Email", tenant.email[:30] if tenant.email else '-')
    y -= row_gap * 1.4

    # ── Lease Terms section ──────────────────────────────────────────────────
    p.setFillColorRGB(0.184, 0.310, 0.310)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin, y, "LEASE TERMS")
    y -= 0.22 * inch
    p.setStrokeColorRGB(0.8, 0.8, 0.8)
    p.line(margin, y, width - margin, y)
    y -= 0.28 * inch

    # Big rent display
    p.setFont("Helvetica-Bold", 18)
    p.setFillColorRGB(0.184, 0.310, 0.310)
    p.drawString(margin, y, f"Frw {lease.rent_amount:,} / month")
    y -= 0.32 * inch

    # Dates and status in one row
    p.setFont("Helvetica-Bold", 10)
    p.setFillColorRGB(0.3, 0.3, 0.3)
    p.drawString(margin, y, "Start Date:")
    p.setFont("Helvetica", 10)
    p.setFillColorRGB(0.2, 0.2, 0.2)
    p.drawString(margin + 0.9 * inch, y, str(lease.start_date))

    p.setFont("Helvetica-Bold", 10)
    p.setFillColorRGB(0.3, 0.3, 0.3)
    p.drawString(width / 2 - 0.5 * inch, y, "End Date:")
    p.setFont("Helvetica", 10)
    p.setFillColorRGB(0.2, 0.2, 0.2)
    p.drawString(width / 2 + 0.35 * inch, y, str(lease.end_date))

    status = lease.get_status_display()
    p.setFont("Helvetica-Bold", 10)
    p.setFillColorRGB(0.3, 0.3, 0.3)
    p.drawString(width - 3 * inch, y, "Status:")
    p.setFont("Helvetica", 10)
    p.setFillColorRGB(0.0, 0.5, 0.2)
    p.drawString(width - 2.3 * inch, y, status)
    y -= row_gap * 1.4

    # ── Contract Details section ─────────────────────────────────────────────
    p.setFillColorRGB(0.184, 0.310, 0.310)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin, y, "CONTRACT DETAILS")
    y -= 0.22 * inch
    p.setStrokeColorRGB(0.8, 0.8, 0.8)
    p.line(margin, y, width - margin, y)
    y -= 0.28 * inch

    details_text = lease.contract_details or "(No contract details provided)"
    wrapped_lines = []
    for paragraph in details_text.split('\n'):
        wrapped_lines.extend(textwrap.wrap(paragraph, width=95) or [''])

    p.setFont("Helvetica", 10)
    p.setFillColorRGB(0.15, 0.15, 0.15)
    for line in wrapped_lines:
        if y < 2.5 * inch:
            p.showPage()
            p.setFillColorRGB(0.184, 0.310, 0.310)
            p.rect(0, height - 0.35 * inch, width, 0.35 * inch, fill=1, stroke=0)
            p.setFillColorRGB(1, 1, 1)
            p.setFont("Helvetica-Bold", 9)
            p.drawString(margin, height - 0.22 * inch, "AFRIMASTER PROPERTIES — Rental Agreement (continued)")
            y = height - 0.6 * inch
            p.setFont("Helvetica", 10)
            p.setFillColorRGB(0.15, 0.15, 0.15)
        p.drawString(margin, y, line)
        y -= 0.22 * inch

    y -= 0.2 * inch

    # ── Signature section ────────────────────────────────────────────────────
    if y < 2.0 * inch:
        p.showPage()
        y = height - 1.2 * inch

    p.setFillColorRGB(0.184, 0.310, 0.310)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin, y, "SIGNATURES")
    y -= 0.22 * inch
    p.setStrokeColorRGB(0.8, 0.8, 0.8)
    p.line(margin, y, width - margin, y)
    y -= 0.5 * inch

    sig_col1 = margin
    sig_col2 = width / 2 + 0.2 * inch
    sig_line_w = 2.4 * inch

    # Owner signature
    p.setStrokeColorRGB(0.4, 0.4, 0.4)
    p.line(sig_col1, y, sig_col1 + sig_line_w, y)
    p.line(sig_col2, y, sig_col2 + sig_line_w, y)
    y -= 0.18 * inch

    p.setFont("Helvetica-Bold", 9)
    p.setFillColorRGB(0.3, 0.3, 0.3)
    p.drawString(sig_col1, y, f"Owner: {prop.owner.name}")
    p.drawString(sig_col2, y, f"Tenant: {tenant.name}")
    y -= 0.18 * inch

    p.setFont("Helvetica", 9)
    p.setFillColorRGB(0.5, 0.5, 0.5)
    p.drawString(sig_col1, y, "Date: ____________________")
    p.drawString(sig_col2, y, "Date: ____________________")

    # ── Footer bar ────────────────────────────────────────────────────────────
    p.setFillColorRGB(0.184, 0.310, 0.310)
    p.rect(0, 0, width, 0.4 * inch, fill=1, stroke=0)
    p.setFillColorRGB(1, 1, 1)
    p.setFont("Helvetica", 8)
    p.drawCentredString(width / 2, 0.15 * inch,
                        "Urugwiro Properties — Confidential Rental Agreement — Not valid without authorized signatures")

    p.showPage()
    p.save()


# ─── Admin Lease CRUD ───────────────────────────────────────────────────────

@csrf_exempt
@login_required
def add_lease(request):
    if not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        return redirect('index')

    tenants = Tenant.objects.all()
    properties = Property.objects.all()
    message_total = CustomerMessage.objects.filter(is_read=False).count()
    total_enquiries = CustRequest.objects.filter(is_read=False).count()

    if request.method == 'POST':
        try:
            new_lease = Lease.objects.create(
                tenant_id=request.POST.get('tenant_id'),
                property_id=request.POST.get('property_id'),
                start_date=request.POST.get('start_date'),
                end_date=request.POST.get('end_date'),
                rent_amount=request.POST.get('rent_amount'),
                contract_details=request.POST.get('contract_details', ''),
                contract_signed=request.POST.get('contract_signed') == 'true',
                contract_accepted=request.POST.get('contract_accepted') == 'true',
            )
            from .log_service import syslog
            syslog('LEASE', f"Lease created (id={new_lease.pk})", user=request.user, request=request, lease_id=new_lease.pk)
            messages.success(request, 'Lease created successfully.')
            return redirect('manage_leases')
        except Exception as e:
            messages.error(request, f'Error creating lease: {e}')

    context = {
        'tenants': tenants,
        'properties': properties,
        'message_total': message_total,
        'total_enquiries': total_enquiries,
    }
    return render(request, 'admin/Leases/add_lease.html', context)


@csrf_exempt
@login_required
def edit_lease(request, lease_id):
    if not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        return redirect('index')

    lease = get_object_or_404(Lease, id=lease_id)
    tenants = Tenant.objects.all()
    properties = Property.objects.all()
    message_total = CustomerMessage.objects.filter(is_read=False).count()
    total_enquiries = CustRequest.objects.filter(is_read=False).count()

    if request.method == 'POST':
        try:
            lease.tenant_id = request.POST.get('tenant_id')
            lease.property_id = request.POST.get('property_id')
            lease.start_date = request.POST.get('start_date')
            lease.end_date = request.POST.get('end_date')
            lease.rent_amount = request.POST.get('rent_amount')
            lease.contract_details = request.POST.get('contract_details', '')
            lease.contract_signed = request.POST.get('contract_signed') == 'true'
            lease.contract_accepted = request.POST.get('contract_accepted') == 'true'
            lease.save()
            from .log_service import syslog
            syslog('LEASE', f"Lease updated (id={lease_id})", user=request.user, request=request, lease_id=lease_id)
            messages.success(request, 'Lease updated successfully.')
            return redirect('manage_leases')
        except Exception as e:
            messages.error(request, f'Error updating lease: {e}')

    context = {
        'lease': lease,
        'tenants': tenants,
        'properties': properties,
        'message_total': message_total,
        'total_enquiries': total_enquiries,
    }
    return render(request, 'admin/Leases/edit_lease.html', context)


# ─── Owner Edit Contract ────────────────────────────────────────────────────

@csrf_exempt
@login_required
def owner_edit_contract(request, user_id, lease_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id and not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        return redirect('index')

    lease = get_object_or_404(Lease, id=lease_id)
    try:
        owner = Owner.objects.get(user=user)
    except Owner.DoesNotExist:
        owner = None
    properties = Property.objects.filter(owner=owner) if owner else Property.objects.none()
    tenants = Tenant.objects.all()
    message_total = Message.objects.filter(recipient=user, is_read=False).count()

    if request.method == 'POST':
        try:
            lease.property_id = request.POST.get('property_id')
            lease.tenant_id = request.POST.get('tenant_id')
            lease.start_date = request.POST.get('start_date')
            lease.end_date = request.POST.get('end_date')
            lease.rent_amount = request.POST.get('rent_amount')
            lease.contract_details = request.POST.get('contract_details', '')
            lease.save()
            messages.success(request, 'Contract updated successfully.')
            return redirect('owner_contracts', user.id)
        except Exception as e:
            messages.error(request, f'Error updating contract: {e}')

    context = {
        'user': user,
        'owner': owner,
        'lease': lease,
        'properties': properties,
        'tenants': tenants,
        'message_total': message_total,
    }
    return render(request, 'Others_dashboard/owners/leases/owner_edit_contract.html', context)


# ─── Owner Messaging ────────────────────────────────────────────────────────

@csrf_exempt
@login_required
def owner_messages(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id and not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        messages.error(request, 'You do not have permission to view these messages.')
        return redirect('index')

    allowed_recipients = User.objects.filter(role__in=['Admin', 'Tenant']).exclude(id=user.id)

    if request.method == 'POST':
        form = MessageForm(request.POST, allowed_recipients=allowed_recipients)
        if form.is_valid():
            msg = form.save(commit=False)
            msg.sender = request.user
            msg.save()
            messages.success(request, 'Message sent.')
            return redirect('owner_conversation', user.id, msg.recipient.id)
    else:
        form = MessageForm(allowed_recipients=allowed_recipients)

    conversations = _get_conversations(user)
    total_unread = sum(c['unread'] for c in conversations)
    message_total = Message.objects.filter(recipient=user, is_read=False).count()
    try:
        owner = Owner.objects.get(user=user)
    except Owner.DoesNotExist:
        owner = None

    context = {
        'user': user,
        'owner': owner,
        'conversations': conversations,
        'total_unread': total_unread,
        'form': form,
        'message_total': message_total,
    }
    return render(request, 'Others_dashboard/owners/owner_messages.html', context)


@csrf_exempt
@login_required
def owner_conversation(request, user_id, contact_id):
    user = get_object_or_404(User, id=user_id)
    contact = get_object_or_404(User, id=contact_id)
    if request.user.id != user.id and not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        messages.error(request, 'You do not have permission.')
        return redirect('index')

    Message.objects.filter(sender=contact, recipient=user, is_read=False).update(is_read=True)

    if request.method == 'POST':
        content = request.POST.get('content', '').strip()
        if content:
            Message.objects.create(sender=request.user, recipient=contact, content=content)
        return redirect('owner_conversation', user.id, contact.id)

    thread_messages = Message.objects.filter(
        Q(sender=user, recipient=contact) | Q(sender=contact, recipient=user)
    ).order_by('sent_date')

    message_total = Message.objects.filter(recipient=user, is_read=False).count()
    try:
        owner = Owner.objects.get(user=user)
    except Owner.DoesNotExist:
        owner = None

    context = {
        'user': user,
        'owner': owner,
        'contact': contact,
        'thread_messages': thread_messages,
        'message_total': message_total,
    }
    return render(request, 'Others_dashboard/owners/owner_conversation.html', context)


@csrf_exempt
@login_required
def owner_delete_message(request, user_id, message_id):
    user = get_object_or_404(User, id=user_id)
    msg = get_object_or_404(Message, id=message_id)
    if request.user == msg.sender or request.user == msg.recipient:
        contact_id = msg.recipient.id if msg.sender == request.user else msg.sender.id
        msg.delete()
        return redirect('owner_conversation', user.id, contact_id)
    return redirect('owner_messages', user.id)


# ─── Admin Maintenance Management ───────────────────────────────────────────

@csrf_exempt
@login_required
def admin_maintenance(request):
    if not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        return redirect('index')

    status_filter = request.GET.get('status', '')
    qs = MaintenanceRequest.objects.select_related('property', 'tenant__user').order_by('-request_date')
    if status_filter:
        qs = qs.filter(status=status_filter)

    message_total = CustomerMessage.objects.filter(is_read=False).count()
    total_enquiries = CustRequest.objects.filter(is_read=False).count()

    context = {
        'maintenance_requests': qs,
        'status_filter': status_filter,
        'message_total': message_total,
        'total_enquiries': total_enquiries,
    }
    return render(request, 'admin/maintenance/admin_maintenance.html', context)


@csrf_exempt
@login_required
def admin_update_maintenance(request, request_id):
    if not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        return redirect('index')
    maint = get_object_or_404(MaintenanceRequest, id=request_id)
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in ['open', 'in_progress', 'completed']:
            maint.status = new_status
            if new_status == 'completed' and not maint.completion_date:
                maint.completion_date = now()
            maint.save()
    return redirect('admin_maintenance')


# ─── Owner Maintenance Management ───────────────────────────────────────────

@csrf_exempt
@login_required
def owner_maintenance(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id and not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        return redirect('index')

    try:
        owner = Owner.objects.get(user=user)
        maintenance_requests = MaintenanceRequest.objects.filter(
            property__owner=owner
        ).select_related('property', 'tenant__user').order_by('-request_date')
    except Owner.DoesNotExist:
        owner = None
        maintenance_requests = MaintenanceRequest.objects.none()

    message_total = Message.objects.filter(recipient=user, is_read=False).count()
    context = {
        'user': user,
        'owner': owner,
        'maintenance_requests': maintenance_requests,
        'message_total': message_total,
    }
    return render(request, 'Others_dashboard/owners/owner_maintenance.html', context)


@csrf_exempt
@login_required
def owner_update_maintenance(request, user_id, request_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id and not (hasattr(request.user, 'role') and request.user.role == 'Admin'):
        return redirect('index')
    maint = get_object_or_404(MaintenanceRequest, id=request_id)
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in ['open', 'in_progress', 'completed']:
            maint.status = new_status
            if new_status == 'completed' and not maint.completion_date:
                maint.completion_date = now()
            maint.save()
    return redirect('owner_maintenance', user.id)


# ═══════════════════════════════════════════════════════════════════════════════
#   REAL ESTATE MARKETPLACE VIEWS — Sale Listings, Agents, Sellers, Offers
# ═══════════════════════════════════════════════════════════════════════════════

# ─── Public: Browse sale listings ────────────────────────────────────────────

def sale_listings(request):
    """Browse all properties for sale with filters."""
    listings = SaleProperty.objects.filter(status='listed')

    # Filters
    ptype = request.GET.get('type', '')
    city = request.GET.get('city', '')
    min_price = request.GET.get('min_price', '')
    max_price = request.GET.get('max_price', '')
    search = request.GET.get('q', '')

    if ptype:
        listings = listings.filter(property_type=ptype)
    if city:
        listings = listings.filter(city__icontains=city)
    if min_price:
        listings = listings.filter(price__gte=min_price)
    if max_price:
        listings = listings.filter(price__lte=max_price)
    if search:
        listings = listings.filter(Q(title__icontains=search) | Q(description__icontains=search) | Q(address__icontains=search))

    paginator = Paginator(listings, 12)
    page = request.GET.get('page')
    listings = paginator.get_page(page)

    # All (filtered) sale listings for map — not paginated
    all_listings_qs = SaleProperty.objects.filter(status='listed')
    if ptype:   all_listings_qs = all_listings_qs.filter(property_type=ptype)
    if city:    all_listings_qs = all_listings_qs.filter(city__icontains=city)
    if min_price: all_listings_qs = all_listings_qs.filter(price__gte=min_price)
    if max_price: all_listings_qs = all_listings_qs.filter(price__lte=max_price)
    if search:  all_listings_qs = all_listings_qs.filter(Q(title__icontains=search)|Q(description__icontains=search)|Q(address__icontains=search))

    map_listings = json.dumps([
        {
            'id': p.id,
            'name': p.title,
            'address': p.address,
            'price': str(p.price),
            'type': p.property_type,
            'url': f'/for-sale/{p.id}/',
        }
        for p in all_listings_qs
    ])

    context = {
        'listings': listings,
        'sale_property_types': SaleProperty._meta.get_field('property_type').choices,
        'current_type': ptype,
        'current_city': city,
        'current_min': min_price,
        'current_max': max_price,
        'current_search': search,
        'map_listings': map_listings,
    }
    return render(request, 'home/sale_listings.html', context)


def listing_detail(request, slug=None, pk=None):
    """Unified view for all asset types (Rentals, Sales, Land, Vehicles, Services)."""
    if slug:
        listing = get_object_or_404(Listing, slug=slug)
    elif pk:
        listing = get_object_or_404(Listing, pk=pk)
    else:
        return redirect('explore')

    # Increment views
    listing.views_count += 1
    listing.save(update_fields=['views_count'])

    # Resolve Extension data based on listing type
    extension = None
    if listing.listing_type == 'rental':
        extension = getattr(listing, 'rental_data', None)
    elif listing.listing_type == 'sale':
        extension = getattr(listing, 'sale_data', None)
    elif listing.listing_type == 'land':
        extension = getattr(listing, 'land_data', None)
    elif listing.listing_type == 'vehicle':
        extension = getattr(listing, 'vehicle_data', None)
    elif listing.listing_type == 'service':
        extension = getattr(listing, 'service_data', None)

    # User engagement state
    user = request.user
    is_liked = False
    if user.is_authenticated:
        is_liked = LikedProperties.objects.filter(user=user, listing=listing).exists()

    # Similar assets for cross-selling
    similar = Listing.objects.filter(
        listing_type=listing.listing_type,
        status='listed'
    ).exclude(pk=listing.pk).order_by('?')[:4]

    # Dynamic forms based on asset type
    inquiry_form = PropertyInquiryForm()
    offer_form = None
    if listing.listing_type == 'sale':
        offer_form = OfferForm()

    if request.method == 'POST':
        if 'submit_inquiry' in request.POST:
            inquiry_form = PropertyInquiryForm(request.POST)
            if inquiry_form.is_valid():
                inq = inquiry_form.save(commit=False)
                inq.listing = listing
                inq.save()
                messages.success(request, 'Your inquiry has been sent to the owner.')
                return redirect('listing_detail', slug=listing.slug)

        elif 'submit_offer' in request.POST and user.is_authenticated:
            if offer_form:
                offer_form = OfferForm(request.POST)
                if offer_form.is_valid():
                    offer = offer_form.save(commit=False)
                    offer.listing = listing
                    offer.buyer = user
                    # If it's a sale and has an assigned agent, link the offer
                    if listing.listing_type == 'sale' and hasattr(listing, 'assigned_agent'):
                        offer.agent = listing.assigned_agent
                    offer.save()
                    messages.success(request, 'Your offer has been submitted successfully.')
                    return redirect('listing_detail', slug=listing.slug)

    context = {
        'listing': listing,
        'extension': extension,
        'is_liked': is_liked,
        'similar': similar,
        'inquiry_form': inquiry_form,
        'offer_form': offer_form,
        'offers_count': listing.offers.count() if hasattr(listing, 'offers') else 0,
    }
    return render(request, 'home/listing_detail.html', context)



def agent_directory(request):
    """Browse all verified agents."""
    agents = Agent.objects.filter(is_verified=True).order_by('-rating')
    paginator = Paginator(agents, 12)
    page = request.GET.get('page')
    agents = paginator.get_page(page)
    return render(request, 'home/agent_directory.html', {'agents': agents})


def agent_profile_public(request, pk):
    """Public agent profile page."""
    agent = get_object_or_404(Agent, pk=pk)
    listings = agent.assigned_properties.filter(status='listed')[:6]
    reviews = agent.reviews.all()[:10]
    review_form = AgentReviewForm()

    if request.method == 'POST' and request.user.is_authenticated:
        review_form = AgentReviewForm(request.POST)
        if review_form.is_valid():
            review = review_form.save(commit=False)
            review.agent = agent
            review.reviewer = request.user
            review.save()
            # Update agent rating
            from django.db.models import Avg
            avg = agent.reviews.aggregate(Avg('rating'))['rating__avg'] or 0
            agent.rating = round(avg, 2)
            agent.save(update_fields=['rating'])
            messages.success(request, 'Review submitted!')
            return redirect('agent_profile_public', pk=pk)

    context = {
        'agent': agent,
        'listings': listings,
        'reviews': reviews,
        'review_form': review_form,
    }
    return render(request, 'home/agent_profile.html', context)


# ─── Seller Dashboard ────────────────────────────────────────────────────────

@login_required
def create_seller_profile(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    if hasattr(user, 'seller_profile'):
        return redirect('seller_dashboard', user.id)
    if request.method == 'POST':
        form = SellerProfileForm(request.POST, request.FILES)
        if form.is_valid():
            seller = form.save(commit=False)
            seller.user = user
            seller.save()
            messages.success(request, 'Seller profile created!')
            return redirect('seller_dashboard', user.id)
    else:
        form = SellerProfileForm(initial={'name': user.username, 'email': user.email})
    return render(request, 'Others_dashboard/sellers/create_seller_profile.html', {'form': form})


@login_required
def seller_dashboard(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    seller = get_object_or_404(Seller, user=user)
    properties = seller.sale_properties.all()
    total_listed = properties.filter(status='listed').count()
    total_sold = properties.filter(status='sold').count()
    total_under_neg = properties.filter(status='under_negotiation').count()
    total_offers = Offer.objects.filter(sale_property__seller=seller).count()
    pending_offers = Offer.objects.filter(sale_property__seller=seller, status='pending').count()
    total_inquiries = PropertyInquiry.objects.filter(sale_property__seller=seller).count()

    context = {
        'seller': seller,
        'properties': properties[:10],
        'total_listed': total_listed,
        'total_sold': total_sold,
        'total_under_neg': total_under_neg,
        'total_offers': total_offers,
        'pending_offers': pending_offers,
        'total_inquiries': total_inquiries,
    }
    return render(request, 'Others_dashboard/sellers/seller_dashboard.html', context)


@login_required
def seller_add_property(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    seller = get_object_or_404(Seller, user=user)
    if request.method == 'POST':
        form = SalePropertyForm(request.POST, request.FILES)
        if form.is_valid():
            prop = form.save(commit=False)
            prop.seller = seller
            prop.save()
            messages.success(request, 'Property listed successfully!')
            return redirect('seller_dashboard', user.id)
    else:
        form = SalePropertyForm()
    return render(request, 'Others_dashboard/sellers/seller_add_property.html', {'form': form, 'seller': seller})


@login_required
def seller_edit_property(request, user_id, property_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    seller = get_object_or_404(Seller, user=user)
    prop = get_object_or_404(SaleProperty, pk=property_id, seller=seller)
    if request.method == 'POST':
        form = SalePropertyForm(request.POST, request.FILES, instance=prop)
        if form.is_valid():
            form.save()
            messages.success(request, 'Property updated!')
            return redirect('seller_dashboard', user.id)
    else:
        form = SalePropertyForm(instance=prop)
    return render(request, 'Others_dashboard/sellers/seller_edit_property.html', {'form': form, 'property': prop, 'seller': seller})


@login_required
def seller_delete_property(request, user_id, property_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    seller = get_object_or_404(Seller, user=user)
    prop = get_object_or_404(SaleProperty, pk=property_id, seller=seller)
    prop.delete()
    messages.success(request, 'Listing removed.')
    return redirect('seller_dashboard', user.id)


@login_required
def seller_offers(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    seller = get_object_or_404(Seller, user=user)
    offers = Offer.objects.filter(sale_property__seller=seller).select_related('sale_property', 'buyer', 'agent').order_by('-created_at')
    return render(request, 'Others_dashboard/sellers/seller_offers.html', {'offers': offers, 'seller': seller})


@login_required
def seller_respond_offer(request, user_id, offer_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    seller = get_object_or_404(Seller, user=user)
    offer = get_object_or_404(Offer, pk=offer_id, sale_property__seller=seller)
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'accept':
            offer.status = 'accepted'
            offer.sale_property.status = 'under_negotiation'
            offer.sale_property.save()
        elif action == 'reject':
            offer.status = 'rejected'
        elif action == 'counter':
            offer.status = 'countered'
            offer.counter_amount = request.POST.get('counter_amount')
        offer.save()
        messages.success(request, f'Offer {action}ed.')
    return redirect('seller_offers', user.id)


@login_required
def seller_inquiries(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    seller = get_object_or_404(Seller, user=user)
    inquiries = PropertyInquiry.objects.filter(sale_property__seller=seller).select_related('sale_property').order_by('-created_at')
    return render(request, 'Others_dashboard/sellers/seller_inquiries.html', {'inquiries': inquiries, 'seller': seller})


# ─── Agent Dashboard ─────────────────────────────────────────────────────────

@login_required
def create_agent_profile(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    if hasattr(user, 'agent_profile'):
        return redirect('agent_dashboard', user.id)
    if request.method == 'POST':
        form = AgentProfileForm(request.POST, request.FILES)
        if form.is_valid():
            agent = form.save(commit=False)
            agent.user = user
            agent.save()
            messages.success(request, 'Agent profile created!')
            return redirect('agent_dashboard', user.id)
    else:
        form = AgentProfileForm(initial={'name': user.username, 'email': user.email})
    return render(request, 'Others_dashboard/agents/create_agent_profile.html', {'form': form})


@login_required
def agent_dashboard(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    agent = get_object_or_404(Agent, user=user)
    assigned = agent.assigned_properties.all()
    total_assigned = assigned.count()
    active_listings = assigned.filter(status='listed').count()
    under_negotiation = assigned.filter(status='under_negotiation').count()
    sold = assigned.filter(status='sold').count()
    upcoming_visits = agent.site_visits.filter(status='scheduled').order_by('scheduled_date')[:5]
    recent_offers = Offer.objects.filter(agent=agent).order_by('-created_at')[:5]
    total_reviews = agent.reviews.count()

    context = {
        'agent': agent,
        'total_assigned': total_assigned,
        'active_listings': active_listings,
        'under_negotiation': under_negotiation,
        'sold': sold,
        'upcoming_visits': upcoming_visits,
        'recent_offers': recent_offers,
        'total_reviews': total_reviews,
        'assigned_properties': assigned[:10],
    }
    return render(request, 'Others_dashboard/agents/agent_dashboard.html', context)


@login_required
def agent_assigned_properties(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    agent = get_object_or_404(Agent, user=user)
    properties = agent.assigned_properties.all().order_by('-date_listed')
    return render(request, 'Others_dashboard/agents/agent_properties.html', {'properties': properties, 'agent': agent})


@login_required
def agent_schedule_visit(request, user_id, property_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    agent = get_object_or_404(Agent, user=user)
    prop = get_object_or_404(SaleProperty, pk=property_id)
    if request.method == 'POST':
        form = SiteVisitForm(request.POST)
        if form.is_valid():
            visit = form.save(commit=False)
            visit.agent = agent
            visit.sale_property = prop
            visit.save()
            messages.success(request, 'Visit scheduled!')
            return redirect('agent_site_visits', user.id)
    else:
        form = SiteVisitForm()
    return render(request, 'Others_dashboard/agents/schedule_visit.html', {'form': form, 'property': prop, 'agent': agent})


@login_required
def agent_site_visits(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    agent = get_object_or_404(Agent, user=user)
    visits = agent.site_visits.all().order_by('-scheduled_date')
    return render(request, 'Others_dashboard/agents/agent_visits.html', {'visits': visits, 'agent': agent})


@login_required
def agent_update_visit(request, user_id, visit_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    agent = get_object_or_404(Agent, user=user)
    visit = get_object_or_404(SiteVisit, pk=visit_id, agent=agent)
    if request.method == 'POST':
        visit.status = request.POST.get('status', visit.status)
        visit.report = request.POST.get('report', visit.report)
        visit.notes = request.POST.get('notes', visit.notes)
        visit.save()
        messages.success(request, 'Visit updated!')
    return redirect('agent_site_visits', user.id)


@login_required
def agent_offers(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    agent = get_object_or_404(Agent, user=user)
    offers = Offer.objects.filter(agent=agent).select_related('sale_property', 'buyer').order_by('-created_at')
    return render(request, 'Others_dashboard/agents/agent_offers.html', {'offers': offers, 'agent': agent})


@login_required
def agent_upload_photos(request, user_id, property_id):
    """Agent uploads photos after site visit."""
    user = get_object_or_404(User, id=user_id)
    if request.user.id != user.id:
        return redirect('index')
    agent = get_object_or_404(Agent, user=user)
    prop = get_object_or_404(SaleProperty, pk=property_id, assigned_agent=agent)
    if request.method == 'POST':
        if request.FILES.get('image'):
            prop.image = request.FILES['image']
        if request.FILES.get('image_2'):
            prop.image_2 = request.FILES['image_2']
        if request.FILES.get('image_3'):
            prop.image_3 = request.FILES['image_3']
        if request.FILES.get('image_4'):
            prop.image_4 = request.FILES['image_4']
        if request.FILES.get('image_5'):
            prop.image_5 = request.FILES['image_5']
        prop.save()
        messages.success(request, 'Photos uploaded!')
        return redirect('agent_assigned_properties', user.id)
    return render(request, 'Others_dashboard/agents/upload_photos.html', {'property': prop, 'agent': agent})


# ─── Admin: Manage marketplace ───────────────────────────────────────────────

@login_required
@user_passes_test(is_admin)
def admin_sale_properties(request):
    properties = SaleProperty.objects.all().select_related('seller', 'assigned_agent')
    agents = Agent.objects.all()
    context = {
        'properties': properties,
        'agents': agents,
        'listed_count': properties.filter(status='listed').count(),
        'negotiation_count': properties.filter(status='under_negotiation').count(),
        'sold_count': properties.filter(status='sold').count(),
    }
    return render(request, 'admin/marketplace/sale_properties.html', context)


@login_required
@user_passes_test(is_admin)
def admin_assign_agent(request, property_id):
    prop = get_object_or_404(SaleProperty, pk=property_id)
    if request.method == 'POST':
        agent_id = request.POST.get('agent_id')
        if agent_id:
            agent = get_object_or_404(Agent, pk=agent_id)
            prop.assigned_agent = agent
            prop.save()
            AgentAssignment.objects.create(agent=agent, sale_property=prop)
            messages.success(request, f'Agent {agent.name} assigned to {prop.title}')
    return redirect('admin_sale_properties')


@login_required
@user_passes_test(is_admin)
def admin_agents(request):
    agents = Agent.objects.all()
    return render(request, 'admin/marketplace/agents.html', {
        'agents': agents,
        'verified_count': agents.filter(is_verified=True).count(),
        'unverified_count': agents.filter(is_verified=False).count(),
    })


@login_required
@user_passes_test(is_admin)
def admin_verify_agent(request, agent_id):
    agent = get_object_or_404(Agent, pk=agent_id)
    agent.is_verified = not agent.is_verified
    agent.save()
    messages.success(request, f'Agent {"verified" if agent.is_verified else "unverified"}.')
    return redirect('admin_agents')


@login_required
@user_passes_test(is_admin)
def admin_sellers(request):
    sellers = Seller.objects.all()
    return render(request, 'admin/marketplace/sellers.html', {
        'sellers': sellers,
        'verified_count': sellers.filter(is_verified=True).count(),
        'unverified_count': sellers.filter(is_verified=False).count(),
    })


@login_required
@user_passes_test(is_admin)
def admin_verify_seller(request, seller_id):
    seller = get_object_or_404(Seller, pk=seller_id)
    seller.is_verified = not seller.is_verified
    seller.save()
    messages.success(request, f'Seller {"verified" if seller.is_verified else "unverified"}.')
    return redirect('admin_sellers')


@login_required
@user_passes_test(is_admin)
def admin_all_offers(request):
    offers = Offer.objects.all().select_related('sale_property', 'buyer', 'agent').order_by('-created_at')
    return render(request, 'admin/marketplace/offers.html', {
        'offers': offers,
        'pending_count': offers.filter(status='pending').count(),
        'accepted_count': offers.filter(status='accepted').count(),
        'rejected_count': offers.filter(status='rejected').count(),
    })


# ═══════════════════════════════════════════════════════════════
# SOCIAL FEED VIEWS
# ═══════════════════════════════════════════════════════════════

import re as _re
from django.http import JsonResponse
from .models import Post, PostMedia, Hashtag, PostHashtag, PostComment, PostLike, Notification


def _extract_hashtags(html_content):
    """Extract hashtag names from post HTML content."""
    text = _re.sub(r'<[^>]+>', ' ', html_content)
    return list({tag.lower() for tag in _re.findall(r'#(\w+)', text)})


def _push(recipient, actor, ntype, message, link=''):
    """Send notification if recipient != actor."""
    if recipient == actor:
        return
    from .consumers import push_notification
    push_notification(recipient, actor, ntype, message, link)


# ─── Feed ──────────────────────────────────────────────────

def feed_view(request):
    posts_qs = Post.objects.filter(is_public=True).select_related(
        'author', 'original_post__author'
    ).prefetch_related('media', 'post_hashtags__hashtag', 'likes', 'comments')
    paginator = Paginator(posts_qs, 20)
    page = paginator.get_page(request.GET.get('page', 1))

    # Trending hashtags (top 10 by usage)
    from django.db.models import Count
    trending = (
        Hashtag.objects.annotate(count=Count('post_hashtags'))
        .order_by('-count')[:10]
    )

    user_liked_ids = set()
    if request.user.is_authenticated:
        user_liked_ids = set(
            PostLike.objects.filter(user=request.user).values_list('post_id', flat=True)
        )

    return render(request, 'social/feed.html', {
        'page_obj': page,
        'trending': trending,
        'user_liked_ids': user_liked_ids,
    })


@login_required
def create_post_view(request):
    if request.method != 'POST':
        return redirect('feed')

    content = request.POST.get('content', '').strip()
    location = request.POST.get('location', '').strip()
    repost_id = request.POST.get('repost_id', '').strip()

    if not content and not repost_id:
        messages.error(request, 'Post cannot be empty.')
        return redirect('feed')

    original = None
    repost_comment = ''
    if repost_id:
        original = get_object_or_404(Post, id=repost_id, is_public=True)
        repost_comment = content
        content = content or original.content  # use original content if no comment

    post = Post.objects.create(
        author=request.user,
        content=content,
        location=location,
        original_post=original,
        repost_comment=repost_comment,
    )

    # Save media files (max 5)
    files = request.FILES.getlist('media')[:5]
    for i, f in enumerate(files):
        mtype = 'video' if f.content_type.startswith('video') else 'image'
        PostMedia.objects.create(post=post, file=f, media_type=mtype, order=i)

    # Extract and link hashtags
    for tag_name in _extract_hashtags(content):
        hashtag, _ = Hashtag.objects.get_or_create(name=tag_name)
        PostHashtag.objects.get_or_create(post=post, hashtag=hashtag)

    # Notify original author on repost
    if original and original.author != request.user:
        actor_name = request.user.get_full_name() or request.user.username
        _push(
            original.author, request.user, 'repost',
            f'{actor_name} reposted your post',
            f'/feed/post/{original.id}/'
        )

    messages.success(request, 'Post published!')
    return redirect('feed')


def post_detail_view(request, post_id):
    post = get_object_or_404(Post, id=post_id, is_public=True)
    top_comments = post.comments.filter(parent=None).prefetch_related('replies')

    user_liked = False
    if request.user.is_authenticated:
        user_liked = PostLike.objects.filter(post=post, user=request.user).exists()

    return render(request, 'social/post_detail.html', {
        'post': post,
        'comments': top_comments,
        'user_liked': user_liked,
    })


@login_required
def like_post_view(request, post_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    post = get_object_or_404(Post, id=post_id)
    like, created = PostLike.objects.get_or_create(post=post, user=request.user)
    if not created:
        like.delete()
        liked = False
    else:
        liked = True
        actor_name = request.user.get_full_name() or request.user.username
        _push(
            post.author, request.user, 'like',
            f'{actor_name} liked your post',
            f'/feed/post/{post.id}/'
        )
    return JsonResponse({'liked': liked, 'count': post.likes.count()})


@login_required
def repost_view(request, post_id):
    if request.method != 'POST':
        return redirect('feed')
    original = get_object_or_404(Post, id=post_id, is_public=True)
    comment = request.POST.get('repost_comment', '').strip()
    Post.objects.create(
        author=request.user,
        content=original.content,
        location=original.location,
        original_post=original,
        repost_comment=comment,
    )
    actor_name = request.user.get_full_name() or request.user.username
    _push(
        original.author, request.user, 'repost',
        f'{actor_name} reposted your post',
        f'/feed/post/{original.id}/'
    )
    messages.success(request, 'Reposted successfully!')
    return redirect('feed')


def add_comment_view(request, post_id):
    if request.method != 'POST':
        return redirect('post_detail', post_id=post_id)
    post = get_object_or_404(Post, id=post_id, is_public=True)
    content = request.POST.get('content', '').strip()
    parent_id = request.POST.get('parent_id', '').strip()

    if not content:
        messages.error(request, 'Comment cannot be empty.')
        return redirect('post_detail', post_id=post_id)

    parent = None
    if parent_id:
        parent = get_object_or_404(PostComment, id=parent_id, post=post)

    if request.user.is_authenticated:
        comment = PostComment.objects.create(
            post=post, user=request.user, content=content, parent=parent
        )
        actor_name = request.user.get_full_name() or request.user.username
        _push(
            post.author, request.user, 'comment',
            f'{actor_name} commented on your post',
            f'/feed/post/{post.id}/'
        )
    else:
        guest_name = request.POST.get('guest_name', '').strip()
        guest_email = request.POST.get('guest_email', '').strip()
        if not guest_name:
            messages.error(request, 'Please enter your name to comment.')
            return redirect('post_detail', post_id=post_id)
        PostComment.objects.create(
            post=post,
            content=content,
            guest_name=guest_name,
            guest_email=guest_email,
            parent=parent,
        )

    messages.success(request, 'Comment added!')
    return redirect('post_detail', post_id=post_id)


@login_required
def delete_post_view(request, post_id):
    post = get_object_or_404(Post, id=post_id, author=request.user)
    if request.method == 'POST':
        post.delete()
        messages.success(request, 'Post deleted.')
    return redirect('feed')


def hashtag_feed_view(request, tag):
    tag = tag.lower()
    try:
        hashtag = Hashtag.objects.get(name=tag)
        posts_qs = Post.objects.filter(
            post_hashtags__hashtag=hashtag, is_public=True
        ).select_related('author').prefetch_related('media', 'likes', 'comments')
    except Hashtag.DoesNotExist:
        posts_qs = Post.objects.none()
        hashtag = None

    paginator = Paginator(posts_qs, 20)
    page = paginator.get_page(request.GET.get('page', 1))

    user_liked_ids = set()
    if request.user.is_authenticated:
        user_liked_ids = set(
            PostLike.objects.filter(user=request.user).values_list('post_id', flat=True)
        )

    return render(request, 'social/feed.html', {
        'page_obj': page,
        'active_tag': tag,
        'hashtag': hashtag,
        'user_liked_ids': user_liked_ids,
    })


# ─── Notifications ─────────────────────────────────────────

@login_required
def notifications_view(request):
    notifs = Notification.objects.filter(recipient=request.user).select_related('actor')
    unread_count = notifs.filter(is_read=False).count()
    return render(request, 'notifications/notifications.html', {
        'notifications': notifs,
        'unread_count': unread_count,
    })


@login_required
def mark_notification_read(request, notif_id):
    notif = get_object_or_404(Notification, id=notif_id, recipient=request.user)
    notif.is_read = True
    notif.save(update_fields=['is_read'])
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({'ok': True})
    return redirect(notif.link or 'notifications')


@login_required
def mark_all_notifications_read(request):
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return redirect('notifications')


# ═══════════════════════════════════════════════════════════════
# PROPBOT AI CHATBOT  (Anthropic Claude API)
# ═══════════════════════════════════════════════════════════════

import logging as _logging
from asgiref.sync import sync_to_async

_chatbot_logger = _logging.getLogger(__name__)

# Keywords that signal the user is searching for a property
_RENT_KEYWORDS   = {'for rent', 'to rent', 'renting', 'rental', 'rent a', 'house to rent', 'place to rent', 'room to rent', 'rentals', 'monthly rent'}
_SALE_KEYWORDS   = {'for sale', 'to buy', 'buying', 'purchase', 'house to buy', 'invest', 'on sale', 'buy a', 'buy house', 'buy property', 'for purchase'}
_PROP_KEYWORDS   = {'house', 'apartment', 'flat', 'studio', 'duplex', 'villa', 'condo', 'property', 'properties', 'bedroom', 'unit', 'place', 'home', 'homes', 'listing', 'listings'}
_SEARCH_TRIGGERS = {'show', 'find', 'search', 'list', 'available', 'looking for', 'need a', 'want a', 'get me', 'any', 'show me', 'view', 'see', 'display', 'browse', 'what is available', "what's available"}
_CHEAP_KEYWORDS  = {'cheap', 'affordable', 'low price', 'low-price', 'budget', 'inexpensive', 'cheapest', 'lowest', 'best price', 'economy', 'low cost', 'low rent'}
_LUXURY_KEYWORDS = {'luxury', 'premium', 'expensive', 'high-end', 'executive', 'posh', 'upscale', 'high end'}


def _detect_property_search(message):
    """
    Detect if the user is asking for property listings.
    Returns (intent, sort) where intent is 'rent'|'sale'|'both'|None
    and sort is 'asc'|'desc'|'default'.
    Requires a property keyword AND either a rent/sale/search keyword.
    """
    msg = message.lower()

    has_prop    = any(k in msg for k in _PROP_KEYWORDS)
    has_rent    = any(k in msg for k in _RENT_KEYWORDS)
    has_sale    = any(k in msg for k in _SALE_KEYWORDS)
    has_trigger = any(k in msg for k in _SEARCH_TRIGGERS)
    has_cheap   = any(k in msg for k in _CHEAP_KEYWORDS)
    has_luxury  = any(k in msg for k in _LUXURY_KEYWORDS)

    # Must have a property keyword, and at least a search/rent/sale/cheap signal
    if not has_prop:
        return None, 'default'
    if not (has_rent or has_sale or has_trigger or has_cheap or has_luxury):
        return None, 'default'

    if has_rent and not has_sale:
        intent = 'rent'
    elif has_sale and not has_rent:
        intent = 'sale'
    else:
        intent = 'both'

    sort = 'asc' if has_cheap else ('desc' if has_luxury else 'default')
    return intent, sort


def _search_properties(intent, sort, limit=4):
    """Query DB for rental and/or sale properties. Returns list of dicts."""
    from .models import Property, SaleProperty
    from django.conf import settings as _s

    media_url = getattr(_s, 'MEDIA_URL', '/media/')
    results = []

    if intent in ('rent', 'both'):
        qs = Property.objects.filter(status='Available')
        if sort == 'asc':
            qs = qs.order_by('price')
        elif sort == 'desc':
            qs = qs.order_by('-price')
        else:
            qs = qs.order_by('-date_added')
        for p in qs[:limit]:
            results.append({
                'id': p.id,
                'listing_type': 'rent',
                'name': p.name,
                'address': p.address,
                'price': p.price,
                'price_label': f"RWF {p.price:,}/mo",
                'type': p.types,
                'status': p.status,
                'units': p.number_of_units,
                'description': (p.description or '')[:120],
                'image': media_url + str(p.image) if p.image else None,
                'url': f'/properties/',
            })

    if intent in ('sale', 'both'):
        qs = SaleProperty.objects.filter(status='listed')
        if sort == 'asc':
            qs = qs.order_by('price')
        elif sort == 'desc':
            qs = qs.order_by('-price')
        else:
            qs = qs.order_by('-date_listed')
        for p in qs[:limit]:
            results.append({
                'id': p.id,
                'listing_type': 'sale',
                'name': p.title,
                'address': f"{p.address}, {p.city}",
                'price': float(p.price),
                'price_label': f"RWF {float(p.price):,.0f}",
                'type': p.property_type,
                'status': p.status,
                'bedrooms': p.bedrooms,
                'bathrooms': p.bathrooms,
                'description': (p.description or '')[:120],
                'image': media_url + str(p.image) if p.image else None,
                'url': f'/for-sale/',
            })

    return results


def _build_system_prompt(user, data):
    """Return a role-aware system prompt enriched with real database context."""
    base = (
        "You are PropBot, a helpful AI assistant embedded in PropHub — "
        "a property management and real estate platform. "
        "Be concise, friendly, and practical. Always refer to the platform as 'PropHub'. "
        "IMPORTANT: Write in plain text only. Do NOT use any markdown formatting — "
        "no asterisks, no bold, no headers, no dashes for bullet points, no backticks. "
        "Write naturally as if texting a colleague. Keep responses brief and to the point. "
        "When the user asks about their data, use the live context provided below to answer accurately. "
        "CRITICAL RULE — PROPERTY SEARCHES: When the system indicates property cards are being shown, "
        "you MUST reply with ONE short sentence only, like: 'Found 3 affordable houses for rent — check the cards below!' "
        "Do NOT list property names, prices, or any details. The UI already shows photo cards with all details. "
        "Never say you cannot show images — the UI handles that automatically.\n\n"
    )

    if not user.is_authenticated:
        return base + (
            "The current visitor is not logged in. "
            "They can browse available rental and sale property listings freely — help them find properties without requiring login. "
            "Only suggest registering or logging in if they ask about account-specific features like their own lease, payments, maintenance requests, or sending messages. "
            "Do NOT tell them to log in just because they want to see properties."
        )

    role = getattr(user, 'role', 'Tenant')
    name = user.get_full_name() or user.username
    ctx = f"You are talking to {name} (role: {role}).\n\nLIVE DATA FROM THE SYSTEM:\n"

    if role == 'Tenant':
        lease = data.get('lease')
        maintenance = data.get('maintenance', [])
        payments = data.get('payments', [])
        unread = data.get('unread_messages', 0)

        ctx += f"Tenant name: {name}\n"
        if lease:
            ctx += (
                f"Active lease: Property '{lease['property']}', "
                f"rent RWF {lease['rent']:,}/month, "
                f"lease runs {lease['start']} to {lease['end']}, "
                f"contract signed: {lease['signed']}, accepted: {lease['accepted']}.\n"
            )
        else:
            ctx += "Active lease: none currently.\n"

        if maintenance:
            ctx += f"Maintenance requests ({len(maintenance)} total):\n"
            for m in maintenance[:5]:
                ctx += f"  - [{m['status']}] {m['title']} (submitted {m['date']})\n"
        else:
            ctx += "Maintenance requests: none.\n"

        if payments:
            ctx += f"Recent payments ({len(payments)} on record):\n"
            for p in payments[:3]:
                ctx += f"  - RWF {p['amount']:,} paid on {p['date']}\n"
        else:
            ctx += "Payments: no payments recorded yet.\n"

        ctx += f"Unread messages: {unread}.\n"
        ctx += "\nHelp this tenant with their lease, maintenance requests, payment history, and PropHub navigation."

    elif role == 'Owner':
        properties = data.get('properties', [])
        maintenance = data.get('maintenance', [])
        unread = data.get('unread_messages', 0)
        total_tenants = data.get('total_tenants', 0)

        ctx += f"Owner name: {name}\n"
        ctx += f"Total properties listed: {len(properties)}, Total tenants: {total_tenants}.\n"
        if properties:
            ctx += "Properties:\n"
            for p in properties[:8]:
                ctx += f"  - '{p['name']}' at {p['address']} | status: {p['status']} | price: RWF {p['price']:,} | units: {p['units']}\n"
        if maintenance:
            ctx += f"Open/In-progress maintenance requests ({len(maintenance)}):\n"
            for m in maintenance[:5]:
                ctx += f"  - [{m['status']}] {m['title']} on property '{m['property']}'\n"
        ctx += f"Unread messages: {unread}.\n"
        ctx += "\nHelp this owner manage their properties, tenants, leases, maintenance, and payments."

    elif role == 'Admin':
        s = data.get('stats', {})
        ctx += (
            f"System overview: {s.get('users',0)} total users, "
            f"{s.get('tenants',0)} tenants, {s.get('owners',0)} owners, "
            f"{s.get('agents',0)} agents, {s.get('sellers',0)} sellers.\n"
            f"Properties: {s.get('properties',0)} rental properties, "
            f"{s.get('sale_properties',0)} sale listings.\n"
            f"Leases: {s.get('leases',0)} active leases.\n"
            f"Maintenance: {s.get('open_maintenance',0)} open requests, "
            f"{s.get('inprogress_maintenance',0)} in progress.\n"
            f"Messages: {s.get('unread_messages',0)} unread messages system-wide.\n"
        )
        ctx += "\nHelp this admin manage and oversee the entire PropHub system."

    elif role == 'Agent':
        properties = data.get('properties', [])
        visits = data.get('visits', [])
        offers = data.get('offers', [])

        ctx += f"Agent name: {name}\n"
        ctx += f"Assigned sale properties: {len(properties)}.\n"
        if properties:
            for p in properties[:5]:
                ctx += f"  - '{p['title']}' in {p['city']} | RWF {p['price']:,} | status: {p['status']}\n"
        ctx += f"Upcoming site visits: {len(visits)}.\n"
        if visits:
            for v in visits[:3]:
                ctx += f"  - '{v['property']}' on {v['date']} | status: {v['status']}\n"
        ctx += f"Pending offers to handle: {len(offers)}.\n"
        ctx += "\nHelp this agent manage their assigned properties, site visits, and offers."

    elif role == 'Seller':
        properties = data.get('properties', [])
        offers = data.get('offers', [])

        ctx += f"Seller name: {name}\n"
        ctx += f"Listed properties: {len(properties)}.\n"
        if properties:
            for p in properties[:5]:
                ctx += f"  - '{p['title']}' | RWF {p['price']:,} | status: {p['status']} | offers: {p['offer_count']}\n"
        ctx += f"Total offers received: {len(offers)}.\n"
        if offers:
            for o in offers[:3]:
                ctx += f"  - Offer of RWF {o['amount']:,} on '{o['property']}' | status: {o['status']}\n"
        ctx += "\nHelp this seller manage their listings, respond to offers, and track sale progress."

    else:
        ctx += "Help this user navigate PropHub."

    return base + ctx


def _fetch_user_data(user):
    """Fetch live database context for the current user. Runs inside sync_to_async."""
    from .models import (
        Tenant, Owner, Lease, Property, MaintenanceRequest, Payment,
        Message, SaleProperty, Offer, SiteVisit, Agent, Seller, User as UserModel,
    )
    role = getattr(user, 'role', 'Tenant')
    data = {}

    try:
        if role == 'Tenant':
            try:
                tenant = Tenant.objects.get(user=user)
            except Tenant.DoesNotExist:
                return data

            lease = Lease.objects.filter(tenant=tenant).order_by('-start_date').first()
            if lease:
                data['lease'] = {
                    'property': lease.property.name if lease.property else 'N/A',
                    'rent': lease.rent_amount,
                    'start': str(lease.start_date),
                    'end': str(lease.end_date),
                    'signed': lease.contract_signed,
                    'accepted': lease.contract_accepted,
                }

            maintenance = MaintenanceRequest.objects.filter(tenant=tenant).order_by('-request_date')[:10]
            data['maintenance'] = [
                {'title': m.title, 'status': m.status, 'date': str(m.request_date.date())}
                for m in maintenance
            ]

            payments = Payment.objects.filter(tenant=tenant).order_by('-date_paid')[:5]
            data['payments'] = [
                {'amount': p.amount, 'date': str(p.date_paid.date())}
                for p in payments
            ]

            data['unread_messages'] = Message.objects.filter(recipient=user, is_read=False).count()

        elif role == 'Owner':
            try:
                owner = Owner.objects.get(user=user)
            except Owner.DoesNotExist:
                return data

            properties = Property.objects.filter(owner=owner)
            data['properties'] = [
                {
                    'name': p.name,
                    'address': p.address,
                    'status': p.status,
                    'price': p.price,
                    'units': p.number_of_units,
                }
                for p in properties[:10]
            ]

            property_ids = properties.values_list('id', flat=True)
            maintenance = MaintenanceRequest.objects.filter(
                property_id__in=property_ids,
                status__in=['open', 'in_progress']
            ).order_by('-request_date')[:10]
            data['maintenance'] = [
                {'title': m.title, 'status': m.status, 'property': m.property.name if m.property else 'N/A'}
                for m in maintenance
            ]

            tenant_ids = Lease.objects.filter(
                property_id__in=property_ids
            ).values_list('tenant_id', flat=True).distinct()
            data['total_tenants'] = len(set(tenant_ids))
            data['unread_messages'] = Message.objects.filter(recipient=user, is_read=False).count()

        elif role == 'Admin':
            data['stats'] = {
                'users': UserModel.objects.count(),
                'tenants': UserModel.objects.filter(role='Tenant').count(),
                'owners': UserModel.objects.filter(role='Owner').count(),
                'agents': UserModel.objects.filter(role='Agent').count(),
                'sellers': UserModel.objects.filter(role='Seller').count(),
                'properties': Property.objects.count(),
                'sale_properties': SaleProperty.objects.count(),
                'leases': Lease.objects.filter(contract_accepted=True).count(),
                'open_maintenance': MaintenanceRequest.objects.filter(status='open').count(),
                'inprogress_maintenance': MaintenanceRequest.objects.filter(status='in_progress').count(),
                'unread_messages': Message.objects.filter(is_read=False).count(),
            }

        elif role == 'Agent':
            try:
                agent = Agent.objects.get(user=user)
            except Agent.DoesNotExist:
                return data

            assigned = SaleProperty.objects.filter(assigned_agent=agent)
            data['properties'] = [
                {'title': p.title, 'city': p.city, 'price': float(p.price), 'status': p.status}
                for p in assigned[:8]
            ]

            visits = SiteVisit.objects.filter(agent=agent, status='scheduled').order_by('scheduled_date')[:5]
            data['visits'] = [
                {'property': v.sale_property.title, 'date': str(v.scheduled_date.date()), 'status': v.status}
                for v in visits
            ]

            offers = Offer.objects.filter(agent=agent, status='pending')
            data['offers'] = [
                {'property': o.sale_property.title, 'amount': float(o.amount), 'status': o.status}
                for o in offers[:5]
            ]

        elif role == 'Seller':
            try:
                seller = Seller.objects.get(user=user)
            except Seller.DoesNotExist:
                return data

            properties = SaleProperty.objects.filter(seller=seller)
            data['properties'] = [
                {
                    'title': p.title,
                    'price': float(p.price),
                    'status': p.status,
                    'offer_count': p.offers.count(),
                }
                for p in properties[:8]
            ]

            offers = Offer.objects.filter(sale_property__seller=seller).order_by('-created_at')[:5]
            data['offers'] = [
                {'property': o.sale_property.title, 'amount': float(o.amount), 'status': o.status}
                for o in offers
            ]

    except Exception as exc:
        _chatbot_logger.error("Error fetching user data for chatbot: %s", exc)

    return data


def _call_claude(messages_payload, api_key, model):
    """Call Anthropic API directly via requests (no SDK event-loop dependency)."""
    import requests as _requests
    system_prompt = ""
    chat_messages = []
    for m in messages_payload:
        if m["role"] == "system":
            system_prompt = m["content"]
        else:
            role = "assistant" if m["role"] == "bot" else "user"
            chat_messages.append({"role": role, "content": m["content"]})

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    payload = {
        "model": model,
        "max_tokens": 1024,
        "messages": chat_messages,
    }
    if system_prompt:
        payload["system"] = system_prompt

    resp = _requests.post(
        "https://api.anthropic.com/v1/messages",
        headers=headers,
        json=payload,
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["content"][0]["text"]


@csrf_exempt
async def chatbot_chat(request):
    """
    Async POST endpoint for PropBot AI chatbot.
    Body: { "message": "...", "clear": false }
    Returns: { "reply": "...", "history_length": N }
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    user_message = data.get('message', '').strip()
    clear_history = data.get('clear', False)
    conversation_id = data.get('conversation_id')

    if not user_message and not clear_history:
        return JsonResponse({'error': 'No message provided'}, status=400)

    # All session + user access must happen inside sync_to_async
    # because request.user is a lazy DB object and request.session is sync-only
    @sync_to_async
    def get_context():
        """Return (history, system_prompt, property_results, conv_id) from sync context."""
        from .models import ChatConversation
        if clear_history:
            request.session['ai_chat_history'] = []
            request.session.modified = True
            return [], '', [], None
        history = list(request.session.get('ai_chat_history', []))
        live_data = _fetch_user_data(request.user)

        # Create or get the DB conversation record
        conv = None
        if conversation_id:
            try:
                conv = ChatConversation.objects.get(id=conversation_id)
            except ChatConversation.DoesNotExist:
                pass
        if conv is None:
            title = user_message[:60] if user_message else 'New Chat'
            if request.user.is_authenticated:
                conv = ChatConversation.objects.create(user=request.user, title=title)
            else:
                if not request.session.session_key:
                    request.session.create()
                conv = ChatConversation.objects.create(
                    session_key=request.session.session_key, title=title
                )

        # Property search intent detection
        intent, sort = _detect_property_search(user_message)
        prop_results = []
        prop_context = ''
        if intent:
            prop_results = _search_properties(intent, sort, limit=4)
            if prop_results:
                label = 'for rent' if intent == 'rent' else ('for sale' if intent == 'sale' else 'for rent/sale')
                prop_context = (
                    f'\n\n[SYSTEM: {len(prop_results)} property card(s) {label} are being displayed '
                    f'in the UI below your message. Do NOT describe them — reply with one short sentence only.]'
                )
            else:
                prop_context = '\n\n[SYSTEM: No matching properties found. Let the user know politely.]'

        prompt = _build_system_prompt(request.user, live_data) + prop_context
        return history, prompt, prop_results, conv.id

    @sync_to_async
    def save_session(history, conv_id):
        from .models import ChatConversation, ChatMessage
        max_turns = getattr(settings, 'POE_MAX_HISTORY', 20)
        if len(history) > max_turns:
            history = history[-max_turns:]
        request.session['ai_chat_history'] = history
        request.session.modified = True
        # Persist the latest user+bot pair to DB
        try:
            if conv_id and len(history) >= 2:
                conv = ChatConversation.objects.get(id=conv_id)
                ChatMessage.objects.create(
                    conversation=conv, role='user', content=history[-2]['content']
                )
                ChatMessage.objects.create(
                    conversation=conv, role='bot', content=history[-1]['content']
                )
                conv.save()  # refresh updated_at
        except Exception as exc:
            _chatbot_logger.error("Failed to persist chat messages: %s", exc)

    if clear_history:
        await get_context()
        return JsonResponse({'reply': '', 'cleared': True, 'history_length': 0})

    api_key = getattr(settings, 'ANTHROPIC_API_KEY', '')
    model = getattr(settings, 'CLAUDE_MODEL', 'claude-haiku-4-5-20251001')

    if not api_key:
        return JsonResponse(
            {'error': 'AI service is not configured. Please contact the administrator.'},
            status=503
        )

    history, system_prompt, prop_results, conv_id = await get_context()

    messages_payload = [{"role": "system", "content": system_prompt}]
    messages_payload.extend(history)
    messages_payload.append({"role": "user", "content": user_message})

    # Run sync Claude client in a thread pool (thread_sensitive=False so it
    # gets its own thread, avoiding conflicts with Django's ORM thread-local state)
    call_claude_async = sync_to_async(_call_claude, thread_sensitive=False)

    try:
        ai_reply = await call_claude_async(messages_payload, api_key, model)
    except Exception as exc:
        _chatbot_logger.error("Claude API error: %s", exc)
        return JsonResponse(
            {'error': 'The AI assistant is temporarily unavailable. Please try again later.'},
            status=502
        )

    history.append({"role": "user", "content": user_message})
    history.append({"role": "bot", "content": ai_reply})
    await save_session(history, conv_id)

    return JsonResponse({
        'reply': ai_reply,
        'properties': prop_results,
        'conversation_id': conv_id,
        'history_length': len(history) // 2,
    })


@csrf_exempt
async def chatbot_history(request):
    """GET /chatbot/history/ — list past conversations for this user/session."""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    @sync_to_async
    def get_conversations():
        from .models import ChatConversation
        if request.user.is_authenticated:
            qs = ChatConversation.objects.filter(user=request.user)[:30]
        else:
            sk = request.session.session_key
            if not sk:
                return []
            qs = ChatConversation.objects.filter(session_key=sk)[:30]
        return [
            {
                'id': c.id,
                'title': c.title,
                'date': c.updated_at.strftime('%b %d, %Y'),
                'time': c.updated_at.strftime('%H:%M'),
                'message_count': c.chat_messages.count(),
            }
            for c in qs
        ]

    conversations = await get_conversations()
    return JsonResponse({'conversations': conversations})


@csrf_exempt
async def chatbot_history_detail(request, conv_id):
    """GET /chatbot/history/<id>/ — load all messages for a conversation."""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    @sync_to_async
    def get_messages():
        from .models import ChatConversation
        try:
            conv = ChatConversation.objects.get(id=conv_id)
        except ChatConversation.DoesNotExist:
            return None, None
        # Security: only the owner can view
        if request.user.is_authenticated:
            if conv.user_id and conv.user_id != request.user.id:
                return None, None
        else:
            if conv.session_key != request.session.session_key:
                return None, None
        msgs = conv.chat_messages.all()
        return conv.title, [
            {'role': m.role, 'content': m.content, 'time': m.created_at.strftime('%H:%M')}
            for m in msgs
        ]

    title, messages = await get_messages()
    if messages is None:
        return JsonResponse({'error': 'Conversation not found'}, status=404)
    return JsonResponse({'title': title, 'messages': messages, 'conversation_id': conv_id})


# ─── System Logs (Admin) ───────────────────────────────────────────────────────

@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='../')
def system_logs_view(request):
    """
    Admin-only view — displays SystemLog entries with filtering,
    search, pagination, and live stat cards.
    """
    from .models import SystemLog
    from django.db.models import Count
    from django.utils import timezone
    from datetime import timedelta

    qs = SystemLog.objects.select_related('user').all()

    # ── Filters ───────────────────────────────────────────────────────────────
    level_filter    = request.GET.get('level', '')
    category_filter = request.GET.get('category', '')
    search_query    = request.GET.get('q', '').strip()
    date_range      = request.GET.get('range', '7')  # days

    if level_filter:
        qs = qs.filter(level=level_filter)
    if category_filter:
        qs = qs.filter(category=category_filter)
    if search_query:
        qs = qs.filter(
            Q(message__icontains=search_query) |
            Q(user__username__icontains=search_query) |
            Q(path__icontains=search_query)
        )
    try:
        days = int(date_range)
    except ValueError:
        days = 7
    if days > 0:
        since = timezone.now() - timedelta(days=days)
        qs = qs.filter(timestamp__gte=since)

    # ── Stats ─────────────────────────────────────────────────────────────────
    total_logs     = qs.count()
    error_count    = qs.filter(level__in=['ERROR', 'CRITICAL']).count()
    warning_count  = qs.filter(level='WARNING').count()
    info_count     = qs.filter(level='INFO').count()

    level_breakdown = (
        qs.values('level')
          .annotate(cnt=Count('id'))
          .order_by('-cnt')
    )
    category_breakdown = (
        qs.values('category')
          .annotate(cnt=Count('id'))
          .order_by('-cnt')[:8]
    )

    # ── Pagination ────────────────────────────────────────────────────────────
    from django.core.paginator import Paginator
    paginator   = Paginator(qs, 50)
    page_number = request.GET.get('page', 1)
    page_obj    = paginator.get_page(page_number)

    context = {
        'page_obj':           page_obj,
        'total_logs':         total_logs,
        'error_count':        error_count,
        'warning_count':      warning_count,
        'info_count':         info_count,
        'level_breakdown':    level_breakdown,
        'category_breakdown': category_breakdown,
        # filter state for template
        'level_filter':       level_filter,
        'category_filter':    category_filter,
        'search_query':       search_query,
        'date_range':         str(days),
        # choices for dropdowns
        'log_levels':         SystemLog.LOG_LEVELS,
        'log_categories':     SystemLog.LOG_CATEGORIES,
    }
    return render(request, 'admin/system_logs/system_logs.html', context)


@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='../')
def system_logs_clear(request):
    """POST — clear all system logs (admin only)."""
    if request.method == 'POST':
        from .models import SystemLog
        from .log_service import syslog
        count = SystemLog.objects.count()
        SystemLog.objects.all().delete()
        syslog('SYSTEM', f"Admin cleared {count} system log entries",
               level='WARNING', user=request.user)
        messages_fw = __import__('django.contrib.messages', fromlist=['success'])
        from django.contrib import messages as dj_messages
        dj_messages.success(request, f"Cleared {count} log entries.")
    return redirect('system_logs')

# ── Announcements Admin ────────────────────────────────────────────────────────

@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='../')
def announcements_admin(request):
    announcements = Announcement.objects.all()
    return render(request, 'admin/announcements/announcements.html', {
        'announcements': announcements,
    })


@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='../')
def announcement_create(request):
    if request.method == 'POST':
        text    = request.POST.get('text', '').strip()
        icon    = request.POST.get('icon', 'campaign')
        order   = request.POST.get('order', 0)
        active  = request.POST.get('is_active') == 'on'
        if text:
            Announcement.objects.create(text=text, icon=icon, order=order, is_active=active)
            from django.contrib import messages as dj_messages
            dj_messages.success(request, 'Announcement added.')
    return redirect('announcements_admin')


@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='../')
def announcement_edit(request, pk):
    ann = get_object_or_404(Announcement, pk=pk)
    if request.method == 'POST':
        ann.text      = request.POST.get('text', ann.text).strip()
        ann.icon      = request.POST.get('icon', ann.icon)
        ann.order     = request.POST.get('order', ann.order)
        ann.is_active = request.POST.get('is_active') == 'on'
        ann.save()
        from django.contrib import messages as dj_messages
        dj_messages.success(request, 'Announcement updated.')
    return redirect('announcements_admin')


@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='../')
def announcement_delete(request, pk):
    ann = get_object_or_404(Announcement, pk=pk)
    ann.delete()
    from django.contrib import messages as dj_messages
    dj_messages.success(request, 'Announcement deleted.')
    return redirect('announcements_admin')


@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='../')
def announcement_toggle(request, pk):
    ann = get_object_or_404(Announcement, pk=pk)
    ann.is_active = not ann.is_active
    ann.save()
    return redirect('announcements_admin')


# ═══════════════════════════════════════════════════════════════════
# REPORTS
# ═══════════════════════════════════════════════════════════════════

@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='../')
def admin_reports(request):
    from django.db.models import Count, Avg
    from django.db.models.functions import TruncMonth
    from datetime import date

    today = date.today()

    # ── Financial ──────────────────────────────────────────────────
    total_revenue = Payment.objects.aggregate(t=Sum('amount'))['t'] or 0
    monthly_payments = (
        Payment.objects.annotate(month=TruncMonth('date_paid'))
        .values('month')
        .annotate(total=Sum('amount'), count=Count('id'))
        .order_by('month')
    )
    revenue_labels = [p['month'].strftime('%b %Y') for p in monthly_payments]
    revenue_data   = [float(p['total']) for p in monthly_payments]

    # top 5 revenue properties
    top_properties = (
        Payment.objects.values('property__name')
        .annotate(total=Sum('amount'))
        .order_by('-total')[:5]
    )

    # ── Properties ─────────────────────────────────────────────────
    total_properties  = Property.objects.count()
    avail_properties  = Property.objects.filter(status='Available').count()
    rented_properties = Property.objects.filter(status='Rented').count()
    prop_by_type = (
        Property.objects.values('types')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    prop_type_labels = [p['types'] for p in prop_by_type]
    prop_type_data   = [p['count'] for p in prop_by_type]

    # ── Tenants & Leases ───────────────────────────────────────────
    total_tenants   = Tenant.objects.count()
    total_leases    = Lease.objects.count()
    active_leases   = Lease.objects.filter(end_date__gte=today).count()
    expiring_soon   = Lease.objects.filter(
        end_date__gte=today,
        end_date__lte=today + timezone.timedelta(days=30)
    ).count()

    # ── Maintenance ────────────────────────────────────────────────
    maint_open        = MaintenanceRequest.objects.filter(status='open').count()
    maint_in_progress = MaintenanceRequest.objects.filter(status='in_progress').count()
    maint_completed   = MaintenanceRequest.objects.filter(status='completed').count()
    maint_total       = maint_open + maint_in_progress + maint_completed

    # ── Marketplace ────────────────────────────────────────────────
    sale_listed    = SaleProperty.objects.filter(status='listed').count()
    sale_sold      = SaleProperty.objects.filter(status='sold').count()
    sale_pending   = SaleProperty.objects.filter(status='pending').count()
    offers_pending = Offer.objects.filter(status='pending').count()
    offers_accepted= Offer.objects.filter(status='accepted').count()
    offers_rejected= Offer.objects.filter(status='rejected').count()

    # ── User Growth ────────────────────────────────────────────────
    user_growth = (
        User.objects.annotate(month=TruncMonth('date_joined'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )
    user_labels = [u['month'].strftime('%b %Y') for u in user_growth]
    user_data   = [u['count'] for u in user_growth]

    # ── Enquiries & Messages ───────────────────────────────────────
    total_enquiries = CustRequest.objects.count()
    unread_enquiries = CustRequest.objects.filter(is_read=False).count()
    total_messages  = CustomerMessage.objects.count()

    # ── Visits ─────────────────────────────────────────────────────
    total_visits = Visit.objects.count()

    context = {
        'total_revenue': total_revenue,
        'revenue_labels': json.dumps(revenue_labels),
        'revenue_data': json.dumps(revenue_data),
        'top_properties': top_properties,
        'monthly_payments': monthly_payments,

        'total_properties': total_properties,
        'avail_properties': avail_properties,
        'rented_properties': rented_properties,
        'prop_type_labels': json.dumps(prop_type_labels),
        'prop_type_data': json.dumps(prop_type_data),

        'total_tenants': total_tenants,
        'total_leases': total_leases,
        'active_leases': active_leases,
        'expiring_soon': expiring_soon,

        'maint_open': maint_open,
        'maint_in_progress': maint_in_progress,
        'maint_completed': maint_completed,
        'maint_total': maint_total,

        'sale_listed': sale_listed,
        'sale_sold': sale_sold,
        'sale_pending': sale_pending,
        'offers_pending': offers_pending,
        'offers_accepted': offers_accepted,
        'offers_rejected': offers_rejected,

        'user_labels': json.dumps(user_labels),
        'user_data': json.dumps(user_data),

        'total_enquiries': total_enquiries,
        'unread_enquiries': unread_enquiries,
        'total_messages': total_messages,
        'total_visits': total_visits,

        'today': today,
    }
    return render(request, 'admin/reports/reports.html', context)


@login_required(login_url='user_login')
@user_passes_test(is_admin, login_url='../')
def admin_reports_export(request, report_type):
    """Export report data as CSV."""
    import csv
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{report_type}_report.csv"'
    writer = csv.writer(response)

    if report_type == 'payments':
        writer.writerow(['Date', 'Property', 'Tenant', 'Amount (Frw)'])
        for p in Payment.objects.select_related('property', 'tenant').order_by('-date_paid'):
            writer.writerow([
                p.date_paid.strftime('%Y-%m-%d') if p.date_paid else '',
                p.property.name if p.property else '',
                p.tenant.name if p.tenant else '',
                p.amount,
            ])

    elif report_type == 'properties':
        writer.writerow(['ID', 'Name', 'Address', 'Type', 'Status', 'Price (Frw)', 'Units', 'Date Added'])
        for p in Property.objects.all().order_by('name'):
            writer.writerow([p.id, p.name, p.address, p.get_types_display(), p.status, p.price, p.number_of_units, p.date_added.strftime('%Y-%m-%d')])

    elif report_type == 'tenants':
        writer.writerow(['ID', 'Name', 'Email', 'Phone', 'Active Leases'])
        for t in Tenant.objects.all().order_by('name'):
            active = Lease.objects.filter(tenant=t, end_date__gte=timezone.now().date()).count()
            writer.writerow([t.id, t.name, t.email, t.phone_number, active])

    elif report_type == 'maintenance':
        writer.writerow(['ID', 'Property', 'Tenant', 'Title', 'Status', 'Date Requested', 'Completion Date'])
        for m in MaintenanceRequest.objects.select_related('property', 'tenant').order_by('-request_date'):
            writer.writerow([
                m.id, m.property.name if m.property else '', m.tenant.name if m.tenant else '',
                m.title, m.status,
                m.request_date.strftime('%Y-%m-%d') if m.request_date else '',
                m.completion_date.strftime('%Y-%m-%d') if m.completion_date else '',
            ])

    elif report_type == 'leases':
        writer.writerow(['ID', 'Property', 'Tenant', 'Start Date', 'End Date', 'Rent (Frw)', 'Status'])
        for l in Lease.objects.select_related('property', 'tenant').order_by('-start_date'):
            status = 'Active' if l.end_date and l.end_date >= timezone.now().date() else 'Expired'
            writer.writerow([
                l.id, l.property.name if l.property else '', l.tenant.name if l.tenant else '',
                l.start_date, l.end_date, l.rent_amount, status,
            ])

    else:
        writer.writerow(['No data for this report type.'])

    return response


# ── FB-style Chat API ──────────────────────────────────────────────────────────

@login_required
def chat_contacts_api(request):
    """JSON: list of recent conversations with unread counts."""
    from django.http import JsonResponse
    from django.db.models import Q
    convos = _get_conversations(request.user)
    data = []
    for c in convos:
        contact = c['contact']
        lm = c['last_message']
        data.append({
            'user_id':      contact.id,
            'name':         contact.get_full_name() or contact.username,
            'initial':      contact.username[0].upper(),
            'role':         contact.role,
            'room_id':      f"{min(request.user.id, contact.id)}_{max(request.user.id, contact.id)}",
            'last_message': lm.content[:60] if lm else '',
            'last_time':    lm.sent_date.strftime('%H:%M') if lm else '',
            'unread':       c['unread'],
        })
    total_unread = sum(c['unread'] for c in convos)
    return JsonResponse({'contacts': data, 'total_unread': total_unread})


@login_required
def chat_history_api(request, contact_id):
    """JSON: message history between current user and contact; marks messages read.
    Optional ?since_id=N returns only messages with id > N (for polling).
    """
    from django.http import JsonResponse
    from django.db.models import Q
    contact = get_object_or_404(User, id=contact_id)
    qs = Message.objects.filter(
        Q(sender=request.user, recipient=contact) |
        Q(sender=contact,       recipient=request.user)
    ).order_by('sent_date')
    since_id = request.GET.get('since_id')
    if since_id:
        try:
            qs = qs.filter(id__gt=int(since_id))
        except (ValueError, TypeError):
            pass
    else:
        # mark as read only on full history load
        qs.filter(recipient=request.user, is_read=False).update(is_read=True)
    msgs = list(qs[:80])
    data = [{
        'id':        m.id,
        'sender_id': m.sender_id,
        'content':   m.content,
        'time':      m.sent_date.strftime('%H:%M'),
        'date':      m.sent_date.strftime('%b %d'),
    } for m in msgs]
    return JsonResponse({
        'messages': data,
        'me_id':    request.user.id,
        'contact':  {
            'id':      contact.id,
            'name':    contact.get_full_name() or contact.username,
            'initial': contact.username[0].upper() if contact.username else '?',
            'role':    contact.role,
        },
    })


@login_required
def chat_send_api(request):
    """POST: send a message, return saved message JSON."""
    from django.http import JsonResponse
    import json
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        body    = json.loads(request.body)
        to_id   = int(body.get('to_id', 0))
        content = body.get('content', '').strip()
    except Exception:
        return JsonResponse({'error': 'Bad request'}, status=400)
    if not content or not to_id:
        return JsonResponse({'error': 'Missing fields'}, status=400)
    recipient = get_object_or_404(User, id=to_id)
    msg = Message.objects.create(sender=request.user, recipient=recipient, content=content)
    return JsonResponse({
        'ok':      True,
        'id':      msg.id,
        'content': msg.content,
        'time':    msg.sent_date.strftime('%H:%M'),
    })


def chat_new_users_api(request):
    """JSON: list of all users the current user can start a new chat with."""
    from django.http import JsonResponse
    if not request.user.is_authenticated:
        return JsonResponse({'users': []}, status=200)
    try:
        q = request.GET.get('q', '').strip()
        qs = User.objects.exclude(id=request.user.id).order_by('username')
        if q:
            qs = qs.filter(
                Q(username__icontains=q) | Q(first_name__icontains=q) | Q(last_name__icontains=q)
            )
        data = []
        for u in qs[:40]:
            uname = u.username or ''
            data.append({
                'user_id': u.id,
                'name':    u.get_full_name() or uname,
                'initial': uname[0].upper() if uname else '?',
                'role':    u.role if hasattr(u, 'role') and u.role else 'User',
            })
        return JsonResponse({'users': data})
    except Exception as e:
        return JsonResponse({'users': [], 'error': str(e)}, status=200)
