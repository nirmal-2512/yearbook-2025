const express = require("express");
const {uploadMiddleware} = require("../middlewares/photouploadMiddleware");
const {newpostcontroller,likescontroller,commentscontroller,getpostcontroller} = require("../controllers/postcontroller");
const { authenticateToken } = require("../middlewares/authMiddleware");


const router = express.Router();


// const {uploadController} = require("../controllers/uploadController")
// const {uploadtoCloud} = require("../middlewares/uploadtoCloud")




router.get("/",(req,res)=>{
    console.log(req)
    res.send("Hello the application is running good");
})

router.post("/upload",uploadMiddleware,newpostcontroller);
router.post("/like", authenticateToken, likescontroller);
router.post("/comment",commentscontroller);
router.get("/getpost",authenticateToken,getpostcontroller);

// router.post("/upload",upload.single("image"),uploadtoCloud,uploadController);


module.exports = router;