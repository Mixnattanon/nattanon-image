
import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    } else {
      throw new Error("ไม่สามารถสร้างภาพได้");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("สร้างภาพล้มเหลว กรุณาตรวจสอบคอนโซลสำหรับรายละเอียด");
  }
};

export const editImage = async (
  base64Data: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const candidate = response.candidates?.[0];
    const imageContentPart = candidate?.content?.parts?.find(part => part.inlineData);

    if (imageContentPart?.inlineData) {
      const editedBase64Data = imageContentPart.inlineData.data;
      return `data:${imageContentPart.inlineData.mimeType};base64,${editedBase64Data}`;
    } else {
      throw new Error("API ไม่ได้ส่งคืนภาพที่แก้ไขแล้ว");
    }
  } catch (error) {
    console.error("Error editing image:", error);
    throw new Error("แก้ไขภาพล้มเหลว กรุณาตรวจสอบคอนโซลสำหรับรายละเอียด");
  }
};
