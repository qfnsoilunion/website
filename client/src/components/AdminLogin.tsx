import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Smartphone, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [step, setStep] = useState<"password" | "2fa">("password");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.totpEnabled) {
          setStep("2fa");
        } else if (data.qrCode) {
          // First time setup - show QR code
          setQrCodeUrl(data.qrCode);
          setShowQRCode(true);
          setStep("2fa");
        } else {
          // No 2FA setup yet
          onSuccess();
        }
      } else {
        setError(data.message || "Invalid password");
      }
    } catch (err) {
      setError("Failed to verify password");
    } finally {
      setLoading(false);
    }
  };

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode, enableTotp: showQRCode }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("adminAuth", "true");
        toast({
          title: "Success",
          description: "Admin authentication successful",
        });
        onSuccess();
      } else {
        setError(data.message || "Invalid 2FA code");
      }
    } catch (err) {
      setError("Failed to verify 2FA code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Admin Authentication</CardTitle>
            <CardDescription className="text-slate-400">
              {step === "password"
                ? "Enter admin password to continue"
                : showQRCode
                ? "Set up 2-factor authentication"
                : "Enter 2FA code from your authenticator app"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "password" ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">
                    Admin Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      placeholder="Enter password"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-900/50 border-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={loading || !password}
                >
                  {loading ? "Verifying..." : "Continue"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {showQRCode && qrCodeUrl && (
                  <div className="space-y-4">
                    <Alert className="bg-blue-900/50 border-blue-800">
                      <Smartphone className="h-4 w-4" />
                      <AlertDescription className="text-slate-200">
                        Scan this QR code with Google Authenticator or any TOTP app
                      </AlertDescription>
                    </Alert>
                    <div className="bg-white p-4 rounded-lg">
                      <img src={qrCodeUrl} alt="2FA QR Code" className="w-full" />
                    </div>
                  </div>
                )}

                <form onSubmit={handleTotpSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="totp" className="text-slate-200">
                      6-Digit Code
                    </Label>
                    <Input
                      id="totp"
                      type="text"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive" className="bg-red-900/50 border-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90"
                    disabled={loading || totpCode.length !== 6}
                  >
                    {loading ? "Verifying..." : showQRCode ? "Complete Setup" : "Verify"}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}