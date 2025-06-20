import React from "react";


function downloadBase64File(base64: string, filename: string) {
  const link = document.createElement("a");
  link.href = `data:image/png;base64,${base64}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


function ImageCard({ base64, idx }: { base64: string; idx: number }) {
  return (
    <div
      key={idx}
      className="w-100 h-100 rounded-lg overflow-hidden border border-gray-200 bg-gray-200 flex items-center justify-center relative group"
    >
      <img
        src={`data:image/png;base64,${base64}`}
        alt={`uploaded-${idx}`}
        className="object-contain"
      />
      {/* Download icon, visible on hover */}
      <button
        className="absolute top-4 right-4 bg-white bg-opacity-80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => downloadBase64File(base64, `image-${idx + 1}.png`)}
        title="Download"
      >
        {/* Simple download SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
          />
        </svg>
      </button>
    </div>
  );
}

export default ImageCard;
