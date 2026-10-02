import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, FileText, ShieldCheck, MapPin, Building2,
  User, Zap, ListChecks, Phone, Mail, Layers, Trash2, AlertCircle, Save,
  Star, Settings2, Crown, Pencil, Sparkles, Navigation, Loader2, CheckCircle2, ListFilter, Edit3
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../api/endpoints';
import { AdminEditableSection } from './components/AdminEditableSection';
import { ResidentialSpecsForm, LandSpecsForm, VehicleSpecsForm, CommercialSpecsForm, HotelSpecsForm, SpecField } from './components/AdminSpecFields';
import { AdminMediaManager } from './components/AdminMediaManager';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  getProvinces,
  getDistrictsByProvince,
  getSectorsByDistrict,
  getCellsBySector,
  getVillagesByCell,
  getLocationCoordinates,
  useRwandaLocations,
} from '../../data/rwandaLocations';

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

// Controller to smoothly update Leaflet view when coordinates change
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (typeof center[0] === 'number' && !isNaN(center[0]) && typeof center[1] === 'number' && !isNaN(center[1])) {
      map.setView(center, zoom ?? map.getZoom(), { animate: true });
    }
  }, [center[0], center[1], zoom, map]);
  return null;
};

// Draggable marker
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

const labelCls = "text-[10px] uppercase font-bold text-[var(--color-text-dim)] tracking-tight";
const inputCls = "w-full p-2 rounded-lg bg-white dark:bg-[#111823] border border-[var(--color-border)] text-xs text-slate-900 dark:text-[#f0f4f8] outline-none focus:border-emerald-500/50 transition-colors";
const selectCls = "w-full p-2 rounded-lg bg-white dark:bg-[#111823] border border-[var(--color-border)] text-xs text-slate-900 dark:text-[#f0f4f8] outline-none focus:border-emerald-500/50 transition-colors cursor-pointer";
const optionCls = "bg-white text-slate-900 dark:bg-[#111823] dark:text-[#f0f4f8]";

const CATEGORY_OPTIONS = [
  { label: 'House / Villa', value: 'house' },
  { label: 'Apartment / Condo', value: 'apartment' },
  { label: 'Land / Plot', value: 'land' },
  { label: 'Car', value: 'car' },
  { label: 'Motorbike', value: 'motorbike' },
  { label: 'Commercial / Office', value: 'commercial' },
  { label: 'Hotel / Guesthouse', value: 'hotel' },
];

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Published', value: 'published' },
  { label: 'Under Offer', value: 'under_offer' },
  { label: 'Sold', value: 'sold' },
  { label: 'Rented', value: 'rented' },
  { label: 'Archived', value: 'archived' },
];

const PURPOSE_OPTIONS = [
  { label: 'For Sale', value: 'sale' },
  { label: 'For Rent', value: 'rent' },
];

const RENTAL_FREQ_OPTIONS = [
  { label: '—', value: '' },
  { label: 'Per Day', value: 'per_day' },
  { label: 'Per Month', value: 'per_month' },
  { label: 'Per Year', value: 'per_year' },
];

const CURRENCY_OPTIONS = [
  { label: 'RWF', value: 'RWF' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
];

const VERIF_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Verified', value: 'verified' },
  { label: 'Professional', value: 'professional' },
];

const LISTED_BY_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'Seller', value: 'seller' },
  { label: 'Staff', value: 'staff' },
];

const AMENITY_OPTIONS: { key: string; label: string; group: string }[] = [
  { key: 'has_swimming_pool', label: 'Swimming Pool', group: 'Residential' },
  { key: 'has_garden', label: 'Garden', group: 'Residential' },
  { key: 'has_staff_quarters', label: 'Staff Quarters', group: 'Residential' },
  { key: 'has_water_tank', label: 'Water Tank', group: 'Residential' },
  { key: 'has_solar_water_heater', label: 'Solar Water Heater', group: 'Residential' },
  { key: 'has_backup_generator', label: 'Backup Generator', group: 'Residential' },
  { key: 'has_three_phase_power', label: '3-Phase Power', group: 'Residential' },
  { key: 'has_fiber_internet', label: 'Fiber Internet', group: 'Residential' },
  { key: 'has_cctv', label: 'CCTV', group: 'Residential' },
  { key: 'has_elevator', label: 'Elevator', group: 'Residential' },
  { key: 'has_air_conditioning', label: 'Air Conditioning', group: 'Vehicle / Hotel' },
  { key: 'has_leather_seats', label: 'Leather Seats', group: 'Vehicle' },
  { key: 'has_sunroof', label: 'Sunroof', group: 'Vehicle' },
  { key: 'has_reverse_camera', label: 'Reverse Camera', group: 'Vehicle' },
  { key: 'has_service_history', label: 'Service History', group: 'Vehicle' },
  { key: 'includes_driver', label: 'Includes Driver', group: 'Vehicle' },
  { key: 'includes_helmet', label: 'Includes Helmet', group: 'Vehicle' },
  { key: 'has_delivery_rack', label: 'Delivery Rack', group: 'Vehicle' },
  { key: 'has_restaurant_bar', label: 'Restaurant / Bar', group: 'Hotel' },
  { key: 'has_spa', label: 'Spa', group: 'Hotel' },
  { key: 'has_gym', label: 'Gym', group: 'Hotel' },
  { key: 'includes_breakfast', label: 'Breakfast Included', group: 'Hotel' },
  { key: 'has_showroom', label: 'Showroom', group: 'Commercial' },
  { key: 'has_warehouse', label: 'Warehouse', group: 'Commercial' },
  { key: 'has_office_space', label: 'Office Space', group: 'Commercial' },
  { key: 'has_generator', label: 'Backup Generator', group: 'Commercial' },
];

