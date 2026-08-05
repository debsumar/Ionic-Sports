import {
  Component,
  OnDestroy,
  ViewEncapsulation,
} from "@angular/core";
import { Subscription } from "rxjs";
import {
  FeatureAnnouncementService,
  FeatureAnnouncement,
} from "../../../services/feature-announcement.service";

@Component({
  selector: "app-feature-announcement-modal",
  encapsulation: ViewEncapsulation.None,
  template: `
    <div *ngIf="visible">
      <div class="fam-backdrop" (click)="dismiss()"></div>
      <div class="fam-modal">
        <button class="fam-close" (click)="dismiss()" aria-label="Close">
          <ion-icon name="close"></ion-icon>
        </button>

        <div class="fam-card" *ngIf="currentFeature">
          <span class="fam-badge" *ngIf="currentFeature.badge_text">{{
            currentFeature.badge_text
          }}</span>

          <div class="fam-icon-wrap" *ngIf="currentFeature.icon && isImageUrl(currentFeature.icon)">
            <img class="fam-icon-img" [src]="currentFeature.icon" alt="" />
          </div>

          <h2 class="fam-title">{{ currentFeature.title }}</h2>
          <p class="fam-description">{{ currentFeature.description }}</p>
        </div>

        <!-- Progress dots -->
        <div class="fam-dots" *ngIf="!isSingle">
          <span
            class="fam-dot"
            *ngFor="let f of features; let i = index"
            [class.active]="i === activeIndex"
            (click)="goTo(i)"
          ></span>
        </div>

        <!-- Actions -->
        <div class="fam-actions">
          <button
            class="fam-btn-secondary"
            *ngIf="!isSingle && activeIndex > 0"
            (click)="prev()"
          >
            Back
          </button>
          <button
            class="fam-btn-primary"
            *ngIf="isLast || isSingle"
            (click)="dismiss()"
          >
            Got it
          </button>
          <button class="fam-btn-primary" *ngIf="!(isLast || isSingle)" (click)="next()">
            Next
          </button>
        </div>

        <button class="fam-suppress" (click)="suppress()">
          Don't show for 7 days
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .fam-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        animation: famFadeIn 0.2s ease-out;
      }
      .fam-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10001;
        background: #1e293b;
        border: 1px solid rgba(43, 146, 107, 0.15);
        border-radius: 16px;
        padding: 24px 20px 20px;
        width: 92%;
        max-width: 440px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6),
          0 0 20px rgba(43, 146, 107, 0.1);
        animation: famSlideUp 0.3s ease-out;
      }
      .fam-close {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        background: none;
        border: none;
        cursor: pointer;
        color: #94a3b8;
        font-size: 1.2rem;
        padding: 0.25rem;
        line-height: 1;
      }
      .fam-card {
        padding: 0.5rem 0 1rem;
      }
      .fam-badge {
        display: inline-block;
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 14px;
      }
      .fam-icon-wrap {
        width: 72px;
        height: 72px;
        border-radius: 16px;
        background: rgba(43, 146, 107, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        overflow: hidden;
      }
      .fam-icon-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 14px;
      }
      .fam-title {
        font-size: 20px;
        font-weight: 700;
        color: #f1f5f9;
        margin: 0 0 10px;
        letter-spacing: -0.01em;
        line-height: 1.3;
      }
      .fam-description {
        font-size: 15px;
        color: #cbd5e1;
        line-height: 1.6;
        margin: 0;
      }
      .fam-dots {
        display: flex;
        justify-content: center;
        gap: 0.4rem;
        margin: 0.75rem 0;
      }
      .fam-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(148, 163, 184, 0.45);
        cursor: pointer;
        transition: background 0.2s, transform 0.2s;
      }
      .fam-dot.active {
        background: #10b981;
        transform: scale(1.25);
      }
      .fam-actions {
        margin-top: 16px;
        display: flex;
        gap: 10px;
      }
      .fam-btn-primary {
        flex: 1;
        padding: 13px 16px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
      }
      .fam-btn-secondary {
        flex: 1;
        padding: 13px 16px;
        border: 1px solid rgba(148, 163, 184, 0.3);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.06);
        color: #cbd5e1;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
      }
      .fam-suppress {
        display: block;
        margin: 12px auto 0;
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 13px;
        cursor: pointer;
        padding: 4px;
        text-decoration: underline;
      }

      /* Light theme overrides (page elements get .light-theme like other shared components) */
      .light-theme .fam-modal {
        background: #ffffff;
        border: 1px solid rgba(148, 163, 184, 0.18);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      .light-theme .fam-title {
        color: #111827;
        font-weight: 700;
      }
      .light-theme .fam-description {
        color: #6b7280;
      }
      .light-theme .fam-close {
        color: #9ca3af;
      }
      .light-theme .fam-suppress {
        color: #9ca3af;
      }
      .light-theme .fam-btn-secondary {
        background: rgba(0, 0, 0, 0.04);
        border-color: rgba(0, 0, 0, 0.12);
        color: #374151;
      }
      .light-theme .fam-dot {
        background: #d1d5db;
      }

      @keyframes famFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes famSlideUp {
        from {
          opacity: 0;
          transform: translate(-50%, -45%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }
    `,
  ],
})
export class FeatureAnnouncementModalComponent implements OnDestroy {
  visible: boolean = false;
  features: FeatureAnnouncement[] = [];
  activeIndex: number = 0;

  private parentClubId: string = "";
  private subscriptions: Subscription[] = [];

  constructor(private service: FeatureAnnouncementService) {}

  get currentFeature(): FeatureAnnouncement {
    return this.features[this.activeIndex];
  }

  get isLast(): boolean {
    return this.activeIndex >= this.features.length - 1;
  }

  get isSingle(): boolean {
    return this.features.length === 1;
  }

  // Called by the host page once the parent club id is known.
  check(parentClubId: string): void {
    this.parentClubId = parentClubId;
    if (!this.parentClubId) {
      return;
    }

    const sub = this.service.getActive(this.parentClubId).subscribe(
      (res) => {
        if (res && res.show_modal && res.features && res.features.length) {
          this.features = res.features
            .slice()
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          this.activeIndex = 0;
          this.visible = true;
        }
      },
      (err) => {
        console.error("feature-announcement/get-active failed", err);
      }
    );
    this.subscriptions.push(sub);
  }

  isImageUrl(value: string): boolean {
    if (!value) return false;
    const lower = value.toLowerCase();
    return (
      lower.startsWith('http://') ||
      lower.startsWith('https://') ||
      lower.startsWith('data:image/') ||
      /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/.test(lower)
    );
  }

  next(): void {
    if (!this.isLast) {
      this.activeIndex++;
    }
  }

  prev(): void {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  goTo(index: number): void {
    this.activeIndex = index;
  }

  dismiss(): void {
    const ids = this.features.map((f) => f.id);
    if (this.parentClubId && ids.length) {
      const sub = this.service
        .markShown(this.parentClubId, ids)
        .subscribe(() => {}, () => {});
      this.subscriptions.push(sub);
    }
    this.visible = false;
  }

  suppress(): void {
    if (this.parentClubId) {
      const sub = this.service
        .suppress(this.parentClubId)
        .subscribe(() => {}, () => {});
      this.subscriptions.push(sub);
    }
    this.visible = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.subscriptions = [];
  }
}
