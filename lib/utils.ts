import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertDriveLink(url: string) {
  if (url.includes('drive.google.com') && url.includes('/d/')) {
    try {
      const id = url.split('/d/')[1].split('/')[0];
      return `https://drive.google.com/uc?export=view&id=${id}`;
    } catch (e) {
      return url;
    }
  }
  return url;
}
