import { useEffect, useState } from "react";
import PlayerList from "../components/PlayerList";
import Chatbox from "../components/Chatbox";
import Table from "../components/Table";
import Hand from "../components/Hand";
import Leaderboard from "../components/Leaderboard";
import { useGameStore } from "../store/useGameStore";
import { dealCards } from "../utils/dealCard";
import "../styles/Game.css";

export default function Game() {
  const { state, onBackToLobby, leaveGame, sendAction, playerId } = useGameStore();
  const chatMessages = useGameStore((gameState) => gameState.chatMessages);
  const [globalChatPopup, setGlobalChatPopup] = useState(null);

  useEffect(() => {
    if (!chatMessages || chatMessages.length === 0) return;

    const latestMessage = chatMessages[chatMessages.length - 1];

    if (latestMessage.playerId === playerId) return;

    setGlobalChatPopup({
      id: latestMessage.id,
      text: `${latestMessage.playerName}: ${latestMessage.text}`,
    });

    const timerId = window.setTimeout(() => {
      setGlobalChatPopup(null);
    }, 3000);

    return () => window.clearTimeout(timerId);
  }, [chatMessages, playerId]);

  useEffect(() => {
    if (state?.you?.hand?.length) dealCards(state.you.hand);
  }, [state?.you?.hand]);

  if (!state) {
    return (
      <div className="sexy-game-root loading-state">
        <div className="sexy-game-bg">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
          <div className="cyber-grid"></div>
        </div>
        <div className="loading-card glass-panel">
          <div className="spinner-dots">
            <div></div><div></div><div></div>
          </div>
          <p>Connecting to Table...</p>
        </div>
      </div>
    );
  }

  const finishedPlayers = state.finishedPlayers || [];
  const finishOrder = finishedPlayers.map((player) => player.id);

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
  const currentTurnPlayer = state.players.find((player) => player.id === state.currentTurnPlayerId);
  const legalPlayCount = state.legalMoves.filter(
    (move) => move.card !== "Skip" && move.card !== "Rollback" && (!move.card || !move.card.isSkipCard)
  ).length;
  const canSkip = state.legalMoves.some((move) => move.card === "Skip");
  const showPassButton = isPlayerTurn && legalPlayCount === 0 && canSkip;

  return (
    <div className="sexy-game-root">
      {/* Immersive Animated Background */}
      <div className="sexy-game-bg">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="cyber-grid"></div>
      </div>

      {globalChatPopup && (
        <div key={globalChatPopup.id} className="global-toast-popup visible">
          {globalChatPopup.text}
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sexy-navbar glass-panel">
        <div className="brand-section">
          <div className="logo-badge">SC</div>
          <div className="brand-text">
            <h1>Satti Center</h1>
            <span>Premium Lounge</span>
          </div>
        </div>

        <div className="status-section">
          <div className="status-pill">
            <span className="pill-label">Legal Moves</span>
            <span className="pill-value">{state.legalMoves.length}</span>
          </div>
          <div className="status-pill">
            <span className="pill-label">Turn</span>
            <span className="pill-value highlight">{currentTurnPlayer?.name || "Waiting"}</span>
          </div>
          <div className={`status-pill ${isPlayerTurn ? 'active' : ''}`}>
            <span className="pill-label">Status</span>
            <span className="pill-value">{isPlayerTurn ? "YOUR MOVE" : "WATCHING"}</span>
          </div>
          <button className="leave-btn sexy-button" onClick={leaveGame}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className="btn-text">Exit</span>
          </button>
        </div>
      </header>

      {/* Main Game Interface */}
      <main className="sexy-dashboard">
        
        {/* Left/Top Sidebar Area */}
        <aside className="sexy-sidebar">
          {/* Players List Card */}
          <div className="glass-panel panel-card players-card">
            <div className="panel-header">
              <h3>Table Intel</h3>
              <span className="seat-count">{state.players.length}/4 Seats</span>
            </div>
            <div className="panel-content">
              <PlayerList
                players={state.players}
                currentTurn={state.currentTurnPlayerId}
                finishOrder={finishOrder}
              />
            </div>
          </div>

          {/* Chatbox Card */}
          <div className="glass-panel panel-card chat-card flex-grow">
            <div className="panel-header">
              <h3>Live Comms</h3>
              <div className="live-indicator"><span className="pulse-dot"></span></div>
            </div>
            <div className="panel-content unpadded chatbox-wrapper">
              <Chatbox />
            </div>
          </div>
        </aside>

        {/* Center Board Area */}
        <section className="sexy-board-area">
          <div className="glass-panel table-wrapper">
            <Table table={state.table} legalMoves={state.legalMoves} isPlayerTurn={isPlayerTurn} />
            
            {showPassButton && (
              <div className="pass-action-wrapper">
                <button
                  className="sexy-button pass-btn glow-effect"
                  onClick={() => sendAction({ type: "SKIP_TURN" })}
                >
                  Pass Turn (No Valid Cards)
                </button>
              </div>
            )}
          </div>

          {/* Bottom Hand Area */}
          <div className={`glass-panel hand-wrapper ${isPlayerTurn ? 'is-turn' : ''}`}>
            <div className="hand-header">
              <h3>Your Hand</h3>
              <span className="card-count">{state.you.hand.length} Cards Remaining</span>
            </div>
            <div className="hand-content">
              <Hand hand={state.you.hand} legalMoves={state.legalMoves} isPlayerTurn={isPlayerTurn} />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
