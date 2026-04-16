import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import "../styles/Chatbox.css";

export default function Chatbox() {
  const messages = useGameStore((state) => state.chatMessages);
  const sendChatMessage = useGameStore((state) => state.sendChatMessage);
  const currentName = useGameStore((state) => state.name);
  const [text, setText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const messageText = text.trim();
    if (!messageText) return;

    sendChatMessage(messageText);
    setText("");
  };

  return (
    <section className={`chatBox ${isExpanded ? "isExpanded" : "isCollapsed"}`} aria-label="Game chat">
      <div className="chatHeader">
        <h3 className="sectionTitle">Chat</h3>
        <button
          type="button"
          className="chatToggleBtn"
          onClick={() => setIsExpanded((value) => !value)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Shrink" : "Expand"}
        </button>
      </div>

      <div ref={listRef} className="chatMessages" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="chatEmpty">No messages yet.</div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="chatMessage">
              <span className="chatAuthor">{message.playerName}</span>
              <span className="chatText">{message.text}</span>
            </div>
          ))
        )}
      </div>

      <form className="chatComposer" onSubmit={handleSubmit}>
        <input
          className="chatInput"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={currentName ? `Message as ${currentName}` : "Type a message"}
          maxLength={180}
          aria-label="Chat message"
        />
        <button type="submit" className="chatSendBtn" disabled={!text.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}