import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import VersionPanel from "../components/VersionPanel";
import "../styles/Lobby.css"; // Reuse lobby layout logic for Left/Right panel structure
import "../styles/GamePrep.css";

export default function GamePrep() {
  const { players, role, startGame, setScreen } = useGameStore();
  
  const [cheatMode, setCheatMode] = useState(false);
  const [gameMode, setGameMode] = useState("double-sets"); // default if > 4 players

  const isManyPlayers = players.length >= 5;

  const handleStart = () => {
    // Determine layout mode
    let layoutMode = "single";
    if (isManyPlayers) {
      layoutMode = gameMode;
    }
    
    // Start game
    startGame({ layoutMode, cheatMode });
  };
  
  const goBack = () => {
    setScreen("lobby");
  };

  if (role !== "admin") {
    return (
      <div className="lobbyPage">
        <div className="lobbyContent">
          <div className="tableLayout">
            <LeftPanel />
            <div className="landingCard">
              <h1 className="mainTitle" style={{textTransform: "uppercase", letterSpacing: "3px"}}>Satti Center</h1>
              <p className="subTitle" style={{fontFamily: "inherit", marginTop: "8px", fontSize: "0.95rem"}}>Classic Card Strategy — Online</p>
              <div className="version" style={{marginTop: "5px", marginBottom: "20px", opacity: 0.3}}>V1.000</div>

              <div style={{background: "radial-gradient(circle at 50% 10%, rgba(255,255,255,0.03), rgba(0,0,0,0.2) 80%)", borderRadius: "16px", padding: "20px 25px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.02)", boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)"}}>
                  <h2 className="subTitle" style={{fontFamily: "'Cinzel', serif", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "2px", fontSize: "1.05rem", fontWeight: "700"}}>
                    Game Starting...
                  </h2>
                  <p className="subTitle" style={{ fontFamily: "inherit", marginTop: 25, fontSize: "0.95rem" }}>
                    Waiting for host to set up the game...
                  </p>
              </div>
            </div>
            <RightPanel />
          </div>
          <VersionPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="lobbyPage">
      <div className="lobbyContent">
        <div className="tableLayout">
          <LeftPanel />
          <div className="landingCard">
            <h1 className="mainTitle" style={{textTransform: "uppercase", letterSpacing: "3px"}}>Satti Center</h1>
            <p className="subTitle" style={{fontFamily: "inherit", marginTop: "8px", fontSize: "0.95rem"}}>Classic Card Strategy — Online</p>
            <div className="version" style={{marginTop: "5px", marginBottom: "20px", opacity: 0.3}}>V1.000</div>

            <div style={{background: "radial-gradient(circle at 50% 10%, rgba(255,255,255,0.03), rgba(0,0,0,0.2) 80%)", borderRadius: "16px", padding: "20px 25px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.02)", boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)"}}>
                <h2 className="subTitle" style={{fontFamily: "'Cinzel', serif", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "20px", fontSize: "1.05rem", fontWeight: "700"}}>
                  Game Settings
                </h2>

                <div className="settingsGroup" style={{marginTop: '10px'}}>
                    <label style={{ fontFamily: "inherit", fontSize: "1.05rem", fontWeight: "500", display: "flex", alignItems: "center", gap: "10px", justifyContent: 'center' }}>
                        <input 
                          type="checkbox" 
                          style={{width: '20px', height: '20px', cursor: 'pointer', accentColor: "#a855f7"}}
                          checked={cheatMode}
                          onChange={(e) => setCheatMode(e.target.checked)}
                        />
                        Enable Cheats
                    </label>
                </div>

                {isManyPlayers ? (
                  <div className="settingsGroup" style={{marginTop: '35px', textAlign: 'center'}}>
                      <h3 className="subTitle" style={{ fontFamily: "'Cinzel', serif", color: "var(--accent-gold)", marginBottom: "15px", letterSpacing: "1px", fontSize: "0.9rem", textTransform: "uppercase" }}>Game Mode ({players.length} players)</h3>
                      <div style={{ display: "flex", gap: "25px", justifyContent: "center" }}>
                          <label style={{ fontFamily: "inherit", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px", opacity: 0.9 }}>
                              <input 
                                type="radio" 
                                name="gameMode" 
                                value="double-sets"
                                checked={gameMode === "double-sets"}
                                onChange={(e) => setGameMode(e.target.value)}
                              /> 
                              Double Sets
                          </label>
                          <label style={{ fontFamily: "inherit", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px", opacity: 0.9 }}>
                              <input 
                                type="radio" 
                                name="gameMode" 
                                value="double-repeated"
                                checked={gameMode === "double-repeated"}
                                onChange={(e) => setGameMode(e.target.value)}
                              /> 
                              Double Repeated
                          </label>
                      </div>
                  </div>
                ) : (
                  <div className="settingsGroup" style={{marginTop: '25px', textAlign: 'center', opacity: 0.6}}>
                      <p style={{ fontFamily: "inherit", fontSize: "0.9rem", fontStyle: "italic", maxWidth: "250px", margin: "0 auto" }}>
                          you can select game mode when there are more than 4 players
                      </p>
                  </div>
                )}
            </div>

            <div className="buttonGroup">
              <button className="primaryBtn" onClick={handleStart}>Start Now</button>
              <button className="secondaryBtn" onClick={goBack}>Back to Lobby</button>
            </div>

          </div>
          <RightPanel />
        </div>
        <VersionPanel />
      </div>
    </div>
  );
}
