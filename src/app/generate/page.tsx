"use client";

import React, { useState } from "react";
import submitToModel from "../helper/gemini";

function Page() {
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<
    { role: "user" | "agent"; type: "text" | "image"; data: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === "") return;
    const newChats = [
      ...chats,
      { role: "user", type: "text", data: input }
    ];
    setChats(newChats);
    setInput("");
    setLoading(true);

    try {
      // Send chat history to Gemini backend
      const response = await submitToModel(newChats);

      // response is an array of { type: "text" | "image", data: string }
      if (Array.isArray(response)) {
        const agentChats = response.map((item) => ({
          role: "agent",
          type: item.type,
          data: item.data,
        }));
        setChats((prev) => [...prev, ...agentChats]);
      } else {
        setChats((prev) => [
          ...prev,
          { role: "agent", type: "text", data: "Sorry, something went wrong." },
        ]);
      }
    } catch (err) {
      setChats((prev) => [
        ...prev,
        { role: "agent", type: "text", data: "Sorry, something went wrong." },
      ]);
    }
    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        // Extract base64 from data URL
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
                textAlign: chat.role === "user" ? "right" : "left",
              }}
            >
              {chat.type === "text" && (
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    borderRadius: 16,
                    background: chat.role === "user" ? "#0070f3" : "#e0e0e0",
                    color: chat.role === "user" ? "#fff" : "#333",
                    maxWidth: "70%",
                    wordBreak: "break-word",
                  }}
                >
                  {chat.data}
                </span>
              )}
              {chat.type === "image" && (
                <img
                  src={`data:image/png;base64,${chat.data}`}
                  alt="uploaded"
                  style={{
                    display: "inline-block",
                    maxWidth: 500,
                    maxHeight: 500,
                    borderRadius: 16,
                    marginLeft: chat.role === "user" ? 0 : 8,
                    marginRight: chat.role === "user" ? 8 : 0,
                    border: "1px solid #ccc",
                    background: "#fff",
                  }}
                />
              )}
            </div>
          ))}
          {loading && (
            <div style={{ textAlign: "left", color: "#888", margin: "8px 0" }}>
              Gemini is typing...
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: 16,
            borderTop: "1px solid #ddd",
            background: "#fff",
          }}
        >
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
            disabled={loading}
          />

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
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;
