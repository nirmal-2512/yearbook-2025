const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
    try {
        // await mongoose.connect("mongodb://localhost:27017/yearbook");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connection SUCCESS");
    } catch (error) {
        console.error(error);
        console.error("MongoDB connection FAIL");
        process.exit(1);
    }
};

module.exports = connectDB;