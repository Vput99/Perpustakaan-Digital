import { LibraryItem } from '../types';

// Ambil API Key dan Folder ID dari environment variables Vite (.env)
const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;

export const getPdfUrl = (driveId: string) => {
  return `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&key=${API_KEY}`;
};

// Fungsi pembantu untuk mengambil ID YouTube dari link
const extractYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
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

      const fileNameLower = file.name.toLowerCase();
      const youtubeId = extractYouTubeId(file.name);
      
      if (youtubeId || file.mimeType.includes('video')) {
        category = 'Video';
        type = 'Video';
      } else if (
        fileNameLower.includes('pelajaran') || 
        fileNameLower.includes('kelas') || 
        fileNameLower.includes('kls') || 
        fileNameLower.includes('grade') || 
        fileNameLower.includes('siswa') || 
        fileNameLower.includes('guru') || 
        fileNameLower.includes('kurikulum') ||
        fileNameLower.includes('matematika') ||
        fileNameLower.includes('ipa') ||
        fileNameLower.includes('ips') ||
        fileNameLower.includes('bahasa')
      ) {
        category = 'Buku Pelajaran';
      } else if (
        fileNameLower.includes('cerita') || 
        fileNameLower.includes('dongeng') || 
        fileNameLower.includes('kisah') || 
        fileNameLower.includes('fabel') ||
        fileNameLower.includes('petualangan')
      ) {
        category = 'Buku Cerita';
      }

      const cleanTitle = file.name
        .replace(/https?:\/\/[^\s]+/, "") // Hapus link dari judul
        .replace(/\.[^/.]+$/, "") // Hapus ekstensi
        .trim() || (youtubeId ? "Video YouTube" : file.name);

      return {
        id: file.id,
        title: cleanTitle,
        category,
        type,
        // Gunakan thumbnail YouTube jika terdeteksi sebagai YouTube, jika tidak gunakan dari Drive
        thumbnail: youtubeId 
          ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
          : (file.thumbnailLink ? file.thumbnailLink.replace('s220', 's400') : 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&h=533&auto=format&fit=crop'),
        driveId: youtubeId ? undefined : file.id,
        youtubeUrl: youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : undefined,
      };
    });
  } catch (error) {
    console.error("Failed to fetch drive data:", error);
    return [];
  }
};
