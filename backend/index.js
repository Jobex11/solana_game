const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors()); // To allow cross-origin requests

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const Score = require("./models/Score");

// Update score after a game
app.post("/update-score", async (req, res) => {
  const { walletAddress, score } = req.body;
  try {
    // Find user by wallet address
    let userScore = await Score.findOne({ walletAddress });

    if (!userScore) {
      // If user does not exist, create a new entry
      userScore = new Score({
        walletAddress,
        accumulatedScore: score,
        highestScore: score,
      });
    } else {
      // If user exists, update accumulated score and highest score
      userScore.accumulatedScore += score;
      if (score > userScore.highestScore) {
        userScore.highestScore = score;
      }
    }

    const savedScore = await userScore.save();
    res.json(savedScore);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's accumulated and highest scoreadd
app.get("/get-score/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;
  try {
    const userScore = await Score.findOne({ walletAddress });
    if (!userScore) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(userScore);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get the top 3 highest accumulated scores for the leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    // Find the top 3 users with the highest accumulated score
    const topScorers = await Score.find()
      .sort({ accumulatedScore: -1 })
      .limit(3);
    res.json(topScorers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
