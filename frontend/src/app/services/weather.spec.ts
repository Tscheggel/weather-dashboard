import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WeatherService } from './weather';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request weather for the selected city', () => {
    service.getWeather('New York').subscribe();

    const request = httpMock.expectOne('http://127.0.0.1:8000/api/weather/New%20York');
    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('should geocode a city for the map marker', () => {
    service.geocodeCity('Berlin').subscribe();

    const request = httpMock.expectOne((req) => req.url === 'http://127.0.0.1:8000/api/geocode');
    expect(request.request.params.get('city')).toBe('Berlin');
    request.flush({});
  });

  it('should reverse geocode map coordinates', () => {
    service.reverseGeocode(52.52, 13.405).subscribe();

    const request = httpMock.expectOne((req) => req.url === 'http://127.0.0.1:8000/api/reverse-geocode');
    expect(request.request.params.get('latitude')).toBe('52.52');
    expect(request.request.params.get('longitude')).toBe('13.405');
    request.flush({});
  });
});
