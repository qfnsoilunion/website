import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Download,
  Filter,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ComplianceItem {
  id: string;
  type: "LICENSE" | "INSPECTION" | "SAFETY" | "ENVIRONMENTAL" | "TAX";
  title: string;
  description: string;
  status: "COMPLIANT" | "WARNING" | "NON_COMPLIANT" | "PENDING";
  dueDate: string;
  lastUpdated: string;
  documentUrl?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

interface ComplianceTrackerProps {
  dealerId?: string; // Optional for admin view
  isAdmin?: boolean;
}

const statusConfig = {
  COMPLIANT: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "Compliant",
    variant: "default" as const,
  },
  WARNING: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    label: "Warning",
    variant: "secondary" as const,
  },
  NON_COMPLIANT: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Non-Compliant",
    variant: "destructive" as const,
  },
  PENDING: {
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Pending",
    variant: "outline" as const,
  },
};

const typeConfig = {
  LICENSE: { label: "Licenses", color: "bg-blue-500" },
  INSPECTION: { label: "Inspections", color: "bg-purple-500" },
  SAFETY: { label: "Safety", color: "bg-red-500" },
  ENVIRONMENTAL: { label: "Environmental", color: "bg-green-500" },
  TAX: { label: "Tax Compliance", color: "bg-yellow-500" },
};

export default function ComplianceTracker({ dealerId, isAdmin = false }: ComplianceTrackerProps) {
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Mock data for demonstration
  const mockCompliance: ComplianceItem[] = [
    {
      id: "1",
      type: "LICENSE",
      title: "Petroleum Retail License",
      description: "Annual retail petroleum license renewal",
      status: "COMPLIANT",
      dueDate: "2025-03-15",
      lastUpdated: "2024-03-10",
      priority: "HIGH",
    },
    {
      id: "2",
      type: "SAFETY",
      title: "Fire Safety Certificate",
      description: "Fire department safety compliance certificate",
      status: "WARNING",
      dueDate: "2025-01-20",
      lastUpdated: "2024-08-15",
      priority: "HIGH",
    },
    {
      id: "3",
      type: "ENVIRONMENTAL",
      title: "Environmental Clearance",
      description: "Pollution control board clearance",
      status: "COMPLIANT",
      dueDate: "2025-06-30",
      lastUpdated: "2024-06-25",
      priority: "MEDIUM",
    },
    {
      id: "4",
      type: "TAX",
      title: "GST Compliance",
      description: "Goods and Services Tax compliance status",
      status: "NON_COMPLIANT",
      dueDate: "2024-12-31",
      lastUpdated: "2024-12-01",
      priority: "HIGH",
    },
    {
      id: "5",
      type: "INSPECTION",
      title: "Annual Safety Inspection",
      description: "Scheduled safety inspection by regulatory authority",
      status: "PENDING",
      dueDate: "2025-02-15",
      lastUpdated: "2024-12-10",
      priority: "MEDIUM",
    },
  ];

  const { data: compliance = mockCompliance, isLoading } = useQuery<ComplianceItem[]>({
    queryKey: ["/api/compliance", dealerId],
    enabled: !!dealerId || isAdmin,
  });

  const filteredCompliance = compliance.filter(item => {
    const typeMatch = selectedType === "ALL" || item.type === selectedType;
    const statusMatch = selectedStatus === "ALL" || item.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  const getStatusCounts = () => {
    return {
      COMPLIANT: compliance.filter(item => item.status === "COMPLIANT").length,
      WARNING: compliance.filter(item => item.status === "WARNING").length,
      NON_COMPLIANT: compliance.filter(item => item.status === "NON_COMPLIANT").length,
      PENDING: compliance.filter(item => item.status === "PENDING").length,
    };
  };

  const statusCounts = getStatusCounts();

  const ComplianceCard = ({ item }: { item: ComplianceItem }) => {
    const config = statusConfig[item.status];
    const typeInfo = typeConfig[item.type];
    const Icon = config.icon;

    const isOverdue = new Date(item.dueDate) < new Date() && item.status !== "COMPLIANT";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`${config.borderColor} ${config.bgColor} border-l-4`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${typeInfo.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                    {isOverdue && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Updated: {new Date(item.lastUpdated).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                {item.documentUrl && (
                  <Button size="sm" variant="outline" className="text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    Document
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Compliance Tracker
          </h1>
          <p className="text-slate-600">
            {isAdmin ? "Monitor compliance across all dealers" : "Track your regulatory compliance status"}
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          const Icon = config.icon;
          
          return (
            <Card key={status} className={`${config.borderColor} border-l-4`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{config.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{count}</p>
                  </div>
                  <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {Object.entries(typeConfig).map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCompliance.map((item) => (
          <ComplianceCard key={item.id} item={item} />
        ))}
      </div>

      {filteredCompliance.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No compliance items found</h3>
            <p className="text-slate-600">
              {selectedType !== "ALL" || selectedStatus !== "ALL" 
                ? "Try adjusting your filters to see more results."
                : "All compliance requirements are up to date."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}