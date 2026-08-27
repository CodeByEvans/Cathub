import {
  IpWhoIsResponse,
  LocationInfo,
  OpenMeteoResponse,
} from "../@types/weather.types";

/**
 * Ubicación por IP (sin permiso de geolocalización, que macOS bloquea).
 * ipwho.is devuelve ciudad + coordenadas y permite CORS.
 */
export async function fetchLocation(): Promise<LocationInfo> {
  const response = await fetch("https://ipwho.is/");
  if (!response.ok) {
    throw new Error("No se pudo obtener la ubicación");
  }
  const data: IpWhoIsResponse = await response.json();
  if (!data.success) {
    throw new Error("Ubicación no resuelta por IP");
  }
  return {
    city: data.city,
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

/** Clima actual en una coordenada vía Open-Meteo (sin API key, CORS abierto). */
export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current_weather: "true",
  });
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error("No se pudo obtener el clima");
  }
  return response.json();
}
