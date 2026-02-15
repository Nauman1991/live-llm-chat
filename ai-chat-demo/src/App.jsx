import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = "You are a helpful, concise AI assistant. Keep responses clear and well-structured. Use markdown formatting sparingly.";

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 6, padding: "8px 0", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#64748b",
            animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function MessageBubble({ role, content, isLatest }) {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 16,
        animation: isLatest ? "slideUp 0.3s ease-out" : "none",
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "linear-gradient(135deg, #0f172a, #334155)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
            marginTop: 4,
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(15,23,42,0.2)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      )}
      <div
        style={{
          maxWidth: "75%",
          padding: "12px 16px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser
            ? "linear-gradient(135deg, #0f172a, #1e293b)"
            : "#f1f5f9",
          color: isUser ? "#f1f5f9" : "#1e293b",
          fontSize: 14.5,
          lineHeight: 1.65,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          boxShadow: isUser
            ? "0 2px 12px rgba(15,23,42,0.25)"
            : "0 1px 4px rgba(0,0,0,0.06)",
          letterSpacing: "0.01em",
        }}
      >
        {content}
      </div>
    </div>
  );
}

export default function AIChatDemo() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // No client-side API key check needed with backend proxy functionality

    const userMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);

    // Reset textarea height
    e.target.style.height = "auto";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to fetch response");
      }

      const data = await response.json();
      const assistantMessage = data.content?.[0]?.text || "No response content.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (err) {
      console.error("Chat Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      // Construct a new ref focus to keep user in flow
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          paddingBottom: 20,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 10h.01M12 10h.01M16 10h.01" />
            </svg>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>AI Chat Assistant</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Powered by Claude API · LLM Integration Demo</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a
            href="/documentation.html"
            target="_blank"
            style={{
              fontSize: 13,
              color: "#64748b",
              textDecoration: "none",
            }}
          >
            Docs
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 0 4px rgba(34,197,94,0.1)",
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>Connected</span>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Clear all messages?")) setMessages([]);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "white",
              fontSize: 13,
              fontWeight: 500,
              color: "#64748b",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Clear
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: 8,
          marginBottom: 20,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.5,
              marginTop: -60,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: "#f1f5f9",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>No messages yet</p>
            <p style={{ margin: "4px 0 24px", fontSize: 14 }}>Start a conversation with the AI</p>
            <div style={{ display: "flex", gap: 10 }}>
              {["Explain quantum physics", "Write a Python quicksort", "Haiku about coding"].map((txt) => (
                <button
                  key={txt}
                  onClick={() => setInput(txt)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 20,
                    border: "1px solid #e2e8f0",
                    background: "white",
                    fontSize: 13,
                    color: "#475569",
                    cursor: "pointer",
                    transition: "transform 0.1s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.target.style.background = "white")}
                >
                  {txt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={i}
              role={msg.role}
              content={msg.content}
              isLatest={i === messages.length - 1}
            />
          ))
        )}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "linear-gradient(135deg, #0f172a, #334155)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
                marginTop: 4,
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "18px 18px 18px 4px",
                background: "#f1f5f9",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <TypingIndicator />
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              margin: "12px 0",
              padding: "12px 16px",
              borderRadius: 8,
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#b91c1c",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ position: "relative" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            borderRadius: 16,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #e2e8f0",
            padding: "8px 8px 8px 16px",
            display: "flex",
            alignItems: "flex-end",
            transition: "box-shadow 0.2s",
          }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)")}
          onBlur={(e) => (e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)")}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight(e);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              resize: "none",
              outline: "none",
              padding: "10px 0",
              fontSize: 15,
              lineHeight: 1.5,
              maxHeight: 200,
              color: "#1e293b",
            }}
          />
          <div style={{ display: "flex", gap: 8, paddingBottom: 4, paddingRight: 4 }}>
            <button
              type="button"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "none",
                background: "transparent",
                color: "#10b981",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Model connected"
            >
              <div style={{ position: "relative" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                  <path d="M8.5 8.5v.01" />
                  <path d="M16 15.5v.01" />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 8,
                    height: 8,
                    background: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ width: 6, height: 6, background: "#10b981", borderRadius: "50%" }} />
                </div>
              </div>
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "none",
                background: loading || !input.trim() ? "#e2e8f0" : "#0f172a",
                color: loading || !input.trim() ? "#94a3b8" : "white",
                cursor: loading || !input.trim() ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    animation: "spin 1s linear infinite",
                  }}
                >
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
