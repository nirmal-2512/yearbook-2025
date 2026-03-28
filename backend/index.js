const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db/connection");
const fs = require("fs");

const userRoutes = require("./routes/userroute");
const postRoutes = require("./routes/postroute");
const itchlistRoutes = require("./routes/itchlistroute");
const articleRoutes = require("./routes/articleroute"); 
const pollsRoutes = require("./routes/pollsroute"); // Import polls routes
const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Allow JSON body in requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use('/images', express.static(path.join(__dirname, 'public/images')))

app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/itchlist", itchlistRoutes);
app.use("/api/articles", articleRoutes); // Using article routes
app.use("/api/polls", pollsRoutes); // Using polls routes

// Sample API route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/image", (req, res) => {
  const imagePathParam = req.query.imageName?.trim();
  if (!imagePathParam) {
    return res.status(400).send("Image name is required");
  }

  // Sanitize the input path
  const safePath = path.normalize(imagePathParam).replace(/^(\.\.(\/|\\|$))+/, '');

  const fullImagePath = path.join(__dirname, "middlewares", safePath);

  fs.access(fullImagePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("Image not found");
    }
    res.sendFile(fullImagePath);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
