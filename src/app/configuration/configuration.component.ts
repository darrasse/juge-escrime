import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

export interface Match {
  bouts: number;         // bouts per match
  periods: number;       // periods per bout
  touches: number;       // touches per bout
  time: number;          // seconds per period
  passivity: boolean;    // whether to stop after a minute without a touch
}

export interface MatchSnapshot {
  time: number;
  passivityTime: number;
}

export interface ConfigData {
  config: Match,
  snapshot: MatchSnapshot,
}

@Component({
    selector: 'app-configuration',
    templateUrl: './configuration.component.html',
    styleUrls: ['./configuration.component.css'],
    standalone: false
})
export class ConfigurationComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: ConfigData,
    private _bottomSheetRef: MatBottomSheetRef<ConfigurationComponent>,
    private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.match = this.data.config;
    this.snapshot = this.data.snapshot;
  }

  match: Match = {
    time: 180,
    touches: 5,
    periods: 1,
    bouts: 1,
    passivity: false,
  }

  snapshot: MatchSnapshot = {
    time: 180,
    passivityTime: 60,
  }
}
