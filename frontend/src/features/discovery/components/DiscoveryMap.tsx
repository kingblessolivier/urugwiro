import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

interface Listing {
  id: string | number;
  title: string;
  price?: number | string;
  currency?: string;
  category?: string;
  asset?: {
    latitude?: number | string | null;
    longitude?: number | string | null;
    district?: string;
    province?: string;
    sector?: string;
  };
}

interface DiscoveryMapProps {
  listings: Listing[];
  onListingClick?: (id: string) => void;
  hoveredListingId?: string | null;
  onHoverListing?: (id: string | null) => void;
}

// Custom Leaflet Emerald Marker Icon
const mapPinIcon = new L.DivIcon({
  className: 'custom-map-pin',
  html: `
    <div style="
      background: #10b981;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2.5px solid #ffffff;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
    ">
      ★
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

// Default district fallback coordinates in Rwanda if asset lat/lng is missing
const DISTRICT_COORDS: Record<string, [number, number]> = {
  gasabo: [-1.9167, 30.1333],
  kicukiro: [-1.9833, 30.1167],
  nyarugenge: [-1.9536, 30.0606],
  bugesera: [-2.2167, 30.1833],
  rwamagana: [-1.9486, 30.4347],
  musanze: [-1.4997, 29.6333],
  rubavu: [-1.6769, 29.2608],
  huye: [-2.6000, 29.7333],
};

const DiscoveryMap: React.FC<DiscoveryMapProps> = ({ listings, onListingClick, hoveredListingId, onHoverListing }) => {
  // Extract all valid geocoded listings
  const mappedListings = useMemo(() => {
    return listings
      .map((l, index) => {
        let lat = Number(l.asset?.latitude);
        let lng = Number(l.asset?.longitude);

        // Fallback to district coordinates if coordinates missing
        if ((!lat || isNaN(lat) || !lng || isNaN(lng)) && l.asset?.district) {
          const key = l.asset.district.toLowerCase();
          if (DISTRICT_COORDS[key]) {
            // Add subtle jitter so markers on the same district don't perfectly overlap
            const offset = (index % 5) * 0.003;
            lat = DISTRICT_COORDS[key][0] + offset;
            lng = DISTRICT_COORDS[key][1] + offset;
          }
        }

        // Final default to Kigali center if still missing
        if (!lat || isNaN(lat) || !lng || isNaN(lng)) {
          const offset = (index % 7) * 0.004;
          lat = -1.9441 + offset;
          lng = 30.0619 + offset;
        }

        return {
          ...l,
          lat,
          lng,
        };
      });
  }, [listings]);

  const defaultCenter: [number, number] = [-1.9441, 30.0619]; // Kigali

  return (
    <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
      {/* Floating Badge */}
      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20 shadow-lg">
          <Navigation size={12} className="text-emerald-400" /> Map results
        </span>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mappedListings.map((listing) => {
          const isHovered = hoveredListingId === String(listing.id);
          const pinIcon = new L.DivIcon({
            className: 'custom-map-pin',
            html: `
              <div style="
                background: ${isHovered ? '#f59e0b' : '#10b981'};
                width: ${isHovered ? '36px' : '28px'};
                height: ${isHovered ? '36px' : '28px'};
                border-radius: 50%;
                border: 2.5px solid #ffffff;
                box-shadow: 0 4px 14px ${isHovered ? 'rgba(245, 158, 11, 0.6)' : 'rgba(16, 185, 129, 0.5)'};
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-size: ${isHovered ? '14px' : '11px'};
                font-weight: 700;
                transition: all 0.2s ease;
              ">
                ★
              </div>
            `,
            iconSize: isHovered ? [36, 36] : [28, 28],
            iconAnchor: isHovered ? [18, 18] : [14, 14],
            popupAnchor: [0, isHovered ? -20 : -16],
          });

          return (
            <Marker
              key={listing.id}
              position={[listing.lat, listing.lng]}
              icon={pinIcon}
              eventHandlers={{
                mouseover: () => onHoverListing?.(String(listing.id)),
                mouseout: () => onHoverListing?.(null),
                click: () => onHoverListing?.(String(listing.id)),
              }}
            >
              <Popup>
                <div className="p-1 space-y-1.5 min-w-[170px]" style={{ color: '#0f172a' }} role="dialog" aria-label={`Listing: ${listing.title}`}>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-600 block">
                    {listing.category || 'Asset'}
                  </span>
                  <h4 className="font-bold text-xs leading-tight line-clamp-2">
                    {listing.title}
                  </h4>
                  {listing.asset?.district && (
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <MapPin size={10} /> {listing.asset.district}, {listing.asset.province || 'Rwanda'}
                    </p>
                  )}
                  {listing.price && (
                    <p className="text-xs font-mono font-bold text-emerald-600">
                      {Number(listing.price).toLocaleString()} {listing.currency || 'RWF'}
                    </p>
                  )}
                  {onListingClick && (
                    <button
                      type="button"
                      onClick={() => onListingClick(String(listing.id))}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onListingClick(String(listing.id)); } }}
                      className="w-full mt-1.5 py-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      aria-label={`View details for ${listing.title}`}
                    >
                      View Details
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default DiscoveryMap;
