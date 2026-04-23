# Satti Center: Complete Developer Documentation

This README is a full technical map of the repository for freshers and new contributors.
It documents:
- what the project does
- how frontend and backend start
- how real-time gameplay flows
- where data is stored
- every file and its purpose
- every function group and exported API

---

## 1. What This Project Is

Satti Center is a multiplayer card game system with:
- a decoupled game engine (rules + state transitions)
- a Node.js + Socket.io backend for real-time multiplayer
- a React frontend for game UI
- a console client for local engine testing

Core idea: game rules live in one place, so UI/network can change without rewriting gameplay logic.

---

## 2. Tech Stack

### Frontend
- React 19
- Vite 7
- Zustand (state store)
- Socket.io-client
- Tailwind CSS 4
- Framer Motion
- SweetAlert2

### Backend
- Node.js (ESM modules)
- Express 5
- Socket.io 4
- dotenv
- nanoid

### Storage / DB
- No SQL/NoSQL database is used.
- Runtime game state is stored in memory using a JavaScript `Map` in `backend/src/api/store/gameStore.js`.
- Data resets when server restarts.

---

## 3. Runtime Architecture

High-level flow:
1. Frontend sends socket event (create game, join, action, chat).
2. Backend receives event in WebSocket server.
3. Backend updates in-memory game state.
4. Backend serializes state safely per role (admin/player/spectator).
5. Backend broadcasts updates to room.
6. Frontend Zustand store updates and React re-renders.

---

## 4. Project Entry Points

### Backend entry point
- File: `backend/src/server.js`
- Responsibilities:
  - load env (`dotenv.config()`)
  - create HTTP server from Express app
  - attach socket server via `setupSocketServer(server)`
  - listen on `PORT` (default `5000`)

### Express app setup
- File: `backend/src/app.js`
- Responsibilities:
  - configure CORS for frontend origins
  - parse JSON body
  - health route `GET /`

### Frontend entry point
- File: `frontend/src/main.jsx`
- Responsibilities:
  - mount React root
  - render `<App />`

### Frontend page router shell
- File: `frontend/src/App.jsx`
- Responsibilities:
  - read `screen` from Zustand
  - render screen components (`landing`, `lobby`, `gameprep`, `game`, `reconnecting`)
  - animate transitions with Framer Motion

### Console testing entry point
- File: `backend/src/clients/console/testLocalGame.js`
- Responsibilities:
  - build a local players list
  - run terminal game loop for engine testing

---

## 5. Backend Deep Dive

### 5.1 API Layer

#### `backend/src/api/ws/wsServer.js`
Main real-time gateway.

Export:
- `setupSocketServer(httpServer)`

Important internal handlers:
- `handleCreateGame`: create lobby, assign admin
- `handleJoinGame`: join/rejoin room
- `handleGotoPrep`: move lobby -> prep phase
- `handleUpdateSettings`: update prep settings
- `handleStartGame`: initialize engine state and start match
- `handleAction`: validate + apply player action
- `handleLeaveGame`: remove player and reassign admin if needed
- `handleDisconnect`: handle socket disconnect cleanup
- `handleChatMessage`: append and broadcast chat
- `handleBackToLobby`: reset phase back to lobby
- `broadcastState`: send role-safe game state
- `broadcastLobby`: send lobby roster/state
- `getGameSockets`: resolve sockets in a game room
- `sendError`: send structured error event

#### `backend/src/api/store/gameStore.js`
In-memory game repository.

Exports:
- `createGame(gameId)`
- `getGame(gameId)`
- `removeGame(gameId)`

Game object fields include:
- `id`, `phase`, `players`, `state`, `chatMessages`

#### `backend/src/api/serializers/stateSerializer.js`
Role-based state shaping.

Export:
- `serializeState(state, role, playerId)`

Behavior:
- admin -> full state
- player -> own hand visible, others masked
- spectator -> no hands

---

### 5.2 Game Engine (`backend/src/game`)

#### A) Public Engine API

##### `backend/src/game/index.js`
Exports:
- `createGame({ players, layoutMode, cheatsEnabled })`
- `ACTIONS`

Returned game instance methods:
- `act(action)`
- `getPlayerView(playerId)`
- `getSpectatorView()`
- `getAdminView()`
- `isFinished()`
- `getWinner()`

#### B) Models

##### `backend/src/game/models/card.js`
Export:
- `createCard({ suit, value, deckId })`: build normalized card object.

##### `backend/src/game/models/deck.js`
Export:
- `createDeck(deckCount, cheatsEnabled)`: generate one or more decks.

