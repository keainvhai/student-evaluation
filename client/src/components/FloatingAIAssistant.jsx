import { useState, useEffect } from "react";
import api from "../api";
import "../styles/FloatingAIAssistant.css";

export default function FloatingAIAssistant({ evaluateeName }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const [details, setDetails] = useState({
    role: "",
    contributions: "",
    collab: "",
    strengths: "",
    improvements: "",
    score: "",
  });

  const [showDetails, setShowDetails] = useState(false);

  // ✅ 当首次打开时自动显示欢迎语
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "👋 Hi! I'm your AI Assistant.\nTell me what kind of feedback you’d like to give to your teammate — I can help you draft a constructive evaluation.",
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    const container = document.querySelector(".messages");
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  // const sendMessage = async () => {
  //   if (!input.trim()) return;
  //   const userMsg = { role: "user", content: input };
  //   setMessages([...messages, userMsg]);
  //   setInput("");
  //   try {
  //     const res = await api.post("/ai/generate", {
  //       type: "peer-evaluation",
  //       payload: { evaluateeName, context: input },
  //     });
  //     setMessages((msgs) => [
  //       ...msgs,
  //       { role: "assistant", content: res.data.content },
  //     ]);
  //   } catch {
  //     alert("AI Assistant unavailable");
  //   }
  // };

  const sendMessage = async () => {
    if (!input.trim() && Object.values(details).every((v) => !v.trim())) {
      alert("Please type something or add details first.");
      return;
    }

    const userMsg = { role: "user", content: input || "[Details provided]" };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");

    try {
      const res = await api.post("/ai/generate", {
        type: "peer-evaluation",
        payload: { evaluateeName, context: input, details },
      });
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: res.data.content },
      ]);
    } catch (err) {
      console.error(err);
      alert("AI Assistant unavailable");
    }
  };

  return (
    <div className={`ai-assistant ${open ? "open" : ""}`}>
      <button className="toggle-btn" onClick={() => setOpen(!open)}>
        🤖
      </button>

      {open && (
        <div className="chat-box">
          <div className="chat-header">
            <span>AI Assistant</span>
            <button className="close-btn" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          {/* ✅ 结构化输入区 */}
          <div className="guidance">
            <div className="details-panel">
              <div
                className="details-header"
                onClick={() => setShowDetails(!showDetails)}
              >
                <span>📝 Add teammate details (optional)</span>
                <span>{showDetails ? "▲" : "▼"}</span>
              </div>

              {showDetails && (
                <div className="details-body">
                  <textarea
                    placeholder="Role / Tasks"
                    value={details.role}
                    onChange={(e) =>
                      setDetails({ ...details, role: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Contributions (what / impact)"
                    value={details.contributions}
                    onChange={(e) =>
                      setDetails({ ...details, contributions: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Collaboration & communication"
                    value={details.collab}
                    onChange={(e) =>
                      setDetails({ ...details, collab: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Strengths"
                    value={details.strengths}
                    onChange={(e) =>
                      setDetails({ ...details, strengths: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Areas to improve"
                    value={details.improvements}
                    onChange={(e) =>
                      setDetails({ ...details, improvements: e.target.value })
                    }
                  />
                  <input
                    placeholder="Score (1–5)"
                    type="number"
                    min="1"
                    max="5"
                    value={details.score}
                    onChange={(e) =>
                      setDetails({ ...details, score: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* ✅ 聊天区 */}
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                {m.content}
              </div>
            ))}
          </div>

          {/* ✅ 输入框 */}
          <div className="input-area">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI for feedback..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
