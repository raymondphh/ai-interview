import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { uploadJD as uploadJDMiddleware } from "../middleware/upload";
import {
  uploadJD,
  uploadJDFromUrl,
  analyzeJDController,
  listJDs,
  getJD,
} from "../controllers/jd.controller";

const router = Router();

router.use(requireAuth);
router.get("/", listJDs);
router.get("/:id", getJD);
router.post("/upload", uploadJDMiddleware.single("jd"), uploadJD);
router.post("/upload-url", uploadJDFromUrl);
router.post("/:id/analyze", analyzeJDController);

export default router;
