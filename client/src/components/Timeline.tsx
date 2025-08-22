import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const timelineData = [
  {
    year: "1995",
    title: "Foundation & Vision",
    description: "Founded and vision set by visionary leaders of Kashmir's petroleum trade.",
  },
  {
    year: "1995",
    title: "Official Registration", 
    description: "Official registration with J&K Government and bye-laws framed.",
  },
  {
    year: "1996-2005",
    title: "Local-Centric Trade",
    description: "Advocacy for local-centric trade and community-focused growth.",
  },
  {
    year: "2006-2015", 
    title: "Expansion Era",
    description: "Membership expansion and stronger protections for the community.",
  },
  {
    year: "2016-Present",
    title: "Unified Voice",
    description: "Continuing as the united voice of Kashmir's petroleum industry.",
  },
];

export default function Timeline() {
  return (
    <motion.section 
      className="py-16 bg-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Our Journey
        </motion.h2>
        
        <div className="overflow-x-auto">
          <motion.div 
            className="flex space-x-8 pb-4 min-w-max"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {timelineData.map((item, index) => (
              <motion.div
                key={index}
                className="timeline-item"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="w-80 flex-shrink-0 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-primary mb-2">{item.year}</div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
