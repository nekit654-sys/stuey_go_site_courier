export interface Courier {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  city?: string;
  referral_code: string;
  external_id?: string;
  match_score?: number;
  matches?: string[];
}

export interface CsvRow {
  external_id: string;
  creator_username: string;
  phone: string;
  first_name: string;
  last_name: string;
  target_city: string;
  eats_order_number: string | number;
  reward: string | number;
  status: string;
}

export interface UploadResult {
  success: boolean;
  processed: number;
  skipped: number;
  duplicates: number;
  errors: string[];
  unmatched?: UnmatchedCourier[];
  summary: {
    total_amount: number;
    courier_self: number;
    referrers: number;
    admins: number;
  };
}

export interface UnmatchedCourier {
  external_id: string;
  full_name: string;
  phone: string;
  city: string;
  suggested_couriers: Courier[];
}
