export interface IpWhoIsResponse {
  ip: string;
  success: boolean;
  country: string;
  country_code: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  city: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
  is_day: number;
  time: string;
}

export interface OpenMeteoResponse {
  current_weather: CurrentWeather;
}
