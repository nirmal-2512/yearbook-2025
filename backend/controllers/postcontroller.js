const { Post } = require("../models/postmodel");
const { User } = require("../models/usermodel"); // add this import

const newpostcontroller = async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const user_name = req.body.user_name;
    const photo_url = req.body.photo_url;
    const caption = req.body.caption;
    const date = new Date();

    if (!photo_url) return res.status(400).json({ message: "Image upload failed — no file received." });
    if (!user_id || !user_name) return res.status(400).json({ message: "user_id and user_name are required." });

    const newpost = new Post({
      user_id,
      user_name,
      photo_url,
      caption,
      likedBy: [],
      comments: [],
      date,
    });

    await newpost.save();
    return res.status(200).json({ message: "Post created successfully", photo_url });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const likescontroller = async (req, res) => {
  try {
    const { post_id } = req.body;
    const user_id = req.user?.id;

    if (!user_id) return res.status(401).json({ message: "Login required to like posts." });
    if (!post_id) return res.status(400).json({ message: "post_id is required." });

    const post = await Post.findById(post_id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const alreadyLiked = post.likedBy.includes(user_id);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((id) => id !== user_id);
    } else {
      post.likedBy.push(user_id);
    }

    await post.save();
    return res.status(200).json({
      message: alreadyLiked ? "Unliked" : "Liked",
      liked: !alreadyLiked,
      likeCount: post.likedBy.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const commentscontroller = async (req, res) => {
  try {
    const { post_id, comment, user_name } = req.body;
    const comment_object = {
      user_name,
      comment,
      date: Date.now(),
    };

    const post = await Post.findById(post_id);
    post.comments.push(comment_object);
    await post.save();
    return res.status(200).json({ message: "Commented" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const getpostcontroller = async (req, res) => {
  try {
    const type = req.query.type;
    const rollno = req.query.rollno;

    console.log("type:", type, "rollno:", rollno);

    // If rollno is provided, find that user's _id first, then get their posts
    if (rollno) {
      const user = await User.findOne({ rollno });
      if (!user) return res.status(404).json({ message: "User not found" });

      const posts = await Post.find({ user_id: user._id.toString() }).sort({ date: -1 });
      return res.status(200).json(posts);
    }

    if (type === "all") {
      const posts = await Post.find();
      return res.status(200).json(posts);
    } else if (type === "likes") {
      const posts = await Post.find();
      posts.sort((a, b) => b.likedBy.length - a.likedBy.length);
      return res.status(200).json(posts);
    } else if (type === "date") {
      const posts = await Post.find().sort({ date: -1 });
      return res.status(200).json(posts);
    } else if (type === "user") {
      const user_id = req.user.id;
      const posts = await Post.find({ user_id });
      return res.status(200).json(posts);
    }

    const posts = await Post.find();
    return res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { newpostcontroller, likescontroller, commentscontroller, getpostcontroller };