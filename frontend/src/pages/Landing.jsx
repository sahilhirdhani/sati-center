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

            <h1 className="mainTitle">Satti Center</h1>
            <p className="subTitle">Classic Card Strategy — Online</p>
            <div className="version">V1.000</div>

            <div className="formBox">

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

          </div>

          <RightPanel />

        </div>

        <VersionPanel />

      </div>

    </div>
  );
}