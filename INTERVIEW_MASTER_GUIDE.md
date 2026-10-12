# 🎯 SATTI CENTER: JUSPAY SDE INTERVIEW MASTER GUIDE
> **Project:** Satti Center – Real-Time Multiplayer Card Game Platform  
> **Target Role:** Software Development Engineer (SDE) at **JUSPAY**  
> **Core Focus:** First Principles Thinking, Server-Authoritative Architecture, Networking (WebSockets/TCP), Functional State Machines, Security, Concurrency, and Distributed Scalability.

---

## 📑 TABLE OF CONTENTS
1. [The 60-Second "Why This Matters to Juspay" Elevator Pitch](#1-the-60-second-elevator-pitch)
2. [Resume Bullet-by-Bullet Technical Defense](#2-resume-bullet-by-bullet-technical-defense)
3. [Exhaustive File-by-File Architecture & Code Flow](#3-exhaustive-file-by-file-architecture--code-flow)
4. [Computer Science & Engineering Prerequisites](#4-computer-science--engineering-prerequisites)
5. [The Juspay Connection: Payments vs Multiplayer Game Engine](#5-the-juspay-connection-payments-vs-multiplayer-game)
6. [Top 20 Core Interview Cross-Questions & Model Answers](#6-top-20-core-interview-cross-questions--model-answers)
7. [System Scaling & Production Hardening (From 1 to 1M Users)](#7-system-scaling--production-hardening)
8. [Advanced Technical Deep Dive: The 4 Core Architectural Pillars](#8-advanced-technical-deep-dive-the-4-core-architectural-pillars)
9. [Juspay Core Domain: Payments Systems Architecture & Engineering](#9-juspay-core-domain-payments-systems-architecture--engineering)
10. [Complete Engineering Prerequisites Checklist (From JS DOM to System Design)](#10-complete-engineering-prerequisites-checklist)
11. [Morning-of-the-Interview Rapid-Fire Cheat Sheet](#11-morning-of-the-interview-rapid-fire-cheat-sheet)

---

## 1. THE 60-SECOND ELEVATOR PITCH

When the interviewer says: **"Walk me through your project, Satti Center."**

> *"Satti Center is an end-to-end, server-authoritative multiplayer card platform inspired by the traditional 7-of-Hearts game (Badam Satti). I built it from first principles with two decoupled core layers: a purely deterministic game engine and an event-driven real-time network layer.*
>
> *I designed it with a zero-trust client model: the backend is the single source of truth that enforces strict turn validation and state transitions, and projects sanitized, role-based views so clients never receive hidden cards.*
>
> *On the networking side, I utilized persistent full-duplex WebSockets over Socket.IO, implemented session-backed state recovery for drop-and-resume scenarios, and solved edge cases like consecutive-skip deadlocks and state rollbacks. In essence, it shares the exact architectural philosophy as a transactional payments orchestrator: deterministic finite state machines, strict idempotency, connection resilience, and zero-trust validation."*

---

## 2. RESUME BULLET-BY-BULLET TECHNICAL DEFENSE

Here is how you defend every single bullet you put on your resume when cross-questioned:

### Bullet 1:
> *"Designed a real-time client–server communication system using Socket.IO for low-latency bidirectional messaging and game state synchronization across multiple clients."*

- **The Cross-Question:** *"Why did you choose Socket.IO instead of raw WebSockets (`ws`), Server-Sent Events (SSE), or HTTP Long Polling?"*
- **Your Answer:**
  1. **Transport Fallback & Upgrade:** Socket.IO starts with HTTP long-polling and upgrades to WebSocket (`101 Switching Protocols`) automatically. This bypasses aggressive corporate proxies or restrictive firewalls that block raw TCP WS connections.
  2. **Room & Socket Adapter Abstraction:** Built-in room management (`socket.join(gameId)`) and room broadcasting (`io.to(gameId).emit`) abstract away manual socket-to-room book-keeping.
  3. **Heartbeat & Disconnect Detection:** Out-of-the-box ping/pong frames (`pingInterval`, `pingTimeout`) detect silent dead connections (half-open TCP connections) without writing custom keep-alive loops.
  4. **Multiplexing & Event-driven API:** Clean event naming without having to write a custom JSON router over raw message strings.

---

### Bullet 2:
> *"Built a server-side authoritative game engine that manages player sessions, validates moves, handles turn-based logic, and ensures deterministic state consistency across distributed clients."*

- **The Cross-Question:** *"What does 'server-authoritative' actually mean in your code? What stops a player from hacking the frontend to play any card?"*
- **Your Answer:**
  - In our architecture, the client is a **dumb renderer**: it only emits player intentions (`ACTION: { type, cardId, pileKey }`).
  - The server interceptor (`handleAction` in `wsServer.js`) extracts `socket.data.playerId` (cryptographically trusted on the socket session, not trusted from client payload).
  - It runs `validateAction(state, action)`:
    1. Verifies the game is active (`started && !winner`).
    2. Verifies it is strictly that player's turn (`action.playerId === getCurrentPlayer(state).id`).
    3. Runs `getLegalMoves(hand, table, layoutMode)` to verify the card and pile strictly conform to the 7-suit sequence rules.
  - If validation fails, the action is rejected immediately, and the client receives an error. The game state is completely untouched. State mutation only happens inside `dispatchAction(state, action)`.

---

### Bullet 3:
> *"Developed robust connection and reconnection mechanisms, including session tracking and socket management, allowing players to recover their game state after page refresh or network interruptions."*

- **The Cross-Question:** *"Explain the exact handshake when a user refreshes the page in the middle of a live match."*
- **Your Answer:**
  1. **Session Persistence:** When a player creates or joins a game, `useGameStore.js` writes `{ gameId, playerId, role, name, screen }` into `localStorage`.
  2. **Socket Drop:** On refresh/unload, the old socket disconnects. The backend receives `disconnect` event, marks `player.disconnected = true`, but **preserves the player in `game.players` and retains their cards in the game state**.
  3. **Reconnection Request:** When the page re-renders, `connectSocket()` establishes a new socket connection. On `connect`, `attemptReconnect()` reads `localStorage` and emits:
     `JOIN_GAME { gameId, playerId, role, name }`
  4. **Identity Binding:** The backend checks `if (msg.playerId && game.players.has(msg.playerId))`. It rebinds the new `socket.id` to the existing `playerId`, clears `disconnected = false`, rejoins the room `socket.join(gameId)`, and emits:
     - `RECONNECTED` event with current room details.
     - `CHAT_SYNC` with historical chat messages.
     - `broadcastState()` which sends a fresh, tailored `STATE_UPDATE` to rehydrate the user's hand and board.

---

### Bullet 4:
> *"Implemented efficient state serialization and event-driven message handling, reducing network overhead and enabling scalable real-time updates between server and clients."*

- **The Cross-Question:** *"How does state serialization prevent cheating, and how does it save bandwidth?"*
- **Your Answer:**
  - In `stateSerializer.js`, we implement **Role-Based State Projection**:
    - `getPlayerView(state, playerId)`: The server takes the master state and builds a personalized projection:
      - `you.hand`: Complete array of cards for the calling player.
      - `players`: An array of opponents containing only `{ id, name, isActive, position }` — **their card hands are stripped completely**.
      - `legalMoves`: Pre-computed on the server specifically for the active player's hand.
    - `getSpectatorView(state)`: Strips all private hands across all players.
  - **Security Impact:** Even if an opponent opens Chrome DevTools / Network Tab / Wireshark, the cards of opponents do not exist in the payload.
  - **Bandwidth Impact:** Instead of broadcasting the monolithic game state with all decks and hands to every socket, each client gets a trimmed view.

---

## 3. EXHAUSTIVE FILE-BY-FILE ARCHITECTURE & CODE FLOW

```
                          ┌────────────────────────┐
                          │   CLIENT (React 19)    │
                          │   Zustand Store + UI   │
                          └───────────▲────────────┘
                                      │  WebSocket (Socket.IO)
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND (Node.js)                                 │
│                                                                              │
│  [server.js] ──> [app.js] (CORS, Express) ──> [wsServer.js] (Socket Router)  │
│                                                     │                        │
│                           ┌─────────────────────────┴─────────┐              │
│                           ▼                                   ▼              │
│                 [gameStore.js] (In-memory)            [stateSerializer.js]   │
│                           │                           (Role-based masking)   │
│                           ▼                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                       GAME ENGINE CORE                                 │  │
│  │                                                                        │  │
│  │  [game/index.js] ───────────────> Facade entry point                   │  │
│  │  [state/gameSetup.js] ──────────> Deck generation, Deal, Init 7s       │  │
│  │  [state/gameState.js] ──────────> Immutable/Mutable Table add/remove   │  │
│  │  [validation/rules.js] ─────────> Legal moves calculation (Sequences)  │  │
│  │  [validation/validateAction.js] ─> Turn, Action & Integrity validator   │  │
│  │  [actions/dispatchAction.js] ───> State Transition Reducer             │  │
│  │  [core/turnActions.js] ─────────> Cyclic Turn Advancement & Autoplay   │  │
│  │  [core/shuffle.js] ─────────────> Fisher-Yates shuffle algorithm       │  │
│  │  [core/deal.js] ────────────────> Round-robin dealing + Hand sorting   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Backend File Walkthrough

#### 1. `backend/src/server.js`
- **Role:** The bootstrap entry point for the Node process.
- **Key Code:**
  ```javascript
  const server = http.createServer(app);
  setupSocketServer(server);
  server.listen(PORT, "0.0.0.0");
  ```
- **Interview Insight:** Express and Socket.IO share the same underlying HTTP server. Socket.IO intercepts the HTTP `Upgrade` header on port `5000` to transition the protocol from HTTP/1.1 to RFC 6455 WebSockets.

#### 2. `backend/src/app.js`
- **Role:** Express middleware configuration and HTTP health checking.
- **Key Code:** Configures CORS origins (Production Render URL + localhost Vite dev servers). Exposes `GET /` health endpoint for container health probes.

#### 3. `backend/src/api/store/gameStore.js`
- **Role:** The centralized in-memory state repository.
- **Key Data Structure:**
  ```javascript
  const game = new Map(); // Key: gameId (string), Value: Game Room Object
  ```
- **Fields in Game Room Object:**
  - `id`: 6-digit room code.
  - `phase`: `"LOBBY"` | `"PREP"` | `"PLAYING"`.
  - `players`: `Map<playerId, { id, name, role, disconnected }>`
  - `state`: The active game engine state instance.
  - `chatMessages`: Circular buffer (capped at 100 messages via `splice`).

#### 4. `backend/src/api/ws/wsServer.js`
- **Role:** Real-time event gateway and router.
- **Key Message Handlers:**
  - `handleCreateGame`: Generates 6-digit random `gameId`, creates room, assigns `"admin"` role, calls `socket.join(gameId)`.
  - `handleJoinGame`: Handles new player entry or existing player **reconnection**.
  - `handleStartGame`: Admin-only trigger. Calls `setupGame(...)`, transitions `game.phase = "PLAYING"`, calls `broadcastState(io, gameId)`.
  - `handleAction`: Incoming move payload. Authenticates via `socket.data.playerId`, calls `validateAction`, then `dispatchAction`, checks deadlock flags, and broadcasts new state.
  - `handleLeaveGame`: Removes player. **Admin handover logic**: If the room admin leaves, automatically promotes the next player in line to admin.
  - `handleChatMessage`: Appends to chat log and broadcasts to room.

#### 5. `backend/src/api/serializers/stateSerializer.js` & `backend/src/game/views/playerViews.js`
- **Role:** Zero-trust state projection and role filtering.
- **Key Logic:**
  ```javascript
  export function getPlayerView(state, playerId) {
    const player = state.players.find(p => p.id === playerId);
    return {
      table: structuredClone(state.table),
      you: { id: player.id, name: player.name, hand: structuredClone(player.hand), ... },
      players: state.players.map(p => ({ id: p.id, name: p.name, isActive: p.isActive, position: p.position })),
      currentTurnPlayerId: getCurrentPlayer(state).id,
      legalMoves: getLegalMoves(...)
    };
  }
  ```
- **Interview Insight:** Uses `structuredClone()` to perform true deep copying. This guarantees that view consumers cannot mutate internal state through reference leaking.

#### 6. `backend/src/game/core/shuffle.js`
- **Role:** Shuffles the deck using the **Fisher-Yates (Knuth) Algorithm**.
- **Time Complexity:** $O(N)$ time, $O(1)$ auxiliary space.
- **Why Not `array.sort(() => Math.random() - 0.5)`?**
  - `sort()` with random comparator does NOT produce a uniform distribution because sorting algorithms (like Timsort or Quicksort) do not compare every pair with equal probability, leading to statistical bias. Fisher-Yates guarantees an unbiased, uniform random permutation ($\frac{1}{N!}$ probability for each permutation).

#### 7. `backend/src/game/core/deal.js`
- **Role:** Round-robin card distribution and deterministic initial hand sorting.
- **Code:**
  ```javascript
  while (deck.length) {
    players[index % players.length].hand.push(deck.pop());
    index++;
  }
  players.forEach(p => p.hand.sort((a,b) => a.suit.localeCompare(b.suit) || a.value - b.value));
  ```

#### 8. `backend/src/game/validation/rules.js`
- **Role:** Computes the set of mathematically valid moves.
- **Core Rules of Satti Center (7 of Hearts / Sevens):**
  - **Piles:** 4 piles (Hearts, Spades, Diamonds, Clubs).
  - **Initial Card:** A pile can ONLY be started by a `7` of that suit.
  - **Subsequent Cards:** Can only be placed if they extend the sequence:
    - Ascending from 7: $8 \to 9 \to 10 \to 11(J) \to 12(Q) \to 13(K)$
    - Descending from 7: $6 \to 5 \to 4 \to 3 \to 2 \to 1(A)$
  - **Layout Modes:**
    - `single`: 1 standard 52-card deck, 4 piles.
    - `double-sets`: 2 decks, 8 piles (e.g., `hearts_1`, `hearts_2`).
    - `double-repeated`: 2 decks, 4 piles where duplicate cards can be placed sequentially.
  - **Skip Logic:** In standard play, a player CANNOT skip if they possess a playable card. If they have zero legal cards, a virtual `Skip` move is injected into `legalMoves`.

#### 9. `backend/src/game/actions/dispatchAction.js`
- **Role:** The State Machine Transition Reducer (`(State, Action) -> State'`).
- **Handles:**
  1. `PLAY_CARD`: Inserts card into target pile via `add()`, splices from player's hand, records in `moveHistory`, checks win condition (`hand.length === 0`), advances turn.
  2. `SKIP_TURN`: Increments `consecutiveSkips`. If all remaining active players skip consecutively, triggers **Deadlock Detection** (`state.deadlockWarning = true`).
  3. `ROLLBACK_MOVE`: Pops the last action from `moveHistory`. If it was a card play, pulls it back from the table into the player's hand and rewinds `currentTurnIndex`.

#### 10. `backend/src/game/core/turnActions.js`
- **Role:** Cyclic turn orchestration and Bot execution loop.
- **Logic:**
  ```javascript
  while (true) {
    state.currentTurnIndex = (state.currentTurnIndex + 1) % total;
    const player = state.players[state.currentTurnIndex];
    if (player.isBot) {
      if (!canBotPlay(state, player)) continue;
      break;
    } else if (canPlayerTakeTurn(state, player)) {
      return player;
    }
  }
  ```
- **Interview Insight:** If the next player in rotation is a Bot, the server autonomously computes the bot's legal moves, picks a move via `botAction.js`, and executes it synchronously, skipping directly to the next human turn.

---

### 3.2 Frontend File Walkthrough

#### 1. `frontend/src/store/useGameStore.js` (Zustand)
- **Role:** Global client-side single source of truth.
- **Why Zustand instead of Redux or Context API?**
  - **Zero Boilerplate:** No reducers, action creators, or providers.
  - **Atomic Selectors:** Components only re-render when the exact selected slice changes (`const state = useGameStore(s => s.state)`).
  - **External Access:** Can be accessed and updated outside React components (e.g., directly inside socket callback handlers via `get()` and `set()`).

#### 2. `frontend/src/network/socket.js`
- **Role:** Transport singleton encapsulating the Socket.IO client instance, auto-connect configurations, and environment variable URLs.

#### 3. `frontend/src/pages/Game.jsx` & Components (`Hand.jsx`, `Table.jsx`)
- **Game.jsx:** Orchestrates the board view, detects endgame (`finishedPlayers.length === players.length`) to display `<Leaderboard />`, renders global chat toasts.
- **Hand.jsx:**
  - Renders the player's cards with fan curvature / responsive grid.
  - Highlights cards that exist in `legalMoves`.
  - Dispatches `sendAction({ type: 'PLAY_CARD', cardId, pileKey })`.
- **Table.jsx:**
  - Renders the 4 suit piles centered around the `7`s.
  - Cards $>7$ stack to the right/top with increasing z-index.
  - Cards $<7$ stack to the left/bottom with decreasing z-index.

---

## 4. COMPUTER SCIENCE & ENGINEERING PREREQUISITES

### 4.1 Networking & Protocols

#### 1. HTTP/1.1 vs WebSockets (RFC 6455)
- **HTTP/1.1:** Request-Response model, half-duplex. Every request incurs TCP handshake + TLS negotiation + redundant HTTP headers (cookies, user-agent, headers ~1KB). High overhead for real-time interactions.
- **WebSocket Upgrade Handshake:**
  1. Client sends an HTTP GET request with specific upgrade headers:
     ```http
     GET /socket.io/?EIO=4&transport=websocket HTTP/1.1
     Host: localhost:5000
     Upgrade: websocket
     Connection: Upgrade
     Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
     Sec-WebSocket-Version: 13
     ```
  2. Server validates the key, hashes it with a standard GUID (`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`) via SHA-1, base64 encodes it, and replies:
     ```http
     HTTP/1.1 101 Switching Protocols
     Upgrade: websocket
     Connection: Upgrade
     Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
     ```
  3. The TCP socket remains open! From now on, communication uses lightweight **WebSocket binary frames** (2 to 10 bytes header overhead instead of 1KB HTTP headers). Full-duplex: both client and server can send at any time.

#### 2. TCP Mechanics Behind the Scenes
- **3-Way Handshake:** `SYN` $\to$ `SYN-ACK` $\to$ `ACK`.
- **TCP Guarantees:** In-order delivery, reliability via ACKs and retransmissions, flow control (sliding window), and congestion control (slow start, AIMD).
- **Head-of-Line (HoL) Blocking:** If one packet drops in TCP, all subsequent packets must wait in the OS receive buffer until the missing packet is retransmitted. *(WebRTC DataChannels over UDP or HTTP/3 over QUIC solve this for high-twitch games).*

#### 3. Heartbeats & TCP Half-Open Connections
- If a mobile client enters an elevator or loses mobile tower signal without sending a TCP `FIN`/`RST`, the server socket can stay open forever (zombie connection).
- Socket.IO solves this via **Ping/Pong Heartbeats**:
  - Server sends Ping every `pingInterval`.
  - Client must respond with Pong.
  - If no Pong arrives within `pingTimeout`, server tears down the socket and fires `disconnect`.

---

### 4.2 Operating Systems & Concurrency (Node.js Architecture)

#### 1. The Node.js Event Loop & libuv
- Node.js executes JavaScript on a **single thread** using an event-driven loop backed by **libuv**.
- **Phases of Event Loop:**
  1. **Timers Phase:** Executes callbacks scheduled by `setTimeout` and `setInterval`.
  2. **Pending Callbacks:** Executes I/O callbacks deferred to the next loop iteration.
  3. **Idle, Prepare:** Internal use.
  4. **Poll Phase:** Retrieves new I/O events (incoming network packets, socket messages). Executes their callbacks.
  5. **Check Phase:** Executes `setImmediate` callbacks.
  6. **Close Callbacks:** Socket close handlers (`socket.on('close')`).
- **Microtask Queue:** `process.nextTick` and `Promise` resolutions execute immediately after the current operation, before the event loop advances to the next phase.

#### 2. Concurrency Without Multithreading: Why No Race Conditions on Single Node?
- **Interview Question:** *"If Player A and Player B both submit a card move at the exact same microsecond, how does your backend prevent race conditions?"*
- **Your Answer:**
  - Because Node.js runs JavaScript on a single thread, **two JS functions can never execute simultaneously in memory**.
  - The OS network stack enqueues incoming TCP packets. libuv picks them up sequentially in the Poll phase.
  - Socket.IO fires `handleAction` for Player A completely to completion (validating and mutating state) before the event loop ever yields to execute Player B's `handleAction`.
  - Therefore, in a single Node process, state mutations are inherently atomic and serialized!

---

### 4.3 Functional Programming (FP) Concepts (Juspay's Core Culture)

Juspay builds their entire payment backend using **PureScript and Haskell**. Speaking their language will set you apart:

| FP Concept | How It Applies to Satti Center | How It Applies to Juspay Payments |
| :--- | :--- | :--- |
| **Pure Functions** | `getLegalMoves(hand, table, mode)` is a pure function: given the exact same hand and table, it always returns the exact same legal moves with **zero side effects**. | Calculating payment fees, currency conversions, route optimizations based on merchant rules. |
| **State Machine Reducer** | `dispatchAction(state, action)` behaves like a classic FP Reducer / State Monad: $S \times A \to S'$. | Payment State Machine: `INITIATED` $\to$ `AUTHENTICATING` $\to$ `AUTHORIZING` $\to$ `CAPTURED` or `FAILED`. |
| **Immutability & Clones** | `structuredClone(state.table)` prevents mutations from leaking across references. | Preventing concurrent threads from corrupting financial ledger records. |
| **Idempotency** | Repeating the same action or an already consumed card will fail validation and produce no side effect. | Submitting an API charge request multiple times with the same `Idempotency-Key` never charges the customer twice. |

---

## 5. THE JUSPAY CONNECTION: PAYMENTS VS MULTIPLAYER GAME

```
┌─────────────────────────────────┐        ┌─────────────────────────────────┐
│     SATTI CENTER GAME ENGINE    │        │     JUSPAY PAYMENT PLATFORM     │
├─────────────────────────────────┤        ├─────────────────────────────────┤
│ Player Move Action              │  <==>  │ Payment Transaction Request     │
│ Server Rule Validation Engine   │  <==>  │ Fraud, Risk & Route Engine      │
│ State Serialization (Masking)   │  <==>  │ PCI-DSS Card Tokenization (PAN) │
│ Reconnection on Page Refresh    │  <==>  │ App-Switch Resume (UPI Intent)  │
│ Move Rollback on Deadlock       │  <==>  │ Transaction Reversal / Refund   │
│ In-Memory Game Store            │  <==>  │ Redis Session / Context Cache   │
└─────────────────────────────────┘        └─────────────────────────────────┘
```

1. **Zero-Trust Client:** In both systems, the client is assumed hostile. The client never calculates balances or validates rules; it only presents intent.
2. **Session Resumption under Network Loss:** When a user pays via UPI, the merchant app switches to GPay/PhonePe and returns. If the connection dropped during the app switch, the backend session must seamlessly reconcile the transaction state without duplicating the payment. This is identical to our player recovering their hand after a socket drop.
3. **Compensating Actions (Rollbacks):** When all players skip and the game deadlocks, the engine supports `ROLLBACK_MOVE`. In banking, when a distributed transfer fails halfway (debited from Bank A, timeout at Bank B), a compensating transaction (Saga pattern) rolls back the debit.

---

## 6. TOP 20 CORE INTERVIEW CROSS-QUESTIONS & MODEL ANSWERS

### Q1: "Walk me through how `getLegalMoves` works algorithmically."
> **Answer:**
> "In `rules.js`, `getLegalMoves` takes the player's current hand and the board table. For each card in the hand:
> - If the table pile for that suit is empty, the card must have `value === 7`.
> - If the pile has cards, the card is valid only if its value equals either `pile.max + 1` (expanding upward toward King) or `pile.min - 1` (expanding downward toward Ace).
> - In `double-sets` mode (8 piles), we evaluate legality against both set piles (`suit_1` and `suit_2`).
> - Finally, we handle the skip policy: If standard card moves exist, skipping is illegal unless cheat mode is explicitly enabled. If no playable cards exist, a virtual `Skip` move is prepended so the player can pass."

---

### Q2: "What is the time complexity of validating a card move?"
> **Answer:**
> "The player's hand has at most $N$ cards (where $N \le 17$ for 3 players). Checking whether a card is playable against 4 suit piles is an $O(1)$ lookup because the piles are indexed in a hash map (`state.table[card.suit]`) and we only inspect the head and tail of the pile array (`O(1)`). Therefore, generating all legal moves takes $O(N)$ where $N \le 17$, which takes mere nanoseconds."

---

### Q3: "Why did you use `structuredClone()` instead of the spread operator (`{ ...state }`) or `JSON.parse(JSON.stringify())`?"
> **Answer:**
> - The object spread operator (`{ ...state }`) only creates a **shallow copy**. Nested arrays (like `player.hand` and suit piles `table.hearts`) still retain memory references to the original arrays, meaning a mutation in a view could mutate internal engine state!
> - `JSON.parse(JSON.stringify())` creates a deep copy, but it loses types (turns dates to strings, drops `undefined`, drops `NaN`, breaks `Map` and `Set`).
> - `structuredClone()` is the native V8/Node.js standard algorithm for true deep cloning that correctly handles nested objects, arrays, and native types without JSON serialization overhead.

---

### Q4: "What happens if a user opens two browser tabs with the same player session?"
> **Answer:**
> "Both tabs will load the same `satti_session` from `localStorage` and connect with different socket IDs.
> Currently, the second tab emits `JOIN_GAME` with the existing `playerId`. The backend rebinds `socket.data.playerId` to the new socket and rejoins the room.
> **Production Fix:** In a production banking or gaming app, we should enforce **single active session per user**. When Socket B connects with an existing `playerId`, the server should send a `SESSION_SUPERSEDED` event to Socket A and disconnect it (`socketA.disconnect(true)`), preventing concurrent desynchronized input."

---

### Q5: "How does your system detect and handle deadlocks?"
> **Answer:**
> "A deadlock occurs when no active player has a legal card to play, causing players to skip endlessly in a cycle.
> In `dispatchAction.js`, every `SKIP_TURN` increments `state.consecutiveSkips`. When `consecutiveSkips >= activePlayersCount`, it means every single player in the room has passed without playing a card.
> When this threshold is breached, the engine flags `state.deadlockWarning = true`. `wsServer.js` intercepts this flag and emits a `WARNING` event across all sockets, alerting players to use the `ROLLBACK_MOVE` action or adjust plays."

---

### Q6: "How did you implement Bot moves? Does the bot block the event loop?"
> **Answer:**
> "No, the bot does not block the event loop. In `turnActions.js`, when `advanceTurn` advances `currentTurnIndex` to a player where `player.isBot === true`, it invokes `canBotPlay`.
> The bot calculates legal moves, randomly selects one via `pickBotMove` ($O(1)$), and immediately calls `dispatchAction`.
> The bot actions run synchronously in memory within the same tick and then hand over the turn to the next human player. For UI realism, in production we would wrap bot actions in a small delayed queue (`setTimeout` or job queue) to simulate human thinking latency."

---

### Q7: "Your backend stores state in `new Map()`. What happens when the server restarts or crashes?"
> **Answer:**
> "Currently, because state lives in the Node.js heap memory, a server restart destroys all active games.
> To make it production-grade:
> 1. We externalize state to a fast in-memory key-value store like **Redis**.
> 2. Game room metadata is saved under a Redis Hash (`HSET game:<id> state <json>`).
> 3. Updates are committed via **Redis Lua scripts** to ensure atomic check-and-set operations.
> 4. If a Node process crashes, any other Node worker can reload the game state from Redis."

---

### Q8: "How does your code prevent a user from spoofing their `playerId` when sending an action?"
> **Answer:**
> "Even though the client sends `{ type: 'ACTION', action: { cardId, pileKey } }`, the server **never trusts a `playerId` sent inside the payload**.
> Instead, in `wsServer.js`:
> ```javascript
> action.playerId = socket.data.playerId;
> ```
> `socket.data.playerId` is bound strictly during connection/handshake on the server side and stored on the socket instance in server memory. The client has no ability to tamper with `socket.data`."

---

### Q9: "Why did you use `nanoid` instead of `uuidv4`?"
> **Answer:**
> - `nanoid` generates cryptographically secure, URL-friendly IDs using a custom alphabet.
> - A 21-character NanoID is significantly smaller than a 36-character standard UUIDv4, reducing bandwidth overhead in high-frequency WebSocket payloads.
> - It is also faster to generate and collision-resistant."

---

### Q10: "Explain the Fisher-Yates shuffle algorithm and why it is optimal."
> **Answer:**
> "Fisher-Yates iterates through an array from the last index down to 1:
> ```javascript
> for (let i = deck.length - 1; i > 0; i--) {
>     const j = Math.floor(Math.random() * (i + 1));
>     [deck[i], deck[j]] = [deck[j], deck[i]];
> }
> ```
> At each step $i$, it chooses a random index $j \in [0, i]$ and swaps elements.
> - **Correctness:** Each of the $N!$ permutations is equally likely with probability $\frac{1}{N!}$.
> - **Complexity:** Runs in $O(N)$ linear time and $O(1)$ in-place space complexity. It is mathematically the optimal shuffling algorithm."

---

### Q11: "In `wsServer.js`, why is `pingTimeout` set to `3600000` (1 hour)?"
> **Answer:**
> "In development, when debugging with breakpoints in DevTools or server code, standard short ping intervals (25 seconds) cause aggressive timeouts that disconnect the developer.
> However, for **production**, keeping `pingTimeout` at 1 hour is an anti-pattern because it creates zombie connections that hold open file descriptors! In production, we configure `pingInterval: 10000` (10s) and `pingTimeout: 5000` (5s) to promptly reclaim resources when a mobile device goes offline."

---

### Q12: "How would you handle a malicious client flooding your WebSocket server with 1,000 actions per second (DoS)?"
> **Answer:**
> 1. **Token Bucket Rate Limiting:** Implement rate limiting middleware at the socket level (e.g., maximum 5 actions per second per `socket.id`).
> 2. **Immediate Drop:** If the bucket empties, drop packets without running CPU-heavy game logic.
> 3. **Connection Throttling:** Throttle incoming connections per IP at the reverse proxy (Nginx or Cloudflare)."

---

### Q13: "What happens if an admin leaves a game room in the middle of a lobby?"
> **Answer:**
> "In `handleLeaveGame`, our engine implements **Admin Re-election**:
> ```javascript
> if (leavingPlayer?.role === "admin") {
>     const remainingPlayers = Array.from(game.players.values());
>     if (remainingPlayers.length > 0) {
>         const newAdmin = remainingPlayers[0];
>         newAdmin.role = "admin";
>         // update socket.data and broadcast
>     }
> }
> ```
> The next player in the lobby roster is automatically promoted to admin, and their client UI receives an updated `LOBBY_UPDATE` granting them admin privileges. The room is never left orphaned."

---

### Q14: "Why did you use Tailwind CSS 4 and Framer Motion on the frontend?"
> **Answer:**
> - **Tailwind CSS 4:** Enables high-performance, utility-first CSS compilation with CSS variables and minimal bundle size.
> - **Framer Motion:** Handles layout animations for card deals, card fans, and table placements. It allows declarative animations (`layoutId`, `AnimatePresence`) so cards animate smoothly from hand to table when state updates arrive."

---

### Q15: "What is the difference between `React.memo` and `useMemo` in your frontend components?"
> **Answer:**
> - `React.memo` is a higher-order component (HOC) used on `<Hand />` and `<Table />` to prevent unnecessary component re-renders unless their props have changed.
> - `useMemo` is a hook used within a component to memoize the result of an expensive calculation (such as sorting cards or grouping piles) between renders."

---

### Q16: "How do you handle card sorting so it is deterministic across all clients?"
> **Answer:**
> "In `dealCards`, hands are sorted by suit order (`diamonds`, `spades`, `hearts`, `clubs`) and then numerically by value (`1` to `13`). On the frontend, `Hand.jsx` maintains this exact same suit ordering. This guarantees visual consistency regardless of the platform."

---

### Q17: "What is the purpose of `layoutMode`?"
> **Answer:**
> - `single`: Standard 1-deck game (3 to 4 players). 4 piles.
> - `double-sets`: 2-deck game (5+ players). 8 separate piles (e.g., two independent Hearts piles `hearts_1` and `hearts_2`).
> - `double-repeated`: 2-deck game. 4 piles where identical cards can stack sequentially."

---

### Q18: "If two players disconnect simultaneously, how does the engine handle game over?"
> **Answer:**
> "In `finishPlayer`, when a player empties their hand, they are marked inactive and added to `finishedPlayers`.
> The code explicitly checks:
> ```javascript
> const activePlayers = state.players.filter(p => p.isActive);
> if (activePlayers.length === 1) {
>     const lastPlayer = activePlayers[0];
>     lastPlayer.isActive = false;
>     state.finishedPlayers.push(lastPlayer);
> }
> ```
> If all but one player disconnect or finish, the remaining player is automatically awarded the next position and the game transitions to `endGame(state)`."

---

### Q19: "How does your chat system prevent memory leaks in long-running games?"
> **Answer:**
> "In `handleChatMessage`, we enforce a sliding window buffer capped at 100 messages:
> ```javascript
> game.chatMessages.push(chatMessage);
> if (game.chatMessages.length > 100) {
>     game.chatMessages.splice(0, game.chatMessages.length - 100);
> }
> ```
> This prevents unbound array growth and memory exhaustion on the server."

---

### Q20: "If you had to rewrite this project in Haskell or PureScript (Juspay's stack), what would change?"
> **Answer:**
> - "The entire game engine would be modeled as a **Pure State Monad** `State GameState ActionResponse`.
> - State transitions would be enforced by the type system using **Algebraic Data Types (ADTs)**:
>   ```haskell
>   data Card = Card { suit :: Suit, value :: Value }
>   data Action = PlayCard Card PileKey | SkipTurn | RollbackMove
>   ```
> - Invalid moves wouldn't just fail at runtime; invalid states would be **unrepresentable in the type system** (Parse, don't validate).
> - Side effects (WebSocket I/O) would be strictly isolated from the pure game state reducer."

---

## 7. SYSTEM SCALING & PRODUCTION HARDENING

When Juspay asks: **"Your platform has 1,000,000 concurrent players. How do you design and scale the infrastructure?"**

```
                            [ Cloudflare / CDN / DDoS Shield ]
                                           │
                                           ▼
                             [ AWS ALB / Nginx Reverse Proxy ]
                             (Sticky Sessions: IP Hash / Cookie)
                                   │               │
                     ┌─────────────┴───────────────┴─────────────┐
                     ▼                                           ▼
          [ Node.js Worker 1 ]                        [ Node.js Worker 2 ]
                     │                                           │
                     └─────────────┬───────────────┬─────────────┘
                                   │               │
                                   ▼               ▼
                        [ Redis Cluster: Pub/Sub & Adapter ]
                               (Inter-node message bus)
                                           │
                                           ▼
                           [ Redis In-Memory State Store ]
                           (Room States, Distributed Locks)
                                           │
                                           ▼
                           [ Persistent Database: PostgreSQL ]
                           (Player profiles, Leaderboards, Match history)
```

### 1. The Horizontal Scaling Challenge with WebSockets
- Unlike stateless HTTP APIs, WebSockets are **persistent, stateful TCP connections**.
- Player A in Game Room 101 might be connected to **Server Instance 1**.
- Player B in Game Room 101 might be connected to **Server Instance 2**.
- If Player A plays a card, Server 1 cannot emit directly to Player B!

### 2. The Solution: Socket.IO Redis Adapter (Pub/Sub)
- Connect all Node.js instances to a **Redis Cluster** using `@socket.io/redis-adapter`.
- When Server 1 emits to room `gameId`, the Redis adapter publishes the event to the Redis channel `room:gameId`.
- Server 2 receives the Redis message and pushes it down the WebSocket to Player B.

### 3. Load Balancer Sticky Sessions
- During the initial HTTP handshake before upgrading to WebSocket, the client makes multiple HTTP requests (`polling` $\to$ `upgrade`).
- The Load Balancer (ALB / Nginx) must use **Cookie-based Sticky Sessions** or **IP Hashing** so handshake requests route to the exact same server instance until the WebSocket connection is established.

### 4. Distributed State & Concurrency Control
- In a multi-server setup, in-memory `Map` is replaced with **Redis**.
- **Concurrency Protection:** What if two actions for the same room hit two different servers simultaneously?
  - Use **Redis Distributed Locks (Redlock)** or **Redis Lua Scripts**:
    ```lua
    -- Atomic Move Execution in Redis Lua
    local state = redis.call('GET', KEYS[1])
    -- Validate and Mutate inside Lua (Guaranteed Single-Threaded Atomic in Redis)
    redis.call('SET', KEYS[1], newState)
    ```
  - Or use the **Actor Model** (e.g., Erlang/OTP or Akka): Each Game Room is an independent Actor pinned to a specific worker thread. All actions for that room are queued and processed sequentially.

---

## 8. ADVANCED TECHNICAL DEEP DIVE: THE 4 CORE ARCHITECTURAL PILLARS

### Q21: Transport & Framing Layers: WebSockets vs HTTP & Client vs Server Mutation Authority

#### Part A: Framing & Transport Layer Anatomy
- **Transport Layer (OSI Layer 4):** Both HTTP/1.1, HTTP/2, and WebSockets run on top of reliable, connection-oriented **TCP**.
- **Framing Differences:**
  - **HTTP/1.1 Framing:** Unframed, ASCII text stream. Headers end with `\r\n\r\n`. Every request requires full headers (~500B to 2KB including cookies, user-agent, cache controls). Even with Keep-Alive, communication is strictly half-duplex (request followed by response).
  - **WebSocket (RFC 6455) Framing:** True binary framing protocol. A WebSocket frame looks like this in memory:
    ```
      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Masking-key (if MASK==1)  |          Payload Data         |
     +-------------------------------+ - - - - - - - - - - - - - - - +
    ```
    - `FIN (1 bit)`: Indicates if this is the final fragment of a message.
    - `Opcode (4 bits)`: Defines payload interpretation (`0x1` Text, `0x2` Binary, `0x8` Close, `0x9` Ping, `0xA` Pong).
    - `MASK (1 bit)`: **Client-to-server frames MUST be masked (`MASK = 1`)**. Why? To prevent **cache poisoning attacks** on intermediary transparent HTTP proxy servers that might misinterpret framed WebSocket payloads as cached HTTP responses!
    - `Masking Key (4 bytes)`: A random 32-bit key chosen by the client. The payload bytes $P_i$ are XOR-obfuscated:
      $$P_i = C_i \oplus K_{i \pmod 4}$$
    - `Overhead`: Minimum 2 bytes for server-to-client frames, 6 bytes for client-to-server frames. Compared to HTTP's 1KB+ overhead, WebSockets reduce wire protocol overhead by **over 95%**!

#### Part B: The Mutation Authority Decision Matrix (Client vs Server)
Why did we choose **Server-Side Authoritative Mutation** instead of Client-Side Prediction?
1. **Asymmetric Information (Anti-Cheating):** Card games require hidden state (opponents' hands). If mutations occurred on the client, the client would need visibility into the full deck and opponents' cards, enabling trivial reverse-engineering and cheating via DevTools.
2. **Turn-Based vs Real-Time Physics:** In fast-twitch games (CS:GO, Rocket League), clients use **Client-Side Prediction and Dead Reckoning** to simulate physics immediately at 60Hz and reconcile when server packets arrive. In turn-based card games, human reaction time is ~200ms; a 50ms server validation round-trip is completely imperceptible to the user.
3. **Deterministic Consistency:** Satti Center uses a strict finite state machine. By executing mutations solely on the server, we eliminate client-side state divergence, reconciliation conflicts, and race conditions.

---

### Q22: Session Management Trade-Offs: Stateful Memory Stores vs Stateless JWTs

When designing session persistence for a real-time multiplayer platform, the choice between **Stateful Memory/Redis Stores** and **Stateless JWTs** involves critical engineering trade-offs:

| Architectural Metric | Stateful Memory / Redis Sessions | Stateless JWT Tokens |
| :--- | :--- | :--- |
| **Storage Location** | Server RAM / Redis Hash | Client `localStorage` / HTTP-only Cookie |
| **Token Payload Size** | Opaque Token (~8–16 bytes NanoID) | Structured Claims (~300–800 bytes base64) |
| **Revocation / Invalidation** | **Instantaneous**: `redis.del(sessionId)` immediately evicts the player. | **Difficult / Near-Impossible**: Token remains valid until expiration unless a stateful blacklist is maintained. |
| **Replay Attack Resistance** | **High**: Session can be bound to IP, socket ID, and device fingerprint. | **Lower**: Stolen JWT can be used until TTL expiry. |
| **Horizontal Scaling** | Requires shared Redis instance or sticky sessions. | Trivial for stateless HTTP, but **does not benefit persistent WebSockets**. |
| **Real-Time Association** | Maps directly to socket connections and room rosters. | Every socket message requires signature verification or decoding. |

#### The Verdict & The Production Hybrid Pattern:
- **Why pure JWT fails for real-time multiplayer:** WebSockets are fundamentally **stateful TCP connections**. Claiming an architecture is "stateless" while maintaining 50,000 persistent TCP connections is an architectural contradiction! Moreover, if a player is banned, disconnects, or is kicked, a stateless JWT cannot be revoked in real-time without querying a centralized database.
- **The Ideal Production Pattern:**
  1. Use a **JWT for Authentication** during the initial HTTP handshake (`GET /socket.io/?token=...`). The server verifies the cryptographic signature (HMAC-SHA256 or RS256) to authenticate the user without a DB query.
  2. Once verified, the server binds the socket to an **in-memory/Redis stateful session** (`playerId`, `gameId`, `role`). All subsequent real-time messages run on the low-overhead socket session.

---

### Q23: Connection Recovery, TTL Expiration & Exponential Backoff with Jitter

#### Part A: Preventing Stale / Zombie Session Accumulation via TTL
In a real-time game, when a player drops their connection, the server faces a dilemma:
- If it deletes the session immediately, a quick page refresh or 3-second WiFi blip ruins the game.
- If it keeps the session indefinitely, disconnected players become **zombies**, blocking other players from finishing and leaking server RAM.

**The Solution: Two-Tier TTL Expiration Pipeline:**
```
[ Socket Drops ] ──> Mark `disconnected = true`
                           │
                           ▼
                 Start Lease Timer (TTL = 60s)
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
[ Client Reconnects in 60s ]      [ Timer Expires (60s) ]
  - Cancel Lease Timer              - Trigger `handleForfeit(playerId)`
  - Mark `disconnected = false`    - Convert Player to Auto-Bot OR Forfeit Hand
  - Emit State Synchronization      - Delete Session from Redis / Map
```

In Redis, this is implemented natively using Key Expiration:
```bash
# Store active session with 60 second TTL
SETEX session:player_123:game_456 60 "{ status: 'DISCONNECTED' }"
```

#### Part B: Exponential Backoff with Full Jitter
If 100,000 players drop connection simultaneously due to a network gateway failure, having all 100,000 clients retry reconnecting at fixed intervals (1s, 2s, 4s...) causes a **Thundering Herd Problem (Retry Storm)** that takes down the backend.

To prevent this, clients implement **Exponential Backoff with Full Jitter**:
$$\text{Sleep Time} = \text{random}(0, \min(M, B \cdot 2^{\text{attempt}}))$$
Where:
- $B$ = Base delay (e.g., 500ms)
- $M$ = Maximum backoff ceiling (e.g., 10 seconds)
- $\text{attempt}$ = Current retry count

**Code Implementation:**
```javascript
function getReconnectDelay(attempt, baseMs = 500, maxMs = 10000) {
    const exponential = Math.min(maxMs, baseMs * Math.pow(2, attempt));
    // Full Jitter: randomize between 0 and exponential ceiling
    return Math.floor(Math.random() * exponential);
}
```
*Impact:* This spreads the 100,000 incoming reconnect requests uniformly across the timeline, allowing the server to absorb the reconnect spike smoothly.

---

### Q24: Serialization Formats & Event-Driven Message Handling

#### Part A: Benchmarking Serialization Formats for Real-Time State
State updates in card games occur frequently. Minimizing packet serialization overhead preserves server CPU and mobile bandwidth:

| Format | Type | Payload Size (1 State Update) | Serialization Speed | Deserialization Speed | Schema Required? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **JSON** | Text (UTF-8) | ~1,200 bytes | Moderate (~0.15ms) | Moderate (~0.12ms) | No (Schemaless) |
| **MessagePack** | Binary | ~650 bytes (45% reduction) | Fast (~0.06ms) | Fast (~0.05ms) | No (Drop-in JSON replacement) |
| **Protocol Buffers (Protobuf)** | Binary | ~280 bytes (76% reduction) | Blazing (~0.02ms) | Blazing (~0.01ms) | Yes (`.proto` compiled) |
| **FlatBuffers** | Binary | ~310 bytes (74% reduction) | Instant (Zero-copy) | **Zero-copy (Direct memory read)**| Yes (`.fbs` compiled) |

- **Why JSON in Satti Center?** Rapid prototyping, native V8 JSON parser integration, human readability in browser DevTools.
- **How to upgrade to production scale:** Socket.IO supports custom parsers. Dropping in `@socket.io/msgpack-parser` cuts network payload sizes by ~50% across all clients without modifying any business logic.

#### Part B: Full Snapshot vs Delta Synchronization
- **Full Snapshot (Current Implementation):** Server emits the complete `Table` and player's `Hand` on every turn.
  - *Advantage:* Naturally self-healing. If a client drops a packet, the next state update completely restores correct state.
- **Delta Synchronization (Production Pattern):** Server emits only the mutation:
  ```json
  { "type": "DELTA", "seq": 104, "mutation": { "op": "PLAY", "cardId": "hearts-8-0", "pile": "hearts" } }
  ```
  - *Bandwidth:* Reduces payload size from 1,200 bytes to **under 40 bytes per turn**.
  - *Consistency Guard:* Every message includes a monotonically increasing Sequence Number (`seq`). If the client receives `seq: 106` when expecting `seq: 105`, it detects packet loss and requests a full checkpoint snapshot (`RESYNC`).

---

## 9. JUSPAY CORE DOMAIN: PAYMENTS SYSTEMS ARCHITECTURE & ENGINEERING

### 9.1 The Complete End-to-End Payment Flow & UPI 4-Party Ecosystem
Understanding how a transaction moves across India's financial rail (and how Juspay fits in) is central to their technical interviews:

```
[ Customer / Merchant App ]
          │ (1. Clicks 'Pay')
          ▼
   [ Juspay Hyper SDK ] ──(2. Loads UI / Presto)──> [ Express Checkout ]
          │
          │ (3. Initiate Payment via HTTPS / TLS 1.3)
          ▼
[ Juspay Payment Orchestrator (Bifrost / Hyperswitch) ]
          │
          │ (4. Dynamic Routing: Real-time health & latency score)
          ▼
[ Payment Gateway / Aggregator (Razorpay / Cashfree / PayU / Stripe) ]
          │
          │ (5. ISO 8583 / ISO 20022 message packet)
          ▼
[ Card Networks (Visa/Mastercard) / NPCI UPI Switch ]
          │
          │ (6. Authenticate / MPIN / 3DS 2.0 verification)
          ▼
     [ Issuer Bank Core Banking System (CBS) ] (Debits remitter account)
          │
          │ (7. Async webhook / S2S callback)
          ▼
[ Juspay Webhook Processing Engine ] ──(8. Updates FSM)──> [ Merchant Webhook ]
```

#### The 4-Party Model in Payments:
1. **Payer / Remitter:** The customer initiating the transaction.
2. **Issuer Bank (Remitter Bank):** Holds the customer's funds, verifies authentication (PIN/OTP), and debits the account.
3. **Acquirer Bank (Beneficiary Bank):** Holds the merchant's settlement account, credit destination.
4. **Card Network / Switch (NPCI / Visa / Mastercard):** The clearinghouse facilitating real-time settlement and packet routing between Issuer and Acquirer.
5. **Juspay's Role:** Juspay is **not a bank**; it is a **Payment Orchestrator & Technology Service Provider (TSP)**. It operates a high-throughput switch that connects merchants to multiple gateways and banks, providing:
   - Dynamic intelligent routing (routing transactions to whichever gateway has highest success rate at that second).
   - Frictionless checkout SDKs (1-click checkout, biometric auth).
   - Centralized reconciliation and fraud telemetry.

---

### 9.2 Modeling a Payment as a Deterministic Finite State Machine (FSM)

Just as our card game transitions through `LOBBY` $\to$ `PREP` $\to$ `PLAYING` $\to$ `FINISHED`, a payment is modeled as an immutable, non-reversible Finite State Machine:

```
                  ┌───────────────┐
                  │    CREATED    │
                  └───────┬───────┘
                          │ (Initiate Transaction)
                          ▼
                  ┌───────────────┐
                  │    PENDING    │
                  └───────┬───────┘
                          │ (Redirect to Bank / UPI App)
                          ▼
                  ┌───────────────┐
          ┌───────┤ AUTHENTICATING├───────┐
          │       └───────────────┘       │
(Auth Failed)                             │ (MPIN / 3DS Verified)
          ▼                               ▼
    ┌───────────┐                 ┌───────────────┐
    │  FAILED   │                 │  AUTHORIZED   │
    └───────────┘                 └───────┬───────┘
                                          │ (Capture funds)
                                          ▼
                                  ┌───────────────┐
                                  │   CAPTURED    │
                                  └───────┬───────┘
                                          │ (Refund requested)
                                          ▼
                                  ┌───────────────┐
                                  │   REFUNDED    │
                                  └───────────────┘
```

#### FSM Guard Conditions & Invariants:
1. **Terminal State Invariant:** States `CAPTURED`, `FAILED`, and `REFUNDED` are strictly terminal. A transaction marked `FAILED` can **never** transition to `CAPTURED`.
2. **Two-Step Settlement (Auth & Capture):**
   - **Authorize:** The bank reserves/holds the funds on the customer's card (credit limit decreases, but merchant does not have money).
   - **Capture:** The merchant claims the reserved funds once goods/services are confirmed. If order delivery fails, the authorization is **voided** without incurring interchange fees.
3. **Double-Spend Prevention (Concurrency Control):**
   - In SQL databases: Row-level pessimistic locking via `SELECT * FROM payments WHERE id = $1 FOR UPDATE`.
   - In distributed key-value stores: Distributed locks via **Redis Redlock** with auto-expiring leases (`SET lock:payment:<id> <uuid> NX PX 5000`).

---

### 9.3 Idempotency Engine & Double-Spend Prevention

In financial systems, network partitions and client retries are inevitable. Without idempotency, a network timeout during checkout could cause a user to be debited multiple times.

#### The Idempotency Key Lifecycle:
1. The merchant or client generates a unique `Idempotency-Key` (typically a UUID v4) and passes it in the HTTP request header:
   ```http
   POST /v1/payments/charge
   Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
   ```
2. **Atomic Lock Acquisition:**
   The backend executes an atomic Redis command:
   ```redis
   SET idempotency:9b1deb4d... "IN_PROGRESS" NX EX 120
   ```
   - If `NX` returns `nil` (key already exists): Another identical request is currently executing or has already finished!
   - If the existing key has status `"IN_PROGRESS"`: Return HTTP `409 Conflict` or wait on a Redis Pub/Sub channel for the original request to complete.
   - If the existing key has a cached response: Return the **exact cached response** immediately with an `Idempotent-Replay: true` header without touching the bank gateway.
3. **Completion:** When the original transaction finishes, the cached response body and HTTP status code are stored in Redis under the key for 24 hours.

---

### 9.4 Payment Orchestration & Smart Dynamic Routing

Juspay routes billions of transactions across multiple gateways (Razorpay, PayU, BillDesk, Cashfree, Axis, HDFC). No single gateway maintains 100% uptime.

#### 1. Dynamic Weighting & Routing Algorithm
Juspay calculates real-time gateway health scores using a moving window (last 5 minutes):
$$\text{Score}(PG) = w_1 \cdot \text{SuccessRate}_{5m} + w_2 \cdot (1 - \text{P95Latency}) + w_3 \cdot \text{CommercialCost}$$
- If HDFC Bank's netbanking gateway success rate plummets below 70%, the orchestrator dynamically re-routes 90% of traffic to ICICI or Axis in sub-second time.

#### 2. The Circuit Breaker Pattern (Resilience4j / Hystrix Model)
To prevent gateway outages from exhausting server connection pools:

```
       ┌────────────────────────┐
       │         CLOSED         │ ◄─── (Success rate stabilizes > 90%)
       │  (Normal: All calls go)│
       └───────────┬────────────┘
                   │ Failure rate > 50% in 10s window
                   ▼
       ┌────────────────────────┐
       │          OPEN          │
       │ (Fast-fail: Reject/Alt)│
       └───────────┬────────────┘
                   │ Cooldown timer expires (e.g., 30s)
                   ▼
       ┌────────────────────────┐
       │       HALF-OPEN        │ ─── (Probe fails: Trip back to OPEN)
       │ (Send 10 test probes)  │
       └────────────────────────┘
```
- **CLOSED:** Normal operation. Calls pass through to the gateway.
- **OPEN:** Gateway is failing. Calls are **immediately rejected or routed to a backup gateway** without attempting the primary gateway, preventing thread starvation and cascading system failure.
- **HALF-OPEN:** After a timeout, sends a small percentage of trial requests to probe if the bank has recovered.

---

### 9.5 Distributed Transactions in Payments: The SAGA Pattern

In microservice payments architectures, standard ACID transactions across services are impossible because external bank systems cannot participate in database locks.

#### Why Two-Phase Commit (2PC) Fails:
- **Blocking Coordinator:** If the coordinator crashes between the *Prepare* and *Commit* phases, all database locks remain held indefinitely.
- **No Control Over External APIs:** You cannot issue a `PREPARE` statement to HDFC Bank or Visa.

#### The SAGA Pattern (Orchestration vs Choreography):
A SAGA breaks a distributed transaction into a sequence of local transactions:
$$T_1 \to T_2 \to T_3 \to \dots \to T_n$$
Each local transaction updates its own service database and triggers the next step.

```
[ Saga Orchestrator ]
       │
       ├──── 1. Reserve Inventory ────────> [ Inventory Service ] (OK)
       │
       ├──── 2. Debit Wallet / Gateway ───> [ Payment Service ]   (FAILED!)
       │
       └──── 3. Compensating Action ──────> [ Inventory Service ] (Release Item)
```

#### Compensating Transactions:
If step $T_k$ fails, the Orchestrator executes **Compensating Transactions** ($C_{k-1}, \dots, C_1$) in reverse order to semantically undo all completed steps:
- Example: If `DebitAccount` succeeds but `IssueTicket` fails, the compensator executes `RefundAccount` (an explicit financial reversal).

---

### 9.6 Reconciliation & Settlement Engines

Reconciliation is the financial verification that every rupee debited from a customer actually landed in the merchant's account.

#### The 3-Way Matching Process:
Every night at midnight (T+1), the reconciliation engine ingests three distinct ledgers:
1. **Merchant Order Records:** Internal orders marked "paid".
2. **Juspay Switch Ledger:** All transaction IDs and states recorded by the orchestrator.
3. **Bank Settlement Files (MIS / MT940 / CAMT.053):** Daily end-of-day banking CSV/SWIFT settlement files received from partner banks.

```
       [ Merchant Ledger ]
               │
               ├─────── MATCH 1 ──────┐
               ▼                      ▼
    [ Juspay Switch Ledger ] ◄── MATCH 2 ──► [ Bank MIS File ]
```

#### Handling Reconciliation Breakages:
- **Type 1: Stranded Debit (Money debited, no order created):** The user was debited by the bank, but the webhook timed out. The reconciliation engine identifies the surplus bank credit and automatically initiates an **Auto-Refund** to the customer.
- **Type 2: False Positive (Goods delivered, no bank credit):** Flagged for manual operations investigation; merchant files a dispute claim with the gateway.

---

### 9.7 Webhook Architecture, Retries & Cryptographic Integrity

Webhooks deliver asynchronous payment confirmations from bank gateways. Because the public internet is unreliable, webhook architectures must handle three guarantees:

#### 1. At-Least-Once Delivery & Deduplication
Banks retry webhooks until an HTTP 200 is received. The consumer must enforce idempotency:
```javascript
async function handleWebhook(event) {
    const key = `webhook_processed:${event.id}`;
    const isNew = await redis.set(key, "1", "NX", "EX", 86400);
    if (!isNew) {
        return res.status(200).send("Already processed");
    }
    await processPaymentUpdate(event);
    return res.status(200).send("OK");
}
```

#### 2. Exponential Backoff with Full Jitter
When retrying failed webhook deliveries to merchants:
$$t = \text{random}(0, \min(M, B \cdot 2^i))$$
- $B$: Base backoff (e.g., 2 seconds).
- $i$: Retry attempt number.
- $M$: Maximum cap (e.g., 3600 seconds).
- **Why Jitter is Crucial:** Without randomization, thousands of merchants recovering from a shared outage will all receive retry attempts simultaneously, causing a thundering herd problem that knocks them offline again.

#### 3. Cryptographic Signature Verification & Timing Attacks
Incoming webhooks include an HMAC signature header (`X-Juspay-Signature: t=162000,v1=9f8a...`). 
To prevent **Timing Attacks** (where an attacker measures microsecond response time differences to guess the signature byte-by-byte):
```javascript
import crypto from "crypto";

function verifySignature(payload, signature, secret) {
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    // Constant-time comparison: ALWAYS takes the exact same CPU cycles regardless of match length
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

### 9.8 Software Architecture Paradigms

#### 1. MVC (Model-View-Controller)
- **Model:** Represents pure business domain state and validation rules (In Satti Center: `gameState.js`, `card.js`).
- **View:** Formats and renders sanitized representations (In Satti Center: `playerViews.js` on backend, React components on frontend).
- **Controller:** Translates incoming client actions to model mutations (In Satti Center: `wsServer.js`, `dispatchAction.js`).

#### 2. TDD (Test-Driven Development) & The Testing Trophy
- **The Red-Green-Refactor Cycle:**
  1. *Red:* Write an automated test that fails before any implementation code exists.
  2. *Green:* Write the absolute minimum code to pass the test.
  3. *Refactor:* Clean up design and optimize while keeping tests green.
- **The Testing Trophy:** Prioritize **Integration Tests** (testing engine + validation together) over excessive Unit Tests, with lightweight E2E tests at the top.

#### 3. DDD (Domain-Driven Design)
- **Ubiquitous Language:** Shared vocabulary between developers and business (e.g., `Hand`, `Pile`, `Deadlock` in gaming; `Escrow`, `VPA`, `Chargeback` in payments).
- **Entities:** Objects with a distinct persistent identity (e.g., `Player` with unique `id`).
- **Value Objects:** Immutable objects defined purely by attributes with no separate identity (e.g., `Card { suit: 'hearts', value: 7 }`).
- **Aggregate Root:** A cluster of domain objects treated as a single unit for data changes (In Satti Center: `GameRoom` is the Aggregate Root controlling access to `Table` and `Players`).

#### 4. Event-Driven Architecture (EDA) & Event Sourcing
- Instead of storing just the current state, **Event Sourcing** stores every change as a chronological append-only log of immutable events:
  $$\text{Event Log} = [\text{GameCreated}, \text{CardDealt}, \text{CardPlayed}, \text{TurnPassed}]$$
- Current state is derived by replaying the log: $\text{State} = \sum \text{Events}$.
- *Why Juspay loves Event Sourcing:* Provides an **unalterable financial audit trail**. If a dispute arises, the ledger can be replayed to verify account balances at any millisecond in history.

---

### 9.9 The API Landscape: Protocol & Communication Architecture

#### 1. REST (Representational State Transfer)
* **Core Philosophy:** An architectural style based on stateless client-server communication centered around **Resources** identified by URIs (e.g., `/api/v1/orders/123`).
* **How It Works Under the Hood:**
  1. **HTTP Verbs as Intent:** Translates CRUD operations directly into standard HTTP methods:
     - `GET` (Read, Idempotent & Safe).
     - `POST` (Create, Non-Idempotent).
     - `PUT` (Full Replace, Idempotent).
     - `PATCH` (Partial Update, Non-Idempotent or Idempotent).
     - `DELETE` (Remove, Idempotent).
  2. **Stateless Request/Response Cycle:** Every request over TCP/TLS must contain complete context (Authentication headers, cookies, API keys). The server stores no client session context between requests, enabling trivial horizontal scaling behind load balancers.
  3. **HTTP Caching:** Leverages native browser and CDN reverse-proxy caching using standard headers (`Cache-Control: max-age=3600`, `ETag`, `If-None-Match: 304 Not Modified`).
* **Limitations:**
  - **Overhead:** Retransmits verbose HTTP headers (often 500–1000 bytes) on every single request.
  - **Over-fetching & Under-fetching:** Rigid endpoints return fixed JSON shapes, forcing mobile clients to either download unused fields or make multiple round-trips to render a single view.

---

#### 2. gRPC (Google Remote Procedure Call)
* **Core Philosophy:** An RPC framework where a client can directly invoke a method on a server application on a different machine as if it were a local object, powered by **Protocol Buffers** over **HTTP/2**.
* **How It Works Under the Hood:**
  1. **Strict Interface Contracts (`.proto` IDL):** Services and data models are defined in language-agnostic `.proto` files:
     ```protobuf
     syntax = "proto3";
     service PaymentService {
       rpc ProcessPayment (PaymentRequest) returns (PaymentResponse);
       rpc StreamTransactions (MerchantId) returns (stream Transaction);
     }
     message PaymentRequest {
       string transactionId = 1;
       int64 amountInPaise = 2;
     }
     ```
  2. **Binary Wire Format (Protocol Buffers):** Unlike human-readable JSON strings, Protobuf serializes data into compact binary using Varints (variable-length integers) and field tag numbers. This yields **60–80% smaller payloads** and avoids expensive JSON text parsing CPU cycles.
  3. **HTTP/2 Multiplexing:** Operates strictly over persistent HTTP/2 connections. Multiple RPC calls are divided into binary frames and interleaved concurrently over a **single TCP connection**, eliminating HTTP/1.1 head-of-line blocking.
  4. **The 4 Streaming Models:**
     - *Unary RPC:* Traditional 1 Request $\to$ 1 Response.
     - *Server Streaming:* 1 Request $\to$ Continuous stream of response messages (e.g., live bank statement downloads).
     - *Client Streaming:* Continuous stream of requests $\to$ 1 Response (e.g., uploading chunks of batch logs).
     - *Bidirectional Streaming:* Both client and server read and write independent message streams over the same persistent connection.

---

#### 3. GraphQL
* **Core Philosophy:** A declarative data-fetching and query language created by Meta where the **client dictates the exact response shape**, querying a single unified endpoint (`POST /graphql`).
* **How It Works Under the Hood:**
  1. **Schema Definition Language (SDL):** Defines types, queries, and mutations:
     ```graphql
     type Player {
       id: ID!
       name: String!
       cards: [Card!]!
     }
     type Query {
       player(id: ID!): Player
     }
     ```
  2. **Query AST & Resolvers Tree:** The client sends an explicit query:
     ```graphql
     query { player(id: "p1") { name } } // Asks strictly for name, omitting cards!
     ```
     The server parses the query into an Abstract Syntax Tree (AST) and invokes dedicated **Resolver functions** for each requested field.
  3. **Solves Over/Under-Fetching:** Mobile clients download only the minimal bytes needed for the screen.
  4. **The $N+1$ Problem & DataLoader Solution:**
     - *The Flaw:* In nested queries (`orders { customer { name } }`), a naive server executes 1 database query for 50 orders, followed by 50 individual queries for each customer ($50 + 1$ queries).
     - *The Fix:* **DataLoader** collects all requested IDs within a single JavaScript event loop tick, deduplicates them, and executes a single batched SQL query (`SELECT * FROM customers WHERE id IN (...)`).

---

#### 4. WebSockets (RFC 6455)
* **Core Philosophy:** An independent, standardized protocol providing **persistent, low-latency, full-duplex communication** over a single TCP connection, ideal for real-time multiplayer games, chats, and trading desks.
* **How It Works Under the Hood:**
  1. **The HTTP Upgrade Handshake:**
     - Client initiates standard HTTP/1.1 GET with headers:
       ```http
       GET /socket HTTP/1.1
       Host: server.com
       Upgrade: websocket
       Connection: Upgrade
       Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
       Sec-WebSocket-Version: 13
       ```
     - Server accepts by concatenating the key with a standard GUID (`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`), hashing with SHA-1, base64-encoding, and returning:
       ```http
       HTTP/1.1 101 Switching Protocols
       Upgrade: websocket
       Connection: Upgrade
       Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
       ```
  2. **Binary Framing Protocol:**
     - HTTP is discarded; the raw TCP connection stays alive.
     - Messages are transmitted in lightweight frames with **2 to 10 bytes of framing overhead** (vs 500+ bytes for HTTP headers):
       - *FIN bit (1 bit):* Indicates if this frame is the final fragment of a message.
       - *Opcode (4 bits):* Identifies frame type (`0x1` text, `0x2` binary, `0x8` close, `0x9` ping, `0xA` pong).
       - *Payload Length (7, 7+16, or 7+64 bits).*
  3. **Client-to-Server Masking:**
     All frames sent from client to server MUST be masked with a random 4-byte key using XOR transformation:
     $$\text{Masked}[i] = \text{Original}[i] \oplus \text{Mask}[i \pmod 4]$$
     *(Prevents malicious scripts from poisoning intermediate proxy caches with fake HTTP responses).*
  4. **Heartbeats (Ping/Pong):** Small control frames sent periodically to detect broken connections and prevent NAT firewalls from terminating idle sockets.

---

#### 5. Server-Sent Events (SSE / EventSource)
* **Core Philosophy:** A lightweight, browser-native standard for **monidirectional streaming** from server to client over standard HTTP, making it simpler than WebSockets when clients only need to receive data.
* **How It Works Under the Hood:**
  1. **Standard HTTP Connection:** The browser opens a persistent HTTP connection using the built-in `EventSource` API:
     ```javascript
     const eventSource = new EventSource("/api/live-stream");
     eventSource.onmessage = (e) => console.log(JSON.parse(e.data));
     ```
  2. **Response Streaming Headers:**
     ```http
     HTTP/1.1 200 OK
     Content-Type: text/event-stream
     Cache-Control: no-cache
     Connection: keep-alive
     ```
  3. **Text Delimited Framing Format:** The server pushes events as plain UTF-8 text chunks separated by double newlines (`\n\n`):
     ```http
     id: 104
     event: payment_status
     data: {"paymentId": "pay_987", "status": "CAPTURED"}

     ```
  4. **Built-in Auto-Reconnection & Resumption:**
     If the connection drops, the browser automatically reconnects after a few seconds and sends the header:
     ```http
     Last-Event-ID: 104
     ```
     The server inspects this header and resumes streaming from the exact point of interruption without losing messages.
  5. **Why Choose SSE over WebSockets?**
     - Operates over standard HTTP (no special proxy/firewall rules needed).
     - Automatically leverages **HTTP/2 multiplexing**.
     - Native reconnection with built-in message IDs.
     - Perfect for LLM token streaming (ChatGPT-style), payment status spinners, stock price tickers, and push notifications.

---

#### Summary Protocol Comparison Matrix

| Dimension | REST | gRPC | GraphQL | WebSockets | SSE (Server-Sent Events) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Protocol** | HTTP/1.1 or HTTP/2 | HTTP/2 (Strict) | HTTP/1.1 or HTTP/2 | WebSocket (RFC 6455) | HTTP/1.1 or HTTP/2 |
| **Data Format** | JSON, XML | Protocol Buffers (Binary) | JSON | Binary or Text (JSON) | UTF-8 Text Stream |
| **Direction** | Unidirectional (Req/Res) | Bidirectional Streaming | Unidirectional (Req/Res) | **Full-Duplex (Bidirectional)** | Unidirectional (Server $\to$ Client) |
| **Transport Overhead** | High (HTTP Headers on every request) | **Ultra-Low** (Binary serialization) | High (HTTP Headers) | **Ultra-Low (2–10 byte frame header)** | Low |
| **Connection** | Short-lived / Keep-Alive | Persistent HTTP/2 Multiplexed | Short-lived / Keep-Alive | **Persistent Single TCP Connection** | Persistent HTTP Connection |
| **Best Used For** | Public merchant APIs, CRUD | High-throughput microservice IPC | Complex mobile dashboards | Real-time multiplayer games, live chats | Stock tickers, simple notification feeds |

---

## 10. COMPLETE ENGINEERING PREREQUISITES CHECKLIST

Use this comprehensive technical guide to master every core computer science and web engineering topic tested by Juspay:

---

### 10.1 JavaScript Engine (V8) & Execution Internals

#### 1. The V8 Compilation Pipeline
V8 does not interpret JavaScript naively; it compiles JS to machine code using a two-tier execution engine:
```
[ JavaScript Source Code ]
           │
           ▼
[ Parser (AST Generation) ]
           │
           ▼
[ Ignition Interpreter ] ──(Generates Bytecode & Collects Profiling Feedback)──► [ Executes Bytecode ]
           │
           ▼ (Hot functions identified by execution frequency)
[ TurboFan JIT Compiler ] ──(Generates Optimized Machine Code)───────────────► [ Direct CPU Execution ]
           │
           ▼ (Deoptimization / Bailout if polymorphic type assumptions fail)
[ Deopt to Ignition Bytecode ]
```
- **Ignition:** Fast bytecode generator that starts execution with zero compilation latency while gathering type telemetry.
- **TurboFan:** Optimizing Just-In-Time (JIT) compiler. When a function is called repeatedly ("hot"), TurboFan compiles it into direct x86/ARM machine code under the assumption that variable types will remain consistent.
- **Deoptimization:** If a function optimized for integers is suddenly passed a string, TurboFan invalidates the machine code and deoptimizes back to Ignition bytecode.

#### 2. Hidden Classes (Shapes) & Inline Caching (IC)
- Unlike C++ where object memory layouts are fixed at compile time, JavaScript objects can have dynamic properties added at runtime.
- To maintain speed, V8 creates hidden internal transition trees called **Hidden Classes (Shapes)**.
- If two objects are created with the exact same properties in the exact same order:
  ```javascript
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 3, y: 4 }; // Shares the exact same Shape as p1!
  ```
  V8 assigns them the same Shape. Property access (`p1.x`) compiles to a direct memory offset lookup.
- If properties are added in different orders (`p1.x = 1; p1.y = 2;` vs `p2.y = 2; p2.x = 1;`), V8 creates divergent shapes, causing **Inline Cache Misses** and slowing property access down to hash-table lookups.

#### 3. Execution Context, Call Stack & Closures
- **Execution Context:** The wrapper environment created whenever code runs. Contains:
  1. *Variable Environment:* Hoisted `var` variables and function declarations.
  2. *Lexical Environment:* `let`, `const`, and outer lexical scope references (Scope Chain).
  3. *`this` Binding.*
- **Creation Phase vs Execution Phase:**
  - *Creation Phase:* Memory allocated for variables and functions. `var` is initialized to `undefined`; `let` and `const` enter the **Temporal Dead Zone (TDZ)** until their declaration line is executed.
  - *Execution Phase:* Code runs line by line, assigning values and evaluating expressions.
- **Closures:** A closure is a function bundled with its lexical environment. Even after the outer function has returned and its execution context popped off the Call Stack, inner functions retain access to variables in the outer scope via heap-allocated scope references:
  ```javascript
  function createRoom(roomId) {
      let turn = 0; // Stored on V8 Heap, NOT Call Stack
      return function advance() {
          return `${roomId}: turn ${++turn}`;
      };
  }
  ```

#### 4. The 4 Rules of `this` Binding
In JavaScript, `this` is not bound at declaration time; it is bound at **call-site execution time**:
1. **Default Binding:** In standalone function calls (`fn()`), `this` refers to `globalThis` (`window` in browser), or `undefined` in strict mode (`"use strict"`).
2. **Implicit Binding:** When called as a method of an object (`obj.fn()`), `this` refers to `obj`.
3. **Explicit Binding:** Using `.call(ctx, arg1)`, `.apply(ctx, [args])`, or `.bind(ctx)` explicitly sets `this` to `ctx`.
4. **Lexical Binding (Arrow Functions):** Arrow functions do NOT have their own `this`. They resolve `this` lexically from the enclosing lexical scope at the time of creation.

#### 5. V8 Garbage Collection (Generational Hypothesis)
V8 splits heap memory into distinct spaces based on the **Generational Hypothesis** (most objects die young):
1. **New Space (Young Generation):**
   - Managed by the **Scavenger Collector** using Cheney's copy algorithm.
   - Split into two semi-spaces: **From-Space** and **To-Space**.
   - Live objects are copied from From-Space to To-Space in a single pass; dead memory is wiped instantly by flipping pointers.
   - Objects surviving two scavenger cycles are promoted to the Old Space.
2. **Old Space (Old Generation):**
   - Managed by **Major GC (Mark-Sweep-Compact)**:
     - *Marking:* Traces references from GC roots (window, call stack, global variables) using tri-color marking (White = unvisited, Grey = discovered, Black = visited).
     - *Sweeping:* Traverses the heap to reclaim white (unreachable) memory slots.
     - *Compacting:* Shifts fragmented memory allocations into contiguous memory blocks to prevent memory allocation failures.
3. **Orinoco:** V8's modern GC subsystem that executes marking and sweeping **concurrently and incrementally** on worker threads to eliminate UI freeze frames ("Stop-The-World" pauses).

---

### 10.2 Node.js Architecture & The libuv Event Loop

Node.js is built on a single-threaded JavaScript execution model paired with a multi-threaded C++ runtime provided by **libuv**.

```
[ JavaScript Engine (V8) ]
           │ (Calls non-blocking APIs: fs, net, http, crypto)
           ▼
     [ Node.js Bindings ]
           │
           ▼
      [ libuv Event Loop & Thread Pool ]
           │
           ├── I/O Multiplexing (epoll on Linux / kqueue on macOS / IOCP on Windows)
           └── Worker Thread Pool (Default: 4 threads for fs, dns, crypto, zlib)
```

#### The 6 Phases of the libuv Event Loop:
The Event Loop executes in a continuous loop through 6 discrete phases:

```
┌────────────────────────────────────────┐
│               1. TIMERS                │ ──► Runs callbacks of setTimeout() & setInterval()
└───────────────────┬────────────────────┘
                    ▼
┌────────────────────────────────────────┐
│          2. PENDING CALLBACKS          │ ──► Executes deferred OS I/O callbacks (TCP errors, etc.)
└───────────────────┬────────────────────┘
                    ▼
┌────────────────────────────────────────┐
│          3. IDLE / PREPARE             │ ──► Internal libuv operations only
└───────────────────┬────────────────────┘
                    ▼
┌────────────────────────────────────────┐
│               4. POLL                  │ ──► Retrieves new I/O events (Socket packets, DB responses)
└───────────────────┬────────────────────┘     Blocks here if no timers are pending!
                    ▼
┌────────────────────────────────────────┐
│               5. CHECK                 │ ──► Executes setImmediate() callbacks
└───────────────────┬────────────────────┘
                    ▼
┌────────────────────────────────────────┐
│          6. CLOSE CALLBACKS            │ ──► Executes socket.on('close') callbacks
└────────────────────────────────────────┘
```

#### Microtasks: `process.nextTick` vs `Promise.then`:
- **Microtask Queues do NOT belong to any single phase!**
- Microtasks execute **immediately after the currently running operation finishes**, before the Event Loop moves to the next tick.
- **Priority Order:**
  1. `process.nextTick` Queue (Highest priority; exhausts completely before promises run).
  2. `Promise.then` / `queueMicrotask` Queue.
  - *Caution:* A recursive `process.nextTick()` will starve the event loop, completely blocking I/O and timers!

---

### 10.3 Browser Rendering Pipeline & High-Performance DOM

#### 1. The Critical Rendering Path
How the browser translates raw bytes into pixels on the user's screen:
$$\text{HTML} \to \text{DOM Tree} \quad + \quad \text{CSS} \to \text{CSSOM Tree} \quad \implies \quad \text{Render Tree} \to \text{Layout (Reflow)} \to \text{Paint} \to \text{Composite}$$

1. **DOM Construction:** Raw bytes $\to$ Characters $\to$ Tokens $\to$ Nodes $\to$ DOM Tree.
2. **CSSOM Construction:** Parses CSS rules and links them hierarchically.
3. **Render Tree:** Combines DOM and CSSOM; elements with `display: none` are excluded.
4. **Layout (Reflow):** Computes exact geometric coordinates and pixel dimensions for every visible node on the viewport.
5. **Paint:** Fills in colors, borders, shadows, and text onto multiple bitmap layers.
6. **Compositing:** The GPU compositor thread draws layers onto the screen in correct Z-order.

#### 2. Reflow vs Repaint vs GPU Compositing
- **Reflow (Most Expensive):** Changing layout geometry (`width`, `height`, `margin`, `top`, `fontSize`). Forces the browser to recalculate the positions of child and sibling elements.
- **Repaint (Moderate):** Changing appearance without altering geometry (`color`, `background-color`, `visibility`). Skips layout, runs paint and composite.
- **GPU Compositing (Fastest — 60/120 FPS):** Changing `transform: translate3d()` or `opacity`. Skips **both reflow and repaint**! The GPU compositor shifts pre-rendered texture layers directly in hardware memory.

#### 3. Event Propagation & Event Delegation
- **3-Phase Propagation:**
  1. *Capturing Phase:* Event travels downwards from `Window` $\to$ `Document` $\to$ parent containers $\to$ target element.
  2. *Target Phase:* Event arrives at the actual target clicked.
  3. *Bubbling Phase:* Event bubbles back upwards from target $\to$ parent containers $\to$ `Window`.
- **Event Delegation:**
  Instead of attaching 52 individual event listeners to 52 card elements (consuming 52 callback closures in memory), attach **one single listener** to the parent container (`Table` / `Hand`):
  ```javascript
  tableElement.addEventListener("click", (e) => {
      const cardEl = e.target.closest(".card");
      if (!cardEl) return;
      handleCardClick(cardEl.dataset.cardId);
  });
  ```

---

### 10.4 React 19 Core Mechanics & Fiber Architecture

#### 1. The Fiber Architecture
Before React 16, the "Stack Reconciler" walked the component tree recursively. Once rendering started, it could not be paused, causing dropped frames on complex UIs.
- **Fiber is a linked-list representation of the component tree:**
  ```typescript
  interface FiberNode {
      tag: WorkTag;              // FunctionComponent, HostComponent, etc.
      key: null | string;
      stateNode: any;            // Actual DOM element reference
      child: FiberNode | null;   // First child
      sibling: FiberNode | null; // Next sibling
      return: FiberNode | null;  // Parent Fiber
      memoizedState: any;        // Hook state linked list
      alternate: FiberNode | null;// Points to work-in-progress twin
  }
  ```
- **Two-Phase Execution:**
  1. *Render Phase (Concurrent & Interruptible):* React walks the Fiber tree, performs diffing, and schedules effects. Can be paused or abandoned if higher-priority user input arrives (Time Slicing).
  2. *Commit Phase (Synchronous & Non-Interruptible):* React mutates the real DOM tree and executes layout effects in a single atomic pass.

#### 2. The $O(N)$ Reconciliation Heuristics
Diffing two arbitrary trees is computationally $O(N^3)$. React achieves $O(N)$ speed via two assumptions:
1. **Different Element Types:** Two elements of different types produce different trees. Changing `<div className="card">` to `<span className="card">` completely tears down the sub-tree and recreates DOM nodes.
2. **Keys Preserved:** Keys provide persistent identity across re-renders. Keys must be unique, stable, and persistent. Never use array indices as keys when lists can be re-ordered, filtered, or prepended!

#### 3. Zustand Architecture (`useSyncExternalStore`)
- Zustand creates an external state store outside React's Fiber tree.
- Uses React's official `useSyncExternalStore` hook:
  ```javascript
  const slice = useSyncExternalStore(
      store.subscribe,          // Subscribes listener callback
      () => selector(store.getState()), // Client snapshot
      () => selector(store.getInitialState()) // SSR snapshot
  );
  ```
- **Prevents Tearing:** In Concurrent React, rendering can pause mid-tree. Without `useSyncExternalStore`, a state update during a render pause could cause two components in the same render cycle to see two different state values ("Tearing").

---

### 10.5 Operating Systems & Networking Primitives for Game/Payment Engines

#### 1. TCP 3-Way Handshake & The WebSocket Upgrade
- **TCP Connection Establishment:**
  1. Client $\to$ Server: `SYN` (Synchronize Sequence Number).
  2. Server $\to$ Client: `SYN-ACK` (Acknowledge sequence + send server sequence).
  3. Client $\to$ Server: `ACK` (Connection established; data transfer begins).
- **HTTP/1.1 101 Switching Protocols (WebSocket Handshake):**
  - Client sends HTTP GET with `Upgrade: websocket` and `Sec-WebSocket-Key`.
  - Server hashes key with SHA-1 + GUID, returning `101 Switching Protocols`.
  - The underlying TCP socket is now persistent; HTTP headers are completely dropped, and communication shifts to binary framing.

#### 2. TCP Termination & The `TIME_WAIT` State
- **4-Way Handshake:**
  1. Client $\to$ Server: `FIN` (Finish).
  2. Server $\to$ Client: `ACK`.
  3. Server $\to$ Client: `FIN`.
  4. Client $\to$ Server: `ACK` $\to$ Client enters `TIME_WAIT`.
- **Why `TIME_WAIT` exists:**
  - Ensures the final `ACK` is reliably received by the server (if lost, server re-sends `FIN`).
  - Waits for $2 \times \text{MSL}$ (Maximum Segment Lifetime = 60–120s) so old duplicate packets dissipate from the internet before the socket port can be reused.
- **Port Exhaustion Risk:** Under high QPS microservice traffic, creating and destroying short-lived TCP connections fills the OS with sockets in `TIME_WAIT`, causing **Socket Exhaustion (`EADDRINUSE`)**. Solved via HTTP/2 multiplexing, connection pooling, and `SO_REUSEADDR`.

#### 3. I/O Multiplexing: `epoll` vs `select` / `poll`
- **`select` / `poll` ($O(N)$):** The OS kernel scans through the entire array of registered file descriptors to check which socket has incoming data. As connections scale to 100,000, CPU utilization hits 100% simply looping over idle sockets.
- **`epoll` ($O(1)$ on Linux):** Uses an event-driven callback in the kernel. When a packet arrives on a network interface, the network card triggers an interrupt that places the active socket into a **Ready List**. `epoll_wait` only returns active sockets, providing true $O(1)$ scaling regardless of how many idle connections exist.

---

### 10.6 Database Internals & Concurrency Control

#### 1. Why Databases Use B+ Trees for Indexing
- **B-Tree:** Stores keys and row data pointers in all internal and leaf nodes.
- **B+ Tree (PostgreSQL, MySQL InnoDB):**
  - Internal nodes store **only keys and page pointers**; all data row pointers are stored strictly in leaf nodes.
  - Leaf nodes are linked together via a **doubly-linked list**.
- **Advantages of B+ Trees:**
  1. *Higher Fan-out & Shallow Tree Depth:* Because internal nodes don't store row data, a 4KB disk page can hold thousands of keys. A 3-level B+ Tree can index millions of rows with only 3 disk I/O reads.
  2. *Ultra-Fast Range Scans:* Querying `WHERE created_at BETWEEN X AND Y` only requires traversing down to the first leaf node, then walking the linked list horizontally without traversing the tree.

#### 2. Write-Ahead Logging (WAL)
- Writing directly to randomized table heap pages on disk is slow and risks database corruption if power is lost mid-write.
- **WAL Architecture:**
  1. Every modification is first appended sequentially to an append-only log file on disk (**WAL**). Sequential disk I/O is orders of magnitude faster than random I/O.
  2. Modifications are applied to in-memory **Buffer Pools** (Dirty Pages).
  3. Transaction commits once the WAL record is flushed (`fsync`).
  4. In the background, a **Checkpoint Process** flushes dirty buffer pool pages to permanent database files. If the server crashes, recovery replays the WAL from the last checkpoint.

#### 3. ACID Properties & SQL Isolation Levels

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read |
| :--- | :---: | :---: | :---: |
| **Read Uncommitted** | Possible | Possible | Possible |
| **Read Committed** (PostgreSQL Default) | **Prevented** | Possible | Possible |
| **Repeatable Read** | **Prevented** | **Prevented** | **Prevented** (in Postgres MVCC) |
| **Serializable** | **Prevented** | **Prevented** | **Prevented** |

- **Dirty Read:** Transaction reads uncommitted data written by a concurrent transaction that later rolls back.
- **Non-Repeatable Read:** Transaction reads row $X$; concurrent transaction modifies and commits row $X$; first transaction re-reads row $X$ and finds different values.
- **Phantom Read:** Transaction executes `SELECT COUNT(*) WHERE age > 25`; concurrent transaction inserts a new row with `age = 26` and commits; first transaction re-runs query and sees an extra row.
- **PostgreSQL MVCC (Multi-Version Concurrency Control):**
  Instead of locking rows for reading, PostgreSQL creates a new tuple version (`xmin`, `xmax` transaction IDs) on every update. Readers never block writers, and writers never block readers!

---

## 11. MORNING-OF-THE-INTERVIEW RAPID-FIRE CHEAT SHEET

Review these 10 bullet points right before stepping into the interview:

1. **Architecture:** Server-authoritative, zero-trust client, event-driven decoupled game engine.
2. **Network Protocol:** Socket.IO over WebSocket (RFC 6455) with binary framing, client-side masking, and 101 Switching Protocols.
3. **Data Security:** Role-based state serialization (`serializeState`) masks opponents' cards before transmission; clients never receive opponent hands.
4. **Shuffling:** Fisher-Yates shuffle algorithm ($O(N)$ time, $O(1)$ space, unbiased uniform distribution $\frac{1}{N!}$).
5. **Node.js Concurrency:** Single-threaded event loop serializes socket callbacks in the poll phase; mutations are atomic on a single instance without locks.
6. **Reconnection Flow:** `localStorage` session cache $\to$ new socket connects $\to$ `JOIN_GAME` with cached `playerId` $\to$ server rebinds socket and syncs state.
7. **Deadlock Management:** Consecutive skip counter triggers deadlock alert when skips equal active players; solved via state rollback.
8. **Frontend State:** React 19 + Zustand atomic selectors + Framer Motion for responsive, low-re-render card animations.
9. **Juspay Alignment:** Deterministic state machine reducer ($S \times A \to S'$), pure rule calculation, idempotency, resilient connection recovery.
10. **Horizontal Scaling:** Multi-node cluster with Nginx sticky sessions, Socket.IO Redis Adapter for pub/sub broadcasting, and Redis Lua scripts for distributed state.

---
*Created for your Juspay interview preparation. Review this, practice saying the answers out loud, and walk in with complete confidence.*
