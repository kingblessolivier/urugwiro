import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { api } from '../../../api/endpoints';

interface Listing {
    id: string;
    title: string;
    asset: {
        latitude: string;
        longitude: string;
    };
}

interface DiscoveryMapProps {
    listings: Listing[];
}

const DiscoveryMap: React.FC<DiscoveryMapProps> = ({ listings }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await api.settings.get();
                const settings = response.data;
                const mapboxSetting = settings.find((s: any) => s.key === 'MAPBOX_ACCESS_TOKEN');
                if (mapboxSetting) {
                    setToken(mapboxSetting.value);
                }
            } catch (error) {
                console.error('Failed to fetch Mapbox token:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, []);

    useEffect(() => {
        if (!mapContainerRef.current || !token) return;

        mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/dark-v11', // Luxury Black Edition style
            center: [30.0619, -1.9403], // Centered on Kigali
            zoom: 11,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        mapRef.current = map;

        listings.forEach(listing => {
            const lng = parseFloat(listing.asset.longitude);
            const lat = parseFloat(listing.asset.latitude);

            if (!isNaN(lng) && !isNaN(lat)) {
                new mapboxgl.Marker({ color: '#10B981' }) // Emerald Luxury Edition
                    .setLngLat([lng, lat])
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
                        <div style="background: #080b11; color: #ffffff; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); font-family: sans-serif;">
                            <h3 style="font-weight: 700; font-size: 13px; margin: 0 0 6px 0; color: #ffffff;">${listing.title}</h3>
                            <span style="display: inline-block; font-size: 11px; color: #10B981; font-weight: 600; text-decoration: none;">Selected Asset Pin</span>
                        </div>
                    `))
                    .addTo(map);
            }
        });

        return () => map.remove();
    }, [token, listings]);

    if (loading) {
        return <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500">Loading Map Engine...</div>;
    }

    if (!token) {
        return (
            <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold text-zinc-400 mb-2">Map Access Token Missing</h3>
                <p className="text-sm max-w-md">Please add MAPBOX_ACCESS_TOKEN to the system settings in the Admin Command Center to enable the spatial discovery engine.</p>
            </div>
        );
    }

    return (
        <div ref={mapContainerRef} className="w-full h-full relative">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20">
                    GIS Spatial Intelligence
                </span>
            </div>
        </div>
    );
};

export default DiscoveryMap;
