import { AudioType, IAudioPlayer } from "./audio";
import { CanvasType, CHAR_HEIGHT, CHAR_WIDTH, IDrawer } from "./drawer";
import { Size } from "./config";
import { Coordinate } from "./movement";
import axios from "axios";
import { WalletContext } from "../../context/WalletContext";

const charToCanvasType = new Map<string, CanvasType>([
  ["0", CanvasType.TEXT_0],
  ["1", CanvasType.TEXT_1],
  ["2", CanvasType.TEXT_2],
  ["3", CanvasType.TEXT_3],
  ["4", CanvasType.TEXT_4],
  ["5", CanvasType.TEXT_5],
  ["6", CanvasType.TEXT_6],
  ["7", CanvasType.TEXT_7],
  ["8", CanvasType.TEXT_8],
  ["9", CanvasType.TEXT_9],
  ["H", CanvasType.TEXT_H],
  ["I", CanvasType.TEXT_I],
]);

export enum State {
  NOT_START,
  PLAYING,
  GAME_OVER,
}

export interface IInfoHandler {
  saveHighScore(): void;
  update(audioPlayer: IAudioPlayer, offX: number): void;

  checkIsState(state: State): boolean;
  updateState(key: State): void;
  drawCanvas(drawer: IDrawer): void;

  reset(): void;
  getFinalScore(): number;
}

export class InfoHandler implements IInfoHandler {
  private highScore: number;
  private score: number = 0;
  private blinkScore: number = 0;
  private blinkStartTime: number = 0;
  private state: State = State.NOT_START;

  constructor(
    private highScoreBlink: {
      scoreThreshold: number;
      blinkPeriod: number;
      blinkCount: number;
    },
    private gameSize: Size
  ) {
    this.highScore = +(localStorage.getItem("highScore") || 0);
  }

  reset(): void {
    this.score = 0;
    this.blinkScore = 0;
    this.blinkStartTime = 0;
  }

  saveHighScore() {
    localStorage.setItem("highScore", String(this.highScore));
  }

  checkIsState(state: State): boolean {
    return this.state === state;
  }

  updateState(state: State) {
    switch (this.state) {
      case State.NOT_START:
        if (state === State.PLAYING) {
          this.state = state;
        }
        break;
      case State.PLAYING:
        if (state === State.GAME_OVER) {
          this.state = state;
          console.log("Final Score:", this.getFinalScore());
          this.submitFinalScore(this.getFinalScore()); // Submit final score to the backend
        }
        break;
      case State.GAME_OVER:
        if (state === State.PLAYING) {
          this.state = state;
        }
        break;
    }
  }

  update(audioPlayer: IAudioPlayer, offX: number) {
    if (this.state !== State.PLAYING) {
      return;
    }

    const { scoreThreshold } = this.highScoreBlink;

    this.score = Math.round(offX / 50);
    if (this.score >= this.blinkScore + scoreThreshold) {
      this.blinkScore += scoreThreshold;
      this.blinkStartTime = new Date().getTime();

      audioPlayer.playSound(AudioType.HIGH_SCORE);
    }

    this.highScore = Math.max(this.score, this.highScore);
  }

  drawCanvas(drawer: IDrawer) {
    if (this.state === State.GAME_OVER) {
      drawer.drawCanvasCenter([CanvasType.RESTART, CanvasType.TEXT_GAME_OVER]);
    }

    const { width: gameWidth, height: gameHeight } = this.gameSize;
    const highScoreStr = String(this.highScore).padStart(5, "0");
    const text = `HI ${highScoreStr} ${this.getScoreText()}`;

    const pos: Coordinate = {
      x: gameWidth - text.length * CHAR_WIDTH - 20,
      y: gameHeight - CHAR_HEIGHT - 10,
    };
    this.drawText(drawer, text, pos);
  }

