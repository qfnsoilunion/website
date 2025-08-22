import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Fuel, 
  Users, 
  Building, 
  UserPlus, 
  Search, 
  ArrowRightLeft,
  Crown,
  ClipboardList,
  UserCheck,
  FileText,
  Store,
  Shield
} from "lucide-react";

import { api, type HomeMetrics } from "../lib/api";
import OilCanvas from "../components/OilCanvas";
import StatsStrip from "../components/StatsStrip";
import Timeline from "../components/Timeline";
import AdvancedPriceTracker from "../components/AdvancedPriceTracker";
import FuelStationsMapFree from "../components/FuelStationsMapFree";
import heroImage from "@assets/engin-akyurt-ATiv-MR0d4U-unsplash_1755583889932.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const { data: metrics } = useQuery<HomeMetrics>({
    queryKey: ["/api/metrics/home"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-blue-900 text-white overflow-hidden py-16 lg:py-24">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-blue-900/90"></div>
        </div>
        


        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Kashmir Valley Tank Owners & <br />
              <span className="text-secondary">Petroleum Dealers Association</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-4 text-blue-100">
              Fueling Unity, Protecting Interests, Driving Progress
            </p>
            <p className="text-lg mb-8 text-blue-200">
              Since 1995. The united voice of Kashmir's petroleum trade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-white px-8 py-4"
                onClick={() => window.location.href = "/role"}
              >
                <Shield className="w-5 h-5 mr-2" />
                Admin Portal
              </Button>
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-white px-8 py-4"
                onClick={() => window.location.href = "/role"}
              >
                <Store className="w-5 h-5 mr-2" />
                Dealer Portal
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Fuel Price Intelligence Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Live Fuel Station Map & Prices
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Find nearby petrol pumps with real-time petrol and diesel prices, powered by OpenStreetMap - completely free, no API key needed!
            </p>
          </motion.div>
          
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <FuelStationsMapFree />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <AdvancedPriceTracker />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <StatsStrip metrics={metrics} />

      {/* Mission Section */}
      <motion.section 
        id="about"
        className="py-16 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl font-bold mb-6 text-slate-900"
            {...fadeInUp}
          >
            Our Mission
          </motion.h2>
          <motion.p 
            className="text-lg text-slate-600 leading-relaxed"
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            We are the collective voice of petroleum dealers and tank owners across the Kashmir Valley. 
            We protect dealer rights, promote fair trade, and ensure that this industry stays strong, 
            local, and ready for the future.
          </motion.p>
        </div>
      </motion.section>


      {/* How It Works */}
      <motion.section 
        id="services"
        className="py-16 bg-slate-100"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            {...fadeInUp}
          >
            How It Works
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Register Members</h3>
                  <p className="text-slate-600">Add dealers, employees, and clients to the unified registry system with comprehensive tracking.</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Track & Search</h3>
                  <p className="text-slate-600">Quickly find employment history, client assignments, and vehicle registrations across the valley.</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowRightLeft className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Manage Transfers</h3>
                  <p className="text-slate-600">Handle client transfers between dealers with proper approvals and audit trails.</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Timeline */}
      <Timeline />

      {/* Leadership */}
      <motion.section 
        id="leadership"
        className="py-16 bg-slate-100"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            {...fadeInUp}
          >
            Leadership
          </motion.h2>
          
          <div className="mb-12">
            <motion.h3 
              className="text-xl font-semibold mb-6 text-center"
              {...fadeInUp}
            >
              Past Presidents
            </motion.h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { name: "Haji Ghulam Mohi Ud Din Rafiquee", title: "Founding President" },
                { name: "Haji Abdul Ahad Pandit", title: "Past President" },
                { name: "Haji Mushtaq Ahmed Rafiquee", title: "Past President" }
              ].map((leader, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4"></div>
                      <h4 className="font-semibold">{leader.name}</h4>
                      <p className="text-sm text-slate-600">{leader.title}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div>
            <motion.h3 
              className="text-xl font-semibold mb-6 text-center"
              {...fadeInUp}
            >
              Current Office Bearers
            </motion.h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { name: "Er. Javed Ahmed Ashai", title: "President", icon: Crown, color: "bg-primary" },
                { name: "Mr. Mohammad Shafi Khanday", title: "General Secretary", icon: ClipboardList, color: "bg-secondary" },
                { name: "Mr. Majid Mushtaq Rafiquee", title: "Vice President", icon: UserCheck, color: "bg-accent" },
                { name: "Mr. Mohd Altaf Pandit", title: "Secretary", icon: FileText, color: "bg-neutral" }
              ].map((leader, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className={`w-20 h-20 ${leader.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                        <leader.icon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold">{leader.name}</h4>
                      <p className={`text-sm font-medium ${
                        leader.color === "bg-primary" ? "text-primary" :
                        leader.color === "bg-secondary" ? "text-secondary" :
                        leader.color === "bg-accent" ? "text-accent" : "text-neutral"
                      }`}>{leader.title}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Legacy Section */}
      <motion.section 
        className="py-16 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-center mb-8"
            {...fadeInUp}
          >
            Our Legacy
          </motion.h2>
          <motion.div 
            className="bg-slate-50 rounded-xl p-8"
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              Our foundation was laid by Late Haji Ghulam Mohi-ud-din Rafiquee Sahib, unanimously elected lifelong President. 
              Official registration and bye-laws were undertaken by Mohammed Shafi Khanday with support from the founding members.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <h4 className="font-semibold mb-2">Founding Members:</h4>
                <ul className="space-y-1">
                  <li>• Late Haji Ghulam Mohi-ud-din Rafiquee</li>
                  <li>• Mohammed Shafi Khanday</li>
                  <li>• Abdul Ahad Pandit</li>
                  <li>• Mushtaq Ahmed Rafiquee</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Established:</h4>
                <p>1995 - Kashmir Valley</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

    </div>
  );
}
