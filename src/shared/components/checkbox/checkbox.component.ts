import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from "@angular/core";

/**
 * Reusable iOS-style checkbox that renders identically on Android and iOS.
 *
 * Usage:
 *   <app-checkbox [(checked)]="item.IsSelected"></app-checkbox>
 *   <app-checkbox [(checked)]="item.IsSelected" [disabled]="item.disabled" color="#2b92bb"></app-checkbox>
 */
@Component({
  selector: "app-checkbox",
  encapsulation: ViewEncapsulation.None,
  template: `
    <button
      type="button"
      class="app-checkbox"
      [class.checked]="checked"
      [class.disabled]="disabled"
      [attr.aria-checked]="checked"
      [attr.aria-disabled]="disabled"
      role="checkbox"
      [style.--checkbox-color]="color"
      (click)="toggle()"
    >
      <span class="app-checkbox-inner"></span>
    </button>
  `,
  styles: [
    `
      app-checkbox .app-checkbox {
        -webkit-appearance: none;
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        padding: 0;
        margin: 0;
        border: 2px solid rgba(148, 163, 184, 0.55);
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
        outline: none;
        transition:
          background-color 0.2s ease,
          border-color 0.2s ease;
      }
      app-checkbox .app-checkbox.checked {
        border-color: var(--checkbox-color, #2b92bb);
        background: var(--checkbox-color, #2b92bb);
      }
      app-checkbox .app-checkbox.disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      app-checkbox .app-checkbox-inner {
        width: 5px;
        height: 10px;
        border-right: 2px solid transparent;
        border-bottom: 2px solid transparent;
        transform: rotate(45deg) translateY(-1px);
        transition: border-color 0.2s ease;
      }
      app-checkbox .app-checkbox.checked .app-checkbox-inner {
        border-right-color: #ffffff;
        border-bottom-color: #ffffff;
      }

      .light-theme app-checkbox .app-checkbox {
        border-color: rgba(100, 116, 139, 0.5);
      }
      .light-theme app-checkbox .app-checkbox.checked {
        border-color: var(--checkbox-color, #2b92bb);
      }
    `,
  ],
})
export class CheckboxComponent {
  @Input() checked: boolean = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  @Input() disabled: boolean = false;
  @Input() color: string = "#2b92bb";

  toggle() {
    if (this.disabled) {
      return;
    }
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}