const AdminLocationEditor: React.FC<{
  data: any;
  setData: (d: any) => void;
}> = ({ data, setData }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [customCellMode, setCustomCellMode] = useState(false);
  const [customVillageMode, setCustomVillageMode] = useState(false);
  const [mapZoom, setMapZoom] = useState<number>(14);

  const { isLoaded: locationsLoaded } = useRwandaLocations();

  const provinces = useMemo(() => getProvinces(), [locationsLoaded]);
  const districts = useMemo(() => getDistrictsByProvince(data.province || ''), [data.province, locationsLoaded]);
  const sectors = useMemo(() => getSectorsByDistrict(data.district || '', data.province || ''), [data.district, data.province, locationsLoaded]);
  const cells = useMemo(() => getCellsBySector(data.sector || '', data.district || '', data.province || ''), [data.sector, data.district, data.province, locationsLoaded]);
  const villages = useMemo(() => getVillagesByCell(data.cell || '', data.sector || '', data.district || '', data.province || ''), [data.cell, data.sector, data.district, data.province, locationsLoaded]);

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

    setData({
      ...data,
      province: prov,
      district: newDist,
      sector: newSec,
      cell: newCell,
      village: newVillage,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  const handleDistrictChange = (dist: string) => {
    const newSectors = getSectorsByDistrict(dist, data.province);
    const newSec = newSectors[0] || '';
    const newCells = getCellsBySector(newSec, dist, data.province);
    const newCell = newCells[0] || '';
    const newVillages = getVillagesByCell(newCell, newSec, dist, data.province);
    const newVillage = newVillages[0] || '';
    const coords = getLocationCoordinates(data.province, dist, newSec, newCell, newVillage);
    setMapZoom(coords.zoom || 13);

    setData({
      ...data,
      district: dist,
      sector: newSec,
      cell: newCell,
      village: newVillage,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  const handleSectorChange = (sec: string) => {
    const newCells = getCellsBySector(sec, data.district, data.province);
    const newCell = newCells[0] || '';
    const newVillages = getVillagesByCell(newCell, sec, data.district, data.province);
    const newVillage = newVillages[0] || '';
    const coords = getLocationCoordinates(data.province, data.district, sec, newCell, newVillage);
    setMapZoom(coords.zoom || 14);

    setData({
      ...data,
      sector: sec,
      cell: newCell,
      village: newVillage,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  const handleCellChange = (c: string) => {
    if (c === '__custom__') {
      setCustomCellMode(true);
      return;
    }
    const newVillages = getVillagesByCell(c, data.sector, data.district, data.province);
    const newVillage = newVillages[0] || '';
    const coords = getLocationCoordinates(data.province, data.district, data.sector, c, newVillage);
    setMapZoom(coords.zoom || 15);

    setData({
      ...data,
      cell: c,
      village: newVillage,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  const handleVillageChange = (v: string) => {
    if (v === '__custom__') {
      setCustomVillageMode(true);
      return;
    }
    const coords = getLocationCoordinates(data.province, data.district, data.sector, data.cell, v);
    setMapZoom(coords.zoom || 16);

    setData({
      ...data,
      village: v,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation not supported by this browser');
      setTimeout(() => setGeoStatus(null), 3000);
      return;
    }
    setIsLocating(true);
    setGeoStatus('Detecting your GPS position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setMapZoom(16);
        setData({
          ...data,
          latitude: lat,
          longitude: lng,
        });
        setIsLocating(false);
        setGeoStatus('GPS location pinned!');
        setTimeout(() => setGeoStatus(null), 3000);
      },
      (err) => {
        setIsLocating(false);
        setGeoStatus('Could not get GPS: ' + err.message);
        setTimeout(() => setGeoStatus(null), 3500);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const rawLat = parseFloat(String(data.latitude));
  const rawLng = parseFloat(String(data.longitude));
  const mapCenter: [number, number] = [
    !isNaN(rawLat) && rawLat !== 0 ? rawLat : -1.9441,
    !isNaN(rawLng) && rawLng !== 0 ? rawLng : 30.0619,
  ];

  return (
    <div className="space-y-4">
      {/* Asset info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className={labelCls}>Asset Name (Asset Model)</label>
          <input
            value={data.asset_name || ''}
            onChange={(e) => setData({ ...data, asset_name: e.target.value })}
            className={inputCls}
            placeholder="e.g. Nyarutarama Villa"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Asset Type</label>
          <input
            value={data.asset_type || ''}
            onChange={(e) => setData({ ...data, asset_type: e.target.value })}
            className={inputCls}
            placeholder="residential / land / vehicle / commercial"
          />
        </div>
      </div>

      {/* Map Header with GPS Readout & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
          <MapPin size={15} className="text-emerald-500 shrink-0" />
          <span className="font-mono font-medium">
            {mapCenter[0].toFixed(6)}, {mapCenter[1].toFixed(6)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLocating ? <Loader2 size={13} className="animate-spin text-emerald-600" /> : <Navigation size={13} />}
          {isLocating ? 'Locating...' : 'Use Current Location'}
        </button>
      </div>

      {geoStatus && (
        <div className="text-xs px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2">
          <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
          <span>{geoStatus}</span>
        </div>
      )}

      {/* Interactive Map */}
      <div
        className="rounded-xl overflow-hidden border relative shadow-sm"
        style={{ borderColor: 'var(--color-border)', height: '280px' }}
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
              setData({
                ...data,
                latitude: parseFloat(lat.toFixed(6)),
                longitude: parseFloat(lng.toFixed(6)),
              });
            }}
          />
        </MapContainer>
        <div className="absolute bottom-2 left-2 z-[400] bg-white/90 dark:bg-[#111823]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-muted)] shadow-sm">
          💡 Click map or drag pin to position
        </div>
      </div>

      {/* Manual Latitude, Longitude, and Total Area */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <label className={labelCls}>Latitude (Manual)</label>
          <input
            type="number"
            step="any"
            value={data.latitude ?? ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setMapZoom(16);
              setData({ ...data, latitude: isNaN(val) ? '' : parseFloat(val.toFixed(6)) });
            }}
            className={inputCls}
            placeholder="-1.944100"
          />
        </div>
        <div>
          <label className={labelCls}>Longitude (Manual)</label>
          <input
            type="number"
            step="any"
            value={data.longitude ?? ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setMapZoom(16);
              setData({ ...data, longitude: isNaN(val) ? '' : parseFloat(val.toFixed(6)) });
            }}
            className={inputCls}
            placeholder="30.061900"
          />
        </div>
        <div>
          <label className={labelCls}>Total Area (SQM)</label>
          <input
            type="number"
            value={data.total_area ?? ''}
            onChange={(e) => setData({ ...data, total_area: e.target.value })}
            className={inputCls}
            placeholder="e.g. 450"
          />
        </div>
      </div>

      {/* Administrative Hierarchy Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Province</label>
          <select
            value={data.province || ''}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className={selectCls}
          >
            <option value="" className={optionCls}>Select Province...</option>
            {provinces.map((p) => (
              <option key={p} value={p} className={optionCls}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>District</label>
          <select
            value={data.district || ''}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className={selectCls}
          >
            <option value="" className={optionCls}>Select District...</option>
            {districts.map((d) => (
              <option key={d} value={d} className={optionCls}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Sector</label>
          <select
            value={data.sector || ''}
            onChange={(e) => handleSectorChange(e.target.value)}
            className={selectCls}
          >
            <option value="" className={optionCls}>Select Sector...</option>
            {sectors.map((s) => (
              <option key={s} value={s} className={optionCls}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cell and Village Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelCls}>Cell</label>
            <button
              type="button"
              onClick={() => setCustomCellMode(!customCellMode)}
              className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              {customCellMode ? <ListFilter size={11} /> : <Edit3 size={11} />}
              {customCellMode ? 'Select from list' : '+ Type custom'}
            </button>
          </div>
          {customCellMode ? (
            <input
              type="text"
              value={data.cell || ''}
              onChange={(e) => {
                const c = e.target.value;
                const coords = getLocationCoordinates(data.province, data.district, data.sector, c, data.village);
                setMapZoom(coords.zoom || 15);
                setData({ ...data, cell: c, latitude: coords.lat, longitude: coords.lng });
              }}
              className={inputCls}
              placeholder="Enter cell name..."
              autoFocus
            />
          ) : (
            <select
              value={data.cell || ''}
              onChange={(e) => handleCellChange(e.target.value)}
              className={selectCls}
            >
              <option value="" className={optionCls}>Select Cell...</option>
              {cells.map((c) => (
                <option key={c} value={c} className={optionCls}>{c}</option>
              ))}
              <option value="__custom__" className={optionCls}>+ Enter custom cell...</option>
            </select>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelCls}>Village</label>
            <button
              type="button"
              onClick={() => setCustomVillageMode(!customVillageMode)}
              className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              {customVillageMode ? <ListFilter size={11} /> : <Edit3 size={11} />}
              {customVillageMode ? 'Select from list' : '+ Type custom'}
            </button>
          </div>
          {customVillageMode ? (
            <input
              type="text"
              value={data.village || ''}
              onChange={(e) => {
                const v = e.target.value;
                const coords = getLocationCoordinates(data.province, data.district, data.sector, data.cell, v);
                setMapZoom(coords.zoom || 16);
                setData({ ...data, village: v, latitude: coords.lat, longitude: coords.lng });
              }}
              className={inputCls}
              placeholder="Enter village name..."
              autoFocus
            />
          ) : (
            <select
              value={data.village || ''}
              onChange={(e) => handleVillageChange(e.target.value)}
              className={selectCls}
            >
              <option value="" className={optionCls}>Select Village...</option>
              {villages.map((v) => (
                <option key={v} value={v} className={optionCls}>{v}</option>
              ))}
              <option value="__custom__" className={optionCls}>+ Enter custom village...</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

function getSpecResolver(category: string | undefined): { key: string; Form: React.FC<any> } | null {
  const c = (category || '').toLowerCase();
  if (c === 'house' || c === 'apartment') return { key: 'residential_spec', Form: ResidentialSpecsForm };
  if (c === 'land') return { key: 'land_spec', Form: LandSpecsForm };
  if (c === 'car' || c === 'motorbike') return { key: 'vehicle_spec', Form: VehicleSpecsForm };
  if (c === 'hotel') return { key: 'hotel_spec', Form: HotelSpecsForm };
  if (c === 'commercial') return { key: 'commercial_spec', Form: CommercialSpecsForm };
  return null;
}

interface AdminPropertyDetailProps {
  propertyId: string;
  onBack: () => void;
}

const AdminPropertyDetail: React.FC<AdminPropertyDetailProps> = ({ propertyId, onBack }) => {
  const queryClient = useQueryClient();

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['admin-property-detail', propertyId],
    queryFn: async () => {
      try {
        const res = await api.admin.propertyDetail(propertyId);
        return res.data;
      } catch {
        const res = await api.listings.get(propertyId);
        return res.data;
      }
    },
    enabled: Boolean(propertyId),
  });

  const [adminNote, setAdminNote] = useState('');
  useEffect(() => {
    const notes = (listing as any)?.admin_notes;
    if (notes !== undefined && notes !== null) {
      setAdminNote(String(notes));
    }
  }, [(listing as any)?.admin_notes]);

  const updateCache = (res: any) => {
    if (res?.data) {
      queryClient.setQueryData(['admin-property-detail', propertyId], res.data);
      queryClient.setQueryData(['listing-detail', propertyId], res.data);
    }
    queryClient.invalidateQueries({ queryKey: ['admin-property-detail', propertyId] });
    queryClient.invalidateQueries({ queryKey: ['listing-detail', propertyId] });
    queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
  };

  const listingMutation = useMutation({
    mutationFn: async (data: any) => api.admin.updateProperty(propertyId, data),
    onSuccess: (res) => updateCache(res),
  });

  const assetMutation = useMutation({
    mutationFn: async (data: any) => api.admin.updateProperty(propertyId, data),
    onSuccess: (res) => updateCache(res),
  });

  const specMutation = useMutation({
    mutationFn: async (payload: any) => api.admin.updateProperty(propertyId, payload),
    onSuccess: (res) => updateCache(res),
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (note: string) => api.admin.updateProperty(propertyId, { admin_notes: note }),
    onSuccess: (res) => updateCache(res),
  });

  const ownerMutation = useMutation({
    mutationFn: async (data: any) => api.admin.updateProperty(propertyId, data),
    onSuccess: (res) => updateCache(res),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.admin.deleteProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-current-listings-page'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      onBack();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent text-[var(--color-text-muted)]">
        Loading Property Details…
      </div>
    );
  }

  if (!propertyId || !listing || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-transparent text-[var(--color-text-muted)]">
        <p>Property Not Found or ID Missing</p>
        <Button onClick={onBack} variant="outline" className="text-xs">
          <ArrowLeft size={14} className="mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const asset = listing.asset || ({} as any);
  const listingAny = listing as any;
  const specResolver = getSpecResolver(listing.category);

  const ownerObj: any =
    (typeof listing.owner === 'object' && listing.owner !== null ? listing.owner : null) ||
    (typeof (listing as any).seller === 'object' && (listing as any).seller !== null ? (listing as any).seller : null) ||
    (typeof listingAny?.agent === 'object' && listingAny?.agent !== null ? listingAny.agent : null) ||
    (typeof listing.assigned_agent === 'object' && listing.assigned_agent !== null ? listing.assigned_agent : null) ||
    {};

  const owner = {
    full_name: ownerObj.full_name || ownerObj.name || listing.owner_name || listing.seller_name || '',
    email: ownerObj.email || listingAny?.owner_email || listingAny?.seller_email || '',
    phone: ownerObj.phone || ownerObj.phone_number || listing.owner_phone || listing.seller_phone || '',
    id_number: ownerObj.id_number || listingAny?.owner_id_number || '',
    bio: ownerObj.bio || listingAny?.owner_bio || '',
    is_verified: !!(ownerObj.is_verified ?? listingAny?.owner_verified ?? listingAny?.is_seller_verified),
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--color-text-main)] p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 min-w-0">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="ghost"
              className="p-2 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] cursor-pointer shrink-0"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-[var(--color-text-main)] truncate">{listing.title}</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/20 text-[10px] font-bold uppercase">
                  {listing.status}
                </span>
                {listing.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border"
                    style={{ borderColor: 'rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.12)', color: '#b48a1f' }}>
                    <Crown size={10} /> Featured
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-dim)] font-mono truncate">
                Property ID: {listing.id} · {listing.category} · {listing.purpose === 'rent' ? 'For Rent' : 'For Sale'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer"
              onClick={() => {
                if (confirm('Delete this property? This cannot be undone.')) deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={14} className="mr-2" />
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Property'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* ============== MAIN COLUMN ============== */}
      <div className="lg:col-span-2 space-y-6">

        {/* ============== 1. GENERAL LISTING INFO ============== */}
        <AdminEditableSection
          title="General Listing Information"
          icon={Building2}
          data={{
            title: listing.title || '',
            price: listing.price ?? '',
            currency: listing.currency || 'RWF',
            status: listing.status || 'draft',
            purpose: listing.purpose || 'sale',
            category: listing.category || 'house',
            address: listing.address || '',
            rental_frequency: listing.rental_frequency || '',
            security_deposit: listing.security_deposit ?? '',
            negotiable: !!listing.negotiable,
            is_featured: !!listing.is_featured,
            listed_by_role: listing.listed_by_role || 'seller',
            views_count: listing.views_count ?? 0,
            slug: listing.slug || '',
          }}
          onSave={async (d) => {
            const payload: any = { ...d };
            if (payload.views_count !== undefined) payload.views_count = Number(payload.views_count) || 0;
            if (payload.security_deposit === '' || payload.security_deposit === null) {
              payload.security_deposit = null;
            } else if (payload.security_deposit !== undefined) {
              payload.security_deposit = Number(payload.security_deposit);
            }
            await listingMutation.mutateAsync(payload);
          }}
        >
          {(isEditing, data, setData) => (
            <div className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className={labelCls}>Property Title</label>
                    <input
                      value={data.title}
                      onChange={(e) => setData({ ...data, title: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Price</label>
                    <input
                      type="number"
                      value={data.price as any}
                      onChange={(e) => setData({ ...data, price: e.target.value === '' ? '' : Number(e.target.value) } as any)}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Currency</label>
                    <select
                      value={data.currency}
                      onChange={(e) => setData({ ...data, currency: e.target.value })}
                      className={selectCls}
                    >
                      {CURRENCY_OPTIONS.map((o) => <option key={o.value} value={o.value} className={optionCls}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Purpose</label>
                    <select
                      value={data.purpose}
                      onChange={(e) => setData({ ...data, purpose: e.target.value })}
                      className={selectCls}
                    >
                      {PURPOSE_OPTIONS.map((o) => <option key={o.value} value={o.value} className={optionCls}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Category</label>
                    <select
                      value={data.category}
                      onChange={(e) => setData({ ...data, category: e.target.value })}
                      className={selectCls}
                    >
                      {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value} className={optionCls}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Status</label>
                    <select
                      value={data.status}
                      onChange={(e) => setData({ ...data, status: e.target.value })}
                      className={selectCls}
                    >
                      {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value} className={optionCls}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Listed By</label>
                    <select
                      value={data.listed_by_role}
                      onChange={(e) => setData({ ...data, listed_by_role: e.target.value })}
                      className={selectCls}
                    >
                      {LISTED_BY_OPTIONS.map((o) => <option key={o.value} value={o.value} className={optionCls}>{o.label}</option>)}
                    </select>
                  </div>
                  {data.purpose === 'rent' && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Rental Frequency</label>
                        <select
                          value={data.rental_frequency}
                          onChange={(e) => setData({ ...data, rental_frequency: e.target.value })}
                          className={selectCls}
                        >
                          {RENTAL_FREQ_OPTIONS.map((o) => <option key={o.value} value={o.value} className={optionCls}>{o.label}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Security Deposit</label>
                        <input
                          type="number"
                          value={data.security_deposit}
                          onChange={(e) => setData({ ...data, security_deposit: e.target.value === '' ? '' : Number(e.target.value) })}
                          className={inputCls}
                          placeholder="e.g. 500000"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Views Count (override)</label>
                    <input
                      type="number"
                      value={data.views_count}
                      onChange={(e) => setData({ ...data, views_count: Number(e.target.value) || 0 })}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Slug (URL)</label>
                    <input
                      value={data.slug}
                      onChange={(e) => setData({ ...data, slug: e.target.value })}
                      className={inputCls}
                      placeholder="auto-generated if left blank"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-main)]">Price Negotiable</p>
                      <p className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wider mt-0.5">Show "Negotiable" on listing</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, negotiable: !data.negotiable })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors focus:outline-none ${data.negotiable ? 'bg-emerald-500' : 'bg-[var(--color-border)]'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${data.negotiable ? 'translate-x-5' : 'translate-x-0.5'} mt-[1px]`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-main)] inline-flex items-center gap-1">
                        <Star size={12} className="text-[#d4af37]" /> Featured Listing
                      </p>
                      <p className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wider mt-0.5">Pin to featured section &amp; home</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, is_featured: !data.is_featured })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors focus:outline-none ${data.is_featured ? 'bg-emerald-500' : 'bg-[var(--color-border)]'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${data.is_featured ? 'translate-x-5' : 'translate-x-0.5'} mt-[1px]`} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className={labelCls}>Full Address</label>
                    <input
                      value={data.address}
                      onChange={(e) => setData({ ...data, address: e.target.value })}
                      className={inputCls}
                      placeholder="Street / plot reference"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Title</span>
                    <span className="text-sm font-medium text-[var(--color-text-main)]">{listing.title}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Price</span>
                    <span className="text-sm font-mono text-[var(--color-brand-emerald)] font-bold">
                      {Number(listing.price).toLocaleString()} {listing.currency}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Purpose / Category</span>
                    <span className="text-sm text-[var(--color-text-main)] capitalize">
                      {listing.purpose} · {listing.category}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Status</span>
                    <span className="text-sm text-[var(--color-text-main)] capitalize">{listing.status}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Listed By</span>
                    <span className="text-sm text-[var(--color-text-main)] capitalize">{listing.listed_by_role || 'seller'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Views</span>
                    <span className="text-sm font-mono text-[var(--color-text-main)]">{listing.views_count ?? 0}</span>
                  </div>
                  {listing.purpose === 'rent' && (
                    <>
                      <div className="flex flex-col gap-1">
                        <span className={labelCls}>Rent Frequency</span>
                        <span className="text-sm text-[var(--color-text-main)]">{listing.rental_frequency || '—'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className={labelCls}>Security Deposit</span>
                        <span className="text-sm font-mono text-[var(--color-text-main)]">
                          {listing.security_deposit !== undefined && listing.security_deposit !== null
                            ? Number(listing.security_deposit).toLocaleString()
                            : '—'}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Negotiable</span>
                    <span className={`text-sm font-bold ${listing.negotiable ? 'text-[var(--color-brand-emerald)]' : 'text-[var(--color-text-dim)]'}`}>
                      {listing.negotiable ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Featured</span>
                    <span className={`text-sm font-bold inline-flex items-center gap-1 ${listing.is_featured ? 'text-[#b48a1f]' : 'text-[var(--color-text-dim)]'}`}>
                      <Star size={12} /> {listing.is_featured ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-3">
                    <span className={labelCls}>Full Address</span>
                    <span className="text-sm text-[var(--color-text-muted)]">{listing.address || '—'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </AdminEditableSection>

      {/* ============== 2. LOCATION, GEO & PARCEL ============== */}
      <AdminEditableSection
        title="Location, Geo &amp; Parcel"
        icon={MapPin}
        data={{
          province: asset.province || '',
          district: asset.district || '',
          sector: asset.sector || '',
          cell: asset.cell || '',
          village: asset.village || '',
          total_area: asset.total_area ?? '',
          latitude: asset.latitude ?? '',
          longitude: asset.longitude ?? '',
          asset_name: asset.name || '',
          asset_type: asset.asset_type || '',
        }}
        onSave={async (d) => {
          const payload: any = { ...d };
          if (payload.total_area !== undefined && payload.total_area !== '') {
            payload.total_area = Number(payload.total_area);
          } else {
            payload.total_area = null;
          }
          if (payload.latitude !== undefined && payload.latitude !== '') {
            payload.latitude = Number(payload.latitude);
          } else {
            payload.latitude = null;
          }
          if (payload.longitude !== undefined && payload.longitude !== '') {
            payload.longitude = Number(payload.longitude);
          } else {
            payload.longitude = null;
          }
          await assetMutation.mutateAsync(payload);
        }}
      >
        {(isEditing, data, setData) => (
          <div className="space-y-4">
            {isEditing ? (
              <AdminLocationEditor data={data} setData={setData} />
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                  <div className="flex flex-col gap-1 sm:col-span-3">
                    <span className={labelCls}>Asset Name</span>
                    <span className="text-sm font-medium text-[var(--color-text-main)]">{asset.name || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Asset Type</span>
                    <span className="text-sm text-[var(--color-text-main)] capitalize">{asset.asset_type || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Province</span>
                    <span className="text-sm text-[var(--color-text-muted)]">{asset.province || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>District</span>
                    <span className="text-sm text-[var(--color-text-muted)]">{asset.district || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Sector</span>
                    <span className="text-sm text-[var(--color-text-muted)]">{asset.sector || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Cell</span>
                    <span className="text-sm text-[var(--color-text-muted)]">{asset.cell || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Village</span>
                    <span className="text-sm text-[var(--color-text-muted)]">{asset.village || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Total Area (SQM)</span>
                    <span className="text-sm font-mono text-[var(--color-text-main)]">{asset.total_area ? `${Number(asset.total_area).toLocaleString()} m²` : '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Latitude</span>
                    <span className="text-sm font-mono text-[var(--color-text-main)]">{asset.latitude ?? '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Longitude</span>
                    <span className="text-sm font-mono text-[var(--color-text-main)]">{asset.longitude ?? '—'}</span>
                  </div>
                </div>

                {/* Map Preview in View Mode */}
                <div className="rounded-xl overflow-hidden border border-[var(--color-border)] h-64 w-full relative shadow-sm">
                  {(() => {
                    const lat = parseFloat(String(asset.latitude));
                    const lng = parseFloat(String(asset.longitude));
                    const hasExplicit = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
                    const fallback = getLocationCoordinates(asset.province, asset.district, asset.sector);
                    const viewCenter: [number, number] = hasExplicit ? [lat, lng] : fallback;
                    return (
                      <MapContainer
                        key={`${viewCenter[0]}-${viewCenter[1]}`}
                        center={viewCenter}
                        zoom={hasExplicit ? 15 : 12}
                        scrollWheelZoom={false}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={viewCenter} icon={defaultIcon} />
                      </MapContainer>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminEditableSection>

      {/* ============== 3. TECHNICAL SPECIFICATIONS ============== */}
      <AdminEditableSection
        title="Technical Specifications"
        icon={Zap}
        data={specResolver ? (listing.asset as any)?.[specResolver.key] || {} : {}}
        onSave={async (newSpecData) => {
          if (!specResolver) return;
          await specMutation.mutateAsync({ [specResolver.key]: newSpecData });
        }}
      >
        {(isEditing, data, setData) => {
          if (!specResolver) {
            return (
              <div className="text-xs text-[var(--color-text-dim)] text-center py-4 italic">
                No specific specification form for this listing category ({listing.category}).
              </div>
            );
          }
          const SpecForm = specResolver.Form;
          return (
            <div className="space-y-4">
              {isEditing ? (
                <div className="bg-[var(--color-bg-elevated)] p-4 rounded-xl border border-[var(--color-border)]">
                  <SpecForm
                    data={data}
                    isEditing={isEditing}
                    onChange={(name: string, val: any) => setData({ ...data, [name]: val })}
                  />
                </div>
              ) : (
                <div className="space-y-5">
                  {Object.keys(data).length === 0 ? (
                    <p className="text-xs italic text-[var(--color-text-dim)] text-center py-4">
                      No specification data yet — click edit to add.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4">
                      {Object.entries(data).map(([key, val]) => {
                        if (typeof val === 'object' && val !== null) return null;
                        if (key === 'id' || key === 'asset') return null;
                        return (
                          <div key={key} className="flex flex-col gap-1">
                            <span className={labelCls}>{key.replace(/_/g, ' ')}</span>
                            <span className="text-sm font-mono text-[var(--color-text-muted)]">
                              {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : (val === null || val === undefined || val === '' ? '—' : String(val))}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }}
      </AdminEditableSection>

      {/* ============== 4. AMENITIES CHECKLIST ============== */}
      <AdminEditableSection
        title="Amenities &amp; Feature Toggles"
        icon={Sparkles}
        data={(() => {
          const merged: Record<string, boolean> = {};
          const flatSources = [
            listing,
            asset,
            listing.asset?.residential_spec,
            listing.asset?.land_spec,
            listing.asset?.vehicle_spec,
            listing.asset?.commercial_spec,
            listing.asset?.hotel_spec,
          ].filter(Boolean) as any[];
          AMENITY_OPTIONS.forEach(({ key }) => {
            for (const s of flatSources) {
              if (s && (key in s)) { merged[key] = !!s[key]; break; }
            }
          });
          return merged;
        })()}
        onSave={async (merged) => {
          const buckets: Record<string, any> = {};
          const assetUpdates: any = {};
          const listingUpdates: any = {};
          Object.entries(merged).forEach(([k, v]) => {
            if (k.startsWith('has_') || k.startsWith('includes_')) {
              // Try to figure out which spec bucket it belongs to
              const meta = AMENITY_OPTIONS.find((a) => a.key === k);
              if (!meta) return;
              const g = meta.group.toLowerCase();
              if (g.startsWith('vehicle')) {
                buckets.vehicle_spec = { ...(buckets.vehicle_spec || {}), [k]: v };
              } else if (g.startsWith('hotel')) {
                buckets.hotel_spec = { ...(buckets.hotel_spec || {}), [k]: v };
              } else if (g.startsWith('commercial')) {
                buckets.commercial_spec = { ...(buckets.commercial_spec || {}), [k]: v };
              } else {
                buckets.residential_spec = { ...(buckets.residential_spec || {}), [k]: v };
              }
            } else {
              assetUpdates[k] = v;
            }
          });
          if (Object.keys(listingUpdates).length) await listingMutation.mutateAsync(listingUpdates);
          if (Object.keys(assetUpdates).length || Object.keys(buckets).length) {
            const payload: any = { ...assetUpdates, ...buckets };
            await assetMutation.mutateAsync(payload);
          }
        }}
      >
        {(isEditing, data, setData) => {
          const groups = Array.from(new Set(AMENITY_OPTIONS.map((a) => a.group)));
          return (
            <div className="space-y-5">
              {groups.map((g) => {
                const rows = AMENITY_OPTIONS.filter((a) => a.group === g);
                return (
                  <div key={g}>
                    <p className="text-[10px] uppercase font-bold tracking-[0.12em] text-[var(--color-text-dim)] mb-2.5">{g}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {rows.map((a) => {
                        const on = !!data[a.key];
                        return (
                          <div
                            key={a.key}
                            onClick={() => {
                              if (!isEditing) return;
                              setData({ ...data, [a.key]: !on });
                            }}
                            className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition ${
                              on
                                ? 'border-emerald-400/40 bg-emerald-500/8 dark:bg-emerald-500/10'
                                : 'border-[var(--color-border)] bg-[var(--color-bg-elevated)]'
                            } ${isEditing ? 'cursor-pointer' : ''}`}
                          >
                            <span className={`text-xs font-semibold ${on ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-muted)]'}`}>
                              {a.label}
                            </span>
                            <button
                              type="button"
                              disabled={!isEditing}
                              onClick={(e) => { e.stopPropagation(); if (isEditing) setData({ ...data, [a.key]: !on }); }}
                              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border border-transparent transition-colors ${on ? 'bg-emerald-500' : 'bg-[var(--color-border)]'} ${isEditing ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${on ? 'translate-x-[18px]' : 'translate-x-0.5'} mt-[2px]`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }}
      </AdminEditableSection>

      {/* ============== 5. MEDIA ============== */}
      <AdminEditableSection
        title="Media Assets"
        icon={Layers}
        data={listing.media || []}
        onSave={async () => {
          // Media management handles its own mutations
        }}
      >
        {(_, media) => (
          <AdminMediaManager listingId={propertyId} media={(media as any[]) || []} />
        )}
      </AdminEditableSection>

      {/* ============== 6. DESCRIPTION ============== */}
      <AdminEditableSection
        title="Property Description"
        icon={FileText}
        data={{ description: listing.description || '' }}
        onSave={async (newData) => {
          await listingMutation.mutateAsync({ description: newData.description });
        }}
      >
        {(isEditing, data, setData) => (
          <div className="space-y-4">
            {isEditing ? (
              <textarea
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                className="w-full h-40 p-3 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50 resize-y"
                placeholder="Detailed property description..."
              />
            ) : (
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)] whitespace-pre-line">
                {listing.description || <em className="text-[var(--color-text-dim)]">No description provided.</em>}
              </p>
            )}
          </div>
        )}
      </AdminEditableSection>

      {/* ============== 7. LEGAL & VERIFICATION ============== */}
      <AdminEditableSection
        title="Legal &amp; Verification"
        icon={ShieldCheck}
        data={{
          verification_level: listing.verification_level || 'none',
          upi_number: asset.upi_number || (listing.asset?.land_spec?.upi_number) || '',
          title_deed_number: asset.title_deed_number || (listing.asset?.land_spec?.title_deed_number) || '',
        }}
        onSave={async (newData) => {
          await listingMutation.mutateAsync(newData);
        }}
      >
        {(isEditing, data, setData) => (
          <div className="space-y-4">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Verification Level</label>
                  <select
                    value={data.verification_level}
                    onChange={(e) => setData({ ...data, verification_level: e.target.value })}
                    className={selectCls}
                  >
                    {VERIF_OPTIONS.map((o) => <option key={o.value} value={o.value} className={optionCls}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>UPI Number (Land)</label>
                  <input
                    value={data.upi_number}
                    onChange={(e) => setData({ ...data, upi_number: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Title Deed #</label>
                  <input
                    value={data.title_deed_number}
                    onChange={(e) => setData({ ...data, title_deed_number: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                <div className="flex flex-col gap-1">
                  <span className={labelCls}>Verification Level</span>
                  <span className="text-sm font-bold text-[var(--color-brand-emerald)] capitalize">{listing.verification_level}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={labelCls}>UPI Number</span>
                  <span className="text-sm font-mono text-[var(--color-text-muted)]">
                    {asset.upi_number || listing.asset?.land_spec?.upi_number || '—'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={labelCls}>Title Deed #</span>
                  <span className="text-sm font-mono text-[var(--color-text-muted)]">
                    {asset.title_deed_number || listing.asset?.land_spec?.title_deed_number || '—'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminEditableSection>

      {/* ============== 8. DATES (read-only info) ============== */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-depth-1)] opacity-90">
        <div className="flex items-center gap-2 mb-3">
          <Settings2 size={16} className="text-[var(--color-text-dim)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-dim)]">System Metadata</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase text-[var(--color-text-dim)]">Date Listed</span>
            <span className="font-mono text-[var(--color-text-muted)]">{listing.date_listed || listing.created_at || '—'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase text-[var(--color-text-dim)]">Date Updated</span>
            <span className="font-mono text-[var(--color-text-muted)]">{listing.date_updated || listing.updated_at || '—'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase text-[var(--color-text-dim)]">Slug</span>
            <span className="font-mono break-all text-[var(--color-text-muted)]">{listing.slug || '—'}</span>
          </div>
        </div>
      </div>
      </div>

      {/* ============== SIDEBAR ============== */}
      <div className="space-y-6">
        {/* ============== S1. OWNER / AGENT ============== */}
      <AdminEditableSection
        title="Owner / Agent"
        icon={User}
        data={{
          full_name: owner.full_name || owner.name || '',
          email: owner.email || '',
          phone: owner.phone || owner.phone_number || '',
          id_number: owner.id_number || '',
          bio: owner.bio || '',
          is_verified: !!owner.is_verified,
        }}
        onSave={async (d) => {
          const payload: any = {};
          if (d.full_name !== undefined) payload.owner_name = d.full_name;
          if (d.email !== undefined) payload.owner_email = d.email;
          if (d.phone !== undefined) payload.owner_phone = d.phone;
          if (d.id_number !== undefined) payload.owner_id_number = d.id_number;
          if (d.bio !== undefined) payload.owner_bio = d.bio;
          if (d.is_verified !== undefined) payload.owner_verified = d.is_verified;
          await ownerMutation.mutateAsync(payload);
        }}
      >
        {(isEditing, data, setData) => (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
              <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                {data.full_name ? String(data.full_name)[0].toUpperCase() : 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[var(--color-text-main)] truncate">{data.full_name || 'No agent assigned'}</p>
                <p className="text-[10px] text-[var(--color-text-dim)] uppercase font-bold">Primary Contact</p>
              </div>
              {data.is_verified && (
                <ShieldCheck size={14} className="text-[var(--color-brand-emerald)] shrink-0" />
              )}
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Full Name</label>
                  <input value={data.full_name} onChange={(e) => setData({ ...data, full_name: e.target.value })} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`${labelCls} inline-flex items-center gap-1`}>
                    <Mail size={10} /> Email
                  </label>
                  <input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`${labelCls} inline-flex items-center gap-1`}>
                    <Phone size={10} /> Phone
                  </label>
                  <input value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>ID / Passport #</label>
                  <input value={data.id_number} onChange={(e) => setData({ ...data, id_number: e.target.value })} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Bio / Notes</label>
                  <textarea
                    value={data.bio}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    rows={3}
                    className={`${inputCls} resize-y`}
                  />
                </div>
                <div className="flex items-center justify-between gap-4 px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                  <p className="text-xs font-bold text-[var(--color-text-main)]">Verified</p>
                  <button
                    type="button"
                    onClick={() => setData({ ...data, is_verified: !data.is_verified })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors ${data.is_verified ? 'bg-emerald-500' : 'bg-[var(--color-border)]'}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${data.is_verified ? 'translate-x-[18px]' : 'translate-x-0.5'} mt-[2px]`} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Mail size={12} className="text-[var(--color-text-dim)] shrink-0" />
                  <span className="truncate">{data.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Phone size={12} className="text-[var(--color-text-dim)] shrink-0" />
                  <span>{data.phone || '—'}</span>
                </div>
                {data.id_number && (
                  <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                    <Pencil size={12} className="text-[var(--color-text-dim)] shrink-0" />
                    <span className="font-mono">{data.id_number}</span>
                  </div>
                )}
                {data.bio && (
                  <p className="text-[var(--color-text-dim)] leading-relaxed pt-2 border-t border-[var(--color-border)]">{data.bio}</p>
                )}
              </div>
            )}
            {!isEditing && (
              <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-[0.12em] text-[var(--color-text-dim)]">Change Assigned Agent</p>
                <Button
                  variant="ghost"
                  className="w-full py-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-brand-emerald)] border border-[var(--color-border)] rounded-xl cursor-pointer"
                  onClick={() => {
                    const newOwnerId = prompt('Enter new Owner/Seller User ID or SellerProfile ID:');
                    if (newOwnerId) {
                      ownerMutation.mutate({ seller_id: newOwnerId, owner_id: newOwnerId });
                    }
                  }}
                >
                  <Pencil size={12} className="mr-2" /> Reassign
                </Button>
              </div>
            )}
          </div>
        )}
      </AdminEditableSection>

      {/* ============== S2. INQUIRIES & LEADS ============== */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 space-y-4 shadow-[var(--shadow-depth-1)]">
        <div className="flex items-center gap-2 mb-1">
          <ListChecks size={18} className="text-[var(--color-brand-emerald)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Inquiries &amp; Activity</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center">
            <p className="text-[10px] text-[var(--color-text-dim)] uppercase font-bold">Inquiries</p>
            <p className="text-lg font-mono font-bold text-[var(--color-text-main)]">{listing.inquiries_count || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center">
            <p className="text-[10px] text-[var(--color-text-dim)] uppercase font-bold">Visits Booked</p>
            <p className="text-lg font-mono font-bold text-[var(--color-text-main)]">{listing.visits_count || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center col-span-2">
            <p className="text-[10px] text-[var(--color-text-dim)] uppercase font-bold">Engagement (visits / inquiries)</p>
            <p className="text-lg font-mono font-bold text-[var(--color-brand-emerald)]">
              {listing.inquiries_count && listing.visits_count
                ? (((listing.visits_count as number) / (listing.inquiries_count as number)) * 100).toFixed(1) + '%'
                : '0.0%'}
            </p>
          </div>
        </div>
        {(listing.verification_history && (listing.verification_history as any[]).length > 0) && (
          <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-[var(--color-brand-emerald)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Verification Timeline</span>
            </div>
            {(listing.verification_history as any[]).map((event: any, idx: number) => (
              <div key={idx} className="flex gap-3 text-xs">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1" />
                  {idx !== (listing.verification_history as any[]).length - 1 && (
                    <div className="w-px flex-1 bg-[var(--color-border)]" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="font-bold text-[var(--color-text-muted)] capitalize">{event.status}</p>
                  <p className="text-[var(--color-text-dim)] font-mono text-[10px]">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============== S3. ADMIN NOTES ============== */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 space-y-4 shadow-[var(--shadow-depth-1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[var(--color-brand-emerald)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Internal Admin Notes</h3>
          </div>
          {listingAny.admin_notes && (
            <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
              {(String(listingAny.admin_notes).length)} chars
            </span>
          )}
        </div>
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          className="w-full h-32 p-3 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] outline-none focus:border-emerald-500/50 resize-y"
          placeholder="Add internal administrative notes here…"
        />
        <Button
          variant="ghost"
          className="w-full py-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-brand-emerald)] border border-[var(--color-border)] rounded-xl cursor-pointer flex items-center justify-center gap-2"
          onClick={() => saveNoteMutation.mutate(adminNote)}
          disabled={saveNoteMutation.isPending}
        >
          {saveNoteMutation.isPending ? 'Saving…' : <><Save size={14} /> Save Internal Note</>}
        </Button>
      </div>

      {/* ============== S4. QUICK ALERTS ============== */}
      {(listing.status === 'under_review' || listing.status === 'submitted') && (
        <div className="rounded-2xl border border-amber-300/50 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertCircle size={16} />
            <p className="text-xs font-bold uppercase tracking-wider">Pending Review</p>
          </div>
          <p className="text-xs text-amber-700/90 dark:text-amber-300/90 leading-relaxed">
            This listing was submitted by the owner and is waiting for verification before it can be published.
          </p>
        </div>
      )}
      </div>
      </div>
    </div>
  );
};

export default AdminPropertyDetail;
