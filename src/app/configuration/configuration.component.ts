import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

export interface Match {
  periods: number; // periods per bout
  touches: number; // touches per bout
  time: number;    // seconds per period
}

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent {
  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ConfigurationComponent>) {
  }

  match: Match = {
    time: 180,
    touches: 5,
    periods: 1,
  }
}
