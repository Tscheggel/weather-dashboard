import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/weather';

  getWeather(city: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${encodeURIComponent(city.trim())}`);
}
}