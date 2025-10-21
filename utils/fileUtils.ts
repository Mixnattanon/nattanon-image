export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // The API needs just the base64 data, not the data URL prefix
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const dataUrlToParts = (dataUrl: string): { base64Data: string; mimeType: string } | null => {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match || match.length < 3) return null;
    return { mimeType: match[1], base64Data: match[2] };
};
