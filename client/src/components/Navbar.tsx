import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Fuel, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Role } from "../lib/role";

interface NavbarProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

export default function Navbar({ role, onRoleChange }: NavbarProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSwitchRole = () => {
    onRoleChange(null);
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (role === "ADMIN") return "/admin";
    if (role === "DEALER") return "/dealer";
    return "/role";
  };

  const getDashboardLabel = () => {
    if (role === "ADMIN") return "Admin Dashboard";
    if (role === "DEALER") return "Dealer Dashboard";
    return "Choose Role";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Fuel className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900">Union Registry</h1>
              <p className="text-xs text-slate-500">Kashmir Valley Tank Owners</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`text-slate-600 hover:text-primary transition-colors ${
                location === "/" ? "text-primary font-medium" : ""
              }`}
            >
              Home
            </Link>
            <a 
              href="#about" 
              className="text-slate-600 hover:text-primary transition-colors"
            >
              About
            </a>
            <a 
              href="#services" 
              className="text-slate-600 hover:text-primary transition-colors"
            >
              Services
            </a>
            <a 
              href="#leadership" 
              className="text-slate-600 hover:text-primary transition-colors"
            >
              Leadership
            </a>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {role && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-slate-600">Role: </span>
                <span className="text-sm font-semibold text-primary">{role}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSwitchRole}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Switch
                </Button>
              </div>
            )}
            
            <Link href={getDashboardLink()}>
              <Button className={role ? "bg-secondary hover:bg-secondary/90" : "bg-primary hover:bg-primary/90"}>
                {getDashboardLabel()}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="space-y-4">
              <Link 
                href="/" 
                className="block text-slate-600 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <a 
                href="#about" 
                className="block text-slate-600 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="#services" 
                className="block text-slate-600 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </a>
              <a 
                href="#leadership" 
                className="block text-slate-600 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Leadership
              </a>
              
              <div className="pt-4 border-t border-slate-200">
                {role && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-slate-600">Role: </span>
                    <span className="text-sm font-semibold text-primary">{role}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleSwitchRole}
                      className="ml-2 text-xs text-slate-500"
                    >
                      Switch
                    </Button>
                  </div>
                )}
                
                <Link href={getDashboardLink()}>
                  <Button 
                    className={`w-full ${role ? "bg-secondary hover:bg-secondary/90" : "bg-primary hover:bg-primary/90"}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {getDashboardLabel()}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
