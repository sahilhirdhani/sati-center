import { useGameStore } from "../store/useGameStore";

export default function Game() {
  const { state, leaveGame } = useGameStore();

  if (!state) return <div>Loading...</div>;

  return (
    <div className="game">
      <h2>Game Running</h2>

      <pre>
        {JSON.stringify(state, null, 2)}
      </pre>

      <button onClick={leaveGame}>
        Leave Game
      </button>
    </div>
  );
}