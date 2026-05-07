import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface NeuralBackgroundProps {
  className?: string;
  color?: string;
  trailOpacity?: number;
  particleCount?: number;
  speed?: number;
  backgroundColor?: string;
  variant?: 'default' | 'ink' | 'ink-field';
}

type Particle = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  wrapped: boolean;
};

export default function NeuralBackground({
  className,
  color = '#7c3aed',
  trailOpacity = 0.15,
  particleCount = 600,
  speed = 1,
  backgroundColor = '#000000',
  variant = 'default',
}: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let particles: Particle[] = [];
    let animationFrameId = 0;
    let mouse = { x: -1000, y: -1000 };

    class FlowParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      age: number;
      life: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.prevX = this.x;
        this.prevY = this.y;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 200 + 100;
        this.size = variant === 'ink' ? Math.random() * 3.8 + 1.8 : Math.random() * 1.6 + 0.8;
        this.wrapped = false;
      }

      update() {
        this.wrapped = false;
        this.prevX = this.x;
        this.prevY = this.y;
        const angle = (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI;

        this.vx += Math.cos(angle) * 0.2 * speed;
        this.vy += Math.sin(angle) * 0.2 * speed;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 150;

        if (distance < interactionRadius) {
          const force = (interactionRadius - distance) / interactionRadius;
          this.vx -= dx * force * 0.05;
          this.vy -= dy * force * 0.05;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;

        this.age += 1;
        if (this.age > this.life) {
          this.reset();
        }

        if (variant === 'ink') {
          if (this.x < -24 || this.x > width + 24 || this.y < -24 || this.y > height + 24) {
            this.reset();
          }
          return;
        }

        if (this.x < 0) {
          this.x = width;
          this.prevX = this.x;
          this.prevY = this.y;
          this.wrapped = true;
        }
        if (this.x > width) {
          this.x = 0;
          this.prevX = this.x;
          this.prevY = this.y;
          this.wrapped = true;
        }
        if (this.y < 0) {
          this.y = height;
          this.prevX = this.x;
          this.prevY = this.y;
          this.wrapped = true;
        }
        if (this.y > height) {
          this.y = 0;
          this.prevX = this.x;
          this.prevY = this.y;
          this.wrapped = true;
        }
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.prevX = this.x;
        this.prevY = this.y;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 200 + 100;
        this.size = variant === 'ink' ? Math.random() * 3.8 + 1.8 : Math.random() * 1.6 + 0.8;
        this.wrapped = true;
      }

      draw(context: CanvasRenderingContext2D) {
        const alpha = 1 - Math.abs(this.age / this.life - 0.5) * 2;
        context.globalAlpha = alpha;

        if (variant === 'ink') {
          const segmentLength = Math.hypot(this.x - this.prevX, this.y - this.prevY);
          const nearEdge =
            this.x < 6 ||
            this.x > width - 6 ||
            this.y < 6 ||
            this.y > height - 6 ||
            this.prevX < 6 ||
            this.prevX > width - 6 ||
            this.prevY < 6 ||
            this.prevY > height - 6;

          if (this.wrapped || nearEdge || segmentLength > 18) {
            return;
          }

          const angle = Math.atan2(this.y - this.prevY, this.x - this.prevX || 0.0001);
          const velocity = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          const stretch = Math.min(velocity * 14 + this.size * 4.8, 26);

          context.save();
          context.lineCap = 'round';
          context.lineJoin = 'round';
          context.strokeStyle = color;
          context.lineWidth = this.size;
          context.globalAlpha = alpha * 0.34;
          context.beginPath();
          context.moveTo(this.prevX, this.prevY);
          context.quadraticCurveTo(
            (this.prevX + this.x) / 2 + Math.cos(angle + Math.PI / 2) * this.size * 1.2,
            (this.prevY + this.y) / 2 + Math.sin(angle + Math.PI / 2) * this.size * 1.2,
            this.x,
            this.y
          );
          context.stroke();

          context.globalAlpha = alpha * 0.18;
          context.lineWidth = this.size * 2.4;
          context.beginPath();
          context.moveTo(this.prevX, this.prevY);
          context.quadraticCurveTo(
            (this.prevX + this.x) / 2 - Math.cos(angle + Math.PI / 2) * this.size * 0.8,
            (this.prevY + this.y) / 2 - Math.sin(angle + Math.PI / 2) * this.size * 0.8,
            this.x,
            this.y
          );
          context.stroke();

          context.translate(this.x, this.y);
          context.rotate(angle);
          context.fillStyle = color;
          context.globalAlpha = alpha * 0.12;
          context.beginPath();
          context.ellipse(0, 0, stretch, this.size * 2.2, 0, 0, Math.PI * 2);
          context.fill();
          context.globalAlpha = alpha * 0.26;
          context.beginPath();
          context.ellipse(0, 0, stretch * 0.42, this.size * 1.15, 0, 0, Math.PI * 2);
          context.fill();

          if (this.age % 11 === 0) {
            context.globalAlpha = alpha * 0.1;
            context.beginPath();
            context.arc(stretch * 0.15, this.size * 0.35, this.size * 2.1, 0, Math.PI * 2);
            context.fill();
          }
          context.restore();
          return;
        }

        context.fillStyle = color;
        context.fillRect(this.x, this.y, 1.5, 1.5);
      }
    }

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      width = container.clientWidth;
      height = container.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = [];
      if (variant !== 'ink-field') {
        for (let i = 0; i < particleCount; i += 1) {
          particles.push(new FlowParticle());
        }
      }
    };

    const drawInkField = (time: number) => {
      const bands = 8;
      const normalizedMouseX = mouse.x < 0 ? 0.5 : mouse.x / Math.max(width, 1);
      const normalizedMouseY = mouse.y < 0 ? 0.5 : mouse.y / Math.max(height, 1);

      ctx.globalAlpha = 1;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      for (let band = 0; band < bands; band += 1) {
        const yBase = (height / (bands + 1)) * (band + 1);
        const phase = time * (0.00022 + band * 0.000035);
        const amplitude = 26 + band * 7 + normalizedMouseY * 18;
        const frequency = 0.006 + band * 0.00045;
        const drift = (normalizedMouseX - 0.5) * 120;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        for (let x = -40; x <= width + 40; x += 18) {
          const primary = Math.sin(x * frequency + phase * 10 + band * 0.7) * amplitude;
          const secondary = Math.cos(x * (frequency * 0.55) - phase * 7 + band * 1.8) * amplitude * 0.4;
          const y = yBase + primary + secondary + drift * Math.sin((x / width) * Math.PI) * 0.08;
          if (x === -40) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.05;
        ctx.lineWidth = 26 + band * 1.5;
        ctx.stroke();

        ctx.beginPath();
        for (let x = -40; x <= width + 40; x += 14) {
          const primary = Math.sin(x * frequency + phase * 11 + band * 0.9) * (amplitude * 0.9);
          const secondary = Math.cos(x * (frequency * 0.42) - phase * 5 + band * 1.3) * amplitude * 0.26;
          const y = yBase + primary + secondary;
          if (x === -40) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 9 + band * 0.55;
        ctx.stroke();

        for (let x = 20; x < width; x += 160) {
          const splashY =
            yBase +
            Math.sin(x * frequency + phase * 10 + band * 0.7) * amplitude +
            Math.cos(x * (frequency * 0.55) - phase * 7 + band * 1.8) * amplitude * 0.4;
          ctx.beginPath();
          ctx.globalAlpha = 0.045;
          ctx.arc(x + Math.sin(phase + x) * 8, splashY, 10 + ((band + x) % 3) * 4, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }

        ctx.restore();
      }
    };

    const animate = () => {
      const time = performance.now();
      if (variant === 'ink-field') {
        drawInkField(time);
        animationFrameId = window.requestAnimationFrame(animate);
        return;
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = backgroundColor;
      ctx.globalAlpha = trailOpacity;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      animationFrameId = window.requestAnimationFrame(animate);
    };

    const handleResize = () => {
      init();
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouse = { x: -1000, y: -1000 };
    };

    init();
    ctx.fillStyle = backgroundColor;
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, width, height);
    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [backgroundColor, color, particleCount, speed, trailOpacity, variant]);

  return (
    <div ref={containerRef} className={cn('relative h-full w-full overflow-hidden', className)}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
