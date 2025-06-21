"use client";

import React, { useState, useRef, useEffect } from "react";
import { generateImage, getImageDescription } from "../../helper/gemini";
import ImgUploader from "@/components/ImgUploader";
import MediaViewer from "@/components/MediaViewer";
import {
  GET_VIDEO_DESCRIPTION,
  IMAGE_DESCRIPTION_PROMPT,
  IMAGE_DESCRIPTION_PROMPT_TO_GENERATE_IMAGE,
  IMAGE_GENERATION_PROMPT,
  IMAGE_WATER_MARK_EDIT_PROMT,
  VIDEO_GENERATION_SYSTEM_PROMPT,
} from "@/helper/prompts";
import Loader from "@/components/Loader";
import Image from "next/image";
import {
  getAccessToken,
  isVeoOperationSuccessful,
  pollVeoOperation,
} from "@/helper/apis";
import axios from "axios";

interface VeoApiResponse {
  name: string; // Operation ID
}

interface VeoApiError {
  error: string;
}

interface VeoRequestData {
  instances: {
    prompt: string;
    image?: {
      bytesBase64Encoded: string;
      mimeType: string;
    };
  }[];
  parameters: {
    storageUri?: string;
    sampleCount: number;
    durationSeconds?: number;
    aspectRatio?: string;
    personGeneration?: string;
    enhancePrompt?: boolean;
  };
}

