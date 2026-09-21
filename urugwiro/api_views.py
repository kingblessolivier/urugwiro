from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.db.models import Q
import requests
from .models import (
    Listing, LikedProperties, VerificationDocument,
    VerificationReview, ListingAuditLog, Article, ArticleCategory, SystemSetting
)
from .serializers import (
    ListingSerializer, VerificationDocumentSerializer,
    VerificationReviewSerializer, ListingAuditLogSerializer,
    ArticleSerializer, ArticleCategorySerializer, SystemSettingSerializer
)
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, get_user_model, login, logout
from .services import ValuationService

class ListingListView(generics.ListAPIView):
    serializer_class = ListingSerializer

    def get_queryset(self):
        queryset = Listing.objects.filter(status='listed').select_related('asset')

        search = self.request.query_params.get('search')
        listing_type = self.request.query_params.get('type')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        province = self.request.query_params.get('province')
        district = self.request.query_params.get('district')
        sector = self.request.query_params.get('sector')
        sort = self.request.query_params.get('sort', 'newest')

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(asset__name__icontains=search)
            )

        if listing_type and listing_type != 'All':
            queryset = queryset.filter(listing_type=listing_type)

        if province:
            queryset = queryset.filter(asset__province__icontains=province)
        if district:
            queryset = queryset.filter(asset__district__icontains=district)
        if sector:
            queryset = queryset.filter(asset__sector__icontains=sector)

        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        if sort == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort == 'price_desc':
            queryset = queryset.order_by('-price')
        else:
            queryset = queryset.order_by('-date_listed')

        return queryset

class ListingDetailView(generics.RetrieveAPIView):
    serializer_class = ListingSerializer

    def get_object(self):
        slug = self.kwargs.get('slug')
        pk = self.kwargs.get('pk')
        if slug:
            return get_object_or_404(Listing, slug=slug)
        return get_object_or_404(Listing, pk=pk)

@api_view(['POST'])
def toggle_like(request, pk):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    listing = get_object_or_404(Listing, pk=pk)
    liked, created = LikedProperties.objects.get_or_create(user=request.user, listing=listing)
    if not created:
        liked.delete()
        return Response({'status': 'unliked', 'liked': False})

    return Response({'status': 'liked', 'liked': True})

