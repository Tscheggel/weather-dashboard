import { Component, inject, signal, OnInit } from '@angular/core';
import { WeatherService } from './services/weather';
import type { WeatherResponse } from './services/weather';
import { WeatherCardComponent } from './weather-card/weather-card';
import { CityMapComponent } from './city-map/city-map';
import { Subscription } from 'rxjs';

@Component({
  imports: [WeatherCardComponent, CityMapComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private weatherService = inject(WeatherService);
  weatherData = signal<WeatherResponse | null>(null);
  selectedCity = signal<string | null>(null);
  weatherError = signal<string | null>(null);
  private weatherLookup?: Subscription;

  ngOnInit() {
    this.fetchWeather('Nuremberg');
  }

  fetchWeather(city: string) {
    const requestedCity = city.trim();
    if (!requestedCity) return;

    this.weatherLookup?.unsubscribe();
    this.selectedCity.set(requestedCity);
    this.weatherData.set(null);
    this.weatherError.set(null);
    this.weatherLookup = this.weatherService.getWeather(requestedCity).subscribe({
      next: (data) => {
        this.weatherData.set(data);
      },
      error: (err: unknown) => {
        console.error('Error by loading weather data:', err);
        this.weatherError.set(`Could not load weather for ${requestedCity}. Please try another city.`);
      },
    });
  }

  selectMapCity(city: string, input: HTMLInputElement): void {
    input.value = city;
    this.fetchWeather(city);
  }
}