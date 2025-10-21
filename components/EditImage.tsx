import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import { fileToBase64, fileToDataUrl } from '../utils/fileUtils';
import Spinner from './Spinner';
import ImageUploader from './ImageUploader';

const EditImage: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; dataUrl: string } | null>(null);
  const [repairedImage, setRepairedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (file: File | null) => {
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setOriginalImage({ file, dataUrl });
        setRepairedImage(null);
        setError(null);
      } catch (err) {
        setError("ไม่สามารถอ่านไฟล์ที่เลือกได้");
        setOriginalImage(null);
      }
    }
  };

  const handleRepair = useCallback(async () => {
    if (!originalImage) {
      setError('กรุณาอัปโหลดรูปภาพก่อน');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRepairedImage(null);
    
    const repairPrompt = "ฟื้นฟูภาพถ่ายนี้อย่างมืออาชีพ ลบตำหนิทั้งหมดอย่างพิถีพิถัน เช่น รอยขีดข่วน, ฝุ่น, ความเสียหายจากน้ำ, และแสงสะท้อนหรือเงาที่ไม่เป็นธรรมชาติ เพิ่มคุณภาพของภาพให้มีความคมชัดสูง (high definition) เพิ่มความคมชัดและความกระจ่างใสให้เทียบเท่าคุณภาพสตูดิโอมืออาชีพในปัจจุบัน สิ่งสำคัญคือต้องรักษารายละเอียด, องค์ประกอบ, และโดยเฉพาะอย่างยิ่งความคล้ายคลึงของบุคคลในภาพถ่ายไว้ 100% ห้ามเปลี่ยนแปลงลักษณะใบหน้าหรือองค์ประกอบของภาพถ่าย ภาพอาจเป็นภาพสีหรือขาวดำก็ได้ ให้รักษาสีเดิมของภาพไว้";

    try {
      const base64Data = await fileToBase64(originalImage.file);
      const imageUrl = await editImage(base64Data, originalImage.file.type, repairPrompt);
      setRepairedImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage]);

  const handleDownload = () => {
    if (!repairedImage) return;
    const link = document.createElement('a');
    link.href = repairedImage;
    link.download = 'ภาพที่ซ่อมแซม-gemini.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <ImageUploader onFileChange={handleFileChange} />

      {originalImage && (
        <div className="w-full mt-4">
            <button
                onClick={handleRepair}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white font-bold py-3 px-6 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
                {isLoading ? (
                <>
                    <Spinner />
                    กำลังซ่อมแซม...
                </>
                ) : (
                'ซ่อมแซมภาพ'
                )}
            </button>
        </div>
      )}

      {error && <div className="text-red-400 bg-red-900/50 border border-red-600 p-3 rounded-md">{error}</div>}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {originalImage && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-text-secondary">ต้นฉบับ</h3>
            <img src={originalImage.dataUrl} alt="Original" className="rounded-lg shadow-lg w-full" />
          </div>
        )}
        
        {isLoading && !repairedImage && (
            <div className="w-full aspect-square bg-base-300 rounded-lg flex items-center justify-center animate-pulse-fast">
                <div className="text-text-secondary">AI กำลังทำงาน...</div>
            </div>
        )}

        {repairedImage && (
          <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-text-secondary">ซ่อมแซมแล้ว</h3>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-base-300 hover:bg-brand-secondary/20 border border-gray-600 text-text-primary font-semibold py-2 px-4 rounded-md transition duration-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    ดาวน์โหลด
                </button>
            </div>
            <img src={repairedImage} alt="Repaired" className="rounded-lg shadow-lg w-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditImage;