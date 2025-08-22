import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { type HomeMetrics } from "../lib/api";

interface StatsStripProps {
  metrics?: HomeMetrics;
}

interface CountUpProps {
  end: number;
  duration?: number;
}

function CountUp({ end, duration = 2000 }: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isInView]);

  return <span ref={ref}>{count}</span>;
}

export default function StatsStrip({ metrics }: StatsStripProps) {
  const statsData = [
    {
      value: metrics?.activeDealers || 0,
      label: "Active Dealers",
      color: "text-primary",
    },
    {
      value: metrics?.activeEmployees || 0,
      label: "Active Employees", 
      color: "text-accent",
    },
    {
      value: metrics?.activeClients || 0,
      label: "Active Clients",
      color: "text-secondary",
    },
    {
      value: 28, // Years since 1995
      label: "Years of Service",
      color: "text-neutral",
    },
  ];

  return (
    <section className="py-12 bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          viewport={{ once: true }}
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`text-3xl lg:text-4xl font-bold ${stat.color} mb-2`}>
                <CountUp end={stat.value} />
              </div>
              <div className="text-sm font-medium text-slate-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
