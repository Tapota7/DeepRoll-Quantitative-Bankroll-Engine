import React, { useState } from 'react';
import { BankrollLedger, Session } from '../../types/poker';

interface BankrollGrowthChartProps {
  ledger: BankrollLedger;
  sessions: Session[];
  boxSize?: number;
}

export const BankrollGrowthChart: React.FC<BankrollGrowthChartProps> = ({ ledger, sessions, boxSize = 5.0 }) => {
  const [viewUnit, setViewUnit] = useState<'usd' | 'cajas' | 'bb'>('usd');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Chronologically sorted sessions
  const sortedSessions = [...sessions].sort((a, b) => a.timestamp - b.timestamp);

  // Compute progression
  let running = ledger.initialBalance;
  let maxBal = running;
  let minBal = running;
  let athIdx = 0;

  const pointsData = sortedSessions.map((s, idx) => {
    running += s.netProfit;
    if (running > maxBal) {
      maxBal = running;
      athIdx = idx;
    }
    if (running < minBal) {
      minBal = running;
    }
    return {
      id: s.id,
      date: s.date,
      balance: running,
      netProfit: s.netProfit,
    };
  });

  const totalSessions = pointsData.length;

  const formatUnit = (usd: number) => {
    if (viewUnit === 'cajas') return `${(usd / boxSize).toFixed(1)} cx`;
    if (viewUnit === 'bb') return `${(usd / (boxSize / 100)).toLocaleString('es-ES', { maximumFractionDigits: 0 })} bb`;
    return `$${usd.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (totalSessions === 0) {
    return (
      <div className="flex flex-col justify-between bg-[#111218] rounded-2xl border border-white/[0.06] p-6 h-80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-zinc-100 font-sans tracking-tight">
              Evolución de Capital
            </h2>
            <p className="text-[12px] text-zinc-500 font-sans mt-0.5">
              Trayectoria de banca en el tiempo
            </p>
          </div>
          <div className="text-[12px] text-zinc-500 font-mono">0 sesiones</div>
        </div>

        <div className="flex flex-col items-center justify-center my-auto gap-2 text-center">
          <span className="material-symbols-outlined text-zinc-600 text-[32px]">show_chart</span>
          <p className="text-[13px] text-zinc-400 font-sans">
            Sin sesiones registradas en este rango
          </p>
          <span className="text-[11px] text-zinc-600 font-sans">
            Comienza registrando tu primera sesión para trazar la curva
          </span>
        </div>
      </div>
    );
  }

  // Map to SVG coordinates: width 760, height 220
  const rangeY = Math.max(maxBal - minBal, 50);
  const chartPoints = pointsData.map((p, idx) => {
    const x = totalSessions > 1 ? 40 + (idx / (totalSessions - 1)) * 680 : 380;
    const y = 200 - ((p.balance - minBal) / rangeY) * 160;
    return {
      x: Math.round(x),
      y: Math.round(y),
      sNum: idx + 1,
      id: p.id,
      date: p.date,
      balance: p.balance,
      netProfit: p.netProfit,
      isATH: idx === athIdx,
      isCurrent: idx === totalSessions - 1,
    };
  });

  const pointsString = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const polygonPoints = `40,210 ${pointsString} ${chartPoints[chartPoints.length - 1].x},210`;

  const hoveredPoint = hoveredIndex !== null ? chartPoints[hoveredIndex] : null;

  return (
    <div className="flex flex-col bg-[#111218] rounded-2xl border border-white/[0.06] p-6 relative">
      {/* Header + Minimalist View Selector */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
        <div>
          <h2 className="text-[15px] font-semibold text-zinc-100 font-sans tracking-tight">
            Evolución de Capital
          </h2>
          <p className="text-[12px] text-zinc-500 font-sans mt-0.5">
            {formatUnit(running)} • {totalSessions} {totalSessions === 1 ? 'sesión' : 'sesiones'}
          </p>
        </div>

        {/* View Switches */}
        <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] font-sans text-[11px]">
          {(['usd', 'cajas', 'bb'] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => setViewUnit(unit)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                viewUnit === unit
                  ? 'bg-white/[0.1] text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              type="button"
            >
              {unit === 'usd' ? 'USD ($)' : unit === 'cajas' ? 'Cajas (cx)' : 'Ciegas (bb)'}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-64 pt-3 flex flex-col justify-end">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 760 220">
          <defs>
            <linearGradient id="soberBankrollGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" x1="40" x2="720" y1="40" y2="40" />
          <line stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" x1="40" x2="720" y1="120" y2="120" />
          <line stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" x1="40" x2="720" y1="200" y2="200" />

          {/* Y-Axis Label values */}
          <text fill="#71717a" fontFamily="sans-serif" fontSize="10" x="5" y="44">{formatUnit(maxBal)}</text>
          <text fill="#71717a" fontFamily="sans-serif" fontSize="10" x="5" y="204">{formatUnit(minBal)}</text>

          {/* Gradient Fill */}
          <polygon fill="url(#soberBankrollGrad)" points={polygonPoints} />

          {/* Line */}
          <polyline
            fill="none"
            points={pointsString}
            stroke="#34d399"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
          />

          {/* Interactive Points */}
          {chartPoints.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === idx ? "5.5" : "3.5"}
              fill={p.isATH ? "#34d399" : "#111218"}
              stroke="#34d399"
              strokeWidth="1.8"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute top-2 right-4 bg-[#181920] border border-white/[0.08] px-3 py-2 rounded-xl shadow-xl flex items-center gap-3 text-[12px] font-sans pointer-events-none"
          >
            <span className="font-mono text-zinc-400">{hoveredPoint.id}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-300">{hoveredPoint.date}</span>
            <span className="text-zinc-500">•</span>
            <span className="font-mono font-bold text-zinc-100">
              {formatUnit(hoveredPoint.balance)}
            </span>
            <span
              className={`font-mono font-medium ${
                hoveredPoint.netProfit >= 0 ? 'text-[#34d399]' : 'text-[#fb7185]'
              }`}
            >
              ({hoveredPoint.netProfit >= 0 ? '+' : ''}${hoveredPoint.netProfit.toFixed(2)})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
