"use client";

import React, { useState, useRef, useEffect, use } from "react";
import { generateImage, getImageDescription } from "../../helper/gemini";
import ImgUploader from "@/components/ImgUploader";
import ImageViewer from "@/components/ImageViewer";
import {
  IMAGE_DESCRIPTION_PROMPT,
  IMAGE_DESCRIPTION_PROMPT_TO_GENERATE_IMAGE,
} from "@/helper/prompts";

function Page() {
  const [imgDescription, setImgDescription] = useState("");
  const [images, setImages] = useState<[]>([]);
  const [chats, setChats] = useState<
    {
      role: "user" | "agent" | "system";
      type: "text" | "image";
      data: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (imgDescription.trim() === "") return;
    const newChats = [
      ...chats,
      { role: "user", type: "text", data: imgDescription },
    ];
    setImgDescription("");
    setLoading(true);

    try {
      // Send chat history to Gemini backend
      const modelImgDescription = await getImageDescription(
        images,
        [imgDescription],
        IMAGE_DESCRIPTION_PROMPT
      );
      const modelPromptForPhotoshoot = await getImageDescription(
        images,
        [imgDescription, modelImgDescription],
        IMAGE_DESCRIPTION_PROMPT_TO_GENERATE_IMAGE
      );
      newChats.push(
        { role: "system", type: "text", data: modelImgDescription },
        { role: "system", type: "text", data: modelPromptForPhotoshoot }
      );

      const response = await generateImage(newChats);
      // response is an array of { type: "text" | "image", data: string }
      if (Array.isArray(response)) {
        response.map((item) => {
          if (item.type === "image") {
            setImages((prev) => [...prev, item.data]);
          }
        });
        const agentChats = response.map((item) => ({
          role: "agent",
          type: item.type,
          data: item.data,
        }));
        newChats.push(...agentChats);
        setChats(newChats);
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleImageUpload = (files: File[]) => {
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
  };

  return (
    <div className="h-500 w-full flex flex-col">
      <div className=" items-center p-4 bg-gray-100 border-b border-gray-200">
        <ImgUploader handleFile={handleImageUpload} />
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
            Send
          </button>
        </div>
      </div>
      <ImageViewer images={images} />
    </div>
  );
}

export default Page;