##### `backend/src/game/models/player.js`
Export:
- `Player` class with fields like `id`, `name`, `hand`, `isActive`, `position`, `isBot`.

##### `backend/src/game/models/table.js`
Export:
- `createTable(layoutMode)`: initialize suit piles per layout mode.

#### C) Core Logic

##### `backend/src/game/core/config.js`
Exports:
- `createGameConfig({ playerCount, layoutMode })`
- `LAYOUT_MODES`

Validates player count and layout, computes deck count.

##### `backend/src/game/core/shuffle.js`
Export:
- `shuffle(deck)`: Fisher-Yates shuffle.

##### `backend/src/game/core/deal.js`
Export:
- `dealCards(deck, players)`: cyclic dealing + hand sorting.

##### `backend/src/game/core/turnActions.js`
Exports:
- `getStartingPlayer(state)`
- `advanceTurn(state)`
- `getCurrentPlayer(state)`
- `rollback(state, playedMoves)`

Internal helpers:
- `canPlayerTakeTurn(state, player)`
- `canBotPlay(state, player)`

Handles turn advancement, bot autoplay decisions, and skip/deadlock logic.

#### D) State

##### `backend/src/game/state/gameState.js`
Exports:
- `createGameState(players, config, cheatsEnabled)`
- `add(table, pile, card)`
- `remove(table, pile, card)`

##### `backend/src/game/state/gameSetup.js`
Export:
- `setupGame(players, layoutMode, cheatsEnabled, extraConfig)`

Internal helpers:
- `buildPlayer(players)`
- `ensureMinimumPlayers(players)`
- `extractRandomSeven(deck)`
- `placeInitialSeven(table, card, layoutMode)`
- `batoPatte()` (local/testing helper)

Creates complete start state: players, deck, table, cards, first turn.

#### E) Actions

##### `backend/src/game/actions/actionTypes.js`
Export:
- `ACTIONS` constants:
  - `PLAY_CARD`
  - `SKIP_TURN`
  - `ROLLBACK_MOVE`

##### `backend/src/game/actions/dispatchAction.js`
Export:
- `dispatchAction(state, action)`

Applies validated actions, updates hand/table/history, detects finish/game end/deadlock conditions.

##### `backend/src/game/actions/gameAction.js`
Exports:
- `finishPlayer(state, playerId)`
- `buildAction(player, move)`
- `endGame(state)`
- `getLeaderboard(state)`

##### `backend/src/game/actions/playCard.js`
Export:
- `playCard(state, cardId, pileKey)`

Note: this appears legacy/alternative to current dispatch flow.

#### F) Validation

##### `backend/src/game/validation/rules.js`
Export:
- `getLegalMoves(hand, table, layoutMode, cheatsEnabled, skipMode)`

Internal:
- `canPlace(card, pile, layoutMode)`

Central legal-move engine.

##### `backend/src/game/validation/validateAction.js`
Export:
- `validateAction(state, action)`

Main validator for turn ownership, player activity, and legal-move conformance.

##### `backend/src/game/validation/turnValidator.js`
Export:
- `validateActions(state, action)`

Note: partially redundant with `validateAction.js` and appears underused.

#### G) Views

##### `backend/src/game/views/adminView.js`
Export:
- `getAdminView(state)`

##### `backend/src/game/views/playerViews.js`
Export:
- `getPlayerView(state, playerId)`

##### `backend/src/game/views/spectatorView.js`
Export:
- `getSpectatorView(state)`

These prevent sensitive info leaks by role.

#### H) Bot

##### `backend/src/game/bot/botAction.js`
Export:
- `pickBotMove(legalMoves)`: random legal move selection.

---

### 5.3 Console Client

#### `backend/src/clients/console/game.js`
Export:
- `runGame(players, layoutMode, cheatsEnabled)`

Internal helpers:
- `printTable(table)`
- `printHand(player)`

Used for local validation and manual rule testing without frontend/backend networking.

#### `backend/src/clients/console/testLocalGame.js`
No exports. Executes local game run script.

---

## 6. Frontend Deep Dive

### 6.1 Network + Store

#### `frontend/src/network/socket.js`
Exports:
- `connect(onMessage, onOpen)`
- `send(msg)`
- `disconnect()`
- `isConnected()`
- `getSocket()`

Internal:
- `getSocketUrl()`

Handles Socket.io client lifecycle and message bridge.

#### `frontend/src/store/useGameStore.js`
Export:
- `useGameStore` (Zustand hook)

