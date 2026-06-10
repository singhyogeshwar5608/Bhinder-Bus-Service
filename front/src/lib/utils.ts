import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | any[] | null | undefined, fallbackId?: number | string) {
  let imagePath = path;

  if (typeof imagePath === 'string' && (imagePath.startsWith('[') || imagePath.startsWith('{'))) {
    try {
      const parsed = JSON.parse(imagePath);
      if (Array.isArray(parsed) && parsed.length > 0) {
        imagePath = parsed[0];
      } else if (typeof parsed === 'string') {
        imagePath = parsed;
      }
    } catch (e) {}
  }

  if (Array.isArray(imagePath)) {
    imagePath = imagePath.length > 0 ? imagePath[0] : null;
  }

  if (!imagePath || typeof imagePath !== 'string') {
    return `/bus-${fallbackId || 1}.png`;
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("data:") || imagePath.startsWith("blob:")) {
    return imagePath;
  }

  const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;

  // Derive storage URL from API URL if VITE_STORAGE_URL is not set
  const configuredUrl = import.meta.env.VITE_STORAGE_URL;
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const storageUrl = configuredUrl || (apiUrl ? apiUrl.replace(/\/api\/?$/, '/storage') : "http://localhost:8000/storage");

  return `${storageUrl}/${cleanPath}`;
}
