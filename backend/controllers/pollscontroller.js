const { Polls } = require("../models/pollsmodel");

// GET /api/polls/getall — returns ALL polls from DB enriched with current user's vote status
const getallpollscontroller = async (req, res) => {
  try {
    const voter_id = req.user.id;

    // Fetch every poll in the collection (covers both the original 8 and any
    // custom ones users created — all are stored in the same collection)
    const polls = await Polls.find({}).sort({ _id: 1 });

    const result = polls.map(poll => {
      const userVote = poll.votedBy.find(v => v.voter_id === voter_id);
      return {
        _id:        poll._id,
        title:      poll.title,
        hasVoted:   !!userVote,
        votedFor:   userVote?.candirollno || null,
        totalVotes: poll.votes.reduce((sum, v) => sum + v.votecount, 0),
        // Top 3 nominees so the UI can show a mini leaderboard
        topNominees: poll.votes
          .slice()
          .sort((a, b) => b.votecount - a.votecount)
          .slice(0, 3)
          .map(v => ({ rollno: v.candirollno, count: v.votecount })),
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

    // Enforce one vote per user per poll
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