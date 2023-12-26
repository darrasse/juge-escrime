import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ConfigurationComponent, Match, MatchSnapshot } from '../configuration/configuration.component';

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
    bouts: 1,
    passivity: false,
  }

  bout: number = 1;
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
  time: number = this.matchConfig.time * 10;
  timeRollback: number = 0;
  priority: string = "";
  passivityTime: number = 600;

  timerColor: string = "primary";

  reset() {
    clearInterval(this.interval);
    this.bout = 1;
    this.period = 1;
    this.scoreLeft = {
      score: 0,
      displayScore: "0",
    };
    this.scoreRight = {
      score: 0,
      displayScore: "0",
    };
    this.phase = "START";
    this.time = this.matchConfig.time * 10;
    this.timerColor = "primary";
    this.passivityTime = 600;
    document.getElementById("timer")!.style.opacity = "1.0";
    this.resetPriority();
  }

  resetPriority() {
    this.priority = "";
    document.getElementById("scoreLeft")!.style.backgroundColor = "";
    document.getElementById("scoreRight")!.style.backgroundColor = "";
  }

  increaseScore(score: Score) {
    this.pauseTimer();
    if (this.time > 600) {
      this.passivityTime = 600;
    } else {
      this.passivityTime = 0;
    }
    if (score.displayScore == "V") {
      return;
    }
    if (this.scoreLeft.displayScore == "V" || this.scoreRight.displayScore == "V") {
      if (score.score == this.matchConfig.touches * this.matchConfig.bouts - 1) {
        return;
      }
    }
    if (this.phase == "EXTRAMINUTE") {
      this.resetPriority();
      this.time = 0;
      this.phase = "TIMEUP";
    }
    score.score++;
    if (this.phase == "TIMEUP") {
      this.maybeExtraMinute();
    } else if (score.score == this.matchConfig.touches * this.matchConfig.bouts || this.priority) {
      navigator.vibrate(500);
      this.timerColor = "disabled";
      this.phase = "END";
    } else if (score.score == this.matchConfig.touches * this.bout) {
      navigator.vibrate(500);
      this.bout++;
      this.timeRollback = this.time;
      this.time = this.matchConfig.time * 10;
      this.phase = "PAUSED";
    } else {
      this.phase = "PAUSED";
    }
    this.displayScores();
  }

  decreaseScore(score: Score) {
    this.pauseTimer();
    if (this.phase == "EXTRAMINUTE") {
      this.resetPriority();
      this.time = 0;
      this.phase = "TIMEUP";
    } else if (this.priority) {
      this.timerColor = "warn";
    } else if (score.displayScore == "V") {
      this.timerColor = "primary";
    } else if (this.bout > 1 && this.timeRollback > 0 && score.score == this.matchConfig.touches * (this.bout - 1)) {
      this.bout--;
      this.time = this.timeRollback;
      this.timeRollback = 0;
    }
    score.score--;
    if (this.phase == "TIMEUP") {
      this.maybeExtraMinute();
    } else {
      this.phase = "PAUSED";
    }
    this.displayScores();
  }

  audioContext : AudioContext = new AudioContext();

  beep(frequency: number, volume: number, duration: number) {
    const oscillatorNode: OscillatorNode = new OscillatorNode(this.audioContext, { type: "square", frequency: frequency });
    const gainNode: GainNode = new GainNode(this.audioContext, { gain: volume });
    gainNode.connect(this.audioContext.destination);
    oscillatorNode.connect(gainNode);
    oscillatorNode.start(this.audioContext.currentTime);
    oscillatorNode.stop(this.audioContext.currentTime + duration);
  }

  flipTimer() {
    switch (this.phase) {
      case 'START':
      case 'PAUSED':
      case 'EXTRAMINUTE':
        this.phase = "RUNNING";
        this.startTimer();
        this.beep(1320, 0.1, 0.1);
        break;
      case 'RUNNING':
        this.phase = "PAUSED";
        this.pauseTimer();
        this.beep(440, 0.1, 0.1);
        break;
    }
    navigator.vibrate(100);
  }

  interval: ReturnType<typeof setTimeout> = setInterval(() => {}, 1000);

  startTimer() {
    clearInterval(this.interval);
    document.getElementById("timer")!.style.opacity = "0.88";
    if (this.phase == "RUNNING" && this.matchConfig.passivity && this.passivityTime > 0) {
      this.interval = setInterval(() => {
        this.time--;
        if (this.time <= 0) {
          this.timeUp();
        } else {
          this.passivityTime--;
          if (this.passivityTime <= 0) {
            this.passivityTimeUp();
          }
        }
      }, 100);
    } else {
      this.interval = setInterval(() => {
        this.time--;
        if (this.time <= 0) {
          this.timeUp();
        }
      }, 100);
    }
  }

  pauseTimer() {
    clearInterval(this.interval);
    document.getElementById("timer")!.style.opacity = "1.0";
  }

  maybeExtraMinute() {
    if (this.scoreLeft.score == this.scoreRight.score && !this.priority) {
      this.definePriority();
      this.timerColor = "warn";
      this.time = 600;
      this.phase = "EXTRAMINUTE";
    } else {
      this.timerColor = "disabled";
      this.phase = "TIMEUP";
    }
    this.passivityTime = 0;
  }

  timeUp() {
    // phase should be RUNNING or BREAK
    this.pauseTimer();
    this.beep(880, 1, 1);
    navigator.vibrate(1000);
    if (this.phase == "BREAK") {
      this.period++;
      this.timerColor = "primary";
      this.time = this.matchConfig.time * 10;
      this.phase = "PAUSED";
    } else if (this.period < this.matchConfig.periods) {
      this.timerColor = "basic";
      this.time = 600;
      this.passivityTime = 600;
      this.phase = "BREAK";
      this.startTimer();
    } else if (this.bout < this.matchConfig.bouts) {
      this.bout++;
      this.time = this.matchConfig.time * 10;
      this.passivityTime = 600;
      this.phase = "PAUSED";
    } else {
      this.maybeExtraMinute();
      this.displayScores();
    }
  }

  passivityTimeUp() {
    // phase should be RUNNING
    this.pauseTimer();
    this.beep(660, 0.5, 0.5);
    navigator.vibrate(500);
    if (this.time > 600) {
      this.passivityTime = 600;
    }
    this.phase = "PAUSED";
  }

  displayScores() {
    this.scoreLeft.displayScore = this.scoreLeft.score.toString();
    this.scoreRight.displayScore = this.scoreRight.score.toString();
    if (this.scoreLeft.score == this.matchConfig.touches * this.matchConfig.bouts && !this.priority) {
      this.scoreLeft.displayScore = "V";
    } else if (this.scoreRight.score == this.matchConfig.touches * this.matchConfig.bouts && !this.priority) {
      this.scoreRight.displayScore = "V";
    } else if (this.phase == "TIMEUP" || this.phase == "END") {
      if (this.scoreLeft.score > this.scoreRight.score || (this.scoreLeft.score == this.scoreRight.score && this.priority == "left")) {
        this.scoreLeft.displayScore = "V" + this.scoreLeft.score.toString();
      } else if (this.scoreRight.score > this.scoreLeft.score || (this.scoreRight.score == this.scoreLeft.score && this.priority == "right")) {
        this.scoreRight.displayScore = "V" + this.scoreRight.score.toString();
      }
    }
  }

  openConfiguration() {
    const bottomSheetRef = this._bottomSheet.open(ConfigurationComponent, { data: { config: this.matchConfig } });
    bottomSheetRef.afterDismissed().subscribe(() => {
      this.matchConfig = bottomSheetRef.instance.match;
      this.time = this.matchConfig.time * 10;
    });
  }

  openEdit() {
    var snapshot: MatchSnapshot = {
      time: this.time / 10,
      passivityTime: this.passivityTime / 10,
    }
    const bottomSheetRef = this._bottomSheet.open(ConfigurationComponent, { data: { snapshot: snapshot } });
    bottomSheetRef.afterDismissed().subscribe(() => {
      snapshot = bottomSheetRef.instance.snapshot;
      this.time = snapshot.time * 10;
      this.passivityTime = snapshot.passivityTime * 10;
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