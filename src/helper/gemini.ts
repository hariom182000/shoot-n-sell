import { GoogleGenAI, Modality } from "@google/genai";
import { IMAGE_GENERATION_PROMPT } from "./prompts";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

/**
 * Submits chat history to the Gemini model and returns an array of responses.
 * Each response is an object: { type: "text" | "image", data: string }
 */
export async function generateImage(chat) {
  try {
    const contents = chat
      .map((msg) =>
        msg.type === "text"
          ? { text: msg.data }
          : {
              inlineData: {
                mimeType: "image/png",
                data: msg.data,
              },
            }
      )
      .filter(Boolean);

    contents.push({ text: IMAGE_GENERATION_PROMPT });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    return parts
      .map((part) => {
        if (part.text) return { type: "text", data: part.text };
        if (part.inlineData)
          return { type: "image", data: part.inlineData.data };
        return null;
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}

/**
 * Gets a description for an image using the Gemini model.
 * @param img - base64 image string
 * @param img_description - optional description prompt
 */
export async function getImageDescription(
  images: [],
  img_description: string[],
  system_prompt: string
): Promise<string> {
  try {
    const contents = images.map((img) => {
      return {
        inlineData: {
          mimeType: "image/png",
          data: img,
        },
      };
    });
    img_description.map((desc) => {
      contents.push({ text: desc });
    });

    contents.push({ text: system_prompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    console.log("Gemini  img description response:", response, response.candidates?.[0]?.content?.parts?.[0]?.text);
    return response.candidates?.[0]?.content?.parts?.[0]?.text
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}
