import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuditLogs } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";

export default function AuditTrail() {
  const { data: audits, isLoading, isError } = useAuditLogs(200);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAudits = audits?.filter(item =>
    item.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.entityType.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Error Loading Audit Trail</h3>
          <p className="text-slate-500">Failed to load audit logs. Please try again.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Audit Trail</h2>
        <p className="text-slate-500">Secure, immutable record of all system activities (21 CFR Part 11).</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search audit logs..."
                  className="pl-9 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-audit"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-3 w-3" />
                Filter
              </Button>
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-3 w-3" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[160px]">Timestamp (UTC)</TableHead>
                <TableHead className="w-[140px]">User / Role</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
                <TableHead className="w-[140px]">Entity</TableHead>
                <TableHead className="hidden md:table-cell">Old Value</TableHead>
                <TableHead className="hidden md:table-cell">New Value</TableHead>
                <TableHead className="text-right">Audit ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    {searchTerm ? "No audit logs found matching your search." : "No audit logs available."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAudits.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50" data-testid={`row-audit-${item.id}`}>
                    <TableCell className="font-mono text-xs text-slate-600">{new Date(item.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.userId}</span>
                        <span className="text-xs text-slate-500">User</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${
                        item.action === 'CREATE' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                        item.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                        item.action === 'DELETE' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                        item.action === 'APPROVE' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                        item.action === 'REJECT' ? 'bg-rose-50 text-rose-700 ring-rose-600/20' :
                        'bg-slate-50 text-slate-700 ring-slate-600/20'
                      }`} data-testid={`badge-action-${item.action}`}>
                        {item.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">{item.entityType}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-mono text-slate-500 truncate max-w-[150px]" title={item.oldValue || "-"}>
                      {item.oldValue || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-mono text-slate-900 truncate max-w-[150px]" title={item.newValue || "-"}>
                      {item.newValue || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400 text-right">{item.id}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
