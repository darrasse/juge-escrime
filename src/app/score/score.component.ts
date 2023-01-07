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
  }

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
  }

  increaseScore(score: Score) {
    if (this.phase == "END") {
      return;
    }
    score.score++;
    if (score.score == this.matchConfig.touches) {
      score.displayScore = "V";
      navigator.vibrate(500);
      this.timerColor = "disabled";
      this.pauseTimer();
      this.phase = "END";
    } else {
      score.displayScore = score.score.toString();
    }
  }
  decreaseScore(score: Score) {
    if (this.phase == "END") {
      if (score.displayScore == score.score.toString()) {
        return;
      }
      this.timerColor = "primary";
      this.phase = "PAUSED";
    }
    score.score--;
    score.displayScore = score.score.toString();
  }

  flipTimer() {
    switch (this.phase) {
      case 'START':
      case 'PAUSED':
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

  timeUp() {
    navigator.vibrate(1000);
    this.phase = "TIMEUP";
    this.timerColor = "disabled";
    this.pauseTimer();
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
}
