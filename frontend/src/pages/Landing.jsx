import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

export default function Landing() {
  const { createGame, joinGame, connectSocket } = useGameStore();

  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("");

  useEffect(() => {
    connectSocket();
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return alert("Enter your name");
    createGame(name);
  };

  const handleJoin = () => {
    if (!name.trim() || !gameId.trim())
      return alert("Enter name and game ID");

    joinGame(gameId, name);
  };

  return (
    <div className="landing">
      <h1>Satti Center</h1>

      <input
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Game ID"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
      />

      <div className="buttons">
        <button onClick={handleCreate}>Create Game</button>
        <button onClick={handleJoin}>Join Game</button>
      </div>
    </div>
  );
}