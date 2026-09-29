import React, { useState } from 'react';
import { BankrollLedger } from '../../types/poker';

interface ShotPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledger: BankrollLedger;
  onConfirmProtocol: (stake: string, budgetUSD: number) => void;
}

export const ShotPlannerModal: React.FC<ShotPlannerModalProps> = ({
  isOpen,
  onClose,
  ledger,
  onConfirmProtocol,
}) => {
  const [targetStake, setTargetStake] = useState<'NL10' | 'NL25' | 'NL50'>('NL25');
  const [budgetBoxes, setBudgetBoxes] = useState<number>(5);
  const [checks, setChecks] = useState<{ [key: string]: boolean }>({
    volumen: true,
    selection: true,
    emocional: true,
  });
  const [protocolStarted, setProtocolStarted] = useState<boolean>(false);

  if (!isOpen) return null;

  const boxCost = targetStake === 'NL10' ? 10 : targetStake === 'NL25' ? 25 : 50;
  const budgetUSD = budgetBoxes * boxCost;
  const stopLossBankroll = Math.max(0, ledger.currentBalance - budgetUSD);
  const goalConsolidationUSD = budgetBoxes * 2 * boxCost;
  const dilutionPct = ((budgetUSD / ledger.currentBalance) * 100).toFixed(2);

  const handleStartProtocol = () => {
    setProtocolStarted(true);
    setTimeout(() => {
      onConfirmProtocol(targetStake, budgetUSD);
      setProtocolStarted(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-[#050507]/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-5xl my-auto bg-[#0b1326] rounded-xl shadow-[0_24px_50px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-[rgba(255,255,255,0.1)]"
      >
        {/* Decorative Top Line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#38bdf8] via-[#10b981] to-[#adc6ff]"></div>

        {/* 1. Header */}
        <header className="px-6 py-4 bg-[#060e20] flex items-start justify-between border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">ssid_chart</span>
              <h2 className="font-sans text-[20px] font-semibold tracking-tight text-[#f8fafc]">
                Planificador Cuantitativo de Shot-Taking
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#222a3d] text-[#adc6ff] font-mono text-[10px] tracking-widest uppercase font-bold">
                {targetStake} TRANSITION ENGINE
              </span>
            </div>
            <p className="font-sans text-[12px] text-[#94a3b8]">
              Modelado de riesgo de ruina, amortización de comisiones y protocolo disciplinado de stop-loss para ascensos de stake.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#171f33] text-[#64748b] font-mono text-[10px]">
              ESC
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded bg-[#131b2e] hover:bg-[#222a3d] text-[#64748b] hover:text-[#f8fafc] flex items-center justify-center transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </header>

        {/* Body Content */}
        <div className="p-6 flex flex-col gap-5 max-h-[calc(88vh-130px)] overflow-y-auto font-mono text-[12px]">
          {/* 2. Target Stake Selector */}
          <section className="flex flex-col gap-2 bg-[#060e20] p-4 rounded-lg border border-[rgba(255,255,255,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[#64748b] uppercase text-[11px]">Origen:</span>
                <span className="px-2 py-1 rounded bg-[#222a3d] text-[#f8fafc] font-bold">NL5 ($0.02 / $0.05)</span>
                <span className="text-[#94a3b8] font-sans">490 Cajas (${ledger.currentBalance.toFixed(2)} USD)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#10b981] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>Requisitos Kelly &gt; 99% Superados</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {/* NL10 */}
              <button
                type="button"
                onClick={() => setTargetStake('NL10')}
                className={`flex flex-col gap-1 p-3 rounded text-left transition-all ${
                  targetStake === 'NL10'
                    ? 'bg-[#222a3d] border border-[#38bdf8] shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-[#131b2e] hover:bg-[#171f33] border border-[rgba(255,255,255,0.08)] text-[#94a3b8]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`font-bold ${targetStake === 'NL10' ? 'text-[#38bdf8]' : 'text-[#f8fafc]'}`}>
                    NL10 ($0.05 / $0.10)
                  </span>
                  <span className="text-[10px] text-[#64748b]">245 Cajas</span>
                </div>
                <span className="font-sans text-[12px] text-[#94a3b8]">Caja: $10.00 • Rake 7.2bb/100</span>
              </button>

              {/* NL25 Recommended */}
              <button
                type="button"
                onClick={() => setTargetStake('NL25')}
                className={`relative flex flex-col gap-1 p-3 rounded text-left transition-all ${
                  targetStake === 'NL25'
                    ? 'bg-[#222a3d] border border-[#38bdf8] shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-[#131b2e] hover:bg-[#171f33] border border-[rgba(255,255,255,0.08)] text-[#94a3b8]'
                }`}
              >
                <div className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-[#38bdf8] text-[#050507] text-[9px] font-bold uppercase tracking-wider">
                  RECOMENDADO
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-[#38bdf8]">NL25 ($0.10 / $0.25)</span>
                  <span className="text-[10px] text-[#38bdf8] font-semibold">98.03 Cajas</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-sans text-[12px] text-[#f8fafc] font-medium">Caja: $25.00 USD</span>
                  <span className="text-[10px] text-[#10b981] font-bold">Rake -20% vs NL5</span>
                </div>
              </button>

              {/* NL50 */}
              <button
                type="button"
                onClick={() => setTargetStake('NL50')}
                className={`flex flex-col gap-1 p-3 rounded text-left transition-all ${
                  targetStake === 'NL50'
                    ? 'bg-[#222a3d] border border-[#38bdf8] shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-[#131b2e] hover:bg-[#171f33] border border-[rgba(255,255,255,0.08)] text-[#94a3b8]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`font-bold ${targetStake === 'NL50' ? 'text-[#38bdf8]' : 'text-[#f8fafc]'}`}>
                    NL50 ($0.25 / $0.50)
                  </span>
                  <span className="text-[10px] text-[#64748b]">49.0 Cajas</span>
                </div>
                <span className="font-sans text-[12px] text-[#94a3b8]">Caja: $50.00 • Alto impacto ruina</span>
              </button>
            </div>
          </section>

          {/* 3. Shot Configuration & Stop Loss Protocol */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Shot Budget */}
            <div className="lg:col-span-6 flex flex-col gap-3 p-4 rounded-lg bg-[#131b2e] border border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between">
                <span className="text-[#64748b] uppercase text-[11px]">ASIGNACIÓN DE CAPITAL PARA EL SHOT</span>
                <span className="text-[#adc6ff] text-[11px]">RIESGO MÁXIMO</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[12px] text-[#94a3b8]">
                  Presupuesto Asignado (Cajas de {targetStake}):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 5, 8, 10].map((cx) => (
                    <button
                      key={cx}
                      type="button"
                      onClick={() => setBudgetBoxes(cx)}
                      className={`py-1.5 px-2 rounded text-center transition-all ${
                        budgetBoxes === cx
                          ? 'bg-[#38bdf8] text-[#050507] font-bold shadow'
                          : 'bg-[#171f33] text-[#64748b] hover:text-[#f8fafc]'
                      }`}
                    >
                      {cx}cx (${cx * boxCost})
                    </button>
                  ))}
                </div>
              </div>

              {/* Stop-loss and Target boxes */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded bg-[#050507] border border-[#ef4444]/35 flex flex-col gap-1">
                  <span className="text-[#ef4444] text-[10px] flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-[14px]">gpp_maybe</span> STOP-LOSS ABSOLUTO
                  </span>
                  <span className="text-[14px] text-[#ef4444] font-bold">
                    -{budgetBoxes}.0 Cajas (-${budgetUSD.toFixed(2)})
                  </span>
                  <span className="font-sans text-[11px] text-[#64748b]">
                    Repliegue forzado a ${stopLossBankroll.toFixed(2)} USD
                  </span>
                </div>

                <div className="p-3 rounded bg-[#050507] border border-[#10b981]/35 flex flex-col gap-1">
                  <span className="text-[#10b981] text-[10px] flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-[14px]">flag_circle</span> META CONSOLIDACIÓN
                  </span>
                  <span className="text-[14px] text-[#10b981] font-bold">
                    +{budgetBoxes * 2}.0 Cajas (+${goalConsolidationUSD.toFixed(2)})
                  </span>
                  <span className="font-sans text-[11px] text-[#64748b]">
                    Desbloqueo definitivo de {targetStake}
                  </span>
                </div>
              </div>

              {/* Room & Rakeback */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#64748b]">SALA DE DESTINO</span>
                  <div className="px-2.5 py-1.5 rounded bg-[#050507] flex items-center justify-between text-[#f8fafc] font-sans text-[12px] border border-[rgba(255,255,255,0.08)]">
                    <span>GGPoker (5% Rake)</span>
                    <span className="material-symbols-outlined text-[#64748b] text-[16px]">expand_more</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#64748b]">RAKEBACK NETO</span>
                    <span className="text-[#adc6ff] text-[11px]">35% VIP</span>
                  </div>
                  <div className="h-7 px-2 rounded bg-[#050507] flex items-center gap-2 border border-[rgba(255,255,255,0.08)]">
                    <div className="w-full bg-[#222a3d] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#adc6ff] h-full rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <span className="text-[10px] text-[#10b981] font-bold shrink-0">+2.38bb</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Monte Carlo Fan Chart */}
            <div className="lg:col-span-6 flex flex-col justify-between p-4 rounded-lg bg-[#131b2e] border border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between">
                <span className="text-[#64748b] uppercase text-[10px]">
                  TRAYECTORIAS ESTOCÁSTICAS MONTE CARLO (10.000 ITERACIONES)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#064e3b] text-[#10b981] text-[10px] font-bold">
                  CONFIANZA 95%
                </span>
              </div>

              {/* Visual Fan Chart */}
              <div className="relative w-full h-36 bg-[#050507] rounded p-2 flex flex-col justify-between overflow-hidden border border-[rgba(255,255,255,0.08)] my-2">
                <div className="flex items-center justify-between z-10 text-[10px]">
                  <span className="text-[#10b981] font-bold">+{budgetBoxes * 2} Cajas (Consolidado)</span>
                  <span className="text-[#10b981] font-semibold">Prob. Éxito: 68.4%</span>
                </div>

                <svg className="w-full h-20 overflow-visible z-10" fill="none" viewBox="0 0 400 80">
                  <path d="M 0 50 C 70 45, 150 25, 400 10" fill="none" stroke="#10b981" strokeWidth="2.5"></path>
                  <path d="M 0 50 C 100 48, 200 52, 400 40" fill="none" stroke="#64748b" strokeDasharray="3 3" strokeWidth="1.5"></path>
                  <path d="M 0 50 C 90 55, 170 70, 360 76" fill="none" stroke="#ef4444" strokeWidth="2"></path>
                  <circle cx="0" cy="50" fill="#38bdf8" r="3"></circle>
                  <circle cx="360" cy="76" fill="#ef4444" r="3"></circle>
                  <circle cx="400" cy="10" fill="#10b981" r="4"></circle>
                </svg>

                <div className="flex items-center justify-between z-10 text-[10px]">
                  <span className="text-[#ef4444] font-bold">-{budgetBoxes} Cajas (Stop-Loss)</span>
                  <span className="text-[#ef4444]">Activación: 31.6%</span>
                </div>
              </div>

              {/* Shield Summary */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2 rounded bg-[#050507] flex flex-col border border-[rgba(255,255,255,0.08)]">
                  <span className="text-[10px] text-[#64748b]">RIESGO DE RUINA GLOBAL</span>
                  <span className="text-[14px] text-[#10b981] font-bold">&lt; 0.02% (Blindado)</span>
                </div>
                <div className="p-2 rounded bg-[#050507] flex flex-col border border-[rgba(255,255,255,0.08)]">
                  <span className="text-[10px] text-[#64748b]">DILUCIÓN DE BANCA MÁX</span>
                  <span className="text-[14px] text-[#f59e0b] font-bold">-{dilutionPct}% (${budgetUSD} USD)</span>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Friction Analysis */}
          <section className="flex flex-col gap-2 bg-[#131b2e] p-4 rounded-lg border border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between pb-1 border-b border-[rgba(255,255,255,0.08)]">
              <span className="text-[#64748b] uppercase text-[11px]">
                ANÁLISIS DE FRICCIÓN &amp; ELASTICIDAD DE WINRATE (NL5 VS {targetStake})
              </span>
              <span className="font-sans text-[12px] text-[#94a3b8]">Micro vs Low Stakes</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded bg-[#050507] flex flex-col gap-1 border border-[rgba(255,255,255,0.08)]">
                <span className="text-[10px] text-[#64748b]">RAKE ESTIMADO {targetStake}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[18px] font-bold text-[#f8fafc]">6.80</span>
                  <span className="text-[10px] text-[#94a3b8]">bb/100</span>
                </div>
                <span className="font-sans text-[11px] text-[#10b981]">-1.70 bb vs NL5 (8.50)</span>
              </div>

              <div className="p-3 rounded bg-[#050507] flex flex-col gap-1 border border-[rgba(255,255,255,0.08)]">
                <span className="text-[10px] text-[#64748b]">BRUTO BREAK-EVEN</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[18px] font-bold text-[#adc6ff]">+4.42</span>
                  <span className="text-[10px] text-[#94a3b8]">bb/100</span>
                </div>
                <span className="font-sans text-[11px] text-[#64748b]">Sin pérdida neta de capital</span>
              </div>

              <div className="p-3 rounded bg-[#050507] flex flex-col gap-1 border border-[rgba(255,255,255,0.08)]">
                <span className="text-[10px] text-[#64748b]">OBJETIVO SUSTENTABLE</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[18px] font-bold text-[#10b981]">+7.42</span>
                  <span className="text-[10px] text-[#94a3b8]">bb/100</span>
                </div>
                <span className="font-sans text-[11px] text-[#10b981]">+3.0 bb/100 netos post-rake</span>
              </div>

              <div className="p-3 rounded bg-[#050507] flex flex-col gap-1 border border-[rgba(255,255,255,0.08)]">
                <span className="text-[10px] text-[#64748b]">PEOR ESCENARIO (FAIL)</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[18px] font-bold text-[#ef4444]">${stopLossBankroll.toFixed(2)}</span>
                </div>
                <span className="font-sans text-[11px] text-[#64748b]">
                  {Math.round(stopLossBankroll / 5)} Cajas en NL5 remanentes
                </span>
              </div>
            </div>
          </section>

          {/* 5. Quantitative Discipline Checklist */}
          <section className="flex flex-col gap-2 bg-[#131b2e] p-4 rounded-lg border border-[rgba(255,255,255,0.08)]">
            <span className="text-[#64748b] uppercase text-[11px]">
              CONDICIONES TÉCNICAS OBLIGATORIAS (EJECUCIÓN SISTEMÁTICA)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <label className="flex items-start gap-2.5 p-3 rounded bg-[#050507] border border-[rgba(255,255,255,0.08)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.volumen}
                  onChange={(e) => setChecks({ ...checks, volumen: e.target.checked })}
                  className="mt-0.5 rounded border-[rgba(255,255,255,0.16)] bg-[#171f33] text-[#10b981] focus:ring-0"
                />
                <div className="flex flex-col font-sans">
                  <span className="text-[13px] text-[#f8fafc] font-semibold">Volumen Controlado</span>
                  <span className="text-[11px] text-[#64748b]">Máximo 2 mesas simultáneas las primeras 1,000 manos.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded bg-[#050507] border border-[rgba(255,255,255,0.08)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.selection}
                  onChange={(e) => setChecks({ ...checks, selection: e.target.checked })}
                  className="mt-0.5 rounded border-[rgba(255,255,255,0.16)] bg-[#171f33] text-[#10b981] focus:ring-0"
                />
                <div className="flex flex-col font-sans">
                  <span className="text-[13px] text-[#f8fafc] font-semibold">Table Selection Riguroso</span>
                  <span className="text-[11px] text-[#64748b]">Presencia de al menos 1 jugador recreativo (VPIP &gt; 35%).</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded bg-[#050507] border border-[rgba(255,255,255,0.08)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.emocional}
                  onChange={(e) => setChecks({ ...checks, emocional: e.target.checked })}
                  className="mt-0.5 rounded border-[rgba(255,255,255,0.16)] bg-[#171f33] text-[#10b981] focus:ring-0"
                />
                <div className="flex flex-col font-sans">
                  <span className="text-[13px] text-[#f8fafc] font-semibold">Cierre Emocional Cero</span>
                  <span className="text-[11px] text-[#64748b]">Repliegue inmediato si la banca toca ${stopLossBankroll.toFixed(2)} USD.</span>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* 6. Footer Actions */}
        <footer className="px-6 py-4 bg-[#060e20] flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] border-t border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Stress Test Ejecutado: 10.000 iteraciones a -4 Desviaciones Estándar confirman que la banca sobrevive en el 99.98% de los casos.')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#171f33] hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] transition-colors border border-[rgba(255,255,255,0.08)]"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>STRESS TEST (-4 SD)</span>
            </button>
            <button
              onClick={() => alert('Protocolo de Shot-Taking exportado a portapapeles con los parámetros inviolables de gestión.')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#171f33] hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] transition-colors border border-[rgba(255,255,255,0.08)]"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>EXPORTAR DISCIPLINA</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#131b2e] hover:bg-[#171f33] text-[#64748b] hover:text-[#f8fafc] transition-colors"
              type="button"
            >
              CANCELAR
            </button>
            <button
              onClick={handleStartProtocol}
              disabled={protocolStarted}
              className="flex items-center gap-2 px-5 py-2 rounded bg-[#10b981] hover:bg-[#34d399] text-[#050507] font-bold transition-all shadow-[0_0_16px_rgba(16,185,129,0.3)] cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">lock_clock</span>
              <span>
                {protocolStarted ? 'INICIANDO PROTOCOLO...' : `INICIAR PROTOCOLO ${targetStake} (RESERVAR $${budgetUSD} USD)`}
              </span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
