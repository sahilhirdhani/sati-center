import express from "express";
import { actionHandler, createGameHandler, getStateHandler } from "../controllers/game.controller.js";

const router = express.Router();

router.post("/game", createGameHandler)
router.get("/game/:gameId/state", getStateHandler)
router.post("/game/:gameId/action", actionHandler)

export default router