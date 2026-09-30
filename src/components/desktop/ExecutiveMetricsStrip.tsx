import React, { useMemo } from 'react';
import { BankrollLedger, Session } from '../../types/poker';

interface ExecutiveMetricsStripProps {
  ledger: BankrollLedger;
  sessions: Session[];
  boxSize: number;
  selectedStake: string;
}

export const ExecutiveMetricsStrip: React.FC<ExecutiveMetricsStripProps> = ({
  ledger,
  sessions,
  boxSize,
  selectedStake,
}) => {
  const metrics = useMemo(() => {
    const totalHands = sessions.reduce((a, s) => a + s.hands, 0);
    const totalMinutes = sessions.reduce((a, s) => a + s.durationMinutes, 0);
    const totalHours = totalMinutes / 60;

    const totalDirect = sessions.reduce((a, s) => a + s.directProfit, 0);
    const totalRakeback = sessions.reduce((a, s) => a + s.rakeback, 0);
    const totalNet = sessions.reduce((a, s) => a + s.netProfit, 0);

    // 1. Cajas según el nivel activo
    const totalCajas = parseFloat((ledger.currentBalance / (boxSize || 5.0)).toFixed(1));

    // 2. Winrate ponderado y margen de error con intervalo de confianza del 95%
    // Desviación típica estimada en deepstack cash: sigma ~ 75-80 bb/100
    const totalBb = sessions.reduce((a, s) => a + (s.directProfit / s.bb), 0);
    const winrateBB100 = totalHands > 0 ? parseFloat((totalBb / (totalHands / 100)).toFixed(2)) : 0;
    const standardError = totalHands >= 500
      ? parseFloat(((1.96 * 78) / Math.sqrt(totalHands / 100)).toFixed(1))
      : null;

    // 3. Rakeback Share
    let rakebackSharePct = 0;
    if (totalNet > 0) {
      rakebackSharePct = Math.min(100, Math.round((totalRakeback / totalNet) * 100));
    } else if (totalRakeback > 0) {
      rakebackSharePct = 100;
    }

    // 4. Ganancia horaria real
    const hourlyProfitUSD = totalHours > 0 ? parseFloat((totalNet / totalHours).toFixed(2)) : 0;

    return {
      balanceUSD: ledger.currentBalance,
      totalCajas,
      totalHands,
      totalHours: parseFloat(totalHours.toFixed(1)),
      winrateBB100,
      standardError,
      totalDirect,
      totalRakeback,
      rakebackSharePct,
      totalNet,
      hourlyProfitUSD,
    };
  }, [ledger, sessions, boxSize]);

  const stakeLabel =
    selectedStake === 'all'
      ? 'Promedio Global'
      : `${selectedStake} ($${boxSize}/cx)`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
      {/* KPI 1: Capital Disponible & Cajas */}
      <div className="p-4 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-[#10b981]/40 transition-all">
        <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase tracking-wider font-semibold">
          <span>Banca &amp; Cobertura</span>
          <span className="flex items-center gap-1 text-[#10b981] bg-[#064e3b]/30 px-1.5 py-0.5 rounded text-[9px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            {metrics.totalCajas} CX
          </span>
        </div>

        <div className="my-2.5">
          <div className="text-[26px] font-bold text-[#f8fafc] tabular-nums tracking-tight">
            ${metrics.balanceUSD.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-[12px] font-normal text-[#94a3b8] ml-1">USD</span>
          </div>
          <div className="text-[11px] text-[#10b981] font-semibold mt-0.5">
            {metrics.totalCajas >= 50 ? 'Banca Blindada' : metrics.totalCajas >= 30 ? 'Zona Segura' : 'Precaución'}{' '}
            <span className="text-[#64748b] font-normal">({metrics.totalCajas} cajas de 100bb)</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[10px] text-[#64748b]">
          <span>Nivel Activo:</span>
          <span className="text-[#dae2fd] font-semibold">{stakeLabel}</span>
        </div>
      </div>

      {/* KPI 2: Winrate Técnico en Mesas */}
      <div className="p-4 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-sm group hover:border-[#38bdf8]/40 transition-all">
        <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase tracking-wider font-semibold">
          <span>Winrate en Mesa (Edge)</span>
          <span className="text-[#38bdf8] text-[10px] flex items-center gap-0.5 font-bold">
            <span className="material-symbols-outlined text-[13px]">military_tech</span>
            PURITY
          </span>
        </div>

        <div className="my-2.5">
          <div
            className={`text-[26px] font-bold tabular-nums tracking-tight ${
              metrics.winrateBB100 >= 0 ? 'text-[#38bdf8]' : 'text-[#ef4444]'
            }`}
          >
            {metrics.winrateBB100 >= 0 ? `+${metrics.winrateBB100.toFixed(1)}` : metrics.winrateBB100.toFixed(1)}
            <span className="text-[12px] font-normal text-[#94a3b8] ml-1">bb/100</span>
          </div>
          <div className="text-[11px] text-[#94a3b8] font-normal mt-0.5">
            {metrics.standardError ? (
              <span>
                IC 95%: <strong className="text-[#f8fafc]">±{metrics.standardError} bb</strong>
              </span>
            ) : (
              <span>Requiere &gt;500 manos</span>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[10px] text-[#64748b]">
          <span>Ganancia en Mesa:</span>
          <span
            className={`font-semibold tabular-nums ${
              metrics.totalDirect >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
            }`}
          >
            {metrics.totalDirect >= 0 ? '+' : ''}${metrics.totalDirect.toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* KPI 3: Fish Buffet & Rakeback */}
      <div className="p-4 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-sm group hover:border-[#ffb95f]/40 transition-all">
        <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase tracking-wider font-semibold">
          <span>Fish Buffet (Rakeback)</span>
          <span className="text-[#ffb95f] bg-[#78350f]/30 px-1.5 py-0.5 rounded text-[9px] font-bold">
            {metrics.rakebackSharePct}% DEL NETO
          </span>
        </div>

        <div className="my-2.5">
          <div className="text-[26px] font-bold text-[#ffb95f] tabular-nums tracking-tight">
            +${metrics.totalRakeback.toFixed(2)}
            <span className="text-[12px] font-normal text-[#94a3b8] ml-1">USD</span>
          </div>
          <div className="text-[11px] text-[#94a3b8] font-normal mt-0.5">
            Amortización directa de varianza
          </div>
        </div>

        <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[10px] text-[#64748b]">
          <span>Neto Total (Mesa + RB):</span>
          <span
            className={`font-semibold tabular-nums ${
              metrics.totalNet >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
            }`}
          >
            {metrics.totalNet >= 0 ? '+' : ''}${metrics.totalNet.toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* KPI 4: Rendimiento Horario & Volumen */}
      <div className="p-4 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-sm group hover:border-[#a855f7]/40 transition-all">
        <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase tracking-wider font-semibold">
          <span>Tasa Horaria &amp; Volumen</span>
          <span className="text-[#a855f7] text-[10px] flex items-center gap-0.5 font-bold">
            <span className="material-symbols-outlined text-[13px]">pace</span>
            EFFICIENCY
          </span>
        </div>

        <div className="my-2.5">
          <div
            className={`text-[26px] font-bold tabular-nums tracking-tight ${
              metrics.hourlyProfitUSD >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
            }`}
          >
            {metrics.hourlyProfitUSD >= 0 ? `+$${metrics.hourlyProfitUSD.toFixed(1)}` : `-$${Math.abs(metrics.hourlyProfitUSD).toFixed(1)}`}
            <span className="text-[12px] font-normal text-[#94a3b8] ml-1">/ hora</span>
          </div>
          <div className="text-[11px] text-[#94a3b8] font-normal mt-0.5">
            <strong className="text-[#f8fafc]">{metrics.totalHands.toLocaleString()}</strong> manos en{' '}
            <strong className="text-[#f8fafc]">{metrics.totalHours}h</strong>
          </div>
        </div>

        <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[10px] text-[#64748b]">
          <span>Días Registrados:</span>
          <span className="text-[#dae2fd] font-semibold">
            {sessions.length} {sessions.length === 1 ? 'día' : 'días'}
          </span>
        </div>
      </div>
    </div>
  );
};
