import { useGameStore } from "../store/useGameStore";
import Reconnecting from "./Reconnecting";

export default function Lobby() {
  const {
    gameId,
    players,
    role,
    startGame,
    leaveGame
  } = useGameStore();
  if(!players){
    return <Reconnecting />
  }
  return (
    <div className="lobby">
      <h2>Game ID: {gameId}</h2>

      <h3>Players</h3>
      <ul>
        {players.length}
        {players.map(p => (
          <li key={p.id}>
            p : {p.name} {p.role === "admin" && "(Admin)"}
          </li>
        ))}
      </ul>

      {role === "admin" && (
        <button onClick={startGame}>
          Start Game
        </button>
      )}

      <button onClick={leaveGame}>
        Leave
      </button>
    </div>
  );
}