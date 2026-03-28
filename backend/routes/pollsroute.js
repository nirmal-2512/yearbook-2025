const express = require("express");
const { addvotecontroller, getwinnercontroller, getallpollscontroller } = require("../controllers/pollscontroller");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/getall",    authenticateToken, getallpollscontroller);
router.post("/addvote",  authenticateToken, addvotecontroller);
router.get("/getwinner", getwinnercontroller);

module.exports = router;
