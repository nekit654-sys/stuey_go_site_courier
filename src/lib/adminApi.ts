import { ADMIN_PANEL_URL } from '@/components/admin/constants';

interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  message?: string;
  [key: string]: unknown;
}

class AdminApiClient {
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  private async request<T = unknown>(
    body: Record<string, unknown>,
    requiresAuth: boolean = true
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Требуется авторизация');
      }
      headers['X-Auth-Token'] = token;
    }

    const response = await fetch(ADMIN_PANEL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Авторизация
  async login(username: string, password: string) {
    return this.request<{ success: boolean; token: string; message?: string }>(
      { action: 'login', username, password },
      false
    );
  }

  async resetPassword(username: string, newPassword: string, resetToken: string) {
    return this.request<{ success: boolean; message?: string }>(
      { action: 'reset_password', username, newPassword, resetToken },
      false
    );
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ success: boolean; message?: string }>({
      action: 'change_password',
      currentPassword,
      newPassword,
    });
  }

  // Админы
  async getAdmins() {
    return this.request<{ success: boolean; admins: Record<string, unknown>[] }>({
      action: 'get_admins',
    });
  }

  async addAdmin(username: string, password: string) {
    return this.request<{ success: boolean; message?: string }>({
      action: 'add_admin',
      username,
      password,
    });
  }

  async deleteAdmin(adminId: number) {
    return this.request<{ success: boolean; message?: string }>({
      action: 'delete_admin',
      adminId,
    });
  }

  // Курьеры
  async getCouriers(page: number = 1, perPage: number = 50) {
    return this.request<{
      success: boolean;
      couriers: Record<string, unknown>[];
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
    }>({
      action: 'get_couriers',
      page,
      per_page: perPage,
    });
  }

  async updateCourier(userId: number, updates: Record<string, unknown>) {
    return this.request<{ success: boolean; message?: string }>({
      action: 'update_courier',
      user_id: userId,
      ...updates,
    });
  }

  async deleteCourier(userId: number) {
    return this.request<{ success: boolean; message?: string }>({
      action: 'delete_courier',
      user_id: userId,
    });
  }

  // Выплаты
  async getPayouts(status?: string) {
    const body: Record<string, unknown> = { action: 'get_payouts' };
    if (status) {
      body.status = status;
    }
    return this.request<{ success: boolean; payouts: Record<string, unknown>[] }>(body);
  }

  async updatePayoutStatus(payoutId: number, status: string) {
    return this.request<{ success: boolean; message?: string }>({
      action: 'update_payout_status',
      payout_id: payoutId,
      status,
    });
  }

  // Статистика
  async getCompanyStats() {
    const response = await fetch(`${ADMIN_PANEL_URL}?action=company_stats`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': this.getAuthToken(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async getRevenueChart() {
    const response = await fetch(`${ADMIN_PANEL_URL}?action=revenue_chart`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': this.getAuthToken(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async getPayoutsChart() {
    const response = await fetch(`${ADMIN_PANEL_URL}?action=payouts_chart`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': this.getAuthToken(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  // Activity Log
  async getActivityLog() {
    const response = await fetch(`${ADMIN_PANEL_URL}?action=activity`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': this.getAuthToken(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async deleteActivities(ids: number[]) {
    return this.request<{ success: boolean; deleted: number }>(
      { action: 'delete_activities', ids },
      true
    );
  }
}

export const adminApi = new AdminApiClient();