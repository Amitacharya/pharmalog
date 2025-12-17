import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Filter, Calendar, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLogEntries, useAuditLogs } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";

export default function Reports() {
  const { data: logs, isLoading: logsLoading } = useLogEntries();
  const { data: audits, isLoading: auditsLoading } = useAuditLogs();

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Report Generation Started",
      description: `Generating ${reportType} report. This may take a few moments.`,
    });
  };

  if (logsLoading || auditsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Analytics</h2>
        <p className="text-slate-500">Generate and export compliance reports.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="hover:border-blue-500 transition-colors cursor-pointer border-t-4 border-t-slate-200 hover:border-t-blue-500">
          <CardHeader>
            <div className="mb-2 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle>Equipment Log Report</CardTitle>
            <CardDescription>Detailed history of all activities for specific equipment over a selected period. ({logs?.length || 0} logs available)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => handleGenerateReport("Equipment Log")} data-testid="button-generate-equipment-report">Generate Report</Button>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-500 transition-colors cursor-pointer border-t-4 border-t-slate-200 hover:border-t-emerald-500">
          <CardHeader>
            <div className="mb-2 h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle>User Activity Report</CardTitle>
            <CardDescription>Audit of all actions performed by specific users or roles. ({audits?.length || 0} audit records available)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => handleGenerateReport("User Activity")} data-testid="button-generate-user-report">Generate Report</Button>
          </CardContent>
        </Card>

        <Card className="hover:border-orange-500 transition-colors cursor-pointer border-t-4 border-t-slate-200 hover:border-t-orange-500">
          <CardHeader>
            <div className="mb-2 h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle>PM Compliance Report</CardTitle>
            <CardDescription>Summary of preventive maintenance execution vs schedule.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => handleGenerateReport("PM Compliance")} data-testid="button-generate-pm-report">Generate Report</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Report Generation</CardTitle>
          <CardDescription>Configure filters to generate a specific dataset.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audit">Audit Trail Complete</SelectItem>
                  <SelectItem value="deviation">Deviation Logs</SelectItem>
                  <SelectItem value="usage">Equipment Usage Stats</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select range..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue placeholder="Select format..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Worksheet</SelectItem>
                  <SelectItem value="csv">CSV (Raw Data)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline">Reset</Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
