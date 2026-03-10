let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

export function connect(onMessage, onOpen) {
    // socket = new WebSocket("wss://satti-center.onrender.com/ws");
    socket = new WebSocket("ws://localhost:5000/ws")

    socket.onopen = () => {
        console.log("connected to WS server");
        reconnectAttempts = 0;
        if(onOpen) onOpen();
    };

    socket.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            onMessage(msg);
        } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
        }
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
        console.log("disconnected from WS server");
        // Don't attempt auto-reconnect here - let the store handle it
    };

    return socket;
}

export function send(msg) {
    if(!socket || socket.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not connected. Current state:", socket?.readyState);
        return false;
    }
    try {
        socket.send(JSON.stringify(msg));
        return true;
    } catch (error) {
        console.error("Failed to send WebSocket message:", error);
        return false;
    }
}

export function disconnect() {
    if(socket) {
        socket.close();
        socket = null;
        reconnectAttempts = 0;
    }
}

export function isConnected() {
    return socket && socket.readyState === WebSocket.OPEN;
}

export function getSocket() {
    return socket;
}