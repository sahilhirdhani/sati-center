import { useGameStore } from "../store/useGameStore";
import { useEffect, useState } from "react";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import VersionPanel from "../components/VersionPanel";
import "../styles/Landing.css";

export default function Landing() {
  const { createGame, joinGame, connectSocket } = useGameStore();
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("");
  const [mode, setMode] = useState("create");

  useEffect(() => connectSocket(), []);

  const handleCreate = () => {
    if (!name.trim()) return;
    createGame(name);
  };

  const handleJoin = () => {
    if (!name.trim() || !gameId.trim()) return;
    joinGame(gameId, name);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (mode === "create" && !gameId.trim()) {
        handleCreate();
      } else if (mode === "join" || gameId.trim()) {
        handleJoin();
      }
    }
  };

  const isJoinMode = gameId.trim() !== "";

  return (
    <div className="landingPage">

      <div className="landingContent">

        <div className="tableLayout">

          <LeftPanel />

          <div className="landingCard">

            <h1 className="mainTitle" style={{textTransform: "uppercase", letterSpacing: "3px"}}>Satti Center</h1>
            <p className="subTitle" style={{fontFamily: "inherit", marginTop: "8px", fontSize: "0.95rem"}}>Classic Card Strategy — Online</p>
            <div className="version" style={{marginTop: "5px", marginBottom: "20px", opacity: 0.3}}>V1.000</div>

            <div style={{background: "radial-gradient(circle at 50% 10%, rgba(255,255,255,0.03), rgba(0,0,0,0.2) 80%)", borderRadius: "16px", padding: "20px 25px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.02)", boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)"}}>
              <div className="formBox" style={{ margin: 0 }}>

                <input
                  className="inputField"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  maxLength="30"
                />

                {(mode === "join" || isJoinMode) && (
                  <input
                    className="inputField"
                    placeholder="Enter game code"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    onKeyDown={handleKeyPress}
                    maxLength="10"
                  />
                )}

              </div>
            </div>

            <div className="buttonGroup">

              <button
                className="primaryBtn"
                disabled={!name.trim() || isJoinMode}
                onClick={handleCreate}
              >
                Create Game
              </button>

              <button
                className="secondaryBtn"
                onClick={() =>
                  isJoinMode ? handleJoin() : setMode("join")
                }
              >
                {isJoinMode ? "Join Game" : "Enter Game ID"}
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