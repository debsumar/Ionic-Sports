// import {
//   Component,
//   ViewEncapsulation,
//   ElementRef,
//   ViewChild,
//   NgZone,
// } from "@angular/core";
// import { ViewController, NavParams } from "ionic-angular";
// import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

// declare var google: any;

// const GOOGLE_MAPS_API_KEY = "AIzaSyDpcFMCrpkNA_WXypfOPcBqEgqAr6_DRbE";

// @Component({
//   selector: "map-picker-modal",
//   encapsulation: ViewEncapsulation.None,
//   template: `
//     <div class="map-modal">
//       <div class="map-search-bar">
//         <ion-icon
//           name="arrow-back"
//           class="map-back"
//           (click)="dismiss()"
//         ></ion-icon>
//         <input
//           class="map-search-input"
//           placeholder="Search a place..."
//           type="text"
//           *ngIf="mapReady || mapLoadFailed"
//           [(ngModel)]="searchQuery"
//           (ngModelChange)="onSearchInput()"
//         />
//         <span class="map-title" *ngIf="!mapReady && !mapLoadFailed"
//           >Select Location</span
//         >
//         <div class="map-suggestions" *ngIf="suggestions.length > 0">
//           <div
//             class="map-suggestion"
//             *ngFor="let s of suggestions"
//             (click)="selectSuggestion(s)"
//           >
//             <ion-icon name="pin"></ion-icon> {{ s.description }}
//           </div>
//         </div>
//       </div>

//       <!-- Live Google map -->
//       <div
//         #mapContainer
//         class="map-container"
//         [hidden]="!mapReady || mapLoadFailed"
//       ></div>
//       <div class="map-pin" *ngIf="mapReady && !mapLoadFailed">
//         <ion-icon name="pin"></ion-icon>
//       </div>

//       <!-- Loading state while the Maps script finishes loading -->
//       <div class="map-state" *ngIf="!mapReady && !mapLoadFailed">
//         <ion-spinner name="crescent"></ion-spinner>
//         <p>Loading map...</p>
//       </div>

//       <!-- Fallback: embedded map (no JS API needed) + editable address -->
//       <div class="map-fallback" *ngIf="mapLoadFailed">
//         <div class="map-embed-wrapper">
//           <iframe
//             [src]="embedMapUrl"
//             width="100%"
//             height="100%"
//             style="border:0;"
//             allowfullscreen
//             loading="lazy"
//             referrerpolicy="no-referrer-when-downgrade"
//           ></iframe>
//         </div>
//         <div class="fallback-field">
//           <label>Selected address (search above or edit here)</label>
//           <input
//             class="map-search-input"
//             type="text"
//             placeholder="Enter full address..."
//             [ngModel]="fallbackAddress"
//             (ngModelChange)="onFallbackChange($event)"
//           />
//         </div>
//       </div>

