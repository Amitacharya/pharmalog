import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileCheck,
  CalendarDays,
  AlertOctagon,
  ArrowUpRight
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { cn } from "@/lib/utils";
import { useEquipment, useLogEntries, usePMSchedules } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { useMemo } from "react";

export default function Dashboard() {
  const { data: equipment, isLoading: equipmentLoading, isError: equipmentError } = useEquipment();
  const { data: logs, isLoading: logsLoading, isError: logsError } = useLogEntries();
  const { data: pmSchedules, isLoading: pmLoading, isError: pmError } = usePMSchedules();

  const stats = useMemo(() => {
    if (!logs || !pmSchedules) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = logs.filter(log => {
      const logDate = new Date(log.createdAt);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });

    const pendingApprovals = logs.filter(log => log.status === "Submitted").length;

    const overduePM = pmSchedules.filter(schedule => {
      const dueDate = new Date(schedule.nextDue);
      return dueDate < new Date() && schedule.status !== "Completed";
    }).length;

    const activityByHour = Array.from({ length: 6 }, (_, i) => {
      const hour = 8 + i * 2;
      const count = logs.filter(log => {
        const logHour = new Date(log.createdAt).getHours();
        return logHour >= hour && logHour < hour + 2;
      }).length;
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        logs: count
      };
    });

    const totalSchedules = pmSchedules.length;
    const compliantCount = pmSchedules.filter(schedule => {
      const dueDate = new Date(schedule.nextDue);
      const daysDiff = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 7 || schedule.status === "Completed";
    }).length;
    const dueSoonCount = pmSchedules.filter(schedule => {
      const dueDate = new Date(schedule.nextDue);
      const daysDiff = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7 && schedule.status !== "Completed";
    }).length;
    const overdueCount = overduePM;

    const compliantPercent = totalSchedules > 0 ? Math.round((compliantCount / totalSchedules) * 100) : 0;
    const dueSoonPercent = totalSchedules > 0 ? Math.round((dueSoonCount / totalSchedules) * 100) : 0;
    const overduePercent = totalSchedules > 0 ? Math.round((overdueCount / totalSchedules) * 100) : 0;

    const approvedLogs = logs.filter(log => log.status === "Approved").length;
    const complianceScore = logs.length > 0 ? ((approvedLogs / logs.length) * 100).toFixed(1) : "0.0";

    return {
      todayActivities: todayLogs.length,
      pendingApprovals,
      overduePM,
      complianceScore,
      activityByHour,
      compliantPercent,
      dueSoonPercent,
      overduePercent
    };
  }, [logs, pmSchedules]);

  if (equipmentLoading || logsLoading || pmLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (equipmentError || logsError || pmError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Error Loading Dashboard</h3>
          <p className="text-slate-500">Failed to load dashboard data. Please try again.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Plant Overview</h2>
        <p className="text-slate-500">Real-time monitoring of equipment status and compliance metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Today's Activities</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900" data-testid="stat-today-activities">{stats?.todayActivities || 0}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              Today's log entries
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900" data-testid="stat-pending-approvals">{stats?.pendingApprovals || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Requires Supervisor/QA</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">PM Overdue</CardTitle>
            <AlertOctagon className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600" data-testid="stat-pm-overdue">{stats?.overduePM || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Critical Attention Needed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Compliance Score</CardTitle>
            <FileCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700" data-testid="stat-compliance-score">{stats?.complianceScore || "0.0"}%</div>
            <p className="text-xs text-slate-500 mt-1">GAMP-5 Adherence</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Activity Volume (24h)</CardTitle>
            <CardDescription>Log entries recorded per hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.activityByHour || []}>
                  <defs>
                    <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="logs"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLogs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>PM Compliance</CardTitle>
            <CardDescription>Equipment Maintenance Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">Compliant</span>
                </div>
                <span className="text-sm font-bold" data-testid="pm-compliant-percent">{stats?.compliantPercent || 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${stats?.compliantPercent || 0}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-400" />
                  <span className="text-sm font-medium">Due Soon</span>
                </div>
                <span className="text-sm font-bold" data-testid="pm-due-soon-percent">{stats?.dueSoonPercent || 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-orange-400" style={{ width: `${stats?.dueSoonPercent || 0}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500" />
                  <span className="text-sm font-medium">Overdue</span>
                </div>
                <span className="text-sm font-bold" data-testid="pm-overdue-percent">{stats?.overduePercent || 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${stats?.overduePercent || 0}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Critical Alerts</CardTitle>
          <CardDescription>Exceptions requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {[
              { id: "ALT-001", eq: "Autoclave A-01", msg: "Cycle aborted due to pressure drop", time: "10 mins ago", severity: "high" },
              { id: "ALT-002", eq: "HPLC-03", msg: "Calibration expired today", time: "2 hours ago", severity: "medium" },
              { id: "ALT-003", eq: "Room 104", msg: "Temp excursion > 25°C detected", time: "4 hours ago", severity: "medium" },
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-1 h-2 w-2 rounded-full",
                    alert.severity === "high" ? "bg-rose-500 animate-pulse" : "bg-orange-400"
                  )} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{alert.msg}</p>
                    <p className="text-xs text-slate-500">Equipment: <span className="font-mono">{alert.eq}</span> • ID: {alert.id}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{alert.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
