import { Component, ViewEncapsulation, ElementRef, ViewChild, NgZone } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

declare var google: any;

const GOOGLE_MAPS_API_KEY = 'AIzaSyBb1feu2K9-mNuROhKdAYZccwl5ya3TyJU';//AIzaSyDpcFMCrpkNA_WXypfOPcBqEgqAr6_DRbE

@Component({
  selector: 'map-picker-modal',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="map-modal">

      <!-- Header: back arrow + title -->
      <div class="map-header">
        <ion-icon name="arrow-back" class="map-back" (click)="dismiss()"></ion-icon>
        <span class="map-title">Select Location</span>
      </div>

      <!-- Search bar — always visible -->
      <div class="map-search-bar">
        <input
          class="map-search-input"
          type="text"
          placeholder="Search address..."
          [(ngModel)]="searchText"
          (keyup.enter)="onSearch()" />
        <button class="map-search-btn" (click)="onSearch()">
          <ion-icon name="search"></ion-icon>
        </button>
      </div>

      <!-- Map — always in DOM via [hidden] so @ViewChild always resolves -->
      <div class="map-wrapper" [hidden]="mapLoadFailed">
        <div #mapContainer class="map-container"></div>
        <div class="map-pin" *ngIf="mapReady">
          <svg width="36" height="48" viewBox="0 0 40 52" fill="none">
            <path d="M20 0C8.954 0 0 8.954 0 20c0 14 20 32 20 32s20-18 20-32C40 8.954 31.046 0 20 0z" fill="#ef4444"/>
            <circle cx="20" cy="18" r="7" fill="#fff"/>
          </svg>
        </div>
        <div class="map-loading" *ngIf="!mapReady">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading map...</p>
        </div>
      </div>

      <!-- Fallback iframe (only if Maps JS API fails) -->
      <div class="map-fallback-wrap" *ngIf="mapLoadFailed">
        <div class="map-embed-wrapper">
          <iframe [src]="embedMapUrl" width="100%" height="100%"
            style="border:0;" allowfullscreen loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <div class="fallback-field">
          <label>Address</label>
          <input class="fallback-input" type="text" placeholder="Enter full address..."
            [ngModel]="fallbackAddress" (ngModelChange)="onFallbackChange($event)" />
        </div>
      </div>

      <!-- Footer: selected address display + confirm button -->
      <div class="map-footer">
        <div class="map-address-wrap">
          <ion-icon name="pin" class="map-pin-icon"></ion-icon>
          <p class="map-address">{{ selectedAddress || 'Move map to select location' }}</p>
        </div>
        <button class="map-confirm-btn" (click)="confirm()" [disabled]="!selectedAddress">
          Confirm Location
        </button>
      </div>

    </div>
  `,
  styles: [`
    .map-modal {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; flex-direction: column; background: #0f172a; z-index: 10000;
    }
    .map-header {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px;
      padding-top: calc(env(safe-area-inset-top, 20px) + 12px);
      background: rgba(15,23,42,0.95);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      flex-shrink: 0;
    }
    .map-back { font-size: 22px; color: #fff; cursor: pointer; flex-shrink: 0; }
    .map-title { flex: 1; color: #fff; font-size: 16px; font-weight: 600; }
    .map-wrapper {
      flex: 1; position: relative; min-height: 300px;
    }
    .map-container {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    }
    .map-pin {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -100%);
      z-index: 1; pointer-events: none;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));
    }
    .map-loading {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 12px;
      background: #0f172a; color: #f1f5f9;
    }
    .map-loading p { font-size: 14px; margin: 0; opacity: 0.7; }
    .map-fallback-wrap {
      flex: 1; display: flex; flex-direction: column; overflow: hidden;
    }
    .map-embed-wrapper { flex: 1; min-height: 200px; }
    .map-embed-wrapper iframe { width: 100%; height: 100%; }
    .fallback-field {
      padding: 10px 14px; background: rgba(15,23,42,0.9);
      border-top: 1px solid rgba(255,255,255,0.08); flex-shrink: 0;
    }
    .fallback-field label {
      display: block; font-size: 11px; font-weight: 600;
      color: #94a3b8; margin-bottom: 6px;
    }
    .fallback-input {
      width: 100%; height: 40px; border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.08);
      color: #fff; font-size: 14px;
      padding: 0 12px; outline: none; box-sizing: border-box;
    }
    .fallback-input::placeholder { color: rgba(255,255,255,0.4); }
    .map-footer {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px;
      padding-bottom: calc(env(safe-area-inset-bottom, 16px) + 12px);
      background: rgba(15,23,42,0.95);
      border-top: 1px solid rgba(255,255,255,0.1);
      flex-shrink: 0;
    }
    .map-address-wrap {
      flex: 1; display: flex; align-items: center; gap: 8px; overflow: hidden;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px; padding: 8px 12px;
    }
    .map-pin-icon { color: #3fbcd3; font-size: 15px; flex-shrink: 0; }
    .map-address {
      font-size: 13px; color: #cbd5e1; margin: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500;
    }
    .map-confirm-btn {
      height: 42px; padding: 0 18px; border: none; border-radius: 10px;
      background: linear-gradient(135deg, #2b92bb, #35adff);
      color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
      white-space: nowrap; flex-shrink: 0;
    }
    .map-confirm-btn:disabled { opacity: 0.35; }
    .map-search-bar {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px;
      background: rgba(15,23,42,0.95);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      flex-shrink: 0;
    }
    .map-search-input {
      flex: 1; height: 40px; border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.08);
      color: #f1f5f9; font-size: 14px;
      padding: 0 12px; outline: none; box-sizing: border-box;
    }
    .map-search-input::placeholder { color: rgba(255,255,255,0.4); }
    .map-search-btn {
      height: 40px; width: 44px; border: none; border-radius: 10px;
      background: linear-gradient(135deg, #2b92bb, #35adff);
      color: #fff; font-size: 18px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
  `]
})
export class MapPickerModalComponent {
  @ViewChild('mapContainer') mapEl: ElementRef;

  mapReady: boolean = false;
  mapLoadFailed: boolean = false;

  selectedAddress: string = '';
  selectedLat: number = 0;
  selectedLng: number = 0;

  fallbackAddress: string = '';
  searchText: string = '';
  private embedTimeout: any;
  embedMapUrl: SafeResourceUrl;

  private map: any = null;
  private geocoder: any = null;

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private zone: NgZone,
    private sanitizer: DomSanitizer
  ) {}

  ionViewDidLoad() {
    (window as any).gm_authFailure = () => {
      this.zone.run(() => { this.mapReady = false; this.mapLoadFailed = true; });
    };
  }

  ionViewDidEnter() {
    this.mapReady      = false;
    this.mapLoadFailed = false;

    const initialAddress = this.navParams.get('initialAddress') || '';
    const initialLat     = this.navParams.get('initialLat');
    const initialLng     = this.navParams.get('initialLng');

    this.selectedAddress = initialAddress;
    this.fallbackAddress = initialAddress;
    this.searchText      = initialAddress;
    this.selectedLat     = initialLat  || 0;
    this.selectedLng     = initialLng  || 0;
    this.updateEmbedUrl();

    // 600ms: wait for Ionic modal slide-in animation to finish
    setTimeout(() => this.initMap(initialLat, initialLng, initialAddress), 600);

    setTimeout(() => {
      if (!this.mapReady) {
        this.zone.run(() => { this.mapLoadFailed = true; });
      }
    }, 10000);
  }

  ionViewWillLeave() {
    if (this.map) {
      google.maps.event.clearInstanceListeners(this.map);
      this.map = null;
    }
    this.mapReady = false;
  }

  private initMap(initialLat: number, initialLng: number, initialAddress: string) {
    const el = this.mapEl && this.mapEl.nativeElement;
    if (!el) { return; }

    const startCenter = (initialLat && initialLng)
      ? { lat: +initialLat, lng: +initialLng }
      : { lat: 20.5937, lng: 78.9629 };
    const startZoom = (initialLat && initialLng) ? 16 : 5;

    // Delete zone.js-patched IntersectionObserver before map construction.
    // Maps SDK uses IO in a deferred setTimeout — keeping it deleted until
    // first idle ensures the SDK never hits the broken patched version.
    const savedIO = (window as any).IntersectionObserver;
    delete (window as any).IntersectionObserver;

    this.zone.runOutsideAngular(() => {
      this.map = new google.maps.Map(el, {
        center: startCenter,
        zoom: startZoom,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        backgroundColor: '#e8e0d8',
      });

      this.geocoder = new google.maps.Geocoder();

      let ioRestored = false;
      const restoreIO = () => {
        if (!ioRestored) { ioRestored = true; (window as any).IntersectionObserver = savedIO; }
      };
      setTimeout(restoreIO, 4000);

      this.map.addListener('idle', () => {
        restoreIO();
        const c = this.map.getCenter();
        if (!c || !this.geocoder) { return; }
        const lat = c.lat(); const lng = c.lng();
        this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          this.zone.run(() => {
            this.selectedLat = lat;
            this.selectedLng = lng;
            this.selectedAddress = (status === 'OK' && results && results[0])
              ? results[0].formatted_address
              : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          });
        });
      });

      this.zone.run(() => { this.mapReady = true; });

      if ((!initialLat || !initialLng) && initialAddress) {
        this.geocoder.geocode({ address: initialAddress }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            this.map.panTo(results[0].geometry.location);
            this.map.setZoom(16);
          }
        });
      } else if (!initialLat && !initialLng && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => this.map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => {}
        );
      }
    });
  }

  private updateEmbedUrl() {
    const q = encodeURIComponent(this.fallbackAddress || this.selectedAddress || 'India');
    this.embedMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${q}&t=&z=14&ie=UTF8&output=embed`
    );
  }

  onFallbackChange(value: string) {
    this.fallbackAddress = value;
    this.selectedAddress = value;
    clearTimeout(this.embedTimeout);
    this.embedTimeout = setTimeout(() => {
      this.zone.run(() => { this.updateEmbedUrl(); });
    }, 800);
  }

  onSearch() {
    if (!this.geocoder || !this.searchText || !this.searchText.trim()) { return; }
    this.geocoder.geocode({ address: this.searchText.trim() }, (results, status) => {
      this.zone.run(() => {
        if (status === 'OK' && results && results[0]) {
          this.map.panTo(results[0].geometry.location);
          this.map.setZoom(16);
          this.selectedAddress = results[0].formatted_address;
          this.selectedLat = results[0].geometry.location.lat();
          this.selectedLng = results[0].geometry.location.lng();
        }
      });
    });
  }

  confirm() {
    if (this.map) {
      const c = this.map.getCenter();
      if (c) { this.selectedLat = c.lat(); this.selectedLng = c.lng(); }
    }
    this.viewCtrl.dismiss({
      address: this.selectedAddress,
      lat: this.selectedLat,
      lng: this.selectedLng
    });
  }

  dismiss() {
    this.viewCtrl.dismiss(null);
  }
}
