const { Polls } = require("../models/pollsmodel");

// Canonical list of poll categories — single source of truth shared by frontend too
const POLL_TITLES = [
  "Nightangle of the batch",
  "Richie Rich",
  "Protein Master of the batch",
  "The Wifi Magnet",
  "Jugaadu of the batch",
  "High on life",
  "The Algorithm Alchemist",
  "Neta of the batch",
  "Sleep Scheduler",
  "Shinchan of the batch",
  "Social Butterfly",
  "Shinchan of the batch",
  "Bob Marley of the batch",
];

// GET /api/polls/getall — returns all polls enriched with current user's vote status
const getallpollscontroller = async (req, res) => {
  try {
    const voter_id = req.user.id;

    // Upsert all polls so they exist before querying
    await Promise.all(
      POLL_TITLES.map(title =>
        Polls.findOneAndUpdate(
          { title },
          { $setOnInsert: { title, votes: [], votedBy: [] } },
          { upsert: true, new: true }
        )
      )
    );

    const polls = await Polls.find({ title: { $in: POLL_TITLES } });

    const result = POLL_TITLES.map(title => {
      const poll = polls.find(p => p.title === title);
      const userVote = poll?.votedBy.find(v => v.voter_id === voter_id);
      return {
        title,
        hasVoted:    !!userVote,
        votedFor:    userVote?.candirollno || null,
        totalVotes:  poll?.votes.reduce((sum, v) => sum + v.votecount, 0) || 0,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/polls/addvote — cast one vote per user per poll category
const addvotecontroller = async (req, res) => {
  try {
    const { title, candirollno } = req.body;
    const voter_id = req.user.id;

    if (!title || !candirollno) {
      return res.status(400).json({ message: "title and candirollno are required" });
    }

    // Find or create the poll
    let poll = await Polls.findOne({ title });
    if (!poll) {
      poll = new Polls({ title, votes: [], votedBy: [] });
    }

    // Enforce one vote per user
    const alreadyVoted = poll.votedBy.find(v => v.voter_id === voter_id);
    if (alreadyVoted) {
      return res.status(409).json({
        message: "You have already voted in this poll",
        votedFor: alreadyVoted.candirollno,
      });
    }

    // Record the vote
    poll.votedBy.push({ voter_id, candirollno });

    const existing = poll.votes.find(v => v.candirollno === candirollno);
    if (existing) {
      existing.votecount += 1;
    } else {
      poll.votes.push({ candirollno, votecount: 1 });
    }

    await poll.save();

    res.status(200).json({ message: "Vote added successfully", votedFor: candirollno });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/polls/getwinner?title=...
const getwinnercontroller = async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) return res.status(400).json({ message: "Poll title is required" });

    const poll = await Polls.findOne({ title });
    if (!poll || poll.votes.length === 0) {
      return res.status(404).json({ message: "No votes found for this poll" });
    }

    const winner = poll.votes.reduce((prev, curr) =>
      prev.votecount > curr.votecount ? prev : curr
    );

    res.status(200).json({ message: "Winner found", winner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { addvotecontroller, getwinnercontroller, getallpollscontroller };
