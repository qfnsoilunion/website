import { motion } from "framer-motion";
import { ShieldCheck, Store, Fuel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Role } from "../lib/role";

interface ChooseRoleProps {
  onRoleSelect: (role: Role) => void;
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function ChooseRole({ onRoleSelect }: ChooseRoleProps) {
  const handleRoleSelect = (role: Role) => {
    onRoleSelect(role);
    if (role === "ADMIN") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/dealer-login";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center py-12 px-4">
      <motion.div 
        className="max-w-md w-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="text-center mb-8"
          {...fadeInUp}
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Fuel className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Role</h1>
          <p className="text-blue-200">Select your access level to continue</p>
        </motion.div>
        
        <motion.div 
          className="space-y-4"
          {...fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <Card 
            className="cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => handleRoleSelect("ADMIN")}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mr-4">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Administrator</h3>
                  <p className="text-sm text-slate-600">Full system access and management</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => handleRoleSelect("DEALER")}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mr-4">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Dealer</h3>
                  <p className="text-sm text-slate-600">Manage your dealership and employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          className="text-center mt-8"
          {...fadeInUp}
          transition={{ delay: 0.4 }}
        >
          <Button 
            variant="ghost" 
            className="text-blue-200 hover:text-white hover:bg-white/10"
            onClick={() => window.location.href = "/"}
          >
            ← Back to Home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
