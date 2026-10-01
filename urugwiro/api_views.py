import logging
from decimal import Decimal
from django.db.models import Q, Sum, Count, Avg
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
    FollowUp, Transaction, SellerPayment, CommissionRule, BusinessExpense, ListingProposal, SystemSetting, ArticleCategory, Article, Announcement, Asset,
)

# Import serializers
from .serializers import (
    ListingSerializer, ListingReviewSerializer, UserSerializer, SellerProfileSerializer, UpdatesSerializer,
    ArticleSerializer, ArticleCategorySerializer, VerificationDocumentSerializer, VerificationReviewSerializer,
    ListingAuditLogSerializer, ListingCreateSerializer, ListingMediaSerializer, OfferSerializer, VisitSerializer,
    PropertyInquirySerializer, CustomerSerializer, ConversationSerializer, FollowUpSerializer, VisitCreateSerializer,
    TransactionSerializer, SellerPaymentSerializer, CommissionRuleSerializer, BusinessExpenseSerializer,
    ListingProposalSerializer, SystemSettingSerializer, SavedPropertySerializer, ConversationEventSerializer,
    AdminUserCreateSerializer
)

# Services
from .services import ValuationService

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# ==========================================
# Permission Helpers
# ==========================================

def check_admin_permission(request):
    if not request.user or not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    if request.user.role not in ['admin', 'owner', 'finance']:
        if not request.user.is_superuser:
            return Response({'error': 'Admin permissions required'}, status=status.HTTP_403_FORBIDDEN)
    return None

def check_seller_permission(request):
    if not request.user or not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    if request.user.role not in ['seller', 'admin', 'owner', 'staff']:
        if not request.user.is_superuser:
            return Response({'error': 'Seller permissions required'}, status=status.HTTP_403_FORBIDDEN)
    return None

def get_seller_profile(request):
    if hasattr(request.user, 'seller_profile'):
        return request.user.seller_profile
    return None

def get_paginated_response(queryset, serializer_class, request, context=None):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(queryset, request)
    if page is not None:
        serializer = serializer_class(page, many=True, context=context)
        return paginator.get_paginated_response(serializer.data)
    serializer = serializer_class(queryset, many=True, context=context)
    return Response(serializer.data)

# ==========================================
# Public Endpoints
# ==========================================

class ListingListView(generics.ListAPIView):
    serializer_class = ListingSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Listing.objects.filter(status='published').select_related('asset', 'seller').prefetch_related('media')
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search))
            
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
            
        purpose = self.request.query_params.get('purpose', None)
        if purpose:
            queryset = queryset.filter(purpose=purpose)
            
        min_price = self.request.query_params.get('min_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
            
        max_price = self.request.query_params.get('max_price', None)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        district = self.request.query_params.get('district', None)
        if district:
            queryset = queryset.filter(asset__district__icontains=district)
            
        is_featured = self.request.query_params.get('is_featured', None)
        if is_featured and is_featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
            
        return queryset

class ListingDetailView(generics.RetrieveAPIView):
    queryset = Listing.objects.select_related('asset', 'seller').prefetch_related('media')
    serializer_class = ListingSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        pk = self.kwargs.get('pk')
        if str(pk).isdigit():
            obj = get_object_or_404(self.queryset, pk=pk)
        else:
            obj = get_object_or_404(self.queryset, slug=pk)
        
        # Increment views count
        obj.views_count += 1
        obj.save(update_fields=['views_count'])
        return obj

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request, pk):
    listing = get_object_or_404(Listing, pk=pk)
    saved_prop, created = SavedProperty.objects.get_or_create(user=request.user, listing=listing)
    
    if not created:
        saved_prop.delete()
        return Response({'status': 'unliked'}, status=status.HTTP_200_OK)
    return Response({'status': 'liked'}, status=status.HTTP_201_CREATED)

