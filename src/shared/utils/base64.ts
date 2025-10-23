/**
 * blob2base64
 * @param blob
 * @param mimeType
 * @returns
 */
export function blob2base64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64WithDataUrlPrefix = reader.result as string
      const base64 = base64WithDataUrlPrefix.replace('data:', '').replace(/^.+,/, '')

      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}


/**
 * Converts a File object to a Base64 encoded string.
 *
 * @param {File} file - The file to be converted to Base64.
 * @returns {Promise<string | ArrayBuffer | null>} A promise that resolves to the Base64 encoded string, or null if the conversion fails.
 */
export const fileToBase64 = (file: File): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.result) {
        // Convertimos la cadena a string y removemos la parte 'data:image/jpeg;base64,'
        const base64String = (reader.result as string).replace(/^data:image\/[a-z]+;base64,/, '');
        console.log('base64String', base64String);
        resolve(base64String);
      } else {
        resolve(null);
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
