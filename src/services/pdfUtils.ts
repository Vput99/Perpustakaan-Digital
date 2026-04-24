// Ambil API Key dan Folder ID dari environment variables Vite (.env) atau process.env untuk testing
export const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

export const getPdfUrl = (driveId: string) => {
  const apiKey = getEnv('VITE_GOOGLE_DRIVE_API_KEY');
  return `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&key=${apiKey}`;
};
