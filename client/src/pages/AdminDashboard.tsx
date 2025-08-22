import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { roleManager } from "@/lib/role";
import {
  LayoutDashboard,
  Store,
  Users,
  Building,
  ArrowRightLeft,
  FileText,
  Plus,
  TrendingUp,
  UserPlus,
  Check,
  X,
  Shield,
  Menu,
  X as CloseIcon,
  RotateCcw,
} from "lucide-react";

import { api, type HomeMetrics, type Dealer, type TransferRequest } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminEmployeeManagement from "@/components/AdminEmployeeManagement";
import AdminClientManagement from "@/components/AdminClientManagement";
import AuditLogsManagement from "@/components/AuditLogsManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable from "../components/DataTable";
import AddDealerForm from "../components/Forms/AddDealerForm";
import AdminLogin from "../components/AdminLogin";
import CreateDealerProfile from "../components/CreateDealerProfile";
import ResetPasswordDialog from "../components/ResetPasswordDialog";
import ComplianceTracker from "../components/ComplianceTracker";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "dealers", label: "Dealers", icon: Store },
  { id: "employees", label: "Employees", icon: Users },
  { id: "clients", label: "Clients", icon: Building },
  { id: "transfers", label: "Transfers", icon: ArrowRightLeft },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "audit", label: "Audit Logs", icon: FileText },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [showAddDealer, setShowAddDealer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDealerProfile, setShowDealerProfile] = useState(false);
  const [selectedDealerForProfile, setSelectedDealerForProfile] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedDealerForReset, setSelectedDealerForReset] = useState<{ id: string; name: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Set the role to ADMIN when this component loads
  useEffect(() => {
    roleManager.set("ADMIN");
  }, []);

  const { data: metrics } = useQuery<HomeMetrics>({
    queryKey: ["/api/metrics/home"],
    refetchInterval: 30000,
  });

  const { data: dealers } = useQuery<Dealer[]>({
    queryKey: ["/api/admin/dealers"],
  });

  const { data: transfers } = useQuery<TransferRequest[]>({
    queryKey: ["/api/transfers"],
  });

  const pendingTransfers = transfers?.filter(t => t.status === "PENDING") || [];

  // Check if admin is authenticated
  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
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
        <div className="flex items-center justify-center h-16 px-4 bg-primary text-white">
          <h1 className="text-lg font-semibold">Admin Portal</h1>
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
                    ? 'bg-primary text-white border-r-4 border-white' 
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
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">System Overview</h1>
              <p className="text-slate-600 text-sm lg:text-base">Monitor and manage the entire union registry</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-slate-600 truncate">Active Dealers</p>
                      <p className="text-xl lg:text-2xl font-bold text-slate-900">{metrics?.activeDealers || 0}</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <Store className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 lg:mt-4">
                    <Badge variant="secondary" className="text-accent bg-accent/10 text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-slate-600 truncate">Total Employees</p>
                      <p className="text-xl lg:text-2xl font-bold text-slate-900">{metrics?.activeEmployees || 0}</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 lg:mt-4">
                    <Badge variant="secondary" className="text-accent bg-accent/10 text-xs">
                      +{metrics?.todaysJoins || 0} today
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-slate-600 truncate">Active Clients</p>
                      <p className="text-xl lg:text-2xl font-bold text-slate-900">{metrics?.activeClients || 0}</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <Building className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 lg:mt-4">
                    <Badge variant="secondary" className="text-accent bg-accent/10 text-xs">
                      Active registrations
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-slate-600 truncate">Pending Transfers</p>
                      <p className="text-xl lg:text-2xl font-bold text-slate-900">{pendingTransfers.length}</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-neutral rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <ArrowRightLeft className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 lg:mt-4">
                    {pendingTransfers.length > 0 ? (
                      <Badge variant="destructive" className="text-xs">Requires attention</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-accent bg-accent/10 text-xs">
                        All clear
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">System initialized</p>
                      <p className="text-xs text-slate-600">Union registry system is now operational</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeSection === "dealers" && (
          <motion.div 
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Dealer Management</h1>
                <p className="text-slate-600">Manage registered petroleum dealers and their credentials</p>
              </div>
              <Button onClick={() => setShowAddDealer(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Dealer
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Dealers</CardTitle>
              </CardHeader>
              <CardContent>
                {dealers && (
                  <DataTable
                    data={dealers}
                    columns={[
                      {
                        header: "Dealer Name",
                        accessorKey: "legalName",
                      },
                      {
                        header: "Outlet",
                        accessorKey: "outletName",
                      },
                      {
                        header: "Location", 
                        accessorKey: "location",
                      },
                      {
                        header: "Status",
                        accessorKey: "status",
                        cell: ({ row }) => (
                          <Badge variant={row.original.status === "ACTIVE" ? "default" : "secondary"}>
                            {row.original.status}
                          </Badge>
                        ),
                      },
                      {
                        header: "Actions",
                        cell: ({ row }) => (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedDealerForProfile(row.original.id);
                                setShowDealerProfile(true);
                              }}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Create Login
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedDealerForReset({ id: row.original.id, name: row.original.legalName });
                                setShowResetPassword(true);
                              }}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Reset Password
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Other sections remain the same for now */}
        {activeSection === "employees" && (
          <motion.div 
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AdminEmployeeManagement />
          </motion.div>
        )}

        {activeSection === "clients" && (
          <motion.div 
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AdminClientManagement />
          </motion.div>
        )}

        {activeSection === "transfers" && (
          <motion.div 
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Transfer Requests</h1>
              <p className="text-slate-600">Review and approve client transfer requests</p>
            </div>
            
            {transfers && transfers.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingTransfers.map((transfer) => (
                      <div key={transfer.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Transfer Request #{transfer.id}</p>
                            <p className="text-sm text-slate-600">From: {transfer.fromDealerId}</p>
                            <p className="text-sm text-slate-600">To: {transfer.toDealerId}</p>
                            <p className="text-sm text-slate-600">Client: {transfer.clientId}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p className="text-slate-600">No pending transfer requests.</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {activeSection === "compliance" && (
          <motion.div 
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ComplianceTracker isAdmin={true} />
          </motion.div>
        )}

        {activeSection === "audit" && (
          <motion.div 
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AuditLogsManagement />
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AddDealerForm 
        open={showAddDealer} 
        onClose={() => setShowAddDealer(false)} 
      />
      
      {selectedDealerForProfile && (
        <CreateDealerProfile
          open={showDealerProfile}
          onClose={() => {
            setShowDealerProfile(false);
            setSelectedDealerForProfile(null);
          }}
          dealerId={selectedDealerForProfile}
          dealerName={dealers?.find(d => d.id === selectedDealerForProfile)?.legalName || ""}
        />
      )}

      {selectedDealerForReset && (
        <ResetPasswordDialog
          open={showResetPassword}
          onClose={() => {
            setShowResetPassword(false);
            setSelectedDealerForReset(null);
          }}
          dealerId={selectedDealerForReset.id}
          dealerName={selectedDealerForReset.name}
        />
      )}
    </div>
  );
}