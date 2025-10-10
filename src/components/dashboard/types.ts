export interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_bonus_earned: number;
  total_bonus_paid: number;
  pending_bonus: number;
  referral_earnings: number;
  total_orders: number;
  total_earnings: number;
}

export interface ReferralProgress {
  id: number;
  referral_name: string;
  referral_phone: string;
  orders_count: number;
  reward_amount: number;
  status: string;
  last_updated: string;
}

export const vehicleOptions = [
  { value: 'walk', label: 'Пешком', icon: 'Footprints' },
  { value: 'bike', label: 'Велосипед', icon: 'Bike' },
  { value: 'scooter', label: 'Самокат', icon: 'CircleArrowRight' },
  { value: 'car', label: 'Автомобиль', icon: 'Car' },
];
