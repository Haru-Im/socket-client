"use client";
import { socket } from "@/socket";
// pages/index.js
import React, { useEffect, useState } from "react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [text, setText] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<
    {
      message: string;
      id: string;
    }[]
  >([]);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("receive_message", (data) => {
      console.log("Received message:", data);
      setReceivedMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleSendMessage = (e: any) => {
    e.preventDefault();
    console.log("Sending message:", text);
    socket.emit("send_message", {
      id: socket.id,
      message: text,
      targetSocketId: "sIW01fs4fab9HYdAAAAH",
    });
    setText("");
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        backgroundColor: "whitesmoke",
        paddingTop: 12,
        paddingBottom: 12,
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h1
          style={{
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          {"Day's Socket.IO Chat"}
        </h1>
        <p>Status: {isConnected ? "connected" : "disconnected"}</p>
        <p>Transport: {transport}</p>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "scroll",
          gap: 12,
        }}
      >
        {receivedMessages.map((e, i) => {
          const isMe = e.id === socket.id;
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
              key={i}
            >
              <div
                style={{
                  display: "flex",
                  padding: 12,
                  border: isMe ? "1px solid blue" : "1px solid black",
                  borderRadius: 8,
                  gap: 8,
                  alignItems: "center",
                }}
              >
                {!isMe && (
                  <p
                    style={{
                      fontSize: 8,
                      color: "gray",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >{`${socket.id?.slice(0, 4)}:`}</p>
                )}
                <p
                  style={{
                    textAlign: isMe ? "right" : "left",
                    fontSize: 12,
                  }}
                >
                  {e.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <form
        style={{
          padding: 20,
          border: "1px solid black",
          display: "flex",
          gap: 12,
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지를 입력해보세요!"
          style={{ width: 400, borderRadius: 12, padding: 20 }}
        />
        <button
          style={{ borderRadius: 12, paddingLeft: 24, paddingRight: 24 }}
          onClick={handleSendMessage}
        >
          보내기
        </button>
      </form>
    </div>
  );
}
