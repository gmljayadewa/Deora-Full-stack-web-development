"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type Message = { role: "user" | "assistant"; content: string };

// Change these two lines to use other images from the public/ folder
const BOT_AVATAR = "/bot-avatar.svg";
const USER_AVATAR = "/user-avatar.svg";

function Avatar({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={32}
      height={32}
      unoptimized
      className="h-8 w-8 shrink-0 rounded-full object-cover"
    />
  );
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! Ask me about Deora products 🌿" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 40_000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        signal: controller.signal,
      });
      const data = await res.json();

      let reply: string;
      if (res.ok) {
        reply = data.reply;
      } else if (res.status === 429) {
        reply = "You are sending messages too fast. Please wait a minute.";
      } else if (res.status === 503) {
        reply = "The assistant is busy right now. Please try again in a moment.";
      } else {
        reply = "Sorry, something went wrong. Please try again.";
      }

      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-125 w-full max-w-md flex-col rounded-lg border bg-white shadow">
      <div className="flex items-center gap-2 border-b px-4 py-3 font-semibold">
        <Avatar src={BOT_AVATAR} alt="Deo" />
        Deo
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div
              key={i}
              className={`flex items-end gap-2 ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Avatar
                src={isUser ? USER_AVATAR : BOT_AVATAR}
                alt={isUser ? "You" : "Deo"}
              />
              <div
                className={`max-w-[75%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                  isUser
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-end gap-2">
            <Avatar src={BOT_AVATAR} alt="Deo" />
            <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">
              Typing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t px-4 py-3">
        <input
          value={input}
          maxLength={500}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about a product..."
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="rounded bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}