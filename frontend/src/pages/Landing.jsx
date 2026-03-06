import { useGameStore } from "../store/useGameStore";
import { useEffect, useState } from "react";
import "../styles/Landing.css"

export default function Landing() {
  const { createGame, joinGame, connectSocket } = useGameStore();
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("");
  const [mode, setMode] = useState("create");

  useEffect(() => connectSocket(), []);

  const handleCreate = () => { if (!name.trim()) return; createGame(name); };
  const handleJoin = () => { if (!name.trim() || !gameId.trim()) return; joinGame(gameId, name); };

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
          />

          {mode === "join" && (
            <input
              className="inputField"
              placeholder="Enter game code"
              value={gameId}
              onChange={e => setGameId(e.target.value)}
            />
          )}

          <div className="buttonGroup">
            <button className="primaryBtn" disabled={!name.trim()} onClick={handleCreate}>
              Create Game
            </button>

            <button
              className="secondaryBtn"
              onClick={() => mode === "join" ? handleJoin() : setMode("join")}
              disabled={mode === "join" && (!name || !gameId)}
            >
              {mode === "join" ? "Join Game" : "Enter Game ID"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}