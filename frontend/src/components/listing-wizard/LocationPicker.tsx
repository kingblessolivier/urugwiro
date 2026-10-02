import React, { useMemo, useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Loader2, CheckCircle2, Edit3, ListFilter } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  getProvinces,
  getDistrictsByProvince,
  getSectorsByDistrict,
  getCellsBySector,
  getVillagesByCell,
  getLocationCoordinates,
  useRwandaLocations,
} from '../../data/rwandaLocations';
import type { WizardCategory } from './CategorySelector';

// Leaflet CSS is imported in main.tsx
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon for bundlers
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

// Controller sub-component to smoothly recenter map when coordinates change
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (typeof center[0] === 'number' && !isNaN(center[0]) && typeof center[1] === 'number' && !isNaN(center[1])) {
      map.setView(center, zoom ?? map.getZoom(), { animate: true });
    }
  }, [center[0], center[1], zoom, map]);
  return null;
};

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
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [customCellMode, setCustomCellMode] = useState(false);
  const [customVillageMode, setCustomVillageMode] = useState(false);
  const [mapZoom, setMapZoom] = useState<number>(14);

  const { isLoaded: locationsLoaded } = useRwandaLocations();

  const provinces = useMemo(() => getProvinces(), [locationsLoaded]);
  const districts = useMemo(() => getDistrictsByProvince(location.province), [location.province, locationsLoaded]);
  const sectors = useMemo(() => getSectorsByDistrict(location.district, location.province), [location.district, location.province, locationsLoaded]);
  const cells = useMemo(() => getCellsBySector(location.sector, location.district, location.province), [location.sector, location.district, location.province, locationsLoaded]);
  const villages = useMemo(() => getVillagesByCell(location.cell, location.sector, location.district, location.province), [location.cell, location.sector, location.district, location.province, locationsLoaded]);

  const isVehicle = category === 'car' || category === 'motorbike';
  const showUpi = category === 'house' || category === 'apartment' || category === 'land';

  // Province change -> cascade District -> Sector -> Cell -> Village -> Map coords
  const handleProvinceChange = (prov: string) => {
    const newDistricts = getDistrictsByProvince(prov);
    const newDist = newDistricts[0] || '';
    const newSectors = getSectorsByDistrict(newDist, prov);
    const newSec = newSectors[0] || '';
    const newCells = getCellsBySector(newSec, newDist, prov);
    const newCell = newCells[0] || '';
    const newVillages = getVillagesByCell(newCell, newSec, newDist, prov);
    const newVillage = newVillages[0] || '';
    const coords = getLocationCoordinates(prov, newDist, newSec, newCell, newVillage);
    setMapZoom(coords.zoom || 12);

    onChange({
      province: prov,
      district: newDist,
      sector: newSec,
      cell: newCell,
      village: newVillage,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  // District change -> cascade Sector -> Cell -> Village -> Map coords
  const handleDistrictChange = (dist: string) => {
    const newSectors = getSectorsByDistrict(dist, location.province);
    const newSec = newSectors[0] || '';
    const newCells = getCellsBySector(newSec, dist, location.province);
    const newCell = newCells[0] || '';
    const newVillages = getVillagesByCell(newCell, newSec, dist, location.province);
    const newVillage = newVillages[0] || '';
    const coords = getLocationCoordinates(location.province, dist, newSec, newCell, newVillage);
    setMapZoom(coords.zoom || 13);

    onChange({
      district: dist,
      sector: newSec,
      cell: newCell,
      village: newVillage,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  // Sector change -> cascade Cell -> Village -> Map coords
  const handleSectorChange = (sec: string) => {
    const newCells = getCellsBySector(sec, location.district, location.province);
    const newCell = newCells[0] || '';
    const newVillages = getVillagesByCell(newCell, sec, location.district, location.province);
    const newVillage = newVillages[0] || '';
    const coords = getLocationCoordinates(location.province, location.district, sec, newCell, newVillage);
    setMapZoom(coords.zoom || 14);

    onChange({
      sector: sec,
      cell: newCell,
      village: newVillage,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  // Cell change -> cascade Village -> Map coords
  const handleCellChange = (c: string) => {
    if (c === '__custom__') {
      setCustomCellMode(true);
      return;
    }
    const newVillages = getVillagesByCell(c, location.sector, location.district, location.province);
    const newVillage = newVillages[0] || '';
    const coords = getLocationCoordinates(location.province, location.district, location.sector, c, newVillage);
    setMapZoom(coords.zoom || 15);

    onChange({
      cell: c,
      village: newVillage,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  // Village change -> Map coords
  const handleVillageChange = (v: string) => {
    if (v === '__custom__') {
      setCustomVillageMode(true);
      return;
    }
    const coords = getLocationCoordinates(location.province, location.district, location.sector, location.cell, v);
    setMapZoom(coords.zoom || 16);

    onChange({
      village: v,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  // Use current browser GPS location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser');
      setTimeout(() => setGeoStatus(null), 3000);
      return;
    }

    setIsLocating(true);
    setGeoStatus('Detecting your GPS position...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setMapZoom(16);
        onChange({
          latitude: lat,
          longitude: lng,
        });
        setIsLocating(false);
        setGeoStatus('Location pinned successfully!');
        setTimeout(() => setGeoStatus(null), 3500);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Failed to retrieve location';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please allow GPS access.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        setGeoStatus(msg);
        setTimeout(() => setGeoStatus(null), 4000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Ensure initial defaults if empty
  useEffect(() => {
    if (!location.province && provinces.length > 0) {
      handleProvinceChange(provinces[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectClass =
    'w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none transition-all cursor-pointer bg-white dark:bg-[#111823] text-slate-900 dark:text-[#f0f4f8] focus:border-emerald-500/50';
  const inputClass =
    'w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm outline-none transition-all bg-white dark:bg-[#111823] text-slate-900 dark:text-[#f0f4f8] focus:border-emerald-500/50';
  const optionClass =
    'bg-white text-slate-900 dark:bg-[#111823] dark:text-[#f0f4f8]';

  const mapCenter: [number, number] = [
    typeof location.latitude === 'number' && !isNaN(location.latitude) ? location.latitude : -1.9441,
    typeof location.longitude === 'number' && !isNaN(location.longitude) ? location.longitude : 30.0619,
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">
          {isVehicle ? 'Where can it be viewed?' : 'Locate the property'}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          {isVehicle
            ? 'Set the showroom or parking location'
            : 'Select administrative location, enter GPS coordinates, or drop a pin on the map'}
        </p>
      </div>

      {/* Map Header with Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
          <MapPin size={15} className="text-emerald-500 shrink-0" />
          <span className="font-mono font-medium">
            {mapCenter[0].toFixed(6)}, {mapCenter[1].toFixed(6)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            title="Detect GPS location from your browser"
          >
            {isLocating ? <Loader2 size={13} className="animate-spin text-emerald-600" /> : <Navigation size={13} />}
            {isLocating ? 'Locating...' : 'Use Current Location'}
          </button>
        </div>
      </div>

      {geoStatus && (
        <div className="text-xs px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
          <span>{geoStatus}</span>
        </div>
      )}

      {/* Map Container */}
      <div
        className="rounded-2xl overflow-hidden border relative shadow-sm"
        style={{ borderColor: 'var(--color-border)', height: '300px' }}
      >
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter center={mapCenter} zoom={mapZoom} />
          <DraggableMarker
            position={mapCenter}
            onMove={(lat, lng) => {
              setMapZoom(16);
              onChange({
                latitude: parseFloat(lat.toFixed(6)),
                longitude: parseFloat(lng.toFixed(6)),
              });
            }}
          />
        </MapContainer>
        <div className="absolute bottom-2 left-2 z-[400] bg-white/90 dark:bg-[#111823]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-muted)] shadow-sm">
          💡 Drag pin or click map to reposition
        </div>
      </div>

      {/* Manual Latitude and Longitude Inputs */}
      <div className="rounded-xl p-3.5 border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
            <Edit3 size={13} className="text-emerald-500" /> Manual GPS Coordinates
          </label>
          <span className="text-[10px] text-[var(--color-text-dim)]">Map pin updates automatically</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-medium text-[var(--color-text-dim)] block mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              className={inputClass}
              placeholder="-1.944100"
              value={location.latitude ?? ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setMapZoom(16);
                onChange({ latitude: isNaN(val) ? 0 : parseFloat(val.toFixed(6)) });
              }}
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-[var(--color-text-dim)] block mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              className={inputClass}
              placeholder="30.061900"
              value={location.longitude ?? ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setMapZoom(16);
                onChange({ longitude: isNaN(val) ? 0 : parseFloat(val.toFixed(6)) });
              }}
            />
          </div>
        </div>
      </div>

      {/* Administrative cascade: Province -> District -> Sector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5 text-[var(--color-text-muted)]">
            Province
          </label>
          <select
            className={selectClass}
            value={location.province}
            onChange={(e) => handleProvinceChange(e.target.value)}
          >
            {provinces.map((p) => (
              <option key={p} value={p} className={optionClass}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5 text-[var(--color-text-muted)]">
            District
          </label>
          <select
            className={selectClass}
            value={location.district}
            onChange={(e) => handleDistrictChange(e.target.value)}
          >
            {districts.map((d) => (
              <option key={d} value={d} className={optionClass}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5 text-[var(--color-text-muted)]">
            Sector
          </label>
          <select
            className={selectClass}
            value={location.sector}
            onChange={(e) => handleSectorChange(e.target.value)}
          >
            {sectors.map((s) => (
              <option key={s} value={s} className={optionClass}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cell + Village Dropdowns (with custom entry fallback) */}
      {!isVehicle && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Cell
              </label>
              <button
                type="button"
                onClick={() => setCustomCellMode(!customCellMode)}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                {customCellMode ? <ListFilter size={11} /> : <Edit3 size={11} />}
                {customCellMode ? 'Choose from list' : '+ Type custom'}
              </button>
            </div>
            {customCellMode ? (
              <input
                type="text"
                className={inputClass}
                placeholder="Type cell name..."
                value={location.cell}
                onChange={(e) => {
                  const c = e.target.value;
                  const coords = getLocationCoordinates(location.province, location.district, location.sector, c, location.village);
                  setMapZoom(coords.zoom || 15);
                  onChange({ cell: c, latitude: coords.lat, longitude: coords.lng });
                }}
                autoFocus
              />
            ) : (
              <select
                className={selectClass}
                value={location.cell}
                onChange={(e) => handleCellChange(e.target.value)}
              >
                {cells.map((c) => (
                  <option key={c} value={c} className={optionClass}>
                    {c}
                  </option>
                ))}
                <option value="__custom__" className={optionClass}>
                  + Enter custom cell...
                </option>
              </select>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Village
              </label>
              <button
                type="button"
                onClick={() => setCustomVillageMode(!customVillageMode)}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                {customVillageMode ? <ListFilter size={11} /> : <Edit3 size={11} />}
                {customVillageMode ? 'Choose from list' : '+ Type custom'}
              </button>
            </div>
            {customVillageMode ? (
              <input
                type="text"
                className={inputClass}
                placeholder="Type village name..."
                value={location.village}
                onChange={(e) => {
                  const v = e.target.value;
                  const coords = getLocationCoordinates(location.province, location.district, location.sector, location.cell, v);
                  setMapZoom(coords.zoom || 16);
                  onChange({ village: v, latitude: coords.lat, longitude: coords.lng });
                }}
                autoFocus
              />
            ) : (
              <select
                className={selectClass}
                value={location.village}
                onChange={(e) => handleVillageChange(e.target.value)}
              >
                {villages.map((v) => (
                  <option key={v} value={v} className={optionClass}>
                    {v}
                  </option>
                ))}
                <option value="__custom__" className={optionClass}>
                  + Enter custom village...
                </option>
              </select>
            )}
          </div>
        </div>
      )}

      {/* UPI for real estate */}
      {showUpi && (
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5 text-[var(--color-text-muted)]">
            UPI Number (Cadastral)
          </label>
          <input
            type="text"
            className={cn(inputClass, 'font-mono')}
            placeholder="e.g. 1/03/05/02/1234"
            value={location.upiNumber}
            onChange={(e) => onChange({ upiNumber: e.target.value })}
          />
        </div>
      )}

      {/* Address / Landmark */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5 text-[var(--color-text-muted)]">
          {isVehicle ? 'Showroom / Parking Address' : 'Street Address / Landmark'}
        </label>
        <input
          type="text"
          className={inputClass}
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
