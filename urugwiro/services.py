import base64
import json
import mimetypes
import os
import re

import requests
from django.db.models import Avg, Min, Max
from .models import Listing


class ValuationService:
    """
    Provides data-driven Fair Market Value (FMV) estimates based on comparable listings.
    Uses the unified Listing + Asset model instead of legacy extensions.
    """

    @staticmethod
    def get_valuation_estimate(category, district, sector, size=None):
        """
        Calculate FMV range using a hierarchical fallback search (Sector -> District -> Province).
        """
        # Hierarchical search for comparables
        search_levels = []
        if sector:
            search_levels.append({'asset__sector__iexact': sector})
        if district:
            search_levels.append({'asset__district__iexact': district})

        for level in search_levels:
            qs = Listing.objects.filter(
                status='published',
                category=category,
                **level
            )

            if qs.exists():
                stats = qs.aggregate(
                    avg_price=Avg('price'),
                    min_price=Min('price'),
                    max_price=Max('price'),
                )

                avg = float(stats['avg_price'] or 0)
                return {
                    'estimated_value': round(avg),
                    'low_range': round(float(stats['min_price'] or avg * 0.85)),
                    'high_range': round(float(stats['max_price'] or avg * 1.15)),
                    'comparables_count': qs.count(),
                    'search_level': list(level.keys())[0].split('__')[1] if level else 'global',
                    'confidence': 'high' if qs.count() >= 5 else 'medium' if qs.count() >= 2 else 'low',
                }

        return {
            'estimated_value': 0,
            'low_range': 0,
            'high_range': 0,
            'comparables_count': 0,
            'search_level': 'none',
            'confidence': 'insufficient_data',
        }


def _ai_setting(key, default=''):
    from .models import SystemSetting
    value = os.getenv(key, '')
    if value:
        return value
    setting = SystemSetting.objects.filter(key__iexact=key).first()
    return setting.value if setting else default


def _fallback_narrative(data):
    category = str(data.get('category') or 'property').replace('_', ' ').title()
    location = ', '.join(filter(None, [data.get('district'), data.get('city')])) or 'Rwanda'
    title = data.get('title') or f'{category} opportunity in {location}'
    description = data.get('description') or (
        f'Discover this {category.lower()} in {location}. '
        f'It is offered at {data.get("price") or "a competitive price"} and is ready for a detailed viewing. '
        'Contact Urugwiro to confirm availability, documentation, and next steps.'
    )
    return {'title': title, 'narrative': description, 'provider': 'fallback'}


def generate_listing_narrative(data):
    fallback = _fallback_narrative(data)
    api_key = _ai_setting('NVIDIA_AI_API_KEY') or _ai_setting('NVIDIA_API_KEY')
    model = _ai_setting('NVIDIA_AI_MODEL', 'meta/llama-3.2-11b-instruct')
    if not api_key:
        return fallback

    prompt = (
        'Create a concise, trustworthy real-estate listing title and description. '
        'Do not invent amenities, legal status, measurements, or guarantees. '
        'Return JSON only with keys title and narrative.\n\n'
        f'Input: {json.dumps(data, default=str)}'
    )
    try:
        response = requests.post(
            'https://integrate.api.nvidia.com/v1/chat/completions',
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            json={
                'model': model,
                'temperature': 0.4,
                'max_tokens': 500,
                'messages': [
                    {'role': 'system', 'content': 'You write accurate property marketplace copy.'},
                    {'role': 'user', 'content': prompt},
                ],
            },
            timeout=20,
        )
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content'].strip()
        content = re.sub(r'^```(?:json)?\s*|\s*```$', '', content).strip()
        result = json.loads(content)
        if result.get('title') and result.get('narrative'):
            return {'title': str(result['title']), 'narrative': str(result['narrative']), 'provider': 'nvidia'}
    except (requests.RequestException, KeyError, IndexError, TypeError, ValueError):
        pass
    return fallback


def analyze_offer(data):
    asking = float(data.get('asking_price') or 0)
    offered = float(data.get('offer_amount') or 0)
    discount = round(((asking - offered) / asking) * 100) if asking > 0 else 0
    recommended = round(offered * 1.05) if offered > 0 else round(asking * 0.95)
    if asking and offered >= asking:
        analysis = 'This offer meets or exceeds the asking price and is commercially favorable for acceptance.'
    elif asking:
        analysis = f'This offer is {max(0, discount)}% below asking price. Review the property demand and documentation before countering.'
    else:
        analysis = 'There is not enough asking-price data for a reliable comparison.'
    return {
        'analysis': analysis,
        'ai_analysis': analysis,
        'discount_percent': max(0, discount),
        'recommended_counter': recommended,
        'provider': 'rules',
    }


def describe_listing_image(uploaded_file):
    api_key = _ai_setting('NVIDIA_AI_API_KEY') or _ai_setting('NVIDIA_API_KEY')
    if not api_key:
        raise RuntimeError('NVIDIA AI is not configured. Add NVIDIA_AI_API_KEY in System Settings.')
    model = _ai_setting('NVIDIA_AI_VISION_MODEL', 'meta/llama-3.2-11b-vision-instruct')
    encoded = base64.b64encode(uploaded_file.read()).decode('ascii')
    content_type = getattr(uploaded_file, 'content_type', None) or mimetypes.guess_type(uploaded_file.name)[0] or 'image/jpeg'
    response = requests.post(
        'https://integrate.api.nvidia.com/v1/chat/completions',
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
        json={
            'model': model,
            'temperature': 0.1,
            'max_tokens': 250,
            'messages': [{
                'role': 'user',
                'content': [
                    {'type': 'text', 'text': 'Identify the likely property category and concise search keywords. Return JSON only: {"category":"house|land|car|commercial|hotel", "keywords":"..."}.'},
                    {'type': 'image_url', 'image_url': {'url': f'data:{content_type};base64,{encoded}'}},
                ],
            }],
        },
        timeout=30,
    )
    response.raise_for_status()
    content = response.json()['choices'][0]['message']['content'].strip()
    content = re.sub(r'^```(?:json)?\s*|\s*```$', '', content).strip()
    result = json.loads(content)
    return {'category': result.get('category', ''), 'keywords': result.get('keywords', ''), 'provider': 'nvidia'}
