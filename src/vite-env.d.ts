/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_DRIVE_API_KEY: string
  readonly VITE_GOOGLE_DRIVE_FOLDER_ID: string
  // tambahkan variabel env lainnya di sini jika ada
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'react-pageflip';
