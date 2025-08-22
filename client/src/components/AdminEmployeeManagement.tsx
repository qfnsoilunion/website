import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Users } from "lucide-react";
import { format } from "date-fns";

interface EmployeeWithDetails {
  employment: {
    id: string;
    currentStatus: string;
    dateOfJoining: string;
    dateOfResignation: string | null;
  };
  person: {
    id: string;
    name: string;
    aadhaar: string;
    mobile: string | null;
    email: string | null;
  };
  dealer: {
    id: string;
    outletName: string;
    location: string;
  };
}

export default function AdminEmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  // Search employees globally
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: [`/api/employees/search`, searchTerm],
    enabled: searchTerm.length >= 3,
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchTerm.match(/^\d+$/)) {
        params.append('aadhaar', searchTerm);
      } else if (searchTerm.includes('@') || searchTerm.match(/^\d{10}$/)) {
        params.append('mobile', searchTerm);
      } else {
        params.append('name', searchTerm);
      }
      return fetch(`/api/employees/search?${params}`, {
        credentials: 'include'
      }).then(res => res.json());
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Employee Management</h2>
        <p className="text-slate-600">Search and manage employee records across all dealers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Global Employee Search
          </CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search by name, Aadhaar, or mobile number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          {searchTerm && searchTerm.length < 3 && (
            <p className="text-sm text-slate-500">Enter at least 3 characters to search</p>
          )}
        </CardHeader>
        <CardContent>
          {!searchTerm || searchTerm.length < 3 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600">Enter search criteria to find employees</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">Searching employees...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Aadhaar</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Current Employer</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No employees found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  searchResults.map((employee: any) => (
                    <TableRow key={`${employee.id}-${employee.employments?.[0]?.id || 'no-emp'}`}>
                      <TableCell className="font-medium">
                        {employee.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {employee.aadhaar}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {employee.mobile && (
                            <div className="text-sm">{employee.mobile}</div>
                          )}
                          {employee.email && (
                            <div className="text-sm text-slate-600">{employee.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {employee.employments && employee.employments.length > 0 ? (
                          <div>
                            <div className="font-medium">
                              {employee.employments.find((emp: any) => emp.currentStatus === "ACTIVE")?.dealerId || "None"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">No employment history</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {employee.employments && employee.employments.length > 0 ? (
                          <div>
                            {employee.employments
                              .filter((emp: any) => emp.currentStatus === "ACTIVE")
                              .map((emp: any) => (
                                <div key={emp.id}>
                                  {format(new Date(emp.dateOfJoining), "MMM d, yyyy")}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {employee.employments && employee.employments.length > 0 ? (
                          <div className="space-y-1">
                            {employee.employments.map((emp: any) => (
                              <Badge 
                                key={emp.id}
                                variant={emp.currentStatus === "ACTIVE" ? "default" : "secondary"}
                              >
                                {emp.currentStatus}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="secondary">No Record</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}