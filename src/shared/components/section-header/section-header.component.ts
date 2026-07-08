import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-section-header',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="section-header">
      <h3 class="section-header-title">{{title}}</h3>
      <span class="section-header-count" *ngIf="count !== null && count !== undefined">{{count}}</span>
    </div>
  `,
  styles: [`
    app-section-header { display: block; }
    app-section-header .section-header {
      display: flex; align-items: center; gap: 8px;
      margin: 12px 4px 8px;
    }
    app-section-header .section-header-title {
      margin: 0; font-size: 14px; font-weight: 700;
      letter-spacing: 0.2px; color: #f1f5f9;
      text-transform: uppercase;
    }
    app-section-header .section-header-count {
      background: #2b92bb; color: #fff;
      font-size: 11px; font-weight: 700;
      padding: 2px 9px; border-radius: 10px;
      min-width: 20px; text-align: center; flex-shrink: 0;
    }

    .light-theme app-section-header .section-header-title { color: #1e293b; }
  `]
})
export class SectionHeaderComponent {
  @Input() title: string = '';
  @Input() count: number = null;
}
