import { LibraryItem } from '../types';

// Ambil API Key dan Folder ID dari environment variables Vite (.env)
const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;

export const getPdfUrl = (driveId: string) => {
  return `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&key=${API_KEY}`;
};

export const fetchDriveData = async (): Promise<LibraryItem[]> => {
  if (!API_KEY || !FOLDER_ID) {
    console.warn("Google Drive API key or Folder ID is missing. Please set VITE_GOOGLE_DRIVE_API_KEY and VITE_GOOGLE_DRIVE_FOLDER_ID in your .env file.");
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,thumbnailLink,webViewLink)&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching from Google Drive: ${response.statusText}`);
    }

    const data = await response.json();

    return data.files.map((file: any) => {
      // Tentukan kategori dan tipe berdasarkan mimeType atau nama file
      let category: LibraryItem['category'] = 'Buku Cerita'; // Default
      let type: LibraryItem['type'] = 'PDF'; // Default

      if (file.mimeType.includes('video')) {
        category = 'Video';
        type = 'Video';
      } else if (file.name.toLowerCase().includes('pelajaran')) {
        category = 'Buku Pelajaran';
      }

      return {
        id: file.id,
        title: file.name.replace(/\.[^/.]+$/, ""), // Hapus ekstensi dari judul
        category,
        type,
        // Gunakan thumbnail dari Drive jika ada, jika tidak gunakan gambar default
        thumbnail: file.thumbnailLink
          ? file.thumbnailLink.replace('s220', 's400') // Memperbesar ukuran thumbnail jika memungkinkan
          : 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&h=533&auto=format&fit=crop',
        driveId: file.id,
      };
    });
  } catch (error) {
    console.error("Failed to fetch drive data:", error);
    return [];
  }
};
