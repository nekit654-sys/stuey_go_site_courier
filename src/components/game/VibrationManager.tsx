export const vibrate = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

export const VibrationType = {
  pickup: [50],
  delivery: [100, 50, 100],
  coins: [30, 30, 30],
  jump: [20],
  crash: [200],
  unlock: [50, 100, 50, 100]
};

export const playVibration = (type: keyof typeof VibrationType) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    vibrate(VibrationType[type]);
  }
};
