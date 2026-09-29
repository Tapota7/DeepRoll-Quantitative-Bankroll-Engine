import React from 'react';
import { Session } from '../../types/poker';

interface CrossPerformanceMatrixProps {
  sessions?: Session[];
}

export const CrossPerformanceMatrix: React.FC<CrossPerformanceMatrixProps> = ({ sessions = [] }) => {
  const totalDays = sessions.length;

  // Split sessions by style or modalities
  const rushSessions = sessions.filter((s) => s.tags?.some((t) => t.toLowerCase().includes('rush') || t.toLowerCase().includes('fast')));
  const regularSessions = sessions.filter((s) => !rushSessions.includes(s));

  // Compute stats for regular
  const regCount = regularSessions.length;
  const regHands = regularSessions.reduce((acc, s) => acc + s.hands, 0);
  const regRakeback = regularSessions.reduce((acc, s) => acc + s.rakeback, 0);
  const regProfit = regularSessions.reduce((acc, s) => acc + s.netProfit, 0);
  const regWinrate = regHands > 0 ? (regularSessions.reduce((acc, s) => acc + (s.directProfit / s.bb), 0) / (regHands / 100)).toFixed(1) : '0.0';

  // Compute stats for Rush & Cash
  const rushCount = rushSessions.length;
  const rushHands = rushSessions.reduce((acc, s) => acc + s.hands, 0);
  const rushRakeback = rushSessions.reduce((acc, s) => acc + s.rakeback, 0);
  const rushProfit = rushSessions.reduce((acc, s) => acc + s.netProfit, 0);
  const rushWinrate = rushHands > 0 ? (rushSessions.reduce((acc, s) => acc + (s.directProfit / s.bb), 0) / (rushHands / 100)).toFixed(1) : '0.0';

  const totalProfit = sessions.reduce((acc, s) => acc + s.netProfit, 0);
  const regShare = totalProfit > 0 && regProfit > 0 ? Math.round((regProfit / totalProfit) * 100) : 75;
  const rushShare = totalProfit > 0 && rushProfit > 0 ? Math.round((rushProfit / totalProfit) * 100) : 25;

  // Daily classification: Weekdays (Lun-Vie) vs Weekend (Sáb-Dom)
  const weekdays = sessions.filter((s) => {
    const day = new Date(s.timestamp).getDay();
    return day >= 1 && day <= 5;
  });
  const weekends = sessions.filter((s) => {
    const day = new Date(s.timestamp).getDay();
    return day === 0 || day === 6;
  });

  const weekdayProfit = weekdays.reduce((a, b) => a + b.netProfit, 0);
  const weekendProfit = weekends.reduce((a, b) => a + b.netProfit, 0);

  const winningDays = sessions.filter((s) => s.netProfit > 0).length;
  const winDayPct = totalDays > 0 ? Math.round((winningDays / totalDays) * 100) : 0;

  return (
    <div className="flex flex-col justify-between bg-[#131b2e] rounded-xl border border-[rgba(255,255,255,0.08)] p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] text-[#10b981]">query_stats</span>
            <h3 className="text-[16px] font-bold text-[#f8fafc] tracking-tight font-sans">
              Rendimiento Operativo en GGPoker
            </h3>
            <span className="px-1.5 py-0.5 rounded bg-[#050507] text-[#10b981] font-mono text-[10px] font-bold border border-[#10b981]/20">
              GGPOKER EXCLUSIVO
            </span>
          </div>
          <p className="text-[11px] text-[#64748b] font-mono mt-0.5">
            Segmentación dinámica de los {totalDays} días de juego registrados por modalidad
          </p>
        </div>
        <span className="font-mono text-[10px] text-[#64748b] uppercase">NL5 DEEP (100BB)</span>
      </div>

      {/* Breakdown by Modality within GGPoker */}
      <div className="flex flex-col gap-2.5 my-3">
        {/* Mesas Regulares Cash */}
        <div className="p-2.5 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
              <span className="font-bold text-[#f8fafc] font-sans text-[13px]">Mesas Regulares Cash NL5</span>
              <span className="text-[10px] text-[#64748b]">
                ({regCount} días • {regHands.toLocaleString()} manos)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#64748b] text-[11px]">Rakeback: +${regRakeback.toFixed(2)}</span>
              <span className={`font-bold tabular-nums ${regProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {regProfit >= 0 ? `+$${regProfit.toFixed(2)}` : `-$${Math.abs(regProfit).toFixed(2)}`} USD
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#171f33] rounded-full overflow-hidden flex">
            <div className="h-full bg-[#10b981] rounded-full" style={{ width: `${Math.min(100, Math.max(10, regShare))}%` }}></div>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-[#64748b]">
            <span>Winrate: <strong className="text-[#10b981]">+{regWinrate} bb/100</strong></span>
            <span>Cuota de Beneficio: <strong className="text-[#10b981] font-bold">{regShare}% del Profit</strong></span>
          </div>
        </div>

        {/* Rush & Cash Zoom */}
        <div className="p-2.5 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></span>
              <span className="font-bold text-[#f8fafc] font-sans text-[13px]">Rush &amp; Cash (Fast-Fold)</span>
              <span className="text-[10px] text-[#64748b]">
                ({rushCount} días • {rushHands.toLocaleString()} manos)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#64748b] text-[11px]">Rakeback: +${rushRakeback.toFixed(2)}</span>
              <span className={`font-bold tabular-nums ${rushProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {rushProfit >= 0 ? `+$${rushProfit.toFixed(2)}` : `-$${Math.abs(rushProfit).toFixed(2)}`} USD
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#171f33] rounded-full overflow-hidden flex">
            <div className="h-full bg-[#38bdf8] rounded-full" style={{ width: `${Math.min(100, Math.max(10, rushShare))}%` }}></div>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-[#64748b]">
            <span>Winrate: <strong className="text-[#10b981]">+{rushWinrate} bb/100</strong></span>
            <span>Cuota de Beneficio: <strong className="text-[#38bdf8] font-bold">{rushShare}% del Profit</strong></span>
          </div>
        </div>
      </div>

      {/* Daily Performance Consistency (Strictly Day-based) */}
      <div className="pt-2 border-t border-[rgba(255,255,255,0.08)] flex flex-col gap-2 font-mono">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#64748b] uppercase tracking-wider">Consistencia por Bloques de Días</span>
          <span className="text-[#10b981] font-bold text-[10px]">{winDayPct}% DÍAS POSITIVOS</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col">
            <span className="text-[#64748b] text-[10px]">Laborables (Lun-Vie)</span>
            <span className={`font-bold mt-1 tabular-nums ${weekdayProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {weekdayProfit >= 0 ? '+' : ''}${weekdayProfit.toFixed(2)} USD
            </span>
            <span className="text-[9px] text-[#64748b] mt-0.5">{weekdays.length} días registrados</span>
          </div>
          <div className="p-2 rounded-lg bg-[#064e3b]/10 border border-[#10b981]/30 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[#10b981] text-[10px] font-bold">Fines de Semana</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            </div>
            <span className={`font-bold mt-1 tabular-nums ${weekendProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {weekendProfit >= 0 ? '+' : ''}${weekendProfit.toFixed(2)} USD
            </span>
            <span className="text-[9px] text-[#10b981] font-medium mt-0.5">{weekends.length} días • Tráfico Blando</span>
          </div>
          <div className="p-2 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col">
            <span className="text-[#64748b] text-[10px]">Efectividad Global</span>
            <span className="text-[#f8fafc] font-bold mt-1 tabular-nums">
              {winningDays}G - {totalDays - winningDays}P
            </span>
            <span className="text-[9px] text-[#64748b] mt-0.5">{totalDays} días evaluados</span>
          </div>
        </div>
      </div>
    </div>
  );
};
