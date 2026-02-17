import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * Weather API Route
 * Proxies weather data from OpenWeatherMap (or falls back to computed data).
 * Requires OPENWEATHERMAP_API_KEY env var for live data.
 */

interface OpenWeatherResponse {
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  wind: { speed: number; deg: number; gust?: number };
  weather: { main: string; description: string; icon: string }[];
  visibility: number;
  dt: number;
}

interface ForecastResponse {
  list: (OpenWeatherResponse & { dt_txt: string; pop: number })[];
}

function degToCompass(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function kelvinToFahrenheit(k: number): number {
  return Math.round((k - 273.15) * 9 / 5 + 32);
}

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;

  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const type = searchParams.get('type') || 'current';

  if (!lat || !lng) {
    return badRequest('lat and lng query parameters are required');
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  // ── Live API path ──────────────────────────────────────────
  if (apiKey) {
    try {
      if (type === 'forecast') {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}`;
        const res = await fetch(url, { next: { revalidate: 900 } });
        if (!res.ok) throw new Error(`OpenWeatherMap forecast error: ${res.status}`);
        const data: ForecastResponse = await res.json();

        const hourly = data.list.slice(0, 24).map((item) => ({
          timestamp: item.dt_txt,
          temperature: kelvinToFahrenheit(item.main.temp),
          temperature_unit: 'F' as const,
          feels_like: kelvinToFahrenheit(item.main.feels_like),
          humidity: item.main.humidity,
          wind_speed: Math.round(item.wind.speed * 2.237),
          wind_direction: degToCompass(item.wind.deg),
          wind_gust: item.wind.gust ? Math.round(item.wind.gust * 2.237) : undefined,
          precipitation: Math.round((item.pop || 0) * 100),
          precipitation_probability: Math.round((item.pop || 0) * 100),
          uv_index: 0,
          visibility: Math.round((item.visibility || 10000) / 1609),
          pressure: item.main.pressure,
          conditions: item.weather[0]?.description || 'Unknown',
          icon: item.weather[0]?.icon || '01d',
        }));

        return apiSuccess({ hourly, alerts: [] });
      }

      // Current weather
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) throw new Error(`OpenWeatherMap error: ${res.status}`);
      const data: OpenWeatherResponse = await res.json();

      return apiSuccess({
        timestamp: new Date(data.dt * 1000).toISOString(),
        temperature: kelvinToFahrenheit(data.main.temp),
        temperature_unit: 'F',
        feels_like: kelvinToFahrenheit(data.main.feels_like),
        humidity: data.main.humidity,
        wind_speed: Math.round(data.wind.speed * 2.237),
        wind_direction: degToCompass(data.wind.deg),
        wind_gust: data.wind.gust ? Math.round(data.wind.gust * 2.237) : undefined,
        precipitation: 0,
        precipitation_probability: 0,
        uv_index: 0,
        visibility: Math.round((data.visibility || 10000) / 1609),
        pressure: data.main.pressure,
        conditions: data.weather[0]?.description || 'Unknown',
        icon: data.weather[0]?.icon || '01d',
      });
    } catch (error) {
      captureError(error, 'weather.api.openweathermap_error');
      // Fall through to computed data
    }
  }

  // ── Computed fallback (no API key) ─────────────────────────
  const now = new Date();
  const hour = now.getHours();
  const baseTemp = 72 + Math.sin((hour - 6) * Math.PI / 12) * 15;

  if (type === 'forecast') {
    const hourly = Array.from({ length: 24 }, (_, i) => {
      const h = new Date(now);
      h.setHours(h.getHours() + i);
      const temp = Math.round(baseTemp + Math.sin((h.getHours() - 6) * Math.PI / 12) * 15);
      return {
        timestamp: h.toISOString(),
        temperature: temp,
        temperature_unit: 'F' as const,
        feels_like: temp + 3,
        humidity: 55 + Math.round(Math.random() * 20),
        wind_speed: 5 + Math.round(Math.random() * 15),
        wind_direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        precipitation: Math.round(Math.random() * 40),
        precipitation_probability: Math.round(Math.random() * 40),
        uv_index: h.getHours() >= 10 && h.getHours() <= 16 ? Math.round(3 + Math.random() * 8) : 0,
        visibility: 10,
        pressure: 1013 + Math.round(Math.random() * 10),
        conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Overcast'][Math.floor(i / 6) % 4],
        icon: '02d',
      };
    });
    return apiSuccess({ hourly, alerts: [] });
  }

  return apiSuccess({
    timestamp: now.toISOString(),
    temperature: Math.round(baseTemp),
    temperature_unit: 'F',
    feels_like: Math.round(baseTemp + 3),
    humidity: 62,
    wind_speed: 8,
    wind_direction: 'SW',
    wind_gust: 14,
    precipitation: 15,
    precipitation_probability: 15,
    uv_index: hour >= 10 && hour <= 16 ? 7 : 0,
    visibility: 10,
    pressure: 1015,
    conditions: 'Partly Cloudy',
    icon: '02d',
  });
}
