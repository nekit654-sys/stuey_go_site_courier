export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'orders' | 'referrals' | 'earnings' | 'tenure' | 'special' | 'vehicle';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: number;
  unlocked: boolean;
  progress: number;
}

export interface AchievementCategory {
  id: string;
  name: string;
  icon: string;
  achievements: Achievement[];
}

export const achievementDefinitions = [
  {
    id: 'first_order',
    name: 'Первый заказ',
    description: 'Выполните свой первый заказ',
    icon: 'Package',
    category: 'orders' as const,
    tier: 'bronze' as const,
    requirement: 1,
  },
  {
    id: 'ten_orders',
    name: 'Десятка',
    description: 'Выполните 10 заказов',
    icon: 'TrendingUp',
    category: 'orders' as const,
    tier: 'bronze' as const,
    requirement: 10,
  },
  {
    id: 'fifty_orders',
    name: 'Опытный',
    description: 'Выполните 50 заказов',
    icon: 'Award',
    category: 'orders' as const,
    tier: 'silver' as const,
    requirement: 50,
  },
  {
    id: 'hundred_orders',
    name: 'Сотник',
    description: 'Выполните 100 заказов',
    icon: 'Trophy',
    category: 'orders' as const,
    tier: 'silver' as const,
    requirement: 100,
  },
  {
    id: 'fivehundred_orders',
    name: 'Профессионал',
    description: 'Выполните 500 заказов',
    icon: 'Crown',
    category: 'orders' as const,
    tier: 'gold' as const,
    requirement: 500,
  },
  {
    id: 'thousand_orders',
    name: 'Тысячник',
    description: 'Выполните 1000 заказов',
    icon: 'Star',
    category: 'orders' as const,
    tier: 'gold' as const,
    requirement: 1000,
  },
  {
    id: 'first_referral',
    name: 'Первый друг',
    description: 'Пригласите первого реферала',
    icon: 'UserPlus',
    category: 'referrals' as const,
    tier: 'bronze' as const,
    requirement: 1,
  },
  {
    id: 'five_referrals',
    name: 'Команда',
    description: 'Пригласите 5 рефералов',
    icon: 'Users',
    category: 'referrals' as const,
    tier: 'bronze' as const,
    requirement: 5,
  },
  {
    id: 'ten_referrals',
    name: 'Рекрутер',
    description: 'Пригласите 10 рефералов',
    icon: 'Target',
    category: 'referrals' as const,
    tier: 'silver' as const,
    requirement: 10,
  },
  {
    id: 'twentyfive_referrals',
    name: 'Менеджер',
    description: 'Пригласите 25 рефералов',
    icon: 'Briefcase',
    category: 'referrals' as const,
    tier: 'gold' as const,
    requirement: 25,
  },
  {
    id: 'fifty_referrals',
    name: 'Директор',
    description: 'Пригласите 50 рефералов',
    icon: 'Building',
    category: 'referrals' as const,
    tier: 'platinum' as const,
    requirement: 50,
  },
  {
    id: 'first_bonus',
    name: 'Первый бонус',
    description: 'Заработайте 500₽ с рефералов',
    icon: 'DollarSign',
    category: 'earnings' as const,
    tier: 'bronze' as const,
    requirement: 500,
  },
  {
    id: 'thousand_earned',
    name: 'Первая тысяча',
    description: 'Заработайте 1,000₽ с рефералов',
    icon: 'Coins',
    category: 'earnings' as const,
    tier: 'bronze' as const,
    requirement: 1000,
  },
  {
    id: 'five_thousand_earned',
    name: 'Инвестор',
    description: 'Заработайте 5,000₽ с рефералов',
    icon: 'TrendingUp',
    category: 'earnings' as const,
    tier: 'silver' as const,
    requirement: 5000,
  },
  {
    id: 'ten_thousand_earned',
    name: 'Предприниматель',
    description: 'Заработайте 10,000₽ с рефералов',
    icon: 'Landmark',
    category: 'earnings' as const,
    tier: 'silver' as const,
    requirement: 10000,
  },
  {
    id: 'fifty_thousand_earned',
    name: 'Бизнесмен',
    description: 'Заработайте 50,000₽ с рефералов',
    icon: 'Gem',
    category: 'earnings' as const,
    tier: 'gold' as const,
    requirement: 50000,
  },
  {
    id: 'hundred_thousand_earned',
    name: 'Магнат',
    description: 'Заработайте 100,000₽ с рефералов',
    icon: 'Crown',
    category: 'earnings' as const,
    tier: 'platinum' as const,
    requirement: 100000,
  },
  {
    id: 'one_month',
    name: 'Месяц в деле',
    description: 'Работайте 1 месяц',
    icon: 'Calendar',
    category: 'tenure' as const,
    tier: 'bronze' as const,
    requirement: 30,
  },
  {
    id: 'three_months',
    name: 'Ветеран',
    description: 'Работайте 3 месяца',
    icon: 'CalendarDays',
    category: 'tenure' as const,
    tier: 'silver' as const,
    requirement: 90,
  },
  {
    id: 'six_months',
    name: 'Старожил',
    description: 'Работайте 6 месяцев',
    icon: 'CalendarRange',
    category: 'tenure' as const,
    tier: 'gold' as const,
    requirement: 180,
  },
  {
    id: 'one_year',
    name: 'Год силы',
    description: 'Работайте 1 год',
    icon: 'PartyPopper',
    category: 'tenure' as const,
    tier: 'platinum' as const,
    requirement: 365,
  },
  {
    id: 'walker_100',
    name: 'Пешеход',
    description: '100 заказов пешком',
    icon: 'Footprints',
    category: 'vehicle' as const,
    tier: 'bronze' as const,
    requirement: 100,
  },
  {
    id: 'cyclist_100',
    name: 'Велосипедист',
    description: '100 заказов на велосипеде',
    icon: 'Bike',
    category: 'vehicle' as const,
    tier: 'bronze' as const,
    requirement: 100,
  },
  {
    id: 'scooter_100',
    name: 'Самокатчик',
    description: '100 заказов на самокате',
    icon: 'CircleArrowRight',
    category: 'vehicle' as const,
    tier: 'bronze' as const,
    requirement: 100,
  },
  {
    id: 'driver_100',
    name: 'Водитель',
    description: '100 заказов на автомобиле',
    icon: 'Car',
    category: 'vehicle' as const,
    tier: 'bronze' as const,
    requirement: 100,
  },
  {
    id: 'max_referral',
    name: 'Наставник',
    description: 'Один реферал достиг 150 заказов',
    icon: 'Medal',
    category: 'special' as const,
    tier: 'gold' as const,
    requirement: 1,
  },
  {
    id: 'five_max_referrals',
    name: 'Тренер',
    description: '5 рефералов достигли 150 заказов',
    icon: 'Award',
    category: 'special' as const,
    tier: 'platinum' as const,
    requirement: 5,
  },
];

