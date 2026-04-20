import { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import Reconnecting from "./Reconnecting";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import VersionPanel from "../components/VersionPanel";
import Chatbox from "../components/Chatbox";
import "../styles/Lobby.css"

export default function Lobby() {
  const { gameId, players, role, goToGamePrep, leaveGame, playerId } = useGameStore();
  const chatMessages = useGameStore((state) => state.chatMessages);
  const [globalChatPopup, setGlobalChatPopup] = useState(null);

  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      const latestMsg = chatMessages[chatMessages.length - 1];

      // Block popups for our own messages
      if (latestMsg.playerId === playerId) {
        return;
      }

      setGlobalChatPopup({ id: latestMsg.id, text: `${latestMsg.playerName}: ${latestMsg.text}` });

      const timerId = setTimeout(() => {
        setGlobalChatPopup(null);
      }, 3000);

      return () => clearTimeout(timerId);
    }
  }, [chatMessages, playerId]);

  if (!players) return <Reconnecting />;

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
  };

  return (
    <div className="lobbyPage">
      {globalChatPopup && (
        <div key={globalChatPopup.id} className="globalChatPopup">
          {globalChatPopup.text}
        </div>
      )}
      <div className="lobbyContent">
        <div className="tableLayout">
          <LeftPanel />
          <div className="landingCard">
        <h1 className="mainTitle" style={{textTransform: "uppercase"}}>Satti Center</h1>
        <p className="subTitle" style={{marginTop: "8px", fontSize: "0.95rem"}}>Classic Card Strategy — Online</p>
            <div className="version" style={{marginTop: "5px", marginBottom: "15px", opacity: 0.3}}>V1.000</div>

        <div style={{background: "radial-gradient(circle at 50% 10%, rgba(255,255,255,0.03), rgba(0,0,0,0.2) 80%)", borderRadius: "16px", padding: "15px 20px", marginBottom: "15px", border: "1px solid rgba(255,255,255,0.02)", boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)"}}>
            <h2 className="subTitle" style={{fontFamily: "'Cinzel', serif", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "15px", fontSize: "1.05rem", fontWeight: "700"}}>
              Game ID: {gameId}
              <button
                onClick={copyGameId}
                style={{
                  marginLeft: "10px",
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  padding: "4px",
                  opacity: 0.8
                }}
                title="Copy game ID"
              >
                📋
              </button>
            </h2>

            <div style={{ marginBottom: "15px" }}>
               <Chatbox />
            </div>

            <div className="playersBox">
              <h3 className="subTitle" style={{fontFamily: "'Cinzel', serif", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "10px", fontSize: "0.9rem", fontWeight: "600"}}>
                Players ({players.length})
              </h3>
              <ul className="playerList" style={{ margin: 0, padding: 0}} role="list">
                {players.map(p => (
                  <li key={p.id} className="playerItem" style={{background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "8px 12px", border: "1px solid rgba(255,255,255,0.03)", textAlign: "left", marginBottom: "6px"}} role="listitem">
                    <span style={{opacity: 0.9}}>{p.name}</span> <span style={{opacity: 0.5, fontSize: "0.9rem", marginLeft: "6px"}}>{p.role === "admin" && "(Admin)"}</span>
                  </li>
                ))}
              </ul>
            </div>
        </div>

        <div className="buttonGroup">
          {role === "admin" && (
            <button 
              className="primaryBtn" 
              onClick={goToGamePrep}
              aria-label="Select Mode"
            >
              Select Mode
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
