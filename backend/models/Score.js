const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true, // Unique wallet address for each user
  },
  accumulatedScore: {
    type: Number,
    default: 0,
  },
  highestScore: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Score", ScoreSchema);
