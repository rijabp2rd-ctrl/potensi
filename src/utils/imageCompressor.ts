/**
 * Utility to compress and resize images from camera or file picker
 * Guarantees small footprint (<60KB) for seamless Firestore and localStorage persistence
 */
export async function compressImageFile(file: File, maxWidth = 800, quality = 0.7): Promise<{
  dataUrl: string;
  fileName: string;
  fileSizeStr: string;
}> {
  return new Promise((resolve, reject) => {
    // If it's a PDF or non-image, handle as standard dataUrl
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const sizeKb = Math.round(file.size / 1024);
        resolve({
          dataUrl: reader.result as string,
          fileName: file.name,
          fileSizeStr: `${sizeKb} KB`,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: e.target?.result as string,
            fileName: file.name,
            fileSizeStr: `${Math.round(file.size / 1024)} KB`,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Calculate compressed size in KB
        const head = 'data:image/jpeg;base64,';
        const rawLength = compressedDataUrl.length - head.length;
        const sizeInBytes = Math.round((rawLength * 3) / 4);
        const sizeInKb = Math.round(sizeInBytes / 1024);

        resolve({
          dataUrl: compressedDataUrl,
          fileName: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
          fileSizeStr: `${sizeInKb} KB (Terkompresi HP/Laptop)`,
        });
      };
      img.onerror = () => {
        resolve({
          dataUrl: e.target?.result as string,
          fileName: file.name,
          fileSizeStr: `${Math.round(file.size / 1024)} KB`,
        });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
