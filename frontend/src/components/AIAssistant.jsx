import { useState } from "react";

function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your SupplyChainAI assistant. Ask me anything about your inventory, suppliers, warehouses or purchase orders.",
    },
  ]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      // Get logged-in user's JWT
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Send message + JWT to FastAPI
      const response = await fetch("http://localhost:8000/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.response || "AI request failed"
        );
      }

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            data?.response ||
            "I couldn't generate a response.",
        },
      ]);
    } catch (err) {
      console.error("AI Assistant Error:", err);

      let errorMessage =
        "AI service is currently unavailable. Please try again shortly.";

      if (err.message === "Authentication token not found") {
        errorMessage =
          "Your session is missing. Please logout and login again.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* =========================
          Floating AI Button
      ========================= */}

      <button
        className="ai-floating-button"
        onClick={() => setOpen(!open)}
        aria-label="Open AI Assistant"
      >
        <span>✦</span>
      </button>

      {/* =========================
          Chat Window
      ========================= */}

      {open && (
        <div className="ai-chat-window">

          {/* Header */}

          <div className="ai-chat-header">

            <div className="ai-chat-brand">

              <div className="ai-avatar">
                ✦
              </div>

              <div>
                <strong>SupplyChain AI</strong>
                <span>AI Operations Assistant</span>
              </div>

            </div>

            <button
              className="ai-close"
              onClick={() => setOpen(false)}
              aria-label="Close AI Assistant"
            >
              ×
            </button>

          </div>

          {/* Messages */}

          <div className="ai-chat-body">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.role === "user"
                    ? "ai-message user-message"
                    : "ai-message"
                }
              >
                {msg.text}
              </div>
            ))}

            {/* Loading */}

            {loading && (
              <div className="ai-message">
                Thinking...
              </div>
            )}

          </div>

          {/* Input */}

          <form
            className="ai-chat-input"
            onSubmit={sendMessage}
          >

            <input
              type="text"
              placeholder="Ask about your supply chain..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
            >
              ↑
            </button>

          </form>

        </div>
      )}
    </>
  );
}

export default AIAssistant;