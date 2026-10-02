import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HourlyForecast {
  time: string;
  temp: number;
  rain_chance: number;
}

export interface DailyForecast {
  date: string;
  max_temp: number;
  min_temp: number;
  hourly: HourlyForecast[];
}

export interface WeatherResponse {
  location: {
    city: string;
    country: string;
    timezone: string;
  };
  current: {
    temperature: number;
    description: string;
    kind: string;
    humidity: number | null;
    wind_speed: number | null;
  };
  forecast: DailyForecast[];
}

export interface MapLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api';

  getWeather(city: string): Observable<WeatherResponse> {
    return this.http.get<WeatherResponse>(`${this.apiUrl}/weather/${encodeURIComponent(city.trim())}`);
  }

  geocodeCity(city: string): Observable<MapLocation> {
    return this.http.get<MapLocation>(`${this.apiUrl}/geocode`, {
      params: { city: city.trim() },
    });
  }

  reverseGeocode(latitude: number, longitude: number): Observable<MapLocation> {
    return this.http.get<MapLocation>(`${this.apiUrl}/reverse-geocode`, {
      params: { latitude, longitude },
    });
  }
}