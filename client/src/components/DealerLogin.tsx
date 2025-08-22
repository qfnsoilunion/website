import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ChangePasswordForm from "../components/ChangePasswordForm";

interface DealerLoginProps {
  onSuccess: (dealerId: string) => void;
}

export default function DealerLogin({ onSuccess }: DealerLoginProps) {
  const [step, setStep] = useState<"login" | "totp" | "change-password">("login");
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [totpCode, setTotpCode] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dealerId, setDealerId] = useState<string>("");
  const [temporaryPassword, setTemporaryPassword] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/dealer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        setDealerId(data.dealerId);
        setTemporaryPassword(data.temporaryPassword);
        
        if (data.temporaryPassword) {
          setStep("change-password");
        } else if (data.totpEnabled) {
          setStep("totp");
        } else if (data.qrCode) {
          setQrCode(data.qrCode);
          setStep("totp");
        } else {
          onSuccess(data.dealerId);
        }
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTotpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/dealer/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          code: totpCode,
          enableTotp: !qrCode ? false : true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data.dealerId);
      } else {
        toast({
          title: "2FA Failed",
          description: data.message || "Invalid 2FA code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "2FA verification failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChanged = () => {
    setStep("totp");
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully. Please complete 2FA setup.",
    });
  };

  if (step === "change-password") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-blue-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <ChangePasswordForm
            username={credentials.username}
            onSuccess={handlePasswordChanged}
            isFirstLogin={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-blue-900 flex items-center justify-center py-12 px-4">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {step === "login" ? "Dealer Login" : "Two-Factor Authentication"}
            </CardTitle>
            <p className="text-slate-600">
              {step === "login" 
                ? "Enter your credentials to access your dealer portal"
                : "Enter the 6-digit code from your authenticator app"
              }
            </p>
          </CardHeader>
          <CardContent>
            {step === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="username"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      className="pl-10"
                      placeholder="Enter your username"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleTotpVerification} className="space-y-4">
                {qrCode && (
                  <div className="text-center space-y-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <AlertDescription>
                        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                      </AlertDescription>
                    </Alert>
                    <div className="bg-white p-4 rounded-lg border">
                      <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 mx-auto" />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="totpCode">6-Digit Code</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="totpCode"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="pl-10 text-center text-lg tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("login")}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent/90"
                    disabled={isLoading || totpCode.length !== 6}
                  >
                    {isLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-800"
                onClick={() => window.location.href = "/"}
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}