  getScoreText(): string {
    const { blinkPeriod, blinkCount } = this.highScoreBlink;
    const curCount = (new Date().getTime() - this.blinkStartTime) / blinkPeriod;

    if (curCount > blinkCount || this.state === State.GAME_OVER) {
      return String(this.score).padStart(5, "0");
    }

    if (curCount % 1 < 0.5) return String(this.blinkScore).padStart(5, "0");

    return "     ";
  }

  drawText(drawer: IDrawer, text: string, bottom_left_pos: Coordinate) {
    Array.from(text).forEach((char) => {
      const type = charToCanvasType.get(char);
      if (type !== undefined) {
        drawer.drawCanvas(type, bottom_left_pos);
      }
      bottom_left_pos.x += CHAR_WIDTH;
    });
  }

  getFinalScore(): number {
    if (this.state === State.GAME_OVER) {
      return this.score;
    }
    return 0;
  }

  private async submitFinalScore(finalScore: number) {
    try {
      // Check if the Solana wallet is connected
      if (window.solana && window.solana.isPhantom) {
        const walletAddress = window.solana.publicKey.toString(); // Get the connected wallet address
        await axios.post("https://trump-game.onrender.com/update-score", {
          walletAddress,
          score: finalScore,
        });
      } else {
        console.error("Wallet not connected");
      }
    } catch (error) {
      console.error("Error submitting final score:", error);
    }
  }
}

/*

import { AudioType, IAudioPlayer } from "./audio";
import { CanvasType, CHAR_HEIGHT, CHAR_WIDTH, IDrawer } from "./drawer";
import { Size } from "./config";
import { Coordinate } from "./movement";
import axios from "axios";
import { WalletContext } from "../../context/WalletContext";

const charToCanvasType = new Map<string, CanvasType>([
  ["0", CanvasType.TEXT_0],
  ["1", CanvasType.TEXT_1],
  ["2", CanvasType.TEXT_2],
  ["3", CanvasType.TEXT_3],
  ["4", CanvasType.TEXT_4],
  ["5", CanvasType.TEXT_5],
  ["6", CanvasType.TEXT_6],
  ["7", CanvasType.TEXT_7],
  ["8", CanvasType.TEXT_8],
  ["9", CanvasType.TEXT_9],
  ["H", CanvasType.TEXT_H],
  ["I", CanvasType.TEXT_I],
]);

export enum State {
  NOT_START,
  PLAYING,
  GAME_OVER,
}

export interface IInfoHandler {
  saveHighScore(): void;
  update(audioPlayer: IAudioPlayer, offX: number): void;

  checkIsState(state: State): boolean;
  updateState(key: State): void;
  drawCanvas(drawer: IDrawer): void;

  reset(): void;
  getFinalScore(): number;
}

export class InfoHandler implements IInfoHandler {
  private highScore: number;
  private score: number = 0;
  private blinkScore: number = 0;
  private blinkStartTime: number = 0;
  private state: State = State.NOT_START;

  constructor(
    private highScoreBlink: {
      scoreThreshold: number;
      blinkPeriod: number;
      blinkCount: number;
    },
    private gameSize: Size
  ) {
    this.highScore = +(localStorage.getItem("highScore") || 0);
  }

  reset(): void {
    this.score = 0;
    this.blinkScore = 0;
    this.blinkStartTime = 0;
  }

  saveHighScore() {
    localStorage.setItem("highScore", String(this.highScore));
  }

  checkIsState(state: State): boolean {
    return this.state === state;
  }

  updateState(state: State) {
    switch (this.state) {
      case State.NOT_START:
        if (state === State.PLAYING) {
          this.state = state;
        }
        break;
      case State.PLAYING:
        if (state === State.GAME_OVER) {
          this.state = state;
          console.log("Final Score:", this.getFinalScore());
          this.submitFinalScore(this.getFinalScore()); // Submit final score to the backend
        }
        break;
      case State.GAME_OVER:
        if (state === State.PLAYING) {
          this.state = state;
        }
        break;
    }
  }

  update(audioPlayer: IAudioPlayer, offX: number) {
    if (this.state !== State.PLAYING) {
      return;
    }

    const { scoreThreshold } = this.highScoreBlink;

    this.score = Math.round(offX / 50);
    if (this.score >= this.blinkScore + scoreThreshold) {
      this.blinkScore += scoreThreshold;
      this.blinkStartTime = new Date().getTime();

      audioPlayer.playSound(AudioType.HIGH_SCORE);
    }

    this.highScore = Math.max(this.score, this.highScore);
  }

  drawCanvas(drawer: IDrawer) {
    if (this.state === State.GAME_OVER) {
      drawer.drawCanvasCenter([CanvasType.RESTART, CanvasType.TEXT_GAME_OVER]);
    }

    const { width: gameWidth, height: gameHeight } = this.gameSize;
    const highScoreStr = String(this.highScore).padStart(5, "0");
    const text = `HI ${highScoreStr} ${this.getScoreText()}`;

    const pos: Coordinate = {
      x: gameWidth - text.length * CHAR_WIDTH - 20,
      y: gameHeight - CHAR_HEIGHT - 10,
    };
    this.drawText(drawer, text, pos);
  }

  getScoreText(): string {
    const { blinkPeriod, blinkCount } = this.highScoreBlink;
    const curCount = (new Date().getTime() - this.blinkStartTime) / blinkPeriod;

    if (curCount > blinkCount || this.state === State.GAME_OVER) {
      return String(this.score).padStart(5, "0");
    }

    if (curCount % 1 < 0.5) return String(this.blinkScore).padStart(5, "0");

    return "     ";
  }

  drawText(drawer: IDrawer, text: string, bottom_left_pos: Coordinate) {
    Array.from(text).forEach((char) => {
      const type = charToCanvasType.get(char);
      if (type !== undefined) {
        drawer.drawCanvas(type, bottom_left_pos);
      }
      bottom_left_pos.x += CHAR_WIDTH;
    });
  }

  getFinalScore(): number {
    if (this.state === State.GAME_OVER) {
      return this.score;
    }
    return 0;
  }

  private async submitFinalScore(finalScore: number) {
    try {
      const walletAddress = `9iEwXkJiycXrCBxF8eGdmbsiY7NH7RMNTRZjdB38Xwed`; // Replace this with the actual wallet address
      await axios.post("https://trump-game.onrender.com/update-score", {
        walletAddress,
        score: finalScore,
      });
    } catch (error) {
      console.error("Error submitting final score:", error);
    }
  }
}
*/

