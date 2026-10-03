import { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { logError } from '../lib/utils';
import { readGuestSavedListingIds, writeGuestSavedListingIds } from '../lib/savedListings';

interface SaveableListing {
  id: string | number;
  is_liked?: boolean;
}

export function useSavedListings(visibleListings: SaveableListing[] = []) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [guestSavedIds, setGuestSavedIds] = useState(readGuestSavedListingIds);
  const [accountOverrides, setAccountOverrides] = useState<Record<string, boolean>>({});
  const pendingIds = useRef(new Set<string>());

  const savedPropertiesQuery = useQuery({
    queryKey: ['consumer-saved-properties'],
    queryFn: async () => {
      const response = await api.consumer.savedProperties({ page_size: 100 });
      return Array.isArray(response.data) ? response.data : response.data?.results || [];
    },
    enabled: Boolean(user),
  });

  const accountSavedIds = useMemo(() => {
    const source = savedPropertiesQuery.data;
    const ids = source
      ? source.map((item: any) => String(item.id || item.listing?.id || item.listing)).filter(Boolean)
      : visibleListings.filter((listing) => listing.is_liked).map((listing) => String(listing.id));
    const next = new Set(ids);
    Object.entries(accountOverrides).forEach(([id, saved]) => {
      if (saved) next.add(id);
      else next.delete(id);
    });
    return next;
  }, [accountOverrides, savedPropertiesQuery.data, visibleListings]);

  const savedIds = user ? accountSavedIds : guestSavedIds;

  const toggleSaved = async (rawId: string | number) => {
    const id = String(rawId);
    if (!user) {
      setGuestSavedIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        writeGuestSavedListingIds(next);
        return next;
      });
      return;
    }

    if (pendingIds.current.has(id)) return;
    pendingIds.current.add(id);
    const nextSaved = !savedIds.has(id);
    setAccountOverrides((current) => ({ ...current, [id]: nextSaved }));

    try {
      const response = await api.listings.like(id);
      setAccountOverrides((current) => ({ ...current, [id]: response.data.liked }));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['listings'] }),
        queryClient.invalidateQueries({ queryKey: ['consumer-saved-properties'] }),
        queryClient.invalidateQueries({ queryKey: ['consumer-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['listing-detail', id] }),
        queryClient.invalidateQueries({ queryKey: ['homepage-listings'] }),
      ]);
    } catch (error) {
      logError('Failed to update saved listing:', error);
    } finally {
      pendingIds.current.delete(id);
      setAccountOverrides((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }
  };

  return { savedIds, savedPropertiesQuery, toggleSaved };
}
