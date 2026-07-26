import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getHistory, getHistoryByCV } from "../controllers/history.controller";

const router = Router();

router.use(requireAuth);
router.get("/", getHistory);
router.get("/:cvId", getHistoryByCV);

export default router;
