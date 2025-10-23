const MAX_WIDTH = 1000;
const MAX_HEIGHT = 1000;
const MIME_TYPE = 'image/jpeg';
const QUALITY = 0.7;

/**
 * compressImage
 * @param file File
 * @param maxWidth number
 * @param maxHeight number
 * @param quality number
 * @param mimeType string
 * @returns Promise<File>
 */
export async function compressImage(
  file: File,
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT,
  quality: number = QUALITY,
  mimeType: string = MIME_TYPE,
): Promise<File> {
  const blobURL = URL.createObjectURL(file);
  const img = new Image();
  img.src = blobURL;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject('Image load failed');
  });
  URL.revokeObjectURL(blobURL);

  const [newWidth, newHeight] = calculateSize(img, maxWidth, maxHeight);
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, mimeType, quality));
  if (!blob) throw new Error('Compression failed');

  return new File([blob], file.name, { type: blob.type });
}

/**
 * calculateSize
 * @param img HTMLImageElement
 * @param maxWidth number
 * @param maxHeight number
 * @returns [number, number]
 */
function calculateSize(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
): [number, number] {
  let { width, height } = img;

  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }
  return [width, height];
}
