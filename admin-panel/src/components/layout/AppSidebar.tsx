import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  FileCheck,
  Menu,
  X,
  CalendarRange
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_CONFIG } from "@/lib/site-config";
import MeshGradientBackground from "@/components/MeshGradientBackground";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const adminNavSections: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Candidates", url: "/admin/candidates", icon: Users },
      { title: "Voters", url: "/admin/voters", icon: UserCheck },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { title: "Verification", url: "/admin/verify", icon: FileCheck },
      { title: "Elections", url: "/admin/elections", icon: CalendarRange },
      { title: "Results", url: "/admin/results", icon: BarChart3 },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navSections = adminNavSections;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (url: string) => location.pathname === url;

  const SidebarContent = () => (
    <>
      {/* Mesh Gradient Background - Confined to Sidebar */}
      <MeshGradientBackground className="absolute inset-0" />

      {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 px-4 py-6 border-b border-border/40 min-h-[85px]">
          <img src="/logo1.png" alt={SITE_NAME} className="w-10 h-10 object-contain" style={{ mixBlendMode: 'screen' }} />
          {!isCollapsed && (
          <div className="flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-2">
            <span className="font-bold text-lg text-foreground truncate">{SITE_NAME}</span>
            <span className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">{SITE_CONFIG.tagline}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">
                  {section.label}
                </span>
              </div>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.url}>
                  <button
                    onClick={() => {
                      navigate(item.url);
                      setIsMobileOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive(item.url)
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

        {/* User section */}
      <div className="relative z-10 p-4 border-t border-border/40 bg-background/20 backdrop-blur-md">
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center border border-border/50">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase font-bold">{user.role}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          className={cn(
            "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
            !isCollapsed ? "justify-start" : "justify-center"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle - Hidden when sidebar is open to remove 'close' X as requested */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-background/80 backdrop-blur-lg rounded-xl shadow-xl border border-border/50 ring-1 ring-white/10"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-all duration-500"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen border-r border-border/40 flex flex-col transition-all duration-500 ease-in-out",
          isCollapsed ? "w-[80px]" : "w-72",
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Inner shadow wrapper - prevents Clipping */}
        <div className="flex flex-col h-full w-full bg-background overflow-hidden relative">
          <SidebarContent />
        </div>

        {/* Desktop Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-4 top-24 w-8 h-8 bg-background border border-border rounded-xl items-center justify-center shadow-xl z-50 hover:bg-secondary hover:scale-110 active:scale-95 transition-all text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </>
  );
}
