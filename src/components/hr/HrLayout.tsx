import { ReactNode, useState, lazy, Suspense } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHrRole } from "@/hooks/useHrRole";
import {
  LayoutDashboard, Users, UserPlus, UserMinus, Clock, CalendarOff, Wallet,
  FolderKanban, ListChecks, Heart, GraduationCap, Star, Package,
  ShieldCheck, Building2, BarChart3, FileText, AlertTriangle, Settings,
  Menu, X, Bell, MessageSquare, Search, LogOut, ChevronDown, ChevronRight,
  User, GitBranch, Briefcase, Brain, TrendingUp, Smile, ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import HrChatbot from "./HrChatbot";
import HrDirectorySearch from "./HrDirectorySearch";

interface NavItem {
  label: string;
  path: string;
  icon: any;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/hr", icon: LayoutDashboard },
  { label: "My Profile", path: "/hr/my-profile", icon: User },
  { label: "Employees", path: "/hr/employees", icon: Users },
  { label: "Lifecycle", path: "/hr/lifecycle", icon: GitBranch, roles: ["super_admin", "hr_admin"] },
  { label: "Offboarding", path: "/hr/offboarding", icon: UserMinus, roles: ["super_admin", "hr_admin"] },
  { label: "Departments", path: "/hr/departments", icon: Building2 },
  { label: "Recruitment", path: "/hr/recruitment", icon: UserPlus },
  { label: "Applications", path: "/hr/applications", icon: ClipboardList },
  { label: "Attendance", path: "/hr/attendance", icon: Clock },
  { label: "Leave Management", path: "/hr/leave", icon: CalendarOff },
  { label: "Payroll", path: "/hr/payroll", icon: Wallet, roles: ["super_admin", "hr_admin", "finance"] },
  { label: "Projects", path: "/hr/projects", icon: FolderKanban },
  { label: "Tasks", path: "/hr/tasks", icon: ListChecks },
  { label: "Volunteers", path: "/hr/volunteers", icon: Heart },
  { label: "Training / LMS", path: "/hr/training", icon: GraduationCap },
  { label: "Performance", path: "/hr/performance", icon: Star },
  { label: "Assets", path: "/hr/assets", icon: Package },
  { label: "Compliance", path: "/hr/compliance", icon: ShieldCheck },
  { label: "Reports", path: "/hr/reports", icon: BarChart3, roles: ["super_admin", "hr_admin", "manager"] },
  { label: "HR Policies", path: "/hr/policies", icon: FileText },
  { label: "Grievances", path: "/hr/grievances", icon: AlertTriangle },
  { label: "Settings", path: "/hr/settings", icon: Settings, roles: ["super_admin", "hr_admin"] },
  { label: "CSR Projects", path: "/hr/csr", icon: Briefcase },
  { label: "Skills Mapping", path: "/hr/skills", icon: Brain },
  { label: "Volunteer Impact", path: "/hr/volunteer-impact", icon: TrendingUp },
  { label: "Engagement", path: "/hr/engagement", icon: Smile },
  { label: "Notifications", path: "/hr/notifications", icon: Bell },
];

const HrLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { roles, loading, hasAnyRole } = useHrRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !hasAnyRole()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <ShieldCheck className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access the HR Portal.</p>
        <Button onClick={() => navigate("/get-involved")}>Sign In</Button>
      </div>
    );
  }

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.some((r) => roles.includes(r as any))
  );

  const isActive = (path: string) =>
    path === "/hr" ? location.pathname === "/hr" : location.pathname.startsWith(path);

  const initials = user.email?.slice(0, 2).toUpperCase() || "HR";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const sidebarNav = (
    <nav className="flex flex-col gap-1 p-3 overflow-y-auto flex-1">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors shrink-0",
              active
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-sidebar-background transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex items-center gap-2 p-4 border-b h-16">
          {sidebarOpen && (
            <span className="font-bold text-lg text-foreground truncate">HR Portal</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        {sidebarNav}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-sidebar-background flex flex-col">
            <div className="flex items-center justify-between p-4 border-b h-16">
              <span className="font-bold text-lg text-foreground">HR Portal</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {sidebarNav}
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Nav */}
        <header className="h-16 border-b bg-background flex items-center gap-4 px-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <HrDirectorySearch />

          <div className="flex-1" />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          </Button>

          <Button variant="ghost" size="icon">
            <MessageSquare className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-xs text-muted-foreground">{user.email}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/hr/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* AI HR Assistant */}
      <HrChatbot />
    </div>
  );
};

export default HrLayout;
