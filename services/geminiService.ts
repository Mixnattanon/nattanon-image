import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio } from '../types';

if (!process.env.API_KEY) {
  throw new Error("ไม่ได้ตั้งค่าตัวแปรสภาพแวดล้อม API_KEY");
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

    const result = response.generatedImages?.[0];

    if (result?.blockReason) {
        console.error("Image generation blocked:", result.blockReason);
        throw new Error(`การสร้างภาพถูกบล็อกเนื่องจากเหตุผลด้านความปลอดภัย: ${result.blockReason}`);
    }

    if (result?.image?.imageBytes) {
      const base64ImageBytes = result.image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    } else {
      console.error("API response did not contain an image. Response:", JSON.stringify(response, null, 2));
      throw new Error("ไม่สามารถสร้างภาพได้ API ไม่ได้ส่งคืนข้อมูลภาพ");
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสร้างภาพ:", error);
     if (error instanceof Error) {
        throw new Error(`สร้างภาพล้มเหลว: ${error.message}`);
    }
    throw new Error("สร้างภาพล้มเหลวเนื่องจากข้อผิดพลาดที่ไม่รู้จัก");
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
      contents: { parts: [imagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const { candidates, promptFeedback } = response;

    if (promptFeedback?.blockReason) {
        console.error("Request blocked due to safety reasons:", promptFeedback);
        throw new Error(`คำขอถูกบล็อกเนื่องจากเหตุผลด้านความปลอดภัย: ${promptFeedback.blockReason}`);
    }

    const candidate = candidates?.[0];

    if (!candidate) {
        console.error("API did not return any candidates. Response:", JSON.stringify(response, null, 2));
        throw new Error("API ไม่ได้ส่งคืนผลลัพธ์ใดๆ");
    }

    if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
         console.error("Generation finished for a non-standard reason:", candidate.finishReason, ". Response:", JSON.stringify(response, null, 2));
         throw new Error(`การสร้างภาพสิ้นสุดลงเนื่องจาก: ${candidate.finishReason}`);
    }

    const imageContentPart = candidate.content?.parts?.find(part => part.inlineData);

    if (imageContentPart?.inlineData) {
      const editedBase64Data = imageContentPart.inlineData.data;
      return `data:${imageContentPart.inlineData.mimeType};base64,${editedBase64Data}`;
    } else {
      console.error("API response did not contain an image part. Response:", JSON.stringify(response, null, 2));
      throw new Error("API ไม่ได้ส่งคืนภาพที่แก้ไขแล้ว (อาจเป็นเพราะคำสั่งไม่ชัดเจนหรือมีปัญหาอื่น)");
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการแก้ไขภาพ:", error);
    if (error instanceof Error) {
        throw new Error(`แก้ไขภาพล้มเหลว: ${error.message}`);
    }
    throw new Error("แก้ไขภาพล้มเหลวเนื่องจากข้อผิดพลาดที่ไม่รู้จัก");
  }
};