import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import { fileToBase64, fileToDataUrl } from '../utils/fileUtils';
import Spinner from './Spinner';
import ImageUploader from './ImageUploader';

const RestoreImage: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; dataUrl: string } | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  
  const handleRestoreAndColorize = useCallback(async () => {
    if (!originalImage) {
      setError('กรุณาอัปโหลดรูปภาพก่อน');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    const comprehensivePrompt = `
      ดำเนินการบูรณะและปรับปรุงภาพถ่ายขาวดำเก่านี้ให้สมบูรณ์แบบระดับมืออาชีพในขั้นตอนเดียว:
      1.  **ซ่อมแซม:** ลบจุดบกพร่องทั้งหมดอย่างพิถีพิถัน เช่น รอยขีดข่วน, ฝุ่น, ความเสียหายจากน้ำ, และแสงสะท้อนหรือเงาที่ไม่เป็นธรรมชาติ
      2.  **เพิ่มความคมชัด:** ยกระดับภาพให้มีความละเอียดสูง เพิ่มความคมชัดและความกระจ่างใสเพื่อให้ได้คุณภาพเทียบเท่าภาพถ่ายจากสตูดิโอมืออาชีพสมัยใหม่
      3.  **เติมสี:** ใช้สีที่สมจริง, เป็นธรรมชาติ, และสดใส ตรวจสอบให้แน่ใจว่าความอิ่มตัวของสีมีความสมดุลอย่างเหมาะสม สไตล์สุดท้ายต้องเป็นแบบภาพถ่ายจริง (photorealistic) และห้ามใช้สไตล์ภาพสีน้ำ (watercolor) โดยเด็ดขาด
      **ข้อกำหนดสำคัญ:** ต้องรักษารายละเอียด, องค์ประกอบ, และโดยเฉพาะอย่างยิ่งความคล้ายคลึงของบุคคลในภาพต้นฉบับไว้ 100% ห้ามเปลี่ยนแปลงลักษณะหน้าตาหรือองค์ประกอบของภาพถ่าย
    `;

    try {
      const base64Data = await fileToBase64(originalImage.file);
      const mimeType = originalImage.file.type;
      
      const imageUrl = await editImage(base64Data, mimeType, comprehensivePrompt);
      setProcessedImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage]);

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `gemini-restored-image.png`;
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
                 <h3 className="text-lg font-semibold text-text-secondary">ผลลัพธ์</h3>
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
                    <p className="text-text-secondary text-lg">AI กำลังทำงานอย่างหนัก...</p>
                    <p className="text-sm text-gray-400 mt-2">โปรดรอสักครู่</p>
                  </div>
                )}
                {!isLoading && processedImage && (
                   <img src={processedImage} alt="Processed" className="rounded-lg shadow-lg w-full h-full object-contain" />
                )}
                {!isLoading && !processedImage && (
                  <div className="text-text-secondary p-4 text-center">
                    <p>ผลลัพธ์จากการแก้ไขจะแสดงที่นี่</p>
                    <p className="text-sm mt-2">คลิกปุ่มด้านล่างเพื่อเริ่ม</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
             <div className="w-full">
                {!processedImage ? (
                    <button
                        onClick={handleRestoreAndColorize}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        {isLoading ? (
                            <>
                            <Spinner />
                            กำลังประมวลผล...
                            </>
                        ) : (
                            <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            ซ่อมแซมและเติมสี
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleReset}
                        className="w-full flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4l16 16" /></svg>
                        เริ่มต้นใหม่กับภาพอื่น
                    </button>
                )}
              </div>
          </div>
        </div>
      )}

      {error && <div className="text-red-400 bg-red-900/50 border border-red-600 p-3 rounded-md mt-4">{error}</div>}
    </div>
  );
};

export default RestoreImage;
