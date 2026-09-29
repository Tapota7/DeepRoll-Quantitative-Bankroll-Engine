import React, { useMemo, useState } from 'react';
import { Session } from '../../types/poker';

interface DailyPerformanceCardProps {
  sessions: Session[];
}

export const DailyPerformanceCard: React.FC<DailyPerformanceCardProps> = ({ sessions }) => {
  const [hoveredSession, setHoveredSession] = useState<Session | null>(null);

  const stats = useMemo(() => {
    const totalDays = sessions.length;
    if (totalDays === 0) {
      return {
        totalDays: 0,
        totalNet: 0,
        totalDirect: 0,
        totalRakeback: 0,
        avgProfitPerDay: 0,
        avgCajasPerDay: 0,
        avgHandsPerDay: 0,
        winningDays: 0,
        losingDays: 0,
        evenDays: 0,
        winRatePct: 0,
        profitFactor: 0,
        grossWin: 0,
        grossLoss: 0,
        currentStreakType: 'none' as 'win' | 'loss' | 'none',
        currentStreakCount: 0,
        currentStreakProfit: 0,
        bestWinningStreak: 0,
        bestWinningStreakProfit: 0,
        bestDay: null as Session | null,
        worstDay: null as Session | null,
        recentSessions: [] as Session[],
      };
    }

    const totalNet = sessions.reduce((acc, s) => acc + s.netProfit, 0);
    const totalDirect = sessions.reduce((acc, s) => acc + s.directProfit, 0);
    const totalRakeback = sessions.reduce((acc, s) => acc + s.rakeback, 0);
    const totalHands = sessions.reduce((acc, s) => acc + s.hands, 0);
    const totalCajas = sessions.reduce((acc, s) => acc + s.cajasImpact, 0);

    const avgProfitPerDay = totalNet / totalDays;
    const avgCajasPerDay = totalCajas / totalDays;
    const avgHandsPerDay = Math.round(totalHands / totalDays);

    const winningDays = sessions.filter((s) => s.netProfit > 0).length;
    const losingDays = sessions.filter((s) => s.netProfit < 0).length;
    const evenDays = sessions.filter((s) => s.netProfit === 0).length;
    const winRatePct = (winningDays / totalDays) * 100;

    const grossWin = sessions.filter((s) => s.netProfit > 0).reduce((acc, s) => acc + s.netProfit, 0);
    const grossLoss = Math.abs(sessions.filter((s) => s.netProfit < 0).reduce((acc, s) => acc + s.netProfit, 0));
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 99.9 : 0;

    // Sort chronologically ascending for streak computations
    const chronological = [...sessions].sort((a, b) => a.timestamp - b.timestamp);

    // Current Streak (from newest to oldest)
    let currentStreakType: 'win' | 'loss' | 'none' = 'none';
    let currentStreakCount = 0;
    let currentStreakProfit = 0;

    if (chronological.length > 0) {
      const lastSession = chronological[chronological.length - 1];
      if (lastSession.netProfit > 0) {
        currentStreakType = 'win';
        for (let i = chronological.length - 1; i >= 0; i--) {
          if (chronological[i].netProfit > 0) {
            currentStreakCount++;
            currentStreakProfit += chronological[i].netProfit;
          } else {
            break;
          }
        }
      } else if (lastSession.netProfit < 0) {
        currentStreakType = 'loss';
        for (let i = chronological.length - 1; i >= 0; i--) {
          if (chronological[i].netProfit < 0) {
            currentStreakCount++;
            currentStreakProfit += chronological[i].netProfit;
          } else {
            break;
          }
        }
      }
    }

    // Best Winning Streak in the filtered dataset
    let bestWinningStreak = 0;
    let bestWinningStreakProfit = 0;
    let tempStreak = 0;
    let tempProfit = 0;

    for (const s of chronological) {
      if (s.netProfit > 0) {
        tempStreak++;
        tempProfit += s.netProfit;
        if (tempStreak > bestWinningStreak) {
          bestWinningStreak = tempStreak;
          bestWinningStreakProfit = tempProfit;
        }
      } else {
        tempStreak = 0;
        tempProfit = 0;
      }
    }

    // Best and Worst single day
    const bestDay = [...sessions].sort((a, b) => b.netProfit - a.netProfit)[0] || null;
    const worstDay = [...sessions].sort((a, b) => a.netProfit - b.netProfit)[0] || null;

    // Recent 10 days for dot trail (chronological)
    const recentSessions = chronological.slice(-10);

    return {
      totalDays,
      totalNet,
      totalDirect,
      totalRakeback,
      avgProfitPerDay,
      avgCajasPerDay,
      avgHandsPerDay,
      winningDays,
      losingDays,
      evenDays,
      winRatePct,
      profitFactor,
      grossWin,
      grossLoss,
      currentStreakType,
      currentStreakCount,
      currentStreakProfit,
      bestWinningStreak,
      bestWinningStreakProfit,
      bestDay,
      worstDay,
      recentSessions,
    };
  }, [sessions]);

  if (stats.totalDays === 0) {
    return (
      <div className="bg-[#131b2e] rounded-xl border border-[rgba(255,255,255,0.08)] p-6 text-center text-[#64748b] font-mono text-sm">
        No hay registros de días para el rango seleccionado.
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#131b2e] rounded-xl border border-[rgba(255,255,255,0.08)] p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#10b981]">
            <span className="material-symbols-outlined text-[19px]">calendar_month</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-[#f8fafc] tracking-tight font-sans">
                Resumen de Rendimiento Diario
              </h3>
              <span className="px-2 py-0.5 rounded bg-[#050507] text-[#10b981] font-mono text-[10px] font-bold border border-[#10b981]/20">
                1 REGISTRO / DÍA
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] font-mono mt-0.5">
              Consolidación cuantitativa de {stats.totalDays} {stats.totalDays === 1 ? 'día jugado' : 'días jugados'} en el periodo activo
            </p>
          </div>
        </div>

        {/* Global Net Mini Tag */}
        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[11px]">
          <span className="text-[#64748b]">Total Periodo:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded bg-[#050507] border ${
              stats.totalNet >= 0
                ? 'text-[#10b981] border-[#10b981]/30'
                : 'text-[#ef4444] border-[#ef4444]/30'
            }`}
          >
            {stats.totalNet >= 0 ? '+' : ''}${stats.totalNet.toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* Main 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* PILLAR 1: PROMEDIO DE GANANCIAS */}
        <div className="p-4 rounded-xl bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between space-y-3 font-mono">
          <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase tracking-wider">
            <span>Promedio de Ganancias</span>
            <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">payments</span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-[24px] font-bold tabular-nums tracking-tight ${
                  stats.avgProfitPerDay >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
                }`}
              >
                {stats.avgProfitPerDay >= 0 ? '+' : ''}${stats.avgProfitPerDay.toFixed(2)}
              </span>
              <span className="text-[11px] text-[#64748b]">/ día jugado</span>
            </div>
            <div className="text-[11px] text-[#94a3b8] mt-1 flex items-center gap-2">
              <span className={stats.avgCajasPerDay >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
                {stats.avgCajasPerDay >= 0 ? '+' : ''}{stats.avgCajasPerDay.toFixed(2)} cajas/día
              </span>
              <span className="text-[#64748b]">•</span>
              <span className="text-[#64748b]">~{stats.avgHandsPerDay.toLocaleString()} manos/día</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] text-[10px] text-[#64748b] flex items-center justify-between">
            <span>Ganancia Mesa: <strong className={stats.totalDirect >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
              {stats.totalDirect >= 0 ? '+' : ''}${(stats.totalDirect / stats.totalDays).toFixed(2)}/d
            </strong></span>
            <span>Rakeback: <strong className="text-[#38bdf8]">+${(stats.totalRakeback / stats.totalDays).toFixed(2)}/d</strong></span>
          </div>
        </div>

        {/* PILLAR 2: TASA DE ÉXITO (DÍAS POSITIVOS VS NEGATIVOS) */}
        <div className="p-4 rounded-xl bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between space-y-3 font-mono">
          <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase tracking-wider">
            <span>Tasa de Éxito Diaria</span>
            <span className="material-symbols-outlined text-[16px] text-[#10b981]">pie_chart</span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[24px] font-bold text-[#f8fafc] tabular-nums tracking-tight">
                {stats.winRatePct.toFixed(1)}%
              </span>
              <span className="text-[11px] text-[#10b981] font-semibold">
                ({stats.winningDays}G - {stats.losingDays}P)
              </span>
            </div>

            {/* Split Progress Bar */}
            <div className="w-full h-2.5 bg-[#171f33] rounded-full overflow-hidden flex my-2 border border-[rgba(255,255,255,0.05)]">
              <div
                className="h-full bg-[#10b981] transition-all duration-300"
                style={{ width: `${stats.winRatePct}%` }}
                title={`${stats.winningDays} días ganadores (${stats.winRatePct.toFixed(1)}%)`}
              />
              <div
                className="h-full bg-[#ef4444] transition-all duration-300"
                style={{ width: `${100 - stats.winRatePct}%` }}
                title={`${stats.losingDays} días perdedores`}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#94a3b8]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                <span>{stats.winningDays} {stats.winningDays === 1 ? 'positivo' : 'positivos'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                <span>{stats.losingDays} {stats.losingDays === 1 ? 'negativo' : 'negativos'}</span>
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] text-[10px] text-[#64748b] flex items-center justify-between">
            <span>Profit Factor: <strong className="text-[#f8fafc]">{stats.profitFactor.toFixed(2)}x</strong></span>
            <span>Ratio G/P: <strong className="text-[#10b981]">{(stats.winningDays / Math.max(1, stats.losingDays)).toFixed(1)}:1</strong></span>
          </div>
        </div>

        {/* PILLAR 3: RACHA ACTUAL DE DÍAS GANADORES */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 font-mono transition-all ${
            stats.currentStreakType === 'win'
              ? 'bg-[#064e3b]/15 border-[#10b981]/40 shadow-sm'
              : stats.currentStreakType === 'loss'
              ? 'bg-[#450a0a]/15 border-[#ef4444]/40'
              : 'bg-[#050507] border-[rgba(255,255,255,0.08)]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
            <span className={stats.currentStreakType === 'win' ? 'text-[#10b981] font-bold' : 'text-[#64748b]'}>
              Racha Actual de Juego
            </span>
            <div className="flex items-center gap-1">
              {stats.currentStreakType === 'win' && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                </span>
              )}
              <span className="material-symbols-outlined text-[16px] text-[#eab308]">local_fire_department</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-[24px] font-bold tabular-nums tracking-tight ${
                  stats.currentStreakType === 'win'
                    ? 'text-[#10b981]'
                    : stats.currentStreakType === 'loss'
                    ? 'text-[#ef4444]'
                    : 'text-[#94a3b8]'
                }`}
              >
                {stats.currentStreakCount} {stats.currentStreakCount === 1 ? 'DÍA' : 'DÍAS'}
              </span>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  stats.currentStreakType === 'win'
                    ? 'text-[#10b981]'
                    : stats.currentStreakType === 'loss'
                    ? 'text-[#ef4444]'
                    : 'text-[#64748b]'
                }`}
              >
                {stats.currentStreakType === 'win'
                  ? 'Ganadores 🔥'
                  : stats.currentStreakType === 'loss'
                  ? 'En Rojo ❄️'
                  : 'Neutro'}
              </span>
            </div>

            <div className="text-[11px] text-[#94a3b8] mt-1">
              {stats.currentStreakType === 'win' && (
                <span className="text-[#10b981] font-semibold">
                  +${stats.currentStreakProfit.toFixed(2)} USD acumulados en racha
                </span>
              )}
              {stats.currentStreakType === 'loss' && (
                <span className="text-[#ef4444] font-semibold">
                  -${Math.abs(stats.currentStreakProfit).toFixed(2)} USD en contención
                </span>
              )}
              {stats.currentStreakType === 'none' && (
                <span className="text-[#64748b]">Sin racha activa</span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] text-[10px] text-[#64748b] flex items-center justify-between">
            <span>Récord Periodo:</span>
            <span className="text-[#f8fafc] font-bold">
              ★ {stats.bestWinningStreak} días seguidos (+${stats.bestWinningStreakProfit.toFixed(2)})
            </span>
          </div>
        </div>
      </div>

      {/* Mini Streak Trail & Day-Range Extremes */}
      <div className="p-3 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono">
        {/* Recent 10 Days Dot Trail */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-[#64748b] uppercase tracking-wider">
            Secuencia Reciente (Últimos {stats.recentSessions.length} días)
          </span>
          <div className="flex items-center gap-1.5">
            {stats.recentSessions.map((s, idx) => {
              const isWin = s.netProfit > 0;
              const isSelected = hoveredSession?.id === s.id;
              return (
                <button
                  key={s.id || idx}
                  type="button"
                  onMouseEnter={() => setHoveredSession(s)}
                  onMouseLeave={() => setHoveredSession(null)}
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                    isWin
                      ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 hover:bg-[#10b981]/40'
                      : 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40 hover:bg-[#ef4444]/40'
                  } ${isSelected ? 'ring-2 ring-white scale-110 z-10' : ''}`}
                  title={`${s.date}: ${isWin ? '+' : ''}$${s.netProfit.toFixed(2)} USD`}
                >
                  {isWin ? '+' : '–'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hovered Session Detail or Period Best/Worst Days */}
        {hoveredSession ? (
          <div className="flex items-center gap-3 p-2 rounded bg-[#131b2e] border border-[rgba(255,255,255,0.1)] animate-in fade-in">
            <span className="text-[#f8fafc] font-bold">{hoveredSession.id} ({hoveredSession.date})</span>
            <span className="text-[#64748b]">•</span>
            <span className={hoveredSession.netProfit >= 0 ? 'text-[#10b981] font-bold' : 'text-[#ef4444] font-bold'}>
              {hoveredSession.netProfit >= 0 ? '+' : ''}${hoveredSession.netProfit.toFixed(2)} USD
            </span>
            <span className="text-[#64748b]">•</span>
            <span className="text-[#38bdf8]">{hoveredSession.hands.toLocaleString()} manos</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#64748b]">
            <div>
              Mejor Día: <strong className="text-[#10b981]">
                {stats.bestDay ? `+${stats.bestDay.netProfit.toFixed(2)}$ (${stats.bestDay.date.split(',')[0]})` : 'N/A'}
              </strong>
            </div>
            <div>
              Mayor Retroceso: <strong className="text-[#ef4444]">
                {stats.worstDay ? `${stats.worstDay.netProfit.toFixed(2)}$ (${stats.worstDay.date.split(',')[0]})` : 'N/A'}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
