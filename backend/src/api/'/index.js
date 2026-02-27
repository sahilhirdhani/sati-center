import router from "./routes/game.routes.js";

export function registerApi(app) {
    app.use("/api", router);
}