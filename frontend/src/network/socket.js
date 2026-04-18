import { io } from "socket.io-client";

let socket = null;

const BACKEND_SOCKET_URL = "https://satti-center.onrender.com";
const LOCAL_SOCKET_URL = "http://localhost:5000";

const getSocketUrl = () => {
    if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL;
    }

    return import.meta.env.DEV
        ? LOCAL_SOCKET_URL
        : BACKEND_SOCKET_URL;
};

export function connect(onMessage, onOpen) {
    if (socket) {
        socket.disconnect();
    }

    socket = io(getSocketUrl(), {
        autoConnect: true,
        timeout: 3600000,
    });

    socket.on("connect", () => {
        console.log("connected to Socket.IO server", socket.id);
        if (onOpen) onOpen();
    });

    socket.on("message", (msg) => {
        onMessage(msg);
    });

    socket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
    });

    socket.on("disconnect", (reason) => {
        console.log("disconnected from Socket.IO server:", reason);
    });

    return socket;
}

export function send(msg) {
    if (!socket || !socket.connected) {
        console.error("Socket.IO client is not connected.");
        return false;
    }

    socket.emit("message", msg);
    return true;
}

export function disconnect() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export function isConnected() {
    return Boolean(socket && socket.connected);
}

export function getSocket() {
    return socket;
}