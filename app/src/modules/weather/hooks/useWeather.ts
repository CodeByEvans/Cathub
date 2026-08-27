import { useEffect, useState } from "react";
import { logger } from "@/shared/logger";
import { fetchLocation, fetchCurrentWeather } from "../services/weather.service";
import { LocationInfo } from "../@types/weather.types";

const REFRESH_MS = 15 * 60 * 1000; // 15 minutos

export interface WeatherState {
  city: string;
  temperature: number | null;
  weathercode: number | null;
  isDay: boolean;
  loading: boolean;
  error: boolean;
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    city: "",
    temperature: null,
    weathercode: null,
    isDay: true,
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    let location: LocationInfo | null = null;

    const loadWeather = async (loc: LocationInfo) => {
      try {
        const data = await fetchCurrentWeather(loc.latitude, loc.longitude);
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          city: loc.city,
          temperature: data.current_weather.temperature,
          weathercode: data.current_weather.weathercode,
          isDay: data.current_weather.is_day === 1,
          loading: false,
          error: false,
        }));
      } catch (error) {
        logger.warn("weather", "Error obteniendo el clima", error);
        if (!cancelled) {
          setState((prev) => ({ ...prev, error: true, loading: false }));
        }
      }
    };

    const bootstrap = async () => {
      try {
        location = await fetchLocation();
        if (cancelled) return;
        setState((prev) => ({ ...prev, city: location!.city }));
        await loadWeather(location);
      } catch (error) {
        logger.warn("weather", "Error obteniendo la ubicación", error);
        if (!cancelled) {
          setState((prev) => ({ ...prev, error: true, loading: false }));
        }
      }
    };

    bootstrap();

    const interval = setInterval(() => {
      if (location) loadWeather(location);
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return state;
}
