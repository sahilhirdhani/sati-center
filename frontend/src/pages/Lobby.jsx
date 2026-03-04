import { useGameStore } from "../store/useGameStore";

export default function Lobby() {
  const {
    gameId,
    players,
    role,
    startGame,
    leaveGame
  } = useGameStore();

  return (
    <div className="lobby">
      <h2>Game ID: {gameId}</h2>

      <h3>Players</h3>
      <ul>
        {players.map(p => (
          <li key={p.id}>
            {p.name}
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