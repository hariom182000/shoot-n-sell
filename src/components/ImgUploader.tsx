import React, { useRef, useState } from "react";

function ImgUploader({ handleFile }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  // handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // triggers when file is dropped
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files);
    }
  };

  // triggers when file is selected with click
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files);
    }
  };

  // triggers the input when the button is clicked
  const onButtonClick = (e) => {
    e.preventDefault();
    inputRef.current.click();
  };

  return (
    <form
      className="relative h-64 w-96 max-w-full text-center"
      onDragEnter={handleDrag}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        id="input-file-upload"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <label
        htmlFor="input-file-upload"
        className={`flex flex-col items-center justify-center h-full w-full border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          dragActive
            ? "bg-white border-blue-400"
            : "bg-slate-50 border-slate-300"
        }`}
      >
        <div>
          <p className="mb-2 text-gray-500">Drag and drop your file here or</p>
          <button
            className="text-blue-600 hover:underline font-semibold bg-transparent border-none cursor-pointer"
            onClick={onButtonClick}
            type="button"
          >
            Upload a file
          </button>
        </div>
      </label>
      {dragActive && (
        <div
          className="absolute inset-0 rounded-xl bg-white bg-opacity-60 border-2 border-blue-400 border-dashed flex items-center justify-center pointer-events-none"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        />
      )}
    </form>
  );
}

export default ImgUploader;
