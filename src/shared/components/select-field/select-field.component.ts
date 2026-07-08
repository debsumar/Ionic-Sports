import { Component, Input, ViewEncapsulation } from '@angular/core';

/**
 * Reusable dropdown/select field.
 * Projects an <ion-item><ion-select>...</ion-select></ion-item> and styles it
 * so the selected text is left-aligned and the dropdown icon sits at the right.
 * Self-themes via the [isDark] input.
 *
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
    .select-field {
      margin: 6px 0;

      ion-item {
        border-radius: 12px !important;
        border: 1px solid #334155 !important;
        background: #1e293b !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        padding-left: 16px;
        align-items: center;
        min-height: 50px;
      }
      ion-item .item-inner {
        border-bottom: none !important;
        padding: 6px 16px 6px 0;
        box-shadow: none !important;
      }
      ion-label {
        color: #94a3b8 !important;
        font-weight: 700 !important;
        font-size: 11px !important;
        text-transform: uppercase !important;
        letter-spacing: 0.6px !important;
        white-space: normal !important;
        overflow: visible !important;
        margin-right: 12px;
      }

      // Text on the left, dropdown icon pinned to the right
      ion-select {
        flex: 1 1 auto !important;
        max-width: 100% !important;
        width: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        color: #ffffff !important;
        text-align: left !important;
      }
      .select-text {
        flex: 1 1 auto !important;
        text-align: left !important;
        color: #ffffff !important;
      }
      .select-icon { margin-left: auto !important; }
    }

    .select-field.light {
      ion-item {
        background: #ffffff !important;
        border-color: #e2e8f0 !important;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05) !important;
      }
      ion-label { color: #64748b !important; }
      ion-select { color: #0f172a !important; }
      .select-text { color: #0f172a !important; }
    }
  `]
})
export class SelectFieldComponent {
  @Input() isDark: boolean = true;
}
