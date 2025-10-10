export interface AdminRequest {
  id: number;
  name: string;
  phone: string;
  city: string;
  screenshot_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total: number;
  new: number;
  approved: number;
  rejected: number;
}

export interface AdminUser {
  id: number;
  username: string;
  created_at: string;
}

export interface ReferralStats {
  overall_stats: any;
  all_referrals: any[];
  top_referrers: any[];
}

export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AdminForm {
  username: string;
  password: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
