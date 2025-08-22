import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface FillLevel {
  height: number;
  targetHeight: number;
  animating: boolean;
}

export default function PetrolFilling() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [fillLevel, setFillLevel] = useState<FillLevel>({ 
    height: 0, 
    targetHeight: 0, 
    animating: false 
  });
  const wavePhaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const drawTank = (width: number, height: number) => {
      const tankWidth = width * 0.6;
      const tankHeight = height * 0.7;
      const tankX = (width - tankWidth) / 2;
      const tankY = (height - tankHeight) / 2;

      // Tank outline
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.1)';
      ctx.roundRect(tankX, tankY, tankWidth, tankHeight, 10);
      ctx.fill();
      ctx.stroke();

      // Tank cap
      const capWidth = tankWidth * 0.3;
      const capHeight = 20;
      const capX = tankX + (tankWidth - capWidth) / 2;
      const capY = tankY - capHeight;
      
      ctx.fillStyle = '#475569';
      ctx.roundRect(capX, capY, capWidth, capHeight, 5);
      ctx.fill();

      // Fuel nozzle
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(capX + capWidth / 2, capY);
      ctx.lineTo(capX + capWidth / 2, capY - 30);
      ctx.lineTo(capX + capWidth / 2 - 20, capY - 50);
      ctx.stroke();

      return { tankX, tankY, tankWidth, tankHeight };
    };

    const drawFuel = (tankX: number, tankY: number, tankWidth: number, tankHeight: number, currentHeight: number) => {
      if (currentHeight <= 0) return;

      const fuelHeight = Math.min(currentHeight, tankHeight - 20);
      const fuelY = tankY + tankHeight - fuelHeight - 10;
      
      // Create wave effect
      wavePhaseRef.current += 0.05;
      const waveAmplitude = 3;
      const waveFrequency = 0.02;

      // Draw fuel with wave top
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(tankX + 10, fuelY + fuelHeight);
      
      // Bottom and sides
      ctx.lineTo(tankX + 10, tankY + tankHeight - 10);
      ctx.lineTo(tankX + tankWidth - 10, tankY + tankHeight - 10);
      ctx.lineTo(tankX + tankWidth - 10, fuelY + fuelHeight);
      
      // Wavy top
      for (let x = tankX + tankWidth - 10; x >= tankX + 10; x -= 2) {
        const wave = Math.sin((x - tankX) * waveFrequency + wavePhaseRef.current) * waveAmplitude;
        ctx.lineTo(x, fuelY + wave);
      }
      
      ctx.closePath();
      ctx.fill();

      // Add gradient overlay
      const gradient = ctx.createLinearGradient(0, fuelY, 0, fuelY + fuelHeight);
      gradient.addColorStop(0, 'rgba(245, 158, 11, 0.9)');
      gradient.addColorStop(0.3, 'rgba(217, 119, 6, 0.8)');
      gradient.addColorStop(1, 'rgba(180, 83, 9, 0.9)');
      
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add bubbles effect
      for (let i = 0; i < 3; i++) {
        const bubbleX = tankX + 20 + Math.random() * (tankWidth - 40);
        const bubbleY = fuelY + 10 + Math.random() * (fuelHeight - 20);
        const bubbleRadius = 2 + Math.random() * 4;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const animate = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const { tankX, tankY, tankWidth, tankHeight } = drawTank(width, height);

      // Animate fill level using refs instead of state
      if (fillLevel.animating) {
        const diff = fillLevel.targetHeight - fillLevel.height;
        if (Math.abs(diff) > 1) {
          fillLevel.height += diff * 0.02;
        } else {
          fillLevel.height = fillLevel.targetHeight;
          fillLevel.animating = false;
        }
      }

      drawFuel(tankX, tankY, tankWidth, tankHeight, fillLevel.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startFilling = () => {
    const newLevel = { 
      ...fillLevel, 
      targetHeight: 250, 
      animating: true 
    };
    setFillLevel(newLevel);
  };

  const resetTank = () => {
    const newLevel = { 
      height: 0, 
      targetHeight: 0, 
      animating: false 
    };
    setFillLevel(newLevel);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative h-80 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden shadow-lg">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Control buttons */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <motion.button
            onClick={startFilling}
            disabled={fillLevel.animating}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium shadow-md hover:bg-primary/90 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Fill Tank
          </motion.button>
          <motion.button
            onClick={resetTank}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg font-medium shadow-md hover:bg-slate-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset
          </motion.button>
        </div>
      </div>
      
      {/* Volume indicator */}
      <div className="mt-4 text-center">
        <div className="text-sm text-slate-600 mb-2">Fuel Level</div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(fillLevel.height / 250) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {Math.round((fillLevel.height / 250) * 100)}% Full
        </div>
      </div>
    </div>
  );
}