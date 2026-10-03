import React, { useState } from 'react';
import { Upload, Trash2, Image as ImageIcon, Film, Box } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/endpoints';
import { resolveImageUrl } from '../../../lib/imageUrl';
import { uploadMediaToCloudinary } from '../../../lib/cloudinary';

interface ListingMedia {
  id?: string | number;
  url?: string;
  file?: string;
  media_type?: 'image' | 'video' | '360' | '3d' | 'model_3d' | 'cadastral_sketch' | 'floor_plan' | string;
  category?: string;
  caption?: string;
  room_name?: string;
  order?: number;
}

interface SellerMediaManagerProps {
  listingId: string | number;
  media: ListingMedia[];
  onRefresh?: () => void;
}

export const SellerMediaManager: React.FC<SellerMediaManagerProps> = ({ listingId, media, onRefresh }) => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['seller-listing-detail', String(listingId)] });
    queryClient.invalidateQueries({ queryKey: ['seller-database-listings'] });
    onRefresh?.();
  };

  const uploadMutation = useMutation({
    mutationFn: async (data: { url: string; media_type: 'image' | 'video' }) => api.seller.uploadMedia(listingId, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (mediaId: string | number) => api.seller.deleteMedia(mediaId),
    onSuccess: invalidate,
    onError: (err: any) => alert(`Delete failed: ${err?.response?.data?.error || err.message}`),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const uploaded = await uploadMediaToCloudinary(e.target.files[0]);
      await uploadMutation.mutateAsync({ url: uploaded.url, media_type: uploaded.mediaType });
    } catch (error: any) {
      alert(`Upload failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const getMediaTypeIcon = (type: ListingMedia['media_type']) => {
    switch (type) {
      case 'video': return <Film size={14} />;
      case '360':
      case 'model_3d': return <Box size={14} />;
      default: return <ImageIcon size={14} />;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[var(--color-text-muted)]">
          {media.length} {media.length === 1 ? 'asset' : 'assets'} · photos, tours and cadastral sketches
        </p>
        <label className="cursor-pointer">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] text-xs font-bold transition-colors shadow-[var(--shadow-emerald-soft)]">
            <Upload size={14} /> {isUploading ? 'Uploading...' : 'Upload Media'}
          </div>
          <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
        </label>
      </div>

      {media.length === 0 ? (
        <div className="aspect-video rounded-2xl border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center text-[var(--color-text-dim)] space-y-2 bg-[var(--color-bg-elevated)]">
          <ImageIcon size={36} className="opacity-30" />
          <p className="text-[11px] uppercase font-bold tracking-widest">No media uploaded</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((item, index) => (
            <div key={item.id} className="group relative aspect-square rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-hidden">
              {item.media_type === 'video' ? (
                <video
                  src={resolveImageUrl(item.url || item.file) || ''}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  muted
                  preload="metadata"
                />
              ) : (
                <img
                  src={resolveImageUrl(item.url || item.file) || ''}
                  alt={item.caption || `Media ${index + 1}`}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              )}
              <div className="absolute top-2 left-2 p-1 rounded-md bg-black/60 backdrop-blur-md text-[#fff]">
                {getMediaTypeIcon(item.media_type)}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { if (confirm('Delete this media asset?') && item.id !== undefined) deleteMutation.mutate(item.id); }}
                    className="p-1.5 rounded-md bg-red-500/20 text-red-300 hover:bg-red-600 hover:text-[#fff] transition-colors"
                    title="Delete media"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#e4e4e7] bg-black/50 backdrop-blur-sm px-1.5 py-1 rounded-md w-fit">
                  <span className="uppercase">{item.media_type}</span>
                  <span className="text-[#71717a]">|</span>
                  <span>#{index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerMediaManager;
