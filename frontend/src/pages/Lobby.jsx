import { useGameStore } from "../store/useGameStore";
import Reconnecting from "./Reconnecting";
import "../styles/Lobby.css"

export default function Lobby() {
  const { gameId, players, role, startGame, leaveGame } = useGameStore();

  if (!players) return <Reconnecting />;

  return (
    <div className="lobbyPage">
      <div className="lobbyCard">
        <h1 className="mainTitle">Satti Center</h1>
        <div className="version">v0.001 build</div>

        <h2 className="subTitle">Game ID: {gameId}</h2>

        <div className="playersBox">
          <h3 className="subTitle">Players ({players.length})</h3>
          <ul className="playerList">
            {players.map(p => (
              <li key={p.id} className="playerItem">
                {p.name} {p.role === "admin" && "(Admin)"}
              </li>
            ))}
          </ul>
        </div>

        <div className="buttonGroup">
          {role === "admin" && (
            <button className="primaryBtn" onClick={startGame}>
              Start Game
            </button>
          )}
          <button className="secondaryBtn" onClick={leaveGame}>
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}