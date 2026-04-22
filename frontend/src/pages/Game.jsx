import PlayerList from "../components/PlayerList"; 
import Chatbox from "../components/Chatbox";
import Table from "../components/Table";
import Hand from "../components/Hand";
import { useGameStore } from "../store/useGameStore";
import { useEffect, useState } from "react";
import { dealCards } from "../utils/dealCard";
import "../styles/Game.css";
import Leaderboard from "../components/Leaderboard";

export default function Game() {
  const { state, onBackToLobby, leaveGame, sendAction, playerId } = useGameStore();
  const chatMessages = useGameStore((state) => state.chatMessages);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
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

  useEffect(() => {
    if (state?.you?.hand?.length) {
      dealCards(state.you.hand);
    }
  }, [state?.you?.hand]);

  useEffect(() => {
    const handleOrientationChange = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  if (!state) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        fontSize: "clamp(14px, 4vw, 18px)"
      }}>
        Loading...
      </div>
    );
  }

  const finishedPlayers = state.finishedPlayers;
  const finishOrder = finishedPlayers.map(player => player.id);

  if (finishOrder.length === state.players.length) {
    return (
      <Leaderboard
        players={state.players}
        finishOrder={finishOrder}
        onBackToLobby={onBackToLobby}
        onLeave={leaveGame}
      />
    );
  }

  const isPlayerTurn = state.currentTurnPlayerId === state.you.id;

  const playerList = (
    <PlayerList
      players={state.players}
      currentTurn={state.currentTurnPlayerId}
      finishOrder={finishOrder}
    />
  );

  const chatBox = <Chatbox />;

  // When the player has zero standard playable cards (excluding skip tokens & rollbacks), show a central "Pass" button.
  // This acts as a cover-up so opponents can't tell if they skipped by choice or by lack of cards, 
  // and serves as the primary way to pass when literally stuck (even without cheats).
  const canPlayCard = state.legalMoves.some(m => m.card !== "Skip" && m.card !== "Rollback" && (!m.card || !m.card.isSkipCard));
  const canSkip = state.legalMoves.some(m => m.card === "Skip");
  const showPassButton = isPlayerTurn && !canPlayCard && canSkip;

  const gameTable = (
    <div className="tableArea" style={{ position: "relative" }}>
      <Table table={state.table} legalMoves={state.legalMoves} isPlayerTurn={isPlayerTurn} />
      {showPassButton && (
        <button
          className="primaryBtn"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 50,
            padding: "16px 32px",
            fontSize: "1.2rem",
            width: "fit-content",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
            animation: "pulse 2s infinite"
          }}
          onClick={() => sendAction({ type: "SKIP_TURN" })}
        >
          Pass (No Cards)
        </button>
      )}
    </div>
  );

  const gameHand = (
    <div className="handArea">
      <Hand hand={state.you.hand} legalMoves={state.legalMoves} isPlayerTurn={isPlayerTurn} />
    </div>
  );

  return (
    <div className="gameRoot">
      {globalChatPopup && (
        <div key={globalChatPopup.id} className="globalChatPopup">
          {globalChatPopup.text}
        </div>
      )}

      <div className="gameHeader">
        <h1 className="gameTitle">Satti Center</h1>
        <div className="gameVersion">v0.001 build</div>
      </div>

      {isMobile ? (
        <div className="mobileGameStack">
          {playerList}
          {chatBox}
          {gameTable}
          {gameHand}
        </div>
      ) : (
        <div className="gameBoard">
          <div className="gameSidebar">
            {playerList}
            {chatBox}
          </div>

          <div className="gameMain">
            {gameTable}
            {gameHand}
          </div>
        </div>
      )}

      <div className="gameFooter">
        <button className="secondaryBtn" onClick={leaveGame}>
          Leave Game
        </button>
      </div>

    </div>
  );
}