Major store methods:
- `setSelectedCardId(id)`
- `setScreen(screen)`
- `connectSocket()`
- `attemptReconnect()`
- `handleMessage(msg)`
- `createGame(name)`
- `joinGame(gameId, name)`
- `goToGamePrep()`
- `updateSettings(settings)`
- `startGame(options)`
- `sendAction(action)`
- `sendChatMessage(text)`
- `leaveGame()`
- `onBackToLobby()`

Internal persistence helpers:
- `saveSession()`
- `loadSession()`
- `clearSession()`

State includes session identifiers, room/game metadata, phase screen, player/table state, chat, reconnect flags.

---

### 6.2 Pages

#### `frontend/src/pages/Landing.jsx`
Purpose: create or join game flow.

#### `frontend/src/pages/Lobby.jsx`
Purpose: waiting room, player list, role controls, chat.

#### `frontend/src/pages/GamePrep.jsx`
Purpose: configure cheats/mode/skip settings before start.

#### `frontend/src/pages/Game.jsx`
Purpose: main in-game board, hand interaction, turn/leaderboard/chat.

#### `frontend/src/pages/Reconnecting.jsx`
Purpose: reconnect status UI.

---

### 6.3 Components

#### `frontend/src/components/Table.jsx`
Export:
- `Table`

Internal helpers:
- `groupPilesBySuit()`
- `handlePileClick()`
- `renderCard()`
- `renderPile()`

#### `frontend/src/components/Hand.jsx`
Export:
- `Hand`

Internal helpers:
- `isCardLegal()`
- `handleCardClick()`
- `handleBackgroundClick()`
- `validMoveCount()`

#### `frontend/src/components/PlayerList.jsx`
Export:
- `PlayerList`

Internal helper:
- `getPosition()`

#### `frontend/src/components/Leaderboard.jsx`
Export:
- `Leaderboard`

#### `frontend/src/components/Chatbox.jsx`
Export:
- `Chatbox`

Internal helper:
- `handleSubmit()`

#### `frontend/src/components/ConfigRulesPanel.jsx`
Export:
- `ConfigRulesPanel`

#### `frontend/src/components/LandingAboutPanel.jsx`
Export:
- `LandingAboutPanel`

#### `frontend/src/components/LandingStartPanel.jsx`
Export:
- `LandingStartPanel`

#### `frontend/src/components/LeftPanel.jsx`
Export:
- `LeftPanel`

#### `frontend/src/components/RightPanel.jsx`
Export:
- `RightPanel`

#### `frontend/src/components/MobileTutorial.jsx`
Export:
- `MobileTutorial`

Internal helpers:
- `handleScroll()`
- `scrollToSlide()`

#### `frontend/src/components/VersionPanel.jsx`
Export:
- `VersionPanel`

---

### 6.4 Utility and Styles

#### `frontend/src/utils/dealCard.js`
Export:
- `dealCards(handCards)` animation helper (currently not wired in gameplay flow).

#### `frontend/src/index.css`
Contains Tailwind base + custom theme variables and reusable utility classes for premium panel/button/input styling.

#### `frontend/index.html`
Root HTML template with font preload and `#root` mount div.

---

## 7. Full File-by-File Map

### Root
- `README.md`: complete documentation (this file)
- `package.json`: root package metadata/dependencies
- `Reel_Ideas.md`: marketing reel idea notes

### Backend
- `backend/package.json`: backend scripts/dependencies
- `backend/src/server.js`: backend bootstrap entry
- `backend/src/app.js`: express app and middleware
- `backend/src/api/ws/wsServer.js`: socket server and event orchestration
- `backend/src/api/store/gameStore.js`: in-memory game registry
- `backend/src/api/serializers/stateSerializer.js`: role-safe state serialization
- `backend/src/clients/console/game.js`: CLI game loop
- `backend/src/clients/console/testLocalGame.js`: CLI test launcher
- `backend/src/game/index.js`: game engine public factory API
- `backend/src/game/actions/actionTypes.js`: action constants
- `backend/src/game/actions/dispatchAction.js`: action execution pipeline
- `backend/src/game/actions/gameAction.js`: helper actions and leaderboard
- `backend/src/game/actions/playCard.js`: alternate legacy play logic
- `backend/src/game/bot/botAction.js`: bot move picker
- `backend/src/game/core/config.js`: game configuration and layout validation
- `backend/src/game/core/deal.js`: card distribution logic
- `backend/src/game/core/shuffle.js`: deck shuffle algorithm
- `backend/src/game/core/turnActions.js`: turn progression and rollback helper
- `backend/src/game/models/card.js`: card model factory
- `backend/src/game/models/deck.js`: deck builder
- `backend/src/game/models/player.js`: player model class
- `backend/src/game/models/table.js`: table model/pile structure
- `backend/src/game/state/gameSetup.js`: end-to-end game initializer
- `backend/src/game/state/gameState.js`: game state factory and table mutation helpers
- `backend/src/game/validation/rules.js`: legal move calculator
- `backend/src/game/validation/turnValidator.js`: additional turn validation helper
- `backend/src/game/validation/validateAction.js`: primary action validator
- `backend/src/game/views/adminView.js`: full privileged view
- `backend/src/game/views/playerViews.js`: player-filtered view
- `backend/src/game/views/spectatorView.js`: public filtered view

