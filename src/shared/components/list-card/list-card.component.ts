import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-list-card',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="list-card" (click)="cardClick.emit($event)">
      <div class="list-card-accent" *ngIf="accentColor" [style.background]="accentColor"></div>
      <div class="list-card-body">
        <ng-content></ng-content>
      </div>
      <div class="list-card-check" *ngIf="showCheckbox" (click)="$event.stopPropagation()">
        <ion-checkbox [ngModel]="checked" [disabled]="checkboxDisabled" (ngModelChange)="onCheck($event)"></ion-checkbox>
      </div>
    </div>
  `,
  styles: [`
    app-list-card { display: block; min-width: 0; overflow: hidden; }
    app-list-card .list-card {
      display: flex;
      border-radius: 16px;
      border: 1px solid rgba(148, 163, 184, 0.12);
      background: #1c2a3e;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.28);
      cursor: pointer;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      max-width: 100%;
    }
    app-list-card .list-card:active { transform: scale(0.98); }
    app-list-card .list-card-accent { width: 5px; flex-shrink: 0; }
    app-list-card .list-card-body {
      flex: 1; min-width: 0; position: relative; overflow: hidden;
    }
    app-list-card .list-card-check { display: flex; align-items: center; padding: 0 12px; flex-shrink: 0; }

    .light-theme app-list-card .list-card {
      background: #ffffff;
      border: 1px solid rgba(148, 163, 184, 0.18);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
    }
  `]
})
export class ListCardComponent {
  @Input() accentColor: string = null;
  @Input() showCheckbox: boolean = false;
  @Input() checked: boolean = false;
  @Input() checkboxDisabled: boolean = false;
  @Output() cardClick = new EventEmitter<any>();
  @Output() checkedChange = new EventEmitter<boolean>();

  onCheck(value: boolean) {
    this.checked = value;
    this.checkedChange.emit(value);
  }
}
