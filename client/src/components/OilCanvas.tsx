import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  color: string;
}

interface FuelStream {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  width: number;
  opacity: number;
  speed: number;
  phase: number;
}

export default function OilCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const streamsRef = useRef<FuelStream[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      // Reinitialize animations when canvas resizes
      initializeAnimations();
    };

    const initializeAnimations = () => {
      const { width, height } = canvas.getBoundingClientRect();
      
      // Initialize fuel streams
      streamsRef.current = [];
      for (let i = 0; i < 4; i++) {
        streamsRef.current.push({
          x: Math.random() * width,
          y: -50,
          targetX: Math.random() * width,
          targetY: height + 50,
          width: 20 + Math.random() * 40,
          opacity: 0.3 + Math.random() * 0.4,
          speed: 0.5 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2,
        });
      }
      
      // Initialize particles
      particlesRef.current = [];
    };

    const createParticle = (x: number, y: number) => {
      if (particlesRef.current.length > 50) return; // Limit particles
      
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        radius: 2 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 2,
        vy: -1 - Math.random() * 2,
        alpha: 0.8,
        life: 1.0,
        color: Math.random() > 0.5 ? '#f59e0b' : '#d97706'
      });
    };

    const animate = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      // Update and draw fuel streams
      streamsRef.current.forEach((stream, index) => {
        stream.phase += 0.03;
        stream.y += stream.speed;

        // Reset stream when it goes off screen
        if (stream.y > height + 100) {
          stream.y = -100;
          stream.x = Math.random() * width;
          stream.targetX = Math.random() * width;
        }

        // Create flowing wave motion
        const waveOffset = Math.sin(stream.phase) * 30;
        const currentX = stream.x + waveOffset;

        // Draw stream with gradient
        const gradient = ctx.createLinearGradient(
          currentX - stream.width/2, stream.y - 50,
          currentX + stream.width/2, stream.y + 50
        );
        gradient.addColorStop(0, `rgba(245, 158, 11, 0)`);
        gradient.addColorStop(0.3, `rgba(245, 158, 11, ${stream.opacity})`);
        gradient.addColorStop(0.7, `rgba(217, 119, 6, ${stream.opacity * 0.8})`);
        gradient.addColorStop(1, `rgba(217, 119, 6, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(currentX, stream.y, stream.width/2, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        // Occasionally create particles
        if (Math.random() < 0.1 && stream.y > 0 && stream.y < height) {
          createParticle(currentX, stream.y);
        }
      });

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;
        particle.alpha = particle.life * 0.8;

        if (particle.life <= 0) return false;

        // Draw particle
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * particle.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        return true;
      });

      // Add ambient fuel drops
      if (Math.random() < 0.05) {
        createParticle(Math.random() * width, -10);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (!prefersReducedMotion) {
      resizeCanvas();
      animate();

      window.addEventListener("resize", resizeCanvas);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      // Static fallback for reduced motion
      resizeCanvas();
      const { width, height } = canvas.getBoundingClientRect();
      
      // Draw static fuel-like pattern
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(245, 158, 11, 0.4)");
      gradient.addColorStop(0.5, "rgba(217, 119, 6, 0.3)");
      gradient.addColorStop(1, "rgba(245, 158, 11, 0.2)");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add some static fuel drops
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `rgba(245, 158, 11, ${0.2 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(
          Math.random() * width,
          Math.random() * height,
          5 + Math.random() * 15,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-40"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}
