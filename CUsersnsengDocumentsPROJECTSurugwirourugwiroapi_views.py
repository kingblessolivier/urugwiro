
@api_view(['GET', 'POST'])
def manage_system_settings(request):
    """
    Retrieve or update system-wide settings (e.g., API keys).
    Restricted to Admin users.
    """
    if not request.user.is_staff:
        return Response({'error': 'Admin privileges required'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        settings = SystemSetting.objects.all()
        serializer = SystemSettingSerializer(settings, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        key = request.data.get('key')
        value = request.data.get('value')
        description = request.data.get('description', '')

        if not key or not value:
            return Response({'error': 'Both key and value are required'}, status=status.HTTP_400_BAD_REQUEST)

        setting, created = SystemSetting.objects.update_or_create(
            key=key,
            defaults={'value': value, 'description': description}
        )
        serializer = SystemSettingSerializer(setting)
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

from django.contrib.auth import authenticate, login, logout
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
def api_login(request):
    """
    User login endpoint. Returns JWT tokens.
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'username': user.username,
                'role': user.role
            }
        }, status=status.HTTP_200_OK)
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def api_register(request):
    """
    User registration endpoint.
    """
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'Buyer')

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role=role
    )
    
    return Response({'status': 'User registered successfully', 'user_id': user.id}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def api_logout(request):
    """
    Logout endpoint. For JWT, the client should just discard the token.
    """
    return Response({'status': 'Logged out successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def api_about(request):
    """
    Retrieve 'About Us' content.
    """
    content = {
        "title": "About Urugwiro",
        "description": "Urugwiro is transforming the real estate experience in Rwanda, moving from classifieds to a professional digital showroom.",
        "mission": "To establish a high-trust, immersive property discovery ecosystem powered by AI and spatial intelligence.",
        "values": ["Trust", "Innovation", "Transparency", "Professionalism"]
    }
    return Response(content)

@api_view(['POST'])
def api_contact_submit(request):
    """
    Submit a contact form inquiry.
    """
    name = request.data.get('name')
    email = request.data.get('email')
    message = request.data.get('message')

    if not name or not email or not message:
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

    CustomerMessage.objects.create(name=name, email=email, message=message)
    return Response({'status': 'Message sent successfully'}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def api_public_updates(request):
    """
    Retrieve currently active system updates.
    """
    updates = Updates.objects.filter(end_date__gte=now()).order_by('-created_at')
    # Simple serializer since it's just for the public page
    data = [{
        'id': u.id,
        'title': u.title,
        'description': u.description,
        'end_date': u.end_date
    } for u in updates]
    return Response(data)
