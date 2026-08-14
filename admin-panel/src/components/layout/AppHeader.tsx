import { useNavigate } from "react-router-dom";
import { Search, Bell, Globe, User, ChevronDown, Settings, LogOut, Wrench, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Search */}
      {/* Search - Margin on mobile to accommodate sidebar toggle */}
      <div className="flex-1 sm:flex-initial w-full sm:max-w-md ml-14 lg:ml-0">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-9 sm:h-10 pl-9 sm:pl-10 pr-4 bg-secondary/40 border border-transparent rounded-full text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background focus:border-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Maintenance Quick Access Switch */}
        <MaintenanceQuickToggle />

        {/* Notifications */}
        <NotificationsMenu />



        {/* User dropdown with arrow icon */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground">{user?.name || 'User'}</span>
                <span className="text-xs text-muted-foreground capitalize">{user?.role || 'Guest'}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-elevated z-50">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleNavigate('/admin/dashboard')}
            >
              <User className="w-4 h-4 mr-2" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleNavigate('/admin/settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function NotificationsMenu() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/auth/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
    // Initial fetch
    fetchNotifications();

    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/auth/notifications/${id}/read`);
      // Update local state to reflect read status instantly
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/auth/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all read", error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border border-card" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-auto py-1 text-primary hover:text-primary/80" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${notification.isRead ? 'opacity-60' : 'bg-accent/5'}`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${notification.type === 'success' ? 'bg-green-500' :
                    notification.type === 'error' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground/60">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MaintenanceQuickToggle() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/admin/settings');
      setMaintenanceMode(!!data.maintenanceMode);
    } catch {
      // ignore header fetch error silently
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !maintenanceMode;
    setLoading(true);
    try {
      await api.put('/admin/settings', { maintenanceMode: nextState });
      setMaintenanceMode(nextState);
      toast({
        title: nextState ? "Maintenance Mode Activated 🛠️" : "Maintenance Mode Disabled ✅",
        description: nextState 
          ? "Vora Client Page is now in maintenance mode."
          : "Vora Client Page is live and accessible.",
        variant: nextState ? "destructive" : "default"
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update maintenance state.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={handleToggle}
        title={maintenanceMode ? "Click to turn off maintenance mode" : "Click to turn on maintenance mode"}
        className={`flex items-center gap-2 px-3 py-1.5 h-8 rounded-full text-xs font-semibold transition-all ${
          maintenanceMode 
            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 animate-pulse hover:bg-amber-500/30" 
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        }`}
      >
        <Wrench className={`w-3.5 h-3.5 ${maintenanceMode ? 'text-amber-500' : ''}`} />
        <span className="hidden sm:inline">
          {maintenanceMode ? "Maintenance ON" : "Maintenance"}
        </span>
      </Button>
    </div>
  );
}
