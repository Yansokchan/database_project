import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Users,
  UserPlus,
  Briefcase,
  Package,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
} from "lucide-react";

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
}

const SidebarLink = ({
  to,
  icon: Icon,
  label,
  isCollapsed,
  isActive,
}: SidebarLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300 ease-spring group hover:bg-accent",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground/80"
      )}
    >
      <Icon
        size={20}
        className={cn(
          "flex-shrink-0 transition-transform",
          isActive ? "text-primary" : "text-muted-foreground",
          isCollapsed ? "mx-auto" : ""
        )}
      />

      {!isCollapsed && (
        <span className="transition-opacity duration-200">{label}</span>
      )}

      {isCollapsed && (
        <div className="absolute left-full ml-2 rounded-md px-2 py-1 bg-popover text-sm text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm whitespace-nowrap pointer-events-none">
          {label}
        </div>
      )}
    </Link>
  );
};

interface SidebarGroupProps {
  title: string;
  children: React.ReactNode;
  isCollapsed: boolean;
}

const SidebarGroup = ({ title, children, isCollapsed }: SidebarGroupProps) => {
  return (
    <div className="mb-6">
      {!isCollapsed && (
        <h3 className="text-xs uppercase font-medium text-muted-foreground mb-2 px-3">
          {title}
        </h3>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
};

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  // Modified to not automatically open the sidebar
  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  // Notify parent component of initial collapsed state
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [onCollapseChange, isCollapsed]);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileSidebar}
          className="bg-background/90 backdrop-blur-sm border shadow-sm"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 bg-background border-r border-border transition-all duration-300 ease-spring",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "flex flex-col glass-card"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1
            className={cn(
              "font-semibold text-xl overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            Dashboard
          </h1>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden lg:flex"
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="lg:hidden"
          >
            <X size={18} />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3">
          {/* Home Link */}
          <SidebarGroup title="Navigation" isCollapsed={isCollapsed}>
            <SidebarLink
              to="/"
              icon={Home}
              label="Dashboard"
              isCollapsed={isCollapsed}
              isActive={isActive("/")}
            />
          </SidebarGroup>

          <SidebarGroup title="Management" isCollapsed={isCollapsed}>
            <SidebarLink
              to="/customers"
              icon={Users}
              label="Customers"
              isCollapsed={isCollapsed}
              isActive={isActive("/customers")}
            />
            <SidebarLink
              to="/employees"
              icon={Briefcase}
              label="Employees"
              isCollapsed={isCollapsed}
              isActive={isActive("/employees")}
            />
            <SidebarLink
              to="/products"
              icon={Package}
              label="Products"
              isCollapsed={isCollapsed}
              isActive={isActive("/products")}
            />
            <SidebarLink
              to="/orders"
              icon={ShoppingCart}
              label="Orders"
              isCollapsed={isCollapsed}
              isActive={isActive("/orders")}
            />
          </SidebarGroup>
        </nav>
      </aside>
    </>
  );
}
