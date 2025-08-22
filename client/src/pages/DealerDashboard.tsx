import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { roleManager } from "@/lib/role";
import {
  LayoutDashboard,
  Users,
  Building,
  Shield,
  Menu,
  X as CloseIcon,
  LogOut,
} from "lucide-react";

import { api, type HomeMetrics, type Dealer } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmployeeManagement from "@/components/EmployeeManagement";
import ClientManagement from "@/components/ClientManagement";
import DealerLogin from "../components/DealerLogin";
import ComplianceTracker from "../components/ComplianceTracker";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "employees", label: "Employees", icon: Users },
  { id: "clients", label: "Clients", icon: Building },
  { id: "compliance", label: "Compliance", icon: Shield },
];

export default function DealerDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dealerId, setDealerId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Set the role to DEALER when this component loads
  useEffect(() => {
    roleManager.set("DEALER");
  }, []);

  const { data: metrics } = useQuery<HomeMetrics>({
    queryKey: ["/api/metrics/home"],
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });

  const { data: dealer } = useQuery<Dealer>({
    queryKey: ["/api/dealer/profile", dealerId],
    enabled: !!dealerId && isAuthenticated,
  });

  const handleLoginSuccess = (authDealerId: string) => {
    setDealerId(authDealerId);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setDealerId("");
    setActiveSection("overview");
  };

  // Check if dealer is authenticated
  if (!isAuthenticated) {
    return <DealerLogin onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <CloseIcon className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 px-4 bg-accent text-white">
          <h1 className="text-lg font-semibold">Dealer Portal</h1>
        </div>
        
        <nav className="mt-8">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center px-6 py-3 text-left transition-colors
                  ${activeSection === item.id 
                    ? 'bg-accent text-white border-r-4 border-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Dealer Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          {dealer && (
            <div className="mb-4 p-3 bg-slate-50 rounded">
              <p className="text-sm font-medium text-slate-900">{dealer.outletName}</p>
              <p className="text-xs text-slate-600">{dealer.legalName}</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-0">
        {activeSection === "overview" && (
          <motion.div 
            className="p-4 lg:p-6 pt-16 lg:pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">
                Welcome, {dealer?.outletName || "Dealer"}
              </h1>
              <p className="text-slate-600 text-sm lg:text-base">
                Manage your operations and stay compliant
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-slate-600 truncate">My Employees</p>
                      <p className="text-xl lg:text-2xl font-bold text-slate-900">12</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 lg:mt-4">
                    <Badge variant="secondary" className="text-accent bg-accent/10 text-xs">
                      Active Staff
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-slate-600 truncate">My Clients</p>
                      <p className="text-xl lg:text-2xl font-bold text-slate-900">45</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <Building className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 lg:mt-4">
                    <Badge variant="secondary" className="text-secondary bg-secondary/10 text-xs">
                      Registered
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-slate-600 truncate">Compliance</p>
                      <p className="text-xl lg:text-2xl font-bold text-slate-900">95%</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 lg:mt-4">
                    <Badge variant="secondary" className="text-green-600 bg-green-50 text-xs">
                      Excellent
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveSection("employees")}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Manage Staff</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveSection("clients")}
                  >
                    <Building className="w-6 h-6" />
                    <span className="text-sm">Client Registry</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveSection("compliance")}
                  >
                    <Shield className="w-6 h-6" />
                    <span className="text-sm">Compliance</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-sm">Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeSection === "employees" && (
          <motion.div 
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EmployeeManagement dealerId={dealerId} />
          </motion.div>
        )}

        {activeSection === "clients" && (
          <motion.div 
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ClientManagement dealerId={dealerId} />
          </motion.div>
        )}

        {activeSection === "compliance" && (
          <motion.div 
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ComplianceTracker dealerId={dealerId} isAdmin={false} />
          </motion.div>
        )}
      </div>
    </div>
  );
}