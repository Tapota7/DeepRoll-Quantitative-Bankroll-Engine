import React, { useState } from 'react';
import { BankrollLedger, Session } from '../../types/poker';

interface BankrollGrowthChartProps {
  ledger: BankrollLedger;
  sessions: Session[];
}

export const BankrollGrowthChart: React.FC<BankrollGrowthChartProps> = ({ ledger, sessions }) => {
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
      profit: (s.netProfit >= 0 ? '+' : '') + s.netProfit.toFixed(2),
    };
  });

  const totalSessions = pointsData.length;
  const periodProfit = sortedSessions.reduce((acc, s) => acc + s.netProfit, 0);

  // Map to SVG coordinates: width 760, height 260
  // X: from 60 to 735
  // Y: from 230 (min) to 36 (max)
  const rangeY = Math.max(maxBal - minBal, 100);
  const chartPoints = pointsData.map((p, idx) => {
    const x = totalSessions > 1 ? 60 + (idx / (totalSessions - 1)) * 675 : 400;
    const y = 230 - ((p.balance - minBal) / rangeY) * 190;
    return {
      x: Math.round(x),
      y: Math.round(y),
      sNum: idx + 1,
      id: p.id,
      date: p.date,
      balance: p.balance,
      profit: p.profit,
      isATH: idx === athIdx,
      isCurrent: idx === totalSessions - 1,
    };
  });

  const pointsString =
    chartPoints.length > 0
      ? chartPoints.map((p) => `${p.x},${p.y}`).join(' ')
      : '60,230 735,230';
  const polygonPoints =
    chartPoints.length > 0
      ? `60,240 ${pointsString} ${chartPoints[chartPoints.length - 1].x},240`
      : '60,240 735,240';

  const formatUnit = (usd: number) => {
    if (viewUnit === 'cajas') return `${(usd / 5.0).toFixed(1)} cx`;
    if (viewUnit === 'bb') return `${(usd / 0.05).toLocaleString('es-ES', { maximumFractionDigits: 0 })} bb`;
    return `$${usd.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  };

  return (
    <div className="flex flex-col bg-[#131b2e] rounded-xl border border-[rgba(255,255,255,0.08)] p-5 shadow-sm relative overflow-hidden">
      {/* Subtle Ambient Background Glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#10b981]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header + View Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#10b981]">trending_up</span>
            <h2 className="text-[17px] font-bold text-[#f8fafc] tracking-tight font-sans">
              Evolución de Banca &amp; Capital en Periodo
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#050507] text-[#10b981] font-mono text-[10px] font-bold border border-[#10b981]/20">
              {sessions.length} SESIONES
            </span>
          </div>
          <p className="text-[11px] text-[#64748b] font-mono mt-0.5">
            Curva de crecimiento recalculada dinámicamente según el rango de fechas seleccionado
          </p>
        </div>

        {/* Interactive View Switches */}
        <div className="flex items-center bg-[#050507] p-1 rounded-lg border border-[rgba(255,255,255,0.08)] font-mono text-[11px]">
          <button
            onClick={() => setViewUnit('usd')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              viewUnit === 'usd'
                ? 'bg-[#1e293b] text-[#10b981] font-bold border border-[rgba(255,255,255,0.16)] shadow-sm'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
            type="button"
          >
            Banca ($)
          </button>
          <button
            onClick={() => setViewUnit('cajas')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              viewUnit === 'cajas'
                ? 'bg-[#1e293b] text-[#10b981] font-bold border border-[rgba(255,255,255,0.16)] shadow-sm'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
            type="button"
          >
            Cajas (cx)
          </button>
          <button
            onClick={() => setViewUnit('bb')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              viewUnit === 'bb'
                ? 'bg-[#1e293b] text-[#10b981] font-bold border border-[rgba(255,255,255,0.16)] shadow-sm'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
            type="button"
          >
            Ciegas (bb)
          </button>
        </div>
      </div>

      {/* Metric Highlight Callout Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 my-1 border-b border-[rgba(255,255,255,0.08)] font-mono">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#64748b] uppercase tracking-wider">Saldo Final Rango</span>
          <span className="text-[18px] font-bold text-[#f8fafc] tabular-nums leading-snug">
            {formatUnit(running)}
          </span>
          <span className="text-[11px] text-[#10b981] font-semibold">
            +{(running / 5.0).toFixed(1)} Cajas (100bb)
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-[#64748b] uppercase tracking-wider">Beneficio Periodo</span>
          <span className={`text-[18px] font-bold tabular-nums leading-snug ${periodProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {periodProfit >= 0 ? `+$${periodProfit.toFixed(2)}` : `-$${Math.abs(periodProfit).toFixed(2)}`}
          </span>
          <span className="text-[11px] text-[#94a3b8]">
            {periodProfit >= 0 ? '+' : ''}{(periodProfit / 5.0).toFixed(1)} cx de impacto
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-[#64748b] uppercase tracking-wider">Pico Máximo Periodo</span>
          <span className="text-[18px] font-bold text-[#f8fafc] tabular-nums leading-snug">
            ${maxBal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-[#64748b] font-medium">ATH del rango</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-[#64748b] uppercase tracking-wider">Muestra en Filtro</span>
          <span className="text-[18px] font-bold text-[#38bdf8] tabular-nums leading-snug">
            {totalSessions} sesiones
          </span>
          <span className="text-[11px] text-[#64748b] font-medium">
            {sortedSessions.reduce((a, b) => a + b.hands, 0).toLocaleString()} manos
          </span>
        </div>
      </div>

      {/* High Fidelity SVG Bankroll Growth Chart */}
      <div className="relative w-full h-72 bg-[#050507] rounded-lg p-3 mt-2 border border-[rgba(255,255,255,0.08)] flex flex-col justify-end overflow-hidden">
        {/* Background Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
          <div className="w-full border-b border-dashed border-[#64748b]"></div>
          <div className="w-full border-b border-dashed border-[#64748b]"></div>
          <div className="w-full border-b border-dashed border-[#64748b]"></div>
          <div className="w-full border-b border-dashed border-[#64748b]"></div>
          <div className="w-full border-b border-dashed border-[#64748b]"></div>
        </div>

        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 760 260">
          <defs>
            <linearGradient id="bankrollGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.38"></stop>
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.08"></stop>
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00"></stop>
            </linearGradient>
            <linearGradient id="trendGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2"></stop>
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9"></stop>
            </linearGradient>
          </defs>

          {/* Y-Axis Ticks & Labels */}
          <text fill="#64748b" fontFamily="JetBrains Mono" fontSize="9" x="12" y="24">${maxBal.toFixed(0)}</text>
          <text fill="#64748b" fontFamily="JetBrains Mono" fontSize="9" x="12" y="132">${((maxBal + minBal) / 2).toFixed(0)}</text>
          <text fill="#64748b" fontFamily="JetBrains Mono" fontSize="9" x="12" y="240">${minBal.toFixed(0)}</text>

          {/* Baseline */}
          <line stroke="#64748b" strokeDasharray="3 3" strokeWidth="1.2" x1="60" x2="745" y1="240" y2="240"></line>

          {/* Bankroll Filled Gradient Polygon */}
          <polygon fill="url(#bankrollGrad)" points={polygonPoints}></polygon>

          {/* Bankroll Solid Emerald Line */}
          <polyline
            fill="none"
            points={pointsString}
            stroke="#10b981"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.6"
          ></polyline>

          {/* Points */}
          {chartPoints.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={p.isATH || p.isCurrent ? "5" : "3.5"}
              fill={p.isATH ? "#10b981" : p.isCurrent ? "#38bdf8" : "#10b981"}
              stroke="#050507"
              strokeWidth="2"
              className="cursor-pointer hover:r-6 transition-all"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && chartPoints[hoveredIndex] && (
          <div className="absolute top-4 left-20 bg-[#1e293b] border border-[rgba(255,255,255,0.16)] px-3 py-1.5 rounded-lg text-xs font-mono shadow-xl z-20 pointer-events-none">
            <span className="text-[#38bdf8] font-bold">Sesión {chartPoints[hoveredIndex].id}</span>
            <span className="text-[#64748b]"> ({chartPoints[hoveredIndex].date})</span>
            <span className="text-[#f8fafc] font-semibold block">
              Banca: ${chartPoints[hoveredIndex].balance.toFixed(2)} USD
            </span>
            <span className={chartPoints[hoveredIndex].profit.startsWith('+') ? 'text-[#10b981]' : 'text-[#ef4444]'}>
              Resultado: {chartPoints[hoveredIndex].profit} USD
            </span>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1 font-mono text-[11px] text-[#94a3b8]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[#f8fafc]">
            <span className="w-3 h-0.5 bg-[#10b981] rounded"></span>
            Curva de Banca Filtrada ($)
          </span>
          <span className="flex items-center gap-1.5 text-[#38bdf8]">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span>
            Última Sesión del Periodo
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[#64748b]">
          <span className="material-symbols-outlined text-[14px] text-[#10b981]">verified</span>
          <span>{sessions.length} sesiones en el rango activo</span>
        </div>
      </div>
    </div>
  );
};
