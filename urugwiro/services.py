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