@api_view(['GET', 'POST'])
def listing_reviews(request, pk):
    listing = get_object_or_404(Listing, pk=pk)
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
    username = (request.data.get('username') or '').strip()
    email = (request.data.get('email') or '').strip()
    password = request.data.get('password')
    full_name = request.data.get('full_name') or ''
    role = request.data.get('role') or 'customer'
    
    if not username and email:
        username = email.split('@')[0]
        
    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
    if User.objects.filter(username__iexact=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if email and User.objects.filter(email__iexact=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role=role.lower()
    )
    if full_name:
        parts = full_name.split(' ', 1)
        user.first_name = parts[0]
        if len(parts) > 1:
            user.last_name = parts[1]
        user.save(update_fields=['first_name', 'last_name'])
        
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
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user_data = serializer.data
            return Response({
                'user': user_data,
                **user_data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_logout(request):
    logout(request)
    return Response({'message': 'Logged out'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_about(request):
    return Response({'about': 'Urugwiro is a real estate platform.'}, status=status.HTTP_200_OK)

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
        
        customer = None
        if request.user.is_authenticated:
            customer = getattr(request.user, 'customer_profile', None)
        if not customer and phone:
            customer = Customer.objects.filter(phone=phone).first()
        if not customer and email:
            customer = Customer.objects.filter(email=email).first()
        if not customer:
            customer = Customer.objects.create(
                user=request.user if request.user.is_authenticated else None,
                full_name=name,
                phone=phone or 'Unknown',
                email=email,
                source='website'
            )
        elif request.user.is_authenticated and not customer.user:
            customer.user = request.user
            customer.save()
            
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
        # update document status based on request
        if data.get('status') == 'approved':
            doc.is_verified = True
            doc.save()
            listing = doc.listing
            listing.verification_level = 'verified'
            listing.save()
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
    serializer = ListingCreateSerializer(data=data)
    if serializer.is_valid():
        listing = serializer.save(seller=profile)
        # Create a default slug
        listing.slug = slugify(f"{listing.title}-{listing.id}")
        listing.save()
        return Response(ListingSerializer(listing).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def seller_listing_detail_manage(request, pk):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    listing = get_object_or_404(Listing, pk=pk, seller=profile)
    
    if request.method == 'GET':
        return Response(ListingSerializer(listing).data)
    elif request.method == 'PUT':
        serializer = ListingCreateSerializer(listing, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(ListingSerializer(listing).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        listing.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def seller_listing_toggle_status(request, pk):
    err = check_seller_permission(request)
    if err: return err
    profile = get_seller_profile(request)
    listing = get_object_or_404(Listing, pk=pk, seller=profile)
    new_status = request.data.get('status')
    if new_status:
        listing.status = new_status
        listing.save()
        return Response(ListingSerializer(listing).data)
    return Response({'error': 'No status provided'}, status=status.HTTP_400_BAD_REQUEST)

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
        serializer.save()
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
    
    status_update = request.data.get('status')
    if status_update in ['accepted', 'declined']:
        offer.status = status_update
        offer.save()
        return Response(OfferSerializer(offer).data)
    return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

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
    phone = request.data.get('phone') or getattr(request.user, 'phone_number', '') or '0780000000'
    email = request.data.get('email') or (request.user.email if request.user.is_authenticated else '')
    
    customer = None
    if request.user.is_authenticated:
        customer = getattr(request.user, 'customer_profile', None)
    if not customer and phone:
        customer = Customer.objects.filter(phone=phone).first()
    if not customer and email:
        customer = Customer.objects.filter(email=email).first()
    if not customer:
        customer = Customer.objects.create(
            user=request.user if request.user.is_authenticated else None,
            full_name=name,
            phone=phone,
            email=email,
            source='website'
        )
    elif request.user.is_authenticated and not customer.user:
        customer.user = request.user
        customer.save()
        
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
    saved = SavedProperty.objects.filter(user=request.user).order_by('-saved_at')
    return get_paginated_response(saved, SavedPropertySerializer, request)

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
        phone = request.data.get('phone') or getattr(request.user, 'phone_number', '') or '0780000000'
        email = request.data.get('email') or (request.user.email if request.user.is_authenticated else '')
        
        customer = None
        if request.user.is_authenticated:
            customer = getattr(request.user, 'customer_profile', None)
        if not customer and phone:
            customer = Customer.objects.filter(phone=phone).first()
        if not customer and email:
            customer = Customer.objects.filter(email=email).first()
        if not customer:
            customer = Customer.objects.create(
                user=request.user if request.user.is_authenticated else None,
                full_name=name,
                phone=phone,
                email=email,
                source='website'
            )
        elif request.user.is_authenticated and not customer.user:
            customer.user = request.user
            customer.save()
            
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
        serializer = ListingCreateSerializer(data=request.data)
        if serializer.is_valid():
            seller_id = request.data.get('seller_id')
            seller = get_object_or_404(SellerProfile, pk=seller_id) if seller_id else SellerProfile.objects.first()
            if not seller:
                return Response({'error': 'Create a seller profile before adding a property.'}, status=status.HTTP_400_BAD_REQUEST)
            # Create a default slug
            listing = serializer.save(seller=seller)
            listing.slug = slugify(f"{listing.title}-{listing.id}")
            listing.save()
            return Response(ListingSerializer(listing).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def admin_property_detail_manage(request, pk):
    err = check_admin_permission(request)
    if err: return err
    listing = get_object_or_404(Listing, pk=pk)
    
    if request.method == 'GET':
        return Response(ListingSerializer(listing).data)
    elif request.method in ['PUT', 'PATCH']:
        serializer = ListingCreateSerializer(listing, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(ListingSerializer(listing).data)
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
        serializer.save()
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
    err = check_admin_permission(request)
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
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def admin_user_detail_update_delete(request, pk):
    err = check_admin_permission(request)
    if err: return err
    user = get_object_or_404(User, pk=pk)
    
    if request.method == 'GET':
        return Response(UserSerializer(user).data)
    elif request.method in ['PUT', 'PATCH']:
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def admin_user_set_role(request, pk):
    err = check_admin_permission(request)
    if err: return err
    user = get_object_or_404(User, pk=pk)
    role = request.data.get('role')
    if role:
        user.role = role
        user.save()
        return Response(UserSerializer(user).data)
    return Response({'error': 'Role required'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def admin_user_toggle_status(request, pk):
    err = check_admin_permission(request)
    if err: return err
    user = get_object_or_404(User, pk=pk)
    user.is_active = not user.is_active
    user.save()
    return Response(UserSerializer(user).data)

@api_view(['POST'])
def admin_user_reset_password(request, pk):
    err = check_admin_permission(request)
    if err: return err
    user = get_object_or_404(User, pk=pk)
    new_password = request.data.get('password') or request.data.get('new_password')
    if new_password:
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successful'})
    return Response({'error': 'Password required'}, status=status.HTTP_400_BAD_REQUEST)

# ==========================================
# Admin Financial
# ==========================================

@api_view(['GET', 'POST'])
def admin_transactions_list(request):
    err = check_admin_permission(request)
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
    err = check_admin_permission(request)
    if err: return err
    transaction = get_object_or_404(Transaction, pk=pk)
    
    if request.method == 'GET':
        return Response(TransactionSerializer(transaction).data)
    elif request.method == 'PUT':
        serializer = TransactionSerializer(transaction, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def admin_seller_payments_list(request):
    err = check_admin_permission(request)
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
    err = check_admin_permission(request)
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
    err = check_admin_permission(request)
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
    err = check_admin_permission(request)
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
    err = check_admin_permission(request)
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
    err = check_admin_permission(request)
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
def api_proposals_view(request):
    err = check_admin_permission(request)
    if err: return err
    if request.method == 'GET':
        proposals = ListingProposal.objects.all().order_by('-created_at')
        return get_paginated_response(proposals, ListingProposalSerializer, request)
    elif request.method == 'POST':
        serializer = ListingProposalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
def api_proposal_detail_view(request, pk):
    err = check_admin_permission(request)
    if err: return err
    proposal = get_object_or_404(ListingProposal, pk=pk)
    
    if request.method == 'GET':
        return Response(ListingProposalSerializer(proposal).data)
    elif request.method == 'PUT':
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
    
    if proposal.status == 'converted':
        return Response({'error': 'Already converted'}, status=status.HTTP_400_BAD_REQUEST)
        
    seller = get_object_or_404(SellerProfile, user=request.user)
    
    listing = Listing.objects.create(
        seller=seller,
        title=proposal.property_title,
        description=proposal.property_description,
        price=proposal.asking_price,
        category='house' if proposal.asset_type == 'BUILDING' else proposal.asset_type.lower(),
        purpose=proposal.purpose,
        address=proposal.address,
        status='draft'
    )
    listing.slug = slugify(f"{listing.title}-{listing.id}")
    listing.save()
    
    proposal.status = 'converted'
    proposal.save()
    
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
    err = check_admin_permission(request)
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
    err = check_admin_permission(request)
    if err: return err
    if request.method == 'GET':
        settings = SystemSetting.objects.all()
        return Response(SystemSettingSerializer(settings, many=True).data)
    elif request.method == 'POST':
        serializer = SystemSettingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ==========================================
# Valuation
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def valuation_estimate(request):
    property_type = request.data.get('property_type')
    size = request.data.get('size')
    location = request.data.get('location')
    
    if not property_type or not size:
        return Response({'error': 'Property type and size are required'}, status=status.HTTP_400_BAD_REQUEST)
        
    estimate = ValuationService.estimate_value(property_type, float(size), location)
    
    return Response({
        'estimate': estimate,
        'property_type': property_type,
        'size': size,
        'location': location
    })
