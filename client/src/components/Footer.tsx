import { Fuel, Mail, Phone, MapPin } from "lucide-react";
import quantaFonsLogo from "@assets/qwe-removebg-preview_1755624489426.png";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Fuel className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Union Registry</h3>
                <p className="text-sm text-slate-400">Kashmir Valley Tank Owners & Petroleum Dealers Association</p>
              </div>
            </div>
            <p className="text-slate-300 mb-4 max-w-md">
              Since 1995, serving as the united voice of Kashmir's petroleum trade. 
              Protecting dealer rights, promoting fair trade, and ensuring industry strength.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="#leadership" className="hover:text-white transition-colors">Leadership</a></li>
              <li><a href="/role" className="hover:text-white transition-colors">Portal Access</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Kashmir Valley, J&K</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+91 194 XXX XXXX</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">info@unionregistry.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-4">
            <p className="text-slate-400 text-sm">
              &copy; 2025 Kashmir Valley Tank Owners & Petroleum Dealers Association. All rights reserved.
            </p>
            <div className="flex items-center justify-center gap-1 text-slate-400 text-sm">
              <span>Designed by</span>
              <img 
                src={quantaFonsLogo} 
                alt="QuantaFONS Logo" 
                className="h-4 w-auto filter brightness-0 invert mx-1"
                style={{ height: '1.7em' }}
              />
              <span className="font-bold">QuantaFONS</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
