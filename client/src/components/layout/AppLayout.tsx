import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Activity, 
  ClipboardList, 
  FlaskConical,
  Menu,
  Bell,
  User,
  Users,
  CalendarClock,
  FileBarChart,
  LogOut,
  ShieldCheck,
  KeyRound,
  Clock,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import logo from "@assets/generated_images/minimalist_pharma_logo_symbol.png";

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const WARNING_THRESHOLD = 60 * 1000; // 1 minute warning

interface NavItem {
  icon: any;
  label: string;
  href: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ClipboardList, label: "E-Log Book", href: "/logs" },
  { icon: FlaskConical, label: "Equipment Master", href: "/equipment" },
  { icon: CalendarClock, label: "PM Scheduling", href: "/pm" },
  { icon: FileBarChart, label: "Reports", href: "/reports" },
  { icon: Users, label: "User Management", href: "/users", roles: ["Admin", "QA"] },
  { icon: Activity, label: "Audit Trail", href: "/audit", roles: ["Admin", "QA", "Supervisor"] },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(SESSION_TIMEOUT);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Session timeout logic
  useEffect(() => {
    const handleActivity = () => setLastActivity(Date.now());
    
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, []);

  useEffect(() => {
    let warningShown = false;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      const remaining = SESSION_TIMEOUT - elapsed;
      setSessionTimeLeft(Math.max(0, remaining));
      
      if (remaining <= 0) {
        clearInterval(interval);
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity.",
          variant: "destructive",
        });
        logout();
      } else if (remaining <= WARNING_THRESHOLD && !warningShown) {
        warningShown = true;
        toast({
          title: "Session Expiring Soon",
          description: "Your session will expire in 1 minute due to inactivity.",
        });
      } else if (remaining > WARNING_THRESHOLD) {
        warningShown = false;
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastActivity, logout, toast]);

  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      setIsChangePasswordOpen(false);
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || "");
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-purple-100 text-purple-700 border-purple-200";
      case "QA": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Supervisor": return "bg-teal-100 text-teal-700 border-teal-200";
      case "Engineer": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-0 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100">
      <div className="flex h-16 items-center border-b border-slate-800/50 px-6">
        <Link href="/" className="flex items-center gap-3 font-display font-bold text-xl tracking-tight">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
             <img src={logo} alt="PharmaLog" className="h-5 w-5 brightness-0 invert" />
          </div>
          <span className="text-white">Pharma<span className="text-blue-400">Log</span></span>
        </Link>
      </div>
      
      <div className="px-4 py-6 flex-1">
        <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Core Modules
        </div>
        <nav className="flex flex-col gap-0.5">
          {filteredNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  location === item.href
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-800/50 p-4">
        <div className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 p-3 ring-1 ring-slate-700/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-slate-600 shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white font-semibold">
                {user ? getInitials(user.fullName) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden flex-1">
              <span className="truncate text-sm font-semibold text-white">
                {user?.fullName || "User"}
              </span>
              <Badge variant="outline" className={cn("text-[10px] w-fit mt-0.5", getRoleBadgeColor(user?.role || ""))}>
                {user?.role || "User"}
              </Badge>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Session</span>
              <div className={cn(
                "flex items-center gap-1 font-mono",
                sessionTimeLeft <= WARNING_THRESHOLD ? "text-amber-400" : "text-emerald-400"
              )}>
                <Clock className="h-3 w-3" />
                {formatTimeLeft(sessionTimeLeft)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 lg:block fixed h-full z-30 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen transition-all">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur-sm px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-slate-600">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-r-slate-800">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                {navItems.find((i) => i.href === location)?.label || "Dashboard"}
              </h1>
              <span className="text-xs text-slate-500 hidden md:block">
                GMP Compliant Electronic Logbook System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 mr-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                System Active
              </Badge>
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                {new Date().toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-slate-200 hover:bg-slate-50" data-testid="button-user-menu">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {user ? getInitials(user.fullName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline font-medium">{user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-slate-500">{user?.role} • {user?.department}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)} data-testid="button-change-password">
                  <KeyRound className="h-4 w-4 mr-2" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-rose-600 focus:text-rose-600" data-testid="button-logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 p-6 lg:p-8 bg-gradient-to-br from-slate-100 to-slate-50">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>

        <footer className="border-t bg-white px-6 py-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>PharmaLog v2.4.1 • 21 CFR Part 11 Compliant</span>
            <span>Audit Trail Enabled • All actions are logged</span>
          </div>
        </footer>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                data-testid="input-current-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                data-testid="input-new-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                data-testid="input-confirm-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword} data-testid="button-submit-password">
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
