import asyncio
import json
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import python_weather

app = FastAPI(
    title="Weather & IoT Dashboard API",
    description="FastAPI mit echtem Wetter",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online"}


_nominatim_lock = asyncio.Lock()
_nominatim_cache: dict[tuple[tuple[str, str], ...], list[dict] | dict] = {}
_nominatim_last_request = 0.0


def _fetch_nominatim(endpoint: str, params: dict[str, str]) -> list[dict] | dict:
    url = f"https://nominatim.openstreetmap.org/{endpoint}?{urlencode(params)}"
    request = Request(url, headers={"User-Agent": "weather-dashboard/1.0"})
    with urlopen(request, timeout=10) as response:
        return json.loads(response.read())


async def _geocode(endpoint: str, params: dict[str, str]) -> list[dict] | dict:
    global _nominatim_last_request

    cache_key = (("endpoint", endpoint), *sorted(params.items()))
    try:
        async with _nominatim_lock:
            if cache_key in _nominatim_cache:
                return _nominatim_cache[cache_key]

            delay = 1 - (time.monotonic() - _nominatim_last_request)
            if delay > 0:
                await asyncio.sleep(delay)
            _nominatim_last_request = time.monotonic()
            results = await asyncio.to_thread(_fetch_nominatim, endpoint, params)
            if len(_nominatim_cache) >= 512:
                _nominatim_cache.pop(next(iter(_nominatim_cache)))
            _nominatim_cache[cache_key] = results
            return results
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail="Location lookup is unavailable") from error


def _location_result(result: dict) -> dict:
    address = result.get("address", {})
    city = (
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("municipality")
        or address.get("county")
    )
    if not city:
        raise HTTPException(status_code=404, detail="No city found at this location")

    return {
        "city": city,
        "country": address.get("country", ""),
        "latitude": float(result["lat"]),
        "longitude": float(result["lon"]),
    }


@app.get("/api/geocode")
async def geocode_city(city: str):
    results = await _geocode("search", {
        "q": city,
        "format": "jsonv2",
        "addressdetails": "1",
        "limit": "1",
    })
    if not results:
        raise HTTPException(status_code=404, detail="City not found")
    if not isinstance(results, list) or not isinstance(results[0], dict):
        raise HTTPException(status_code=502, detail="City lookup returned an invalid response")
    return _location_result(results[0])


@app.get("/api/reverse-geocode")
async def reverse_geocode(latitude: float, longitude: float):
    if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
        raise HTTPException(status_code=422, detail="Coordinates are out of range")

    results = await _geocode("reverse", {
        "lat": str(latitude),
        "lon": str(longitude),
        "format": "jsonv2",
        "addressdetails": "1",
        "zoom": "10",
    })
    if not results:
        raise HTTPException(status_code=404, detail="No city found at this location")
    if not isinstance(results, dict):
        raise HTTPException(status_code=502, detail="Location lookup returned an invalid response")
    return _location_result(results)


@app.get("/api/weather/{city}")
async def get_full_weather(city: str):
    async with python_weather.Client(unit=python_weather.METRIC) as client:
        weather = await client.get(city)
        
        return {
            "location": {
                "city": city,
                "country": getattr(weather, "country", "Unknown"),
                "timezone": getattr(weather, "timezone", "Unknown")
            },
            "current": {
                "temperature": weather.temperature,
                "description": weather.description,
                "kind": str(weather.kind),
                "humidity": getattr(weather, "humidity", None),
                "wind_speed": getattr(weather, "wind_speed", None)
            },
            "forecast": [
                {
                    "date": str(daily.date),
                    "max_temp": daily.highest_temperature,
                    "min_temp": daily.lowest_temperature,
                    "hourly": [
                        {
                            "time": str(hourly.time),
                            "temp": hourly.temperature,
                            "rain_chance": getattr(hourly, "chance_of_rain", 0)
                        }
                        for hourly in daily
                    ]
                }
                for daily in weather
            ]
        }