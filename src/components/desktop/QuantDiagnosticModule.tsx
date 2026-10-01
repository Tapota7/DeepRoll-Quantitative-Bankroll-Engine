import React, { useMemo } from 'react';
import { Session } from '../../types/poker';
import { generateQuantitativeDiagnostics } from '../../utils/pokerDiagnostics';

interface QuantDiagnosticModuleProps {
  sessions: Session[];
}

export const QuantDiagnosticModule: React.FC<QuantDiagnosticModuleProps> = ({ sessions }) => {
  const report = useMemo(() => generateQuantitativeDiagnostics(sessions), [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-[#111218] border border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] text-zinc-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
          </div>
          <div>
            <h4 className="font-sans text-[14px] font-semibold text-zinc-100">
              Diagnóstico Heurístico en Espera
            </h4>
            <p className="text-[12px] text-zinc-500 font-sans mt-0.5">
              Registra tus sesiones para activar el análisis automático de fatiga y consistencia.
            </p>
          </div>
        </div>
        <span className="text-zinc-500 font-sans text-[11px]">0 sesiones</span>
      </div>
    );
  }

  const { fatigue, rakeback, consistency } = report;

  return (
    <div className="p-6 rounded-2xl bg-[#111218] border border-white/[0.06] flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <h3 className="font-sans text-[15px] font-semibold text-zinc-100 tracking-tight">
            Diagnóstico Cuantitativo &amp; Fatiga
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-sans text-zinc-500">Salud Operativa:</span>
          <span
            className={`font-mono text-[12px] font-bold px-2 py-0.5 rounded-lg ${
              consistency.status === 'optimo'
                ? 'text-[#34d399] bg-[#34d399]/10'
                : consistency.status === 'moderado'
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-[#fb7185] bg-[#fb7185]/10'
            }`}
          >
            {consistency.healthScore}/100 • {consistency.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 3 Balanced Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pilar 1: Fatiga & Duración */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-sans text-zinc-400">
              <span>Fatiga &amp; Duración</span>
              <span className={`text-[10px] font-mono ${fatigue.hasFatigueDrop ? 'text-[#fb7185]' : 'text-zinc-500'}`}>
                {fatigue.hasFatigueDrop ? 'Caída de edge' : 'Estable'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] font-sans">
              <div>
                <span className="text-zinc-500 block text-[10px]">&lt; 90 min ({fatigue.shortSessionCount})</span>
                <span className={`font-mono font-bold ${fatigue.shortWinrateBB100 >= 0 ? 'text-[#34d399]' : 'text-[#fb7185]'}`}>
                  {fatigue.shortWinrateBB100 >= 0 ? '+' : ''}{fatigue.shortWinrateBB100} bb
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">≥ 90 min ({fatigue.longSessionCount})</span>
                <span className={`font-mono font-bold ${fatigue.longWinrateBB100 >= 0 ? 'text-zinc-300' : 'text-[#fb7185]'}`}>
                  {fatigue.longWinrateBB100 >= 0 ? '+' : ''}{fatigue.longWinrateBB100} bb
                </span>
              </div>
            </div>

            <p className="text-[12px] text-zinc-400 font-sans leading-relaxed">
              {fatigue.recommendation}
            </p>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500 font-sans">
            <span>Diferencia winrate:</span>
            <span
              className={`font-mono font-medium ${
                fatigue.winrateDeltaBB100 > 0 ? 'text-[#fb7185]' : 'text-zinc-400'
              }`}
            >
              {fatigue.winrateDeltaBB100 > 0 ? `-${fatigue.winrateDeltaBB100} bb/100` : `+${Math.abs(fatigue.winrateDeltaBB100)} bb/100`}
            </span>
          </div>
        </div>

        {/* Pilar 2: Fish Buffet Leverage */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-sans text-zinc-400">
              <span>Retorno Fish Buffet</span>
              <span className="text-[11px] font-mono text-zinc-400">
                {rakeback.rakebackSharePct}% del beneficio
              </span>
            </div>

            <div className="flex flex-col gap-1.5 my-0.5">
              <span className="font-sans text-[13px] font-semibold text-zinc-200">
                {rakeback.title}
              </span>
              <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#34d399] h-full"
                  style={{ width: `${Math.max(0, 100 - rakeback.rakebackSharePct)}%` }}
                />
                <div
                  className="bg-amber-400/80 h-full"
                  style={{ width: `${rakeback.rakebackSharePct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-sans text-zinc-500">
                <span>Mesa: ${rakeback.totalDirectUSD.toFixed(2)}</span>
                <span className="text-zinc-400">RB: +${rakeback.totalRakebackUSD.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[12px] text-zinc-400 font-sans leading-relaxed">
              {rakeback.description}
            </p>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500 font-sans">
            <span>Neto Consolidado:</span>
            <span
              className={`font-mono font-medium ${
                rakeback.totalNetUSD >= 0 ? 'text-zinc-200' : 'text-[#fb7185]'
              }`}
            >
              {rakeback.totalNetUSD >= 0 ? '+' : ''}${rakeback.totalNetUSD.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Pilar 3: Consistencia & Varianza */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-sans text-zinc-400">
              <span>Disciplina &amp; Rachas</span>
              <span className="text-[11px] font-mono text-zinc-400">
                {consistency.avgTiltScore}/10 Foco
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] font-sans">
              <div>
                <span className="text-zinc-500 block text-[10px]">Promedio Sesión</span>
                <span className="font-mono font-bold text-zinc-200">
                  {consistency.avgHandsPerSession.toLocaleString()} m/ses
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Racha Negativa</span>
                <span
                  className={`font-mono font-bold ${
                    consistency.negativeStreakDays >= 2 ? 'text-[#fb7185]' : 'text-zinc-200'
                  }`}
                >
                  {consistency.negativeStreakDays >= 2 ? `${consistency.negativeStreakDays} días` : '0 días'}
                </span>
              </div>
            </div>

            <p className="text-[12px] text-zinc-400 font-sans leading-relaxed">
              {consistency.message}
            </p>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500 font-sans">
            <span>Volumen Semanal:</span>
            <span className="font-mono text-zinc-400">
              ~{consistency.estimatedWeeklyHands.toLocaleString()} manos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
