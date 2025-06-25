import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1024, useWebWorker: true };
  try {
    return await imageCompression(file, options);
  } catch (err) {
    console.warn('Image compression failed', err);
    return file;
  }
}

export function validateImage(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'ไฟล์ไม่ใช่รูปภาพ';
  if (file.size > 1_048_576) return 'ไฟล์ต้องไม่เกิน 1MB';
  return null;
}
