"use client";

import React, { useState, useRef, useEffect } from "react";
import { generateImage, getImageDescription } from "../../helper/gemini";
import ImgUploader from "@/components/ImgUploader";
import ImageViewer from "@/components/ImageViewer";
import {
  IMAGE_DESCRIPTION_PROMPT,
  IMAGE_DESCRIPTION_PROMPT_TO_GENERATE_IMAGE,
} from "@/helper/prompts";
import Loader from "@/components/Loader";

function Page() {
  const [imgDescription, setImgDescription] = useState("");
  const [images, setImages] = useState<[]>([]);
  const [aiImages, setAiImages] = useState<[]>([]);
  const [chats, setChats] = useState<
    {
      role: "user" | "agent" | "system";
      type: "text" | "image";
      data: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

 

  const handleSend = async () => {
    const newChats = [
      ...chats,
      //   { role: "user", type: "text", data: imgDescription },
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
      const imageGenChat = [
        { role: "user", type: "image", data: images[images.length - 1] },
        { role: "system", type: "text", data: modelPromptForPhotoshoot },
      ];
      const response = await generateImage(imageGenChat);
      // response is an array of { type: "text" | "image", data: string }
      if (Array.isArray(response)) {
        response.map((item) => {
          if (item.type === "image") {
            setAiImages((prev) => [...prev, item?.data]);
          }
        });
        const agentChats = response.map((item) => ({
          role: "agent",
          type: item.type,
          data: item.data,
        }));
        newChats.push(
          { role: "system", type: "text", data: modelImgDescription },
          { role: "system", type: "text", data: modelPromptForPhotoshoot }
        );
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
    <div className="relative h-dvh w-full px-10 flex flex-col bg-gradient-to-b from-sky-50 to-sky-200 ">
      <div className="mt-10">
        <text className="flex justify-center font-bold text-4xl">Upload Your Product Images</text>
        <p className="my-2 text-gray-500 flex justify-center">
          Start by uploading your product photos. Our AI will create multiple
          professional variations.
        </p>
      </div>

      {/* Blur overlay and loading spinner */}
      {loading && <Loader />}
      <div
        
        className={`flex-1 overflow-auto transition duration-300 ${
          loading ? "blur-sm pointer-events-none select-none" : ""
        }`}
        style={{ minHeight: 0 }}
      >
        <div className="items-center p-4  border-b border-gray-200">
          <ImgUploader handleFile={handleImageUpload} />

          {/* <input
              type="text"
              value={imgDescription}
              onChange={(e) => setImgDescription(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 mr-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={loading}
            /> */}
          <div className="flex justify-center m-8">
            <button
              onClick={handleSend}
              className="w-xl py-4 rounded-full bg-sky-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              disabled={loading}
            >
              <text>{"Generate AI Photos "}</text>
            </button>
          </div>
        </div>
        <ImageViewer images={images} aiImages={aiImages} />
      </div>
    </div>
  );
}

export default Page;
