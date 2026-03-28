const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  // Tracks who voted for whom — enforces one vote per user per poll
  votedBy: [
    {
      voter_id:    { type: String, required: true },  // MongoDB user _id
      candirollno: { type: String, required: true },  // roll no of nominee
    }
  ],
  // Aggregate vote counts per nominee
  votes: [
    {
      candirollno: { type: String, required: true },
      votecount:   { type: Number, required: true, default: 0 },
    }
  ],
});

const Polls = mongoose.model("Polls", pollSchema);

module.exports = { Polls };
