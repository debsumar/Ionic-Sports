import { Component, Input, ViewEncapsulation } from '@angular/core';

export interface DetailHeaderRow {
  icon: string;
  text: string;
}

@Component({
  selector: 'app-detail-header',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="detail-header">
      <div class="detail-header-main">
        <div class="detail-header-info">
          <h2 class="detail-header-title">{{title}}</h2>
          <p class="detail-header-subtitle" *ngIf="subtitle">{{subtitle}}</p>
          <div class="detail-header-row" *ngFor="let row of detailRows">
            <ion-icon [name]="row.icon" class="detail-header-row-icon"></ion-icon>
            <span class="detail-header-row-text">{{row.text}}</span>
          </div>
        </div>
        <div class="detail-header-actions">
          <ng-content select="[header-actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    app-detail-header { display: block; }
    app-detail-header .detail-header { padding: 16px 16px 12px; }
    app-detail-header .detail-header-main { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
    app-detail-header .detail-header-info { flex: 1; min-width: 0; }
    app-detail-header .detail-header-title {
      font-size: 18px; font-weight: 700; color: #f1f5f9;
      margin: 0 0 4px; line-height: 1.3; letter-spacing: -0.2px; word-break: break-word;
    }
    app-detail-header .detail-header-subtitle { font-size: 13px; font-weight: 500; color: #94a3b8; margin: 0 0 8px; letter-spacing: 0.1px; }
    app-detail-header .detail-header-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    app-detail-header .detail-header-row-icon { font-size: 14px; color: #3fbcd3; flex-shrink: 0; }
    app-detail-header .detail-header-row-text { font-size: 13px; font-weight: 600; color: #cbd5e1; letter-spacing: 0.1px; }
    app-detail-header .detail-header-actions { display: flex; flex-direction: column; align-items: center; gap: 3px; flex-shrink: 0; }

    .light-theme app-detail-header .detail-header-title { color: #1e293b; }
    .light-theme app-detail-header .detail-header-subtitle { color: #64748b; }
    .light-theme app-detail-header .detail-header-row-text { color: #334155; }

    @media (max-width: 359px) {
      app-detail-header .detail-header { padding: 12px 12px 8px; }
      app-detail-header .detail-header-title { font-size: 16px; }
      app-detail-header .detail-header-subtitle { font-size: 12px; }
      app-detail-header .detail-header-row-text { font-size: 12px; }
    }
    @media (min-width: 768px) {
      app-detail-header .detail-header { padding: 20px 24px 14px; }
      app-detail-header .detail-header-title { font-size: 22px; }
      app-detail-header .detail-header-subtitle { font-size: 14px; }
      app-detail-header .detail-header-row-text { font-size: 14px; }
      app-detail-header .detail-header-actions { gap: 5px; }
    }
  `]
})
export class DetailHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() detailRows: DetailHeaderRow[] = [];
}
