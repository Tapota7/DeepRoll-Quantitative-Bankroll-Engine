import React, { useState } from 'react';
import { Session } from '../../types/poker';

interface DailyProfitBarChartProps {
  sessions: Session[];
}

export const DailyProfitBarChart: React.FC<DailyProfitBarChartProps> = ({ sessions }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sort sessions chronologically ascending
  const chronological = [...sessions].sort((a, b) => a.timestamp - b.timestamp);

  const winningDays = chronological.filter((s) => s.netProfit > 0).length;
  const losingDays = chronological.filter((s) => s.netProfit < 0).length;
  const winRateDaysPct = chronological.length > 0 ? Math.round((winningDays / chronological.length) * 100) : 0;

  if (chronological.length === 0) {
    return (
      <div className="flex flex-col justify-between bg-[#111218] rounded-2xl border border-white/[0.06] p-6 h-64">
        <div>
          <h3 className="font-sans text-[15px] font-semibold text-zinc-100 tracking-tight">
            Ganancias Diarias (PnL por Sesión)
          </h3>
          <p className="text-[12px] text-zinc-500 font-sans mt-0.5">
            Distribución de resultados netos por día de juego
          </p>
        </div>
        <div className="flex flex-col items-center justify-center my-auto text-zinc-500 text-[12px] font-sans">
          Sin sesiones para mostrar
        </div>
      </div>
    );
  }

  // Find max absolute profit to scale Y-axis
  const maxAbsProfit = Math.max(
    ...chronological.map((s) => Math.abs(s.netProfit)),
    20
  );

  const svgHeight = 160;
  const svgWidth = 760;
  const zeroY = 80; // Baseline at middle
  const barWidth = Math.max(8, Math.min(28, Math.floor(680 / chronological.length) - 4));

  return (
    <div className="flex flex-col bg-[#111218] rounded-2xl border border-white/[0.06] p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
        <div>
          <h3 className="font-sans text-[15px] font-semibold text-zinc-100 tracking-tight">
            Resultado Neto por Día (PnL Diario)
          </h3>
          <p className="text-[12px] text-zinc-500 font-sans mt-0.5">
            Barras de beneficio directo y rakeback día a día
          </p>
        </div>

        <div className="flex items-center gap-3 text-[12px] font-sans">
          <span className="flex items-center gap-1.5 text-[#34d399]">
            <span className="w-2 h-2 rounded-xs bg-[#34d399]" />
            {winningDays} días ganando
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5 text-[#fb7185]">
            <span className="w-2 h-2 rounded-xs bg-[#fb7185]" />
            {losingDays} días perdiendo
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300 font-mono font-medium">
            {winRateDaysPct}% efectividad
          </span>
        </div>
      </div>

      {/* Bar Chart SVG */}
      <div className="relative w-full h-44 flex flex-col justify-end pt-2">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {/* Zero baseline */}
          <line
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
            x1="40"
            x2={svgWidth - 20}
            y1={zeroY}
            y2={zeroY}
          />
          <text fill="#71717a" fontFamily="sans-serif" fontSize="9" x="10" y={zeroY + 3}>
            $0
          </text>
          <text fill="#71717a" fontFamily="sans-serif" fontSize="9" x="10" y="20">
            +${maxAbsProfit.toFixed(0)}
          </text>
          <text fill="#71717a" fontFamily="sans-serif" fontSize="9" x="10" y="150">
            -${maxAbsProfit.toFixed(0)}
          </text>

          {/* Bars */}
          {chronological.map((s, idx) => {
            const isHovered = hoveredIndex === idx;
            const x = 50 + idx * ((svgWidth - 70) / Math.max(1, chronological.length - 1 || 1));
            const barHeight = (Math.abs(s.netProfit) / maxAbsProfit) * 60;
            const isProfit = s.netProfit >= 0;
            const y = isProfit ? zeroY - barHeight : zeroY;

            return (
              <rect
                key={s.id || idx}
                x={x - barWidth / 2}
                y={y}
                width={barWidth}
                height={Math.max(2, barHeight)}
                rx="2"
                fill={isProfit ? '#34d399' : '#fb7185'}
                opacity={isHovered ? 1 : 0.85}
                className="cursor-pointer transition-all hover:opacity-100"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && chronological[hoveredIndex] && (
          <div className="absolute top-2 right-4 bg-[#181920] border border-white/[0.08] px-3 py-2 rounded-xl shadow-xl flex items-center gap-3 text-[12px] font-sans pointer-events-none">
            <span className="font-mono text-zinc-400">{chronological[hoveredIndex].id}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-300">{chronological[hoveredIndex].date}</span>
            <span className="text-zinc-500">•</span>
            <span
              className={`font-mono font-bold ${
                chronological[hoveredIndex].netProfit >= 0 ? 'text-[#34d399]' : 'text-[#fb7185]'
              }`}
            >
              {chronological[hoveredIndex].netProfit >= 0 ? `+$${chronological[hoveredIndex].netProfit.toFixed(2)}` : `-$${Math.abs(chronological[hoveredIndex].netProfit).toFixed(2)}`} USD
            </span>
            <span className="text-zinc-400 font-mono text-[11px]">
              ({chronological[hoveredIndex].hands.toLocaleString()} manos)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
