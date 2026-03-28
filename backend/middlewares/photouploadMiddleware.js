const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

// ---------------------------------------------------------------------------
// 1. Multer — memory storage so we get req.body fields alongside req.file
// ---------------------------------------------------------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const validExt  = allowed.test(path.extname(file.originalname).toLowerCase());
    const validMime = allowed.test(file.mimetype);
    if (validExt && validMime) return cb(null, true);
    cb(new Error("Only JPEG/JPG/PNG images are allowed."));
  },
});

// ---------------------------------------------------------------------------
// 2. Decode JWT (optional — won't reject if token is missing/invalid here;
//    that's the auth route's job). This gives us req.user.rollno reliably.
// ---------------------------------------------------------------------------
const decodeToken = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    }
  } catch {
    // Silently ignore — controller can reject if auth is truly required
  }
  next();
};

// ---------------------------------------------------------------------------
// 3. Write file to disk with the correct rollno-based filename.
//
//    Priority for rollno:
//      a) req.user.rollno  — decoded from JWT (most reliable, tamper-proof)
//      b) req.body.rollno  — sent as a form field (fallback for public routes)
//      c) "unknown"        — last resort so the upload never crashes
//
//    photo_url is stored as a root-relative URL path (/uploads/type/file.jpg)
//    so Express can serve it directly and the frontend can prefix the host.
// ---------------------------------------------------------------------------
const saveFileToDisk = (req, res, next) => {
  if (!req.file) return next(); // No file attached — nothing to do

  const uploadType = req.body.type || "default";
  const rollno     = req.user?.rollno || req.body.rollno || "unknown";
  const ext        = path.extname(req.file.originalname).toLowerCase();
  const filename   = `${rollno}-${Date.now()}${ext}`;

  // Absolute path on disk
  const uploadDir = path.join(__dirname, "../uploads", uploadType);
  fs.mkdirSync(uploadDir, { recursive: true });

  // Root-relative URL that Express' static middleware can serve
  req.body.photo_url = `/uploads/${uploadType}/${filename}`;

  fs.writeFile(path.join(uploadDir, filename), req.file.buffer, (err) => {
    if (err) {
      console.error("File write error:", err);
      return res.status(500).json({ message: "File saving failed." });
    }
    next();
  });
};

// ---------------------------------------------------------------------------
// Exported middleware array — order matters:
//   multer  →  decodeToken  →  saveFileToDisk
//
// multer (memoryStorage) populates req.body + req.file before the next
// middleware runs, so decodeToken and saveFileToDisk always see full data.
// ---------------------------------------------------------------------------
const uploadMiddleware = [upload.single("image"), decodeToken, saveFileToDisk];

module.exports = { uploadMiddleware };