const express = require("express");
const {logincontroller,verifycontroller,addtestimonialcontroller,updateusercontroller,searchuserscontroller}= require("../controllers/usercontroller");
const {uploadMiddleware} = require("../middlewares/photouploadMiddleware");

const {authenticateToken} = require("../middlewares/authMiddleware");

const router = express.Router();



router.get("/",(req,res)=>{
    console.log(req)
    res.send("Hello the application is running good");
})

router.post("/login",logincontroller);
router.get("/getuser",authenticateToken,verifycontroller);
router.get("/search", authenticateToken, searchuserscontroller);
router.post("/addtestimonial",addtestimonialcontroller);
router.patch("/updateuser", uploadMiddleware, updateusercontroller);



// router.post("/upload",upload.single("image"),uploadtoCloud,uploadController);


module.exports = router;