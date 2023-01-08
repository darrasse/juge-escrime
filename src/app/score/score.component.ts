import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ConfigurationComponent, Match } from '../configuration/configuration.component';

interface Score {
  score: number;
  displayScore: string;
}

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.css']
})
export class ScoreComponent {
  constructor(private _bottomSheet: MatBottomSheet) { }

  math = Math;

  matchConfig: Match = {
    time: 180,
    touches: 5,
    periods: 1,
  }

  period: number = 1;
  scoreLeft: Score = {
    score: 0,
    displayScore: "0",
  };
  scoreRight: Score = {
    score: 0,
    displayScore: "0",
  };
  phase: string = "START";
  time: number = this.matchConfig.time;
  priority: string = "";

  timerColor: string = "primary";

  reset() {
    clearInterval(this.interval);
    this.scoreLeft = {
      score: 0,
      displayScore: "0",
    };
    this.scoreRight = {
      score: 0,
      displayScore: "0",
    };
    this.phase = "START";
    this.time = this.matchConfig.time;
    this.timerColor = "primary";
    document.getElementById("timer")!.style.opacity = "1.0";
    this.resetPriority();
  }

  resetPriority() {
    this.priority = "";
    document.getElementById("scoreLeft")!.style.backgroundColor = "";
    document.getElementById("scoreRight")!.style.backgroundColor = "";
  }

  increaseScore(score: Score) {
    if (this.phase == "END") {
      return;
    }
    if (this.phase == "EXTRAMINUTE") {
      this.time = 0;
      this.resetPriority();
      this.timerColor = "disabled";
      this.phase = "TIMEUP";
    }
    score.score++;
    if (score.score == this.matchConfig.touches || this.priority) {
      navigator.vibrate(500);
      this.timerColor = "disabled";
      this.pauseTimer();
      this.phase = "END";
    }
    this.displayScores();
  }

  decreaseScore(score: Score) {
    if (this.phase == "END") {
      if (score.displayScore == score.score.toString()) {
        return;
      }
      score.score--;
      if (this.priority) {
        this.timerColor = "warn";
      } else {
        this.timerColor = "primary";
      }
      if (this.time > 0) {
        this.phase = "PAUSED";
      } else {
        this.maybeExtraMinute();
      }
    } else {
      score.score--;
    }
    this.displayScores();
  }

  flipTimer() {
    switch (this.phase) {
      case 'START':
      case 'PAUSED':
      case 'EXTRAMINUTE':
        this.startTimer();
        this.phase = "RUNNING";
        break;
      case 'RUNNING':
        this.pauseTimer();
        this.phase = "PAUSED";
        break;
    }
  }

  interval: ReturnType<typeof setTimeout> = setInterval(() => {}, 1000);

  startTimer() {
    clearInterval(this.interval);
    document.getElementById("timer")!.style.opacity = "0.88";
    this.interval = setInterval(() => {
      if (this.time > 0) {
        this.time--;
      } else {
        this.timeUp();
      }
    }, 1000);
  }

  pauseTimer() {
    clearInterval(this.interval);
    document.getElementById("timer")!.style.opacity = "1.0";
  }

  maybeExtraMinute() {
    if (this.scoreLeft.score == this.scoreRight.score && !this.priority) {
      this.definePriority();
      this.timerColor = "warn";
      this.time = 60;
      this.phase = "EXTRAMINUTE";
    } else {
      this.timerColor = "disabled";
      this.phase = "TIMEUP";
    }
  }

  timeUp() {
    // phase should be RUNNING or BREAK
    navigator.vibrate(1000);
    if (this.phase == "BREAK") {
      this.pauseTimer();
      this.period++;
      this.timerColor = "primary";
      this.time = this.matchConfig.time;
      this.phase = "PAUSED";
    } else if (this.period < this.matchConfig.periods) {
      this.timerColor = "basic";
      this.time = 60;
      this.phase = "BREAK";
    } else {
      this.maybeExtraMinute();
      this.pauseTimer();
      this.displayScores();
    }
  }

  displayScores() {
    this.scoreLeft.displayScore = this.scoreLeft.score.toString();
    this.scoreRight.displayScore = this.scoreRight.score.toString();
    if (this.scoreLeft.score == this.matchConfig.touches) {
      this.scoreLeft.displayScore = "V";
    }
    if (this.scoreRight.score == this.matchConfig.touches) {
      this.scoreRight.displayScore = "V";
    }
    if (this.phase == "TIMEUP" || this.phase == "END") {
      if (this.scoreLeft.score > this.scoreRight.score || (this.scoreLeft.score == this.scoreRight.score && this.priority == "left")) {
        this.scoreLeft.displayScore = "V" + this.scoreLeft.score.toString();
      } else if (this.scoreRight.score > this.scoreLeft.score || (this.scoreRight.score == this.scoreLeft.score && this.priority == "right")) {
        this.scoreRight.displayScore = "V" + this.scoreRight.score.toString();
      }
    }
  }

  openConfiguration() {
    const bottomSheetRef = this._bottomSheet.open(ConfigurationComponent);
    bottomSheetRef.afterDismissed().subscribe(() => {
      this.matchConfig = bottomSheetRef.instance.match;
      this.time = this.matchConfig.time;
    });
  }

  flipColors() {
    let scoreElementLeft = document.getElementById('scoreLeft')!;
    let scoreElementRight = document.getElementById('scoreRight')!;
    let leftColor: string = window.getComputedStyle(scoreElementLeft).color;
    let rightColor: string = window.getComputedStyle(scoreElementRight).color;
    scoreElementLeft.style.color = rightColor;
    scoreElementRight.style.color = leftColor;
  }

  definePriority() {
    const priorityColor = "#d4bff9";
    if (Math.random() > 0.5) {
      this.priority = "left";
      document.getElementById("scoreLeft")!.style.backgroundColor = priorityColor;
    } else {
      this.priority = "right";
      document.getElementById("scoreRight")!.style.backgroundColor = priorityColor;
    }
  }
}