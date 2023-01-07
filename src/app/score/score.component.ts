import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ConfigurationComponent } from '../configuration/configuration.component';

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

  roundTime: number = 180;

  scoreLeft: Score = {
    score: 0,
    displayScore: "0",
  };
  scoreRight: Score = {
    score: 0,
    displayScore: "0",
  };
  phase: string = "START";
  time: number = this.roundTime;

  timerColor: string = "primary";

  reset() {
    this.scoreLeft = {
      score: 0,
      displayScore: "0",
    };
    this.scoreRight = {
      score: 0,
      displayScore: "0",
    };
    this.phase = "START";
    this.time = this.roundTime;
    this.timerColor = "primary";
    document.getElementById("timer")!.style.opacity = "1.0";
  }

  increaseScore(score: Score) {
    score.score++;
    score.displayScore = score.score.toString();
  }
  decreaseScore(score: Score) {
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
      this.roundTime = bottomSheetRef.instance.time;
      this.time = this.roundTime;
    });
  }
}
