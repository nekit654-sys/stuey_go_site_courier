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

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState('activity');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
    requests,
    stats,
    autoRefresh,
    lastUpdate,
    referralStats,
    isLoadingReferrals,
    allCouriers,
    isLoadingCouriers,
    setAutoRefresh,
    loadRequests,
    updateRequestStatus,
    deleteRequest,
    loadReferralStats,
    loadAllCouriers,
    deleteAllUsers,
  } = useAdminData(authToken, isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    loadRequests();
    loadAllCouriers();
    loadReferralStats();
    loadWithdrawalsCount();

    const interval = setInterval(() => {
      loadRequests();
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
    await Promise.all([
      loadRequests(token, true),
      loadAdmins(token)
    ]);
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
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto pb-20 sm:pb-4">
          <AdminHeader
            onSettingsClick={() => setIsSettingsOpen(true)}
            onLogout={handleLogout}
          />

          <CompactAdminTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            requests={requests}
            stats={stats}
            autoRefresh={autoRefresh}
            lastUpdate={lastUpdate}
            onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
            onRefresh={() => loadRequests()}
            onUpdateStatus={updateRequestStatus}
            onDelete={deleteRequest}
            allCouriers={allCouriers}
            isLoadingCouriers={isLoadingCouriers}
            onRefreshCouriers={loadAllCouriers}
            authToken={authToken}
            referralStats={referralStats}
            isLoadingReferrals={isLoadingReferrals}
            onRefreshReferrals={loadReferralStats}
            onDeleteAllUsers={deleteAllUsers}
            onViewImage={setSelectedImage}
            pendingRequestsCount={stats.new}
            pendingWithdrawalsCount={pendingWithdrawals}
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

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <Button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
            >
              <Icon name="X" size={24} />
            </Button>
            <img
              src={selectedImage}
              alt="Скриншот"
              className="w-full h-auto rounded-lg border-4 border-white"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Login;