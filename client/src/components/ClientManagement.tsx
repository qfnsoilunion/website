import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Car } from "lucide-react";
import { format } from "date-fns";
import AddClientForm from "./Forms/AddClientForm";

interface ClientWithDetails {
  client: {
    id: string;
    clientType: "PRIVATE" | "GOVERNMENT";
    pan: string | null;
    govClientId: string | null;
    name: string;
    contactPerson: string | null;
    mobile: string | null;
    email: string | null;
    gstin: string | null;
  };
  link: {
    id: string;
    status: "ACTIVE" | "INACTIVE";
    dateOfOnboarding: string;
    dateOfOffboarding: string | null;
  };
  vehicles: Array<{
    id: string;
    registrationNumber: string;
    fuelType: string | null;
  }>;
}

interface ClientManagementProps {
  dealerId: string;
}

export default function ClientManagement({ dealerId }: ClientManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch clients for this dealer
  const { data: clients = [], isLoading } = useQuery({
    queryKey: [`/api/dealers/${dealerId}/clients`],
  });

  const filteredClients = (clients as ClientWithDetails[]).filter((client: ClientWithDetails) => 
    client.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.client.pan && client.client.pan.includes(searchTerm.toUpperCase())) ||
    (client.client.mobile && client.client.mobile.includes(searchTerm)) ||
    client.vehicles.some(v => v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Client Management</h2>
          <p className="text-slate-600">Manage your clients and their vehicles</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <AddClientForm 
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
            Search & Manage Clients
          </CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search by name, PAN, mobile, or vehicle..."
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
            <div className="text-center py-8">Loading clients...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>PAN/ID</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Vehicles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Onboard Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client: ClientWithDetails) => (
                    <TableRow key={client.client.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{client.client.name}</div>
                          {client.client.contactPerson && (
                            <div className="text-sm text-slate-600">
                              Contact: {client.client.contactPerson}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.client.clientType === "PRIVATE" ? "default" : "secondary"}>
                          {client.client.clientType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {client.client.clientType === "PRIVATE" 
                          ? client.client.pan 
                          : client.client.govClientId
                        }
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {client.client.mobile && (
                            <div className="text-sm">{client.client.mobile}</div>
                          )}
                          {client.client.email && (
                            <div className="text-sm text-slate-600">{client.client.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Car className="w-4 h-4" />
                          <span className="text-sm">{client.vehicles.length}</span>
                        </div>
                        {client.vehicles.length > 0 && (
                          <div className="text-xs text-slate-600 mt-1">
                            {client.vehicles[0].registrationNumber}
                            {client.vehicles.length > 1 && ` +${client.vehicles.length - 1} more`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.link.status === "ACTIVE" ? "default" : "secondary"}>
                          {client.link.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(client.link.dateOfOnboarding), "MMM d, yyyy")}
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