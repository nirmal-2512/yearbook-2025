const {User} = require('../models/usermodel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const logincontroller = async (req, res) => {
    try {
        const { rollno, dob } = req.body;

        console.log("ROLLNO:", rollno);
        console.log("DOB INPUT:", dob);

        const user = await User.findOne({ rollno });

        if (!user) {
            console.log("❌ USER NOT FOUND");
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log("USER FOUND:", user);
        console.log("DB DOB:", user.dob);

        const userDob = new Date(user.dob);
        const inputDob = new Date(dob);

        // Normalize both dates (ignore time completely)
        const isSameDate =
            userDob.getFullYear() === inputDob.getFullYear() &&
            userDob.getMonth() === inputDob.getMonth() &&
            userDob.getDate() === inputDob.getDate();

        console.log("MATCH:", isSameDate);

        if (!isSameDate) {
            console.log("❌ DOB MISMATCH");
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, rollno: user.rollno },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({ token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const verifycontroller = async (req, res) => {
    try {
        const user = await User.findOne({ rollno: req.user.rollno });
        console.log(user);
    
    res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }

}

const addtestimonialcontroller = async (req,res) => {
    try{
        
        const {to_user_name, from_user,to_user_rollno, content} = req.body;
        const user = await User.findOne({rollno:to_user_rollno});

        const testimonial = {
            to_user_name: to_user_name,
            from_user:from_user,
            to_user_rollno:to_user_rollno,
            content:content,

        }

        user.testimonials.push(testimonial);

        await user.save();

        res.status(200).json({ message: "Testimonial added successfully"});
        

    }
    catch(error){
        res.status(500).json({ message: "Server error", error: error.message });

    }
    
}

const updateusercontroller = async (req,res)=>{
    try {
        const user_id = req.body.user_id;
        const caption = req.body.caption;

        // photo_url is set by saveFileToDisk middleware as a root-relative path
        // e.g. /uploads/pro_pic/21CS1001-1712345678.jpg
        // If no new image was uploaded req.body.photo_url will be undefined — that's fine,
        // we only update caption in that case.
        const pro_pic = req.body.photo_url || null;

        if (!user_id) return res.status(400).json({ message: "user_id is required" });

        const user = await User.findById(user_id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (pro_pic) user.pro_pic = pro_pic;
        if (caption !== undefined) user.caption = caption;

        await user.save();

        return res.status(200).json({ message: "User updated successfully", pro_pic: user.pro_pic });

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Server error"});
    }
}

const searchuserscontroller = async (req, res) => {
    try {
        const q = (req.query.q || "").trim();
        if (q.length < 2) return res.status(400).json({ message: "Query must be at least 2 characters" });

        const users = await User.find({
            $or: [
                { name:   { $regex: q, $options: "i" } },
                { rollno: { $regex: q, $options: "i" } },
            ]
        }).select("name rollno department pro_pic").limit(10);

        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET a specific user's profile by rollno (for friend profile view)
const getuserbyrollnocontroller = async (req, res) => {
  try {
    const { rollno } = req.params;
    const user = await User.findOne({ rollno }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET all users (admin only)
const getalluserscontroller = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Add to module.exports:
module.exports = {
  logincontroller,
  verifycontroller,
  addtestimonialcontroller,
  updateusercontroller,
  searchuserscontroller,
  getuserbyrollnocontroller,  // NEW
  getalluserscontroller,       // NEW
};