@api_view(['GET'])
def list_verification_requests(request):
    """
    Retrieve all listings that have submitted documents and are awaiting review.
    """
    if not request.user.is_staff:
        return Response({'error': 'Admin privileges required'}, status=status.HTTP_403_FORBIDDEN)

    listings = Listing.objects.filter(verification_level='submitted').select_related('owner')

    data = []
    for l in listings:
        data.append({
            'id': l.id,
            'listing_title': l.title,
            'seller_name': l.owner.name,
            'submitted_at': l.date_updated.strftime('%Y-%m-%d %H:%M'),
            'status': 'pending',
            'verification_level': l.verification_level,
        })

    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_verification_request_detail(request, pk):
    """
    Retrieve full details for a listing awaiting verification.
    """
    if not request.user.is_staff:
        return Response({'error': 'Admin privileges required'}, status=status.HTTP_403_FORBIDDEN)

    listing = get_object_or_404(Listing, pk=pk)

    listing_details = {}
    if hasattr(listing, 'sale_data'):
        sd = listing.sale_data
        listing_details.update({
            'price': sd.price if hasattr(sd, 'price') else listing.price,
            'size': sd.size_sqm,
            'bedrooms': sd.bedrooms,
            'bathrooms': sd.bathrooms,
            'year_built': sd.year_built,
        })
    elif hasattr(listing, 'land_data'):
        ld = listing.land_data
        listing_details.update({
            'plot_size': ld.plot_size,
            'terrain': ld.terrain,
            'road_access': ld.road_access,
        })

    docs = VerificationDocument.objects.filter(listing=listing)
    document_list = []
    for d in docs:
        document_list.append({
            'id': d.id,
            'name': d.document_type,
            'url': d.file.url,
            'type': d.document_type,
        })

    return Response({
        'id': listing.id,
        'listing_title': listing.title,
        'seller_name': listing.owner.name,
        'listing_details': listing_details,
        'documents': document_list,
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def submit_verification_docs(request, pk):
    """Upload verification documents for a listing."""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    listing = get_object_or_404(Listing, pk=pk)

    if listing.owner.user != request.user:
        return Response({'error': 'You can only upload documents for your own listings'}, status=status.HTTP_403_FORBIDDEN)

    files = request.FILES.getlist('files')
    doc_types = request.data.getlist('doc_types')

    if not files:
        return Response({'error': 'No files provided'}, status=status.HTTP_400_BAD_REQUEST)

    docs = []
    for i in range(len(files)):
        doc = VerificationDocument.objects.create(
            listing=listing,
            file=files[i],
            document_type=doc_types[i] if i < len(doc_types) else 'General Proof'
        )
        docs.append(VerificationDocumentSerializer(doc).data)

    listing.verification_level = 'submitted'
    listing.save()

    return Response({'status': 'Documents submitted for review', 'documents': docs}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def admin_review_document(request, doc_id):
    """Admin reviews a verification document."""
    if not request.user.is_staff:
        return Response({'error': 'Admin privileges required'}, status=status.HTTP_403_FORBIDDEN)

    doc = get_object_or_404(VerificationDocument, pk=doc_id)
    status_val = request.data.get('status')
    notes = request.data.get('notes', '')

    if status_val not in ['approved', 'rejected']:
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    review = VerificationReview.objects.create(
        document=doc,
        reviewer=request.user,
        status=status_val,
        notes=notes
    )

    return Response(VerificationReviewSerializer(review).data, status=status.HTTP_200_OK)

@api_view(['GET'])
def listing_audit_log(request, pk):
    """Retrieve the audit trail for a specific listing."""
    listing = get_object_or_404(Listing, pk=pk)
    logs = ListingAuditLog.objects.filter(listing=listing)
    serializer = ListingAuditLogSerializer(logs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_land_articles(request):
    """Retrieve all published educational articles for the Land Information Center."""
    articles = Article.objects.filter(is_published=True)
    serializer = ArticleSerializer(articles, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_article_categories(request):
    """Retrieve categories for land information."""
    categories = ArticleCategory.objects.all()
    serializer = ArticleCategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_article_detail(request, slug):
    """Retrieve a single article by slug."""
    article = get_object_or_404(Article, slug=slug, is_published=True)
    serializer = ArticleSerializer(article)
    return Response(serializer.data)

@api_view(['GET', 'POST', 'PATCH'])
def manage_system_settings(request):
    """List and manage system settings for staff users."""
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({'error': 'Staff authentication required'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        settings = SystemSetting.objects.all().order_by('key')
        return Response(SystemSettingSerializer(settings, many=True).data)

    key = request.data.get('key')
    if not key:
        return Response({'error': 'Setting key is required'}, status=status.HTTP_400_BAD_REQUEST)

    setting = get_object_or_404(SystemSetting, key=key) if request.method == 'PATCH' else None
    if setting is None:
        setting = SystemSetting.objects.filter(key=key).first()

    serializer = SystemSettingSerializer(setting, data=request.data, partial=True) if setting else SystemSettingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK if setting else status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework_simplejwt.tokens import RefreshToken

# ... (keep existing imports)

@api_view(['POST'])
def api_login(request):
    username = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')
    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    })

@api_view(['POST'])
def api_register(request):
    User = get_user_model()
    username = request.data.get('username') or request.data.get('email')
    email = request.data.get('email', '')
    password = request.data.get('password')
    role = request.data.get('role', 'Buyer')

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_409_CONFLICT)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.role = role
    user.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def api_logout(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully'})
    except Exception:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def generate_ai_narrative(request):
    """
    Generates a luxury property narrative using NVIDIA AI.
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    data = request.data
    title = data.get('title', 'Property')
    prop_type = data.get('propertyType', 'Residential')
    city = data.get('city', 'Kigali')
    price = data.get('price', 'competitive')

    try:
        setting = SystemSetting.objects.get(key='NVIDIA_AI_API_KEY')
        api_key = setting.value
    except SystemSetting.DoesNotExist:
        api_key = None

    if api_key:
        try:
            response = requests.post(
                'https://integrate.api.nvidia.com/v1/chat/completions',
                headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
                json={
                    'model': 'meta/llama-3.1-405b-instruct',
                    'messages': [{
                        'role': 'system',
                        'content': 'You are a luxury real estate copywriter for Urugwiro. Create an immersive, high-end narrative for a property.'
                    }, {
                        'role': 'user',
                        'content': f'Write a luxury description for a {prop_type} in {city} called "{title}" priced at {price}. Focus on sophistication, elegance, and exclusivity.'
                    }]
                },
                timeout=10
            )
            if response.status_code == 200:
                narrative = response.json()['choices'][0]['message']['content']
                return Response({'narrative': narrative}, status=status.HTTP_200_OK)
        except Exception:
            pass

    fallback_narrative = (
        f"Welcome to a sanctuary of sophistication. This exquisite {prop_type} in the heart of {city} "
        f"redefines the art of living. Named '{title}', this property is not just a residence, but a statement "
        f"of prestige and elegance. From its meticulously crafted interiors to its prime location, "
        f"every detail has been curated for those who demand nothing less than perfection. "
        f"Experience a seamless blend of contemporary luxury and timeless charm, offering an "
        f"unparalleled lifestyle in one of the region's most coveted addresses."
    )

    return Response({'narrative': fallback_narrative}, status=status.HTTP_200_OK)

@api_view(['POST'])
def valuation_estimate(request):
    """
    Provides a Fair Market Value (FMV) estimate for a property.
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        property_type = request.data.get('property_type')
        city = request.data.get('city')
        district = request.data.get('district')
        sector = request.data.get('sector')
        size = float(request.data.get('size', 0))

        if not all([property_type, city, size]) or size <= 0:
            return Response({'error': 'Missing required valuation parameters (type, city, size).'}, status=status.HTTP_400_BAD_REQUEST)

        result = ValuationService.get_valuation_estimate(
            property_type=property_type,
            city=city,
            district=district,
            sector=sector,
            size=size
        )

        if result:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Insufficient market data',
                'message': 'We could not find enough similar listings in your area to provide a reliable estimate.'
            }, status=status.HTTP_404_NOT_FOUND)

    except (ValueError, TypeError):
        return Response({'error': 'Invalid data types provided for valuation.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def lifestyle_intent_search(request):
    """
    Translates natural language intent into listing filters using NVIDIA AI.
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    intent = request.data.get('intent')
    if not intent:
        return Response({'error': 'No intent provided'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        setting = SystemSetting.objects.get(key='NVIDIA_AI_API_KEY')
        api_key = setting.value
    except SystemSetting.DoesNotExist:
        api_key = None

    if api_key:
        try:
            response = requests.post(
                'https://integrate.api.nvidia.com/v1/chat/completions',
                headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
                json={
                    'model': 'meta/llama-3.1-405b-instruct',
                    'messages': [{
                        'role': 'system',
                        'content': (
                            'You are a real estate intent parser for Urugwiro. Translate the user\'s natural language search intent '
                            'into a structured JSON filter object. Available filters: city, district, sector, propertyType, '
                            'listingType (Sale/Rent), min_price, max_price, and keywords (a list of strings for description search). '
                            'Return ONLY the JSON object.'
                        )
                    }, {
                        'role': 'user',
                        'content': f'Intent: {intent}'
                    }]
                },
                timeout=10
            )
            if response.status_code == 200:
                import json
                filters = json.loads(response.json()['choices'][0]['message']['content'])
                return Response({'filters': filters}, status=status.HTTP_200_OK)
        except Exception:
            pass

    return Response({'error': 'Could not translate intent into filters'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def visual_search(request):
    """
    Performs a visual search for similar properties based on an uploaded image.
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    image = request.FILES.get('image')
    if not image:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    detected_type = 'Residential'
    similar_listings = Listing.objects.filter(
        status='listed',
    ).filter(listing_type='sale')[:10]

    serializer = ListingSerializer(similar_listings, many=True)
    return Response({'listings': serializer.data}, status=status.HTTP_200_OK)

@api_view(['GET'])
def api_about(request):
    """
    Returns platform information for the About page.
    """
    return Response({
        'title': 'Urugwiro',
        'mission': 'Transforming real estate into a professional Property Discovery Experience.',
        'vision': 'To be the gold standard for high-trust property transactions in Rwanda.',
        'features': [
            'AI-Driven Valuation',
            '3D Digital Twins',
            'Verified Trust Engine',
            'Spatial GIS Intelligence'
        ],
        'contact_email': 'info@urugwiro.rw'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def api_contact_submit(request):
    """
    Handles contact form submissions.
    """
    name = request.data.get('name')
    email = request.data.get('email')
    message = request.data.get('message')

    if not all([name, email, message]):
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'status': 'Success', 'message': 'Your message has been sent. Our team will contact you shortly.'}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def api_public_updates(request):
    """
    Returns latest platform updates and announcements.
    """
    from .models import Updates
    updates = Updates.objects.all().order_by('-created_at')

    data = []
    for u in updates:
        data.append({
            'title': u.title,
            'description': u.description,
            'date': u.created_at.strftime('%Y-%m-%d'),
            'end_date': u.end_date.strftime('%Y-%m-%d')
        })

    return Response(data, status=status.HTTP_200_OK)
