import multer from "multer";
import path from "path";
import fs from "fs";

function makeStorage(subfolder: string) {
  const dir = path.join(__dirname, "..", "..", "uploads", subfolder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

const documentFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ok = [".pdf", ".doc", ".docx"].includes(
    path.extname(file.originalname).toLowerCase(),
  );
  if (!ok) {
    cb(new Error("Only PDF/DOC/DOCX files are allowed"));
    return;
  }
  cb(null, true);
};

export const uploadCV = multer({
  storage: makeStorage("cv"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter,
});

export const uploadJD = multer({
  storage: makeStorage("jd"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter,
});

export const uploadAudio = multer({
  storage: makeStorage("audio"),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});
