import { JSX } from "react";

import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiDayHaze,
} from "react-icons/wi";
import { useWeather } from "../hooks/useWeather";

const weatherStyles: Record<string, { icon: JSX.Element }> = {
  Thunderstorm: {
    icon: <WiThunderstorm size={32} />,
  },
  Drizzle: {
    icon: <WiRain size={32} />,
  },
  Rain: {
    icon: <WiRain size={32} />,
  },
  Snow: {
    icon: <WiSnow size={32} />,
  },
  Mist: {
    icon: <WiFog size={32} />,
  },
  Haze: {
    icon: <WiDayHaze size={32} />,
  },
  Clear: {
    icon: <WiDaySunny size={32} />,
  },
  Clouds: {
    icon: <WiCloud size={32} />,
  },
  Fog: {
    icon: <WiFog size={32} />,
  },
};

export const Weather = () => {
  const { data, loading, errorWeather } = useWeather();

  if (errorWeather)
    return (
      <div
        className={`theme-container flex flex-col items-center justify-center
                  w-[150px] h-[100px] transition-all duration-500`}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-start leading-tight p-2">
            <h2 className="text-xs text-center font-semibold tracking-wide drop-shadow-sm text-red-500">
              {errorWeather}
            </h2>
          </div>
        </div>
      </div>
    );
  if (loading || !data)
    return (
      <div
        className={`theme-container flex flex-col items-center justify-center
                  w-[150px] h-[100px] transition-all duration-500`}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-start leading-tight p-2">
            <h2 className="text-xs text-center font-semibold tracking-wide drop-shadow-sm">
              Cargando...
            </h2>
          </div>
        </div>
      </div>
    );

  const [city, info] = Object.entries(data)[0] || [];
  const temp = Math.round(info.main.temp);
  const condition = info.weather[0].main;

  const style = weatherStyles[condition] || weatherStyles["Clouds"];

  return (
    <div
      className={`theme-container flex flex-col items-center justify-center
                  w-[150px] h-[100px] transition-all duration-500`}
    >
      <div className="flex items-center gap-4">
        <div className="animate-pulse-slow">{style.icon}</div>
        <div className="flex flex-col items-start leading-tight">
          <h2 className="text-xs font-semibold tracking-wide drop-shadow-sm">
            {city}
          </h2>
          <p className="text-lg font-bold drop-shadow-sm">{temp}°C</p>
        </div>
      </div>
    </div>
  );
};
