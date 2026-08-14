import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import Maintenance from '@/pages/Maintenance';
import { ShieldAlert } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const { user } = useAuth();
  const location = useLocation();

  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [maintenanceTitle, setMaintenanceTitle] = useState<string>('');
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>('');
  const [estimatedEndTime, setEstimatedEndTime] = useState<string>('');
  const [allowAdminBypass, setAllowAdminBypass] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPublicSettings = useCallback(async () => {
    try {
      const { data } = await api.get('/settings/public');
      setMaintenanceMode(!!data.maintenanceMode);
      setMaintenanceTitle(data.maintenanceTitle || 'System Under Maintenance');
      setMaintenanceMessage(data.maintenanceMessage || 'Vora is currently undergoing scheduled maintenance.');
      setEstimatedEndTime(data.estimatedEndTime || '');
      setAllowAdminBypass(data.allowAdminBypass ?? true);
    } catch (error) {
      console.error('Failed to check maintenance mode status', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicSettings();
    // Poll public settings every 30 seconds
    const interval = setInterval(fetchPublicSettings, 30000);
    return () => clearInterval(interval);
  }, [fetchPublicSettings]);

  // Allow admin login page access if admin bypass is allowed
  const isLoginPage = location.pathname === '/login';
  const isAdminUser = user?.role === 'admin';

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (maintenanceMode) {
    if (isAdminUser && allowAdminBypass) {
      return (
        <div className="relative min-h-screen">
          <div className="bg-amber-500 text-black px-4 py-2 text-center text-xs md:text-sm font-bold flex items-center justify-center gap-2 z-[9999] relative border-b border-amber-600 shadow-md">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>MAINTENANCE MODE IS ACTIVE — You are viewing the client page with Admin Bypass privileges</span>
          </div>
          {children}
        </div>
      );
    }

    if (isLoginPage && allowAdminBypass) {
      return <>{children}</>;
    }

    return (
      <Maintenance
        title={maintenanceTitle}
        message={maintenanceMessage}
        estimatedEndTime={estimatedEndTime}
        onRefresh={fetchPublicSettings}
        allowAdminBypass={allowAdminBypass}
      />
    );
  }

  return <>{children}</>;
}
