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

    const totalCajas = parseFloat((ledger.currentBalance / (boxSize || 5.0)).toFixed(1));

    const totalBb = sessions.reduce((a, s) => a + (s.directProfit / s.bb), 0);
    const winrateBB100 = totalHands > 0 ? parseFloat((totalBb / (totalHands / 100)).toFixed(2)) : 0;
    const standardError = totalHands >= 500
      ? parseFloat(((1.96 * 78) / Math.sqrt(totalHands / 100)).toFixed(1))
      : null;

    let rakebackSharePct = 0;
    if (totalNet > 0) {
      rakebackSharePct = Math.min(100, Math.round((totalRakeback / totalNet) * 100));
    } else if (totalRakeback > 0) {
      rakebackSharePct = 100;
    }

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
      ? 'Consolidado'
      : `${selectedStake} ($${boxSize}/caja)`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Banca Total & Cobertura */}
      <div className="p-5 rounded-2xl bg-[#111218] border border-white/[0.06] flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-sans text-zinc-400">
          <span>Banca Total</span>
          <span className="text-[11px] font-mono text-zinc-300">
            {metrics.totalCajas} cx
          </span>
        </div>

        <div className="my-2">
          <div className="text-[26px] font-bold text-zinc-100 font-mono tabular-nums tracking-tight">
            ${metrics.balanceUSD.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[12px] text-zinc-400 font-sans mt-0.5">
            {metrics.totalCajas >= 50 ? 'Banca Blindada' : metrics.totalCajas >= 30 ? 'Zona Segura' : 'Gestión Prudente'}
          </div>
        </div>

        <div className="pt-2.5 border-t border-white/[0.04] text-[11px] text-zinc-500 font-sans flex items-center justify-between">
          <span>Filtro:</span>
          <span className="text-zinc-400 font-medium">{stakeLabel}</span>
        </div>
      </div>

      {/* 2. Winrate Mesa (Edge Técnico) */}
      <div className="p-5 rounded-2xl bg-[#111218] border border-white/[0.06] flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-sans text-zinc-400">
          <span>Winrate Mesa</span>
          <span className="text-[11px] font-sans text-zinc-500">bb/100</span>
        </div>

        <div className="my-2">
          <div
            className={`text-[26px] font-bold font-mono tabular-nums tracking-tight ${
              metrics.winrateBB100 >= 0 ? 'text-[#34d399]' : 'text-[#fb7185]'
            }`}
          >
            {metrics.winrateBB100 >= 0 ? `+${metrics.winrateBB100.toFixed(1)}` : metrics.winrateBB100.toFixed(1)}
          </div>
          <div className="text-[12px] text-zinc-400 font-sans mt-0.5">
            {metrics.standardError ? `IC 95%: ±${metrics.standardError} bb` : 'Muestra en formación'}
          </div>
        </div>

        <div className="pt-2.5 border-t border-white/[0.04] text-[11px] text-zinc-500 font-sans flex items-center justify-between">
          <span>Ganancia en mesa:</span>
          <span
            className={`font-mono ${
              metrics.totalDirect >= 0 ? 'text-zinc-300' : 'text-[#fb7185]'
            }`}
          >
            {metrics.totalDirect >= 0 ? '+' : ''}${metrics.totalDirect.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 3. Fish Buffet (Rakeback) */}
      <div className="p-5 rounded-2xl bg-[#111218] border border-white/[0.06] flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-sans text-zinc-400">
          <span>Fish Buffet</span>
          <span className="text-[11px] font-sans text-zinc-500">{metrics.rakebackSharePct}% del neto</span>
        </div>

        <div className="my-2">
          <div className="text-[26px] font-bold text-zinc-100 font-mono tabular-nums tracking-tight">
            +${metrics.totalRakeback.toFixed(2)}
          </div>
          <div className="text-[12px] text-zinc-400 font-sans mt-0.5">
            Recompensas acumuladas
          </div>
        </div>

        <div className="pt-2.5 border-t border-white/[0.04] text-[11px] text-zinc-500 font-sans flex items-center justify-between">
          <span>Neto Total:</span>
          <span
            className={`font-mono ${
              metrics.totalNet >= 0 ? 'text-zinc-300' : 'text-[#fb7185]'
            }`}
          >
            {metrics.totalNet >= 0 ? '+' : ''}${metrics.totalNet.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 4. Tasa Horaria & Volumen */}
      <div className="p-5 rounded-2xl bg-[#111218] border border-white/[0.06] flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-sans text-zinc-400">
          <span>Tasa Horaria</span>
          <span className="text-[11px] font-sans text-zinc-500">{metrics.totalHours}h jugadas</span>
        </div>

        <div className="my-2">
          <div
            className={`text-[26px] font-bold font-mono tabular-nums tracking-tight ${
              metrics.hourlyProfitUSD >= 0 ? 'text-zinc-100' : 'text-[#fb7185]'
            }`}
          >
            {metrics.hourlyProfitUSD >= 0 ? `+$${metrics.hourlyProfitUSD.toFixed(1)}` : `-$${Math.abs(metrics.hourlyProfitUSD).toFixed(1)}`}
            <span className="text-[14px] text-zinc-500 font-normal ml-1">/ h</span>
          </div>
          <div className="text-[12px] text-zinc-400 font-sans mt-0.5">
            {metrics.totalHands.toLocaleString()} manos jugadas
          </div>
        </div>

        <div className="pt-2.5 border-t border-white/[0.04] text-[11px] text-zinc-500 font-sans flex items-center justify-between">
          <span>Sesiones:</span>
          <span className="text-zinc-300 font-mono">{sessions.length} registradas</span>
        </div>
      </div>
    </div>
  );
};
