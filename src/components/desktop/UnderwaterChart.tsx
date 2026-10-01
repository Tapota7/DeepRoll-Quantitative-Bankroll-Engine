import React, { useMemo, useState } from 'react';
import { BankrollLedger, Session } from '../../types/poker';

interface UnderwaterChartProps {
  ledger: BankrollLedger;
  sessions?: Session[];
}

interface NegativeStreak {
  id: string;
  startIndex: number;
  endIndex: number;
  startDate: string;
  endDate: string;
  daysCount: number;
  totalLossMoney: number; // Negative value
  totalLossCajas: number; // Negative value
  sessions: Session[];
}

export const UnderwaterChart: React.FC<UnderwaterChartProps> = ({ ledger, sessions = [] }) => {
  const [hoveredStreak, setHoveredStreak] = useState<NegativeStreak | null>(null);

  // Analyze Negative Streaks (defined strictly as >= 2 consecutive days with netProfit < 0)
  const streakAnalysis = useMemo(() => {
    // Sort chronologically ascending (oldest to newest)
    const chronological = [...sessions].sort((a, b) => a.timestamp - b.timestamp);
    const totalDays = chronological.length;

    const streaks: NegativeStreak[] = [];
    let currentTempStreak: Session[] = [];
    let tempStartIndex = -1;

    chronological.forEach((s, idx) => {
      if (s.netProfit < 0) {
        if (currentTempStreak.length === 0) {
          tempStartIndex = idx;
        }
        currentTempStreak.push(s);
      } else {
        // If we were tracking a losing streak and it ended
        if (currentTempStreak.length >= 2) {
          const totalLossMoney = currentTempStreak.reduce((acc, sess) => acc + sess.netProfit, 0);
          const totalLossCajas = currentTempStreak.reduce((acc, sess) => acc + sess.cajasImpact, 0);
          streaks.push({
            id: `streak-${tempStartIndex}`,
            startIndex: tempStartIndex,
            endIndex: idx - 1,
            startDate: currentTempStreak[0].date,
            endDate: currentTempStreak[currentTempStreak.length - 1].date,
            daysCount: currentTempStreak.length,
            totalLossMoney,
            totalLossCajas,
            sessions: [...currentTempStreak],
          });
        }
        currentTempStreak = [];
        tempStartIndex = -1;
      }
    });

    // Check if the latest session is still inside an ongoing streak
    let activeStreakOngoing: NegativeStreak | null = null;
    if (currentTempStreak.length >= 2) {
      const totalLossMoney = currentTempStreak.reduce((acc, sess) => acc + sess.netProfit, 0);
      const totalLossCajas = currentTempStreak.reduce((acc, sess) => acc + sess.cajasImpact, 0);
      activeStreakOngoing = {
        id: `streak-${tempStartIndex}`,
        startIndex: tempStartIndex,
        endIndex: totalDays - 1,
        startDate: currentTempStreak[0].date,
        endDate: currentTempStreak[currentTempStreak.length - 1].date,
        daysCount: currentTempStreak.length,
        totalLossMoney,
        totalLossCajas,
        sessions: [...currentTempStreak],
      };
      streaks.push(activeStreakOngoing);
    }

    // Check current state from latest session backwards
    let currentLosingDaysCount = 0;
    let currentLosingMoney = 0;
    let currentLosingCajas = 0;

    for (let i = chronological.length - 1; i >= 0; i--) {
      if (chronological[i].netProfit < 0) {
        currentLosingDaysCount++;
        currentLosingMoney += chronological[i].netProfit;
        currentLosingCajas += chronological[i].cajasImpact;
      } else {
        break;
      }
    }

    const isCurrentActiveStreak = currentLosingDaysCount >= 2;

    // Historical records among streaks with >= 2 days
    let maxHistoricalDays = 0;
    let worstStreakByMoney: NegativeStreak | null = null;
    let worstStreakByCajas: NegativeStreak | null = null;
    let maxLossMoney = 0;
    let maxLossCajas = 0;

    streaks.forEach((st) => {
      if (st.daysCount > maxHistoricalDays) {
        maxHistoricalDays = st.daysCount;
      }
      if (Math.abs(st.totalLossMoney) > Math.abs(maxLossMoney)) {
        maxLossMoney = st.totalLossMoney;
        worstStreakByMoney = st;
      }
      if (Math.abs(st.totalLossCajas) > Math.abs(maxLossCajas)) {
        maxLossCajas = st.totalLossCajas;
        worstStreakByCajas = st;
      }
    });

    // Average loss per negative streak
    const avgLossMoney = streaks.length > 0 ? streaks.reduce((a, b) => a + b.totalLossMoney, 0) / streaks.length : 0;
    const avgLossCajas = streaks.length > 0 ? streaks.reduce((a, b) => a + b.totalLossCajas, 0) / streaks.length : 0;

    const worstDipSessionId: string | null =
      worstStreakByMoney && (worstStreakByMoney as NegativeStreak).sessions.length > 0
        ? (worstStreakByMoney as NegativeStreak).sessions[(worstStreakByMoney as NegativeStreak).sessions.length - 1].id
        : null;

    // Build timeline points for SVG Drawdown visualization
    // We compute cumulative downswing from recent peaks, specially accentuating negative streaks
    let runningPeak = 0;
    let runningBalance = 0;
    const timelinePoints = chronological.map((s, idx) => {
      runningBalance += s.netProfit;
      if (runningBalance > runningPeak) {
        runningPeak = runningBalance;
      }
      const ddMoney = runningBalance - runningPeak; // <= 0
      const boxSize = s.bb ? s.bb * 100 : 5.0;
      const ddCajas = ddMoney / boxSize;

      // Check if this session is part of a negative streak (>=2 consecutive days)
      const inStreak = streaks.some((st) => idx >= st.startIndex && idx <= st.endIndex);

      return {
        session: s,
        idx,
        ddMoney,
        ddCajas,
        inStreak,
      };
    });

    return {
      totalDays,
      chronological,
      streaks,
      activeStreakOngoing,
      isCurrentActiveStreak,
      currentLosingDaysCount,
      currentLosingMoney,
      currentLosingCajas,
      maxHistoricalDays,
      maxLossMoney,
      maxLossCajas,
      worstStreakByMoney,
      worstStreakByCajas,
      worstDipSessionId,
      avgLossMoney,
      avgLossCajas,
      timelinePoints,
    };
  }, [sessions]);

  // Chart Dimensions
  const svgWidth = 340;
  const svgHeight = 150;
  const paddingTop = 22;
  const paddingBottom = 22;
  const paddingLeft = 32;
  const paddingRight = 15;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Compute scale for drawdown
  const maxDDCajas = Math.max(
    ...streakAnalysis.timelinePoints.map((p) => Math.abs(p.ddCajas)),
    Math.abs(streakAnalysis.maxLossCajas),
    8
  );

  // SVG coordinates for timeline
  const pts = streakAnalysis.timelinePoints;
  const svgPoints = pts.map((p, i) => {
    const x = pts.length > 1 ? paddingLeft + (i / (pts.length - 1)) * chartWidth : paddingLeft + chartWidth / 2;
    const y = paddingTop + (Math.abs(p.ddCajas) / maxDDCajas) * chartHeight;
    return { x, y, ...p };
  });

  const polylineStr = svgPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const polygonStr = `${paddingLeft},${paddingTop} ` + polylineStr + ` ${paddingLeft + chartWidth},${paddingTop}`;

  // Bankroll capacity in worst streak multiples
  const worstStreakAbs = Math.abs(streakAnalysis.maxLossMoney);
  const capacityMultiples = worstStreakAbs > 0 ? (ledger.currentBalance / worstStreakAbs).toFixed(1) : '∞';

  return (
    <div className="flex flex-col justify-between bg-[#111218] rounded-2xl border border-white/[0.06] p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
        <div>
          <h2 className="text-[15px] font-semibold text-zinc-100 font-sans tracking-tight">
            Rachas Negativas
          </h2>
          <p className="text-[12px] text-zinc-500 font-sans mt-0.5">
            Supervisión de pérdidas continuadas (≥ 2 días)
          </p>
        </div>
        <span className="text-[11px] font-sans text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/[0.06]">
          Riesgo &amp; Drawdown
        </span>
      </div>

      {/* Primary Telemetry: Estado Actual vs Máximo Histórico */}
      <div className="grid grid-cols-2 gap-3 my-3">
        {/* Drawdown Actual de Racha */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
            streakAnalysis.isCurrentActiveStreak
              ? 'bg-[#fb7185]/10 border-[#fb7185]/30'
              : 'bg-white/[0.02] border-white/[0.06]'
          }`}
        >
          <span className="text-[11px] text-zinc-400 font-sans">Drawdown Actual</span>

          <div className="my-1.5">
            <div
              className={`text-[18px] font-bold font-mono tabular-nums ${
                streakAnalysis.isCurrentActiveStreak
                  ? 'text-[#fb7185]'
                  : streakAnalysis.currentLosingDaysCount === 1
                  ? 'text-amber-400'
                  : 'text-zinc-100'
              }`}
            >
              {streakAnalysis.currentLosingDaysCount > 0
                ? `-$${Math.abs(streakAnalysis.currentLosingMoney).toFixed(2)}`
                : '$0.00'}
            </div>
            <div className="text-[11px] text-zinc-400 font-sans mt-0.5">
              {streakAnalysis.isCurrentActiveStreak ? (
                <span className="text-[#fb7185] font-medium">
                  {streakAnalysis.currentLosingDaysCount} días en racha ({streakAnalysis.currentLosingCajas.toFixed(1)} cx)
                </span>
              ) : streakAnalysis.currentLosingDaysCount === 1 ? (
                <span className="text-amber-400">1 día aislado</span>
              ) : (
                <span className="text-[#34d399]">Sin racha activa</span>
              )}
            </div>
          </div>

          <span className="text-[10px] text-zinc-500 font-sans">
            {streakAnalysis.isCurrentActiveStreak ? 'Alerta de stop-loss' : 'Banca protegida'}
          </span>
        </div>

        {/* Máximo Histórico de Rachas Negativas */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[11px] text-zinc-400 font-sans">Peor Racha Histórica</span>

          <div className="my-1.5">
            <div className="text-[18px] font-bold text-[#fb7185] font-mono tabular-nums">
              {streakAnalysis.maxLossMoney !== 0 ? `-$${Math.abs(streakAnalysis.maxLossMoney).toFixed(2)}` : '$0.00'}
            </div>
            <div className="text-[11px] text-zinc-400 font-sans mt-0.5">
              {streakAnalysis.maxHistoricalDays > 0 ? (
                <span>
                  {streakAnalysis.maxHistoricalDays} días ({streakAnalysis.maxLossCajas.toFixed(1)} cx)
                </span>
              ) : (
                <span>0 días</span>
              )}
            </div>
          </div>

          <span className="text-[10px] text-zinc-500 font-sans">
            {streakAnalysis.streaks.length} {streakAnalysis.streaks.length === 1 ? 'racha previa' : 'rachas previas'}
          </span>
        </div>
      </div>

      {/* SVG Downswing & Negative Streak Chart */}
      <div className="relative w-full h-44 bg-white/[0.01] rounded-xl p-2 border border-white/[0.04] flex flex-col justify-start overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <defs>
            <linearGradient id="streakAreaGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.05" />
              <stop offset="60%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.65" />
            </linearGradient>
          </defs>

          {/* Baseline Level (0 Drawdown / All-Time High) */}
          <line
            stroke="#10b981"
            strokeDasharray="3 3"
            strokeWidth="1.2"
            x1={paddingLeft}
            x2={svgWidth - paddingRight}
            y1={paddingTop}
            y2={paddingTop}
          />
          <text fill="#10b981" fontFamily="JetBrains Mono" fontSize="8" x={svgWidth - paddingRight - 45} y={paddingTop - 5}>
            Pico (0 cx)
          </text>

          {/* Scale markers on Y-axis */}
          <text fill="#64748b" fontFamily="JetBrains Mono" fontSize="7.5" x={paddingLeft - 4} y={paddingTop + chartHeight * 0.45} textAnchor="end">
            -{(maxDDCajas * 0.5).toFixed(0)}cx
          </text>
          <text fill="#ef4444" fontFamily="JetBrains Mono" fontSize="7.5" x={paddingLeft - 4} y={paddingTop + chartHeight} textAnchor="end">
            -{maxDDCajas.toFixed(0)}cx
          </text>

          {/* Drawdown Area Polygon */}
          {pts.length > 1 && (
            <polygon fill="url(#streakAreaGrad)" points={polygonStr} />
          )}

          {/* Drawdown Trajectory Polyline */}
          {pts.length > 1 && (
            <polyline
              fill="none"
              points={polylineStr}
              stroke="#ef4444"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          )}

          {/* Highlight markers on Negative Streak Sessions (>= 2 days) */}
          {svgPoints.map((p, idx) => {
            if (!p.inStreak && p.ddMoney === 0) return null;
            const isWorstDip = Boolean(streakAnalysis.worstDipSessionId && p.session.id === streakAnalysis.worstDipSessionId);

            return (
              <g
                key={p.session.id || idx}
                className="cursor-pointer"
                onMouseEnter={() => {
                  const parentStreak = streakAnalysis.streaks.find(
                    (st) => idx >= st.startIndex && idx <= st.endIndex
                  );
                  if (parentStreak) setHoveredStreak(parentStreak);
                }}
                onMouseLeave={() => setHoveredStreak(null)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isWorstDip ? 4.5 : p.inStreak ? 3.5 : 2}
                  fill={isWorstDip ? '#ff4d4f' : p.inStreak ? '#ef4444' : '#64748b'}
                  stroke="#050507"
                  strokeWidth="1.5"
                />
                {isWorstDip && (
                  <circle cx={p.x} cy={p.y} r={7} fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
                )}
              </g>
            );
          })}

          {/* Current active point */}
          {svgPoints.length > 0 && (
            <circle
              cx={svgPoints[svgPoints.length - 1].x}
              cy={svgPoints[svgPoints.length - 1].y}
              r={4}
              fill={streakAnalysis.isCurrentActiveStreak ? '#ef4444' : '#10b981'}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          )}
        </svg>

        {/* Hovered Streak Detailed Tooltip */}
        {hoveredStreak ? (
          <div className="absolute bottom-2 left-2 right-2 p-2 rounded bg-[#0d1424]/95 border border-[#ef4444]/40 font-mono text-[10px] flex items-center justify-between text-[#f8fafc] animate-in fade-in">
            <span className="text-[#ef4444] font-bold">
              Racha de {hoveredStreak.daysCount} días ({hoveredStreak.startDate.split(',')[0]} → {hoveredStreak.endDate.split(',')[0]})
            </span>
            <span>
              Pérdida: <strong className="text-[#ef4444]">${hoveredStreak.totalLossMoney.toFixed(2)}</strong> ({hoveredStreak.totalLossCajas.toFixed(1)} cx)
            </span>
          </div>
        ) : (
          <div className="absolute bottom-1 right-2 font-mono text-[9px] text-[#64748b]">
            Pasa el cursor por los puntos rojos para inspeccionar rachas
          </div>
        )}
      </div>

      {/* Quantitative Recovery & Risk Metrics */}
      <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.08)] flex flex-col gap-1.5 font-mono text-[11px]">
        <div className="flex items-center justify-between text-[#94a3b8]">
          <span>Pérdida promedio por racha (≥2d):</span>
          <span className="text-[#ef4444] font-bold tabular-nums">
            {streakAnalysis.avgLossMoney !== 0 ? `-$${Math.abs(streakAnalysis.avgLossMoney).toFixed(2)}` : '$0.00'} USD ({streakAnalysis.avgLossCajas.toFixed(1)} cx)
          </span>
        </div>
        <div className="flex items-center justify-between text-[#94a3b8]">
          <span>Blindaje ante peor racha:</span>
          <span className="text-[#10b981] font-bold tabular-nums">
            {capacityMultiples}x capacidad de banca
          </span>
        </div>
        <div className="flex items-center justify-between text-[#94a3b8]">
          <span>Frecuencia en periodo:</span>
          <span className="text-[#adc6ff] font-semibold">
            {streakAnalysis.streaks.length} episodios de downswing
          </span>
        </div>
      </div>
    </div>
  );
};
