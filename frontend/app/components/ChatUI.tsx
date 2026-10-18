"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const AI_ENGINE = process.env.NEXT_PUBLIC_AI_ENGINE_URL;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  role: string;
  label: string;
  placeholder: string;
}

export default function ChatUI({ role, label, placeholder }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; school_id: number; ai_name: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("access");
    if (!stored || !token) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`${AI_ENGINE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_id: user.school_id,
          user_id: 1,
          role,
          message: userMessage,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || data.detail },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.clear();
    router.push("/");
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{user?.ai_name || "CampusAI"} — {label}</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="messages">
        {messages.length === 0 && (
          <p style={{ color: "#71717a", textAlign: "center", marginTop: 40 }}>
            {placeholder}
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="message assistant">Thinking...</div>}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  );
}
