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
      <div className="p-5 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] font-mono text-[12px] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </div>
          <div>
            <h4 className="font-sans text-[14px] font-bold text-[#f8fafc]">
              Coach Cuantitativo en Espera
            </h4>
            <p className="text-[11px] text-[#64748b]">
              Registra tus sesiones para activar el análisis automático de fatiga mental, apalancamiento de rakeback y consistencia.
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#050507] text-[#64748b] text-[10px] font-bold">
          0 SESIONES
        </span>
      </div>
    );
  }

  const { fatigue, rakeback, consistency } = report;

  return (
    <div className="flex flex-col gap-3 font-mono text-[12px]">
      {/* Header del Coach */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">psychology</span>
          <h3 className="font-sans text-[16px] font-bold text-[#f8fafc] tracking-tight">
            Diagnóstico Cuantitativo &amp; Fatiga Operativa
          </h3>
          <span className="px-1.5 py-0.2 rounded bg-[#064e3b]/30 text-[#10b981] font-bold text-[9.5px]">
            AI HEURISTICS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#64748b]">Salud Operativa:</span>
          <span
            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
              consistency.status === 'optimo'
                ? 'bg-[#064e3b] text-[#6ffbbe]'
                : consistency.status === 'moderado'
                ? 'bg-[#78350f] text-[#f59e0b]'
                : 'bg-[#7f1d1d] text-[#ef4444]'
            }`}
          >
            {consistency.healthScore}/100 • {consistency.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Grid de 3 Pilares Diagnósticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Pilar 1: Fatiga & Drop de Rendimiento */}
        <div className="p-4 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold">
                1. Fatiga &amp; Duración
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  fatigue.hasFatigueDrop ? 'bg-[#ef4444] animate-ping' : 'bg-[#10b981]'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 p-2 rounded bg-[#050507] border border-[rgba(255,255,255,0.04)] my-1">
              <div>
                <span className="text-[9px] text-[#64748b] block">&lt; 90 min ({fatigue.shortSessionCount})</span>
                <span className={`text-[13px] font-bold tabular-nums ${fatigue.shortWinrateBB100 >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {fatigue.shortWinrateBB100 >= 0 ? '+' : ''}{fatigue.shortWinrateBB100} bb
                </span>
              </div>
              <div>
                <span className="text-[9px] text-[#64748b] block">≥ 90 min ({fatigue.longSessionCount})</span>
                <span className={`text-[13px] font-bold tabular-nums ${fatigue.longWinrateBB100 >= 0 ? 'text-[#38bdf8]' : 'text-[#ef4444]'}`}>
                  {fatigue.longWinrateBB100 >= 0 ? '+' : ''}{fatigue.longWinrateBB100} bb
                </span>
              </div>
            </div>

            <p className="font-sans text-[11px] text-[#dae2fd] leading-relaxed">
              {fatigue.recommendation}
            </p>
          </div>

          <div className="pt-2 mt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[10px] text-[#64748b]">
            <span>Delta Winrate:</span>
            <span
              className={`font-bold tabular-nums ${
                fatigue.winrateDeltaBB100 > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'
              }`}
            >
              {fatigue.winrateDeltaBB100 > 0 ? `-${fatigue.winrateDeltaBB100} bb/100` : `+${Math.abs(fatigue.winrateDeltaBB100)} bb/100`}
            </span>
          </div>
        </div>

        {/* Pilar 2: Rakeback Leverage (Fish Buffet) */}
        <div className="p-4 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold">
                2. Apalancamiento Fish Buffet
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[#ffb95f]/15 text-[#ffb95f] text-[9px] font-bold">
                {rakeback.rakebackSharePct}% RB
              </span>
            </div>

            <div className="flex flex-col gap-1 my-1">
              <div className="flex items-baseline justify-between">
                <span className="font-sans text-[13px] font-bold text-[#f8fafc]">
                  {rakeback.title}
                </span>
              </div>
              <div className="w-full bg-[#050507] h-2 rounded-full overflow-hidden flex border border-[rgba(255,255,255,0.05)]">
                <div
                  className="bg-[#10b981] h-full transition-all"
                  style={{ width: `${Math.max(0, 100 - rakeback.rakebackSharePct)}%` }}
                  title="Ganancia en Mesa"
                />
                <div
                  className="bg-[#ffb95f] h-full transition-all"
                  style={{ width: `${rakeback.rakebackSharePct}%` }}
                  title="Rakeback Fish Buffet"
                />
              </div>
              <div className="flex justify-between text-[9px] text-[#64748b]">
                <span>Mesa: ${rakeback.totalDirectUSD.toFixed(2)}</span>
                <span className="text-[#ffb95f]">RB: +${rakeback.totalRakebackUSD.toFixed(2)}</span>
              </div>
            </div>

            <p className="font-sans text-[11px] text-[#dae2fd] leading-relaxed">
              {rakeback.description}
            </p>
          </div>

          <div className="pt-2 mt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[10px] text-[#64748b]">
            <span>Neto Consolidado:</span>
            <span
              className={`font-bold tabular-nums ${
                rakeback.totalNetUSD >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
              }`}
            >
              {rakeback.totalNetUSD >= 0 ? '+' : ''}${rakeback.totalNetUSD.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Pilar 3: Consistencia & Varianza */}
        <div className="p-4 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold">
                3. Consistencia &amp; Disciplina
              </span>
              <span className="text-[10px] text-[#38bdf8] font-bold">
                {consistency.avgTiltScore}/10 Tilt
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2 rounded bg-[#050507] border border-[rgba(255,255,255,0.04)] my-1">
              <div>
                <span className="text-[9px] text-[#64748b] block">Promedio Sesión</span>
                <span className="text-[13px] font-bold text-[#f8fafc] tabular-nums">
                  {consistency.avgHandsPerSession.toLocaleString()} m/ses
                </span>
              </div>
              <div>
                <span className="text-[9px] text-[#64748b] block">Racha Negativa</span>
                <span
                  className={`text-[13px] font-bold tabular-nums ${
                    consistency.negativeStreakDays >= 2 ? 'text-[#ef4444]' : 'text-[#10b981]'
                  }`}
                >
                  {consistency.negativeStreakDays >= 2 ? `${consistency.negativeStreakDays} días consec.` : '0 días (Normal)'}
                </span>
              </div>
            </div>

            <p className="font-sans text-[11px] text-[#dae2fd] leading-relaxed">
              {consistency.message}
            </p>
          </div>

          <div className="pt-2 mt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[10px] text-[#64748b]">
            <span>Volumen Semanal Estimado:</span>
            <span className="font-bold text-[#38bdf8] tabular-nums">
              ~{consistency.estimatedWeeklyHands.toLocaleString()} manos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
