import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";

const SocialProof = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      icon: "Users",
      value: "2,847",
      label: "Курьеров зарегистрировалось",
      color: "bg-blue-400"
    },
    {
      icon: "Star",
      value: "4.8/5",
      label: "Средняя оценка",
      color: "bg-yellow-400"
    },
    {
      icon: "Wallet",
      value: "127,000₽",
      label: "Выплачено рефералам в декабре",
      color: "bg-green-400"
    }
  ];

  return null;
};

export default SocialProof;