import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeatherCardComponent } from './weather-card';
import type { WeatherResponse } from '../services/weather';

describe('WeatherCard', () => {
  let component: WeatherCardComponent;
  let fixture: ComponentFixture<WeatherCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display daily forecast and the highest hourly rain chance', () => {
    const weatherData: WeatherResponse = {
      location: { city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin' },
      current: {
        temperature: 18,
        description: 'Cloudy',
        kind: 'Cloudy',
        humidity: 65,
        wind_speed: 12,
      },
      forecast: [{
        date: '2026-10-03',
        max_temp: 20,
        min_temp: 12,
        hourly: [
          { time: '09:00:00', temp: 15, rain_chance: 20 },
          { time: '12:00:00', temp: 19, rain_chance: 60 },
        ],
      }],
    };
    component.weatherData = weatherData;

    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Forecast');
    expect(text).toContain('20°');
    expect(text).toContain('12°');
    expect(text).toContain('Rain chance up to 60%');
  });

  it('should display a fallback when hourly rain data is unavailable', () => {
    component.weatherData = {
      location: { city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin' },
      current: {
        temperature: 18,
        description: 'Cloudy',
        kind: 'Cloudy',
        humidity: null,
        wind_speed: null,
      },
      forecast: [{
        date: '2026-10-03',
        max_temp: 20,
        min_temp: 12,
        hourly: [],
      }],
    };

    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('Rain chance up to');
    expect(text).toContain('— %');
  });
});
