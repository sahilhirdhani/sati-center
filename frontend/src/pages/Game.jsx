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
  const { state, onBackToLobby, leaveGame } = useGameStore();
  const chatMessages = useGameStore((state) => state.chatMessages);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [globalChatPopup, setGlobalChatPopup] = useState(null);

  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      const latestMsg = chatMessages[chatMessages.length - 1];
      
      // Don't show popup for our own messages
      if (state?.you?.name && latestMsg.playerName === state.you.name) {
        return;
      }

      setGlobalChatPopup(`${latestMsg.playerName}: ${latestMsg.text}`);

      const timerId = setTimeout(() => {
        setGlobalChatPopup(null);
      }, 2500);

      return () => clearTimeout(timerId);
    }
  }, [chatMessages, state?.you?.name]);

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

  console.log(state);

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

  const gameTable = (
    <div className="tableArea">
      <Table table={state.table} />
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
        <div className="globalChatPopup">
          {globalChatPopup}
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