import React, { useState } from 'react';
import { BankrollLedger } from '../../types/poker';

interface BancaRiesgoViewProps {
  ledger: BankrollLedger;
  boxSize?: number;
  onOpenTransactionModal: (type: 'deposit' | 'withdraw' | 'adjustment') => void;
  onOpenShotPlanner: () => void;
}

export const BancaRiesgoView: React.FC<BancaRiesgoViewProps> = ({
  ledger,
  boxSize = 5.0,
  onOpenTransactionModal,
  onOpenShotPlanner,
}) => {
  const [stakeScenario, setStakeScenario] = useState<'NL5' | 'NL10'>('NL5');
  const [simulatedBoxes, setSimulatedBoxes] = useState<number>(20);

  // Calculations for Downswing Simulator
  const boxCost = stakeScenario === 'NL5' ? 10 : 20; // 200bb cost
  const totalSimulatedLoss = simulatedBoxes * boxCost;
  const resultantBankroll = Math.max(0, ledger.currentBalance - totalSimulatedLoss);
  const postCoverage = (resultantBankroll / boxCost).toFixed(1);
  const postCoverageNum = parseFloat(postCoverage);

  let riskBadgeText = 'Mínimo / Seguro';
  let riskBadgeColor = 'bg-[#064e3b] text-[#6ffbbe]';

  if (stakeScenario === 'NL5') {
    if (postCoverageNum > 180) {
      riskBadgeText = 'Mínimo / Seguro';
      riskBadgeColor = 'bg-[#064e3b] text-[#6ffbbe]';
    } else if (postCoverageNum > 120) {
      riskBadgeText = 'Moderado';
      riskBadgeColor = 'bg-[#78350f] text-[#f59e0b]';
    } else {
      riskBadgeText = 'Riesgo Alto';
      riskBadgeColor = 'bg-[#7f1d1d] text-[#ef4444]';
    }
  } else {
    if (postCoverageNum >= 100) {
      riskBadgeText = 'Umbral Stop-Loss Shot';
      riskBadgeColor = 'bg-[#78350f] text-[#f59e0b]';
    } else {
      riskBadgeText = 'Alerta: Bajar de Stake';
      riskBadgeColor = 'bg-[#7f1d1d] text-[#ef4444]';
    }
  }

  // Active stake coverage (uses 200bb = boxSize * 2 per buy-in)
  const activeBoxLabel =
    boxSize <= 5 ? 'NL5 Deep' :
    boxSize <= 10 ? 'NL10 Deep' :
    boxSize <= 25 ? 'NL25 Deep' : 'NL50 Deep';
  const activeBoxCost200bb = boxSize * 2; // 200bb deep
  const activeCoverage = (ledger.currentBalance / activeBoxCost200bb).toFixed(1);

  // Coverages comparison grid (always shown for reference)
  const nl5Boxes = (ledger.currentBalance / 10).toFixed(2);
  const nl10Boxes = (ledger.currentBalance / 20).toFixed(1);
  const nl25Boxes = (ledger.currentBalance / 50).toFixed(1);

  // Milestone $3,000
  const missingTo3k = Math.max(0, 3000 - ledger.currentBalance);
  const pctTo3k = Math.min(100, (ledger.currentBalance / 3000) * 100).toFixed(1);
  const boxesMissingNL5 = (missingTo3k / 10).toFixed(1);

  // Stop loss $1,800
  const safetyMarginUSD = Math.max(0, ledger.currentBalance - 1800);
  const safetyMarginBoxes = Math.round(safetyMarginUSD / 10);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Banner Notice */}
      <div className="flex items-center justify-between bg-[#131b2e] px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span className="font-mono text-[11px] text-[#94a3b8] uppercase">
            Gestión de Riesgo • Capital Live Auditado
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShotPlanner}
            className="px-2.5 py-1 rounded bg-[#050507] hover:bg-[#1e293b] border border-[#38bdf8]/30 text-[#38bdf8] font-mono text-[11px] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
            <span>Planificador de Shot-Taking</span>
          </button>
          <span className="px-2 py-0.5 rounded bg-[#78350f]/40 text-[#f59e0b] font-mono text-[10px] uppercase tracking-wider">
            Ledger Conciliado
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Hero Financial Balance Card (6 cols) */}
        <section className="lg:col-span-6 flex flex-col bg-[#0f172a] rounded-xl border border-[rgba(255,255,255,0.08)] p-5 shadow-md relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#4edea3]/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#64748b] uppercase tracking-wider">
                Capital Total Consolidado
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#064e3b] text-[#6ffbbe] uppercase font-bold">
                AUDITADO
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-[32px] text-[#f8fafc] font-bold tracking-tight">
                ${ledger.currentBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="font-mono text-[12px] text-[#94a3b8]">USD</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="material-symbols-outlined text-[#10b981] text-[16px]">trending_up</span>
              <span className="font-mono text-[12px] text-[#10b981] font-semibold">
                +$710,50 netos
              </span>
              <span className="font-sans text-[12px] text-[#64748b]">vs saldo inicial ($1,740.30)</span>
            </div>
          </div>

          {/* Capital Breakdown Ledger */}
          <div className="grid grid-cols-2 gap-2 bg-[#050507]/80 p-3 rounded-lg mt-4 font-mono">
            <div className="flex flex-col bg-[#131b2e]/60 p-2 rounded">
              <span className="text-[10px] text-[#64748b] uppercase">Saldo Inicial</span>
              <span className="text-[13px] text-[#f8fafc] font-semibold">${ledger.initialBalance.toFixed(2)}</span>
            </div>
            <div className="flex flex-col bg-[#131b2e]/60 p-2 rounded">
              <span className="text-[10px] text-[#10b981] uppercase font-bold">Ganancias Póker</span>
              <span className="text-[13px] text-[#10b981] font-semibold">+${ledger.pokerProfit.toFixed(2)}</span>
            </div>
            <div className="flex flex-col bg-[#131b2e]/60 p-2 rounded">
              <span className="text-[10px] text-[#64748b] uppercase">Depósitos Totales</span>
              <span className="text-[13px] text-[#38bdf8] font-semibold">+${ledger.totalDeposits.toFixed(2)}</span>
            </div>
            <div className="flex flex-col bg-[#131b2e]/60 p-2 rounded">
              <span className="text-[10px] text-[#64748b] uppercase">Retiros Totales</span>
              <span className="text-[13px] text-[#ef4444] font-semibold">-${ledger.totalWithdrawals.toFixed(2)}</span>
            </div>
            <div className="flex flex-col bg-[#131b2e]/60 p-2 rounded">
              <span className="text-[10px] text-[#64748b] uppercase">Rakeback &amp; Bonos</span>
              <span className="text-[13px] text-[#ffb95f] font-semibold">+${ledger.rakebackBonuses.toFixed(2)}</span>
            </div>
            <div className="flex flex-col bg-[#131b2e]/60 p-2 rounded">
              <span className="text-[10px] text-[#64748b] uppercase">Ajustes Manuales</span>
              <span className="text-[13px] text-[#94a3b8] font-semibold">${ledger.manualAdjustments.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Shortcuts */}
          <div className="grid grid-cols-3 gap-2 pt-4">
            <button
              onClick={() => onOpenTransactionModal('deposit')}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#1e293b] hover:bg-[#334155] rounded text-[#f8fafc] font-mono text-[11px] font-semibold transition-colors shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] text-[#10b981]">arrow_downward</span>
              <span>Depósito</span>
            </button>
            <button
              onClick={() => onOpenTransactionModal('withdraw')}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#1e293b] hover:bg-[#334155] rounded text-[#f8fafc] font-mono text-[11px] font-semibold transition-colors shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ef4444]">arrow_upward</span>
              <span>Retiro</span>
            </button>
            <button
              onClick={() => onOpenTransactionModal('adjustment')}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#1e293b] hover:bg-[#334155] rounded text-[#f8fafc] font-mono text-[11px] font-semibold transition-colors shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ffb95f]">tune</span>
              <span>Ajuste/Bono</span>
            </button>
          </div>
        </section>

        {/* Level Coverage (Buy-ins per Stake) (6 cols) */}
        <section className="lg:col-span-6 flex flex-col justify-between bg-[#0f172a] rounded-xl border border-[rgba(255,255,255,0.08)] p-5 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.08)]">
            <div className="flex flex-col">
              <h3 className="font-sans text-[16px] font-bold text-[#f8fafc]">Cobertura de Cajas</h3>
              <span className="font-sans text-[12px] text-[#64748b]">Capacidad de absorción de varianza matemática</span>
            </div>
            <div className="px-2 py-1 rounded bg-[#064e3b]/30 text-[#10b981] font-mono text-[10px] font-bold uppercase">
              200 BB DEEP
            </div>
          </div>

          {/* Active Stake Focus */}
          <div className="bg-[#050507] p-3 rounded-lg flex flex-col gap-2 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#171f33] font-mono text-[11px] text-[#10b981] font-bold">
                  {activeBoxLabel}
                </span>
                <span className="font-sans text-[12px] text-[#94a3b8]">Caja: ${activeBoxCost200bb.toFixed(2)} USD (200 bb)</span>
              </div>
              <span className="font-mono text-[10px] text-[#10b981] uppercase tracking-wider font-bold">
                Nivel Activo
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-[24px] text-[#10b981] font-bold">
                {activeCoverage} <span className="text-[12px] font-normal text-[#94a3b8]">cajas</span>
              </span>
              <span className="font-mono text-[11px] text-[#64748b]">Recomendado: &gt;150</span>
            </div>

            <div className="w-full bg-[#222a3d] h-2 rounded-full overflow-hidden">
              <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${Math.min(100, (parseFloat(activeCoverage) / 150) * 100).toFixed(0)}%` }}></div>
            </div>
            <p className="font-sans text-[12px] text-[#64748b] pt-0.5">
              Gestión ultraconservadora. Protección alta contra rachas atípicas de varianza deepstack.
            </p>
          </div>

          {/* Other Stakes Benchmarks */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-[#050507] p-3 rounded-lg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="px-1.5 py-0.5 rounded bg-[#171f33] font-mono text-[11px] text-[#38bdf8] font-bold">
                  NL10 Deep
                </span>
                <span className="font-mono text-[10px] text-[#64748b]">$20/caja</span>
              </div>
              <div className="flex flex-col mt-2">
                <span className="font-mono text-[16px] text-[#f8fafc] font-bold">
                  {nl10Boxes} <span className="text-[11px] font-normal text-[#64748b]">cajas</span>
                </span>
                <div className="w-full bg-[#222a3d] h-1.5 rounded-full overflow-hidden mt-1 mb-1">
                  <div className="bg-[#38bdf8] h-full rounded-full" style={{ width: '81%' }}></div>
                </div>
                <span className="font-mono text-[10px] text-[#10b981] font-semibold">Apto p/ Shot (100+)</span>
              </div>
            </div>

            <div className="bg-[#050507] p-3 rounded-lg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="px-1.5 py-0.5 rounded bg-[#171f33] font-mono text-[11px] text-[#ffb95f] font-bold">
                  NL25 Deep
                </span>
                <span className="font-mono text-[10px] text-[#64748b]">$50/caja</span>
              </div>
              <div className="flex flex-col mt-2">
                <span className="font-mono text-[16px] text-[#f8fafc] font-bold">
                  {nl25Boxes} <span className="text-[11px] font-normal text-[#64748b]">cajas</span>
                </span>
                <div className="w-full bg-[#222a3d] h-1.5 rounded-full overflow-hidden mt-1 mb-1">
                  <div className="bg-[#f59e0b] h-full rounded-full" style={{ width: '32%' }}></div>
                </div>
                <span className="font-mono text-[10px] text-[#f59e0b] font-semibold">Bajo límite seguridad</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Interactive Variance Simulator & Downswing Planner (7 cols) */}
        <section className="lg:col-span-7 flex flex-col bg-[#0f172a] rounded-xl border border-[rgba(255,255,255,0.08)] p-5 shadow-md">
          <div className="flex items-center gap-2 pb-3 border-b border-[rgba(255,255,255,0.08)]">
            <div className="w-7 h-7 rounded bg-[#0566d9]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#adc6ff] text-[18px]">calculate</span>
            </div>
            <div>
              <h3 className="font-sans text-[16px] font-bold text-[#f8fafc]">Simulador de Downswing</h3>
              <p className="font-sans text-[12px] text-[#64748b]">Proyección matemática de estrés en capital</p>
            </div>
          </div>

          {/* Preset Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-[#050507] p-1 rounded-lg mt-3">
            <button
              onClick={() => { setStakeScenario('NL5'); setSimulatedBoxes(20); }}
              className={`py-1.5 text-center font-mono text-[11px] rounded transition-all ${
                stakeScenario === 'NL5'
                  ? 'bg-[#1e293b] text-[#f8fafc] font-bold shadow-sm'
                  : 'text-[#64748b] hover:text-[#f8fafc]'
              }`}
              type="button"
            >
              Escenario 1: NL5
            </button>
            <button
              onClick={() => { setStakeScenario('NL10'); setSimulatedBoxes(15); }}
              className={`py-1.5 text-center font-mono text-[11px] rounded transition-all ${
                stakeScenario === 'NL10'
                  ? 'bg-[#1e293b] text-[#f8fafc] font-bold shadow-sm'
                  : 'text-[#64748b] hover:text-[#f8fafc]'
              }`}
              type="button"
            >
              Escenario 2: Shot NL10
            </button>
          </div>

          {/* Dynamic Simulation Panel */}
          <div className="bg-[#050507] p-4 rounded-lg space-y-3 mt-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-mono text-[11px] text-[#94a3b8] uppercase">
                  Pérdida simulada de cajas:
                </label>
                <span className="font-mono text-[13px] text-[#ef4444] font-bold">
                  -{simulatedBoxes} cajas (-${totalSimulatedLoss.toFixed(2)})
                </span>
              </div>
              <input
                className="w-full accent-[#ef4444] bg-[#222a3d] h-2 rounded-lg cursor-pointer"
                max="40"
                min="5"
                step="5"
                type="range"
                value={simulatedBoxes}
                onChange={(e) => setSimulatedBoxes(parseInt(e.target.value, 10))}
              />
              <div className="flex justify-between text-[#64748b] font-mono text-[10px]">
                <span>-5 cajas</span>
                <span>-20 cajas</span>
                <span>-40 cajas</span>
              </div>
            </div>

            {/* Live Outputs */}
            <div className="bg-[#131b2e] p-3 rounded-lg space-y-2 font-mono text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Banca Resultante:</span>
                <span className="text-[#f8fafc] font-bold">
                  ${resultantBankroll.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Cobertura Posterior:</span>
                <span className="text-[#10b981] font-bold">{postCoverage} cajas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Nivel de Riesgo:</span>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold ${riskBadgeColor}`}>
                  {riskBadgeText}
                </span>
              </div>
            </div>

            {/* Narrative */}
            <div className="p-2.5 rounded bg-[#1e293b]/40 text-[#94a3b8] font-sans text-[12px] leading-relaxed">
              {stakeScenario === 'NL5' ? (
                <>
                  Si pierdes <strong className="text-[#f8fafc]">{simulatedBoxes} cajas</strong> en NL5 (-${totalSimulatedLoss}):
                  Tu banca queda en <strong className="text-[#f8fafc]">${resultantBankroll.toFixed(2)}</strong> ({postCoverage} cajas de cobertura).
                  El capital se mantiene {postCoverageNum > 150 ? 'holgadamente por encima' : 'en zona de precaución respecto'} al umbral de contingencia.
                </>
              ) : (
                <>
                  Si subes a NL10 ($20/caja) y tienes un downswing de <strong className="text-[#f8fafc]">{simulatedBoxes} cajas</strong> (-${totalSimulatedLoss}):
                  Tu banca queda en <strong className="text-[#f8fafc]">${resultantBankroll.toFixed(2)}</strong> ({postCoverage} cajas).{' '}
                  {postCoverageNum < 100
                    ? 'Se activa la orden estricta de volver de inmediato a NL5 para proteger el capital.'
                    : 'Dentro de los parámetros de absorción planificados para el shot.'}
                </>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 bg-[#060e20] p-3 rounded-lg mt-3">
            <span className="material-symbols-outlined text-[#64748b] text-[16px] shrink-0 mt-0.5">info</span>
            <p className="font-sans text-[11px] text-[#64748b] leading-tight">
              Herramienta de planificación matemática, no constituye una recomendación automática ni predicción de resultados.
            </p>
          </div>
        </section>

        {/* Milestones & Stop-Loss Alarms (5 cols) */}
        <section className="lg:col-span-5 flex flex-col justify-between bg-[#0f172a] rounded-xl border border-[rgba(255,255,255,0.08)] p-5 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#e29100]/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ffb95f] text-[18px]">flag</span>
              </div>
              <h3 className="font-sans text-[16px] font-bold text-[#f8fafc]">Metas &amp; Límites</h3>
            </div>
            <button
              onClick={onOpenShotPlanner}
              className="font-mono text-[11px] text-[#38bdf8] hover:underline"
            >
              Configurar Shot
            </button>
          </div>

          {/* Target Milestone */}
          <div className="bg-[#050507] p-3.5 rounded-lg space-y-2 mt-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#ffb95f] uppercase font-bold">Meta de Ascenso</span>
              <span className="text-[10px] text-[#64748b]">NL5 → NL10 Deep</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-[#f8fafc] font-medium font-sans">Llegar a $3.000,00 USD</span>
              <span className="text-[12px] text-[#94a3b8] font-bold">{pctTo3k}% completado</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[#222a3d] h-2 rounded-full overflow-hidden">
              <div className="bg-[#ffb95f] h-full rounded-full" style={{ width: `${pctTo3k}%` }}></div>
            </div>
            <div className="flex justify-between items-center pt-0.5 text-[11px]">
              <span className="text-[#64748b]">Faltan ${missingTo3k.toFixed(2)} USD</span>
              <span className="text-[#ffb95f] font-bold">{boxesMissingNL5} cajas NL5</span>
            </div>
          </div>

          {/* Stop-Loss Rule Alert */}
          <div className="bg-[#050507] p-3.5 rounded-lg space-y-2 mt-3 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ef4444] text-[16px]">shield</span>
                <span className="text-[11px] text-[#ef4444] uppercase font-bold">Alerta Stop-Loss Activa</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#064e3b] text-[#6ffbbe] text-[10px] uppercase font-bold">
                Estado: Seguro
              </span>
            </div>
            <p className="font-sans text-[12px] text-[#94a3b8]">
              Si la banca desciende de <strong className="text-[#f8fafc]">$1.800,00 USD</strong>, descender de forma mandatoria a NL2.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-[rgba(255,255,255,0.08)]">
              <span className="text-[11px] text-[#64748b]">Margen de Seguridad:</span>
              <span className="text-[13px] text-[#10b981] font-bold">
                +${safetyMarginUSD.toFixed(2)} USD ({safetyMarginBoxes} cajas)
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
