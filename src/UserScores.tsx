import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { WalletContext } from "./context/WalletContext";

interface Scores {
  accumulatedScore: number;
  highestScore: number;
}

interface LeaderboardEntry {
  walletAddress: string;
  accumulatedScore: number;
}

const UserScores: React.FC = () => {
  const walletContext = useContext(WalletContext);
  const publicKey = walletContext?.publicKey;

  const [scores, setScores] = useState<Scores>({
    accumulatedScore: 0,
    highestScore: 0,
  });
  const [currentGameScore, setCurrentGameScore] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    async function fetchScores() {
      if (!publicKey) return;
      try {
        const response = await axios.get<Scores>(
          `https://trump-game.onrender.com/get-score/${publicKey.toBase58()}`
        );
        setScores(response.data);
      } catch (error) {
        console.error("Error fetching scores", error);
      }
    }

    fetchScores();
  }, [publicKey]);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await axios.get<LeaderboardEntry[]>(
          "https://trump-game.onrender.com/leaderboard"
        );
        setLeaderboard(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      }
    }

    fetchLeaderboard();
  }, []);

  const submitScore = async () => {
    if (!publicKey) return;
    try {
      const response = await axios.post<Scores>(
        "https://trump-game.onrender.com/update-score",
        {
          walletAddress: publicKey.toBase58(),
          score: currentGameScore,
        }
      );
      setScores(response.data);
      setCurrentGameScore(0);
    } catch (error) {
      console.error("Error updating score", error);
    }
  };

  return (
    <div className="bg-white">
      <h2>User Scores</h2>
      {publicKey ? (
        <>
          <p>Accumulated Score: {scores.accumulatedScore}</p>
          <p>Highest Score: {scores.highestScore}</p>

          <input
            type="number"
            value={currentGameScore}
            onChange={(e) => setCurrentGameScore(Number(e.target.value))}
            placeholder="Enter game score"
          />
          <button onClick={submitScore}>Submit Game Score</button>

          <h2>Leaderboard</h2>
          <ul>
            {leaderboard.map((user, index) => (
              <li key={user.walletAddress}>
                #{index + 1} {user.walletAddress} - {user.accumulatedScore}{" "}
                points
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Please connect your wallet to view scores</p>
      )}
    </div>
  );
};

export default UserScores;

/*
==> WORKING WITH CONNECTED WALLET



import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { WalletContext } from "./context/WalletContext";

interface Scores {
  accumulatedScore: number;
  highestScore: number;
}

interface LeaderboardEntry {
  walletAddress: string;
  accumulatedScore: number;
}

const UserScores: React.FC = () => {
  const walletContext = useContext(WalletContext); 
  const publicKey = walletContext?.publicKey; 

  const [scores, setScores] = useState<Scores>({
    accumulatedScore: 0,
    highestScore: 0,
  });
  const [currentGameScore, setCurrentGameScore] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    async function fetchScores() {
      if (!publicKey) return; 
      try {
        const response = await axios.get<Scores>(
          `http://localhost:3001/get-score/${publicKey.toBase58()}`
        );
        setScores(response.data);
      } catch (error) {
        console.error("Error fetching scores", error);
      }
    }

    fetchScores();
  }, [publicKey]);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await axios.get<LeaderboardEntry[]>(
          "http://localhost:3001/leaderboard"
        );
        setLeaderboard(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      }
    }

    fetchLeaderboard();
  }, []);

  const submitScore = async () => {
    if (!publicKey) return; 
    try {
      const response = await axios.post<Scores>(
        "http://localhost:3001/update-score",
        {
          walletAddress: publicKey.toBase58(),
          score: currentGameScore,
        }
      );
      setScores(response.data);
      setCurrentGameScore(0); 
    } catch (error) {
      console.error("Error updating score", error);
    }
  };

  return (
    <div className="bg-white">
      <h2>User Scores</h2>
      {publicKey ? (
        <>
          <p>Accumulated Score: {scores.accumulatedScore}</p>
          <p>Highest Score: {scores.highestScore}</p>

          <input
            type="number"
            value={currentGameScore}
            onChange={(e) => setCurrentGameScore(Number(e.target.value))}
            placeholder="Enter game score"
          />
          <button onClick={submitScore}>Submit Game Score</button>

          <h2>Leaderboard</h2>
          <ul>
            {leaderboard.map((user, index) => (
              <li key={user.walletAddress}>
                #{index + 1} {user.walletAddress} - {user.accumulatedScore}{" "}
                points
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Please connect your wallet to view scores</p>
      )}
    </div>
  );
};

export default UserScores;
*/

/*

import React, { useState, useEffect } from "react";
import axios from "axios";

interface Scores {
  accumulatedScore: number;
  highestScore: number;
}

interface LeaderboardEntry {
  walletAddress: string;
  accumulatedScore: number;
}

interface UserScoresProps {
  walletAddress: string;
}

const UserScores: React.FC<UserScoresProps> = ({ walletAddress }) => {
  const [scores, setScores] = useState<Scores>({
    accumulatedScore: 0,
    highestScore: 0,
  });
  const [currentGameScore, setCurrentGameScore] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Fetch user scores
  useEffect(() => {
    async function fetchScores() {
      try {
        const response = await axios.get<Scores>(
          `http://localhost:3001/get-score/${walletAddress}`
        );
        setScores(response.data);
      } catch (error) {
        console.error("Error fetching scores", error);
      }
    }

    fetchScores();
  }, [walletAddress]);

  // Fetch leaderboard scores
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await axios.get<LeaderboardEntry[]>(
          "http://localhost:3001/leaderboard"
        );
        setLeaderboard(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      }
    }

    fetchLeaderboard();
  }, []);

  // Submit new game score
  const submitScore = async () => {
    try {
      const response = await axios.post<Scores>(
        "http://localhost:3001/update-score",
        {
          walletAddress,
          score: currentGameScore,
        }
      );
      setScores(response.data);
      setCurrentGameScore(0); // reset game score after submission
    } catch (error) {
      console.error("Error updating score", error);
    }
  };

  return (
    <div className="bg-white">
      <h2>User Scores</h2>
      <p>Accumulated Score: {scores.accumulatedScore}</p>
      <p>Highest Score: {scores.highestScore}</p>

      <input
        type="number"
        value={currentGameScore}
        onChange={(e) => setCurrentGameScore(Number(e.target.value))}
        placeholder="Enter game score"
      />
      <button onClick={submitScore}>Submit Game Score</button>

      <h2>Leaderboard</h2>
      <ul>
        {leaderboard.map((user, index) => (
          <li key={user.walletAddress}>
            #{index + 1} {user.walletAddress} - {user.accumulatedScore} points
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserScores;

*/
