"""Live corridor weather via OpenWeatherMap (current + 5-day forecast)."""

from __future__ import annotations

import logging
import time
from datetime import datetime, timezone

from config import OPENWEATHER_API_KEY
from services.external_api import fetch_json
from services.weather_signal import CORRIDOR_LAT, CORRIDOR_LON

logger = logging.getLogger(__name__)

OW_CURRENT = "https://api.openweathermap.org/data/2.5/weather"
OW_FORECAST = "https://api.openweathermap.org/data/2.5/forecast"

_cache: tuple[dict, float] | None = None
_CACHE_TTL_SEC = 900  # 15 min — within free-tier refresh norms


def fetch_openweather_live() -> dict | None:
    """Current conditions + next 5 days (3h steps) for potato corridor."""
    global _cache
    key = (OPENWEATHER_API_KEY or "").strip()
    if not key:
        return None

    if _cache and _cache[1] > time.time():
        return _cache[0]

    base = {"lat": CORRIDOR_LAT, "lon": CORRIDOR_LON, "appid": key, "units": "metric"}
    status_c, current, err_c = fetch_json(
        "openweather_current",
        "GET",
        OW_CURRENT,
        params=base,
        timeout=12.0,
        max_attempts=2,
    )
    status_f, forecast, err_f = fetch_json(
        "openweather_forecast",
        "GET",
        OW_FORECAST,
        params=base,
        timeout=12.0,
        max_attempts=2,
    )
    if status_c != 200 or not current:
        logger.warning("OpenWeather current failed: %s", err_c)
        return None

    payload = _parse_current(current)
    if status_f == 200 and forecast:
        payload.update(_parse_forecast(forecast))
    else:
        logger.warning("OpenWeather forecast failed: %s", err_f)
        payload["forecast_days"] = []

    payload["ok"] = True
    payload["is_live_openweather"] = True
    payload["fetched_at"] = datetime.now(timezone.utc).isoformat()
    payload["source"] = "OpenWeatherMap · live"
    _cache = (payload, time.time() + _CACHE_TTL_SEC)
    return payload


def _parse_current(data: dict) -> dict:
    main = data.get("main") or {}
    wind = data.get("wind") or {}
    w0 = (data.get("weather") or [{}])[0]
    temp = float(main.get("temp", 0))
    tmin = float(main.get("temp_min", temp))
    tmax = float(main.get("temp_max", temp))
    icon = w0.get("icon", "01d")
    return {
        "location_name": data.get("name") or "Damodar corridor",
        "current_temp_c": round(temp, 1),
        "feels_like_c": round(float(main.get("feels_like", temp)), 1),
        "temp_min_c_now": round(tmin, 1),
        "temp_max_c_now": round(tmax, 1),
        "temp_range": f"{round(tmin, 0):.0f}°C – {round(tmax, 0):.0f}°C",
        "humidity_pct": int(main.get("humidity", 0)),
        "pressure_hpa": int(main.get("pressure", 0)),
        "wind_speed_ms": round(float(wind.get("speed", 0)), 1),
        "wind_kph": round(float(wind.get("speed", 0)) * 3.6, 1),
        "visibility_m": int(data.get("visibility") or 0),
        "cloud_pct": int((data.get("clouds") or {}).get("all", 0)),
        "weather_main": w0.get("main", ""),
        "weather_description": (w0.get("description") or "").title(),
        "weather_icon": icon,
        "weather_icon_url": f"https://openweathermap.org/img/wn/{icon}@2x.png",
    }


def _parse_forecast(data: dict) -> dict:
    items = data.get("list") or []
    by_day: dict[str, dict] = {}
    rain_next_24h = 0.0
    pop_max_48h = 0.0

    for i, item in enumerate(items):
        dt_txt = item.get("dt_txt", "")
        day_key = dt_txt[:10] if dt_txt else str(i // 8)
        main = item.get("main") or {}
        w0 = (item.get("weather") or [{}])[0]
        pop = float(item.get("pop") or 0)
        rain = item.get("rain") or {}
        mm = float(rain.get("3h") or rain.get("1h") or 0)

        if i < 8:
            rain_next_24h += mm
        if i < 16:
            pop_max_48h = max(pop_max_48h, pop)

        slot = {
            "time": dt_txt[11:16] if len(dt_txt) >= 16 else "",
            "temp_c": round(float(main.get("temp", 0)), 1),
            "pop_pct": int(pop * 100),
            "description": (w0.get("description") or "").title(),
            "icon": w0.get("icon", "01d"),
        }
        if day_key not in by_day:
            by_day[day_key] = {
                "date": day_key,
                "label": _day_label(day_key),
                "temp_min_c": slot["temp_c"],
                "temp_max_c": slot["temp_c"],
                "pop_max_pct": slot["pop_pct"],
                "rain_mm": mm,
                "icon": slot["icon"],
                "description": slot["description"],
                "slots": [slot],
            }
        else:
            d = by_day[day_key]
            d["temp_min_c"] = min(d["temp_min_c"], slot["temp_c"])
            d["temp_max_c"] = max(d["temp_max_c"], slot["temp_c"])
            d["pop_max_pct"] = max(d["pop_max_pct"], slot["pop_pct"])
            d["rain_mm"] = round(d["rain_mm"] + mm, 1)
            if len(d["slots"]) < 4:
                d["slots"].append(slot)

    forecast_days = list(by_day.values())[:5]
    precip_forecast_mm = round(sum(d["rain_mm"] for d in forecast_days), 1)

    wet_dry = "normal"
    if rain_next_24h >= 15 or pop_max_48h >= 0.7:
        wet_dry = "wet"
    elif rain_next_24h < 2 and pop_max_48h < 0.2:
        wet_dry = "dry"

    return {
        "precipitation_mm": precip_forecast_mm,
        "precip_mm_next_24h": round(rain_next_24h, 1),
        "pop_max_48h_pct": int(pop_max_48h * 100),
        "wet_dry_anomaly": wet_dry,
        "forecast_days": forecast_days,
    }


def _day_label(iso_date: str) -> str:
    try:
        d = datetime.strptime(iso_date, "%Y-%m-%d")
        return d.strftime("%a %d %b")
    except ValueError:
        return iso_date
