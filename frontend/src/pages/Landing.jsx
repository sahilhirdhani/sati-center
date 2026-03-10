import { useGameStore } from "../store/useGameStore";
import { useEffect, useState } from "react";
import "../styles/Landing.css"

export default function Landing() {
  const { createGame, joinGame, connectSocket } = useGameStore();
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("");
  const [mode, setMode] = useState("create");

  useEffect(() => connectSocket(), []);

  const handleCreate = () => { 
    if (!name.trim()) return; 
    createGame(name); 
  };

  const handleJoin = () => { 
    if (!name.trim() || !gameId.trim()) return; 
    joinGame(gameId, name); 
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (mode === "create" && !gameId.trim()) {
        handleCreate();
      } else if (mode === "join" || gameId.trim()) {
        handleJoin();
      }
    }
  };

  const isJoinMode = gameId.trim() !== "";

  return (
    <div className="landingPage">
      <div className="landingCard">
        <h1 className="mainTitle">Satti Center</h1>
        <p className="subTitle">Classic Card Strategy — Online</p>
        <div className="version">v0.001 build</div>

        <div className="formBox">
          <input
            className="inputField"
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            type="text"
            maxLength="30"
            autoFocus
          />

          {(mode === "join" || isJoinMode) && (
            <input
              className="inputField"
              placeholder="Enter game code"
              value={gameId}
              onChange={e => setGameId(e.target.value)}
              onKeyPress={handleKeyPress}
              type="text"
              maxLength="10"
            />
          )}

          <div className="buttonGroup">
            <button 
              className="primaryBtn" 
              disabled={!name.trim() || isJoinMode} 
              onClick={handleCreate}
              aria-label="Create a new game"
              style={{
                opacity: isJoinMode ? 0.4 : 1,
              }}
            >
              Create Game
            </button>

            <button
              className={`secondaryBtn ${isJoinMode ? "joinHighlight" : ""}`}
              onClick={() => isJoinMode ? handleJoin() : setMode("join")}
              disabled={isJoinMode && (!name || !gameId)}
              aria-label={isJoinMode ? "Join game" : "Enter game ID"}
              style={{
                background: isJoinMode 
                  ? "linear-gradient(135deg, #ffd700, #ffed4e)" 
                  : "linear-gradient(135deg, #2ec27e, #1ea764)",
                color: isJoinMode ? "#111" : "white",
                fontWeight: isJoinMode ? "700" : "700",
                boxShadow: isJoinMode ? "0 0 16px rgba(255, 215, 0, 0.6)" : "none"
              }}
            >
              {isJoinMode ? "Join Game" : "Enter Game ID"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
