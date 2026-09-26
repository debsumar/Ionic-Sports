import { Component, ViewEncapsulation, ElementRef, ViewChild, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ViewController, NavParams } from 'ionic-angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs/Rx';
import { MapsLoaderService } from '../../../services/maps-loader.service';
import { CommonService, ToastMessageType } from '../../../services/common.service';
import { environment as devEnvironment } from '../../../environments/environment';
import { environment as prodEnvironment } from '../../../environments/environment.prod';

declare var google: any;
declare var L: any;

const environment = prodEnvironment.production ? prodEnvironment : devEnvironment;

interface MapSuggestion {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

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
      <div class="map-search-area">
        <div class="map-search-bar">
          <input
            class="map-search-input"
            type="text"
            placeholder="Search address..."
            [(ngModel)]="searchText"
            (ngModelChange)="onOsmSearch()"
            (keyup.enter)="onSearch()" />
          <ion-spinner class="map-search-spinner" name="crescent" *ngIf="osmSearching"></ion-spinner>
          <button class="map-clear-btn" *ngIf="searchText && !osmSearching" (click)="clearOsmSearch()">
            <ion-icon name="close"></ion-icon>
          </button>
          <button class="map-search-btn" *ngIf="useGoogleMaps" (click)="onSearch()">
            <ion-icon name="search"></ion-icon>
          </button>
        </div>
        <div class="map-suggestions" *ngIf="suggestions.length">
          <button class="map-suggestion" *ngFor="let suggestion of suggestions"
            (click)="selectSuggestion(suggestion)">
            <ion-icon name="pin"></ion-icon>
            <span>{{ suggestion.label }}</span>
          </button>
        </div>
      </div>

      <!-- Map — always in DOM via [hidden] so @ViewChild always resolves -->
      <div class="map-wrapper" [hidden]="mapLoadFailed">
        <div #mapContainer class="map-container" [hidden]="!useGoogleMaps"></div>
        <div #leafletMap class="map-container" [hidden]="useGoogleMaps"></div>
        <div class="map-pin" *ngIf="mapReady && useGoogleMaps">
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

