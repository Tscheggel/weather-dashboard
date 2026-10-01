import { Component, inject } from '@angular/core';
import { WeatherService } from './services/weather';
import { WeatherCardComponent } from './weather-card/weather-card';

@Component({
  imports: [WeatherCardComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private weatherService = inject(WeatherService);
  weatherData: any = null;

  ngOnInit() {
    this.weatherService.getWeather('Nuremberg').subscribe({
      next: (data) => {
        this.weatherData = data;
      },
      error: (err) => {
        console.error('Failed to load weather data:', err);
      }
    });
  }
}
