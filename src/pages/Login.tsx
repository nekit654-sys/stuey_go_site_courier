import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/admin/LoginForm';
import AdminHeader from '@/components/admin/AdminHeader';
import CompactAdminTabs from '@/components/admin/CompactAdminTabs';
import SettingsModal from '@/components/admin/SettingsModal';
import { useAdminAuth } from '@/components/admin/useAdminAuth';
import { useAdminData } from '@/components/admin/useAdminData';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { API_URL } from '@/config/api';
import { useBotProtection } from '@/hooks/useBotProtection';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('people');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);

  const {
    credentials,
    isLoading,
    isAuthenticated,
    authToken,
    passwordForm,
    adminForm,
    admins,
    handleInputChange,
    handleLogin,
    handleLogout,
    setPasswordForm,
    setAdminForm,
    loadAdmins,
    changePassword,
    addAdmin,
    deleteAdmin,
  } = useAdminAuth();

  const {
    lastUpdate,
    referralStats,
    isLoadingReferrals,
    allCouriers,
    isLoadingCouriers,
    loadReferralStats,
    loadAllCouriers,
    deleteAllUsers,
  } = useAdminData(authToken, isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    loadAllCouriers();
    loadReferralStats();
    loadWithdrawalsCount();
    loadAdmins();

    const interval = setInterval(() => {
      loadAllCouriers();
      loadReferralStats();
      loadWithdrawalsCount();
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const loadWithdrawalsCount = async () => {
    try {
      const response = await fetch(`${API_URL}?route=withdrawal&action=list`, {
        headers: {
          'X-Auth-Token': authToken,
        },
      });
      const data = await response.json();
      if (data.success) {
        const pending = (data.requests || []).filter((r: any) => r.status === 'pending').length;
        setPendingWithdrawals(pending);
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    }
  };

  const handleLoginSuccess = async (token: string) => {
    await loadAdmins(token);
  };

  if (!isAuthenticated) {
    return (
      <LoginForm
        credentials={credentials}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={(e) => handleLogin(e, handleLoginSuccess)}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto pb-20 sm:pb-4">
          <AdminHeader
            onSettingsClick={() => setIsSettingsOpen(true)}
            onLogout={handleLogout}
          />

          <CompactAdminTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            allCouriers={allCouriers}
            isLoadingCouriers={isLoadingCouriers}
            onRefreshCouriers={loadAllCouriers}
            authToken={authToken}
            referralStats={referralStats}
            isLoadingReferrals={isLoadingReferrals}
            onRefreshReferrals={loadReferralStats}
            onDeleteAllUsers={deleteAllUsers}
            pendingWithdrawalsCount={pendingWithdrawals}
            passwordForm={passwordForm}
            onPasswordFormChange={setPasswordForm}
            onChangePassword={changePassword}
            adminForm={adminForm}
            onAdminFormChange={setAdminForm}
            onAddAdmin={addAdmin}
            onDeleteAdmin={deleteAdmin}
            onLoadAdmins={loadAdmins}
            admins={admins}
            lastUpdate={lastUpdate}
          />
        </div>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          admins={admins}
          adminForm={adminForm}
          onAdminFormChange={setAdminForm}
          onAddAdmin={addAdmin}
          onDeleteAdmin={deleteAdmin}
          onLoadAdmins={loadAdmins}
          passwordForm={passwordForm}
          onPasswordFormChange={setPasswordForm}
          onChangePassword={changePassword}
        />
      </div>


    </>
  );
};

export default Login;