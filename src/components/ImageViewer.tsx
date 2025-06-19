import React from "react";

function ImageViewer({images}: {images: string[]}) {
  return (
    <div>
      {images.length > 0 && (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {images.map((base64, idx) => {
              return (
                <div
                  key={idx}
                  className="w-100 h-100 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center"
                >
                  <img
                    src={`data:image/png;base64,${base64}`}
                    alt={`uploaded-${idx}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageViewer;
