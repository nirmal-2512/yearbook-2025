const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Use memory storage first to access text fields before saving files
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error("Only images (jpeg, jpg, png) are allowed!"));
    }
  },
});

// Middleware to extract text fields **before** Multer processes files
const extractFormData = (req, res, next) => {
  console.log(req.body);
  req.uploadType = req.body.type || "default";
  req.rollno = req.body.rollno || "unknown";
  next();
};

// Middleware to handle file storage AFTER form data extraction
const moveFileToStorage = (req, res, next) => {
  if (!req.file) return next();

  // Define dynamic upload folder
  const uploadDir = path.join(__dirname, `../uploads/${req.uploadType || "default"}`);

  // Ensure the directory exists
  fs.mkdirSync(uploadDir, { recursive: true });

  // Define filename
  const filename = `${req.rollno|| "unknown"}-${Date.now()}${path.extname(req.file.originalname)}`;

  // Set photo URL in `req.body`
  req.photoUrl = `../uploads/${req.uploadType || "default"}/${filename}`;
  req.body.photo_url = req.photoUrl;

  // Move file from memory storage to final destination
  const filePath = path.join(uploadDir, filename);
  fs.writeFile(filePath, req.file.buffer, (err) => {
    if (err) {
      return res.status(500).json({ error: "File saving failed" });
    }
    next();
  });
};

// Upload Middleware: Extract fields → Upload to memory → Move file to disk
const uploadMiddleware = [upload.single("image"),extractFormData, moveFileToStorage];

module.exports = { uploadMiddleware };
