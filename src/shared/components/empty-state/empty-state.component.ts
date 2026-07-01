import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="empty-state" [class.danger]="danger">
      <ion-icon *ngIf="icon" [name]="icon" class="empty-state-icon"></ion-icon>
      <p class="empty-state-text">{{text}}</p>
    </div>
  `,
  styles: [`
    app-empty-state { display: block; }
    app-empty-state .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 10px; padding: 40px 20px; text-align: center;
    }
    app-empty-state .empty-state-icon {
      font-size: 48px; color: #475569;
    }
    app-empty-state .empty-state-text {
      margin: 0; font-size: 14px; font-weight: 600; color: #94a3b8;
    }
    app-empty-state .empty-state.danger .empty-state-icon { color: #ef4444; }
    app-empty-state .empty-state.danger .empty-state-text { color: #f87171; }

    .light-theme app-empty-state .empty-state-icon { color: #cbd5e1; }
    .light-theme app-empty-state .empty-state-text { color: #64748b; }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = '';
  @Input() text: string = '';
  @Input() danger: boolean = false;
}
