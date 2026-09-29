import React from 'react';
import { Session } from '../../types/poker';

interface DistributionHistogramProps {
  sessions?: Session[];
}

export const DistributionHistogram: React.FC<DistributionHistogramProps> = ({ sessions = [] }) => {
  const total = sessions.length;

  const winSessions = sessions.filter((s) => s.netProfit > 0);
  const lossSessions = sessions.filter((s) => s.netProfit < 0);
  const breakEvenSessions = sessions.filter((s) => s.netProfit === 0);

  const winRatePercent = total > 0 ? ((winSessions.length / total) * 100).toFixed(1) : '0.0';
  const lossRatePercent = total > 0 ? ((lossSessions.length / total) * 100).toFixed(1) : '0.0';

  const totalWon = winSessions.reduce((acc, s) => acc + s.netProfit, 0);
  const totalLost = Math.abs(lossSessions.reduce((acc, s) => acc + s.netProfit, 0));
  const profitFactor = totalLost > 0 ? (totalWon / totalLost).toFixed(2) : totalWon > 0 ? 'Inf' : '0.00';

  const maxWin = winSessions.length > 0 ? Math.max(...winSessions.map((s) => s.netProfit)) : 0;
  const maxLoss = lossSessions.length > 0 ? Math.abs(Math.min(...lossSessions.map((s) => s.netProfit))) : 0;

  // Bins:
  // Bin 1: <-$30
  // Bin 2: -$30 a -$10
  // Bin 3: -$10 a +$10
  // Bin 4: +$10 a +$30
  // Bin 5: >+$30
  const bin1 = sessions.filter((s) => s.netProfit < -30).length;
  const bin2 = sessions.filter((s) => s.netProfit >= -30 && s.netProfit < -10).length;
  const bin3 = sessions.filter((s) => s.netProfit >= -10 && s.netProfit <= 10).length;
  const bin4 = sessions.filter((s) => s.netProfit > 10 && s.netProfit <= 30).length;
  const bin5 = sessions.filter((s) => s.netProfit > 30).length;

  const maxBinCount = Math.max(bin1, bin2, bin3, bin4, bin5, 1);

  const getPercent = (count: number) => (total > 0 ? ((count / total) * 100).toFixed(1) : '0.0');
  const getHeightPercent = (count: number) => {
    if (count === 0) return '6%';
    return `${Math.max(15, Math.round((count / maxBinCount) * 95))}%`;
  };

  return (
    <div className="flex flex-col bg-[#131b2e] rounded-xl border border-[rgba(255,255,255,0.08)] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] text-[#38bdf8]">bar_chart</span>
            <h3 className="text-[16px] font-bold text-[#f8fafc] tracking-tight font-sans">
              Distribución de Resultados por Sesión
            </h3>
            <span className="px-1.5 py-0.5 rounded bg-[#050507] text-[#94a3b8] font-mono text-[10px]">
              DINÁMICO
            </span>
          </div>
          <p className="text-[11px] text-[#64748b] font-mono mt-0.5">
            Frecuencia de resultados de las {total} sesiones filtradas por rangos monetarios
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-[#10b981] font-semibold">
            {winSessions.length} Ganadoras ({winRatePercent}%)
          </span>
          <span className="text-[#64748b]">•</span>
          <span className="text-[#ef4444] font-semibold">
            {lossSessions.length} Perdedoras ({lossRatePercent}%)
          </span>
        </div>
      </div>

      {/* Analytical Badge Callouts */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-[rgba(255,255,255,0.08)] font-mono text-[11px]">
        <div className="p-2 rounded bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col">
          <span className="text-[10px] text-[#64748b]">Sesiones Analizadas</span>
          <span className="text-[#38bdf8] font-bold mt-0.5">{total} sesiones</span>
          <span className="text-[9px] text-[#64748b]">Rango seleccionado</span>
        </div>
        <div className="p-2 rounded bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col">
          <span className="text-[10px] text-[#64748b]">Profit Factor</span>
          <span className="text-[#f8fafc] font-bold mt-0.5">{profitFactor}</span>
          <span className="text-[9px] text-[#10b981] font-medium">Ventaja cuantificada</span>
        </div>
        <div className="p-2 rounded bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col">
          <span className="text-[10px] text-[#64748b]">Max Ganancia / Max Pérd.</span>
          <span className="text-[#f8fafc] font-bold mt-0.5">
            +${maxWin.toFixed(2)} / -${maxLoss.toFixed(2)}
          </span>
          <span className="text-[9px] text-[#64748b]">Dispersión en periodo</span>
        </div>
      </div>

      {/* 5-Bin Categorized Histogram Graphic */}
      <div className="relative w-full pt-4 pb-2">
        {/* Categorized Bars */}
        <div className="grid grid-cols-5 gap-2.5 items-end h-44">
          {/* Bin 1: Grandes Pérdidas (<-$30) */}
          <div className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
            <span className="font-mono text-[11px] text-[#ef4444] font-bold">{bin1} ses</span>
            <div
              className="w-full bg-[#050507] rounded-md p-1 border border-[rgba(255,255,255,0.08)] flex flex-col justify-end transition-all group-hover:border-[#ef4444]/50"
              style={{ height: getHeightPercent(bin1) }}
            >
              <div className="w-full bg-[#ef4444]/80 rounded h-full"></div>
            </div>
            <span className="font-mono text-[10px] text-[#64748b] text-center leading-tight mt-1">&lt; -$30</span>
            <span className="font-mono text-[9px] text-[#ef4444]">{getPercent(bin1)}%</span>
          </div>

          {/* Bin 2: Pérdidas Moderadas (-$30 a -$10) */}
          <div className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
            <span className="font-mono text-[11px] text-[#ef4444] font-bold">{bin2} ses</span>
            <div
              className="w-full bg-[#050507] rounded-md p-1 border border-[rgba(255,255,255,0.08)] flex flex-col justify-end transition-all group-hover:border-[#ef4444]/50"
              style={{ height: getHeightPercent(bin2) }}
            >
              <div className="w-full bg-[#ef4444]/60 rounded h-full"></div>
            </div>
            <span className="font-mono text-[10px] text-[#64748b] text-center leading-tight mt-1">-$30 a -$10</span>
            <span className="font-mono text-[9px] text-[#ef4444]">{getPercent(bin2)}%</span>
          </div>

          {/* Bin 3: Break-Even (-$10 a +$10) */}
          <div className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
            <span className="font-mono text-[11px] text-[#f59e0b] font-bold">{bin3} ses</span>
            <div
              className="w-full bg-[#050507] rounded-md p-1 border border-[rgba(255,255,255,0.08)] flex flex-col justify-end transition-all group-hover:border-[#f59e0b]/50"
              style={{ height: getHeightPercent(bin3) }}
            >
              <div className="w-full bg-[#f59e0b]/70 rounded h-full"></div>
            </div>
            <span className="font-mono text-[10px] text-[#64748b] text-center leading-tight mt-1">-$10 a +$10</span>
            <span className="font-mono text-[9px] text-[#f59e0b]">{getPercent(bin3)}%</span>
          </div>

          {/* Bin 4: Ganancias Medias (+$10 a +$30) */}
          <div className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
            <span className="font-mono text-[11px] text-[#10b981] font-bold">{bin4} ses</span>
            <div
              className="w-full bg-[#050507] rounded-md p-1 border border-[rgba(255,255,255,0.08)] flex flex-col justify-end transition-all group-hover:border-[#10b981]/60"
              style={{ height: getHeightPercent(bin4) }}
            >
              <div className="w-full bg-[#10b981] rounded h-full shadow-[0_0_12px_rgba(16,185,129,0.25)]"></div>
            </div>
            <span className="font-mono text-[10px] text-[#10b981] font-bold text-center leading-tight mt-1">+$10 a +$30</span>
            <span className="font-mono text-[9px] text-[#10b981]">{getPercent(bin4)}%</span>
          </div>

          {/* Bin 5: Sesiones Clave (>+$30) */}
          <div className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
            <span className="font-mono text-[11px] text-[#10b981] font-bold">{bin5} ses</span>
            <div
              className="w-full bg-[#050507] rounded-md p-1 border border-[rgba(255,255,255,0.08)] flex flex-col justify-end transition-all group-hover:border-[#10b981]/60"
              style={{ height: getHeightPercent(bin5) }}
            >
              <div className="w-full bg-[#10b981]/75 rounded h-full"></div>
            </div>
            <span className="font-mono text-[10px] text-[#64748b] text-center leading-tight mt-1">&gt; +$30</span>
            <span className="font-mono text-[9px] text-[#10b981]">{getPercent(bin5)}%</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between font-mono text-[10px] text-[#64748b]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span>
          Normalización adaptada a las {total} sesiones del rango
        </span>
        <span>
          Neto acumulado:{' '}
          <strong className={totalWon - totalLost >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
            {totalWon - totalLost >= 0 ? `+$${(totalWon - totalLost).toFixed(2)}` : `-$${(totalLost - totalWon).toFixed(2)}`}
          </strong>
        </span>
      </div>
    </div>
  );
};
