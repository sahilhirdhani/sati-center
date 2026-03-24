import { useGameStore } from "../store/useGameStore";
import Reconnecting from "./Reconnecting";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import VersionPanel from "../components/VersionPanel";
import "../styles/Lobby.css"

export default function Lobby() {
  const { gameId, players, role, startGame, leaveGame } = useGameStore();

  if (!players) return <Reconnecting />;

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
  };

  return (
    <div className="lobbyPage">
      <div className="lobbyContent">
        <div className="tableLayout">
          <LeftPanel />
          <div className="landingCard">
        <h1 className="mainTitle">Satti Center</h1>
        <div className="version">v 1.001</div>

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
        <RightPanel />
        </div>
        <VersionPanel />
      </div>
    </div>
  );
}
