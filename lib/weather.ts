/**
 * Open-Meteo weather helper.
 * Free API — no key required.
 * Returns current temperature (°C) and relative humidity (%).
 */

import type { WeatherData } from './types';

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
  };
}

interface GeocodeResult {
  results?: {
    latitude: number;
    longitude: number;
    name: string;
    country: string;
  }[];
}

/**
 * Geocode a city name to lat/lon using Open-Meteo's geocoding API.
 * Returns null if the city cannot be found.
 */
async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as GeocodeResult;
  if (!data.results || data.results.length === 0) return null;
  return { lat: data.results[0].latitude, lon: data.results[0].longitude };
}

/**
 * Fetch current temperature and humidity for a given city.
 * Falls back to Montreal (hackathon location) if geocoding fails.
 */
export async function fetchWeather(city: string): Promise<WeatherData> {
  const FALLBACK = { lat: 45.5017, lon: -73.5673, name: 'Montreal' };

  const coords = (await geocodeCity(city)) ?? { lat: FALLBACK.lat, lon: FALLBACK.lon };
  const locationName = (await geocodeCity(city)) ? city : FALLBACK.name;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status}`);
  }

  const data = (await res.json()) as OpenMeteoResponse;

  return {
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    location: locationName,
    fetchedAt: new Date().toISOString(),
  };
}
