import asyncio
from fastapi import FastAPI
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