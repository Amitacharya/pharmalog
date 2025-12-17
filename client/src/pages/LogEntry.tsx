import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Lock, Plus, Save, Filter, MoreHorizontal, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEquipment, useLogEntries, useCreateLogEntry, useSubmitLogEntry, useApproveLogEntry } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth";

export default function LogEntry() {
  const { user } = useAuth();
  const { data: equipment, isLoading: equipmentLoading } = useEquipment();
  const { data: logs, isLoading: logsLoading, isError } = useLogEntries();
  const createLogEntry = useCreateLogEntry();
  const submitLogEntry = useSubmitLogEntry();
  const approveLogEntry = useApproveLogEntry();

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signAction, setSignAction] = useState<"submit" | "approve">("submit");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    equipmentId: "",
    activityType: "",
    startTime: "",
    endTime: "",
    description: "",
    batchNumber: "",
    readings: ""
  });

  const [signatureData, setSignatureData] = useState({
    password: "",
    reason: ""
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateDraft = async () => {
    if (!formData.equipmentId || !formData.activityType || !formData.startTime || !formData.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Convert time strings to full timestamps
    const today = new Date();
    const [startHour, startMin] = formData.startTime.split(':').map(Number);
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHour, startMin);
    
    let endDate: Date | undefined;
    if (formData.endTime) {
      const [endHour, endMin] = formData.endTime.split(':').map(Number);
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHour, endMin);
    }

    try {
      const logEntry = await createLogEntry.mutateAsync({
        equipmentId: formData.equipmentId,
        activityType: formData.activityType as any,
        startTime: startDate.toISOString(),
        endTime: endDate?.toISOString(),
        description: formData.description,
        batchNumber: formData.batchNumber || undefined,
        readings: formData.readings || undefined,
        status: "Draft"
      });
      
      setSelectedLogId(logEntry.id);
      setSignAction("submit");
      setIsSignModalOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create log entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLogId) return;

    try {
      if (signAction === "submit") {
        await submitLogEntry.mutateAsync({
          id: selectedLogId,
          password: signatureData.password,
          reason: signatureData.reason
        });
        toast({
          title: "Entry Submitted",
          description: "Log entry has been signed and submitted for approval.",
        });
      } else {
        await approveLogEntry.mutateAsync({
          id: selectedLogId,
          password: signatureData.password,
          reason: signatureData.reason
        });
        toast({
          title: "Entry Approved",
          description: "Log entry has been approved successfully.",
        });
      }
      
      setIsSignModalOpen(false);
      setFormData({
        equipmentId: "",
        activityType: "",
        startTime: "",
        endTime: "",
        description: "",
        batchNumber: "",
        readings: ""
      });
      setSignatureData({ password: "", reason: "" });
      setSelectedLogId(null);
    } catch (error: any) {
      toast({
        title: "Signature Failed",
        description: error.message || "Failed to sign entry. Please verify your credentials.",
        variant: "destructive",
      });
    }
  };

  const handleApprove = (logId: string) => {
    setSelectedLogId(logId);
    setSignAction("approve");
    setIsSignModalOpen(true);
  };

  const filteredLogs = logs?.filter(log =>
    log.logId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.activityType.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getEquipmentName = (equipmentId: string) => {
    return equipment?.find(eq => eq.id === equipmentId)?.name || equipmentId;
  };

  if (equipmentLoading || logsLoading) {
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
          <h3 className="text-lg font-semibold text-slate-900">Error Loading Log Entries</h3>
          <p className="text-slate-500">Failed to load log entries. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">E-Log Book</h2>
          <p className="text-slate-500">Record equipment activities with 21 CFR Part 11 compliant signatures.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Entry Form */}
        <Card className="lg:col-span-1 border-t-4 border-t-blue-600 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>New Activity Log</CardTitle>
            <CardDescription>All fields are mandatory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Equipment</Label>
              <Select value={formData.equipmentId} onValueChange={(value) => handleFormChange("equipmentId", value)}>
                <SelectTrigger data-testid="select-equipment">
                  <SelectValue placeholder="Search equipment..." />
                </SelectTrigger>
                <SelectContent>
                  {equipment?.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name} ({eq.equipmentId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input 
                  type="time" 
                  value={formData.startTime}
                  onChange={(e) => handleFormChange("startTime", e.target.value)}
                  data-testid="input-start-time"
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input 
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleFormChange("endTime", e.target.value)}
                  data-testid="input-end-time"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={formData.activityType} onValueChange={(value) => handleFormChange("activityType", value)}>
                <SelectTrigger data-testid="select-activity-type">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operation">Operation / Usage</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Calibration">Calibration</SelectItem>
                  <SelectItem value="Sampling">Sampling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Remarks / Observations</Label>
              <Textarea 
                placeholder="Enter detailed observations..." 
                className="min-h-[100px]"
                value={formData.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                data-testid="textarea-description"
              />
            </div>

            <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-500 border">
              <div className="flex justify-between mb-1">
                <span>Logged By:</span>
                <span className="font-mono font-medium text-slate-700">{user?.fullName || "User"}</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="font-mono font-medium text-slate-700">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleCreateDraft}
              disabled={createLogEntry.isPending}
              data-testid="button-create-log"
            >
              <Lock className="mr-2 h-4 w-4" />
              {createLogEntry.isPending ? "Creating..." : "Sign & Submit Entry"}
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Logs List */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Entries</CardTitle>
              <div className="flex gap-2">
                <Input 
                  placeholder="Filter logs..." 
                  className="h-8 w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-filter-logs"
                />
                <Button variant="outline" size="sm" className="h-8"><Filter className="h-3 w-3" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      {searchTerm ? "No log entries found matching your search." : "No log entries available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                      <TableCell className="font-mono text-xs font-medium">{log.logId}</TableCell>
                      <TableCell className="font-medium text-sm">{getEquipmentName(log.equipmentId)}</TableCell>
                      <TableCell className="text-sm">{log.activityType}</TableCell>
                      <TableCell className="text-xs text-slate-500">{log.createdBy}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-500">{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-[10px] px-2 py-0.5",
                          log.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          log.status === "Submitted" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-slate-100 text-slate-600 border-slate-200"
                        )}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.status === "Submitted" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleApprove(log.id)}
                            data-testid={`button-approve-${log.id}`}
                            className="h-6 text-xs"
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* E-Signature Modal */}
      <Dialog open={isSignModalOpen} onOpenChange={setIsSignModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Electronic Signature Required</DialogTitle>
            <DialogDescription>
              {signAction === "submit" 
                ? "Enter credentials to sign and submit this record. This action is immutable."
                : "Enter credentials to approve this record. This action is immutable."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSign}>
            <div className="grid gap-4 py-4">
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200">
                Signing as: <strong>{user?.fullName}</strong> ({user?.username})
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={signatureData.password}
                  onChange={(e) => setSignatureData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  placeholder="Re-enter your password to sign"
                  data-testid="input-signature-password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Signing Reason</Label>
                <Select 
                  value={signatureData.reason}
                  onValueChange={(value) => setSignatureData(prev => ({ ...prev, reason: value }))}
                  required
                >
                  <SelectTrigger data-testid="select-signature-reason">
                    <SelectValue placeholder="Select reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I am the author of this entry">I am the author of this entry</SelectItem>
                    <SelectItem value="I have reviewed this entry">I have reviewed this entry</SelectItem>
                    <SelectItem value="I am approving this entry">I am approving this entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSignModalOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={submitLogEntry.isPending || approveLogEntry.isPending}
                data-testid="button-sign-record"
              >
                {submitLogEntry.isPending || approveLogEntry.isPending ? "Verifying..." : "Sign Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
