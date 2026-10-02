import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { DailyForecast, WeatherResponse } from '../services/weather';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './weather-card.html'
})
export class WeatherCardComponent {
  @Input() weatherData: WeatherResponse | null = null;

  getRainChance(forecast: DailyForecast): number | null {
    if (forecast.hourly.length === 0) return null;

    return Math.max(...forecast.hourly.map((hour) => hour.rain_chance));
  }
}