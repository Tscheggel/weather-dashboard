import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [],
  templateUrl: './weather-card.html'
})
export class WeatherCardComponent {
  @Input() weatherData: any = null;
}