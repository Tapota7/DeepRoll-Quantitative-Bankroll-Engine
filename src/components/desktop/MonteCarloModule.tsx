import React, { useState } from 'react';

export const MonteCarloModule: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<'base' | 'opt' | 'adv' | 'stress'>('base');
  const [horizon, setHorizon] = useState<'25k' | '50k' | '100k'>('50k');
  const [confidence, setConfidence] = useState<'90%' | '95%' | '99%'>('95%');

  // Dynamic values depending on selected scenario
  const getScenarioData = () => {
    switch (activeScenario) {
      case 'opt':
        return {
          ror: '< 0.001%',
          targetHit: '98.9%',
          maxDD: '-24.0 cx (-$120.00)',
          p50: '$3,820',
          p95: '$5,400',
          p05: '$2,350',
          crossingHands: '24.500 manos',
        };
      case 'adv':
        return {
          ror: '0.04%',
          targetHit: '84.2%',
          maxDD: '-41.5 cx (-$207.50)',
          p50: '$2,680',
          p95: '$3,950',
          p05: '$1,720',
          crossingHands: '48.000 manos',
        };
      case 'stress':
        return {
          ror: '0.12%',
          targetHit: '76.5%',
          maxDD: '-58.0 cx (-$290.00)',
          p50: '$2,240',
          p95: '$3,400',
          p05: '$1,380',
          crossingHands: '> 60.000 manos',
        };
      case 'base':
      default:
        return {
          ror: '< 0.01%',
          targetHit: '94.8%',
          maxDD: '-32.5 cx (-$162.50)',
          p50: '$3.120',
          p95: '$4.850',
          p05: '$1.980',
          crossingHands: '34.200 manos',
        };
    }
  };

  const data = getScenarioData();

  return (
    <div className="flex flex-col bg-[#131b2e] rounded-xl border border-[rgba(255,255,255,0.08)] p-5 shadow-sm">
      {/* Module Header & Model Parameters */}
      <div className="flex flex-col gap-3 pb-3 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#050507] border border-[#38bdf8]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[19px] text-[#38bdf8]">candlestick_chart</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-bold text-[#f8fafc] tracking-tight font-sans">
                  Simulación &amp; Proyección Monte Carlo
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#050507] text-[#38bdf8] font-mono text-[10px] font-bold border border-[#38bdf8]/20">
                  N=10.000 ITERACIONES
                </span>
              </div>
              <p className="text-[11px] text-[#64748b] font-mono mt-0.5">
                Modelo estocástico de trayectorias aleatorias con remuestreo bootstrap paramétrico basado en varianza real
              </p>
            </div>
          </div>

          {/* Interactive Scenario Selector Tabs */}
          <div className="flex flex-wrap items-center bg-[#050507] p-1 rounded-lg border border-[rgba(255,255,255,0.08)] font-mono text-[11px]">
            <button
              onClick={() => setActiveScenario('base')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeScenario === 'base'
                  ? 'bg-[#1e293b] text-[#10b981] font-bold border border-[rgba(255,255,255,0.16)] shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
              type="button"
            >
              Escenario Base (P50)
            </button>
            <button
              onClick={() => setActiveScenario('opt')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeScenario === 'opt'
                  ? 'bg-[#1e293b] text-[#38bdf8] font-bold border border-[rgba(255,255,255,0.16)] shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
              type="button"
            >
              Optimista (P90/P95)
            </button>
            <button
              onClick={() => setActiveScenario('adv')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeScenario === 'adv'
                  ? 'bg-[#1e293b] text-[#f59e0b] font-bold border border-[rgba(255,255,255,0.16)] shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
              type="button"
            >
              Adverso (P10/P05)
            </button>
            <button
              onClick={() => setActiveScenario('stress')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeScenario === 'stress'
                  ? 'bg-[#1e293b] text-[#ef4444] font-bold border border-[rgba(255,255,255,0.16)] shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
              type="button"
            >
              Stress Test &amp; Ruina
            </button>
          </div>
        </div>

        {/* Parameter Badges Ribbon */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
          <span className="text-[#64748b]">Parámetros del modelo:</span>
          <span className="px-2 py-0.5 rounded bg-[#050507] border border-[rgba(255,255,255,0.08)] text-[#f8fafc]">
            Winrate μ: <strong className="text-[#10b981]">+39.3 bb/100</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-[#050507] border border-[rgba(255,255,255,0.08)] text-[#f8fafc]">
            Desv. Estándar σ: <strong className="text-[#adc6ff]">85.0 bb/100</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-[#050507] border border-[rgba(255,255,255,0.08)] text-[#f8fafc]">
            Horizonte: <strong className="text-[#38bdf8]">{horizon === '25k' ? '25.000 manos' : horizon === '100k' ? '100.000 manos' : '50.000 manos'}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-[#064e3b]/20 border border-[#10b981]/20 text-[#10b981] font-medium">
            IC: {confidence} Confianza
          </span>
        </div>
      </div>

      {/* Simulation Layout: Fan Chart & Derived Quant Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Fan Chart Container */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="relative w-full h-80 bg-[#050507] rounded-lg p-3 border border-[rgba(255,255,255,0.08)] flex flex-col justify-end overflow-hidden">
            {/* Horizontal background gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
              <div className="w-full border-b border-dashed border-[#64748b]"></div>
              <div className="w-full border-b border-dashed border-[#64748b]"></div>
              <div className="w-full border-b border-dashed border-[#64748b]"></div>
              <div className="w-full border-b border-dashed border-[#64748b]"></div>
              <div className="w-full border-b border-dashed border-[#64748b]"></div>
            </div>

            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 760 280">
              <defs>
                <linearGradient id="mcConeGrad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.05"></stop>
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.12"></stop>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.22"></stop>
                </linearGradient>
                <linearGradient id="mcInnerConeGrad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.08"></stop>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.28"></stop>
                </linearGradient>
              </defs>

              {/* Y-Axis Labels */}
              <text fill="#64748b" fontFamily="JetBrains Mono" fontSize="9" x="12" y="25">$4,800 (960cx)</text>
              <text fill="#f59e0b" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold" x="12" y="115">$3,000 (NL10)</text>
              <text fill="#64748b" fontFamily="JetBrains Mono" fontSize="9" x="12" y="160">$2,450 (Actual)</text>
              <text fill="#64748b" fontFamily="JetBrains Mono" fontSize="9" x="12" y="215">$1,800 (360cx)</text>
              <text fill="#ef4444" fontFamily="JetBrains Mono" fontSize="9" x="12" y="268">$1,200 (Quiebra)</text>

              {/* X-Axis Reference Vertical Marks */}
              <line stroke="#334155" strokeDasharray="2 2" strokeWidth="1" x1="65" x2="65" y1="10" y2="265"></line>
              <line stroke="#334155" strokeDasharray="2 2" strokeWidth="1" x1="200" x2="200" y1="10" y2="265"></line>
              <line stroke="#334155" strokeDasharray="2 2" strokeWidth="1" x1="410" x2="410" y1="10" y2="265"></line>
              <line opacity="0.5" stroke="#f59e0b" strokeDasharray="2 2" strokeWidth="1.2" x1="550" x2="550" y1="10" y2="265"></line>
              <line stroke="#334155" strokeDasharray="2 2" strokeWidth="1" x1="735" x2="735" y1="10" y2="265"></line>

              <text fill="#94a3b8" fontFamily="JetBrains Mono" fontSize="8.5" x="65" y="276">Actual (0)</text>
              <text fill="#64748b" fontFamily="JetBrains Mono" fontSize="8.5" x="190" y="276">+10k m</text>
              <text fill="#64748b" fontFamily="JetBrains Mono" fontSize="8.5" x="400" y="276">+25k m</text>
              <text fill="#f59e0b" fontFamily="JetBrains Mono" fontSize="8.5" fontWeight="bold" x="520" y="276">+34.2k (Meta)</text>
              <text fill="#38bdf8" fontFamily="JetBrains Mono" fontSize="8.5" fontWeight="bold" x="705" y="276">+50k m</text>

              {/* Starting Capital Reference Line */}
              <line opacity="0.6" stroke="#64748b" strokeDasharray="3 3" strokeWidth="1.2" x1="65" x2="735" y1="158" y2="158"></line>

              {/* Target Level: NL10 Target ($3,000 USD) */}
              <line opacity="0.85" stroke="#f59e0b" strokeDasharray="4 3" strokeWidth="1.5" x1="65" x2="735" y1="112" y2="112"></line>
              <rect fill="#1e293b" height="17" rx="3" stroke="#f59e0b" strokeWidth="1" width="138" x="585" y="104"></rect>
              <text fill="#ffb95f" fontFamily="JetBrains Mono" fontSize="8" fontWeight="bold" x="592" y="116">META NL10: $3.000 (300cx)</text>

              {/* Outer Dispersion Fan Area */}
              <polygon
                fill="url(#mcConeGrad)"
                points="65,158 200,105 410,58 550,38 735,22 735,202 550,192 410,188 200,175 65,158"
              ></polygon>

              {/* Inner Interquartile Fan Area */}
              <polygon
                fill="url(#mcInnerConeGrad)"
                points="65,158 200,132 410,95 550,78 735,62 735,168 550,162 410,154 200,152 65,158"
              ></polygon>

              {/* Percentile Contour Trajectory Lines */}
              <path d="M 65,158 Q 300,90 735,22" fill="none" stroke="#38bdf8" strokeDasharray="3 2" strokeWidth="1.4"></path>
              <path d="M 65,158 Q 320,118 735,62" fill="none" stroke="#4edea3" strokeDasharray="4 3" strokeWidth="1.3"></path>
              <path d="M 65,158 Q 340,165 735,168" fill="none" stroke="#adc6ff" strokeDasharray="4 3" strokeWidth="1.3"></path>
              <path d="M 65,158 C 180,182 320,205 735,202" fill="none" stroke="#ef4444" strokeDasharray="3 2" strokeWidth="1.4"></path>

              {/* P50 Median Expected Trajectory */}
              <path
                d="M 65,158 Q 310,140 550,112 T 735,92"
                fill="none"
                stroke="#10b981"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              ></path>

              {/* Intersection Mark: P50 crossing the $3,000 Target */}
              <circle cx="550" cy="112" fill="#f59e0b" r="5" stroke="#0b1326" strokeWidth="2.5"></circle>
              <rect fill="#0b1326" height="18" rx="3" stroke="#f59e0b" strokeWidth="1" width="136" x="482" y="88"></rect>
              <text fill="#ffb95f" fontFamily="JetBrains Mono" fontSize="8" fontWeight="bold" textAnchor="middle" x="550" y="100">
                Cruce P50: {data.crossingHands}
              </text>

              {/* End Point Terminal Callouts */}
              <circle cx="735" cy="22" fill="#38bdf8" r="4.5" stroke="#050507" strokeWidth="2"></circle>
              <text fill="#38bdf8" fontFamily="JetBrains Mono" fontSize="8.5" fontWeight="bold" textAnchor="end" x="725" y="26">
                P95: {data.p95} (+970cx)
              </text>

              <circle cx="735" cy="92" fill="#10b981" r="5.5" stroke="#050507" strokeWidth="2"></circle>
              <text fill="#4edea3" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold" textAnchor="end" x="725" y="96">
                P50: {data.p50} (+624cx)
              </text>

              <circle cx="735" cy="202" fill="#ef4444" r="4.5" stroke="#050507" strokeWidth="2"></circle>
              <text fill="#ffb4ab" fontFamily="JetBrains Mono" fontSize="8.5" fontWeight="bold" textAnchor="end" x="725" y="206">
                P05: {data.p05} (-94cx)
              </text>
            </svg>
          </div>

          {/* Visual Chart Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1 font-mono text-[11px] text-[#94a3b8]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#10b981] font-semibold">
                <span className="w-3 h-0.5 bg-[#10b981] rounded"></span>Mediana P50 ({data.p50})
              </span>
              <span className="flex items-center gap-1.5 text-[#38bdf8]">
                <span className="w-3 h-0.5 border-b border-[#38bdf8] border-dashed"></span>P95 Optimista ({data.p95})
              </span>
              <span className="flex items-center gap-1.5 text-[#ef4444]">
                <span className="w-3 h-0.5 border-b border-[#ef4444] border-dashed"></span>P05 Adverso ({data.p05})
              </span>
              <span className="flex items-center gap-1.5 text-[#f59e0b] font-medium">
                <span className="w-3 h-0.5 border-b border-[#f59e0b] border-dashed"></span>Meta NL10 ($3.000)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#64748b]">
              <span className="material-symbols-outlined text-[14px] text-[#adc6ff]">shield</span>
              <span>Tolerancia de quiebra: Infinita en NL5</span>
            </div>
          </div>
        </div>

        {/* Derived Monte Carlo Quant Metric Cards & Live Controls */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3">
          <div className="grid grid-cols-1 gap-2.5 font-mono">
            {/* KPI RoR */}
            <div className="p-3 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase">
                <span>Riesgo de Ruina (RoR)</span>
                <span className="material-symbols-outlined text-[15px] text-[#10b981]">verified_user</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-[18px] font-bold text-[#10b981] tabular-nums">{data.ror}</span>
                <span className="text-[10px] text-[#64748b]">Blindaje 490 cajas</span>
              </div>
              <span className="text-[10px] text-[#64748b] mt-0.5">Riesgo estadístico nulo para nivel NL5 actual</span>
            </div>

            {/* KPI Target Hit Probability */}
            <div className="p-3 rounded-lg bg-[#050507] border border-[#10b981]/20 bg-[#064e3b]/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase">
                <span>Prob. Alcanzar Meta NL10</span>
                <span className="material-symbols-outlined text-[15px] text-[#f59e0b]">flag</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-[18px] font-bold text-[#10b981] tabular-nums">{data.targetHit}</span>
                <span className="text-[10px] text-[#f59e0b] font-semibold">Objetivo: $3.000</span>
              </div>
              <span className="text-[10px] text-[#64748b] mt-0.5">En 50.000 manos proyectadas (~42 días)</span>
            </div>

            {/* KPI Max Downswing Simulated */}
            <div className="p-3 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase">
                <span>Max Downswing Simulado (99% Conf.)</span>
                <span className="material-symbols-outlined text-[15px] text-[#ef4444]">trending_down</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-[18px] font-bold text-[#ef4444] tabular-nums">{data.maxDD}</span>
              </div>
              <span className="text-[10px] text-[#64748b] mt-0.5">La banca soporta &gt;15 downswings consecutivos</span>
            </div>

            {/* Kelly Criterion */}
            <div className="p-3 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase">
                <span>Kelly Criterion Recomendado</span>
                <span className="material-symbols-outlined text-[15px] text-[#adc6ff]">balance</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-[18px] font-bold text-[#adc6ff] tabular-nums">0.25 Kelly</span>
                <span className="text-[10px] text-[#10b981] font-semibold">Ultra Conservador</span>
              </div>
              <span className="text-[10px] text-[#64748b] mt-0.5">Minimiza volatilidad sin frenar acumulación</span>
            </div>
          </div>

          {/* Live Simulation Adjustment Controls */}
          <div className="p-3 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col gap-2 font-mono text-[11px]">
            <div className="flex items-center justify-between text-[10px] text-[#64748b] uppercase tracking-wider">
              <span>Ajustes de Parámetros en Vivo</span>
              <span className="material-symbols-outlined text-[13px] text-[#38bdf8]">tune</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#64748b]">Horizonte de Manos:</span>
                <div className="flex items-center gap-1">
                  {(['25k', '50k', '100k'] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => setHorizon(h)}
                      className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                        horizon === h
                          ? 'bg-[#1e293b] text-[#10b981] font-bold border border-[rgba(255,255,255,0.16)]'
                          : 'bg-[#171f33] text-[#64748b] hover:text-[#f8fafc]'
                      }`}
                      type="button"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#64748b]">Nivel de Confianza:</span>
                <div className="flex items-center gap-1">
                  {(['90%', '95%', '99%'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setConfidence(c)}
                      className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                        confidence === c
                          ? 'bg-[#1e293b] text-[#38bdf8] font-bold border border-[rgba(255,255,255,0.16)]'
                          : 'bg-[#171f33] text-[#64748b] hover:text-[#f8fafc]'
                      }`}
                      type="button"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#64748b]">Tasa Winrate:</span>
                <span className="text-[#10b981] font-semibold">+39.3 bb (Auditada)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
