import React, { useEffect, useState } from "react";
import ImageCard from "./ImageCard";

const TABS = [
  {
    text: "All Images",
  },
  { text: "Uploaded" },
  {
    text: "AI Image",
  },
  {
    text: "AI Video",
  },
];

function MediaViewer({
  images,
  aiImages,
  videoData,
  tabIndex = 0,
}: {
  images: string[];
  aiImages: string[];
  videoData: string[];
  tabIndex?: number;
}) {
  const [tabSelected, setTabSelected] = useState(tabIndex);
  const allImages = [...images, ...aiImages];

  useEffect(() => {
    setTabSelected(tabIndex);
  }, [tabIndex]);

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

      <div className="my-8 w-180 flex justify-between">
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
                  : idx == 2
                  ? aiImages.length
                  : videoData.length}
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
      {videoData.length > 0 && tabSelected == 3 && (
        <div className="p-4">
          <div className="grid grid-cols-1 gap-4">
            {videoData.map((video, idx) => (
              <div key={idx} className="rounded-lg shadow-md p-4 bg-white">
                <video
                  controls
                  className="w-200 h-auto rounded-lg"
                  src={`data:video/mp4;base64,${video}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaViewer;
