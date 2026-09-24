import React, { useMemo, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getProvinces, getDistrictsByProvince, getSectorsByDistrict } from '../../data/rwandaLocations';
import type { WizardCategory } from './CategorySelector';

// Leaflet CSS must be imported in the app entry (main.tsx)
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationData {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  address: string;
  latitude: number;
  longitude: number;
  upiNumber: string;
}

interface LocationPickerProps {
  category: WizardCategory;
  location: LocationData;
  onChange: (updates: Partial<LocationData>) => void;
}

// Draggable marker sub-component
const DraggableMarker: React.FC<{
  position: [number, number];
  onMove: (lat: number, lng: number) => void;
}> = ({ position, onMove }) => {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      position={position}
      icon={defaultIcon}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const marker = markerRef.current;
          if (marker) {
            const pos = marker.getLatLng();
            onMove(pos.lat, pos.lng);
          }
        },
      }}
    />
  );
};

const LocationPicker: React.FC<LocationPickerProps> = ({ category, location, onChange }) => {
  const provinces = useMemo(() => getProvinces(), []);
  const districts = useMemo(() => getDistrictsByProvince(location.province), [location.province]);
  const sectors = useMemo(() => getSectorsByDistrict(location.district), [location.district]);

  const isVehicle = category === 'car' || category === 'motorbike';
  const showUpi = category === 'house' || category === 'apartment' || category === 'land';

  const handleProvinceChange = (prov: string) => {
    const newDistricts = getDistrictsByProvince(prov);
    const newDist = newDistricts[0] || '';
    const newSectors = getSectorsByDistrict(newDist);
    onChange({
      province: prov,
      district: newDist,
      sector: newSectors[0] || '',
    });
  };

  const handleDistrictChange = (dist: string) => {
    const newSectors = getSectorsByDistrict(dist);
    onChange({ district: dist, sector: newSectors[0] || '' });
  };

  // Ensure we set initial cascades if empty
  useEffect(() => {
    if (!location.province && provinces.length > 0) {
      handleProvinceChange(provinces[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectClass =
    'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all cursor-pointer focus:border-emerald-500/50';
  const inputClass =
    'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500/50';
  const inputStyle = {
    background: 'var(--color-input-bg)',
    borderColor: 'var(--color-input-border)',
    color: 'var(--color-text-main)',
  };

  const mapCenter: [number, number] = [
    location.latitude || -1.9441,
    location.longitude || 30.0619,
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-main)' }}>
          {isVehicle ? 'Where can it be viewed?' : 'Locate the property'}
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {isVehicle
            ? 'Set the showroom or parking location'
            : 'Drop a pin on the map and select the administrative location'}
        </p>
      </div>

      {/* Map */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: 'var(--color-border)', height: '280px' }}
      >
        <MapContainer
          center={mapCenter}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker
            position={mapCenter}
            onMove={(lat, lng) =>
              onChange({
                latitude: parseFloat(lat.toFixed(6)),
                longitude: parseFloat(lng.toFixed(6)),
              })
            }
          />
        </MapContainer>
      </div>

      {/* GPS readout */}
      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-dim)' }}>
        <MapPin size={14} className="text-emerald-500 shrink-0" />
        <span className="font-mono">
          {location.latitude?.toFixed(6) || '-1.944100'}, {location.longitude?.toFixed(6) || '30.061900'}
        </span>
      </div>

      {/* Administrative cascade */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Province
          </label>
          <select className={selectClass} style={inputStyle} value={location.province} onChange={(e) => handleProvinceChange(e.target.value)}>
            {provinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            District
          </label>
          <select className={selectClass} style={inputStyle} value={location.district} onChange={(e) => handleDistrictChange(e.target.value)}>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Sector
          </label>
          <select className={selectClass} style={inputStyle} value={location.sector} onChange={(e) => onChange({ sector: e.target.value })}>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cell + Village (for real estate only) */}
      {!isVehicle && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Cell</label>
            <input type="text" className={inputClass} style={inputStyle} placeholder="e.g. Rugando" value={location.cell} onChange={(e) => onChange({ cell: e.target.value })} />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Village</label>
            <input type="text" className={inputClass} style={inputStyle} placeholder="e.g. Gasave" value={location.village} onChange={(e) => onChange({ village: e.target.value })} />
          </div>
        </div>
      )}

      {/* UPI for real estate */}
      {showUpi && (
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            UPI Number (Cadastral)
          </label>
          <input
            type="text"
            className={cn(inputClass, 'font-mono')}
            style={inputStyle}
            placeholder="e.g. 1/03/05/02/1234"
            value={location.upiNumber}
            onChange={(e) => onChange({ upiNumber: e.target.value })}
          />
        </div>
      )}

      {/* Address / Landmark */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
          {isVehicle ? 'Showroom / Parking Address' : 'Street Address / Landmark'}
        </label>
        <input
          type="text"
          className={inputClass}
          style={inputStyle}
          placeholder={isVehicle ? 'e.g. Simba Supermarket Parking, KN 5 Ave' : 'e.g. KG 123 St, near Green Hills Academy'}
          value={location.address}
          onChange={(e) => onChange({ address: e.target.value })}
        />
      </div>
    </div>
  );
};

export type { LocationData };
export default LocationPicker;
