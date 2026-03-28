const mongoose = require("mongoose");

require('dotenv').config();

const Schema = mongoose.Schema({
   user_id:{
         type:String,
         required:true,
   },
   user_name:{
        type:String,
        required:true,
   },

   photo_url:{
    type:String,
    required:true,
   },

    caption:{
     type:String,
     required:true,
    },
    // Stores user_ids of everyone who liked this post.
    // Using an array instead of a plain count enforces one-like-per-user
    // server-side and lets the frontend know whether the current user liked it.
    likedBy:{
        type:[String],
        default:[],
    },
    comments:{
        type:Array,
        required:false,
    },
    date:{
        type:Date,
        required:true,
    }
    
})

const Post = mongoose.model('Post', Schema);

module.exports = {Post};