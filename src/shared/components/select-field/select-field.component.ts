import { Component, Input, ViewEncapsulation } from '@angular/core';

/**
 * Reusable dropdown/select field.
 * Usage:
 *   <app-select-field [isDark]="isDarkTheme">
 *     <ion-item>
 *       <ion-select [(ngModel)]="value" (ionChange)="onChange($event)">
 *         <ion-option *ngFor="let o of options" [value]="o.id">{{o.name}}</ion-option>
 *       </ion-select>
 *     </ion-item>
 *   </app-select-field>
 */
@Component({
  selector: 'app-select-field',
  encapsulation: ViewEncapsulation.None,
  template: `<div class="select-field" [class.light]="!isDark"><ng-content></ng-content></div>`,
  styles: [`
    .select-field { margin: 6px 0; }

    /* Target Ionic 3's compiled .item-ios / .item-md class on the host element */
    .select-field .item-ios,
    .select-field .item-md {
      border-radius: 8px !important;
      border: 1px solid #2d3f55 !important;
      background-color: #1a2740 !important;
      box-shadow: none !important;
      min-height: 52px !important;
    }
    .select-field .item-ios .item-inner,
    .select-field .item-md .item-inner {
      border-bottom: none !important;
      padding-right: 8px !important;
      box-shadow: none !important;
    }
    /* Ionic 3 defaults ion-select to max-width:45% — override for label-less usage */
    .select-field .item-ios ion-select,
    .select-field .item-md ion-select {
      max-width: 100% !important;
      width: 100% !important;
      margin-left: 0 !important;
      color: #f1f5f9 !important;
      font-size: 15px !important;
    }
    .select-field .select-text { color: #f1f5f9 !important; }
    .select-field .select-icon { margin-left: auto !important; }

    /* Light variant */
    .select-field.light .item-ios,
    .select-field.light .item-md {
      background-color: #f8fafc !important;
      border-color: #cbd5e1 !important;
      box-shadow: none !important;
    }
    .select-field.light .item-ios ion-select,
    .select-field.light .item-md ion-select { color: #0f172a !important; }
    .select-field.light .select-text { color: #0f172a !important; }
  `]
})
export class SelectFieldComponent {
  @Input() isDark: boolean = true;
}
