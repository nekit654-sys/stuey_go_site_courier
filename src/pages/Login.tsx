import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/admin/LoginForm';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import SettingsModal from '@/components/admin/SettingsModal';
import { useAdminAuth } from '@/components/admin/useAdminAuth';
import { useAdminData } from '@/components/admin/useAdminData';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
  } = useAdminData(authToken, isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === 'analytics') {
      loadReferralStats();
    } else if (activeTab === 'couriers') {
      loadAllCouriers();
    } else if (activeTab === 'income') {
      loadAdmins();
    }
  }, [activeTab, isAuthenticated]);

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <AdminHeader
          onSettingsClick={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
        />

        <AdminTabs
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
  );
};

export default Login;