      <!-- Fallback iframe (only if the interactive map fails) -->
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
      background: #0f172a; color: #f1f5f9; z-index: 500;
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
    .map-search-area {
      position: relative; z-index: 1100; flex-shrink: 0;
      background: rgba(15,23,42,0.95);
    }
    .map-search-bar {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .map-search-input {
      flex: 1; height: 40px; border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.08);
      color: #f1f5f9; font-size: 14px;
      padding: 0 12px; outline: none; box-sizing: border-box; min-width: 0;
    }
    .map-search-input::placeholder { color: rgba(255,255,255,0.4); }
    .map-search-spinner { width: 22px; height: 22px; flex-shrink: 0; }
    .map-clear-btn {
      height: 36px; width: 36px; border: none; border-radius: 50%;
      background: rgba(255,255,255,0.08); color: #cbd5e1; font-size: 18px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .map-search-btn {
      height: 40px; width: 44px; border: none; border-radius: 10px;
      background: linear-gradient(135deg, #2b92bb, #35adff);
      color: #fff; font-size: 18px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .map-suggestions {
      position: absolute; top: 56px; left: 16px; right: 16px;
      max-height: 260px; overflow-y: auto; border-radius: 10px;
      background: #1e293b; border: 1px solid rgba(255,255,255,0.14);
      box-shadow: 0 10px 28px rgba(0,0,0,0.45);
    }
    .map-suggestion {
      width: 100%; display: flex; align-items: flex-start; gap: 10px;
      padding: 11px 12px; border: 0; text-align: left;
      background: transparent; color: #e2e8f0; font-size: 13px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .map-suggestion:last-child { border-bottom: 0; }
    .map-suggestion ion-icon { color: #3fbcd3; margin-top: 2px; flex-shrink: 0; }
  `]
})
export class MapPickerModalComponent {
  @ViewChild('mapContainer') mapEl: ElementRef;
  @ViewChild('leafletMap') leafletMapEl: ElementRef;

  readonly useGoogleMaps: boolean = environment.google.useGoogleMaps;
  mapReady: boolean = false;
  mapLoadFailed: boolean = false;
  osmSearching: boolean = false;
  suggestions: MapSuggestion[] = [];

  selectedAddress: string = '';
  selectedLat: number = 0;
  selectedLng: number = 0;

  fallbackAddress: string = '';
  searchText: string = '';
  embedMapUrl: SafeResourceUrl;

  private map: any = null;
  private geocoder: any = null;
  private leafletMap: any = null;
  private leafletMarker: any = null;
  private hasInitialLatLng: boolean = false;
  private mapFailureNotified: boolean = false;
  private embedTimeout: any;
  private leafletInitTimeout: any;
  private leafletInvalidateTimeout: any;
  private reverseTimeout: any;
  private searchTimeout: any;
  private googleRestoreTimeout: any;
  private reverseSubscription: Subscription = null;
  private searchSubscription: Subscription = null;

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private zone: NgZone,
    private sanitizer: DomSanitizer,
    private mapsLoader: MapsLoaderService,
    private commonService: CommonService,
    // Deliberate exception: keyless external APIs use HttpClient because
    // HttpService prepends the ActivityPro base URL and cannot call third-party hosts.
    private http: HttpClient
  ) {}

  ionViewDidEnter() {
    this.mapReady = false;
    this.mapLoadFailed = false;
    this.mapFailureNotified = false;

    const initialAddress = this.navParams.get('initialAddress') || '';
    const initialLat = this.navParams.get('initialLat');
    const initialLng = this.navParams.get('initialLng');
    this.hasInitialLatLng = initialLat !== null && initialLat !== undefined &&
      initialLng !== null && initialLng !== undefined &&
      !isNaN(+initialLat) && !isNaN(+initialLng);

    this.selectedAddress = initialAddress;
    this.fallbackAddress = initialAddress;
    this.searchText = initialAddress;
    this.selectedLat = this.hasInitialLatLng ? +initialLat : 51.5074;
    this.selectedLng = this.hasInitialLatLng ? +initialLng : -0.1278;
    this.updateEmbedUrl();

    if (!this.useGoogleMaps) {
      this.mapsLoader.loadLeaflet().then(
        () => {
          this.leafletInitTimeout = setTimeout(() => this.initLeaflet(), 150);
        },
        () => this.onMapFailed()
      );
      return;
    }

    this.mapsLoader.loadGoogleMaps().then(
      () => this.initMap(initialLat, initialLng, initialAddress),
      () => this.onMapFailed()
    );
  }

  ionViewWillLeave() {
    clearTimeout(this.embedTimeout);
    clearTimeout(this.leafletInitTimeout);
    clearTimeout(this.leafletInvalidateTimeout);
    clearTimeout(this.reverseTimeout);
    clearTimeout(this.searchTimeout);
    clearTimeout(this.googleRestoreTimeout);
    this.unsubscribe(this.reverseSubscription);
    this.unsubscribe(this.searchSubscription);
    this.reverseSubscription = null;
    this.searchSubscription = null;

    if (this.leafletMap) {
      this.leafletMap.remove();
      this.leafletMap = null;
      this.leafletMarker = null;
    }
    if (this.map && typeof google !== 'undefined' && google.maps && google.maps.event) {
      google.maps.event.clearInstanceListeners(this.map);
      this.map = null;
    }
    this.geocoder = null;
    this.suggestions = [];
    this.osmSearching = false;
    this.mapReady = false;
  }

  private initLeaflet() {
    this.zone.run(() => {
      try {
        const el = this.leafletMapEl && this.leafletMapEl.nativeElement;
        if (!el || typeof L === 'undefined') {
          this.onMapFailed();
          return;
        }
        if (this.leafletMap) {
          this.leafletMap.remove();
          this.leafletMap = null;
          this.leafletMarker = null;
        }

        const lat = this.selectedLat;
        const lng = this.selectedLng;
        this.leafletMap = L.map(el, {
          center: [lat, lng],
          zoom: this.hasInitialLatLng ? 15 : 5,
          zoomControl: true
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.leafletMap);

        this.leafletMarker = L.marker([lat, lng], {
          draggable: true,
          icon: L.icon({
            iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }).addTo(this.leafletMap);

        this.leafletMarker.on('dragend', () => {
          const position = this.leafletMarker.getLatLng();
          this.onMapPositionChanged(position.lat, position.lng);
        });
        this.leafletMap.on('click', (event: any) => {
          this.leafletMarker.setLatLng(event.latlng);
          this.onMapPositionChanged(event.latlng.lat, event.latlng.lng);
        });

        this.mapReady = true;
        this.leafletInvalidateTimeout = setTimeout(() => {
          if (this.leafletMap) { this.leafletMap.invalidateSize(); }
        }, 200);
      } catch (error) {
        this.onMapFailed();
      }
    });
  }

  private initMap(initialLat: number, initialLng: number, initialAddress: string) {
    try {
      const el = this.mapEl && this.mapEl.nativeElement;
      if (!el || !this.mapsLoader.isGoogleReady()) {
        this.onMapFailed();
        return;
      }

      const startCenter = this.hasInitialLatLng
        ? { lat: +initialLat, lng: +initialLng }
        : { lat: 51.5074, lng: -0.1278 };
      const startZoom = this.hasInitialLatLng ? 16 : 5;
      const savedIO = (window as any).IntersectionObserver;
      delete (window as any).IntersectionObserver;

      this.zone.runOutsideAngular(() => {
        this.map = new google.maps.Map(el, {
          center: startCenter,
          zoom: startZoom,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          backgroundColor: '#e8e0d8'
        });
        this.geocoder = new google.maps.Geocoder();

        let ioRestored = false;
        const restoreIO = () => {
          if (!ioRestored) {
            ioRestored = true;
            (window as any).IntersectionObserver = savedIO;
          }
        };
        this.googleRestoreTimeout = setTimeout(restoreIO, 4000);

        this.map.addListener('idle', () => {
          restoreIO();
          const center = this.map && this.map.getCenter();
          if (!center || !this.geocoder) { return; }
          const lat = center.lat();
          const lng = center.lng();
          this.geocoder.geocode({ location: { lat: lat, lng: lng } }, (results: any, status: any) => {
            this.zone.run(() => {
              this.selectedLat = lat;
              this.selectedLng = lng;
              this.selectedAddress = status === 'OK' && results && results[0]
                ? results[0].formatted_address
                : lat.toFixed(5) + ', ' + lng.toFixed(5);
              this.searchText = this.selectedAddress;
            });
          });
        });

        this.zone.run(() => { this.mapReady = true; });

        if (!this.hasInitialLatLng && initialAddress) {
          this.geocoder.geocode({ address: initialAddress }, (results: any, status: any) => {
            if (status === 'OK' && results && results[0] && this.map) {
              this.map.panTo(results[0].geometry.location);
              this.map.setZoom(16);
            }
          });
        } else if (!this.hasInitialLatLng && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            position => {
              if (this.map) {
                this.map.panTo({ lat: position.coords.latitude, lng: position.coords.longitude });
              }
            },
            () => {}
          );
        }
      });
    } catch (error) {
      this.onMapFailed();
    }
  }

  private onMapPositionChanged(lat: number, lng: number) {
    this.selectedLat = lat;
    this.selectedLng = lng;
    clearTimeout(this.reverseTimeout);
    this.unsubscribe(this.reverseSubscription);
    this.reverseSubscription = null;
    this.reverseTimeout = setTimeout(() => {
      const fallback = lat.toFixed(5) + ', ' + lng.toFixed(5);
      const url = 'https://nominatim.openstreetmap.org/reverse?lat=' +
        encodeURIComponent(String(lat)) + '&lon=' + encodeURIComponent(String(lng)) + '&format=jsonv2';
      this.reverseSubscription = this.http.get<any>(url).subscribe(
        data => {
          this.zone.run(() => {
            const address = data && data.display_name ? data.display_name : fallback;
            this.selectedAddress = address;
            this.searchText = address;
          });
        },
        () => {
          this.zone.run(() => {
            this.selectedAddress = fallback;
            this.searchText = fallback;
          });
        }
      );
    }, 300);
  }

  onOsmSearch() {
    if (this.useGoogleMaps) { return; }
    const query = (this.searchText || '').trim();
    this.selectedAddress = query;
    clearTimeout(this.searchTimeout);
    this.unsubscribe(this.searchSubscription);
    this.searchSubscription = null;

    if (query.length < 3) {
      this.suggestions = [];
      this.osmSearching = false;
      return;
    }

    this.osmSearching = true;
    this.searchTimeout = setTimeout(() => {
      const postcodeMatch = query.match(/([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}|[A-Z]{1,2}\d[A-Z\d]?)\s*$/i);
      const postcode = postcodeMatch ? postcodeMatch[1].replace(/\s+/g, '') : '';
      const nominatimUrl = 'https://nominatim.openstreetmap.org/search?q=' +
        encodeURIComponent(query) + '&format=jsonv2&limit=10&addressdetails=1';
      const nominatimRequest = this.http.get<any[]>(nominatimUrl)
        .catch(() => Observable.of([]));
      const postcodeRequest = postcode
        ? this.http.get<any>('https://api.postcodes.io/postcodes/' + encodeURIComponent(postcode) + '/autocomplete')
            .catch(() => Observable.of({ result: [] }))
            .switchMap(response => {
              const codes: string[] = response && response.result
                ? response.result.slice(0, 4)
                : [];
              if (!codes.length) { return Observable.of([]); }
              return Observable.forkJoin(codes.map(code =>
                this.http.get<any>('https://api.postcodes.io/postcodes/' + encodeURIComponent(code))
                  .catch(() => Observable.of(null))
              )).map(details => details
                .filter(detail => !!(detail && detail.result))
                .map(detail => detail.result));
            })
        : Observable.of([]);

      this.searchSubscription = Observable.forkJoin([postcodeRequest, nominatimRequest]).subscribe(
        (responses: any[]) => {
          this.zone.run(() => {
            const postcodeResults = responses[0] || [];
            const places = responses[1] || [];
            const results: MapSuggestion[] = [];

            postcodeResults.forEach((result: any, index: number) => {
              const parts = [result.postcode, result.admin_ward, result.admin_district, result.region]
                .filter((part: string, partIndex: number, allParts: string[]) =>
                  !!part && allParts.indexOf(part) === partIndex);
              results.push({
                id: 'pc_' + result.postcode + '_' + index,
                label: parts.join(', '),
                lat: result.latitude,
                lng: result.longitude
              });
            });

            places.slice().sort((first: any, second: any) => {
              const firstGb = first.address &&
                String(first.address.country_code || '').toLowerCase() === 'gb' ? 0 : 1;
              const secondGb = second.address &&
                String(second.address.country_code || '').toLowerCase() === 'gb' ? 0 : 1;
              return firstGb - secondGb;
            }).slice(0, 6).forEach((place: any, index: number) => {
              results.push({
                id: 'nm_' + (place.place_id || index) + '_' + index,
                label: place.display_name,
                lat: parseFloat(place.lat),
                lng: parseFloat(place.lon)
              });
            });

            this.suggestions = results.slice(0, 8);
            this.osmSearching = false;
          });
        },
        () => {
          this.zone.run(() => {
            this.suggestions = [];
            this.osmSearching = false;
          });
        }
      );
    }, 350);
  }

  selectSuggestion(suggestion: MapSuggestion) {
    this.suggestions = [];
    this.searchText = suggestion.label;
    this.selectedAddress = suggestion.label;
    this.selectedLat = suggestion.lat;
    this.selectedLng = suggestion.lng;
    if (this.leafletMap && this.leafletMarker) {
      this.leafletMap.setView([suggestion.lat, suggestion.lng], 16);
      this.leafletMarker.setLatLng([suggestion.lat, suggestion.lng]);
    }
  }

  clearOsmSearch() {
    this.searchText = '';
    this.selectedAddress = '';
    this.suggestions = [];
    this.osmSearching = false;
    clearTimeout(this.searchTimeout);
    this.unsubscribe(this.searchSubscription);
    this.searchSubscription = null;
  }

  private onMapFailed() {
    this.zone.run(() => {
      this.mapReady = false;
      this.mapLoadFailed = true;
      this.updateEmbedUrl();
      if (!this.mapFailureNotified) {
        this.mapFailureNotified = true;
        this.commonService.toastMessage(
          'Could not load the map - enter the address manually',
          3000,
          ToastMessageType.Error
        );
      }
    });
  }

  private updateEmbedUrl() {
    const query = encodeURIComponent(this.fallbackAddress || this.selectedAddress || 'London');
    this.embedMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://maps.google.com/maps?q=' + query + '&t=&z=14&ie=UTF8&output=embed'
    );
  }

  onFallbackChange(value: string) {
    this.fallbackAddress = value;
    this.selectedAddress = value;
    clearTimeout(this.embedTimeout);
    this.embedTimeout = setTimeout(() => {
      this.zone.run(() => this.updateEmbedUrl());
    }, 800);
  }

  onSearch() {
    if (!this.useGoogleMaps || !this.geocoder || !this.searchText || !this.searchText.trim()) {
      return;
    }
    this.geocoder.geocode({ address: this.searchText.trim() }, (results: any, status: any) => {
      this.zone.run(() => {
        if (status === 'OK' && results && results[0] && this.map) {
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
    if (this.leafletMarker) {
      const position = this.leafletMarker.getLatLng();
      this.selectedLat = position.lat;
      this.selectedLng = position.lng;
    } else if (this.map) {
      const center = this.map.getCenter();
      if (center) {
        this.selectedLat = center.lat();
        this.selectedLng = center.lng();
      }
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

  private unsubscribe(subscription: Subscription) {
    if (subscription && !subscription.closed) {
      subscription.unsubscribe();
    }
  }
}
