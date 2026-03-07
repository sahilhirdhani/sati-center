import app from "./app.js";
import dotenv from "dotenv";
import http from "http";
import { setupWebSocket } from "./api/ws/wsServer.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

setupWebSocket(server);

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});