/*
===> new code 2 may work 






import axios from "axios";
import { AudioType, IAudioPlayer } from "./audio";
import { CanvasType, CHAR_HEIGHT, CHAR_WIDTH, IDrawer } from "./drawer";
import { Size } from "./config";
import { Coordinate } from "./movement";
const charToCanvasType = new Map<string, CanvasType>([
  ["0", CanvasType.TEXT_0],
  ["1", CanvasType.TEXT_1],
  ["2", CanvasType.TEXT_2],
  ["3", CanvasType.TEXT_3],
  ["4", CanvasType.TEXT_4],
  ["5", CanvasType.TEXT_5],
  ["6", CanvasType.TEXT_6],
  ["7", CanvasType.TEXT_7],
  ["8", CanvasType.TEXT_8],
  ["9", CanvasType.TEXT_9],
  ["H", CanvasType.TEXT_H],
  ["I", CanvasType.TEXT_I],
]);


export enum State {
  NOT_START,
  PLAYING,
  GAME_OVER,
}
export interface IInfoHandler {
  saveHighScore(): void;
  update(audioPlayer: IAudioPlayer, offX: number): void;

  checkIsState(state: State): boolean;
  updateState(key: State): void;
  drawCanvas(drawer: IDrawer): void;

  reset(): void;
  getFinalScore(): number;
}

export class InfoHandler implements IInfoHandler {
  private highScore: number;
  private score: number = 0;
  private blinkScore: number = 0;
  private blinkStartTime: number = 0;
  private state: State = State.NOT_START;

  constructor(
    private highScoreBlink: {
      scoreThreshold: number;
      blinkPeriod: number;
      blinkCount: number;
    },
    private gameSize: Size,
    private publicKey?: string 
  ) {
    this.highScore = +(localStorage.getItem("highScore") || 0);
  }

  reset(): void {
    this.score = 0;
    this.blinkScore = 0;
    this.blinkStartTime = 0;
  }

  saveHighScore() {
    localStorage.setItem("highScore", String(this.highScore));
  }

  checkIsState(state: State): boolean {
    return this.state === state;
  }

  updateState(state: State) {
    switch (this.state) {
      case State.NOT_START:
        if (state === State.PLAYING) {
          this.state = state;
        }
        break;
      case State.PLAYING:
        if (state === State.GAME_OVER) {
          this.state = state;
          const finalScore = this.getFinalScore();
          console.log("Final Score:", finalScore);
          this.sendFinalScore(finalScore); // Send final score to backend
        }
        break;
      case State.GAME_OVER:
        if (state === State.PLAYING) {
          this.state = state;
        }
        break;
    }
  }

  update(audioPlayer: IAudioPlayer, offX: number) {
    if (this.state !== State.PLAYING) {
      return;
    }

    const { scoreThreshold } = this.highScoreBlink;

    this.score = Math.round(offX / 50);
    if (this.score >= this.blinkScore + scoreThreshold) {
      this.blinkScore += scoreThreshold;
      this.blinkStartTime = new Date().getTime();

      audioPlayer.playSound(AudioType.HIGH_SCORE);
    }

    this.highScore = Math.max(this.score, this.highScore);
  }

  drawCanvas(drawer: IDrawer) {
    if (this.state === State.GAME_OVER) {
      drawer.drawCanvasCenter([CanvasType.RESTART, CanvasType.TEXT_GAME_OVER]);
    }

    const { width: gameWidth, height: gameHeight } = this.gameSize;
    const highScoreStr = String(this.highScore).padStart(5, "0");
    const text = `HI ${highScoreStr} ${this.getScoreText()}`;

    const pos: Coordinate = {
      x: gameWidth - text.length * CHAR_WIDTH - 20,
      y: gameHeight - CHAR_HEIGHT - 10,
    };
    this.drawText(drawer, text, pos);
  }

  getScoreText(): string {
    const { blinkPeriod, blinkCount } = this.highScoreBlink;
    const curCount = (new Date().getTime() - this.blinkStartTime) / blinkPeriod;

    if (curCount > blinkCount || this.state === State.GAME_OVER) {
      return String(this.score).padStart(5, "0");
    }

    if (curCount % 1 < 0.5) return String(this.blinkScore).padStart(5, "0");

    return "     ";
  }

  drawText(drawer: IDrawer, text: string, bottom_left_pos: Coordinate) {
    Array.from(text).forEach((char) => {
      const type = charToCanvasType.get(char);
      if (type !== undefined) {
        drawer.drawCanvas(type, bottom_left_pos);
      }
      bottom_left_pos.x += CHAR_WIDTH;
    });
  }

  getFinalScore(): number {
    if (this.state === State.GAME_OVER) {
      return this.score;
    }
    return 0;
  }

  async sendFinalScore(finalScore: number) {
    if (!this.publicKey) return; 
    try {
    
  await axios.post("https://trump-game.onrender.com/update-score", {
        walletAddress: this.publicKey, 
        score: finalScore,
      });
      console.log("Final score submitted successfully");
    } catch (error) {
      console.error("Error submitting final score", error);
    }
  }
}



*/