//       <div class="map-footer">
//         <div class="map-address">
//           {{ selectedAddress || "Move map to select location" }}
//         </div>
//         <button
//           class="map-confirm-btn"
//           (click)="confirm()"
//           [disabled]="!selectedAddress"
//         >
//           Confirm Location
//         </button>
//       </div>
//     </div>
//   `,
//   styles: [
//     `
//       .map-modal {
//         position: fixed;
//         top: 0;
//         left: 0;
//         right: 0;
//         bottom: 0;
//         display: flex;
//         flex-direction: column;
//         background: #0f172a;
//         z-index: 10000;
//       }
//       .map-search-bar {
//         position: absolute;
//         top: 0;
//         left: 0;
//         right: 0;
//         z-index: 2;
//         display: flex;
//         align-items: center;
//         gap: 8px;
//         padding: 12px;
//         padding-top: calc(env(safe-area-inset-top, 20px) + 12px);
//         background: rgba(15, 23, 42, 0.7);
//         backdrop-filter: blur(16px);
//         -webkit-backdrop-filter: blur(16px);
//       }
//       .map-back {
//         font-size: 24px;
//         color: #fff;
//         cursor: pointer;
//         flex-shrink: 0;
//       }
//       .map-title {
//         flex: 1;
//         color: #fff;
//         font-size: 16px;
//         font-weight: 600;
//       }
//       .map-search-input {
//         flex: 1;
//         height: 40px;
//         border-radius: 8px;
//         border: 1px solid rgba(255, 255, 255, 0.15);
//         background: rgba(255, 255, 255, 0.1);
//         color: #fff;
//         padding: 0 12px;
//         font-size: 14px;
//         outline: none;
//       }
//       .map-search-input::placeholder {
//         color: rgba(255, 255, 255, 0.5);
//       }
//       .map-suggestions {
//         position: absolute;
//         top: 100%;
//         left: 0;
//         right: 0;
//         background: rgba(15, 23, 42, 0.95);
//         backdrop-filter: blur(16px);
//         -webkit-backdrop-filter: blur(16px);
//         max-height: 200px;
//         overflow-y: auto;
//         z-index: 3;
//       }
//       .map-suggestion {
//         padding: 12px 16px;
//         color: #f1f5f9;
//         font-size: 13px;
//         display: flex;
//         align-items: center;
//         gap: 8px;
//         cursor: pointer;
//         border-bottom: 1px solid rgba(255, 255, 255, 0.05);
//       }
//       .map-suggestion:active {
//         background: rgba(255, 255, 255, 0.1);
//       }
//       .map-suggestion ion-icon {
//         color: #3fbcd3;
//         font-size: 14px;
//         flex-shrink: 0;
//       }
//       .map-search-bar {
//         position: relative;
//       }
//       .map-container {
//         flex: 1;
//       }
//       .map-pin {
//         position: absolute;
//         top: 50%;
//         left: 50%;
//         transform: translate(-50%, -100%);
//         z-index: 1;
//         pointer-events: none;
//         ion-icon {
//           font-size: 36px;
//           color: #ef4444;
//           filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
//         }
//       }
//       .map-state {
//         flex: 1;
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//         justify-content: center;
//         gap: 12px;
//         color: #f1f5f9;
//         p {
//           font-size: 14px;
//           margin: 0;
//           opacity: 0.8;
//         }
//         ion-spinner {
//           width: 36px;
//           height: 36px;
//         }
//       }
//       .map-fallback {
//         flex: 1;
//         display: flex;
//         flex-direction: column;
//         overflow: hidden;
//         padding-top: calc(env(safe-area-inset-top, 20px) + 64px);
//       }
//       .map-embed-wrapper {
//         flex: 1;
//         min-height: 200px;
//       }
//       .map-embed-wrapper iframe {
//         width: 100%;
//         height: 100%;
//       }
//       .fallback-field {
//         padding: 12px 16px;
//         background: rgba(15, 23, 42, 0.85);
//         label {
//           display: block;
//           font-size: 12px;
//           font-weight: 600;
//           color: #94a3b8;
//           margin-bottom: 6px;
//         }
//       }
//       .map-footer {
//         position: absolute;
//         bottom: 0;
//         left: 0;
//         right: 0;
//         z-index: 2;
//         padding: 16px;
//         padding-bottom: calc(env(safe-area-inset-bottom, 16px) + 16px);
//         background: rgba(15, 23, 42, 0.7);
//         backdrop-filter: blur(16px);
//         -webkit-backdrop-filter: blur(16px);
//       }
//       .map-address {
//         font-size: 13px;
//         color: #f1f5f9;
//         margin-bottom: 10px;
//         line-height: 1.4;
//         min-height: 18px;
//         overflow: hidden;
//         text-overflow: ellipsis;
//         white-space: nowrap;
//       }
//       .map-confirm-btn {
//         width: 100%;
//         height: 44px;
//         border: none;
//         border-radius: 8px;
//         background: linear-gradient(
//           135deg,
//           rgba(43, 146, 187, 0.85),
//           rgba(53, 173, 255, 0.75)
//         );
//         backdrop-filter: blur(20px);
//         -webkit-backdrop-filter: blur(20px);
//         border: 1px solid rgba(255, 255, 255, 0.2);
//         color: #fff;
//         font-size: 15px;
//         font-weight: 700;
//         letter-spacing: 0.3px;
//         cursor: pointer;
//       }
//       .map-confirm-btn:disabled {
//         opacity: 0.4;
//       }

