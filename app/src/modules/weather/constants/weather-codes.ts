import type { LucideIcon } from "lucide-react";
import {
  Sun,
  Moon,
  CloudSun,
  Cloudy,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from "lucide-react";

export interface WeatherVisual {
  icon: LucideIcon;
  label: string;
  background: string;
}

/**
 * Mapeo de WMO weather code (Open-Meteo) a icono lucide + etiqueta + gradiente
 * de fondo. Todo en OKLCH hue 240 (la familia de neutros azulados de Cathub)
 * para mantener armonía con el resto de la app.
 */
export function describeWeather(code: number, isDay: boolean): WeatherVisual {
  if (code === 0) {
    return isDay
      ? {
          icon: Sun,
          label: "Despejado",
          background: "linear-gradient(135deg, oklch(0.60 0.11 240), oklch(0.48 0.12 240))",
        }
      : {
          icon: Moon,
          label: "Despejado",
          background: "linear-gradient(135deg, oklch(0.30 0.03 240), oklch(0.18 0.02 240))",
        };
  }
  if (code === 1) {
    return isDay
      ? {
          icon: CloudSun,
          label: "Poco nublado",
          background: "linear-gradient(135deg, oklch(0.62 0.08 240), oklch(0.52 0.04 240))",
        }
      : {
          icon: Moon,
          label: "Poco nublado",
          background: "linear-gradient(135deg, oklch(0.30 0.03 240), oklch(0.22 0.02 240))",
        };
  }
  if (code === 2) {
    return {
      icon: CloudSun,
      label: "Parcialmente nublado",
      background: "linear-gradient(135deg, oklch(0.60 0.06 240), oklch(0.46 0.03 240))",
    };
  }
  if (code === 3) {
    return {
      icon: Cloudy,
      label: "Nublado",
      background: "linear-gradient(135deg, oklch(0.54 0.02 240), oklch(0.38 0.02 240))",
    };
  }
  if (code === 45 || code === 48) {
    return {
      icon: CloudFog,
      label: "Niebla",
      background: "linear-gradient(135deg, oklch(0.58 0.015 240), oklch(0.42 0.015 240))",
    };
  }
  if (code >= 51 && code <= 57) {
    return {
      icon: CloudDrizzle,
      label: "Llovizna",
      background: "linear-gradient(135deg, oklch(0.50 0.03 240), oklch(0.40 0.06 240))",
    };
  }
  if (code >= 61 && code <= 67) {
    return {
      icon: CloudRain,
      label: "Lluvia",
      background: "linear-gradient(135deg, oklch(0.44 0.04 240), oklch(0.30 0.07 240))",
    };
  }
  if (code >= 71 && code <= 77) {
    return {
      icon: CloudSnow,
      label: "Nieve",
      background: "linear-gradient(135deg, oklch(0.56 0.02 240), oklch(0.42 0.04 240))",
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      icon: CloudRain,
      label: "Chubascos",
      background: "linear-gradient(135deg, oklch(0.48 0.04 240), oklch(0.34 0.06 240))",
    };
  }
  if (code === 85 || code === 86) {
    return {
      icon: CloudSnow,
      label: "Chubascos de nieve",
      background: "linear-gradient(135deg, oklch(0.56 0.02 240), oklch(0.42 0.04 240))",
    };
  }
  if (code >= 95) {
    return {
      icon: CloudLightning,
      label: "Tormenta",
      background: "linear-gradient(135deg, oklch(0.30 0.02 240), oklch(0.20 0.03 240))",
    };
  }
  return {
    icon: Cloud,
    label: "Nublado",
    background: "linear-gradient(135deg, oklch(0.54 0.02 240), oklch(0.38 0.02 240))",
  };
}
