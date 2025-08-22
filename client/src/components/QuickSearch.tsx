import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Building, Search, Phone, Mail, Car, Calendar, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { api } from "@/lib/api";

export default function QuickSearch() {
  const [employeeSearch, setEmployeeSearch] = useState({
    aadhaar: "",
    name: "", 
    mobile: "",
  });

  const [clientSearch, setClientSearch] = useState({
    pan: "",
    vehicle: "",
    name: "",
    org: "",
  });

  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");

  // Employee search query
  const { data: employeeResults = [], isLoading: employeeLoading } = useQuery({
    queryKey: ["employee-search", employeeSearchTerm],
    enabled: employeeSearchTerm.length >= 3,
    queryFn: () => {
      const params = new URLSearchParams();
      if (employeeSearchTerm.match(/^\d+$/)) {
        params.append('aadhaar', employeeSearchTerm);
      } else if (employeeSearchTerm.includes('+') || employeeSearchTerm.match(/^\d{10}$/)) {
        params.append('mobile', employeeSearchTerm);
      } else {
        params.append('name', employeeSearchTerm);
      }
      return fetch(`/api/employees/search?${params}`, {
        credentials: 'include'
      }).then(res => res.json());
    },
  });

  // Client search query
  const { data: clientResults = [], isLoading: clientLoading } = useQuery({
    queryKey: ["client-search", clientSearchTerm],
    enabled: clientSearchTerm.length >= 3,
    queryFn: () => {
      const params = new URLSearchParams();
      if (clientSearchTerm.match(/^[A-Z]{5}[0-9]{4}[A-Z]$/)) {
        params.append('pan', clientSearchTerm);
      } else if (clientSearchTerm.match(/^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{4}$/)) {
        params.append('vehicle', clientSearchTerm);
      } else {
        params.append('name', clientSearchTerm);
      }
      return fetch(`/api/clients/search?${params}`, {
        credentials: 'include'
      }).then(res => res.json());
    },
  });

  const handleEmployeeSearch = () => {
    const searchValue = employeeSearch.aadhaar || employeeSearch.name || employeeSearch.mobile;
    setEmployeeSearchTerm(searchValue);
  };

  const handleClientSearch = () => {
    const searchValue = clientSearch.pan || clientSearch.vehicle || clientSearch.name || clientSearch.org;
    setClientSearchTerm(searchValue);
  };

  return (
    <motion.section 
      className="py-16 bg-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Quick Search
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="bg-slate-50">
            <CardContent className="p-6">
              <Tabs defaultValue="employee" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="employee" className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Employee Search</span>
                  </TabsTrigger>
                  <TabsTrigger value="client" className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>Client Search</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="employee" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Aadhaar Number"
                      value={employeeSearch.aadhaar}
                      onChange={(e) => setEmployeeSearch(prev => ({ ...prev, aadhaar: e.target.value }))}
                    />
                    <Input
                      placeholder="Name"
                      value={employeeSearch.name}
                      onChange={(e) => setEmployeeSearch(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Mobile Number"
                      value={employeeSearch.mobile}
                      onChange={(e) => setEmployeeSearch(prev => ({ ...prev, mobile: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleEmployeeSearch} className="w-full md:w-auto">
                    <Search className="w-4 h-4 mr-2" />
                    Search Employee
                  </Button>
                  
                  {employeeSearchTerm && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Search Results</h3>
                      {employeeLoading ? (
                        <div className="text-center py-4">Searching employees...</div>
                      ) : employeeResults.length === 0 ? (
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-slate-600 text-center">No employees found</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {employeeResults.map((employee: any) => (
                            <Card key={employee.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-2">
                                    <h4 className="font-semibold">{employee.name}</h4>
                                    <p className="text-sm text-slate-600 font-mono">Aadhaar: {employee.aadhaar}</p>
                                    {employee.mobile && (
                                      <div className="flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm">{employee.mobile}</span>
                                      </div>
                                    )}
                                    {employee.email && (
                                      <div className="flex items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{employee.email}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right space-y-1">
                                    {employee.employments && employee.employments.map((emp: any) => (
                                      <div key={emp.id}>
                                        <Badge variant={emp.currentStatus === "ACTIVE" ? "default" : "secondary"}>
                                          {emp.currentStatus}
                                        </Badge>
                                        <div className="text-xs text-slate-600 mt-1">
                                          Since: {format(new Date(emp.dateOfJoining), "MMM yyyy")}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="client" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="PAN Number"
                      value={clientSearch.pan}
                      onChange={(e) => setClientSearch(prev => ({ ...prev, pan: e.target.value }))}
                    />
                    <Input
                      placeholder="Vehicle Registration"
                      value={clientSearch.vehicle}
                      onChange={(e) => setClientSearch(prev => ({ ...prev, vehicle: e.target.value }))}
                    />
                    <Input
                      placeholder="Client Name"
                      value={clientSearch.name}
                      onChange={(e) => setClientSearch(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Organization Name"
                      value={clientSearch.org}
                      onChange={(e) => setClientSearch(prev => ({ ...prev, org: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleClientSearch} className="w-full md:w-auto">
                    <Search className="w-4 h-4 mr-2" />
                    Search Client
                  </Button>
                  
                  {clientSearchTerm && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Search Results</h3>
                      {clientLoading ? (
                        <div className="text-center py-4">Searching clients...</div>
                      ) : clientResults.length === 0 ? (
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-slate-600 text-center">No clients found</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {clientResults.map((client: any) => (
                            <Card key={client.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold">{client.name}</h4>
                                      <Badge variant={client.clientType === "PRIVATE" ? "default" : "secondary"}>
                                        {client.clientType}
                                      </Badge>
                                    </div>
                                    
                                    {client.clientType === "PRIVATE" && client.pan && (
                                      <p className="text-sm text-slate-600 font-mono">PAN: {client.pan}</p>
                                    )}
                                    
                                    {client.clientType === "GOVERNMENT" && client.govClientId && (
                                      <p className="text-sm text-slate-600 font-mono">Org ID: {client.govClientId}</p>
                                    )}
                                    
                                    {client.contactPerson && (
                                      <p className="text-sm text-slate-600">Contact: {client.contactPerson}</p>
                                    )}
                                    
                                    <div className="flex flex-wrap gap-4">
                                      {client.mobile && (
                                        <div className="flex items-center gap-1">
                                          <Phone className="w-4 h-4" />
                                          <span className="text-sm">{client.mobile}</span>
                                        </div>
                                      )}
                                      {client.email && (
                                        <div className="flex items-center gap-1">
                                          <Mail className="w-4 h-4" />
                                          <span className="text-sm">{client.email}</span>
                                        </div>
                                      )}
                                      {client.gstin && (
                                        <div className="text-sm">
                                          <span className="text-slate-600">GSTIN: </span>
                                          <span className="font-mono">{client.gstin}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <div className="flex items-center gap-1 text-sm text-slate-600">
                                      <Car className="w-4 h-4" />
                                      <span>Vehicles on record</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}
