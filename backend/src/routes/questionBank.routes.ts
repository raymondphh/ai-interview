import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getMeta, getQuestions } from "../controllers/questionBank.controller";

const router = Router();

router.use(requireAuth);
router.get("/meta", getMeta);
router.get("/", getQuestions);

export default router;
