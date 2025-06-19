import React, { useState } from "react";
import ImageCard from "./ImageCard";

const TABS = [
  {
    text: "All Images",
  },
  { text: "Uploaded" },
  {
    text: "AI Generated",
  },
];

function ImageViewer({
  images,
  aiImages,
}: {
  images: string[];
  aiImages: string[];
}) {
  const [tabSelected, setTabSelected] = useState(0);
  const allImages = [...images, ...aiImages];

  return (
    <div className="p-4">
      <div>
        <text className="flex justify-center font-bold text-xl">
          {" "}
          Your Product Gallery
        </text>
        <p className="my-2 text-gray-500 flex justify-center">
          View, download, and manage all your original and AI-generated images
        </p>
      </div>

      <div className="my-8 w-120 flex justify-between">
        {TABS.map((tab, idx) => {
          return (
            <div
              className=" rounded-xl px-4 py-1 border-gray-300 border-2  bg-sky-50 font-medium hover:bg-sky-400 hover:text-white transition disabled:opacity-50"
              onClick={() => {
                setTabSelected(idx);
              }}
              style={
                tabSelected == idx
                  ? { background: "rgb(60,131,246)", color: "white" }
                  : {}
              }
            >
              <p>
                {tab.text}
                {" ( "}
                {idx == 0
                  ? allImages.length
                  : idx == 1
                  ? images.length
                  : aiImages.length}
                {" )"}
              </p>
            </div>
          );
        })}
      </div>

      {allImages.length > 0 && tabSelected == 0 && (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {allImages.map((base64, idx) => (
              <ImageCard key={idx} base64={base64} idx={idx} />
            ))}
          </div>
        </div>
      )}

      {images.length > 0 && tabSelected == 1 && (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {images.map((base64, idx) => (
              <ImageCard key={idx} base64={base64} idx={idx} />
            ))}
          </div>
        </div>
      )}

      {aiImages.length > 0 && tabSelected == 2 && (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {aiImages.map((base64, idx) => (
              <ImageCard key={idx} base64={base64} idx={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageViewer;
