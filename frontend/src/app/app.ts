import { Component, inject, signal, OnInit } from '@angular/core';
import { WeatherService } from './services/weather';
import { WeatherCardComponent } from './weather-card/weather-card';

@Component({
  imports: [WeatherCardComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private weatherService = inject(WeatherService);
  weatherData = signal<any>(null);

  ngOnInit() {
    this.fetchWeather('Nuremberg');
  }

  fetchWeather(city: string) {
    if (!city.trim()) return;

    this.weatherService.getWeather(city).subscribe({
      next: (data) => {
        this.weatherData.set(data);
      },
      error: (err) => console.error('Error by loading weather data:', err),
    });
  }
}