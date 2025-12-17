import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Shield, Lock, Activity } from "lucide-react";
import logo from "@assets/generated_images/minimalist_pharma_logo_symbol.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password, rememberMe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-xl shadow-lg shadow-blue-500/30">
              <img src={logo} alt="PharmaLog" className="h-8 w-8 brightness-0 invert" />
            </div>
            <span className="text-2xl font-bold text-white">
              Pharma<span className="text-blue-400">Log</span>
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Electronic Logbook System
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-md">
            GMP-compliant digital solution for pharmaceutical manufacturing. Track equipment, log activities, and maintain complete audit trails.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <span>21 CFR Part 11 Compliant</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <Lock className="h-5 w-5 text-blue-400" />
              </div>
              <span>Electronic Signatures with Dual Control</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <span>Immutable Audit Trail</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-500">
            GAMP-5 Validated | ALCOA+ Principles | Data Integrity Assured
          </p>
          <p className="text-sm text-slate-400">
            Powered by <span className="text-blue-400 font-medium">Acharya Infosystems LLP</span>
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl mb-4 shadow-lg">
              <img src={logo} alt="PharmaLog" className="h-8 w-8 brightness-0 invert" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">PharmaLog</h1>
            <p className="text-slate-500">Electronic Logbook System</p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to access the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" data-testid="alert-error">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700">Username</Label>
                  <Input
                    id="username"
                    data-testid="input-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                    className="h-11"
                    placeholder="Enter your username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <Input
                    id="password"
                    data-testid="input-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    data-testid="checkbox-remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                    Remember me on this device
                  </Label>
                </div>

                <Button
                  type="submit"
                  data-testid="button-login"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/25"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6 space-y-2">
            <p className="text-xs text-slate-400">
              21 CFR Part 11 Compliant | Audit Trail Enabled
            </p>
            <p className="text-xs text-slate-500 lg:hidden mt-4">
              Powered by <span className="text-blue-600 font-medium">Acharya Infosystems LLP</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
