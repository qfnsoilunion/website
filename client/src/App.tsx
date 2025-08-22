import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { roleManager, type Role } from "./lib/role";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ChooseRole from "./pages/ChooseRole";
import AdminDashboard from "./pages/AdminDashboard";
import DealerDashboard from "./pages/DealerDashboard";
import DealerLogin from "./components/DealerLogin";
import NotFound from "@/pages/not-found";

function Router() {
  const [role, setRole] = useState<Role>(roleManager.get());

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(roleManager.get());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateRole = (newRole: Role) => {
    roleManager.set(newRole);
    setRole(newRole);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={role} onRoleChange={updateRole} />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/role">
            <ChooseRole onRoleSelect={updateRole} />
          </Route>
          <Route path="/admin">
            {role === "ADMIN" ? <AdminDashboard /> : <ChooseRole onRoleSelect={updateRole} />}
          </Route>
          <Route path="/dealer-login">
            <DealerLogin onSuccess={(dealerId) => {
              updateRole("DEALER");
              sessionStorage.setItem("dealerId", dealerId);
              window.location.href = "/dealer";
            }} />
          </Route>
          <Route path="/dealer">
            {role === "DEALER" ? <DealerDashboard /> : <ChooseRole onRoleSelect={updateRole} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