### Frontend
- `frontend/README.md`: Vite template README
- `frontend/package.json`: frontend scripts/dependencies
- `frontend/vite.config.js`: vite setup
- `frontend/eslint.config.js`: lint rules
- `frontend/index.html`: html shell
- `frontend/src/main.jsx`: react mount entry
- `frontend/src/App.jsx`: screen switch shell
- `frontend/src/index.css`: global style/theme classes
- `frontend/src/network/socket.js`: websocket client transport
- `frontend/src/store/useGameStore.js`: global app/game store
- `frontend/src/pages/Landing.jsx`: landing page
- `frontend/src/pages/Lobby.jsx`: lobby page
- `frontend/src/pages/GamePrep.jsx`: pre-game config page
- `frontend/src/pages/Game.jsx`: gameplay page
- `frontend/src/pages/Reconnecting.jsx`: reconnect page
- `frontend/src/components/Table.jsx`: table renderer
- `frontend/src/components/Hand.jsx`: player hand renderer
- `frontend/src/components/PlayerList.jsx`: players/turn list
- `frontend/src/components/Leaderboard.jsx`: endgame standings modal
- `frontend/src/components/Chatbox.jsx`: chat UI
- `frontend/src/components/ConfigRulesPanel.jsx`: config help panel
- `frontend/src/components/LandingAboutPanel.jsx`: about panel
- `frontend/src/components/LandingStartPanel.jsx`: start guide panel
- `frontend/src/components/LeftPanel.jsx`: rules panel
- `frontend/src/components/RightPanel.jsx`: gameplay guide panel
- `frontend/src/components/MobileTutorial.jsx`: mobile tutorial carousel
- `frontend/src/components/VersionPanel.jsx`: rotating changelog panel
- `frontend/src/utils/dealCard.js`: deal animation utility

---

## 8. Gameplay Action Pipeline (Step-by-Step)

Example: player plays one card.

1. Player clicks card in `Hand.jsx`.
2. Player clicks target pile in `Table.jsx`.
3. Store calls `sendAction` from `useGameStore.js`.
4. Socket sends `ACTION` through `frontend/src/network/socket.js`.
5. Backend receives in `wsServer.js` `handleAction`.
6. Validation runs via `validateAction(...)` and legal moves from `rules.js`.
7. State mutation runs via `dispatchAction(...)`.
8. Role-safe serialization runs via `stateSerializer.js`.
9. Updated state broadcasts to all room sockets.
10. Frontend receives message, updates Zustand, and UI re-renders.

---

## 9. Game Modes and Settings

Prep settings are configured in `GamePrep.jsx` and sent to backend via `UPDATE_SETTINGS` / `START_GAME`.

Implemented options include:
- layout mode selection
- cheat mode on/off
- skip mode (`infinite` or `limited`)
- limited skip count

Notes:
- rollback behavior exists, with logic split across multiple files.
- bot behavior is random legal move choice.

---

## 10. Run Instructions

### Prerequisites
- Node.js 18+
- npm

### Backend
1. `cd backend`
2. `npm install`
3. `npm run dev`

Default backend URL: `http://localhost:5000`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

Default frontend URL: `http://localhost:5173`

### Console Engine Test
1. from repository root: `node backend/src/clients/console/testLocalGame.js`

---

## 11. Current Limitations

- No persistent database (in-memory only)
- No authentication/authorization layer
- No full REST API (only basic express health route)
- Some legacy/partially used files remain (`playCard.js`, `turnValidator.js`)

---

## 12. Quick Onboarding Path for Freshers

Recommended learning order:
1. Start from backend entry: `backend/src/server.js`
2. Read socket orchestration: `backend/src/api/ws/wsServer.js`
3. Read engine API: `backend/src/game/index.js`
4. Read validator + action executor:
   - `backend/src/game/validation/validateAction.js`
   - `backend/src/game/actions/dispatchAction.js`
5. Read frontend store: `frontend/src/store/useGameStore.js`
6. Read interaction components:
   - `frontend/src/components/Hand.jsx`
   - `frontend/src/components/Table.jsx`

If you understand these files, you understand almost the whole system.