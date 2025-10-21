import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import { fileToBase64, fileToDataUrl } from '../utils/fileUtils';
import Spinner from './Spinner';
import ImageUploader from './ImageUploader';

type ClothingOption = 'formal_suit' | 'thai_silk' | 'lace_blouse';
type BackgroundOption = 'sky_blue' | 'soft_gray' | 'warm_brown' | 'studio_gradient';

const clothingOptions: { id: ClothingOption; label: string }[] = [
  { id: 'formal_suit', label: 'ชุดสูททางการ' },
  { id: 'thai_silk', label: 'ชุดผ้าไหมไทย' },
  { id: 'lace_blouse', label: 'เสื้อลูกไม้' },
];

const backgroundOptions: { id: BackgroundOption; label: string }[] = [
  { id: 'sky_blue', label: 'สีฟ้า' },
  { id: 'soft_gray', label: 'สีเทาอ่อน' },
  { id: 'warm_brown', label: 'สีน้ำตาลอบอุ่น' },
  { id: 'studio_gradient', label: 'พื้นหลังสตูดิโอ' },
];


const MemorialPortrait: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; dataUrl: string } | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [clothing, setClothing] = useState<ClothingOption>('formal_suit');
  const [background, setBackground] = useState<BackgroundOption>('sky_blue');


  const handleFileChange = async (file: File | null) => {
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setOriginalImage({ file, dataUrl });
        setProcessedImage(null);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        setError("ไม่สามารถอ่านไฟล์ที่เลือกได้");
        setOriginalImage(null);
      }
    }
  };

  const generateMemorialPrompt = useCallback(() => {
    const clothingDesc = clothingOptions.find(c => c.id === clothing)?.label;
    const backgroundDesc = backgroundOptions.find(b => b.id === background)?.label;

    return `
      สร้างภาพไว้อาลัยสไตล์ภาพติดบัตรความละเอียดสูงจากภาพที่ให้มา
      บุคคลในภาพต้องสวมใส่ ${clothingDesc} เสื้อผ้าต้องดูเป็นธรรมชาติและผสมผสานเข้ากับลำคอและท่าทางของบุคคลได้อย่างลงตัว
      พื้นหลังต้องเป็นสไตล์สตูดิโอแบบมืออาชีพสี ${backgroundDesc}
      ภาพสุดท้ายต้องมีความสมจริงคมชัด มีผิวที่เป็นธรรมชาติ และแสงไฟคุณภาพสตูดิโอ
      สิ่งสำคัญคือต้องรักษารายละเอียดใบหน้า โครงสร้าง และความคล้ายคลึงของบุคคลในภาพไว้ 100% ห้ามเปลี่ยนแปลงเอกลักษณ์ของพวกเขาโดยเด็ดขาด
      ผลลัพธ์ควรเป็นภาพบุคคลที่ดูสุภาพและสง่างาม เหมาะสำหรับใช้ในงานระลึก
    `;
  }, [clothing, background]);
  
  const handleGenerate = useCallback(async () => {
    if (!originalImage) {
      setError('กรุณาอัปโหลดรูปภาพก่อน');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedImage(null);
    
    const memorialPrompt = generateMemorialPrompt();

    try {
      const base64Data = await fileToBase64(originalImage.file);
      const mimeType = originalImage.file.type;
      
      const imageUrl = await editImage(base64Data, mimeType, memorialPrompt);
      setProcessedImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, generateMemorialPrompt]);

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `ภาพไว้อาลัย-gemini.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleReset = () => {
      setOriginalImage(null);
      setProcessedImage(null);
      setError(null);
      setIsLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {!originalImage && <ImageUploader onFileChange={handleFileChange} />}

      {originalImage && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-text-secondary">ต้นฉบับ</h3>
              <img src={originalImage.dataUrl} alt="Original" className="rounded-lg shadow-lg w-full" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-lg font-semibold text-text-secondary">ภาพไว้อาลัย</h3>
                {processedImage && (
                   <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-base-300 hover:bg-brand-secondary/20 border border-gray-600 text-text-primary font-semibold py-2 px-4 rounded-md transition duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    ดาวน์โหลด
                  </button>
                )}
              </div>
              <div className="w-full aspect-square bg-base-300 rounded-lg flex items-center justify-center relative overflow-hidden">
                {isLoading && (
                  <div className="text-center animate-pulse-fast">
                    <p className="text-text-secondary text-lg">กำลังสร้างภาพ...</p>
                    <p className="text-sm text-gray-400 mt-2">กรุณารอสักครู่</p>
                  </div>
                )}
                {!isLoading && processedImage && (
                   <img src={processedImage} alt="Memorial" className="rounded-lg shadow-lg w-full h-full object-contain" />
                )}
                {!isLoading && !processedImage && (
                  <div className="text-text-secondary p-4 text-center">
                    <p>ภาพที่สร้างจะแสดงที่นี่</p>
                    <p className="text-sm mt-2">ตั้งค่าและกดปุ่มสร้างภาพ</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="clothing" className="block text-sm font-medium text-text-secondary mb-2">
                เสื้อผ้า
              </label>
              <select
                id="clothing"
                value={clothing}
                onChange={(e) => setClothing(e.target.value as ClothingOption)}
                disabled={isLoading}
                className="w-full bg-base-300 border border-gray-600 rounded-md p-3 text-text-primary focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
              >
                {clothingOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="background" className="block text-sm font-medium text-text-secondary mb-2">
                พื้นหลัง
              </label>
              <select
                id="background"
                value={background}
                onChange={(e) => setBackground(e.target.value as BackgroundOption)}
                disabled={isLoading}
                className="w-full bg-base-300 border border-gray-600 rounded-md p-3 text-text-primary focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
              >
                {backgroundOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
             <div className="w-full sm:w-1/2">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {isLoading ? (
                        <>
                        <Spinner />
                        กำลังสร้าง...
                        </>
                    ) : (
                        'สร้างภาพ'
                    )}
                </button>
              </div>
              <div className="w-full sm:w-1/2">
                 <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition duration-300"
                >
                    เริ่มต้นใหม่ด้วยภาพอื่น
                </button>
              </div>
          </div>
        </div>
      )}

      {error && <div className="text-red-400 bg-red-900/50 border border-red-600 p-3 rounded-md mt-4">{error}</div>}
    </div>
  );
};

export default MemorialPortrait;