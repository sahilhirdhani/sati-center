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
## 13. Exhaustive Function Index (Auto-Extracted)

- backend\src\api\serializers\stateSerializer.js:5 -> export function serializeState(state, role, playerId = null) {
- backend\src\api\serializers\stateSerializer.js:6 -> switch(role) {
- backend\src\api\store\gameStore.js:6 -> // export function createGame(gameId, players, config) {
- backend\src\api\store\gameStore.js:15 -> export function createGame(gameId) {
- backend\src\api\store\gameStore.js:28 -> export function getGame(gameId) {
- backend\src\api\store\gameStore.js:32 -> export function removeGame(gameId) {
- backend\src\api\ws\wsServer.js:9 -> export function setupSocketServer(httpServer) {
- backend\src\api\ws\wsServer.js:28 -> switch (msg.type) {
- backend\src\api\ws\wsServer.js:74 -> function handleCreateGame(io, socket, msg) {
- backend\src\api\ws\wsServer.js:107 -> function handleJoinGame(io, socket, msg) {
- backend\src\api\ws\wsServer.js:113 -> if (msg.playerId && game.players.has(msg.playerId)) {
- backend\src\api\ws\wsServer.js:142 -> if (game.phase === "PREP") {
- backend\src\api\ws\wsServer.js:144 -> if (game.prepSettings) {
- backend\src\api\ws\wsServer.js:151 -> if (game.phase !== "LOBBY" && game.phase !== "PREP") {
- backend\src\api\ws\wsServer.js:183 -> if (game.phase === "PREP") {
- backend\src\api\ws\wsServer.js:185 -> if (game.prepSettings) {
- backend\src\api\ws\wsServer.js:191 -> function handleGotoPrep(io, socket, msg) {
- backend\src\api\ws\wsServer.js:202 -> for (const client of clients) {
- backend\src\api\ws\wsServer.js:207 -> function handleUpdateSettings(io, socket, msg) {
- backend\src\api\ws\wsServer.js:217 -> for (const client of clients) {
- backend\src\api\ws\wsServer.js:219 -> if (client.data.role !== "admin") {
- backend\src\api\ws\wsServer.js:225 -> function handleStartGame(io, socket, msg) {
- backend\src\api\ws\wsServer.js:230 -> if (role !== "admin") {
- backend\src\api\ws\wsServer.js:243 -> function handleAction(io, socket, action) {
- backend\src\api\ws\wsServer.js:247 -> if (!game || game.phase !== "PLAYING") {
- backend\src\api\ws\wsServer.js:254 -> if (!validation.ok) {
- backend\src\api\ws\wsServer.js:261 -> if (game.state?.deadlockWarning) {
- backend\src\api\ws\wsServer.js:263 -> for (const client of clients) {
- backend\src\api\ws\wsServer.js:273 -> function handleLeaveGame(io, socket) {
- backend\src\api\ws\wsServer.js:282 -> if (leavingPlayer?.role === "admin") {
- backend\src\api\ws\wsServer.js:284 -> if (remainingPlayers.length > 0) {
- backend\src\api\ws\wsServer.js:289 -> for (const client of sockets) {
- backend\src\api\ws\wsServer.js:290 -> if (client.data.playerId === newAdmin.id) {
- backend\src\api\ws\wsServer.js:302 -> function handleDisconnect(io, socket) {
- backend\src\api\ws\wsServer.js:310 -> if (player) {
- backend\src\api\ws\wsServer.js:317 -> function broadcastState(io, gameId) {
- backend\src\api\ws\wsServer.js:323 -> for (const socket of clients) {
- backend\src\api\ws\wsServer.js:333 -> function broadcastLobby(io, gameId) {
- backend\src\api\ws\wsServer.js:340 -> for (const socket of clients) {
- backend\src\api\ws\wsServer.js:349 -> function getGameSockets(io, gameId) {
- backend\src\api\ws\wsServer.js:358 -> function sendError(socket, err) {
- backend\src\api\ws\wsServer.js:365 -> function handleBackToLobby(io, socket, msg) {
- backend\src\api\ws\wsServer.js:376 -> function handleChatMessage(io, socket, msg) {
- backend\src\api\ws\wsServer.js:395 -> if (game.chatMessages.length > 100) {
- backend\src\clients\console\game.js:14 -> function printTable(table) {
- backend\src\clients\console\game.js:16 -> for (const key in table) {
- backend\src\clients\console\game.js:28 -> function printHand(player) {
- backend\src\clients\console\game.js:35 -> export function runGame(players, layoutMode, cheatsEnabled) {
- backend\src\clients\console\game.js:39 -> while(!state.winner){
- backend\src\clients\console\game.js:54 -> if(view.legalMoves.length === 0) {
- backend\src\clients\console\game.js:61 -> if(validateAction(state, action).ok){
- backend\src\clients\console\game.js:70 -> if(player.isBot){
- backend\src\clients\console\game.js:78 -> if(!player.isBot){
- backend\src\clients\console\game.js:89 -> if (choice < 0 || choice >= view.legalMoves.length) {
- backend\src\clients\console\game.js:96 -> if(!move){
- backend\src\clients\console\game.js:107 -> if(result.ok){
- backend\src\game\index.js:9 -> export function createGame( { players, layoutMode, cheatsEnabled }) {
- backend\src\game\index.js:13 -> act(action) {
- backend\src\game\index.js:21 -> getPlayerView(playerId) {
- backend\src\game\index.js:25 -> getSpectatorView() {
- backend\src\game\index.js:29 -> getAdminView() {
- backend\src\game\index.js:33 -> isFinished() {
- backend\src\game\index.js:37 -> getWinner() {
- backend\src\game\actions\dispatchAction.js:6 -> export function dispatchAction(state, action) {
- backend\src\game\actions\dispatchAction.js:10 -> if (state.isDeadlocked) {
- backend\src\game\actions\dispatchAction.js:14 -> switch (action.type) {
- backend\src\game\actions\dispatchAction.js:26 -> if (card.isSkipCard) {
- backend\src\game\actions\dispatchAction.js:32 -> if (player.hand.length === 0) {
- backend\src\game\actions\dispatchAction.js:50 -> if (player.hand.length === 0 || player.hand.every(c => c.isSkipCard)) {
- backend\src\game\actions\dispatchAction.js:68 -> if (activeCount > 0 && state.consecutiveSkips >= activeCount) {
- backend\src\game\actions\dispatchAction.js:74 -> if (state.cheatsEnabled && state.config.skipMode === "infinite") {
- backend\src\game\actions\dispatchAction.js:77 -> for (let i = recentSkips.length - 1; i >= 0; i--) {
- backend\src\game\actions\dispatchAction.js:78 -> if (recentSkips[i].type === ACTIONS.SKIP_TURN) {
- backend\src\game\actions\dispatchAction.js:80 -> if (p && !p.isBot) {
- backend\src\game\actions\dispatchAction.js:97 -> if (last.type === ACTIONS.PLAY_CARD) {
- backend\src\game\actions\gameAction.js:3 -> export function finishPlayer(state, playerId) {
- backend\src\game\actions\gameAction.js:15 -> if (activePlayers.length === 1) {
- backend\src\game\actions\gameAction.js:22 -> if(state.finishedPlayers.length >= state.players.length) {
- backend\src\game\actions\gameAction.js:27 -> export function buildAction(player, move){
- backend\src\game\actions\gameAction.js:28 -> if(move.card === "Skip"){
- backend\src\game\actions\gameAction.js:48 -> export function endGame(state) {
- backend\src\game\actions\gameAction.js:52 -> export function getLeaderboard(state) {
- backend\src\game\actions\playCard.js:6 -> export function playCard(state, cardId, pileKey) {
- backend\src\game\actions\playCard.js:26 -> if (move.card.isSkipCard) {
- backend\src\game\actions\playCard.js:36 -> if (player.hand.length === 0) {
- backend\src\game\actions\playCard.js:40 -> if (!state.winner){
- backend\src\game\bot\botAction.js:1 -> export function pickBotMove(legalMoves) {
- backend\src\game\core\config.js:10 -> export function createGameConfig({ playerCount, layoutMode }) {
- backend\src\game\core\config.js:11 -> if (playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
- backend\src\game\core\config.js:19 -> if (decks === 2) {
- backend\src\game\core\config.js:20 -> if (!Object.values(LAYOUT_MODES).includes(layoutMode)) {
- backend\src\game\core\config.js:23 -> if (layoutMode === LAYOUT_MODES.DOUBLE_SETS) {
- backend\src\game\core\deal.js:1 -> export function dealCards(deck, players) {
- backend\src\game\core\deal.js:2 -> if (!Array.isArray(deck) || !Array.isArray(players)) {
- backend\src\game\core\deal.js:8 -> while( deck.length ) {
- backend\src\game\core\shuffle.js:1 -> export function shuffle(deck) {
- backend\src\game\core\shuffle.js:2 -> for (let i = deck.length - 1; i > 0; i--) {
- backend\src\game\core\turnActions.js:7 -> function canPlayerTakeTurn (state, player) {
- backend\src\game\core\turnActions.js:20 -> function canBotPlay (state, player) {
- backend\src\game\core\turnActions.js:29 -> if(legalMoves.length > 0){
- backend\src\game\core\turnActions.js:35 -> if (state.cheatsEnabled && state.config.skipMode === "infinite") {
- backend\src\game\core\turnActions.js:37 -> if (hasStandardMoves) {
- backend\src\game\core\turnActions.js:43 -> if (player.hand.every(c => c.isSkipCard)) {
- backend\src\game\core\turnActions.js:45 -> if (physicalSkips.length > 0) {
- backend\src\game\core\turnActions.js:61 -> export function getStartingPlayer (state) {
- backend\src\game\core\turnActions.js:62 -> for (let i=0; i<state.players.length; i++) {
- backend\src\game\core\turnActions.js:64 -> if(canPlayerTakeTurn(state, player)) {
- backend\src\game\core\turnActions.js:65 -> if(player.id.startsWith('bot')){
- backend\src\game\core\turnActions.js:76 -> if (state.cheatsEnabled && state.config.skipMode === "infinite") {
- backend\src\game\core\turnActions.js:78 -> if (hasStandardMoves) {
- backend\src\game\core\turnActions.js:87 -> if (player.hand.every(c => c.isSkipCard)) {
- backend\src\game\core\turnActions.js:94 -> if (botMoves.length === 0) {
- backend\src\game\core\turnActions.js:111 -> export function advanceTurn(state) {
- backend\src\game\core\turnActions.js:120 -> if (state.isDeadlocked) {
- backend\src\game\core\turnActions.js:128 -> while (true) {
- backend\src\game\core\turnActions.js:132 -> if(player.isBot){
- backend\src\game\core\turnActions.js:146 -> export function getCurrentPlayer(state) {
- backend\src\game\core\turnActions.js:150 -> export function rollback(state, playedMoves){
- backend\src\game\core\turnActions.js:159 -> if(lastMove.card === "skip"){
- backend\src\game\models\card.js:1 -> export function createCard({ suit, value, deckId}) {
- backend\src\game\models\card.js:2 -> if (!suit || typeof value !== "number") {
- backend\src\game\models\deck.js:10 -> export function createDeck(deckCount = 1, cheatsEnabled = false) {
- backend\src\game\models\deck.js:13 -> for (let d = 0; d< deckCount; d++){
- backend\src\game\models\deck.js:14 -> for (const suit of SUITS){
- backend\src\game\models\deck.js:15 -> for (const value of VALUES) {
- backend\src\game\models\player.js:1 -> class Player {
- backend\src\game\models\player.js:2 -> constructor(id, name, isBot = false) {
- backend\src\game\models\table.js:3 -> export function createTable (layoutMode) {
- backend\src\game\models\table.js:4 -> if (layoutMode === LAYOUT_MODES.SINGLE || layoutMode === LAYOUT_MODES.DOUBLE_REPEATED) {
- backend\src\game\state\gameSetup.js:11 -> function batoPatte(deck, players) {
- backend\src\game\state\gameSetup.js:73 -> function buildPlayer(players) {
- backend\src\game\state\gameSetup.js:74 -> for(let i=0; i < players.length; i++){
- backend\src\game\state\gameSetup.js:80 -> function ensureMinimumPlayers(players) {
- backend\src\game\state\gameSetup.js:83 -> while (players.length < MIN_PLAYERS) {
- backend\src\game\state\gameSetup.js:90 -> function extractRandomSeven(deck) {
- backend\src\game\state\gameSetup.js:101 -> function placeInitialSeven(table, card, layoutMode) {
- backend\src\game\state\gameSetup.js:102 -> if (layoutMode === 'single') {
- backend\src\game\state\gameSetup.js:107 -> for (const key in table) {
- backend\src\game\state\gameSetup.js:108 -> if (key.startsWith(card.suit)) {
- backend\src\game\state\gameSetup.js:115 -> export function setupGame(players, layoutMode, cheatsEnabled, extraConfig = {}) {
- backend\src\game\state\gameSetup.js:141 -> if (config.skipMode === 'limited') {
- backend\src\game\state\gameSetup.js:143 -> for (const p of state.players) {
- backend\src\game\state\gameSetup.js:144 -> for (let i = 0; i < numSkips; i++) {
- backend\src\game\state\gameState.js:4 -> export function createGameState (players, config, cheatsEnabled) {
- backend\src\game\state\gameState.js:25 -> export const add = (table, pile, card) => {
- backend\src\game\state\gameState.js:27 -> if(table[pile].length!==0 && (card.value === table[pile][table[pile].length-1].value + 1 || card.value === table[pile][table[pile].length-1].value)){
- backend\src\game\state\gameState.js:35 -> export const remove = (table, pile, card) => {
- backend\src\game\state\gameState.js:39 -> if (arr[arr.length - 1].id === card.id) {
- backend\src\game\validation\rules.js:1 -> function canPlace (card, pile, layoutMode) {
- backend\src\game\validation\rules.js:7 -> if(layoutMode === 'double-repeated'){
- backend\src\game\validation\rules.js:8 -> if(len===1){
- backend\src\game\validation\rules.js:13 -> if (max === pile[len-2].value ) {
- backend\src\game\validation\rules.js:16 -> if (min === pile[1].value){
- backend\src\game\validation\rules.js:19 -> if(max-1 === pile[len-2].value){
- backend\src\game\validation\rules.js:22 -> if(min+1 === pile[1].value){
- backend\src\game\validation\rules.js:32 -> export function getLegalMoves(hand, table, layoutMode, cheatsEnabled, skipMode = 'infinite') {
- backend\src\game\validation\rules.js:39 -> if(layoutMode === 'double-sets'){
- backend\src\game\validation\rules.js:40 -> for (const card of hand) {
- backend\src\game\validation\rules.js:41 -> if (card.isSkipCard) {
- backend\src\game\validation\rules.js:45 -> if (card.value === 7) {
- backend\src\game\validation\rules.js:46 -> for (const key in table) {
- backend\src\game\validation\rules.js:47 -> if (table[key].length === 0 && key === card.suit+`_1`) {
- backend\src\game\validation\rules.js:50 -> if (table[key].length === 0 && key === card.suit+`_2`){
- backend\src\game\validation\rules.js:58 -> if(canPlace(card, pile1, layoutMode)){
- backend\src\game\validation\rules.js:61 -> if(canPlace(card, pile2, layoutMode)){
- backend\src\game\validation\rules.js:68 -> for(const card of hand){
- backend\src\game\validation\rules.js:69 -> if (card.isSkipCard) {
- backend\src\game\validation\rules.js:74 -> if(canPlace(card, pile, layoutMode)){
- backend\src\game\validation\rules.js:80 -> if (skipMode === 'limited') {
- backend\src\game\validation\rules.js:82 -> for(const sc of skipCards) {
- backend\src\game\validation\rules.js:86 -> if (cheatsEnabled) {
- backend\src\game\validation\rules.js:94 -> if (standardBaseMoves.length === 0) {
- backend\src\game\validation\rules.js:99 -> if (cheatsEnabled) {
- backend\src\game\validation\rules.js:104 -> if (standardBaseMoves.length === 0) {
- backend\src\game\validation\turnValidator.js:4 -> export function validateActions(state, action) {
- backend\src\game\validation\turnValidator.js:12 -> if(!state.started) {
- backend\src\game\validation\turnValidator.js:17 -> if(!player) {
- backend\src\game\validation\turnValidator.js:21 -> if(!player.isActive){
- backend\src\game\validation\turnValidator.js:26 -> if (currentPlayer.id !== playerId) {
- backend\src\game\validation\turnValidator.js:30 -> if ((type === "SKIP" || type === "ROLLBACK") && !state.cheatsEnabled) {
- backend\src\game\validation\turnValidator.js:34 -> if (type === "SKIP") {
- backend\src\game\validation\turnValidator.js:38 -> if (type === "ROLLBACK") {
- backend\src\game\validation\turnValidator.js:42 -> if (type === "PLAY") {
- backend\src\game\validation\turnValidator.js:54 -> if (!isLegal) {
- backend\src\game\validation\validateAction.js:5 -> export function validateAction(state, action) {
- backend\src\game\validation\validateAction.js:6 -> if (!state.started || state.winner) {
- backend\src\game\validation\validateAction.js:12 -> if (!currentPlayer || action.playerId !== currentPlayer.id) {
- backend\src\game\validation\validateAction.js:16 -> if (!currentPlayer.isActive) {
- backend\src\game\validation\validateAction.js:28 -> switch (action.type) {
- backend\src\game\validation\validateAction.js:31 -> if (!action.cardId || !action.pileKey) {
- backend\src\game\validation\validateAction.js:47 -> if (!state.cheatsEnabled) {
- backend\src\game\validation\validateAction.js:54 -> if (!state.cheatsEnabled) {
- backend\src\game\validation\validateAction.js:57 -> if (state.moveHistory.length === 0) {
- backend\src\game\views\adminView.js:1 -> export function getAdminView(state) {
- backend\src\game\views\playerViews.js:4 -> export function getPlayerView(state, playerId) {
- backend\src\game\views\spectatorView.js:1 -> // export function getSpectatorView(state) {
- backend\src\game\views\spectatorView.js:19 -> export function getSpectatorView(state) {
- frontend\src\App.jsx:22 -> export default function App() {
- frontend\src\components\Chatbox.jsx:5 -> export default function Chatbox() {
- frontend\src\components\Chatbox.jsx:19 -> const handleSubmit = (event) => {
- frontend\src\components\ConfigRulesPanel.jsx:3 -> export default function ConfigRulesPanel() {
- frontend\src\components\Hand.jsx:5 -> const Hand = memo(function Hand({ hand, legalMoves, isPlayerTurn }) {
- frontend\src\components\Hand.jsx:21 -> const suitSymbol = (suit) => {
- frontend\src\components\Hand.jsx:28 -> const cardSymbol = (value) => {
- frontend\src\components\Hand.jsx:36 -> const isCardLegal = (card) => {
- frontend\src\components\Hand.jsx:40 -> const handleCardClick = (card) => {
- frontend\src\components\Hand.jsx:45 -> if (selectedCardId === card.id) {
- frontend\src\components\Hand.jsx:50 -> if (validMoves.length > 1) {
- frontend\src\components\Hand.jsx:67 -> if (selectedCardId !== null) {
- frontend\src\components\Hand.jsx:68 -> if (isLegal) {
- frontend\src\components\Hand.jsx:76 -> if (isLegal) {
- frontend\src\components\Hand.jsx:81 -> const handleBackgroundClick = (e) => {
- frontend\src\components\Hand.jsx:82 -> if (e.target === handStackRef.current) {
- frontend\src\components\Hand.jsx:88 -> const handleResize = () => setIsMobile(window.innerWidth < 970);
- frontend\src\components\Hand.jsx:176 -> function validMoveCount(legalMoves, cardId) {
- frontend\src\components\LandingAboutPanel.jsx:3 -> export default function LandingAboutPanel() {
- frontend\src\components\LandingStartPanel.jsx:3 -> export default function LandingStartPanel() {
- frontend\src\components\Leaderboard.jsx:3 -> export default function Leaderboard({ players, finishOrder, onBackToLobby, onLeave }) {
- frontend\src\components\LeftPanel.jsx:3 -> export default function LeftPanel() {
- frontend\src\components\MobileTutorial.jsx:8 -> export default function MobileTutorial() {
- frontend\src\components\MobileTutorial.jsx:13 -> const handleScroll = () => {
- frontend\src\components\MobileTutorial.jsx:18 -> if (newIndex !== activeIndex) {
- frontend\src\components\MobileTutorial.jsx:23 -> const scrollToSlide = (index) => {
- frontend\src\components\PlayerList.jsx:3 -> export default function PlayerList({ players, currentTurn, finishOrder }) {
- frontend\src\components\PlayerList.jsx:4 -> const getPosition = (id) => {
- frontend\src\components\RightPanel.jsx:3 -> export default function RightPanel() {
- frontend\src\components\Table.jsx:21 -> const Table = memo(function Table({ table, legalMoves, isPlayerTurn }) {
- frontend\src\components\Table.jsx:27 -> const groupPilesBySuit = () => {
- frontend\src\components\Table.jsx:29 -> for (const key of Object.keys(table)) {
- frontend\src\components\Table.jsx:34 -> for (const suit in groups) {
- frontend\src\components\Table.jsx:47 -> const handleResize = () => setIsCompact(window.innerWidth < 1025);
- frontend\src\components\Table.jsx:52 -> const handlePileClick = (pileKey) => {
- frontend\src\components\Table.jsx:59 -> if (validMoves.length > 0) {
- frontend\src\components\Table.jsx:69 -> const renderCard = (card, isTop = true) => {
- frontend\src\components\Table.jsx:111 -> const renderPile = (pileKey) => {
- frontend\src\components\Table.jsx:114 -> if (isPlayerTurn && selectedCardId) {
- frontend\src\components\VersionPanel.jsx:16 -> export default function VersionPanel() {
- frontend\src\network\socket.js:8 -> const getSocketUrl = () => {
- frontend\src\network\socket.js:9 -> if (import.meta.env.VITE_SOCKET_URL) {
- frontend\src\network\socket.js:18 -> export function connect(onMessage, onOpen) {
- frontend\src\network\socket.js:19 -> if (socket) {
- frontend\src\network\socket.js:48 -> export function send(msg) {
- frontend\src\network\socket.js:49 -> if (!socket || !socket.connected) {
- frontend\src\network\socket.js:58 -> export function disconnect() {
- frontend\src\network\socket.js:59 -> if (socket) {
- frontend\src\network\socket.js:65 -> export function isConnected() {
- frontend\src\network\socket.js:69 -> export function getSocket() {
- frontend\src\pages\Game.jsx:11 -> export default function Game() {
- frontend\src\pages\Game.jsx:45 -> if (!state) {
- frontend\src\pages\Game.jsx:63 -> if (finishOrder.length === state.players.length) {
- frontend\src\pages\GamePrep.jsx:10 -> export default function GamePrep() {
- frontend\src\pages\GamePrep.jsx:28 -> if (role !== "admin" && prepSettings) {
- frontend\src\pages\GamePrep.jsx:38 -> if (role === "admin" && updateSettings) {
- frontend\src\pages\GamePrep.jsx:44 -> if (chatMessages && chatMessages.length > 0) {
- frontend\src\pages\GamePrep.jsx:47 -> if (latestMsg.playerId === playerId) {
- frontend\src\pages\GamePrep.jsx:63 -> const handleStart = () => {
- frontend\src\pages\GamePrep.jsx:65 -> if (isManyPlayers) {
- frontend\src\pages\GamePrep.jsx:71 -> const goBack = () => {
- frontend\src\pages\Landing.jsx:9 -> export default function Landing() {
- frontend\src\pages\Landing.jsx:19 -> const handleCreate = () => {
- frontend\src\pages\Landing.jsx:24 -> const handleJoin = () => {
- frontend\src\pages\Landing.jsx:29 -> const handleKeyPress = (e) => {
- frontend\src\pages\Landing.jsx:30 -> if (e.key === "Enter") {
- frontend\src\pages\Landing.jsx:31 -> if (mode === "create" && !gameId.trim()) {
- frontend\src\pages\Lobby.jsx:11 -> export default function Lobby() {
- frontend\src\pages\Lobby.jsx:22 -> if (chatMessages && chatMessages.length > 0) {
- frontend\src\pages\Lobby.jsx:25 -> if (latestMsg.playerId === playerId) {
- frontend\src\pages\Lobby.jsx:41 -> const copyGameId = () => {
- frontend\src\pages\Reconnecting.jsx:3 -> export default function Reconnecting() {
- frontend\src\store\useGameStore.js:4 -> const saveSession = (gameId, playerId, role, name, screen) => {
- frontend\src\store\useGameStore.js:14 -> const loadSession = () => {
- frontend\src\store\useGameStore.js:19 -> const clearSession = () => {
- frontend\src\store\useGameStore.js:74 -> switch(msg.type) {
- frontend\src\store\useGameStore.js:146 -> if (msg.settings) {
- frontend\src\store\useGameStore.js:161 -> if(get().screen === "reconnecting") {
- frontend\src\utils\dealCard.js:2 -> export function dealCards(handCards) {
- frontend\src\utils\dealCard.js:16 -> // Optional: remove class after animation to allow re-deal
