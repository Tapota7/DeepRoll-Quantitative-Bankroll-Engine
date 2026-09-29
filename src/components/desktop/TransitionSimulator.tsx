import React, { useState } from 'react';

export const TransitionSimulator: React.FC = () => {
  const [operator, setOperator] = useState<'gg' | 'ps' | 'wmx'>('gg');
  const [rakebackPercent, setRakebackPercent] = useState<number>(35);
  const [rakePaidBB, setRakePaidBB] = useState<number>(8.5);
  const [playerStyle, setPlayerStyle] = useState<'tight' | 'tag' | 'lag'>('tag');

  // Dynamic calculations
  const rbAmortizationBB = (rakePaidBB * (rakebackPercent / 100));
  const breakEvenGrossBB = rakePaidBB - rbAmortizationBB;
  const targetRentableBB = breakEvenGrossBB + 3.0; // 3bb net target
  const rakeCostPer100 = (rakePaidBB * 0.10).toFixed(2);
  const rbReturnPer100 = (rbAmortizationBB * 0.10).toFixed(2);
  const targetProfitPer100 = (3.0 * 0.10).toFixed(2);

  return (
    <div className="flex flex-col bg-[#131b2e] rounded-xl border border-[rgba(255,255,255,0.08)] p-5 shadow-sm relative overflow-hidden">
      <div className="flex flex-col gap-3 pb-3 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#050507] border border-[#f59e0b]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[19px] text-[#f59e0b]">compare_arrows</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-bold text-[#f8fafc] tracking-tight font-sans">
                  Simulador de Transición y Break-Even NL10
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#050507] text-[#f59e0b] font-mono text-[10px] font-bold border border-[#f59e0b]/20">
                  SHOT-TAKING &amp; ESTRUCTURA DE RAKE
                </span>
              </div>
              <p className="text-[11px] text-[#64748b] font-mono mt-0.5">
                Cálculo del winrate mínimo post-rake y rakeback efectivo requerido para amortizar el ascenso de stake (NL5 $0.05bb → NL10 $0.10bb)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#050507] border border-[#10b981]/30 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="text-[#64748b]">Shot Status:</span>
            <span className="text-[#10b981] font-bold">ÓPTIMO (&gt;245 cx NL10)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Left Form Controls */}
        <div className="lg:col-span-4 flex flex-col gap-3 bg-[#050507] p-4 rounded-xl border border-[rgba(255,255,255,0.08)] font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.08)]">
            <span className="text-[11px] font-bold text-[#f8fafc] uppercase tracking-wider">
              Supuestos &amp; Parámetros
            </span>
            <span className="material-symbols-outlined text-[15px] text-[#64748b]">tune</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#64748b] uppercase">Operador / Estructura Rake NL10</label>
            <div className="p-2.5 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                <span className="text-[#f8fafc] font-bold text-[12px]">GGPoker</span>
                <span className="text-[9px] text-[#64748b] font-mono">(5% cap 3bb)</span>
              </div>
              <span className="text-[10px] text-[#10b981] bg-[#064e3b]/30 px-2 py-0.5 rounded font-mono font-semibold">
                SALA ACTIVA
              </span>
            </div>
          </div>

          {/* Rakeback Slider */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#64748b] text-[10px] uppercase">Rakeback Efectivo:</span>
              <span className="text-[#10b981] font-bold tabular-nums">{rakebackPercent}%</span>
            </div>
            <input
              className="w-full accent-[#10b981] bg-[#171f33] rounded-lg h-1.5 cursor-pointer"
              max="65"
              min="0"
              type="range"
              value={rakebackPercent}
              onChange={(e) => setRakebackPercent(Number(e.target.value))}
            />
            <div className="flex justify-between text-[9px] text-[#64748b]">
              <span>0% (Sin RB)</span>
              <span>35% (Hero actual)</span>
              <span>65% (VIP Max)</span>
            </div>
          </div>

          {/* Rake Paid in NL10 Slider */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#64748b] text-[10px] uppercase">Rake Pagado en NL10:</span>
              <span className="text-[#ef4444] font-bold tabular-nums">{rakePaidBB.toFixed(2)} bb/100</span>
            </div>
            <input
              className="w-full accent-[#ef4444] bg-[#171f33] rounded-lg h-1.5 cursor-pointer"
              max="12"
              min="6"
              step="0.25"
              type="range"
              value={rakePaidBB}
              onChange={(e) => setRakePaidBB(Number(e.target.value))}
            />
            <div className="flex justify-between text-[9px] text-[#64748b]">
              <span>6.0 bb (Tight)</span>
              <span>8.5 bb (Ponderado)</span>
              <span>12.0 bb (Splash)</span>
            </div>
          </div>

          {/* Variance / Profile */}
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-[10px] text-[#64748b] uppercase">Varianza / Perfil de Juego</label>
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              <button
                onClick={() => setPlayerStyle('tight')}
                className={`py-1 rounded text-center transition-colors ${
                  playerStyle === 'tight' ? 'bg-[#1e293b] text-[#10b981] font-bold border border-[rgba(255,255,255,0.16)]' : 'bg-[#171f33] text-[#64748b] hover:text-[#f8fafc]'
                }`}
                type="button"
              >
                Tight (80)
              </button>
              <button
                onClick={() => setPlayerStyle('tag')}
                className={`py-1 rounded text-center transition-colors ${
                  playerStyle === 'tag' ? 'bg-[#1e293b] text-[#10b981] font-bold border border-[rgba(255,255,255,0.16)]' : 'bg-[#171f33] text-[#64748b] hover:text-[#f8fafc]'
                }`}
                type="button"
              >
                TAG (85)
              </button>
              <button
                onClick={() => setPlayerStyle('lag')}
                className={`py-1 rounded text-center transition-colors ${
                  playerStyle === 'lag' ? 'bg-[#1e293b] text-[#10b981] font-bold border border-[rgba(255,255,255,0.16)]' : 'bg-[#171f33] text-[#64748b] hover:text-[#f8fafc]'
                }`}
                type="button"
              >
                LAG (110)
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[rgba(255,255,255,0.08)] text-[9px] text-[#64748b] leading-tight">
            <span className="text-[#f59e0b] font-semibold">Metodología:</span> RakeNeto = RakeBruto × (1 - RB). Winrate BE = RakeNeto requerido para no descapitalizar la banca.
          </div>
        </div>

        {/* Right Output Tiles & Viability Zone Bar */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono">
            {/* Impacto Rake */}
            <div className="p-2.5 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
              <span className="text-[10px] text-[#64748b] uppercase">Impacto Rake</span>
              <div className="mt-1">
                <div className="text-[16px] font-bold text-[#ef4444] tabular-nums">-{rakePaidBB.toFixed(2)} bb</div>
                <span className="text-[9.5px] text-[#64748b]">-${rakeCostPer100}/100m</span>
              </div>
              <span className="text-[9px] text-[#ef4444] mt-0.5">Carga total</span>
            </div>

            {/* Amortización RB */}
            <div className="p-2.5 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
              <span className="text-[10px] text-[#64748b] uppercase">Amortización RB</span>
              <div className="mt-1">
                <div className="text-[16px] font-bold text-[#10b981] tabular-nums">+{rbAmortizationBB.toFixed(2)} bb</div>
                <span className="text-[9.5px] text-[#10b981]">+{rbReturnPer100}/100m</span>
              </div>
              <span className="text-[9px] text-[#64748b] mt-0.5">Devolución {rakebackPercent}%</span>
            </div>

            {/* Winrate Bruto B-E */}
            <div className="p-2.5 rounded-lg bg-[#050507] border border-[#f59e0b]/30 flex flex-col justify-between">
              <span className="text-[10px] text-[#64748b] uppercase">Winrate Bruto B-E</span>
              <div className="mt-1">
                <div className="text-[16px] font-bold text-[#f59e0b] tabular-nums">+{breakEvenGrossBB.toFixed(2)} bb</div>
                <span className="text-[9.5px] text-[#64748b]">Pto. Equilibrio</span>
              </div>
              <span className="text-[9px] text-[#f59e0b] mt-0.5">Mínimo necesario</span>
            </div>

            {/* Winrate Neto B-E */}
            <div className="p-2.5 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
              <span className="text-[10px] text-[#64748b] uppercase">Winrate Neto B-E</span>
              <div className="mt-1">
                <div className="text-[16px] font-bold text-[#f8fafc] tabular-nums">0.00 bb</div>
                <span className="text-[9.5px] text-[#64748b]">$0.00/100m</span>
              </div>
              <span className="text-[9px] text-[#64748b] mt-0.5">Sustentabilidad</span>
            </div>

            {/* Target Rentable */}
            <div className="p-2.5 rounded-lg bg-[#050507] border border-[#10b981]/40 bg-[#064e3b]/10 flex flex-col justify-between">
              <span className="text-[10px] text-[#10b981] uppercase font-bold">Target Rentable</span>
              <div className="mt-1">
                <div className="text-[16px] font-bold text-[#10b981] tabular-nums">+{targetRentableBB.toFixed(2)} bb</div>
                <span className="text-[9.5px] text-[#10b981]">+3.0 bb netos</span>
              </div>
              <span className="text-[9px] text-[#10b981] font-medium mt-0.5">+${targetProfitPer100}/100m</span>
            </div>
          </div>

          {/* Viability Zones Strip */}
          <div className="p-3.5 rounded-xl bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col gap-2 font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#64748b] uppercase tracking-wider text-[10px]">
                Umbrales de Viabilidad y Zonas de Rendimiento NL10
              </span>
              <span className="text-[#f8fafc] font-bold text-[10px]">
                Winrate Hero en NL5: <strong className="text-[#10b981]">+39.3 bb</strong>
              </span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#171f33] relative">
              <div className="h-full bg-[#ef4444]/80" style={{ width: '32%' }} title="Zona 1: Trampa Rake"></div>
              <div className="h-full bg-[#f59e0b]" style={{ width: '14%' }} title="Zona 2: Break-Even"></div>
              <div className="h-full bg-[#10b981]" style={{ width: '26%' }} title="Zona 3: Rentable"></div>
              <div className="h-full bg-[#38bdf8]" style={{ width: '28%' }} title="Zona 4: Crushing"></div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[9.5px]">
              <div className="flex flex-col text-[#ef4444]">
                <span className="font-bold">&lt; {breakEvenGrossBB.toFixed(2)} bb/100</span>
                <span className="text-[#64748b] text-[8.5px]">Trampa Rake / Pérdida</span>
              </div>
              <div className="flex flex-col text-[#f59e0b]">
                <span className="font-bold">{breakEvenGrossBB.toFixed(2)} a {(breakEvenGrossBB + 1.5).toFixed(2)} bb</span>
                <span className="text-[#64748b] text-[8.5px]">Break-Even &amp; Rebote</span>
              </div>
              <div className="flex flex-col text-[#10b981]">
                <span className="font-bold">+1.5 a +4.0 bb netos</span>
                <span className="text-[#64748b] text-[8.5px]">Rentable Sostenible</span>
              </div>
              <div className="flex flex-col text-[#38bdf8]">
                <span className="font-bold">&gt; +4.0 bb netos</span>
                <span className="text-[#64748b] text-[8.5px]">Crushing Stake</span>
              </div>
            </div>
          </div>

          {/* Rake Comparison and Security Buffer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
            <div className="p-3 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase">
                <span>Comparativa Rake NL5 vs NL10 (30k manos)</span>
                <span className="material-symbols-outlined text-[13px] text-[#38bdf8]">analytics</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-[#94a3b8]">NL5: <strong className="text-[#f8fafc]">$126.00/mes</strong></span>
                <span className="text-[#ef4444] font-bold">NL10: $255.00/mes</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#64748b] border-t border-[rgba(255,255,255,0.08)] pt-1">
                <span>Diferencial absoluto:</span>
                <span className="text-[#ef4444] font-semibold">+$129.00/mes en comisiones</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase">
                <span>Buffer de Seguridad &amp; Stop-Loss</span>
                <span className="material-symbols-outlined text-[13px] text-[#10b981]">shield</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-[#94a3b8]">Shot Buffer: <strong className="text-[#f59e0b]">5-10 cx ($50-$100)</strong></span>
                <span className="text-[#ef4444] font-bold">Stop-loss: -5 cx (-$50)</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#64748b] border-t border-[rgba(255,255,255,0.08)] pt-1">
                <span>Cobertura actual:</span>
                <span className="text-[#10b981] font-semibold">245 cajas NL10 (RoR &lt; 0.05%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
