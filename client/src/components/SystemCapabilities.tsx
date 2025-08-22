import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Bell, 
  TrendingUp, 
  FileCheck, 
  Users, 
  Fuel,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  UserCheck,
  Zap,
  Database,
  Lock,
  Globe,
  ArrowRightLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TransferRequest {
  id: string;
  clientName: string;
  fromDealer: string;
  toDealer: string;
  status: "pending" | "approved" | "rejected";
  timestamp: Date;
}

interface ComplianceItem {
  id: string;
  name: string;
  status: "compliant" | "warning" | "expired";
  expiryDate: Date;
  progress: number;
}

interface PriceAlert {
  id: string;
  type: "petrol" | "diesel";
  currentPrice: number;
  change: number;
  timestamp: Date;
}

export default function SystemCapabilities() {
  const [activeDemo, setActiveDemo] = useState("transfers");
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([
    {
      id: "TR001",
      clientName: "Kashmir Motors Ltd",
      fromDealer: "Valley Fuel Station",
      toDealer: "City Petroleum Hub",
      status: "pending",
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: "TR002",
      clientName: "Transport Services Co",
      fromDealer: "Highway Fuels",
      toDealer: "Valley Fuel Station",
      status: "approved",
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    }
  ]);

  const [complianceItems] = useState<ComplianceItem[]>([
    {
      id: "C001",
      name: "Fire Safety Certificate",
      status: "compliant",
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
      progress: 85
    },
    {
      id: "C002",
      name: "Environmental Clearance",
      status: "warning",
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      progress: 45
    },
    {
      id: "C003",
      name: "Trade License",
      status: "compliant",
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      progress: 95
    },
    {
      id: "C004",
      name: "GST Registration",
      status: "compliant",
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 400),
      progress: 100
    }
  ]);

  const [priceAlerts] = useState<PriceAlert[]>([
    {
      id: "PA001",
      type: "petrol",
      currentPrice: 106.31,
      change: 2.15,
      timestamp: new Date()
    },
    {
      id: "PA002",
      type: "diesel",
      currentPrice: 92.76,
      change: -0.84,
      timestamp: new Date()
    }
  ]);

  const [liveMetrics, setLiveMetrics] = useState({
    activeTransfers: 2,
    complianceScore: 92,
    priceUpdates: 4,
    systemUptime: 99.8
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        activeTransfers: Math.floor(Math.random() * 5) + 1,
        complianceScore: Math.floor(Math.random() * 10) + 90,
        priceUpdates: Math.floor(Math.random() * 8) + 1,
        systemUptime: parseFloat((99 + Math.random()).toFixed(1))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleTransferApproval = (id: string, action: "approved" | "rejected") => {
    setTransferRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: action } : req
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
      case "approved":
        return "text-green-600 bg-green-50";
      case "warning":
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "expired":
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <motion.section 
      className="py-16 bg-gradient-to-b from-slate-50 to-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Live System Capabilities
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Experience the power of Kashmir Valley's most advanced petroleum management system. 
            Real-time operations, automated workflows, and intelligent monitoring - all in action.
          </p>
        </motion.div>

        {/* Live Metrics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Transfers</p>
                  <p className="text-2xl font-bold text-primary">{liveMetrics.activeTransfers}</p>
                </div>
                <ArrowRightLeft className="w-8 h-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Compliance Score</p>
                  <p className="text-2xl font-bold text-green-600">{liveMetrics.complianceScore}%</p>
                </div>
                <Shield className="w-8 h-8 text-green-600/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Price Updates</p>
                  <p className="text-2xl font-bold text-secondary">{liveMetrics.priceUpdates}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">System Uptime</p>
                  <p className="text-2xl font-bold text-accent">{liveMetrics.systemUptime}%</p>
                </div>
                <Zap className="w-8 h-8 text-accent/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interactive Demo Tabs */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transfers">Transfer Management</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Tracker</TabsTrigger>
            <TabsTrigger value="monitoring">Price Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="transfers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5" />
                  Live Transfer Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transferRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{request.clientName}</span>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600">
                          From <strong>{request.fromDealer}</strong> to <strong>{request.toDealer}</strong>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(request.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleTransferApproval(request.id, "approved")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleTransferApproval(request.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Smart Feature:</strong> Transfer requests are automatically validated against dealer 
                    agreements and client history. Suspicious transfers trigger instant alerts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Automated Compliance Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceItems.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-slate-600" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <Progress value={item.progress} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Valid until: {item.expiryDate.toLocaleDateString()}</span>
                        <span>{item.progress}% Complete</span>
                      </div>
                      {item.status === "warning" && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                          <AlertTriangle className="w-3 h-3" />
                          Renewal required within 30 days
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Button className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Bell className="w-4 h-4 mr-2" />
                    Set Reminders
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Real-time Price Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priceAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            alert.type === "petrol" ? "bg-yellow-100" : "bg-blue-100"
                          }`}>
                            <Fuel className={`w-6 h-6 ${
                              alert.type === "petrol" ? "text-yellow-600" : "text-blue-600"
                            }`} />
                          </div>
                          <div>
                            <p className="font-semibold capitalize">{alert.type}</p>
                            <p className="text-2xl font-bold">₹{alert.currentPrice}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            alert.change > 0 ? "text-red-600" : "text-green-600"
                          }`}>
                            {alert.change > 0 ? "+" : ""}{alert.change.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500">Today's change</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-primary mx-auto mb-1" />
                      <p className="text-xs text-slate-600">Analytics</p>
                      <p className="text-sm font-semibold">Live</p>
                    </div>
                    <div className="text-center p-3 bg-secondary/10 rounded-lg">
                      <Database className="w-6 h-6 text-secondary mx-auto mb-1" />
                      <p className="text-xs text-slate-600">Data Points</p>
                      <p className="text-sm font-semibold">24/7</p>
                    </div>
                    <div className="text-center p-3 bg-accent/10 rounded-lg">
                      <Globe className="w-6 h-6 text-accent mx-auto mb-1" />
                      <p className="text-xs text-slate-600">Coverage</p>
                      <p className="text-sm font-semibold">Valley-wide</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Key Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Lock className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bank-Grade Security</h3>
              <p className="text-sm text-slate-600">
                256-bit encryption, multi-factor authentication, and role-based access control 
                protect sensitive dealer and client data.
              </p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <UserCheck className="w-10 h-10 text-secondary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Instant Verification</h3>
              <p className="text-sm text-slate-600">
                Employee credentials and certifications verified in real-time across 
                all registered petroleum outlets in Kashmir Valley.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Zap className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-slate-600">
                Process transfer requests, generate reports, and access data in milliseconds 
                with our optimized cloud infrastructure.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}