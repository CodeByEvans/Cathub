import { useEffect, useState } from "react";

export const useGeolocation = () => {
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocalización no soportada por el navegador");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        setError(`Error: ${err.message}`);
      }
    );
  }, []);

  return { coords, error };
};
