"use client";

import React, { useState } from "react";

function Page() {
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<
    { type: "user" | "bot"; text?: string; imageUrl?: string }[]
  >([]);

  const handleSend = () => {
    if (input.trim() === "") return;
    setChats([...chats, { type: "user", text: input }]);
    setInput("");
    // You can add bot response logic here if needed
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setChats((prev) => [
          ...prev,
          { type: "user", imageUrl: event.target?.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ paddingTop: 80, background: "#f0f0f0", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "80vh",
          maxWidth: 1000,
          margin: "0 auto",
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            background: "#f5f5f5",
          }}
        >
          {chats.map((chat, idx) => (
            <div
              key={idx}
              style={{
                margin: "8px 0",
                textAlign: chat.type === "user" ? "right" : "left",
              }}
            >
              {chat.text && (
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    borderRadius: 16,
                    background: chat.type === "user" ? "#0070f3" : "#e0e0e0",
                    color: chat.type === "user" ? "#fff" : "#333",
                    maxWidth: "70%",
                    wordBreak: "break-word",
                  }}
                >
                  {chat.text}
                </span>
              )}
              {chat.imageUrl && (
                <img
                  src={chat.imageUrl}
                  alt="uploaded"
                  style={{
                    display: "inline-block",
                    maxWidth: 200,
                    maxHeight: 200,
                    borderRadius: 16,
                    marginLeft: chat.type === "user" ? 0 : 8,
                    marginRight: chat.type === "user" ? 8 : 0,
                    border: "1px solid #ccc",
                    background: "#fff",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: 16,
            borderTop: "1px solid #ddd",
            background: "#fff",
          }}
        >
          {/* Upload Image Button */}
          <label style={{ marginRight: 8, cursor: "pointer" }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <span role="img" aria-label="upload">
              📷
            </span>
          </label>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 20,
              border: "1px solid #ccc",
              outline: "none",
              marginRight: 8,
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              background: "#0070f3",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;
