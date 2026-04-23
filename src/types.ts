export interface LibraryItem {
  id: string;
  title: string;
  category: 'Buku Pelajaran' | 'Buku Cerita' | 'Video' | 'Numerasi';
  type: 'PDF' | 'Video';
  thumbnail: string;
  driveId?: string;
  youtubeUrl?: string;
}

export type Category = 'Semua' | 'Buku Pelajaran' | 'Buku Cerita' | 'Video' | 'Numerasi';