function Page() {
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
  const [videoData, setVideoData] = useState<[]>([]);
  const [modelImgDes, setModelImgDes] = useState<string>();
  const [imgDescription, setImgDescription] = useState<string>();
  const [isWaterMarkFlag, setIsWaterMarkFlag] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const handleWaterMarkFlow = async () => {
    try {
      const imageGenChat = [
        { role: "system", type: "text", data: "user image" },
        { role: "user", type: "image", data: aiImages[0] },
        { role: "system", type: "text", data: "waterMark image" },
        {
          role: "user",
          type: "image",
          data: images[images.length - 1],
        },
      ];
      const response = await generateImage(
        imageGenChat,
        IMAGE_WATER_MARK_EDIT_PROMT
      );
      response.map((item) => {
        if (item.type === "image") {
          setAiImages((prev) => [...prev, item?.data]);
        }
      });
      setCurrentTab(2);
    } catch (err) {
      console.log("error with watera mark flow", err);
    } finally {
      setIsWaterMarkFlag(false);
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const newChats = [
      ...chats,
      //   { role: "user", type: "text", data: imgDescription },
    ];
    setLoading(true);
    if (isWaterMarkFlag == true) {
      await handleWaterMarkFlow();
      return;
    }
    try {
      // Send chat history to Gemini backend
      const modelImgDescription = await getImageDescription(
        images,
        [imgDescription],
        IMAGE_DESCRIPTION_PROMPT
      );
      setModelImgDes(modelImgDescription);
      const modelPromptForPhotoshoot = await getImageDescription(
        images,
        [imgDescription, modelImgDescription],
        IMAGE_DESCRIPTION_PROMPT_TO_GENERATE_IMAGE
      );
      const imageGenChat = [
        { role: "user", type: "image", data: images[images.length - 1] },
        { role: "system", type: "text", data: modelPromptForPhotoshoot },
      ];
      const response = await generateImage(
        imageGenChat,
        IMAGE_GENERATION_PROMPT
      );
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
        setImgDescription("");
        setCurrentTab(2);
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

  const startPolling = async (operationName: string, accessToken: string) => {
    try {
      const result = await pollVeoOperation(operationName, accessToken);

      if (isVeoOperationSuccessful(result)) {
        const videoResponse = result.response?.videos[0];
        if (videoResponse) {
          setCurrentTab(3);
          setVideoData((prev) => [...prev, videoResponse.bytesBase64Encoded]);
        }
      }
    } catch (err) {
      console.error("Error polling video status:", err);
    }
  };

  const handleVideoGeneration = async () => {
    setLoading(true);
    try {
      const videoGenerationPrompt = await getImageDescription(
        aiImages,
        [modelImgDes],
        GET_VIDEO_DESCRIPTION
      );
      const accessToken = await getAccessToken();
      const projectId = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID;

      const requestData: VeoRequestData = {
        instances: [
          {
            prompt:
              VIDEO_GENERATION_SYSTEM_PROMPT + "\n" + videoGenerationPrompt,
            image: {
              bytesBase64Encoded: aiImages[0],
              mimeType: "image/png",
            },
          },
        ],
        parameters: {
          sampleCount: 1,
          durationSeconds: 8,
          aspectRatio: "16:9",
          enhancePrompt: true,
        },
      };

      const response = await axios({
        method: "post",
        url: `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/veo-2.0-generate-001:predictLongRunning`,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${accessToken}`,
        },
        data: requestData,
      });

      const responseData = response.data;
      if (
        typeof responseData === "object" &&
        responseData !== null &&
        "name" in responseData
      ) {
        const typedResponse = responseData as VeoApiResponse;

        await startPolling(typedResponse.name, accessToken);
      }
    } catch (error) {
      console.error("Error generating video:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-dvh w-full px-10 flex flex-col bg-gradient-to-b from-white to-sky-200 ">
      <div className="mt-10">
        <text className="flex justify-center font-bold text-4xl">
          Upload Your {isWaterMarkFlag ? "WaterMark" : "Product"} Images
        </text>
        <p className="my-2 text-gray-500 flex justify-center">
          Start by uploading your {isWaterMarkFlag ? "waterMark" : "product"}{" "}
          photos. Our AI will create multiple professional variations.
        </p>
      </div>

      {loading && <Loader />}
      <div
        className={`flex-1 overflow-auto transition duration-300 ${
          loading ? "blur-sm pointer-events-none select-none" : ""
        }`}
        style={{ minHeight: 0 }}
      >
        <div className="items-center p-4  border-b border-gray-200">
          <ImgUploader handleFile={handleImageUpload} />
          <div className="flex justify-center my-4 rounded-full">
            <input
              type="text"
              value={imgDescription}
              onChange={(e) => setImgDescription(e.target.value)}
              placeholder="Describe your object (optional)"
              className="flex-1 px-4 py-2  bg-white rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 mr-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={loading}
            />
          </div>

          <div
            className="flex justify-end"
            onClick={() => {
              aiImages.length > 0 && setIsWaterMarkFlag(!isWaterMarkFlag);
            }}
          >
            <div className="item-center m-2 mx-6">
              <text className="font-extralight text-gray-400 text-center">
                Add Water Mark on Ai Images
              </text>
            </div>
            <div
              className="flex rounded-2xl w-1/16 p-1 px-2"
              style={
                aiImages.length > 0
                  ? isWaterMarkFlag
                    ? { justifyContent: "end", background: "#445626" }
                    : { justifyContent: "start", background: "#800E13" }
                  : { background: "gray", justifyContent: "start" }
              }
            >
              <div
                className="rounded-full p-4 bg-white"
                style={aiImages.length > 0 ? {} : { background: "silver" }}
              ></div>
            </div>
          </div>

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
        <MediaViewer
          images={images}
          aiImages={aiImages}
          videoData={videoData}
          tabIndex={currentTab}
        />

        <div className="flex justify-between my-24 rounded-md border-dashed p-4 border-2 border-gray-400 rounded-lgshadow-md">
          <div className="flex ">
            <div className="rounded-full mr-10 bg-gradient-to-br p-4 from-sky-400 to-purple-800">
              <Image
                src="/play.svg"
                alt="Icon"
                width={20}
                height={20}
                style={{ filter: "invert(100%)" }}
              />
            </div>

            <div className="ml-10">
              <text className="font-bold text-2xl text-sky-500 block">
                AI Video Generation - Already Here!
              </text>
              <text>
                Generate professional 4-5 second cinematic videos of your
                products. Perfect for social media and premium e-commerce
                listings.
              </text>
            </div>
          </div>

          <div
            onClick={handleVideoGeneration}
            className="rounded-2xl mt-2 hover:shadow-xl shadow-md duration-300 ease-in-out flex items-center max-h-8 max-w-40 bg-gradient-to-br px-8 from-purple-800 to-sky-400 p-4 cursor-pointer hover:from-purple-700 hover:to-sky-500 transition"
          >
            <text className="text-white font-medium text-center">Try Now</text>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