//       .light-theme .map-search-bar,
//       .light-theme .map-footer,
//       .light-theme .fallback-field {
//         background: rgba(248, 250, 252, 0.7);
//       }
//       .light-theme .map-back,
//       .light-theme .map-title {
//         color: #1e293b;
//       }
//       .light-theme .map-search-input {
//         background: rgba(0, 0, 0, 0.05);
//         border-color: rgba(0, 0, 0, 0.1);
//         color: #1e293b;
//       }
//       .light-theme .map-search-input::placeholder {
//         color: rgba(0, 0, 0, 0.4);
//       }
//       .light-theme .map-address,
//       .light-theme .map-state {
//         color: #1e293b;
//       }
//     `,
//   ],
// })
// export class MapPickerModalComponent {
//   @ViewChild("mapContainer") mapEl: ElementRef;

//   map: any;
//   geocoder: any;
//   selectedAddress: string = "";
//   selectedLat: number = 0;
//   selectedLng: number = 0;
//   suggestions: any[] = [];
//   searchTimeout: any;
//   searchQuery: string = "";

//   // Resilient-load state (mirrors web app behaviour)
//   mapReady: boolean = false;
//   mapLoadFailed: boolean = false;
//   fallbackAddress: string = "";
//   private embedAddress: string = "";
//   private embedTimeout: any;

//   constructor(
//     private viewCtrl: ViewController,
//     private navParams: NavParams,
//     private zone: NgZone,
//     private sanitizer: DomSanitizer,
//   ) {}

//   // Cached so the bound iframe [src] is a STABLE reference. Returning a new
//   // SafeResourceUrl on every change-detection cycle makes the iframe reload
//   // continuously (screen "blinking"), so we only recompute when the address changes.
//   embedMapUrl: SafeResourceUrl;

//   private updateEmbedUrl() {
//     const q = encodeURIComponent(
//       this.embedAddress || this.fallbackAddress || "London",
//     );
//     this.embedMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
//       `https://maps.google.com/maps?q=${q}&t=&z=14&ie=UTF8&output=embed`,
//     );
//   }

//   ionViewDidLoad() {
//     const initialAddress = this.navParams.get("initialAddress") || "";
//     this.selectedAddress = initialAddress;
//     this.fallbackAddress = initialAddress;
//     this.embedAddress = initialAddress;
//     this.updateEmbedUrl();

//     // Google invokes this global when the API key is invalid/disabled.
//     (window as any).gm_authFailure = () => {
//       this.zone.run(() => {
//         this.mapReady = false;
//         this.mapLoadFailed = true;
//         this.updateEmbedUrl();
//       });
//     };

//     this.loadGoogleMaps()
//       .then(() => {
//         this.zone.run(() => {
//           this.mapReady = true;
//         });
//         // Wait a tick so the (previously hidden) map container has dimensions.
//         setTimeout(() => this.initMap(), 50);
//       })
//       .catch(() => {
//         this.zone.run(() => {
//           this.mapLoadFailed = true;
//           this.updateEmbedUrl();
//         });
//       });
//   }

//   /**
//    * Resolves once the Google Maps JS API is available. The script is loaded
//    * `async defer` in index.html, so it may not be ready when the modal opens.
//    * Polls for up to 6s, then rejects to trigger the iframe fallback.
//    */
//   private loadGoogleMaps(): Promise<void> {
//     if (typeof google !== "undefined" && google.maps && google.maps.Geocoder) {
//       return Promise.resolve();
//     }
//     return new Promise<void>((resolve, reject) => {
//       let waited = 0;
//       const interval = setInterval(() => {
//         if (
//           typeof google !== "undefined" &&
//           google.maps &&
//           google.maps.Geocoder
//         ) {
//           clearInterval(interval);
//           resolve();
//         } else if ((waited += 200) >= 6000) {
//           clearInterval(interval);
//           reject();
//         }
//       }, 200);
//     });
//   }

//   initMap() {
//     if (!this.mapEl || !this.mapEl.nativeElement) {
//       return;
//     }
//     const center = { lat: 51.5074, lng: -0.1278 };

//     // IMPORTANT: create the map OUTSIDE the Angular zone. zone.js 0.8.26 patches
//     // ResizeObserver in a way that is incompatible with the modern Google Maps
//     // renderer, throwing "parameter 1 is not of type 'Element'" when the map is
//     // constructed inside the zone. We re-enter the zone only to update UI state.
//     this.zone.runOutsideAngular(() => {
//       this.map = new google.maps.Map(this.mapEl.nativeElement, {
//         center,
//         zoom: 14,
//         disableDefaultUI: true,
//         zoomControl: true,
//         styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
//       });

//       this.geocoder = new google.maps.Geocoder();

