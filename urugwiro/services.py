import base64
import json
import mimetypes
import os
import re
from decimal import Decimal, InvalidOperation
from statistics import median

import requests
from .models import Listing


class ValuationService:
    """
    Provides data-driven Fair Market Value (FMV) estimates based on comparable listings.
    Uses the unified Listing + Asset model instead of legacy extensions.
    """

    @staticmethod
    def get_valuation_estimate(
        category, purpose, currency='RWF', province=None, district=None,
        sector=None, size=None, rental_frequency=None,
    ):
        """Estimate from like-for-like published asking prices.

        The result deliberately describes a market comparison, not a certified
        valuation. Sale and rental prices, currencies, and rental periods are
        never mixed.
        """
        try:
            subject_size = Decimal(str(size)) if size not in (None, '') else None
        except (InvalidOperation, TypeError, ValueError):
            subject_size = None

        base_filters = {
            'status': 'published',
            'category': category,
            'purpose': purpose,
            'currency__iexact': currency,
        }
        if purpose == 'rent':
            base_filters['rental_frequency'] = rental_frequency

        location_levels = []
        if sector:
            filters = {'asset__sector__iexact': sector}
            if district:
                filters['asset__district__iexact'] = district
            if province:
                filters['asset__province__iexact'] = province
            location_levels.append(('sector', filters))
        if district:
            filters = {'asset__district__iexact': district}
            if province:
                filters['asset__province__iexact'] = province
            location_levels.append(('district', filters))
        if province:
            location_levels.append(('province', {'asset__province__iexact': province}))
        location_levels.append(('national', {}))

        selected = None
        search_level = 'none'
        total_count = 0
        for level_name, location_filters in location_levels:
            queryset = Listing.objects.filter(**base_filters, **location_filters)
            count = queryset.count()
            if count:
                selected = queryset
                search_level = level_name
                total_count = count
                break

        limitations = [
            'Based on published asking prices, not completed transaction prices.',
            'Does not adjust for condition, legal status, amenities, or negotiation.',
        ]
        if selected is None:
            return {
                'estimated_value': None,
                'low_range': None,
                'high_range': None,
                'comparables_count': 0,
                'analyzed_count': 0,
                'search_level': 'none',
                'method': 'insufficient_data',
                'confidence': 'insufficient_data',
                'comparables': [],
                'freshness': {'newest': None, 'oldest': None},
                'limitations': limitations + [
                    'No published listings match the requested market segment.'
                ],
            }

        rows = list(selected.order_by('-date_listed').values(
            'id', 'title', 'price', 'currency', 'purpose', 'rental_frequency',
            'asset__total_area', 'asset__province', 'asset__district',
            'asset__sector', 'date_listed',
        )[:100])
        if total_count > len(rows):
            limitations.append('The calculation uses the 100 most recent matching listings.')
        if search_level == 'national' and any((province, district, sector)):
            limitations.append('No local matches were available, so the search expanded nationwide.')

        area_rows = [row for row in rows if row['asset__total_area'] and row['asset__total_area'] > 0]
        if subject_size and subject_size > 0 and len(area_rows) >= 2:
            observations = [
                (row['price'] / row['asset__total_area']) * subject_size
                for row in area_rows
            ]
            method = 'median_price_per_sqm'
            analyzed_rows = area_rows
        else:
            observations = [row['price'] for row in rows]
            method = 'median_listing_price'
            analyzed_rows = rows
            if subject_size and subject_size > 0:
                limitations.append(
                    'Fewer than two comparable listings have area data; size was not used.'
                )

        ordered = sorted(observations)
        estimate = Decimal(median(ordered))
        if len(ordered) < 4:
            low, high = ordered[0], ordered[-1]
        else:
            low = ordered[(len(ordered) - 1) // 4]
            high = ordered[(3 * (len(ordered) - 1)) // 4]
        analyzed_count = len(analyzed_rows)
        if analyzed_count >= 8 and method == 'median_price_per_sqm':
            confidence = 'high'
        elif analyzed_count >= 4:
            confidence = 'medium'
        else:
            confidence = 'low'
            limitations.append('The small comparable sample makes this estimate less reliable.')

        comparable_sample = []
        for row in analyzed_rows[:8]:
            area = row['asset__total_area']
            comparable_sample.append({
                'id': row['id'],
                'title': row['title'],
                'price': float(row['price']),
                'currency': row['currency'],
                'purpose': row['purpose'],
                'rental_frequency': row['rental_frequency'],
                'area_sqm': float(area) if area else None,
                'price_per_sqm': float(row['price'] / area) if area else None,
                'province': row['asset__province'],
                'district': row['asset__district'],
                'sector': row['asset__sector'],
                'date_listed': row['date_listed'].isoformat(),
            })

        dates = [row['date_listed'] for row in analyzed_rows]
        return {
            'estimated_value': round(float(estimate)),
            'low_range': round(float(low)),
            'high_range': round(float(high)),
            'comparables_count': total_count,
            'analyzed_count': analyzed_count,
            'search_level': search_level,
            'method': method,
            'confidence': confidence,
            'comparables': comparable_sample,
            'freshness': {
                'newest': max(dates).isoformat(),
                'oldest': min(dates).isoformat(),
            },
            'limitations': limitations,
        }


def _ai_setting(key, default=''):
    from .models import SystemSetting
    value = os.getenv(key, '')
    if value:
        return value
    setting = SystemSetting.objects.filter(key__iexact=key).first()
    return setting.value if setting else default


def test_ai_connection(model=None):
    """Make a minimal authenticated inference request using the stored key."""
    api_key = _ai_setting('NVIDIA_AI_API_KEY') or _ai_setting('NVIDIA_API_KEY')
    if not api_key:
        raise RuntimeError('NVIDIA AI is not configured.')
    selected_model = model or _ai_setting('NVIDIA_AI_MODEL', 'meta/llama-3.2-11b-instruct')
    response = requests.post(
        'https://integrate.api.nvidia.com/v1/chat/completions',
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
        json={
            'model': selected_model,
            'temperature': 0,
            'max_tokens': 4,
            'messages': [{'role': 'user', 'content': 'Reply with OK.'}],
        },
        timeout=20,
    )
    response.raise_for_status()
    return {
        'success': True,
        'status': 'connected',
        'message': 'NVIDIA NIM accepted an authenticated inference request.',
        'model': selected_model,
    }


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
