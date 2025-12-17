import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Mail, 
  Bell, 
  Upload, 
  Save, 
  Settings, 
  TestTube,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

interface SystemConfig {
  customer_company_name?: string | null;
  customer_logo_url?: string | null;
  notification_email_enabled?: string | null;
  critical_alerts_enabled?: string | null;
}

interface EmailConfig {
  id?: string;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPassword?: string | null;
  fromEmail?: string | null;
  fromName?: string | null;
  isEnabled?: boolean;
}

export default function AdminConfiguration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Branding state
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // Email config state
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
    isEnabled: false,
  });

  // Notification settings
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [criticalAlertsEnabled, setCriticalAlertsEnabled] = useState(true);

  // Fetch system config
  const { data: config, isLoading: configLoading } = useQuery<SystemConfig>({
    queryKey: ["/api/config"],
  });

  // Fetch email config
  const { data: emailConfigData, isLoading: emailConfigLoading } = useQuery<EmailConfig>({
    queryKey: ["/api/email-config"],
  });

  // Update states when data loads
  useEffect(() => {
    if (config) {
      setCompanyName(config.customer_company_name || "");
      setLogoUrl(config.customer_logo_url || "");
      setEmailNotificationsEnabled(config.notification_email_enabled === "true");
      setCriticalAlertsEnabled(config.critical_alerts_enabled !== "false");
    }
  }, [config]);

  useEffect(() => {
    if (emailConfigData) {
      setEmailConfig({
        ...emailConfigData,
        smtpPassword: "", // Don't show the masked password
      });
    }
  }, [emailConfigData]);

  // Save branding mutation
  const saveBrandingMutation = useMutation({
    mutationFn: async (data: Record<string, string | null>) => {
      const response = await fetch("/api/config/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save branding");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Branding Saved",
        description: "Customer branding has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save branding settings.",
        variant: "destructive",
      });
    },
  });

  // Save email config mutation
  const saveEmailConfigMutation = useMutation({
    mutationFn: async (data: Partial<EmailConfig>) => {
      const response = await fetch("/api/email-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save email config");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-config"] });
      toast({
        title: "Email Settings Saved",
        description: "Email configuration has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save email settings.",
        variant: "destructive",
      });
    },
  });

  // Save notification settings mutation
  const saveNotificationSettingsMutation = useMutation({
    mutationFn: async (data: Record<string, string | null>) => {
      const response = await fetch("/api/config/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save notification settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Notification Settings Saved",
        description: "Notification preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive",
      });
    },
  });

  const handleSaveBranding = () => {
    saveBrandingMutation.mutate({
      customer_company_name: companyName || null,
      customer_logo_url: logoUrl || null,
    });
  };

  const handleSaveEmailConfig = () => {
    const data: Partial<EmailConfig> = {
      smtpHost: emailConfig.smtpHost,
      smtpPort: emailConfig.smtpPort,
      smtpUser: emailConfig.smtpUser,
      fromEmail: emailConfig.fromEmail,
      fromName: emailConfig.fromName,
      isEnabled: emailConfig.isEnabled,
    };
    // Only include password if it was changed
    if (emailConfig.smtpPassword) {
      data.smtpPassword = emailConfig.smtpPassword;
    }
    saveEmailConfigMutation.mutate(data);
  };

  const handleSaveNotificationSettings = () => {
    saveNotificationSettingsMutation.mutate({
      notification_email_enabled: emailNotificationsEnabled.toString(),
      critical_alerts_enabled: criticalAlertsEnabled.toString(),
    });
  };

  if (configLoading || emailConfigLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">System Configuration</h2>
        <p className="text-slate-500 mt-1">Manage customer branding, email settings, and notifications</p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="branding" className="gap-2" data-testid="tab-branding">
            <Building2 className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2" data-testid="tab-email">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2" data-testid="tab-notifications">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Customer Branding
              </CardTitle>
              <CardDescription>
                Configure your customer's company name and logo. These will appear throughout the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company-name">Customer Company Name</Label>
                <Input
                  id="company-name"
                  data-testid="input-company-name"
                  placeholder="Enter customer company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <p className="text-xs text-slate-500">
                  This will be displayed in the application header and footer.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-url">Company Logo URL</Label>
                <Input
                  id="logo-url"
                  data-testid="input-logo-url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
                <p className="text-xs text-slate-500">
                  Enter a URL to the company logo image. Recommended size: 200x50 pixels.
                </p>
              </div>

              {logoUrl && (
                <div className="space-y-2">
                  <Label>Logo Preview</Label>
                  <div className="border rounded-lg p-4 bg-slate-50">
                    <img 
                      src={logoUrl} 
                      alt="Company Logo Preview" 
                      className="max-h-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveBranding}
                  disabled={saveBrandingMutation.isPending}
                  data-testid="button-save-branding"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveBrandingMutation.isPending ? "Saving..." : "Save Branding"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for sending automated emails and notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Email Notifications</Label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Turn on to send automated emails for critical events
                  </p>
                </div>
                <Switch
                  checked={emailConfig.isEnabled}
                  onCheckedChange={(checked) => setEmailConfig(prev => ({ ...prev, isEnabled: checked }))}
                  data-testid="switch-email-enabled"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    data-testid="input-smtp-host"
                    placeholder="smtp.example.com"
                    value={emailConfig.smtpHost || ""}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    data-testid="input-smtp-port"
                    type="number"
                    placeholder="587"
                    value={emailConfig.smtpPort || ""}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || undefined }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">SMTP Username</Label>
                  <Input
                    id="smtp-user"
                    data-testid="input-smtp-user"
                    placeholder="username@example.com"
                    value={emailConfig.smtpUser || ""}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">SMTP Password</Label>
                  <Input
                    id="smtp-password"
                    data-testid="input-smtp-password"
                    type="password"
                    placeholder="••••••••"
                    value={emailConfig.smtpPassword || ""}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    data-testid="input-from-email"
                    placeholder="noreply@example.com"
                    value={emailConfig.fromEmail || ""}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    data-testid="input-from-name"
                    placeholder="PharmaLog System"
                    value={emailConfig.fromName || ""}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button variant="outline" disabled data-testid="button-test-email">
                  <TestTube className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
                <Button 
                  onClick={handleSaveEmailConfig}
                  disabled={saveEmailConfigMutation.isPending}
                  data-testid="button-save-email"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveEmailConfigMutation.isPending ? "Saving..." : "Save Email Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how and when notifications are sent for system events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Email notifications require valid SMTP settings to be configured in the Email tab.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Notifications
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Send email notifications for important events like PM overdue, approvals needed
                    </p>
                  </div>
                  <Switch
                    checked={emailNotificationsEnabled}
                    onCheckedChange={setEmailNotificationsEnabled}
                    data-testid="switch-email-notifications"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Critical Alerts
                      <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                        Recommended
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Immediate notifications for critical events like equipment failures, overdue PMs
                    </p>
                  </div>
                  <Switch
                    checked={criticalAlertsEnabled}
                    onCheckedChange={setCriticalAlertsEnabled}
                    data-testid="switch-critical-alerts"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Auto-Notification Events</h4>
                <p className="text-sm text-slate-500">The system will automatically send notifications for:</p>
                <ul className="text-sm text-slate-600 space-y-1 ml-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    PM schedules approaching due date (7 days before)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    PM schedules overdue
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Log entries pending approval
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Equipment status changes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    User account changes
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveNotificationSettings}
                  disabled={saveNotificationSettingsMutation.isPending}
                  data-testid="button-save-notifications"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveNotificationSettingsMutation.isPending ? "Saving..." : "Save Notification Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
