import React, { useState } from 'react';
import { Upload, Trash2, GripVertical, Image as ImageIcon, Film, Box, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../api/endpoints';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ListingMedia {
  id: string;
  file: string;
  media_type: 'image' | 'video' | '360' | 'model_3d' | 'cadastral_sketch';
  category: string;
  caption: string;
  room_name: string;
  order: number;
}

interface AdminMediaManagerProps {
  listingId: string;
  media: ListingMedia[];
}

export const AdminMediaManager: React.FC<AdminMediaManagerProps> = ({ listingId, media }) => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.admin.uploadMedia(listingId, formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-detail', listingId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (mediaId: string) => api.admin.deleteMedia(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-detail', listingId] });
    },
  });

  const updateMediaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => api.admin.updateMedia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-detail', listingId] });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      await uploadMutation.mutateAsync(formData);
    } finally {
      setIsUploading(false);
    }
  };

  const getMediaTypeIcon = (type: ListingMedia['media_type']) => {
    switch (type) {
      case 'image': return <ImageIcon size={14} />;
      case 'video': return <Film size={14} />;
      case '360': return <Box size={14} />;
      case 'model_3d': return <Box size={14} />;
      case 'cadastral_sketch': return <ImageIcon size={14} className="text-emerald-400" />;
      default: return <ImageIcon size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Media Gallery</h3>
        <label className="cursor-pointer">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors">
            <Upload size={14} /> {isUploading ? 'Uploading...' : 'Upload Media'}
          </div>
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {media.map((item, index) => (
          <div key={item.id} className="group relative aspect-square rounded-xl border border-white/10 bg-black overflow-hidden">
            <img
              src={item.file}
              alt={item.caption}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-md cursor-pointer"
                  onClick={() => deleteMutation.mutate(item.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-300 bg-black/50 backdrop-blur-sm p-1.5 rounded-md w-fit">
                {getMediaTypeIcon(item.media_type)}
                <span>{item.media_type}</span>
                <span className="text-zinc-600">|</span>
                <span>#{index + 1}</span>
              </div>
            </div>

            {/* Type Badge */}
            <div className="absolute top-2 left-2 p-1 rounded bg-black/60 backdrop-blur-md text-white">
              {getMediaTypeIcon(item.media_type)}
            </div>
          </div>
        ))}
      </div>

      {media.length === 0 && (
        <div className="aspect-video rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-500 space-y-2">
          <ImageIcon size={40} className="opacity-20" />
          <p className="text-xs uppercase font-bold tracking-widest">No media uploaded</p>
        </div>
      )}
    </div>
  );
};
