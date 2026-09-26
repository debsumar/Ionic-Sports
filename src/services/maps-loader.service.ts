import { Injectable } from '@angular/core';
import { environment as devEnvironment } from '../environments/environment';
import { environment as prodEnvironment } from '../environments/environment.prod';

const environment = prodEnvironment.production ? prodEnvironment : devEnvironment;

@Injectable()
export class MapsLoaderService {
  private leafletPromise: Promise<void> = null;
  private googleMapsPromise: Promise<void> = null;

  loadLeaflet(): Promise<void> {
    if ((window as any).L) {
      return Promise.resolve();
    }
    if (this.leafletPromise) {
      return this.leafletPromise;
    }

    this.leafletPromise = new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: any) => {
        if (settled) { return; }
        settled = true;
        clearTimeout(timeout);
        error ? reject(error) : resolve();
      };

      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      stylesheet.onerror = () => finish(new Error('Leaflet stylesheet failed to load'));
      document.head.appendChild(stylesheet);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        if ((window as any).L) {
          finish();
        } else {
          finish(new Error('Leaflet was not available after script load'));
        }
      };
      script.onerror = () => finish(new Error('Leaflet script failed to load'));
      document.head.appendChild(script);

      const timeout = setTimeout(
        () => finish(new Error('Leaflet loading timed out')),
        12000
      );
    });

    return this.leafletPromise;
  }

  loadGoogleMaps(): Promise<void> {
    if (this.isGoogleReady()) {
      return Promise.resolve();
    }
    if (this.googleMapsPromise) {
      return this.googleMapsPromise;
    }

    this.googleMapsPromise = new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: any) => {
        if (settled) { return; }
        settled = true;
        clearTimeout(timeout);
        error ? reject(error) : resolve();
      };

      (window as any).gm_authFailure = () => {
        finish(new Error('Google Maps authentication failed'));
      };

      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' +
        encodeURIComponent(environment.google.mapsApiKey) + '&libraries=places';
      script.async = true;
      script.onload = () => {
        if (this.isGoogleReady()) {
          finish();
        } else {
          finish(new Error('Google Maps was not available after script load'));
        }
      };
      script.onerror = () => finish(new Error('Google Maps script failed to load'));
      document.head.appendChild(script);

      const timeout = setTimeout(
        () => finish(new Error('Google Maps loading timed out')),
        10000
      );
    });

    return this.googleMapsPromise;
  }

  isGoogleReady(): boolean {
    const googleApi = (window as any).google;
    return !!(googleApi && googleApi.maps && googleApi.maps.Geocoder);
  }
}
