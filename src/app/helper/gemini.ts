import { GoogleGenAI, Modality } from "@google/genai";

export default async function submitToModel(chat) {

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const ai = new GoogleGenAI({ apiKey:apiKey });

  console.log("Submitting to Gemini model with chat:", chat,ai);
  // Prepare the contents array for Gemini
  const contents = chat
    .map((msg) => {
      if (msg.type=='text') {
        return {text:msg.data};
      } else{
        return {
          inlineData: {
            mimeType: "image/png",  
            data: msg.data,
          },
        };
      }
      return null;
    })
    .filter(Boolean);

  try {
    console.log("Prepared contents for Gemini:", contents);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    console.log("Gemini response:", response);

    // Collect text and image responses
    const parts = response.candidates[0]?.content?.parts || [];
    const reply = parts
      .map((part) => {
        if (part.text) return { type: "text", data: part.text };
        if (part.inlineData)
          return { type: "image", data: part.inlineData.data };
        return null;
      })
      .filter(Boolean);


      console.log("Processed reply:", reply);
     return reply
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}