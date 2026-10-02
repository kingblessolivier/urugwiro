import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink, MapPin } from 'lucide-react';
import type { Listing } from '../../../types/listing';
import { locationParts, locationText } from '../listingSpecs';

const pin = new L.DivIcon({
  className: 'listing-detail-pin',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#059669;border:2px solid #fff;box-shadow:0 4px 12px rgba(5,150,105,.45)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const ListingLocationMap: React.FC<{ listing: Listing }> = ({ listing }) => {
  const coords = useMemo(() => {
    const lat = Number(listing.asset?.latitude);
    const lng = Number(listing.asset?.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
      return { lat, lng, precise: true };
    }
    return { lat: -1.9441, lng: 30.0619, precise: false };
  }, [listing.asset?.latitude, listing.asset?.longitude]);

  const parts = locationParts(listing);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    coords.precise ? `${coords.lat},${coords.lng}` : locationText(listing),
  )}`;

  return (
    <section id="location" className="scroll-mt-28">
      <h2 className="font-display text-2xl font-semibold text-[var(--color-text-main)]">Location</h2>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
        <MapPin size={15} className="text-emerald-600" />
        {locationText(listing)}
      </p>
      {parts.length > 1 && (
        <p className="mt-1 text-xs text-[var(--color-text-dim)]">{parts.join(' · ')}</p>
      )}
      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-border)] h-64 sm:h-80">
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={coords.precise ? 15 : 12}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coords.lat, coords.lng]} icon={pin} />
        </MapContainer>
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
      >
        Open in Google Maps <ExternalLink size={14} />
      </a>
    </section>
  );
};

export default ListingLocationMap;
