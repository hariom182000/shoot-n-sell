"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import axios from 'axios';
import { getAccessToken } from "../../helper/auth";
import { pollVeoOperation, isVeoOperationSuccessful } from "../../helper/veo";

interface VeoApiResponse {
  name: string;  // Operation ID
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

export default function VideoCreate() {
  const [image, setImage] = useState<string | null>(null);
  const [base64String, setBase64String] = useState<string>("");
  const [operationId, setOperationId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [videoStatus, setVideoStatus] = useState<"pending" | "processing" | "success" | "error">("pending");
  const [videoData, setVideoData] = useState<{ base64: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImage(dataUrl);
        const base64 = dataUrl.split(",")[1];
        setBase64String(base64);
        setOperationId(""); // Reset operation ID when new image is uploaded
        setError(""); // Clear any previous errors
        setDebugInfo(""); // Clear debug info
        setVideoStatus("pending");
      };

      reader.readAsDataURL(file);
    }
  };

  const startPolling = async (operationName: string, accessToken: string) => {
    try {
      setVideoStatus("processing");
      const result = await pollVeoOperation(operationName, accessToken);
      
      if (isVeoOperationSuccessful(result)) {
        setVideoStatus("success");
        // Extract video data from the response
        const videoResponse = result.response?.videos[0];
        if (videoResponse) {
          setVideoData({
            base64: videoResponse.bytesBase64Encoded,
            mimeType: videoResponse.mimeType
          });
        }
        setDebugInfo(prev => prev + '\n\nVideo Generation Completed Successfully!\nResponse:\n' + JSON.stringify(result, null, 2));
      } else if (result.error) {
        setVideoStatus("error");
        setError(`Video generation failed: ${result.error.message}`);
      } else {
        setVideoStatus("error");
        setError("Video generation did not complete successfully");
      }
    } catch (err) {
      setVideoStatus("error");
      console.error('Error polling video status:', err);
      setError("Failed to check video generation status");
    }
  };

  const generateVideo = async () => {
    if (!base64String) {
      setError("Please upload an image first");
      return;
    }

    setIsLoading(true);
    setError(""); // Clear any previous errors
    setDebugInfo(""); // Clear debug info
    setVideoStatus("pending");

    try {
      // Get OAuth2 token
      const accessToken = await getAccessToken();
      const projectId = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID;
      
      const requestData: VeoRequestData = {
        instances: [
          {
            prompt: "Create a high-quality, cinematic marketing video showcasing the product in a polished and professional style. Use smooth transitions between images, dynamic camera angles, and soft, balanced lighting to highlight the product's key features, textures, and colors. Incorporate subtle motion effects such as slow zooms and pans to add depth and engagement. The video should be between 3 to 5 seconds long, formatted in a 16:9 aspect ratio, with a clean background and no distractions. Emphasize the product's appeal for e-commerce by making it visually striking, clear, and inviting for potential customers.",
            image: base64String ? {
              bytesBase64Encoded: base64String,
              mimeType: "image/png"
            } : undefined
          }
        ],
        parameters: {
          sampleCount: 1,
          durationSeconds: 5,
          aspectRatio: "16:9",
          personGeneration: "dont_allow",
          enhancePrompt: true
        }
      };

      // Log request details (excluding sensitive data)
      const debugRequestInfo = {
        url: `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/veo-2.0-generate-001:predictLongRunning`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': 'Bearer [HIDDEN]'
        },
        imageSize: base64String.length,
        parameters: requestData.parameters
      };
      console.log('Request details:', debugRequestInfo);
      setDebugInfo(JSON.stringify(debugRequestInfo, null, 2));

      const response = await axios({
        method: 'post',
        url: `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/veo-2.0-generate-001:predictLongRunning`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${accessToken}`
        },
        data: requestData
      });

      const responseData = response.data;
      if (typeof responseData === 'object' && responseData !== null && 'name' in responseData) {
        const typedResponse = responseData as VeoApiResponse;
        setOperationId(typedResponse.name);
        setDebugInfo(prev => prev + '\n\nResponse:\n' + JSON.stringify(typedResponse, null, 2));
        
        // Start polling for the video status
        await startPolling(typedResponse.name, accessToken);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error generating video:', err);
      
      // Enhanced error logging
      const errorDetails = {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
        config: {
          headers: {
            ...err.config?.headers,
            'Authorization': 'Bearer [HIDDEN]' // Hide the actual token
          },
          url: err.config?.url,
          method: err.config?.method
        }
      };
      console.log('Error details:', errorDetails);
      setDebugInfo(prev => prev + '\n\nError Details:\n' + JSON.stringify(errorDetails, null, 2));
      
      // Handle specific HTTP status codes
      const status = err.response?.status;
      if (status) {
        switch (status) {
          case 429:
            setError("Rate limit exceeded. Please wait a few minutes before trying again. Check debug info for details.");
            break;
          case 401:
            setError("Authentication failed. Please check your credentials.");
            break;
          case 403:
            setError("Access denied. Please verify your API permissions.");
            break;
          default:
            const errorMessage = err.response?.data?.error?.message || err.message || "Unknown error occurred";
            setError(`Failed to generate video: ${errorMessage}`);
        }
      } else {
        setError("Network error occurred. Please check your connection and try again.");
      }
      setVideoStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-20">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Video Creator</h1>
        
        {/* Upload Section */}
        <div className="mb-8 flex justify-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={triggerFileInput}
            className="p-6 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors duration-200 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-blue-500 group-hover:text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
              />
            </svg>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Preview Section */}
        {image && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Image Preview</h2>
            <div className="relative h-64 w-full mb-6">
              <Image
                src={image}
                alt="Uploaded preview"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="flex justify-center">
              <button
                onClick={generateVideo}
                disabled={isLoading || videoStatus === "processing"}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold
                  ${(isLoading || videoStatus === "processing") ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} 
                  transition-colors duration-200`}
              >
                {isLoading ? 'Generating Video...' : 
                 videoStatus === "processing" ? 'Processing Video...' : 
                 'Generate Video'}
              </button>
            </div>
          </div>
        )}

        {/* Video Display Section */}
        {videoData && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Generated Video</h2>
            <div className="relative w-full aspect-video mb-6 bg-black rounded-lg overflow-hidden">
              <video 
                controls
                className="w-full h-full"
                src={`data:${videoData.mimeType};base64,${videoData.base64}`}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="flex justify-center gap-4">
              <a
                href={`data:${videoData.mimeType};base64,${videoData.base64}`}
                download="generated-video.mp4"
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                Download Video
              </a>
            </div>
          </div>
        )}

        {/* Operation ID Display - Commented out for future use
        {operationId && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Operation ID</h2>
            <div className="p-4 bg-gray-100 rounded overflow-auto">
              <code className="text-gray-900 break-all">{operationId}</code>
            </div>
          </div>
        )}
        */}

        {/* Debug Info Display - Commented out for future use
        {debugInfo && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Debug Information</h2>
            <div className="p-4 bg-gray-100 rounded overflow-auto">
              <pre className="text-gray-900 text-sm whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          </div>
        )}
        */}
      </div>
    </div>
  );
} 