export function calculateAchievements(stats: {
  total_orders?: number;
  total_referrals?: number;
  referral_earnings?: number;
  created_at?: string;
  vehicle_type?: string;
  referral_progress?: Array<{ orders_count: number; status: string }>;
}): Achievement[] {
  const achievements: Achievement[] = [];

  const daysSinceCreated = stats.created_at
    ? Math.floor((Date.now() - new Date(stats.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const maxReferrals = stats.referral_progress?.filter(
    (r) => r.orders_count >= 150 && r.status === 'completed'
  ).length || 0;

  achievementDefinitions.forEach((def) => {
    let progress = 0;
    let unlocked = false;

    switch (def.category) {
      case 'orders':
        progress = stats.total_orders || 0;
        unlocked = progress >= def.requirement;
        break;
      case 'referrals':
        progress = stats.total_referrals || 0;
        unlocked = progress >= def.requirement;
        break;
      case 'earnings':
        progress = stats.referral_earnings || 0;
        unlocked = progress >= def.requirement;
        break;
      case 'tenure':
        progress = daysSinceCreated;
        unlocked = progress >= def.requirement;
        break;
      case 'vehicle':
        if (def.id.includes(stats.vehicle_type || 'bike')) {
          progress = stats.total_orders || 0;
          unlocked = progress >= def.requirement;
        }
        break;
      case 'special':
        if (def.id === 'max_referral' || def.id === 'five_max_referrals') {
          progress = maxReferrals;
          unlocked = progress >= def.requirement;
        }
        break;
    }

    achievements.push({
      ...def,
      unlocked,
      progress: Math.min(progress, def.requirement),
    });
  });

  return achievements;
}

export function groupAchievementsByCategory(achievements: Achievement[]): AchievementCategory[] {
  const categories: Record<string, AchievementCategory> = {
    orders: { id: 'orders', name: 'Заказы', icon: 'Package', achievements: [] },
    referrals: { id: 'referrals', name: 'Рефералы', icon: 'Users', achievements: [] },
    earnings: { id: 'earnings', name: 'Заработок', icon: 'DollarSign', achievements: [] },
    tenure: { id: 'tenure', name: 'Стаж', icon: 'Calendar', achievements: [] },
    vehicle: { id: 'vehicle', name: 'Транспорт', icon: 'Bike', achievements: [] },
    special: { id: 'special', name: 'Особые', icon: 'Star', achievements: [] },
  };

  achievements.forEach((achievement) => {
    if (categories[achievement.category]) {
      categories[achievement.category].achievements.push(achievement);
    }
  });

  return Object.values(categories).filter((cat) => cat.achievements.length > 0);
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'bronze':
      return 'from-amber-600 to-amber-800';
    case 'silver':
      return 'from-slate-400 to-slate-600';
    case 'gold':
      return 'from-yellow-400 to-yellow-600';
    case 'platinum':
      return 'from-purple-400 to-purple-600';
    default:
      return 'from-gray-400 to-gray-600';
  }
}

export function getTierBadgeColor(tier: string): string {
  switch (tier) {
    case 'bronze':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'silver':
      return 'bg-slate-100 text-slate-800 border-slate-300';
    case 'gold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'platinum':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}
