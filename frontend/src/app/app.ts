import { Component, inject } from '@angular/core';
import { WeatherService } from './services/weather';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private weatherService = inject(WeatherService);
  weatherData: any = null;

  ngOnInit() {
    this.weatherService.getWeather('Munich').subscribe({
      next: (data) => {
        this.weatherData = data;
        console.log('Received weather data:', data);
      },
      error: (err) => {
        console.error('Failed to load weather data:', err);
      }
    });
  }
}
