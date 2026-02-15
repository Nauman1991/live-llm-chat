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
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantText = data.content
        ?.map((block) => (block.type === "text" ? block.text : ""))
        .filter(Boolean)
        .join("\n");

      if (assistantText) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantText },
        ]);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  const examplePrompts = [
    "Explain microservices vs monolith",
    "Write a Python quicksort",
    "Compare REST and GraphQL",
  ];

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea:focus { outline: none; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#ffffff",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "linear-gradient(135deg, #0f172a, #334155)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(15,23,42,0.2)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", letterSpacing: "-0.02em" }}>
              AI Chat Assistant
            </div>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
              Powered by Claude API · LLM Integration Demo
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 6px rgba(34,197,94,0.5)",
            }}
          />
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Connected</span>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              style={{
                marginLeft: 12,
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                color: "#64748b",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#f8fafc";
                e.target.style.borderColor = "#cbd5e1";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#fff";
                e.target.style.borderColor = "#e2e8f0";
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 24px 8px",
        }}
      >
        {messages.length === 0 && !loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              animation: "fadeIn 0.5s ease-out",
              gap: 24,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: "linear-gradient(135deg, #0f172a, #334155)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px rgba(15,23,42,0.2)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 6 }}>
                How can I help you?
              </div>
              <div style={{ fontSize: 14, color: "#94a3b8", maxWidth: 360 }}>
                This chat connects directly to an LLM API. Ask anything to see it in action.
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
              {examplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#475569",
                    fontWeight: 500,
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f1f5f9";
                    e.target.style.borderColor = "#cbd5e1";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#f8fafc";
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} isLatest={i === messages.length - 1} />
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "linear-gradient(135deg, #0f172a, #334155)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div
              style={{
                padding: "8px 16px",
                borderRadius: "18px 18px 18px 4px",
                background: "#f1f5f9",
              }}
            >
              <TypingIndicator />
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: 13,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>⚠</span>
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "16px 24px 20px",
          borderTop: "1px solid #f1f5f9",
          background: "#ffffff",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            background: "#f8fafc",
            borderRadius: 16,
            border: "1.5px solid #e2e8f0",
            padding: "6px 6px 6px 16px",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#94a3b8";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(148,163,184,0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              resize: "none",
              fontSize: 14.5,
              lineHeight: 1.5,
              color: "#1e293b",
              fontFamily: "inherit",
              padding: "8px 0",
              maxHeight: 120,
              overflowY: "auto",
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: "none",
              background:
                input.trim() && !loading
                  ? "linear-gradient(135deg, #0f172a, #334155)"
                  : "#e2e8f0",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={input.trim() && !loading ? "#ffffff" : "#94a3b8"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        
      </div>
    </div>
  );
}
