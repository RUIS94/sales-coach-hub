import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Radio,
  ClipboardCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const navItems = [
  { title: "Manager View", url: "/", icon: LayoutDashboard },
  { title: "Attention Queue", url: "/queue", icon: AlertTriangle },
  { title: "Commit Queue", url: "/commit-queue", icon: Zap },
  { title: "Prep Packs", url: "/prep", icon: FileText },
  { title: "Run 1:1", url: "/session", icon: Radio },
  { title: "Post-1:1", url: "/summary", icon: ClipboardCheck },
  { title: "Insights", url: "/insights", icon: BarChart3 },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();

  return (
    <aside
      className={`flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 ${collapsed ? 'w-[72px]' : 'w-[240px]'} shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="text-sm font-bold tracking-tight text-foreground">SAM</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground'}`}
              activeClassName="bg-sidebar-accent text-foreground"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full h-8 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
