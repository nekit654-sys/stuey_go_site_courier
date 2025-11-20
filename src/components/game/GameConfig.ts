export const GAME_CONFIG = {
  CITY: {
    BLOCK_SIZE: 25,
    ROAD_WIDTH: 8,
    SIDEWALK_WIDTH: 2.5,
    GRID_SIZE: 5,
    TOTAL_SIZE: 150,
  },
  
  PERFORMANCE: {
    MOBILE: {
      MAX_VEHICLES: 6,
      MAX_PEDESTRIANS: 4,
      MAX_BUILDINGS: 16,
      SHADOWS: false,
      PIXEL_RATIO: 1,
      QUALITY: 'low' as const,
    },
    DESKTOP: {
      MAX_VEHICLES: 12,
      MAX_PEDESTRIANS: 8,
      MAX_BUILDINGS: 25,
      SHADOWS: true,
      PIXEL_RATIO: 2,
      QUALITY: 'medium' as const,
    },
  },
  
  COURIER: {
    WALK: {
      speed: 4,
      turnSpeed: 0.12,
      energyCost: 0.03,
      stamina: 100,
    },
    BICYCLE: {
      speed: 9,
      turnSpeed: 0.18,
      energyCost: 0.08,
      stamina: 100,
      cost: 200,
      rentPerDay: 50,
    },
    SCOOTER: {
      speed: 13,
      turnSpeed: 0.22,
      energyCost: 0.12,
      stamina: 100,
      cost: 500,
      rentPerDay: 100,
    },
    MOTORCYCLE: {
      speed: 18,
      turnSpeed: 0.25,
      energyCost: 0.18,
      stamina: 100,
      cost: 1000,
      rentPerDay: 150,
    },
  },
  
  ORDERS: {
    NORMAL: {
      rewardMultiplier: 1,
      timeMultiplier: 1,
    },
    URGENT: {
      rewardMultiplier: 2,
      timeMultiplier: 0.5,
    },
    BASE_REWARD: 30,
    REWARD_PER_METER: 0.5,
    CHAIN_BONUS: 0.5,
    WEATHER_BONUS: 0.3,
  },
  
  TRAFFIC: {
    RED_LIGHT_PENALTY: 10,
    COLLISION_PENALTY: 5,
    LATE_DELIVERY_PENALTY_PERCENT: 0.5,
  },
  
  UPGRADES: {
    SPEED: {
      maxLevel: 5,
      costPerLevel: 100,
      bonusPerLevel: 0.1,
    },
    STAMINA: {
      maxLevel: 5,
      costPerLevel: 150,
      bonusPerLevel: 0.2,
    },
    CAPACITY: {
      maxLevel: 3,
      costPerLevel: 300,
      bonusPerLevel: 1,
    },
    GPS: {
      maxLevel: 3,
      costPerLevel: 200,
      bonusPerLevel: 0.33,
    },
    REPUTATION: {
      maxLevel: 5,
      costPerLevel: 250,
      bonusPerLevel: 0.15,
    },
  },
  
  DAILY_QUESTS: {
    DELIVERIES_5: { reward: 100, goal: 5 },
    DISTANCE_500: { reward: 50, goal: 500 },
    URGENT_1: { reward: 150, goal: 1 },
    PERFECT_3: { reward: 200, goal: 3 },
  },
  
  ACHIEVEMENTS: {
    FIRST_DELIVERY: { reward: 50, coins: 50 },
    SPEEDRUN_30S: { reward: 100, coins: 100 },
    MARATHON_100: { reward: 500, coins: 0, skin: 'pro' },
    NIGHT_COURIER: { reward: 200, coins: 0, multiplier: 1.5 },
  },
  
  LEVELING: {
    BASE_EXP: 100,
    EXP_MULTIPLIER: 1.5,
    SKILL_POINTS_PER_LEVEL: 1,
  },
};

export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const getPerformanceConfig = () => {
  return isMobile ? GAME_CONFIG.PERFORMANCE.MOBILE : GAME_CONFIG.PERFORMANCE.DESKTOP;
};
