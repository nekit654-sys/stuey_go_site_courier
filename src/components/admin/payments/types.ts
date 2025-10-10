export interface CsvRow {
  external_id: string;
  lead_created_at: string;
  updated_ts: string;
  first_name: string;
  last_name: string;
  phone: string;
  target_city: string;
  status: string;
  eats_order_number: string;
  closed_reason: string;
  utm_campaign: string;
  utm_content: string;
  utm_medium: string;
  utm_source: string;
  utm_term: string;
  creator_username: string;
  reward: string;
}

export interface UploadSummary {
  total_amount: number;
  courier_self: number;
  referrers: number;
  admins: number;
}

export interface UploadResult {
  processed: number;
  skipped: number;
  duplicates: number;
  errors: string[];
  summary: UploadSummary | null;
}

export interface Courier {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  city?: string;
  referral_code: string;
  total_orders: number;
  total_earnings: number;
  created_at: string;
}

export interface PartnerData {
  full_name: string;
  city: string;
  phone_last4: string;
  bonus_amount: number;
  orders_count: number;
}

export interface MatchedCourier extends Courier {
  matched?: boolean;
  partner_bonus?: number;
  partner_orders?: number;
  confidence?: 'high' | 'medium' | 'low';
  match_reason?: string;
}
