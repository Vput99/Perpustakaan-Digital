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

// Smart School types
export interface Student {
  id: string;
  name: string;
  full_name: string;
  absen: string;
  class: string;
  nisn: string;
  photo_url: string;
  coins: number;
}

export interface TransactionLog {
  id: string;
  student_id: string;
  amount: number;
  description: string;
  timestamp: string;
}
