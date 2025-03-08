import { usePageTransition } from "@/lib/animations";
import Sidebar from "./Sidebar";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function Layout({
  children,
  title,
  description,
  action,
}: LayoutProps) {
  const { className: transitionClass } = usePageTransition();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Function to handle sidebar collapse state changes
  const handleSidebarCollapseChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar onCollapseChange={handleSidebarCollapseChange} />

      <main
        className={`flex-1 transition-all duration-300 ease-spring relative ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <div className={`p-6 md:p-8 min-h-screen ${transitionClass}`}>
          {(title || description || action) && (
            <div className="mb-8 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  {title && (
                    <h1 className="text-3xl font-semibold tracking-tight">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-muted-foreground mt-2">{description}</p>
                  )}
                </div>
                {action && <div>{action}</div>}
              </div>
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
