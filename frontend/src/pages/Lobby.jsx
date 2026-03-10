import { useGameStore } from "../store/useGameStore";
import Reconnecting from "./Reconnecting";
import "../styles/Lobby.css"

export default function Lobby() {
  const { gameId, players, role, startGame, leaveGame } = useGameStore();

  if (!players) return <Reconnecting />;

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
  };

  return (
    <div className="lobbyPage">
      <div className="lobbyCard">
        <h1 className="mainTitle">Satti Center</h1>
        <div className="version">v0.001 build</div>

        <h2 className="subTitle">
          Game ID: {gameId}
          <button
            onClick={copyGameId}
            style={{
              marginLeft: "8px",
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "inherit",
              padding: "4px 8px"
            }}
            title="Copy game ID"
          >
            📋
          </button>
        </h2>

        <div className="playersBox">
          <h3 className="subTitle">Players ({players.length})</h3>
          <ul className="playerList" role="list">
            {players.map(p => (
              <li key={p.id} className="playerItem" role="listitem">
                {p.name} {p.role === "admin" && "(Admin)"}
              </li>
            ))}
          </ul>
        </div>

        <div className="buttonGroup">
          {role === "admin" && (
            <button 
              className="primaryBtn" 
              onClick={startGame}
              aria-label="Start the game"
            >
              Start Game
            </button>
          )}
          <button 
            className="secondaryBtn" 
            onClick={leaveGame}
            aria-label="Leave the game room"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
