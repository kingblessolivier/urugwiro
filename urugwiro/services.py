from django.db.models import Avg, Min, Max
from .models import Listing, SaleExtension, LandExtension

class ValuationService:
    """
    Provides data-driven Fair Market Value (FMV) estimates based on comparable listings.
    """

    @staticmethod
    def get_valuation_estimate(property_type, city, district, sector, size):
        """
        Calculate FMV range using a hierarchical fallback search (Sector -> District -> City).
        """
        # 1. Determine which extension to use for size and comparable filtering
        extension_model = None
        size_field = None

        if property_type == 'land':
            extension_model = LandExtension
            size_field = 'plot_size'
        elif property_type == 'sale':
            extension_model = SaleExtension
            size_field = 'size_sqm'
        else:
            # Default to SaleExtension for most properties (House, Apartment, etc.)
            extension_model = SaleExtension
            size_field = 'size_sqm'

        # 2. Hierarchical search for comparables
        comparables = []
        search_levels = [
            {'sector': sector},
            {'district': district},
            {'city': city},
        ]

        for level in search_levels:
            if not any(level.values()): continue

            # Filter active listings of the same type in the current location level
            qs = Listing.objects.filter(
                status='listed',
                listing_type=property_type,
                **level
            )

            # Join with extension to get size
            # This is a simplification; in a real app, we'd use Prefetch or select_related
            listings_with_size = []
            for l in qs:
                try:
                    ext = getattr(l, 'sale_data' if property_type != 'land' else 'land_data')
                    if ext and getattr(ext, size_field):
                        listings_with_size.append({
                            'price': l.price,
                            'size': getattr(ext, size_field)
                        })
                except AttributeError:
                    continue

            if listings_with_size:
                comparables = listings_with_size
                break # Found comparables at this level, stop falling back

        if not comparables:
            return {
                "error": "Insufficient market data to provide an estimate for this location.",
                "comparables_count": 0
            }

        # 3. Calculate Unit Prices (Price / Size)
        unit_prices = [item['price'] / item['size'] for item in comparables if item['size'] > 0]

        if not unit_prices:
            return {
                "error": "Comparable listings found, but size data is missing.",
                "comparables_count": len(comparables)
            }

        avg_unit_price = sum(unit_prices) / len(unit_prices)
        min_unit_price = min(unit_prices)
        max_unit_price = max(unit_prices)

        # 4. Compute Final FMV range for the target size
        fmv_average = avg_unit_price * size
        fmv_min = min_unit_price * size
        fmv_max = max_unit_price * size

        return {
            "fmv_average": float(fmv_average),
            "fmv_min": float(fmv_min),
            "fmv_max": float(fmv_max),
            "comparables_count": len(unit_prices),
            "price_per_sqm_avg": float(avg_unit_price),
            "currency": "RWF",
            "message": f"Based on {len(unit_prices)} comparable listings in the area."
        }
