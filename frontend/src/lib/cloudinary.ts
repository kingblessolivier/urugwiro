export interface CloudinaryUploadResult {
  url: string;
  mediaType: 'image' | 'video';
}

interface CloudinaryResponse {
  secure_url?: string;
  resource_type?: string;
  error?: { message?: string };
}

export async function uploadMediaToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary upload is not configured.');
  }
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    throw new Error('Choose an image or video file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json().catch(() => ({})) as CloudinaryResponse;
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Cloudinary upload failed.');
  }
  if (data.resource_type !== 'image' && data.resource_type !== 'video') {
    throw new Error('Cloudinary returned an unsupported media type.');
  }

  return { url: data.secure_url, mediaType: data.resource_type };
}
