import { create } from "zustand";
import { connect, send, disconnect } from "../network/socket.js";

const saveSession = (gameId, playerId, role, name, screen) => {
    localStorage.setItem("satti_session", JSON.stringify({
        gameId,
        playerId,
        role,
        name,
        screen
    }))
}

const loadSession = () => {
    const raw = localStorage.getItem("satti_session")
    return raw ? JSON.parse(raw) : null
}

const clearSession = () => {
    localStorage.removeItem("satti_session")
}

export const useGameStore = create((set,get) => ({
    
    gameId : null,
    playerId : null,
    role : null,
    name: null,
    players: [],
    state: null,
    chatMessages: [],
    screen: "landing",

    setScreen: (screen) => set({ screen }),

    connectSocket: () => {
        connect(
            (msg) => get().handleMessage(msg),
            () => get().attemptReconnect()
        )
    },
    
    attemptReconnect: () => {
        const session = loadSession();
        if(!session) return
        console.log("Auto connecting")
        set({
            gameId: session.gameId,
            playerId: session.playerId,
            role: session.role,
            name: session.name,
            screen: "reconnecting"
        })
        send({
            type: "JOIN_GAME",
            gameId: session.gameId,
            playerId: session.playerId,
            role: session.role,
            name: session.name
        })
    },

    handleMessage: (msg) => {
        // console.log("Socket.IO Message:", msg);

        switch(msg.type) {
            case "GAME_CREATED":
                saveSession(
                    msg.gameId,
                    msg.playerId,
                    msg.role,
                    get().name,
                    "lobby",
                )
                set({ 
                    gameId: msg.gameId,
                    playerId: msg.playerId,
                    role: msg.role,
                    screen: "lobby"
                })
                break;

            case "JOINED":
                const currentName = get().name;
                saveSession(
                    get().gameId, 
                    msg.playerId, 
                    msg.role,
                    currentName,
                    "lobby",
                )

                set({
                    playerId: msg.playerId,
                    role: msg.role,
                    name: currentName,
                    screen: "lobby"
                })
                break;
                
            case "RECONNECTED":
                console.log("Reconnected successfully")
                set({
                    gameId: msg.gameId,
                    playerId: msg.playerId,
                    role: msg.role,
                    screen: "lobby",
                    players: msg.players || []
                })
                break;
            
            case "LOBBY_UPDATE":
                set({
                    players: msg.players,
                    role: msg.role 
                })
                break;

            case "STATE_UPDATE":
                set({
                    state: msg.state,
                    screen: "game"
                })
                break;

            case "CHAT_SYNC":
            case "CHAT_UPDATE":
                set({
                    chatMessages: msg.messages || []
                })
                break;

            // case "IN_LOBBY":
            //     set({
            //         gameId: msg.gameId,
            //         screen: "lobby"
            //     })
            //     break;

            case "ERROR":
                console.log("Server error:", msg.error);

                if(get().screen === "reconnecting") {
                    clearSession();

                    set({
                        gameId: null,
                        playerId: null,
                        role: null,
                        name: null,
                        screen: "landing"
                    })
                }

                alert(msg.error)
                break;
            
            default:
                console.warn("Unknown message type:", msg.type)
        }
    },

    createGame: (name) => {

        set({ name })

        send({
            type: "CREATE_GAME",
            name
        })
    },

    joinGame: (gameId, name) => {
        set({ gameId, name });
        send({
            type: "JOIN_GAME",
            gameId,
            name
        })
    },

    goToGamePrep: () => {
        set({ screen: "gameprep" });
    },

    startGame: (options = {}) => {
        send({
            type: "START_GAME",
            layoutMode: options.layoutMode || "single",
            cheatMode: options.cheatMode || false,
            skipMode: options.skipMode || "infinite",
            limitedSkipCount: options.limitedSkipCount || 1
        })
    },

    sendAction: (action) => {
        send({
            type: "ACTION",
            action
        })
    },

    sendChatMessage: (text) => {
        const messageText = String(text || "").trim();
        if (!messageText) return false;

        return send({
            type: "CHAT_MESSAGE",
            text: messageText
        });
    },

    leaveGame: () => {
        send({ type: "LEAVE_GAME" })

        clearSession();
        disconnect();
        set({
            gameId: null,
            playerId: null,
            role: null,
            name: null,
            players: [],
            state: null,
            chatMessages: [],
            screen: "landing"
        })
    },

    onBackToLobby: () => {
        const session = loadSession();
        if (!session?.gameId) return;
        set ({
            screen: "lobby",
            state: null
        })
        send({ 
            type: "BACK_TO_LOBBY",
            gameId: session.gameId
        })
    }

}))