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
import { Search, Building, Car } from "lucide-react";

export default function AdminClientManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  // Search clients globally
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: [`/api/clients/search`, searchTerm],
    enabled: searchTerm.length >= 3,
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchTerm.match(/^[A-Z]{5}[0-9]{4}[A-Z]$/)) {
        params.append('pan', searchTerm);
      } else if (searchTerm.match(/^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{4}$/i)) {
        params.append('vehicle', searchTerm);
      } else {
        params.append('name', searchTerm);
      }
      return fetch(`/api/clients/search?${params}`, {
        credentials: 'include'
      }).then(res => res.json());
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Client Management</h2>
        <p className="text-slate-600">Search and manage client registrations across all dealers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Global Client Search
          </CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search by name, PAN, or vehicle registration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
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
              <Building className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600">Enter search criteria to find clients</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">Searching clients...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>PAN/Gov ID</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Current Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No clients found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  searchResults.map((client: any) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{client.name}</div>
                          {client.contactPerson && (
                            <div className="text-sm text-slate-600">
                              Contact: {client.contactPerson}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.clientType === "PRIVATE" ? "default" : "secondary"}>
                          {client.clientType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {client.clientType === "PRIVATE" 
                          ? client.pan 
                          : client.govClientId
                        }
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {client.mobile && (
                            <div className="text-sm">{client.mobile}</div>
                          )}
                          {client.email && (
                            <div className="text-sm text-slate-600">{client.email}</div>
                          )}
                          {client.gstin && (
                            <div className="text-sm">
                              <span className="text-slate-600">GSTIN: </span>
                              <span className="font-mono">{client.gstin}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">REGISTERED</Badge>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Car className="w-4 h-4" />
                            <span>Active</span>
                          </div>
                        </div>
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