//       // Reverse geocode on map idle
//       this.map.addListener("idle", () => {
//         const c = this.map.getCenter();
//         this.selectedLat = c.lat();
//         this.selectedLng = c.lng();
//         this.geocoder.geocode(
//           { location: { lat: this.selectedLat, lng: this.selectedLng } },
//           (results, status) => {
//             this.zone.run(() => {
//               if (status === "OK" && results[0]) {
//                 this.selectedAddress = results[0].formatted_address;
//               } else {
//                 this.selectedAddress =
//                   this.selectedLat.toFixed(5) +
//                   ", " +
//                   this.selectedLng.toFixed(5);
//               }
//             });
//           },
//         );
//       });

//       // Center on initial lat/lng if provided, else address, else geolocation
//       const initialLat = this.navParams.get("initialLat");
//       const initialLng = this.navParams.get("initialLng");
//       const initialAddress = this.navParams.get("initialAddress");
//       if (initialLat && initialLng) {
//         this.map.panTo({ lat: initialLat, lng: initialLng });
//         this.map.setZoom(16);
//       } else if (initialAddress) {
//         this.geocoder.geocode(
//           { address: initialAddress },
//           (results, status) => {
//             if (status === "OK" && results[0]) {
//               this.map.panTo(results[0].geometry.location);
//               this.map.setZoom(16);
//             }
//           },
//         );
//       } else if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           (pos) =>
//             this.map.panTo({
//               lat: pos.coords.latitude,
//               lng: pos.coords.longitude,
//             }),
//           () => {},
//         );
//       }
//     });
//   }

//   onSearchInput() {
//     const query = this.searchQuery;
//     if (this.searchTimeout) clearTimeout(this.searchTimeout);
//     if (!query || query.length < 3) {
//       this.suggestions = [];
//       return;
//     }

