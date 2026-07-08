import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  encapsulation: ViewEncapsulation.None,
  template: `
    <span class="status-badge" [class.success]="variant==='success'"
      [class.warning]="variant==='warning'"
      [class.danger]="variant==='danger'"
      [class.info]="variant==='info'">{{label}}</span>
  `,
  styles: [`
    app-status-badge { display: inline-block; }
    app-status-badge .status-badge {
      display: inline-block; font-size: 10px; font-weight: 700;
      letter-spacing: 0.3px; text-transform: uppercase;
      padding: 2px 8px; border-radius: 10px;
      background: rgba(148, 163, 184, 0.2); color: #cbd5e1;
    }
    app-status-badge .status-badge.success { background: rgba(16, 185, 129, 0.18); color: #10b981; }
    app-status-badge .status-badge.warning { background: rgba(245, 158, 11, 0.18); color: #f59e0b; }
    app-status-badge .status-badge.danger { background: rgba(239, 68, 68, 0.18); color: #ef4444; }
    app-status-badge .status-badge.info { background: rgba(43, 146, 187, 0.18); color: #2b92bb; }
  `]
})
export class StatusBadgeComponent {
  @Input() variant: string = 'info';
  @Input() label: string = '';
}
