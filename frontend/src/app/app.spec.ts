import { TestBed } from '@angular/core/testing';
import { EMPTY, Subject } from 'rxjs';
import { App } from './app';
import { WeatherService } from './services/weather';
import type { WeatherResponse } from './services/weather';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{
        provide: WeatherService,
        useValue: {
          getWeather: () => EMPTY,
          geocodeCity: () => EMPTY,
          reverseGeocode: () => EMPTY,
        },
      }],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Weather Dashboard');
    expect(compiled.querySelector('app-city-map')).toBeTruthy();
  });

  it('should ignore a slower weather response after a newer city is selected', () => {
    const firstRequest = new Subject<WeatherResponse>();
    const secondRequest = new Subject<WeatherResponse>();
    const service = TestBed.inject(WeatherService);
    spyOn(service, 'getWeather').and.returnValues(firstRequest, secondRequest);
    const app = TestBed.createComponent(App).componentInstance;

    app.fetchWeather('Hamburg');
    app.fetchWeather('Berlin');

    expect(firstRequest.observers.length).toBe(0);
    secondRequest.next({
      location: { city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin' },
      current: {
        temperature: 18,
        description: 'Cloudy',
        kind: 'Cloudy',
        humidity: 65,
        wind_speed: 12,
      },
      forecast: [],
    });
    expect(app.weatherData()?.location.city).toBe('Berlin');
  });
});
