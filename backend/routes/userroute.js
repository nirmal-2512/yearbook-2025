const express = require("express");
const {
  logincontroller,
  verifycontroller,
  addtestimonialcontroller,
  updateusercontroller,
  searchuserscontroller,
  getuserbyrollnocontroller,  // NEW
  getalluserscontroller,       // NEW
} = require("../controllers/usercontroller");
const { uploadMiddleware } = require("../middlewares/photouploadMiddleware");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello the application is running good");
});

router.post("/login", logincontroller);
router.get("/getuser", authenticateToken, verifycontroller);
router.get("/getuser/:rollno", authenticateToken, getuserbyrollnocontroller); // NEW - friend profile
router.get("/search", authenticateToken, searchuserscontroller);
router.get("/allusers", authenticateToken, getalluserscontroller);           // NEW - admin
router.post("/addtestimonial", addtestimonialcontroller);
router.patch("/updateuser", uploadMiddleware, updateusercontroller);

module.exports = router;