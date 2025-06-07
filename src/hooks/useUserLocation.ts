import { useState, useEffect } from "react";

interface LocationData {
  city: string;
  loading: boolean;
  error: string | null;
}

export const useUserLocation = (): LocationData => {
  const [location, setLocation] = useState<LocationData>({
    city: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // Попробуем получить IP-геолокацию
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (data.city) {
          setLocation({
            city: data.city,
            loading: false,
            error: null,
          });
        } else {
          throw new Error("Город не определен");
        }
      } catch (error) {
        setLocation({
          city: "",
          loading: false,
          error: "Не удалось определить город",
        });
      }
    };

    getUserLocation();
  }, []);

  return location;
};
