import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCrmRole } from "@/hooks/useCrmRole";
import {
  LayoutDashboard, School, Users, FileText, Calendar,
  Image, AlertTriangle, CreditCard, Download, Eye,
  Menu, X, LogOut, ChevronRight, GraduationCap, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/wash-program/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["crm_admin", "supervisor", "facilitator", "finance", "funder"] },
  { path: "/wash-program/dashboard/schools", label: "Schools", icon: School, roles: ["crm_admin", "supervisor", "facilitator", "funder"] },
  { path: "/wash-program/dashboard/teachers", label: "Teachers", icon: UserCheck, roles: ["crm_admin", "supervisor", "facilitator", "funder"] },
  { path: "/wash-program/dashboard/students", label: "Students", icon: GraduationCap, roles: ["crm_admin", "supervisor", "facilitator"] },
  { path: "/wash-program/dashboard/facilitators", label: "Facilitators", icon: Users, roles: ["crm_admin", "supervisor"] },
  { path: "/wash-program/dashboard/sessions", label: "Sessions", icon: FileText, roles: ["crm_admin", "supervisor", "facilitator", "funder"] },
  { path: "/wash-program/dashboard/attendance", label: "Attendance", icon: Calendar, roles: ["crm_admin", "supervisor", "facilitator"] },
  { path: "/wash-program/dashboard/gallery", label: "Media Gallery", icon: Image, roles: ["crm_admin", "supervisor", "facilitator", "funder"] },
  { path: "/wash-program/dashboard/issues", label: "Issues", icon: AlertTriangle, roles: ["crm_admin", "supervisor", "facilitator"] },
  { path: "/wash-program/dashboard/payments", label: "Payments", icon: CreditCard, roles: ["crm_admin", "finance", "facilitator"] },
  { path: "/wash-program/dashboard/reports", label: "Reports", icon: Download, roles: ["crm_admin", "supervisor", "funder"] },
  { path: "/wash-program/dashboard/funder", label: "Funder Portal", icon: Eye, roles: ["crm_admin", "funder"] },
];

interface CrmLayoutProps {
  children: ReactNode;
}

const CrmLayout = ({ children }: CrmLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { roles, loading, hasAnyRole } = useCrmRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/wash-program/login");
    return null;
  }

  if (!hasAnyRole()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-heading font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have a CRM role assigned. Contact an administrator for access.</p>
          <Button variant="outline" onClick={() => navigate("/")}>Return to Homepage</Button>
        </div>
      </div>
    );
  }

  const filteredNav = navItems.filter(item =>
    item.roles.some(r => roles.includes(r as any))
  );

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-background border-r border-sidebar-border transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <Link to="/wash-program/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-sm">W</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm text-sidebar-foreground">WASH CRM</h2>
              <p className="text-[10px] text-muted-foreground capitalize">{roles[0]?.replace("crm_", "")}</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/wash-program/dashboard" className="hover:text-foreground">WASH CRM</Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CrmLayout;
