import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-pill-tabs',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="pill-tabs">
      <div class="pill-tabs-slider" [class.slide-right]="activeIndex==1"></div>
      <button class="pill-tabs-btn" [class.active]="activeIndex==0" (click)="select(0)">
        <ion-icon *ngIf="leftIcon" [name]="leftIcon"></ion-icon>
        {{leftLabel}}
      </button>
      <button class="pill-tabs-btn" [class.active]="activeIndex==1" (click)="select(1)">
        <ion-icon *ngIf="rightIcon" [name]="rightIcon"></ion-icon>
        {{rightLabel}}
      </button>
    </div>
  `,
  styles: [`
    app-pill-tabs { display: block; }
    app-pill-tabs .pill-tabs {
      display: flex; position: relative;
      margin: 10px 4px 4px; padding: 3px;
      background: #1e293b; border-radius: 12px;
    }
    app-pill-tabs .pill-tabs-slider {
      position: absolute; top: 3px; left: 3px;
      width: calc(50% - 3px); height: calc(100% - 6px);
      background: #2b92bb; border-radius: 10px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(43, 146, 187, 0.35);
    }
    app-pill-tabs .pill-tabs-slider.slide-right { transform: translateX(100%); }
    app-pill-tabs .pill-tabs-btn {
      position: relative; z-index: 1; flex: 1;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 10px 0; background: none; border: none;
      font-size: 13px; font-weight: 700; letter-spacing: 0.3px; line-height: 1;
      color: #64748b; cursor: pointer; transition: color 0.3s ease;
    }
    app-pill-tabs .pill-tabs-btn ion-icon { font-size: 16px; }
    app-pill-tabs .pill-tabs-btn.active { color: #ffffff; }

    .light-theme app-pill-tabs .pill-tabs { background: #e2e8f0; }
    .light-theme app-pill-tabs .pill-tabs-slider { box-shadow: 0 2px 8px rgba(43, 146, 187, 0.3); }
    .light-theme app-pill-tabs .pill-tabs-btn { color: #64748b; }
    .light-theme app-pill-tabs .pill-tabs-btn.active { color: #ffffff; }
  `]
})
export class PillTabsComponent {
  @Input() leftLabel: string = 'Tab 1';
  @Input() rightLabel: string = 'Tab 2';
  @Input() leftIcon: string;
  @Input() rightIcon: string;
  @Input() activeIndex: number = 0;
  @Output() activeIndexChange = new EventEmitter<number>();

  select(index: number) {
    this.activeIndex = index;
    this.activeIndexChange.emit(index);
  }
}
