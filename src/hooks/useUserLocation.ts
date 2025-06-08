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
    const getUserLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (data.city) {
          const cityInPrepositional = getCityInPrepositional(data.city);
          setLocation({
            city: data.city,
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
    };

    getUserLocation();
  }, []);

  return location;
};
