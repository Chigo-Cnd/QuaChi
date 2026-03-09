import { useEffect, useRef } from 'react';
import {
  Chart, LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Title, Tooltip, Legend, Filler
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

interface Props {
  experimentId: string;
  graphType: string;
}

function generateData(experimentId: string, graphType: string) {
  switch (graphType) {
    case 'titration-curve': {
      const labels = Array.from({ length: 51 }, (_, i) => (i * 0.5).toFixed(1));
      const data   = labels.map(v => {
        const vol = parseFloat(v);
        if (vol < 20) return 13 - vol * 0.3;
        if (vol > 26) return 1 + (vol - 26) * 0.3;
        if (vol >= 24 && vol <= 25.5) return 8 - (vol - 24) * 4;
        return Math.max(1, 13 - vol * 0.3);
      });
      return { labels, data, xlabel: 'Volume of acid added (mL)', ylabel: 'pH' };
    }
    case 'gas-law': {
      const labels = ['20', '40', '60', '80', '100'];
      const data   = labels.map(v => {
        const V = parseFloat(v);
        return parseFloat((100 / V).toFixed(3));
      });
      return { labels, data, xlabel: 'Volume (mL)', ylabel: 'Pressure (atm)' };
    }
    case 'rate': {
      const labels = Array.from({ length: 10 }, (_, i) => `${i * 30}s`);
      const data   = labels.map((_, i) => Math.max(0, 100 * Math.exp(-0.08 * i * 30) + (Math.random() - 0.5) * 5));
      return { labels, data, xlabel: 'Time (s)', ylabel: 'Concentration (mol/L)' };
    }
    case 'enthalpy': {
      const labels = ['0s', '30s', '60s', '90s', '120s', '150s', '180s'];
      const data   = [25, 25.2, 28.5, 31.4, 31.3, 31.0, 30.8];
      return { labels, data, xlabel: 'Time', ylabel: 'Temperature (°C)' };
    }
    case 'decay': {
      const labels = Array.from({ length: 10 }, (_, i) => `t=${i}`);
      const data   = labels.map((_, i) => 100 * Math.exp(-0.2 * i));
      return { labels, data, xlabel: 'Time (half-lives)', ylabel: 'N / N₀ (%)' };
    }
    case 'equilibrium': {
      const labels = Array.from({ length: 20 }, (_, i) => `${i * 5}s`);
      const data   = labels.map((_, i) => i < 8 ? 0 : 0.5 * (1 - Math.exp(-(i - 8) * 0.3)));
      return { labels, data, xlabel: 'Time (s)', ylabel: '[FeSCN²⁺] mol/L' };
    }
    default: {
      const labels = ['0', '1', '2', '3', '4', '5'];
      const data   = labels.map(v => parseFloat(v) * 2 + Math.random());
      return { labels, data, xlabel: 'X', ylabel: 'Y' };
    }
  }
}

export default function DataChart({ experimentId, graphType }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const { labels, data, xlabel, ylabel } = generateData(experimentId, graphType);

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label:           ylabel,
          data,
          borderColor:     '#2563EB',
          backgroundColor: 'rgba(37,99,235,0.1)',
          tension:         0.4,
          fill:            true,
          pointRadius:     3,
          pointHoverRadius:6,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend:  { display: false },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: {
            title: { display: true, text: xlabel, color: '#94A3B8' },
            grid:  { color: 'rgba(148,163,184,0.1)' },
            ticks: { color: '#94A3B8', maxTicksLimit: 6 },
          },
          y: {
            title: { display: true, text: ylabel, color: '#94A3B8' },
            grid:  { color: 'rgba(148,163,184,0.1)' },
            ticks: { color: '#94A3B8' },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [experimentId, graphType]);

  return (
    <div className="rounded-xl border p-4" style={{ background: 'var(--sim-bg)', borderColor: 'var(--sim-border)', height: '260px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
