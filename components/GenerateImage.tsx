import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import { ASPECT_RATIOS } from '../constants';
import { AspectRatio } from '../types';
import Spinner from './Spinner';

const GenerateImage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('กรุณาป้อนคำสั่ง');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const imageUrl = await generateImage(prompt, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio]);

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'ภาพที่สร้างโดย-gemini.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-text-secondary mb-2">
          คำสั่ง
        </label>
        <textarea
          id="prompt"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full bg-base-300 border border-gray-600 rounded-md p-3 text-text-primary focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          placeholder="เช่น ภาพถ่ายพระพุทธรูปพื้นหลังสีฟ้า หรือเสื้อยืดสีขาวลายต้นไม้"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-1/2">
          <label htmlFor="aspectRatio" className="block text-sm font-medium text-text-secondary mb-2">
            อัตราส่วนภาพ
          </label>
          <select
            id="aspectRatio"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            className="w-full bg-base-300 border border-gray-600 rounded-md p-3 text-text-primary focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          >
            {ASPECT_RATIOS.map((ratio) => (
              <option key={ratio} value={ratio}>
                {ratio}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-1/2 self-end">
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
      </div>

      {error && <div className="text-red-400 bg-red-900/50 border border-red-600 p-3 rounded-md">{error}</div>}

      <div className="w-full mt-4">
        {isLoading && (
          <div className="w-full aspect-square bg-base-300 rounded-lg flex items-center justify-center animate-pulse-fast">
             <div className="text-text-secondary">AI กำลังประมวลผล...</div>
          </div>
        )}
        {generatedImage && (
          <div className="w-full max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-text-secondary">ภาพที่สร้าง:</h3>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-base-300 hover:bg-brand-secondary/20 border border-gray-600 text-text-primary font-semibold py-2 px-4 rounded-md transition duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                ดาวน์โหลด
              </button>
            </div>
            <img src={generatedImage} alt="Generated" className="rounded-lg shadow-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateImage;