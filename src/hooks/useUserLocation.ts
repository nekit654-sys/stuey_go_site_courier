import { useState, useEffect } from "react";

interface LocationData {
  city: string;
  cityInPrepositional: string;
  loading: boolean;
  error: string | null;
}

// Функция для склонения города в предложный падеж
const getCityInPrepositional = (city: string): string => {
  const cityLower = city.toLowerCase();

  // Особые случаи
  const specialCases: { [key: string]: string } = {
    москва: "Москве",
    "санкт-петербург": "Санкт-Петербурге",
    екатеринбург: "Екатеринбурге",
    новосибирск: "Новосибирске",
    казань: "Казани",
    "нижний новгород": "Нижнем Новгороде",
    челябинск: "Челябинске",
    омск: "Омске",
    самара: "Самаре",
    "ростов-на-дону": "Ростове-на-Дону",
    уфа: "Уфе",
    красноярск: "Красноярске",
    воронеж: "Воронеже",
    пермь: "Перми",
    волгоград: "Волгограде",
  };

  if (specialCases[cityLower]) {
    return specialCases[cityLower];
  }

  // Общие правила склонения
  if (cityLower.endsWith("град") || cityLower.endsWith("город")) {
    return city + "е";
  }
  if (cityLower.endsWith("ск")) {
    return city + "е";
  }
  if (cityLower.endsWith("а")) {
    return city.slice(0, -1) + "е";
  }
  if (cityLower.endsWith("ь")) {
    return city.slice(0, -1) + "и";
  }

  // По умолчанию добавляем "е"
  return city + "е";
};

export const useUserLocation = (): LocationData => {
  const [location, setLocation] = useState<LocationData>({
    city: "",
    cityInPrepositional: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    const getUserLocation = () => {
      // Проверяем доступность ymaps
      if (typeof window !== "undefined" && window.ymaps) {
        window.ymaps.ready(() => {
          try {
            const geolocation = window.ymaps.geolocation;
            const city = geolocation.city || "";

            if (city) {
              const cityInPrepositional = getCityInPrepositional(city);
              setLocation({
                city,
                cityInPrepositional,
                loading: false,
                error: null,
              });
            } else {
              throw new Error("Город не определен");
            }
          } catch (error) {
            setLocation({
              city: "",
              cityInPrepositional: "",
              loading: false,
              error: "Не удалось определить город",
            });
          }
        });
      } else {
        // Fallback на случай если ymaps не загружен
        setLocation({
          city: "",
          cityInPrepositional: "",
          loading: false,
          error: "Сервис геолокации недоступен",
        });
      }
    };

    getUserLocation();
  }, []);

  return location;
};

// Расширяем типы для ymaps
declare global {
  interface Window {
    ymaps: any;
  }
}
