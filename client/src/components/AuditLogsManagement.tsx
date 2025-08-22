import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/api";

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: any;
  createdAt: string;
}

export default function AuditLogsManagement() {
  const [entityFilter, setEntityFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch audit logs
  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: [`/api/audit`, entityFilter, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (entityFilter) params.append('entity', entityFilter);
      if (searchTerm) params.append('id', searchTerm);
      return fetch(`/api/audit?${params}`, {
        credentials: 'include'
      }).then(res => res.json());
    },
  });

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "CREATE":
        return "default";
      case "UPDATE":
        return "secondary";
      case "DELETE":
      case "END_EMPLOYMENT":
        return "destructive";
      case "APPROVE":
        return "default";
      case "REJECT":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case "DEALER":
        return "🏪";
      case "EMPLOYMENT":
        return "👤";
      case "CLIENT":
        return "🏢";
      case "TRANSFER":
        return "↔️";
      default:
        return "📄";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Audit Logs</h2>
        <p className="text-slate-600">Track all administrative actions and system changes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            System Activity Log
          </CardTitle>
          <div className="flex gap-4">
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Entities</SelectItem>
                <SelectItem value="DEALER">Dealers</SelectItem>
                <SelectItem value="EMPLOYMENT">Employment</SelectItem>
                <SelectItem value="CLIENT">Clients</SelectItem>
                <SelectItem value="TRANSFER">Transfers</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative flex-1">
              <Input
                placeholder="Search by entity ID..."
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
            <div className="text-center py-8">Loading audit logs...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-slate-400" />
                        <p className="text-slate-600">No audit logs found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log: AuditLog) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="text-sm font-medium">
                              {format(new Date(log.createdAt), "MMM d, yyyy")}
                            </div>
                            <div className="text-xs text-slate-600">
                              {format(new Date(log.createdAt), "h:mm a")}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.actor}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getEntityIcon(log.entity)}</span>
                          <span>{log.entity}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.entityId.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {log.metadata && (
                          <div className="text-sm text-slate-600">
                            {Object.keys(log.metadata).length > 0 && (
                              <details className="cursor-pointer">
                                <summary className="hover:text-slate-900">View metadata</summary>
                                <pre className="text-xs mt-2 p-2 bg-slate-50 rounded overflow-x-auto">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
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