//     this.searchTimeout = setTimeout(() => {
//       const url = `https://places.googleapis.com/v1/places:autocomplete`;
//       fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
//         },
//         body: JSON.stringify({ input: query }),
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           this.zone.run(() => {
//             this.suggestions = (data.suggestions || []).map((s) => ({
//               description:
//                 s.placePrediction &&
//                 s.placePrediction.text &&
//                 s.placePrediction.text.text
//                   ? s.placePrediction.text.text
//                   : "",
//               place_id:
//                 s.placePrediction && s.placePrediction.placeId
//                   ? s.placePrediction.placeId
//                   : "",
//             }));
//           });
//         })
//         .catch(() => {
//           this.zone.run(() => {
//             this.suggestions = [];
//           });
//         });
//     }, 300);
//   }

//   selectSuggestion(suggestion: any) {
//     this.suggestions = [];
//     this.searchQuery = suggestion.description;
//     // Optimistically reflect the chosen place as the selected address so the
//     // Confirm button is enabled even before the details request resolves.
//     this.selectedAddress = suggestion.description;
//     this.fallbackAddress = suggestion.description;

//     // Get place details (coordinates) via the Places API (New).
//     fetch(`https://places.googleapis.com/v1/places/${suggestion.place_id}`, {
//       headers: {
//         "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
//         "X-Goog-FieldMask": "location",
//       },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         this.zone.run(() => {
//           if (data.location) {
//             this.selectedLat = data.location.latitude;
//             this.selectedLng = data.location.longitude;
//             if (this.map) {
//               // Live map: pan there; the 'idle' listener refines selectedAddress.
//               this.map.panTo({ lat: this.selectedLat, lng: this.selectedLng });
//               this.map.setZoom(16);
//             }
//           }
//           // Fallback embed: move the iframe to the chosen place.
//           this.embedAddress = suggestion.description;
//           this.updateEmbedUrl();
//         });
//       })
//       .catch(() => {
//         this.zone.run(() => {
//           this.embedAddress = suggestion.description;
//           this.updateEmbedUrl();
//         });
//       });
//   }

//   searchPlace() {
//     this.suggestions = [];
//   }

//   onFallbackChange(value: string) {
//     this.fallbackAddress = value;
//     this.selectedAddress = value;
//     // Debounce reloading the embedded iframe to avoid a reload on every keystroke.
//     clearTimeout(this.embedTimeout);
//     this.embedTimeout = setTimeout(() => {
//       this.zone.run(() => {
//         this.embedAddress = value;
//         this.updateEmbedUrl();
//       });
//     }, 800);
//   }

//   confirm() {
//     this.viewCtrl.dismiss({
//       address: this.selectedAddress,
//       lat: this.selectedLat,
//       lng: this.selectedLng,
//     });
//   }

//   dismiss() {
//     this.viewCtrl.dismiss(null);
//   }
// }



import { Component, ViewEncapsulation, ElementRef, ViewChild, NgZone } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

declare var google: any;

const GOOGLE_MAPS_API_KEY = 'AIzaSyDpcFMCrpkNA_WXypfOPcBqEgqAr6_DRbE';

@Component({
  selector: 'map-picker-modal',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="map-modal">
      <div class="map-search-bar">
        <ion-icon name="arrow-back" class="map-back" (click)="dismiss()"></ion-icon>
        <input class="map-search-input" placeholder="Search a place..." type="text"
          *ngIf="mapReady || mapLoadFailed"
          [(ngModel)]="searchQuery" (ngModelChange)="onSearchInput()">
        <span class="map-title" *ngIf="!mapReady && !mapLoadFailed">Select Location</span>
        <div class="map-suggestions" *ngIf="suggestions.length > 0">
          <div class="map-suggestion" *ngFor="let s of suggestions" (click)="selectSuggestion(s)">
            <ion-icon name="pin"></ion-icon> {{ s.description }}
          </div>
        </div>
      </div>

      <!-- Live Google map -->
      <div #mapContainer class="map-container" [hidden]="!mapReady || mapLoadFailed"></div>
      <div class="map-pin" *ngIf="mapReady && !mapLoadFailed">
        <ion-icon name="pin"></ion-icon>
      </div>

      <!-- Loading state while the Maps script finishes loading -->
      <div class="map-state" *ngIf="!mapReady && !mapLoadFailed">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading map...</p>
      </div>

      <!-- Fallback: embedded map (no JS API needed) + editable address -->
      <div class="map-fallback" *ngIf="mapLoadFailed">
        <div class="map-embed-wrapper">
          <iframe [src]="embedMapUrl" width="100%" height="100%" style="border:0;" allowfullscreen
            loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <div class="fallback-field">
          <label>Selected address (search above or edit here)</label>
          <input class="map-search-input" type="text" placeholder="Enter full address..."
            [ngModel]="fallbackAddress" (ngModelChange)="onFallbackChange($event)">
        </div>
      </div>

      <div class="map-footer">
        <div class="map-address">{{ selectedAddress || 'Move map to select location' }}</div>
        <button class="map-confirm-btn" (click)="confirm()" [disabled]="!selectedAddress">Confirm Location</button>
      </div>
    </div>
  `,
  styles: [`
    .map-modal {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; flex-direction: column; background: #0f172a; z-index: 10000;
    }
    .map-search-bar {
      position: absolute; top: 0; left: 0; right: 0; z-index: 2;
      display: flex; align-items: center; gap: 8px;
      padding: 12px; padding-top: calc(env(safe-area-inset-top, 20px) + 12px);
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    }
    .map-back { font-size: 24px; color: #fff; cursor: pointer; flex-shrink: 0; }
    .map-title { flex: 1; color: #fff; font-size: 16px; font-weight: 600; }
    .map-search-input {
      flex: 1; height: 40px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.1); color: #fff; padding: 0 12px;
      font-size: 14px; outline: none;
    }
    .map-search-input::placeholder { color: rgba(255,255,255,0.5); }
    .map-suggestions {
      position: absolute; top: 100%; left: 0; right: 0;
      background: rgba(15,23,42,0.95); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      max-height: 200px; overflow-y: auto; z-index: 3;
    }
    .map-suggestion {
      padding: 12px 16px; color: #f1f5f9; font-size: 13px;
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .map-suggestion:active { background: rgba(255,255,255,0.1); }
    .map-suggestion ion-icon { color: #3fbcd3; font-size: 14px; flex-shrink: 0; }
    .map-search-bar { position: relative; }
    .map-container { flex: 1; }
    .map-pin {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -100%);
      z-index: 1; pointer-events: none;
      ion-icon { font-size: 36px; color: #ef4444; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
    }
    .map-state {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 12px; color: #f1f5f9;
      p { font-size: 14px; margin: 0; opacity: 0.8; }
      ion-spinner { width: 36px; height: 36px; }
    }
    .map-fallback {
      flex: 1; display: flex; flex-direction: column; overflow: hidden;
      padding-top: calc(env(safe-area-inset-top, 20px) + 64px);
    }
    .map-embed-wrapper { flex: 1; min-height: 200px; }
    .map-embed-wrapper iframe { width: 100%; height: 100%; }
    .fallback-field {
      padding: 12px 16px; background: rgba(15,23,42,0.85);
      label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 6px; }
    }
    .map-footer {
      position: absolute; bottom: 0; left: 0; right: 0; z-index: 2;
      padding: 16px; padding-bottom: calc(env(safe-area-inset-bottom, 16px) + 16px);
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    }
    .map-address {
      font-size: 13px; color: #f1f5f9; margin-bottom: 10px;
      line-height: 1.4; min-height: 18px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .map-confirm-btn {
      width: 100%; height: 44px; border: none; border-radius: 8px;
      background: linear-gradient(135deg, rgba(43,146,187,0.85), rgba(53,173,255,0.75));
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff; font-size: 15px; font-weight: 700; letter-spacing: 0.3px; cursor: pointer;
    }
    .map-confirm-btn:disabled { opacity: 0.4; }

    .light-theme .map-search-bar, .light-theme .map-footer, .light-theme .fallback-field {
      background: rgba(248,250,252,0.7);
    }
    .light-theme .map-back, .light-theme .map-title { color: #1e293b; }
    .light-theme .map-search-input {
      background: rgba(0,0,0,0.05); border-color: rgba(0,0,0,0.1); color: #1e293b;
    }
    .light-theme .map-search-input::placeholder { color: rgba(0,0,0,0.4); }
    .light-theme .map-address, .light-theme .map-state { color: #1e293b; }
  `]
})
export class MapPickerModalComponent {
  @ViewChild('mapContainer') mapEl: ElementRef;

  map: any;
  geocoder: any;
  selectedAddress: string = '';
  selectedLat: number = 0;
  selectedLng: number = 0;
  suggestions: any[] = [];
  searchTimeout: any;
  searchQuery: string = '';

  // Resilient-load state (mirrors web app behaviour)
  mapReady: boolean = false;
  mapLoadFailed: boolean = false;
  fallbackAddress: string = '';
  private embedAddress: string = '';
  private embedTimeout: any;

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private zone: NgZone,
    private sanitizer: DomSanitizer
  ) {}

  // Cached so the bound iframe [src] is a STABLE reference. Returning a new
  // SafeResourceUrl on every change-detection cycle makes the iframe reload
  // continuously (screen "blinking"), so we only recompute when the address changes.
  embedMapUrl: SafeResourceUrl;

  private updateEmbedUrl() {
    const q = encodeURIComponent(this.embedAddress || this.fallbackAddress || 'London');
    this.embedMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${q}&t=&z=14&ie=UTF8&output=embed`
    );
  }

  ionViewDidLoad() {
    const initialAddress = this.navParams.get('initialAddress') || '';
    this.selectedAddress = initialAddress;
    this.fallbackAddress = initialAddress;
    this.embedAddress = initialAddress;
    this.updateEmbedUrl();

    // Google invokes this global when the API key is invalid/disabled.
    (window as any).gm_authFailure = () => {
      this.zone.run(() => { this.mapReady = false; this.mapLoadFailed = true; this.updateEmbedUrl(); });
    };

    this.loadGoogleMaps()
      .then(() => {
        this.zone.run(() => { this.mapReady = true; });
        // Wait a tick so the (previously hidden) map container has dimensions.
        setTimeout(() => this.initMap(), 50);
      })
      .catch(() => {
        this.zone.run(() => { this.mapLoadFailed = true; this.updateEmbedUrl(); });
      });
  }

  /**
   * Resolves once the Google Maps JS API is available. The script is loaded
   * `async defer` in index.html, so it may not be ready when the modal opens.
   * Polls for up to 6s, then rejects to trigger the iframe fallback.
   */
  private loadGoogleMaps(): Promise<void> {
    if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      let waited = 0;
      const interval = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
          clearInterval(interval);
          resolve();
        } else if ((waited += 200) >= 6000) {
          clearInterval(interval);
          reject();
        }
      }, 200);
    });
  }

  initMap() {
    if (!this.mapEl || !this.mapEl.nativeElement) { return; }
    const center = { lat: 51.5074, lng: -0.1278 };

    // IMPORTANT: create the map OUTSIDE the Angular zone. zone.js 0.8.26 patches
    // ResizeObserver in a way that is incompatible with the modern Google Maps
    // renderer, throwing "parameter 1 is not of type 'Element'" when the map is
    // constructed inside the zone. We re-enter the zone only to update UI state.
    this.zone.runOutsideAngular(() => {
      this.map = new google.maps.Map(this.mapEl.nativeElement, {
        center, zoom: 14,
        disableDefaultUI: true, zoomControl: true,
        styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }]
      });

      this.geocoder = new google.maps.Geocoder();

      // Reverse geocode on map idle
      this.map.addListener('idle', () => {
        const c = this.map.getCenter();
        this.selectedLat = c.lat();
        this.selectedLng = c.lng();
        this.geocoder.geocode({ location: { lat: this.selectedLat, lng: this.selectedLng } }, (results, status) => {
          this.zone.run(() => {
            if (status === 'OK' && results[0]) {
              this.selectedAddress = results[0].formatted_address;
            } else {
              this.selectedAddress = this.selectedLat.toFixed(5) + ', ' + this.selectedLng.toFixed(5);
            }
          });
        });
      });

      // Center on initial lat/lng if provided, else address, else geolocation
      const initialLat = this.navParams.get('initialLat');
      const initialLng = this.navParams.get('initialLng');
      const initialAddress = this.navParams.get('initialAddress');
      if (initialLat && initialLng) {
        this.map.panTo({ lat: initialLat, lng: initialLng });
        this.map.setZoom(16);
      } else if (initialAddress) {
        this.geocoder.geocode({ address: initialAddress }, (results, status) => {
          if (status === 'OK' && results[0]) {
            this.map.panTo(results[0].geometry.location);
            this.map.setZoom(16);
          }
        });
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => this.map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => {}
        );
      }
    });
  }

  onSearchInput() {
    const query = this.searchQuery;
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    if (!query || query.length < 3) { this.suggestions = []; return; }

    this.searchTimeout = setTimeout(() => {
      const url = `https://places.googleapis.com/v1/places:autocomplete`;
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY
        },
        body: JSON.stringify({ input: query })
      })
      .then(res => res.json())
      .then(data => {
        this.zone.run(() => {
          this.suggestions = (data.suggestions || []).map(s => ({
            description: (s.placePrediction && s.placePrediction.text && s.placePrediction.text.text) ? s.placePrediction.text.text : '',
            place_id: (s.placePrediction && s.placePrediction.placeId) ? s.placePrediction.placeId : ''
          }));
        });
      })
      .catch(() => { this.zone.run(() => { this.suggestions = []; }); });
    }, 300);
  }

  selectSuggestion(suggestion: any) {
    this.suggestions = [];
    this.searchQuery = suggestion.description;
    // Optimistically reflect the chosen place as the selected address so the
    // Confirm button is enabled even before the details request resolves.
    this.selectedAddress = suggestion.description;
    this.fallbackAddress = suggestion.description;

    // Get place details (coordinates) via the Places API (New).
    fetch(`https://places.googleapis.com/v1/places/${suggestion.place_id}`, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'location'
      }
    })
    .then(res => res.json())
    .then(data => {
      this.zone.run(() => {
        if (data.location) {
          this.selectedLat = data.location.latitude;
          this.selectedLng = data.location.longitude;
          if (this.map) {
            // Live map: pan there; the 'idle' listener refines selectedAddress.
            this.map.panTo({ lat: this.selectedLat, lng: this.selectedLng });
            this.map.setZoom(16);
          }
        }
        // Fallback embed: move the iframe to the chosen place.
        this.embedAddress = suggestion.description;
        this.updateEmbedUrl();
      });
    })
    .catch(() => {
      this.zone.run(() => {
        this.embedAddress = suggestion.description;
        this.updateEmbedUrl();
      });
    });
  }

  searchPlace() {
    this.suggestions = [];
  }

  onFallbackChange(value: string) {
    this.fallbackAddress = value;
    this.selectedAddress = value;
    // Debounce reloading the embedded iframe to avoid a reload on every keystroke.
    clearTimeout(this.embedTimeout);
    this.embedTimeout = setTimeout(() => {
      this.zone.run(() => { this.embedAddress = value; this.updateEmbedUrl(); });
    }, 800);
  }

  confirm() {
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
