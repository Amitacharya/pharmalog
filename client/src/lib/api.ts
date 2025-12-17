import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface Equipment {
  id: string;
  equipmentId: string;
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  location: string;
  status: "Operational" | "In Use" | "Maintenance" | "Offline";
  qualificationStatus?: string;
  pmFrequency?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogEntry {
  id: string;
  logId: string;
  equipmentId: string;
  activityType: "Operation" | "Maintenance" | "Calibration" | "Cleaning" | "Sampling";
  startTime: string;
  endTime?: string;
  description: string;
  batchNumber?: string;
  readings?: string;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  createdBy: string;
  createdAt: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "APPROVE" | "REJECT";
  entityType: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress?: string;
}

export interface PMSchedule {
  id: string;
  equipmentId: string;
  taskName: string;
  frequency: string;
  lastPerformed?: string;
  nextDue: string;
  status: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: "Operator" | "Supervisor" | "QA" | "Engineer" | "Admin";
  department?: string;
  isActive: boolean;
  createdAt: string;
}

// Equipment Hooks
export function useEquipment() {
  return useQuery<Equipment[]>({
    queryKey: ["equipment"],
    queryFn: async () => {
      const response = await fetch("/api/equipment", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch equipment");
      return response.json();
    },
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Equipment>) => {
      const response = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create equipment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Equipment> }) => {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update equipment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete equipment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

// Log Entry Hooks
export function useLogEntries() {
  return useQuery<LogEntry[]>({
    queryKey: ["logs"],
    queryFn: async () => {
      const response = await fetch("/api/logs", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch log entries");
      return response.json();
    },
  });
}

export function useCreateLogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<LogEntry>) => {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create log entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });
}

export function useUpdateLogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LogEntry> }) => {
      const response = await fetch(`/api/logs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update log entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });
}

export function useSubmitLogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      password,
      reason,
    }: {
      id: string;
      password: string;
      reason: string;
    }) => {
      const response = await fetch(`/api/logs/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, reason }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit log entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}

export function useApproveLogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      password,
      reason,
    }: {
      id: string;
      password: string;
      reason: string;
    }) => {
      const response = await fetch(`/api/logs/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, reason }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve log entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}

// Audit Trail Hooks
export function useAuditLogs(limit = 100) {
  return useQuery<AuditLog[]>({
    queryKey: ["audit", limit],
    queryFn: async () => {
      const response = await fetch(`/api/audit?limit=${limit}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      return response.json();
    },
  });
}

// PM Schedule Hooks
export function usePMSchedules() {
  return useQuery<PMSchedule[]>({
    queryKey: ["pm-schedules"],
    queryFn: async () => {
      const response = await fetch("/api/pm-schedules", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch PM schedules");
      return response.json();
    },
  });
}

export function useCreatePMSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<PMSchedule>) => {
      const response = await fetch("/api/pm-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create PM schedule");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pm-schedules"] });
    },
  });
}

export function useUpdatePMSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PMSchedule> }) => {
      const response = await fetch(`/api/pm-schedules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update PM schedule");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pm-schedules"] });
    },
  });
}

// User Management Hooks
export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<User> & { password: string }) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> & { password?: string } }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
