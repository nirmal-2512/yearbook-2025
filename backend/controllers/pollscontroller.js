const {Polls} = require("../models/pollsmodel");

const addvotecontroller = async (req, res) => {
    try {
        const { title, voter_rollno } = req.body;

        // Find the poll by title
        const poll = await Polls.findOne({ title: title });
        if (!poll) return res.status(404).json({ message: "Poll not found" });

        // Check if the voter has already voted
        const existingVote = poll.votes.find(vote => vote.candirollno === voter_rollno);
        
        if (existingVote) {
            // If the voter has already voted, increment their vote count
            existingVote.votecount += 1;
        } else {
            // If the voter has not voted yet, add a new vote entry
            poll.votes.push({
                candirollno: voter_rollno,
                votecount: 1
            });
        }

        // Save the updated poll
        await poll.save();

        // Return the updated poll data
        res.status(200).json({ message: "Vote added successfully", poll });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getwinnercontroller = async (req, res) => {
    try {
        const { title } = req.query;  // Get the poll title from query params

        // Check if title is provided
        if (!title) {
            return res.status(400).json({ message: "Poll title is required" });
        }

        // Find the poll by its title
        const poll = await Polls.findOne({ title: title });
        if (!poll) return res.status(404).json({ message: "Poll not found" });

        // Check if there are any votes
        if (poll.votes.length === 0) {
            return res.status(404).json({ message: "No votes found for this poll" });
        }

        // Find the candidate with the highest vote count
        const winner = poll.votes.reduce((prev, current) => {
            return (prev.votecount > current.votecount) ? prev : current;
        });

        // Return the winner's details
        res.status(200).json({ message: "Winner found", winner });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};




module.exports = { addvotecontroller, getwinnercontroller };

    
