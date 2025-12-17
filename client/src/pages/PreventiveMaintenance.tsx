import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon, AlertTriangle, CheckCircle, FileText, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { usePMSchedules, useCreatePMSchedule, useEquipment } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function PreventiveMaintenance() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { data: pmSchedules, isLoading, isError } = usePMSchedules();
  const { data: equipment } = useEquipment();
  const createPMSchedule = useCreatePMSchedule();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    equipmentId: "",
    taskName: "",
    frequency: "",
    nextDue: "",
    status: "Scheduled",
  });

  const resetForm = () => {
    setFormData({
      equipmentId: "",
      taskName: "",
      frequency: "",
      nextDue: "",
      status: "Scheduled",
    });
  };

  const handleCreate = async () => {
    if (!formData.equipmentId || !formData.taskName || !formData.frequency || !formData.nextDue) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPMSchedule.mutateAsync({
        equipmentId: formData.equipmentId,
        taskName: formData.taskName,
        frequency: formData.frequency,
        nextDue: new Date(formData.nextDue).toISOString(),
        status: formData.status,
      });
      toast({
        title: "PM Schedule Created",
        description: `${formData.taskName} has been scheduled.`,
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create PM schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stats = useMemo(() => {
    if (!pmSchedules) return { overdue: 0, dueToday: 0, scheduled: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = pmSchedules.filter(schedule => {
      const dueDate = new Date(schedule.nextDue);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && schedule.status !== "Completed";
    }).length;

    const dueToday = pmSchedules.filter(schedule => {
      const dueDate = new Date(schedule.nextDue);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime() && schedule.status !== "Completed";
    }).length;

    const scheduled = pmSchedules.filter(schedule => {
      const dueDate = new Date(schedule.nextDue);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > today && schedule.status !== "Completed";
    }).length;

    return { overdue, dueToday, scheduled };
  }, [pmSchedules]);

  const getEquipmentName = (equipmentId: string) => {
    return equipment?.find(eq => eq.id === equipmentId)?.name || equipmentId;
  };

  const getScheduleStatus = (schedule: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(schedule.nextDue);
    dueDate.setHours(0, 0, 0, 0);

    if (schedule.status === "Completed") return "Completed";
    if (dueDate < today) return "Overdue";
    if (dueDate.getTime() === today.getTime()) return "Due Today";
    return "Upcoming";
  };

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
          <h3 className="text-lg font-semibold text-slate-900">Error Loading PM Schedules</h3>
          <p className="text-slate-500">Failed to load preventive maintenance data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Preventive Maintenance</h2>
          <p className="text-slate-500">Manage maintenance schedules, work orders, and compliance.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-pm">
              <Plus className="mr-2 h-4 w-4" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create PM Schedule</DialogTitle>
              <DialogDescription>
                Schedule preventive maintenance for equipment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment *</Label>
                <Select
                  value={formData.equipmentId}
                  onValueChange={(value) => setFormData({ ...formData, equipmentId: value })}
                >
                  <SelectTrigger data-testid="select-pm-equipment">
                    <SelectValue placeholder="Select equipment" />
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
              <div className="space-y-2">
                <Label htmlFor="taskName">Task Name *</Label>
                <Input
                  id="taskName"
                  placeholder="e.g., Filter Replacement"
                  value={formData.taskName}
                  onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                  data-testid="input-pm-task"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger data-testid="select-pm-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Semi-Annually">Semi-Annually</SelectItem>
                      <SelectItem value="Annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextDue">Next Due Date *</Label>
                  <Input
                    id="nextDue"
                    type="date"
                    value={formData.nextDue}
                    onChange={(e) => setFormData({ ...formData, nextDue: e.target.value })}
                    data-testid="input-pm-date"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createPMSchedule.isPending} data-testid="button-submit-pm">
                {createPMSchedule.isPending ? "Creating..." : "Create Schedule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar View */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Maintenance Calendar</CardTitle>
          </CardHeader>
          <CardContent>
             <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border mx-auto"
            />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <span>Overdue ({stats.overdue})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-400" />
                <span>Due Today ({stats.dueToday})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Scheduled ({stats.scheduled})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule List */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>PM Schedules</CardTitle>
            <CardDescription>Upcoming and overdue tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!pmSchedules || pmSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No PM schedules available. Click 'Create Schedule' to add one.
                    </TableCell>
                  </TableRow>
                ) : (
                  pmSchedules.map((item) => {
                    const status = getScheduleStatus(item);
                    return (
                      <TableRow key={item.id} data-testid={`row-pm-${item.id}`}>
                        <TableCell className="font-medium">{getEquipmentName(item.equipmentId)}</TableCell>
                        <TableCell>{item.taskName}</TableCell>
                        <TableCell className="text-slate-500">{item.frequency}</TableCell>
                        <TableCell className="font-medium">{new Date(item.nextDue).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "px-2 py-0.5",
                            status === "Overdue" ? "bg-rose-50 text-rose-700 border-rose-200" :
                            status === "Due Today" ? "bg-orange-50 text-orange-700 border-orange-200" :
                            status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-blue-50 text-blue-700 border-blue-200"
                          )}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" data-testid={`button-pm-log-${item.id}`}>Log</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
