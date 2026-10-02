import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { WeatherService } from '../services/weather';
import type { MapLocation, WeatherResponse } from '../services/weather';
import { Subscription } from 'rxjs';

interface LeafletMap {
  setView(center: [number, number], zoom: number): LeafletMap;
  on(event: 'click', handler: (event: { latlng: { lat: number; lng: number } }) => void): LeafletMap;
  remove(): void;
}

interface LeafletMarker {
  addTo(map: LeafletMap): LeafletMarker;
  setLatLng(position: [number, number]): LeafletMarker;
  bindPopup(content: string): LeafletMarker;
  openPopup(): LeafletMarker;
}

interface LeafletApi {
  map(element: HTMLElement, options: { scrollWheelZoom: boolean }): LeafletMap;
  tileLayer(url: string, options: { attribution: string; maxZoom: number }): { addTo(map: LeafletMap): void };
  marker(position: [number, number]): LeafletMarker;
}

declare global {
  interface Window {
    L?: LeafletApi;
  }
}

@Component({
  selector: 'app-city-map',
  standalone: true,
  templateUrl: './city-map.html',
})
export class CityMapComponent implements OnChanges, OnDestroy {
  @Input() city: string | null = null;
  @Input() weatherData: WeatherResponse | null = null;
  @Output() citySelected = new EventEmitter<string>();
  @ViewChild('mapElement') private mapElement?: ElementRef<HTMLDivElement>;

  readonly message = { text: 'Loading map…', error: false };
  private readonly weatherService = inject(WeatherService);
  private map?: LeafletMap;
  private marker?: LeafletMarker;
  private cityLookup?: Subscription;
  private reverseLookup?: Subscription;
  private lastResolvedCity: string | null = null;
  private destroyed = false;

  constructor() {
    afterNextRender(() => this.initializeMap());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['city'] && this.city && this.city !== this.lastResolvedCity && this.map) {
      this.showCity(this.city);
    }
    if (changes['weatherData'] && this.weatherData) {
      this.setMessage(`Weather loaded for ${this.weatherData.location.city}. Click another location to change the weather.`);
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.cityLookup?.unsubscribe();
    this.reverseLookup?.unsubscribe();
    this.map?.remove();
  }

  private initializeMap(): void {
    const element = this.mapElement?.nativeElement;
    if (!element) {
      this.setMessage('The map could not be loaded. Check your connection and try again.', true);
      return;
    }

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        if (!this.destroyed) this.createMap(element);
      };
      script.onerror = () => this.setMessage('The map could not be loaded. Check your connection and try again.', true);
      document.head.append(script);
      return;
    }

    this.createMap(element);
  }

  private createMap(element: HTMLDivElement): void {
    const leaflet = window.L;
    if (!leaflet) {
      this.setMessage('The map could not be loaded. Check your connection and try again.', true);
      return;
    }

    this.map = leaflet.map(element, { scrollWheelZoom: false }).setView([20, 0], 2);
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);
    this.map.on('click', (event) => this.selectCoordinates(event.latlng.lat, event.latlng.lng));
    this.setMessage('Click the map to find a city.');
    if (this.city) this.showCity(this.city);
  }

  private showCity(city: string): void {
    this.cityLookup?.unsubscribe();
    this.cityLookup = this.weatherService.geocodeCity(city).subscribe({
      next: (location) => {
        if (!this.map) return;
        this.lastResolvedCity = location.city;
        this.map.setView([location.latitude, location.longitude], 10);
        this.setMarker(location);
        this.setMessage(`Showing ${location.city}${location.country ? `, ${location.country}` : ''}. Click another location to change the weather.`);
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.setMessage(`Could not find ${city} on the map.`, true);
        } else {
          this.setMessage('The location service is temporarily unavailable. Please try again.', true);
        }
      },
    });
  }

  private selectCoordinates(latitude: number, longitude: number): void {
    if (this.reverseLookup && !this.reverseLookup.closed) return;
    this.setMessage('Finding the nearest city…');
    this.reverseLookup = this.weatherService.reverseGeocode(latitude, longitude).subscribe({
      next: (location) => {
        this.lastResolvedCity = location.city;
        this.setMarker(location);
        this.setMessage(`Loading weather for ${location.city}${location.country ? `, ${location.country}` : ''}…`);
        this.citySelected.emit(location.city);
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.setMessage('No city found there. Try clicking on a nearby populated area.', true);
        } else {
          this.setMessage('The location service is temporarily unavailable. Please try again.', true);
        }
      },
    });
  }

  private setMarker(location: MapLocation): void {
    if (!this.map || !window.L) return;
    const position: [number, number] = [location.latitude, location.longitude];
    if (this.marker) {
      this.marker.setLatLng(position);
    } else {
      this.marker = window.L.marker(position).addTo(this.map);
    }
    this.marker.bindPopup(`${location.city}${location.country ? `, ${location.country}` : ''}`).openPopup();
  }

  private setMessage(text: string, error = false): void {
    this.message.text = text;
    this.message.error = error;
  }
}
