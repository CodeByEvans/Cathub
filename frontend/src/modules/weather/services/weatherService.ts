import { envs } from "../../../config/envs";

export const getWeatherByCity = async (city: string) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${envs.openWeatherApiKey}&units=metric`
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener el clima");
  }
  return response.json();
};

export const getCityByCoordinates = async (lat: number, lon: number) => {
  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${envs.openWeatherApiKey}`
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener la ciudad");
  }

  return response.json();
};
