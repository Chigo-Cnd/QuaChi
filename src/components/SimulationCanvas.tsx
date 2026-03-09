import { useEffect, useRef } from 'react';
import type { Experiment } from '@/types';

interface Props {
  experiment: Experiment;
  currentStep: number;
  isRunning: boolean;
}

interface Bubble { x: number; y: number; r: number; vy: number; opacity: number; color: string; }
interface Particle { x: number; y: number; vx: number; vy: number; color: string; size: number; life: number; }

export default function SimulationCanvas({ experiment, currentStep, isRunning }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const stateRef  = useRef({ bubbles: [] as Bubble[], particles: [] as Particle[], tick: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      const { width: W, height: H } = canvas;
      stateRef.current.tick++;
      const { tick } = stateRef.current;

      // Background
      ctx.fillStyle = '#0F1923';
      ctx.fillRect(0, 0, W, H);

      // Grid lines (subtle)
      ctx.strokeStyle = 'rgba(30,58,95,0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      drawSimulation(ctx, W, H, tick);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  }, [experiment.id, currentStep]);

  function drawSimulation(ctx: CanvasRenderingContext2D, W: number, H: number, tick: number) {
    const module = experiment.module;

    if (module === 'acids-bases' || module === 'solutions') drawFlaskReaction(ctx, W, H, tick);
    else if (module === 'gas-laws') drawGasLaw(ctx, W, H, tick);
    else if (module === 'reaction-rates') drawRateReaction(ctx, W, H, tick);
    else if (module === 'electrochemistry') drawElectrolysis(ctx, W, H, tick);
    else if (module === 'separation') drawSeparation(ctx, W, H, tick);
    else if (module === 'thermochemistry') drawCalorimeter(ctx, W, H, tick);
    else drawGenericLab(ctx, W, H, tick);
  }

  function drawFlaskReaction(ctx: CanvasRenderingContext2D, W: number, H: number, tick: number) {
    const cx = W / 2, cy = H / 2 + 20;
    const fillLevel = Math.min(0.7, 0.1 + (currentStep / experiment.procedure.length) * 0.6);

    // Flask body path
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 60);
    ctx.lineTo(cx - 20, cy - 20);
    ctx.lineTo(cx - 60, cy + 40);
    ctx.quadraticCurveTo(cx - 65, cy + 55, cx - 50, cy + 60);
    ctx.lineTo(cx + 50, cy + 60);
    ctx.quadraticCurveTo(cx + 65, cy + 55, cx + 60, cy + 40);
    ctx.lineTo(cx + 20, cy - 20);
    ctx.lineTo(cx + 20, cy - 60);
    ctx.closePath();
    ctx.strokeStyle = '#1E3A5F';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Liquid fill
    const liquidColor = experiment.module === 'acids-bases'
      ? `hsla(${220 + currentStep * 20}, 80%, 60%, 0.7)`
      : 'rgba(59,130,246,0.5)';

    const fillY = cy + 60 - (fillLevel * 80);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 60);
    ctx.lineTo(cx - 20, cy - 20);
    ctx.lineTo(cx - 60, cy + 40);
    ctx.quadraticCurveTo(cx - 65, cy + 55, cx - 50, cy + 60);
    ctx.lineTo(cx + 50, cy + 60);
    ctx.quadraticCurveTo(cx + 65, cy + 55, cx + 60, cy + 40);
    ctx.lineTo(cx + 20, cy - 20);
    ctx.lineTo(cx + 20, cy - 60);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = liquidColor;
    ctx.fillRect(cx - 80, fillY, 160, 200);
    ctx.restore();

    // Bubbles (when running)
    if (isRunning && currentStep > 0) {
      if (tick % 8 === 0) {
        stateRef.current.bubbles.push({
          x: cx + (Math.random() - 0.5) * 60,
          y: cy + 50, r: Math.random() * 4 + 2,
          vy: -(Math.random() * 1.5 + 0.5),
          opacity: 0.8, color: '#93C5FD',
        });
      }
      stateRef.current.bubbles = stateRef.current.bubbles
        .map(b => ({ ...b, y: b.y + b.vy, opacity: b.opacity - 0.01 }))
        .filter(b => b.opacity > 0 && b.y > cy - 60);

      stateRef.current.bubbles.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(147,197,253,${b.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Labels
    ctx.fillStyle = 'rgba(148,163,184,0.8)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`[Step ${currentStep + 1}]`, cx, cy - 75);
    ctx.fillText(experiment.module.toUpperCase(), cx, H - 10);
  }

  function drawGasLaw(ctx: CanvasRenderingContext2D, W: number, H: number, tick: number) {
    const cx = W / 2, cy = H / 2;
    // Piston cylinder
    const pressure = 1 + (currentStep / experiment.procedure.length) * 2;
    const pistonY  = cy - 40 + (currentStep * 8);

    // Cylinder
    ctx.strokeStyle = '#2D5A8E';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 40, cy - 60, 80, 120);

    // Gas particles
    ctx.fillStyle = 'rgba(96,165,250,0.7)';
    const nParticles = Math.max(4, 20 - currentStep * 2);
    for (let i = 0; i < nParticles; i++) {
      const angle = (tick * 0.05 + i) * 2.3;
      const r = 25 * Math.sin(tick * 0.03 + i);
      const px = cx + r * Math.cos(angle);
      const py = Math.max(pistonY + 5, Math.min(cy + 50, cy + r * Math.sin(angle)));
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Piston
    ctx.fillStyle = '#1E3A5F';
    ctx.fillRect(cx - 38, pistonY, 76, 12);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`P = ${pressure.toFixed(1)} atm`, cx, cy + 80);
  }

  function drawRateReaction(ctx: CanvasRenderingContext2D, W: number, H: number, tick: number) {
    const cx = W / 2, cy = H / 2 + 10;
    // Beaker
    ctx.strokeStyle = '#2D5A8E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 50, cy - 50);
    ctx.lineTo(cx - 50, cy + 50);
    ctx.lineTo(cx + 50, cy + 50);
    ctx.lineTo(cx + 50, cy - 50);
    ctx.stroke();

    // Solution color changes with step
    const hue = 200 - currentStep * 30;
    ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.4)`;
    ctx.fillRect(cx - 48, cy - 30, 96, 78);

    // Reaction bubbles
    if (isRunning) {
      const freq = Math.max(2, 12 - currentStep * 2);
      if (tick % freq === 0) {
        stateRef.current.bubbles.push({
          x: cx + (Math.random() - 0.5) * 80,
          y: cy + 40, r: Math.random() * 3 + 1,
          vy: -(1 + currentStep * 0.2), opacity: 0.9, color: '#FCD34D',
        });
      }
    }

    stateRef.current.bubbles = stateRef.current.bubbles
      .map(b => ({ ...b, y: b.y + b.vy, opacity: b.opacity - 0.02 }))
      .filter(b => b.opacity > 0);
    stateRef.current.bubbles.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(252,211,77,${b.opacity})`;
      ctx.fill();
    });

    // Thermometer
    const temp = 20 + currentStep * 10;
    ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx + 60, cy + 40); ctx.lineTo(cx + 60, cy - 40); ctx.stroke();
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(cx + 58, cy + 40 - (temp / 100) * 80, 4, (temp / 100) * 80);
    ctx.fillStyle = '#94A3B8'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`${temp}°C`, cx + 68, cy - 30);
  }

  function drawElectrolysis(ctx: CanvasRenderingContext2D, W: number, H: number, tick: number) {
    const cx = W / 2, cy = H / 2;
    // Tank
    ctx.strokeStyle = '#2D5A8E'; ctx.lineWidth = 2;
    ctx.strokeRect(cx - 70, cy - 40, 140, 90);

    // Electrolyte solution
    ctx.fillStyle = 'rgba(59,130,246,0.2)';
    ctx.fillRect(cx - 68, cy - 38, 136, 86);

    // Electrodes
    ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx - 35, cy - 60); ctx.lineTo(cx - 35, cy + 40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 35, cy - 60); ctx.lineTo(cx + 35, cy + 40); ctx.stroke();

    // Labels
    ctx.fillStyle = '#EF4444'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('−', cx - 35, cy - 68);
    ctx.fillStyle = '#3B82F6';
    ctx.fillText('+', cx + 35, cy - 68);

    // Bubbles on electrodes (when running)
    if (isRunning && tick % 5 === 0) {
      [cx - 35, cx + 35].forEach(ex => {
        stateRef.current.bubbles.push({
          x: ex + (Math.random() - 0.5) * 10, y: cy + 30,
          r: Math.random() * 3 + 1, vy: -0.8, opacity: 0.9,
          color: ex < cx ? '#93C5FD' : '#FCD34D',
        });
      });
    }
    stateRef.current.bubbles = stateRef.current.bubbles
      .map(b => ({ ...b, y: b.y + b.vy, opacity: b.opacity - 0.015 }))
      .filter(b => b.opacity > 0);
    stateRef.current.bubbles.forEach(b => {
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(147,197,253,${b.opacity})`; ctx.fill();
    });

    ctx.fillStyle = '#94A3B8'; ctx.font = '10px monospace';
    ctx.fillText('CATHODE (−)     ANODE (+)', cx, cy + 60);
  }

  function drawSeparation(ctx: CanvasRenderingContext2D, W: number, H: number, tick: number) {
    const cx = W / 2, cy = H / 2;
    // Funnel + filter paper
    ctx.strokeStyle = '#2D5A8E'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 50, cy - 60);
    ctx.lineTo(cx, cy + 10);
    ctx.lineTo(cx + 50, cy - 60);
    ctx.closePath();
    ctx.stroke();

    // Filter paper (blue triangle)
    ctx.fillStyle = 'rgba(59,130,246,0.1)'; ctx.fill();

    // Drops falling
    if (isRunning && tick % 12 === 0) {
      stateRef.current.bubbles.push({
        x: cx, y: cy + 15, r: 4, vy: 2, opacity: 1, color: '#60A5FA',
      });
    }
    stateRef.current.bubbles = stateRef.current.bubbles
      .map(b => ({ ...b, y: b.y + b.vy }))
      .filter(b => b.y < cy + 100);
    stateRef.current.bubbles.forEach(b => {
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = '#60A5FA'; ctx.fill();
    });

    // Beaker below
    ctx.strokeStyle = '#2D5A8E';
    ctx.strokeRect(cx - 30, cy + 30, 60, 50);
    if (stateRef.current.bubbles.length > 5) {
      ctx.fillStyle = 'rgba(59,130,246,0.3)';
      ctx.fillRect(cx - 28, cy + 60, 56, 18);
    }

    ctx.fillStyle = '#94A3B8'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
    ctx.fillText('FILTRATION', cx, H - 10);
  }

  function drawCalorimeter(ctx: CanvasRenderingContext2D, W: number, H: number, tick: number) {
    const cx = W / 2, cy = H / 2;
    const temp = 25 + currentStep * 7;

    // Cup (polystyrene)
    ctx.strokeStyle = '#2D5A8E'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy - 50);
    ctx.lineTo(cx - 50, cy + 50);
    ctx.lineTo(cx + 50, cy + 50);
    ctx.lineTo(cx + 40, cy - 50);
    ctx.closePath(); ctx.stroke();

    // Liquid
    const hue = 200 + (temp - 25) * 3;
    ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.5)`;
    ctx.fillRect(cx - 45, cy, 90, 48);

    // Thermometer
    ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy - 80); ctx.lineTo(cx, cy + 40); ctx.stroke();
    ctx.fillStyle = '#EF4444';
    const barH = (temp / 100) * 100;
    ctx.fillRect(cx - 2, cy + 40 - barH, 4, barH);

    ctx.fillStyle = '#F87171'; ctx.font = '13px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`${temp}°C`, cx, cy - 88);

    // Heat waves
    if (isRunning) {
      for (let i = 0; i < 3; i++) {
        const waveY = cy - 10 - (tick * 0.5 + i * 20) % 60;
        ctx.strokeStyle = `rgba(239,68,68,${0.4 - i * 0.1})`; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 30, waveY);
        ctx.quadraticCurveTo(cx - 15, waveY - 8, cx, waveY);
        ctx.quadraticCurveTo(cx + 15, waveY + 8, cx + 30, waveY);
        ctx.stroke();
      }
    }
  }

  function drawGenericLab(ctx: CanvasRenderingContext2D, W: number, H: number, tick: number) {
    const cx = W / 2, cy = H / 2;
    // Simple beaker
    ctx.strokeStyle = '#2D5A8E'; ctx.lineWidth = 2;
    ctx.strokeRect(cx - 45, cy - 50, 90, 100);
    ctx.fillStyle = 'rgba(59,130,246,0.3)';
    ctx.fillRect(cx - 43, cy, 86, 48);

    // Stirring animation
    const angle = tick * 0.05;
    ctx.strokeStyle = '#60A5FA'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 20, cy + Math.sin(angle) * 10);
    ctx.lineTo(cx - Math.cos(angle) * 20, cy - Math.sin(angle) * 10);
    ctx.stroke();

    ctx.fillStyle = '#94A3B8'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
    ctx.fillText(experiment.title.substring(0, 20) + '...', cx, H - 10);
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ background: '#0F1923' }}
    />
  );
}
