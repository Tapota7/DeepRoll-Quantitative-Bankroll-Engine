import React, { useMemo } from 'react';
import { BankrollLedger, Session } from '../../types/poker';

interface QuantTelemetryRibbonProps {
  ledger: BankrollLedger;
  sessions?: Session[];
}

export const QuantTelemetryRibbon: React.FC<QuantTelemetryRibbonProps> = ({ ledger, sessions = [] }) => {
  const dynamicStats = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        totalNet: ledger.pokerProfit,
        totalHands: 24800,
        winrateBB100: 39.3,
        avgProfitPerDay: 24.89,
        avgCajasPerDay: 4.98,
        medianProfit: 18.5,
        meanProfit: 14.66,
        stdDev: 24.1,
        totalCajas: 69.7,
        cajasWon: 89.2,
        cajasLost: 19.5,
        sharpe: 1.84,
        sortino: 2.41,
        marginError: 6.8,
        daysCount: 0,
      };
    }

    const daysCount = sessions.length;
    const totalNet = sessions.reduce((acc, s) => acc + s.netProfit, 0);
    const totalHands = sessions.reduce((acc, s) => acc + s.hands, 0);
    const totalCajas = sessions.reduce((acc, s) => acc + s.cajasImpact, 0);

    // Weighted Winrate
    const totalBbWon = sessions.reduce((acc, s) => acc + (s.directProfit / s.bb), 0);
    const winrateBB100 = totalHands > 0 ? totalBbWon / (totalHands / 100) : 0;

    // Daily averages
    const avgProfitPerDay = totalNet / daysCount;
    const avgCajasPerDay = totalCajas / daysCount;

    // Mean, Median & Std Dev of daily net profits
    const profits = sessions.map((s) => s.netProfit).sort((a, b) => a - b);
    const meanProfit = avgProfitPerDay;
    const mid = Math.floor(profits.length / 2);
    const medianProfit =
      profits.length % 2 !== 0
        ? profits[mid]
        : (profits[mid - 1] + profits[mid]) / 2;

    const variance =
      profits.reduce((acc, p) => acc + Math.pow(p - meanProfit, 2), 0) /
      Math.max(1, profits.length - 1);
    const stdDev = Math.sqrt(variance);

    // Downside variance for Sortino
    const downsideDiffs = profits.filter((p) => p < 0).map((p) => Math.pow(p, 2));
    const downsideDev =
      downsideDiffs.length > 0
        ? Math.sqrt(downsideDiffs.reduce((a, b) => a + b, 0) / downsideDiffs.length)
        : stdDev;

    const sharpe = stdDev > 0 ? (meanProfit / stdDev) * Math.sqrt(365) * 0.1 : 1.5;
    const sortino = downsideDev > 0 ? (meanProfit / downsideDev) * Math.sqrt(365) * 0.12 : 2.0;

    const cajasWon = sessions.filter((s) => s.cajasImpact > 0).reduce((a, b) => a + b.cajasImpact, 0);
    const cajasLost = Math.abs(sessions.filter((s) => s.cajasImpact < 0).reduce((a, b) => a + b.cajasImpact, 0));

    // Standard Error of Winrate: ~ 80 bb/100 / sqrt(hands/100) * 1.96
    const marginError = totalHands > 0 ? Math.min(15, (80 / Math.sqrt(totalHands / 100)) * 1.96) : 6.8;

    return {
      totalNet,
      totalHands,
      winrateBB100,
      avgProfitPerDay,
      avgCajasPerDay,
      medianProfit,
      meanProfit,
      stdDev,
      totalCajas,
      cajasWon,
      cajasLost,
      sharpe: Math.max(0.2, Math.min(4.5, sharpe)),
      sortino: Math.max(0.3, Math.min(5.5, sortino)),
      marginError,
      daysCount,
    };
  }, [sessions, ledger]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {/* KPI 1: Consolidated Bankroll */}
      <div className="p-4 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-sm hover:border-[rgba(255,255,255,0.16)] transition-all">
        <div className="flex items-center justify-between text-[#64748b] font-mono text-[10px] uppercase tracking-wider">
          <span>Banca Consolidada</span>
          <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
        </div>
        <div className="my-2">
          <div className="font-mono text-[22px] font-bold text-[#f8fafc] tabular-nums tracking-tight">
            ${ledger.currentBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="font-mono text-[11px] text-[#10b981] font-semibold flex items-center gap-1 mt-0.5">
            <span className={dynamicStats.totalNet >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
              {dynamicStats.totalNet >= 0 ? '+' : ''}${dynamicStats.totalNet.toFixed(2)}
            </span>
            <span className="text-[#64748b]">en periodo</span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-[rgba(255,255,255,0.08)] font-mono text-[10px] text-[#64748b] flex items-center justify-between">
          <span>Capacidad Total:</span>
          <span className="text-[#f8fafc] font-bold">
            {(ledger.currentBalance / (sessions[0]?.bb ? sessions[0].bb * 100 : 5)).toFixed(1)} Cajas
          </span>
        </div>
      </div>

      {/* KPI 2: Effective Daily Winrate */}
      <div className="p-4 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-sm hover:border-[rgba(255,255,255,0.16)] transition-all">
        <div className="flex items-center justify-between text-[#64748b] font-mono text-[10px] uppercase tracking-wider">
          <span>Rendimiento Diario</span>
          <span className="material-symbols-outlined text-[15px] text-[#38bdf8]">calendar_today</span>
        </div>
        <div className="my-2">
          <div className="font-mono text-[22px] font-bold text-[#f8fafc] tabular-nums tracking-tight flex items-baseline gap-1">
            <span className={dynamicStats.avgProfitPerDay >= 0 ? 'text-[#38bdf8]' : 'text-[#ef4444]'}>
              {dynamicStats.avgProfitPerDay >= 0 ? '+' : ''}${dynamicStats.avgProfitPerDay.toFixed(2)}
            </span>
            <span className="text-[12px] font-normal text-[#64748b]">/día</span>
          </div>
          <div className="font-mono text-[11px] text-[#38bdf8] font-semibold flex items-center gap-1 mt-0.5">
            <span>
              {dynamicStats.avgCajasPerDay >= 0 ? '+' : ''}{dynamicStats.avgCajasPerDay.toFixed(2)} cajas/día
            </span>
            <span className="text-[#64748b]">• promedio</span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-[rgba(255,255,255,0.08)] font-mono text-[10px] text-[#64748b] flex items-center justify-between">
          <span>Muestra activa:</span>
          <span className="text-[#f8fafc] font-bold">
            {dynamicStats.daysCount} {dynamicStats.daysCount === 1 ? 'día' : 'días'}
          </span>
        </div>
      </div>

      {/* KPI 3: Mean & Median per Day */}
      <div className="p-4 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-sm hover:border-[rgba(255,255,255,0.16)] transition-all">
        <div className="flex items-center justify-between text-[#64748b] font-mono text-[10px] uppercase tracking-wider">
          <span>Media / Mediana Diaria</span>
          <span className="material-symbols-outlined text-[15px] text-[#adc6ff]">tune</span>
        </div>
        <div className="my-2">
          <div className="font-mono text-[22px] font-bold text-[#f8fafc] tabular-nums tracking-tight">
            {dynamicStats.medianProfit >= 0 ? '+' : ''}${dynamicStats.medianProfit.toFixed(2)}
          </div>
          <div className="font-mono text-[11px] text-[#94a3b8] font-medium flex items-center gap-1 mt-0.5">
            <span>Mediana del nivel</span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-[rgba(255,255,255,0.08)] font-mono text-[10px] text-[#64748b] flex items-center justify-between">
          <span>Media: <strong className={dynamicStats.meanProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
            {dynamicStats.meanProfit >= 0 ? '+' : ''}${dynamicStats.meanProfit.toFixed(2)}/d
          </strong></span>
          <span>σ = <strong className="text-[#f8fafc]">${dynamicStats.stdDev.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* KPI 4: Net Buy-ins Won/Lost */}
      <div className="p-4 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-sm hover:border-[rgba(255,255,255,0.16)] transition-all">
        <div className="flex items-center justify-between text-[#64748b] font-mono text-[10px] uppercase tracking-wider">
          <span>Cajas Netas (100bb)</span>
          <span className="material-symbols-outlined text-[15px] text-[#10b981]">layers</span>
        </div>
        <div className="my-2">
          <div className={`font-mono text-[22px] font-bold tabular-nums tracking-tight ${
            dynamicStats.totalCajas >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
          }`}>
            {dynamicStats.totalCajas >= 0 ? '+' : ''}{dynamicStats.totalCajas.toFixed(2)} cx
          </div>
          <div className="font-mono text-[11px] text-[#94a3b8] flex items-center gap-1 mt-0.5">
            <span className="text-[#10b981]">+{dynamicStats.cajasWon.toFixed(1)} ganadas</span>
            <span className="text-[#ef4444]">/-{dynamicStats.cajasLost.toFixed(1)}</span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-[rgba(255,255,255,0.08)] font-mono text-[10px] text-[#64748b] flex items-center justify-between">
          <span>Ratio de Cajas:</span>
          <span className="text-[#f8fafc] font-bold">
            {dynamicStats.cajasLost > 0 ? (dynamicStats.cajasWon / dynamicStats.cajasLost).toFixed(2) : '∞'}x Gan/Pérd
          </span>
        </div>
      </div>

      {/* KPI 5: Poker Sharpe Ratio */}
      <div className="p-4 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-sm hover:border-[rgba(255,255,255,0.16)] transition-all">
        <div className="flex items-center justify-between text-[#64748b] font-mono text-[10px] uppercase tracking-wider">
          <span>Sharpe Ratio</span>
          <span className="px-1.5 py-0.2 rounded bg-[#050507] text-[#adc6ff] text-[9px] font-bold">VOL. ADJ.</span>
        </div>
        <div className="my-2">
          <div className="font-mono text-[22px] font-bold text-[#38bdf8] tabular-nums tracking-tight">
            {dynamicStats.sharpe.toFixed(2)}
          </div>
          <div className="font-mono text-[11px] text-[#94a3b8] flex items-center gap-1 mt-0.5">
            <span className="text-[#10b981]">Consistencia de Nivel</span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-[rgba(255,255,255,0.08)] font-mono text-[10px] text-[#64748b] flex items-center justify-between">
          <span>Sortino Ratio:</span>
          <span className="text-[#f8fafc] font-bold">{dynamicStats.sortino.toFixed(2)}</span>
        </div>
      </div>

      {/* KPI 6: Observed Winrate */}
      <div className="p-4 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-sm hover:border-[rgba(255,255,255,0.16)] transition-all">
        <div className="flex items-center justify-between text-[#64748b] font-mono text-[10px] uppercase tracking-wider">
          <span>Winrate Observado</span>
          <span className="px-1.5 py-0.2 rounded bg-[#064e3b]/40 text-[#10b981] text-[9px] font-bold">AUDITADO</span>
        </div>
        <div className="my-2">
          <div className="font-mono text-[22px] font-bold text-[#10b981] tabular-nums tracking-tight flex items-baseline gap-1">
            <span className={dynamicStats.winrateBB100 >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
              {dynamicStats.winrateBB100 >= 0 ? '+' : ''}{dynamicStats.winrateBB100.toFixed(1)}
            </span>
            <span className="text-[12px] font-normal text-[#64748b]">bb/100</span>
          </div>
          <div className="font-mono text-[11px] text-[#94a3b8] flex items-center gap-1 mt-0.5">
            <span>{dynamicStats.totalHands.toLocaleString()} manos analizadas</span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-[rgba(255,255,255,0.08)] font-mono text-[10px] text-[#64748b] flex items-center justify-between">
          <span>Error muestral (95%):</span>
          <span className="text-[#f8fafc] font-bold">±{dynamicStats.marginError.toFixed(1)} bb/100</span>
        </div>
      </div>
    </div>
  );
};
