import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-form-field',
  encapsulation: ViewEncapsulation.None,
  template: `<div class="form-field" [class.light]="!isDark"><ng-content></ng-content></div>`,
  styles: [`
    .form-field { margin: 6px 0; }

    /* Target Ionic 3's compiled .item-ios / .item-md class on the host element */
    .form-field .item-ios,
    .form-field .item-md {
      border-radius: 8px !important;
      border: 1px solid #2d3f55 !important;
      background-color: #1a2740 !important;
      box-shadow: none !important;
      padding-left: 14px !important;
      min-height: 52px !important;
    }
    .form-field .item-ios .item-inner,
    .form-field .item-md .item-inner {
      border-bottom: none !important;
      padding-right: 14px !important;
      box-shadow: none !important;
    }
    /* Labels */
    .form-field .label-ios,
    .form-field .label-md {
      color: #94a3b8 !important;
      font-weight: 500 !important;
      font-size: 13px !important;
      text-transform: none !important;
      letter-spacing: 0 !important;
      margin-bottom: 2px !important;
    }
    /* Input text */
    .form-field .text-input {
      color: #f1f5f9 !important;
      font-size: 15px !important;
    }
    .form-field .text-input::placeholder {
      color: #4a5c72 !important;
    }
    /* Also target native input directly (Ionic wraps in .text-input but some browsers need this) */
    .form-field input.text-input,
    .form-field input {
      color: #f1f5f9 !important;
    }
    /* Textarea */
    .form-field textarea {
      color: #f1f5f9 !important;
      font-size: 15px !important;
      padding-top: 8px !important;
    }
    .form-field textarea::placeholder {
      color: #4a5c72 !important;
    }

    /* Light variant */
    .form-field.light .item-ios,
    .form-field.light .item-md {
      background-color: #f8fafc !important;
      border-color: #cbd5e1 !important;
      box-shadow: none !important;
    }
    .form-field.light .label-ios,
    .form-field.light .label-md { color: #475569 !important; }
    .form-field.light .text-input { color: #0f172a !important; }
    .form-field.light .text-input::placeholder { color: #94a3b8 !important; }
    .form-field.light textarea { color: #0f172a !important; }
    .form-field.light textarea::placeholder { color: #94a3b8 !important; }
  `]
})
export class FormFieldComponent {
  @Input() isDark: boolean = true;
}
