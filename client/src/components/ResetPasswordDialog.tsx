import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RotateCcw, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  dealerId: string;
  dealerName: string;
}

export default function ResetPasswordDialog({
  open,
  onClose,
  dealerId,
  dealerName,
}: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resetMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/reset-dealer-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealerId }),
      });
      if (!response.ok) {
        throw new Error("Failed to reset password");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      setNewPassword(data.newPassword);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dealer-profiles"] });
      toast({
        title: "Password Reset Successfully",
        description: "New temporary password has been generated",
      });
    },
    onError: (error) => {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  const handleReset = () => {
    resetMutation.mutate();
  };

  const handleClose = () => {
    setNewPassword("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Reset Password
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            <p>Reset password for dealer:</p>
            <p className="font-medium text-slate-900">{dealerName}</p>
          </div>

          {!newPassword ? (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This will generate a new temporary password for the dealer. The dealer will be required to change it on their next login.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleReset}
                  disabled={resetMutation.isPending}
                  className="flex-1"
                >
                  {resetMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={resetMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Password has been reset successfully!
                </AlertDescription>
              </Alert>

              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  New Temporary Password:
                </label>
                <div className="bg-white border border-slate-200 rounded px-3 py-2 font-mono text-sm">
                  {newPassword}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Share this password securely with the dealer. They must change it on their next login.
                </p>
              </div>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}