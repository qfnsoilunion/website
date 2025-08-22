import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, UserMinus } from "lucide-react";
import { format } from "date-fns";
import AddEmployeeForm from "./Forms/AddEmployeeForm";
import EndEmploymentForm from "@/components/Forms/EndEmploymentForm";
import { api } from "@/lib/api";

interface Employee {
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
}

interface EmployeeManagementProps {
  dealerId: string;
}

export default function EmployeeManagement({ dealerId }: EmployeeManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEndForm, setShowEndForm] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch employees for this dealer
  const { data: employees = [], isLoading } = useQuery({
    queryKey: [`/api/dealers/${dealerId}/employees`],
  });

  // Search employees
  const searchEmployeesQuery = useQuery({
    queryKey: [`/api/employees/search`, searchTerm],
    enabled: searchTerm.length >= 3,
  });

  const filteredEmployees = (employees as Employee[]).filter((emp: Employee) => 
    emp.person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.person.aadhaar.includes(searchTerm) ||
    (emp.person.mobile && emp.person.mobile.includes(searchTerm))
  );

  const handleEndEmployment = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEndForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-slate-600">Manage your staff and their records</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <AddEmployeeForm 
              open={showAddForm} 
              onClose={() => setShowAddForm(false)} 
              dealerId={dealerId}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Manage Employees
          </CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search by name, Aadhaar, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading employees...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Aadhaar</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee: Employee) => (
                    <TableRow key={employee.employment.id}>
                      <TableCell className="font-medium">
                        {employee.person.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {employee.person.aadhaar}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {employee.person.mobile && (
                            <div className="text-sm">{employee.person.mobile}</div>
                          )}
                          {employee.person.email && (
                            <div className="text-sm text-slate-600">{employee.person.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(employee.employment.dateOfJoining), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.employment.currentStatus === "ACTIVE" ? "default" : "secondary"}>
                          {employee.employment.currentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {employee.employment.currentStatus === "ACTIVE" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEndEmployment(employee)}
                          >
                            <UserMinus className="w-4 h-4 mr-1" />
                            End Employment
                          </Button>
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

      {selectedEmployee && (
        <EndEmploymentForm
          open={showEndForm}
          onClose={() => {
            setShowEndForm(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
}