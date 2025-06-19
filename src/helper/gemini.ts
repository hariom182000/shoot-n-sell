import { GoogleGenAI, Modality } from "@google/genai";
import { IMAGE_GENERATION_PROMPT } from "./prompts";

interface TextContent {
  text: string;
}

interface ImageContent {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

type Content = TextContent | ImageContent;

/**
 * Creates a new GoogleGenAI instance with the provided token
 */
function createAIInstance(accessToken: string) {
  return new GoogleGenAI({ apiKey: accessToken });
}

/**
 * Submits chat history to the Gemini model and returns an array of responses.
 * Each response is an object: { type: "text" | "image", data: string }
 */
export async function generateImage(chat: { type: "text" | "image", data: string }[], accessToken: string) {
  try {
    const ai = createAIInstance(accessToken);
    const contents: Content[] = chat
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
        if (part.text) return { type: "text" as const, data: part.text };
        if (part.inlineData)
          return { type: "image" as const, data: part.inlineData.data };
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}

/**
 * Gets a description for an image using the Gemini model.
 * @param images - array of base64 image strings
 * @param img_description - array of description prompts
 * @param system_prompt - system prompt for image description
 * @param accessToken - OAuth2 access token
 */
export async function getImageDescription(
  images: string[],
  img_description: string[],
  system_prompt: string,
  accessToken: string
): Promise<string | null> {
  try {
    const ai = createAIInstance(accessToken);
    const contents: Content[] = images.map((img) => ({
      inlineData: {
        mimeType: "image/png",
        data: img,
      },
    }));

    img_description.forEach((desc) => {
      contents.push({ text: desc });
    });

    contents.push({ text: system_prompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    console.log("Gemini img description response:", response, response.candidates?.[0]?.content?.parts?.[0]?.text);
    return response.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}
