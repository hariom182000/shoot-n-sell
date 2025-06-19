"use client";

import React, { useState, useRef, useEffect } from "react";
import { generateImage, getImageDescription } from "../../helper/gemini";
import { getAccessToken } from "../../helper/auth";
import ImgUploader from "@/components/ImgUploader";
import ImageViewer from "@/components/ImageViewer";
import {
  IMAGE_DESCRIPTION_PROMPT,
  IMAGE_DESCRIPTION_PROMPT_TO_GENERATE_IMAGE,
} from "@/helper/prompts";

interface ChatMessage {
  role: "user" | "agent" | "system";
  type: "text" | "image";
  data: string;
}

interface GenerationMessage {
  type: "text" | "image";
  data: string;
}

function Page() {
  const [imgDescription, setImgDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSend = async () => {
    if (imgDescription.trim() === "") return;
    const newChats: ChatMessage[] = [
      ...chats,
      { role: "user", type: "text", data: imgDescription },
    ];
    setImgDescription("");
    setLoading(true);
    setError("");

    try {
      // Get OAuth2 token
      const accessToken = await getAccessToken();

      // Send chat history to Gemini backend
      const modelImgDescription = await getImageDescription(
        images,
        [imgDescription],
        IMAGE_DESCRIPTION_PROMPT,
        accessToken
      );

      if (!modelImgDescription) {
        throw new Error("Failed to get image description");
      }

      const modelPromptForPhotoshoot = await getImageDescription(
        images,
        [imgDescription, modelImgDescription],
        IMAGE_DESCRIPTION_PROMPT_TO_GENERATE_IMAGE,
        accessToken
      );

      if (!modelPromptForPhotoshoot) {
        throw new Error("Failed to get photoshoot prompt");
      }

      newChats.push(
        { role: "system", type: "text", data: modelImgDescription },
        { role: "system", type: "text", data: modelPromptForPhotoshoot }
      );

      const generationMessages: GenerationMessage[] = newChats.map(chat => ({
        type: chat.type,
        data: chat.data
      }));

      const response = await generateImage(generationMessages, accessToken);
      if (response) {
        const validImageResponses = response.filter(
          (item): item is GenerationMessage & { type: "image" } => 
          item.type === "image" && typeof item.data === "string"
        );

        validImageResponses.forEach(item => {
          setImages(prev => [...prev, item.data]);
        });

        const validResponses = response.filter(
          (item): item is GenerationMessage => 
          typeof item.data === "string"
        );

        const agentChats: ChatMessage[] = validResponses.map(item => ({
          role: "agent",
          type: item.type,
          data: item.data
        }));

        setChats([...newChats, ...agentChats]);
      }
    } catch (err) {
      console.error("Error processing request:", err);
      setError("Failed to process your request. Please try again.");
    }
    setLoading(false);
  };

  const handleImageUpload = async (files: File[]) => {
    setError("");
    try {
      // Get OAuth2 token
      const accessToken = await getAccessToken();
      
      const fileArr = Array.from(files);
      fileArr.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const base64 = dataUrl.split(",")[1];

          setChats((prev) => [
            ...prev,
            {
              role: "user",
              type: "image",
              data: base64,
            },
          ]);
          setImages((prev) => [...prev, base64]);
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="h-500 w-full flex flex-col">
      <div className="items-center p-4 bg-gray-100 border-b border-gray-200">
        <ImgUploader handleFile={handleImageUpload} />
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <div className="py-4 flex items-center justify-between">
          <input
            type="text"
            value={imgDescription}
            onChange={(e) => setImgDescription(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 mr-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            className="px-5 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Processing..." : "Send"}
          </button>
        </div>
      </div>
      <ImageViewer images={images} />
    </div>
  );
}

export default Page;
