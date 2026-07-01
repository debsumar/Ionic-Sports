import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  selector: "primary-card",
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="primary-card" (click)="cardClick.emit($event)">
      <div
        class="primary-card-accent"
        *ngIf="accentColor"
        [style.background]="accentColor"
      ></div>
      <div class="primary-card-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      primary-card {
        display: block;
        min-width: 0;
      }
      primary-card .primary-card {
        display: flex;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.12);
        background: #1c2a3e;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.28);
        cursor: pointer;
        overflow: hidden;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
        max-width: 100%;
      }
      primary-card .primary-card:active {
        transform: scale(0.98);
      }
      primary-card .primary-card-accent {
        width: 5px;
        flex-shrink: 0;
      }
      primary-card .primary-card-body {
        flex: 1;
        min-width: 0;
        position: relative;
        overflow: hidden;
      }

      .light-theme primary-card .primary-card {
        background: #ffffff;
        border: 1px solid rgba(148, 163, 184, 0.18);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
      }
    `,
  ],
})
export class PrimaryCardComponent {
  @Input() accentColor: string = null;
  @Output() cardClick = new EventEmitter<any>();
}
