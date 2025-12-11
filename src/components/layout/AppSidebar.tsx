import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Vote, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronDown,
  User,
  FileCheck,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_CONFIG } from "@/lib/site-config";

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
      { title: "Results", url: "/admin/results", icon: BarChart3 },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

const voterNavSections: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      { title: "Dashboard", url: "/voter/dashboard", icon: LayoutDashboard },
      { title: "Vote", url: "/vote", icon: Vote },
      { title: "Results", url: "/results/public", icon: BarChart3 },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { title: "Profile", url: "/voter/profile", icon: User },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navSections = user?.role === 'admin' ? adminNavSections : voterNavSections;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (url: string) => location.pathname === url;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Vote className="w-5 h-5 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-lg text-foreground">{SITE_NAME}</span>
            <span className="text-xs text-muted-foreground">{SITE_CONFIG.tagline}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-xs font-semibold text-muted-foreground tracking-wider">
                  {section.label}
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
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
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
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
      <div className="p-4 border-t border-sidebar-border">
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-2">Log out</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-card border border-border"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
          isCollapsed ? "w-[72px]" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarContent />
        
        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full items-center justify-center shadow-soft hover:shadow-card transition-shadow"
        >
          <ChevronDown 
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              isCollapsed ? "-rotate-90" : "rotate-90"
            )} 
          />
        </button>
      </aside>
    </>
  );
}
