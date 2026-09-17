import { Component, Input, ViewEncapsulation } from '@angular/core';

/**
 * Reusable dropdown/select field — cosmetic wrapper only.
 *
 * Earlier versions of this component tried to override or fully replace
 * Ionic 3's internal select rendering (`.select-text` / `.select-placeholder`,
 * then a custom absolutely-positioned overlay). Both approaches introduced
 * real regressions (broken/blank selected-value display) without reliably
 * fixing the alignment complaint, and could not be verified visually during
 * development. This version deliberately does the minimum: cosmetic
 * border/background/spacing only, leaving Ionic's native `ion-select`
 * markup, text rendering and picker behavior completely untouched — the
 * same proven-safe approach already used successfully on other pages
 * (e.g. createleague) via `app-form-field`.
 *
 * Usage:
 *   <app-dropdown-field [isDark]="isDarkTheme">
 *     <ion-item>
 *       <ion-label>Country</ion-label>
 *       <ion-select [(ngModel)]="value" (ionChange)="onChange($event)">
 *         <ion-option *ngFor="let o of options" [value]="o.id">{{o.name}}</ion-option>
 *       </ion-select>
 *     </ion-item>
 *   </app-dropdown-field>
 */
@Component({
  selector: 'app-dropdown-field',
  encapsulation: ViewEncapsulation.None,
  template: `<div class="dropdown-field" [class.light]="!isDark"><ng-content></ng-content></div>`,
  styles: [`
    .dropdown-field { margin: 6px 0; }

    .dropdown-field .item-ios,
    .dropdown-field .item-md {
      border-radius: 8px !important;
      border: 1px solid #2d3f55 !important;
      background-color: #1a2740 !important;
      box-shadow: none !important;
      padding-left: 6px !important;
    }

    .dropdown-field .item-ios .item-inner,
    .dropdown-field .item-md .item-inner {
      border-bottom: none !important;
      padding-right: 14px !important;
      box-shadow: none !important;
    }

    .dropdown-field ion-label {
      color: #94a3b8 !important;
      font-weight: 500 !important;
      font-size: 13px !important;
    }

    .dropdown-field .item-ios ion-select,
    .dropdown-field .item-md ion-select {
      max-width: 100% !important;
      width: 100% !important;
      margin-left: 0 !important;
      color: #f1f5f9 !important;
      font-size: 15px !important;
    }

    .dropdown-field .select-md,
    .dropdown-field .select-ios {
      padding: 8px 8px 8px 0 !important;
    }

    .dropdown-field .select-text,
    .dropdown-field .select-placeholder {
      color: #f1f5f9 !important;
      text-align: left !important;
      width: 100% !important;
    }
    .dropdown-field .select-icon { color: #94a3b8 !important; }

    /* Light variant */
    .dropdown-field.light .item-ios,
    .dropdown-field.light .item-md {
      background-color: #f8fafc !important;
      border-color: #cbd5e1 !important;
      box-shadow: none !important;
    }
    .dropdown-field.light ion-label { color: #475569 !important; }
    .dropdown-field.light .item-ios ion-select,
    .dropdown-field.light .item-md ion-select { color: #0f172a !important; }
    .dropdown-field.light .select-text,
    .dropdown-field.light .select-placeholder { color: #0f172a !important; }
    .dropdown-field.light .select-icon { color: #475569 !important; }
  `]
})
export class DropdownFieldComponent {
  @Input() isDark: boolean = true;
}