/*
====>>>  new code with finalscore  1



import { AudioType, IAudioPlayer } from "./audio";
import { CanvasType, CHAR_HEIGHT, CHAR_WIDTH, IDrawer } from "./drawer";
import { Size } from "./config";
import { Coordinate } from "./movement";

const charToCanvasType = new Map<string, CanvasType>([
  ["0", CanvasType.TEXT_0],
  ["1", CanvasType.TEXT_1],
  ["2", CanvasType.TEXT_2],
  ["3", CanvasType.TEXT_3],
  ["4", CanvasType.TEXT_4],
  ["5", CanvasType.TEXT_5],
  ["6", CanvasType.TEXT_6],
  ["7", CanvasType.TEXT_7],
  ["8", CanvasType.TEXT_8],
  ["9", CanvasType.TEXT_9],
  ["H", CanvasType.TEXT_H],
  ["I", CanvasType.TEXT_I],
]);

export enum State {
  NOT_START,
  PLAYING,
  GAME_OVER,
}

export interface IInfoHandler {
  saveHighScore(): void;
  update(audioPlayer: IAudioPlayer, offX: number): void;

  checkIsState(state: State): boolean;
  updateState(key: State): void;
  drawCanvas(drawer: IDrawer): void;

  reset(): void;
  getFinalScore(): number;
}

export class InfoHandler implements IInfoHandler {
  private highScore: number;
  private score: number = 0;
  private blinkScore: number = 0;
  private blinkStartTime: number = 0;
  private state: State = State.NOT_START;

  constructor(
    private highScoreBlink: {
      scoreThreshold: number;
      blinkPeriod: number;
      blinkCount: number;
    },
    private gameSize: Size
  ) {
    this.highScore = +(localStorage.getItem("highScore") || 0);
  }

  reset(): void {
    this.score = 0;
    this.blinkScore = 0;
    this.blinkStartTime = 0;
  }

  saveHighScore() {
    localStorage.setItem("highScore", String(this.highScore));
  }

  checkIsState(state: State): boolean {
    return this.state === state;
  }

  updateState(state: State) {
    switch (this.state) {
      case State.NOT_START:
        if (state === State.PLAYING) {
          this.state = state;
        }
        break;
      case State.PLAYING:
        if (state === State.GAME_OVER) {
          this.state = state;
          console.log("Final Score:", this.getFinalScore());
        }
        break;
      case State.GAME_OVER:
        if (state === State.PLAYING) {
          this.state = state;
        }
        break;
    }
  }

  update(audioPlayer: IAudioPlayer, offX: number) {
    if (this.state !== State.PLAYING) {
      return;
    }

    const { scoreThreshold } = this.highScoreBlink;

    this.score = Math.round(offX / 50);
    if (this.score >= this.blinkScore + scoreThreshold) {
      this.blinkScore += scoreThreshold;
      this.blinkStartTime = new Date().getTime();

      audioPlayer.playSound(AudioType.HIGH_SCORE);
    }

    this.highScore = Math.max(this.score, this.highScore);
  }

  drawCanvas(drawer: IDrawer) {
    if (this.state === State.GAME_OVER) {
      drawer.drawCanvasCenter([CanvasType.RESTART, CanvasType.TEXT_GAME_OVER]);
    }

    const { width: gameWidth, height: gameHeight } = this.gameSize;
    const highScoreStr = String(this.highScore).padStart(5, "0");
    const text = `HI ${highScoreStr} ${this.getScoreText()}`;

    const pos: Coordinate = {
      x: gameWidth - text.length * CHAR_WIDTH - 20,
      y: gameHeight - CHAR_HEIGHT - 10,
    };
    this.drawText(drawer, text, pos);
  }

  getScoreText(): string {
    const { blinkPeriod, blinkCount } = this.highScoreBlink;
    const curCount = (new Date().getTime() - this.blinkStartTime) / blinkPeriod;

    if (curCount > blinkCount || this.state === State.GAME_OVER) {
      return String(this.score).padStart(5, "0");
    }

    if (curCount % 1 < 0.5) return String(this.blinkScore).padStart(5, "0");

    return "     ";
  }

  drawText(drawer: IDrawer, text: string, bottom_left_pos: Coordinate) {
    Array.from(text).forEach((char) => {
      const type = charToCanvasType.get(char);
      if (type !== undefined) {
        drawer.drawCanvas(type, bottom_left_pos);
      }
      bottom_left_pos.x += CHAR_WIDTH;
    });
  }

  getFinalScore(): number {
    if (this.state === State.GAME_OVER) {
      return this.score;
    }
    return 0;
  }
}

*/
