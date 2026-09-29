import React, { useState, useMemo } from 'react';
import { Session } from '../../types/poker';

interface WeekdayProfitabilityChartProps {
  sessions: Session[];
}

interface DayStat {
  dayIndex: number; // 0: Dom, 1: Lun, 2: Mar, 3: Mié, 4: Jue, 5: Vie, 6: Sáb
  name: string;
  shortName: string;
  isWeekend: boolean;
  daysCount: number;
  totalNet: number;
  directProfit: number;
  rakeback: number;
  totalHands: number;
  winningDays: number;
  losingDays: number;
  avgProfitPerDay: number;
  winrateBB100: number;
  winDayPct: number;
}

const DAYS_CONFIG = [
  { dayIndex: 1, name: 'Lunes', shortName: 'LUN', isWeekend: false },
  { dayIndex: 2, name: 'Martes', shortName: 'MAR', isWeekend: false },
  { dayIndex: 3, name: 'Miércoles', shortName: 'MIÉ', isWeekend: false },
  { dayIndex: 4, name: 'Jueves', shortName: 'JUE', isWeekend: false },
  { dayIndex: 5, name: 'Viernes', shortName: 'VIE', isWeekend: false },
  { dayIndex: 6, name: 'Sábado', shortName: 'SÁB', isWeekend: true },
  { dayIndex: 0, name: 'Domingo', shortName: 'DOM', isWeekend: true },
];

export const WeekdayProfitabilityChart: React.FC<WeekdayProfitabilityChartProps> = ({ sessions }) => {
  const [metricMode, setMetricMode] = useState<'total' | 'avg' | 'winrate'>('total');
  const [hoveredDay, setHoveredDay] = useState<DayStat | null>(null);

  // Compute stats grouped by Day of the Week
  const weekdayStats: DayStat[] = useMemo(() => {
    return DAYS_CONFIG.map((cfg) => {
      // Filter sessions that landed on this day of the week
      const daySessions = sessions.filter((s) => {
        const d = new Date(s.timestamp);
        return d.getDay() === cfg.dayIndex;
      });

      const daysCount = daySessions.length;
      const totalNet = daySessions.reduce((acc, s) => acc + s.netProfit, 0);
      const directProfit = daySessions.reduce((acc, s) => acc + s.directProfit, 0);
      const rakeback = daySessions.reduce((acc, s) => acc + s.rakeback, 0);
      const totalHands = daySessions.reduce((acc, s) => acc + s.hands, 0);
      const winningDays = daySessions.filter((s) => s.netProfit > 0).length;
      const losingDays = daySessions.filter((s) => s.netProfit < 0).length;
      const avgProfitPerDay = daysCount > 0 ? totalNet / daysCount : 0;
      
      const totalBbWon = daySessions.reduce((acc, s) => acc + (s.directProfit / s.bb), 0);
      const winrateBB100 = totalHands > 0 ? totalBbWon / (totalHands / 100) : 0;
      const winDayPct = daysCount > 0 ? (winningDays / daysCount) * 100 : 0;

      return {
        ...cfg,
        daysCount,
        totalNet,
        directProfit,
        rakeback,
        totalHands,
        winningDays,
        losingDays,
        avgProfitPerDay,
        winrateBB100,
        winDayPct,
      };
    });
  }, [sessions]);

  // Overall analytics
  const overallStats = useMemo(() => {
    const totalDays = sessions.length;
    const totalNet = sessions.reduce((acc, s) => acc + s.netProfit, 0);
    const winningDays = sessions.filter((s) => s.netProfit > 0).length;
    const losingDays = sessions.filter((s) => s.netProfit < 0).length;
    const avgNetPerDay = totalDays > 0 ? totalNet / totalDays : 0;

    // Best day of week by total net profit (must have at least 1 session)
    const validDays = weekdayStats.filter((d) => d.daysCount > 0);
    const bestDay = validDays.length > 0 
      ? [...validDays].sort((a, b) => b.totalNet - a.totalNet)[0] 
      : null;
    const weakestDay = validDays.length > 0 
      ? [...validDays].sort((a, b) => a.totalNet - b.totalNet)[0] 
      : null;

    // Weekday vs Weekend aggregation
    const weekdayGroup = weekdayStats.filter((d) => !d.isWeekend);
    const weekendGroup = weekdayStats.filter((d) => d.isWeekend);

    const weekdayNet = weekdayGroup.reduce((a, b) => a + b.totalNet, 0);
    const weekdayDays = weekdayGroup.reduce((a, b) => a + b.daysCount, 0);
    const weekdayAvg = weekdayDays > 0 ? weekdayNet / weekdayDays : 0;

    const weekendNet = weekendGroup.reduce((a, b) => a + b.totalNet, 0);
    const weekendDays = weekendGroup.reduce((a, b) => a + b.daysCount, 0);
    const weekendAvg = weekendDays > 0 ? weekendNet / weekendDays : 0;

    return {
      totalDays,
      totalNet,
      winningDays,
      losingDays,
      avgNetPerDay,
      bestDay,
      weakestDay,
      weekdayNet,
      weekdayDays,
      weekdayAvg,
      weekendNet,
      weekendDays,
      weekendAvg,
    };
  }, [sessions, weekdayStats]);

  // Metric value helper based on active view mode
  const getMetricValue = (d: DayStat) => {
    if (metricMode === 'total') return d.totalNet;
    if (metricMode === 'avg') return d.avgProfitPerDay;
    return d.winrateBB100;
  };

  const metricLabel = {
    total: 'Ganancia Neta Total ($)',
    avg: 'Promedio por Día ($/día)',
    winrate: 'Winrate Medio (bb/100)',
  }[metricMode];

  // SVG Chart Dimensions & Scale calculations
  const values = weekdayStats.map(getMetricValue);
  const maxVal = Math.max(...values, 10);
  const minVal = Math.min(...values, -10);
  const absMax = Math.max(Math.abs(maxVal), Math.abs(minVal), 20);

  const svgWidth = 760;
  const svgHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const zeroY = paddingTop + (chartHeight * absMax) / (2 * absMax); // Middle zero line

  const barSlotWidth = chartWidth / 7;
  const barWidth = 46;

  return (
    <div className="flex flex-col bg-[#131b2e] rounded-xl border border-[rgba(255,255,255,0.08)] p-5 shadow-sm space-y-4">
      {/* Header with Title & Metric Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[rgba(255,255,255,0.08)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#10b981]">calendar_view_week</span>
            <h3 className="text-[16px] font-bold text-[#f8fafc] tracking-tight font-sans">
              Rentabilidad por Días de la Semana
            </h3>
            <span className="px-2 py-0.5 rounded bg-[#050507] text-[#10b981] font-mono text-[10px] font-bold border border-[#10b981]/20">
              REGISTRO DIARIO
            </span>
          </div>
          <p className="text-[11px] text-[#64748b] font-mono mt-0.5">
            Análisis consolidado día a día (Lunes a Domingo) para {overallStats.totalDays} días de juego registrados
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] text-[11px] font-mono self-start md:self-auto">
          <button
            type="button"
            onClick={() => setMetricMode('total')}
            className={`px-3 py-1 rounded-md transition-all font-semibold ${
              metricMode === 'total'
                ? 'bg-[#10b981] text-[#050507] shadow-sm'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            Ganancia Total ($)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('avg')}
            className={`px-3 py-1 rounded-md transition-all font-semibold ${
              metricMode === 'avg'
                ? 'bg-[#38bdf8] text-[#050507] shadow-sm'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            Promedio / Día ($)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('winrate')}
            className={`px-3 py-1 rounded-md transition-all font-semibold ${
              metricMode === 'winrate'
                ? 'bg-[#a855f7] text-[#050507] shadow-sm'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            Winrate (bb/100)
          </button>
        </div>
      </div>

      {/* Top 4 Daily KPIs Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* KPI 1: Mejor Día */}
        <div className="p-3 rounded-lg bg-[#050507] border border-[#10b981]/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase">
            <span>Día Más Rentable</span>
            <span className="material-symbols-outlined text-[14px] text-[#10b981]">workspace_premium</span>
          </div>
          <div className="my-1.5">
            <span className="text-[17px] font-bold text-[#10b981] font-sans">
              {overallStats.bestDay?.name || 'N/A'}
            </span>
            <div className="text-[11px] text-[#f8fafc] font-bold tabular-nums">
              {overallStats.bestDay && overallStats.bestDay.totalNet >= 0 ? '+' : ''}
              ${overallStats.bestDay?.totalNet.toFixed(2) || '0.00'} USD
            </div>
          </div>
          <span className="text-[9px] text-[#64748b]">
            {overallStats.bestDay?.daysCount || 0} días • {overallStats.bestDay?.avgProfitPerDay ? `+$${overallStats.bestDay.avgProfitPerDay.toFixed(2)}/día` : '$0'}
          </span>
        </div>

        {/* KPI 2: Promedio Diario */}
        <div className="p-3 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase">
            <span>Promedio por Día Jugado</span>
            <span className="material-symbols-outlined text-[14px] text-[#38bdf8]">trending_up</span>
          </div>
          <div className="my-1.5">
            <span className={`text-[17px] font-bold tabular-nums ${overallStats.avgNetPerDay >= 0 ? 'text-[#38bdf8]' : 'text-[#ef4444]'}`}>
              {overallStats.avgNetPerDay >= 0 ? '+' : ''}${overallStats.avgNetPerDay.toFixed(2)}
            </span>
            <span className="text-[10px] text-[#64748b] ml-1">/ día</span>
          </div>
          <span className="text-[9px] text-[#64748b]">
            Total neto: {overallStats.totalNet >= 0 ? '+' : ''}${overallStats.totalNet.toFixed(2)} USD
          </span>
        </div>

        {/* KPI 3: Consistencia de Días Ganadores */}
        <div className="p-3 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase">
            <span>Efectividad de Días</span>
            <span className="material-symbols-outlined text-[14px] text-[#10b981]">check_circle</span>
          </div>
          <div className="my-1.5">
            <span className="text-[17px] font-bold text-[#f8fafc] tabular-nums">
              {overallStats.totalDays > 0 ? ((overallStats.winningDays / overallStats.totalDays) * 100).toFixed(0) : 0}%
            </span>
            <span className="text-[10px] text-[#10b981] ml-1 font-bold">días positivos</span>
          </div>
          <span className="text-[9px] text-[#64748b]">
            {overallStats.winningDays} en verde • {overallStats.losingDays} en rojo
          </span>
        </div>

        {/* KPI 4: Laborables vs Fin de Semana */}
        <div className="p-3 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase">
            <span>Lun-Vie vs Fin de Semana</span>
            <span className="material-symbols-outlined text-[14px] text-[#eab308]">date_range</span>
          </div>
          <div className="my-1.5 flex items-baseline justify-between text-[11px]">
            <div>
              <span className="text-[#94a3b8] text-[9px] block">Laborables:</span>
              <span className={`font-bold tabular-nums ${overallStats.weekdayNet >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {overallStats.weekdayNet >= 0 ? '+' : ''}${overallStats.weekdayNet.toFixed(1)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#94a3b8] text-[9px] block">Fin de semana:</span>
              <span className={`font-bold tabular-nums ${overallStats.weekendNet >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {overallStats.weekendNet >= 0 ? '+' : ''}${overallStats.weekendNet.toFixed(1)}
              </span>
            </div>
          </div>
          <span className="text-[9px] text-[#64748b]">
            FDS avg: {overallStats.weekendAvg >= 0 ? '+' : ''}${overallStats.weekendAvg.toFixed(1)}/día
          </span>
        </div>
      </div>

      {/* SVG Daily Chart */}
      <div className="relative p-3 rounded-xl bg-[#050507] border border-[rgba(255,255,255,0.08)] overflow-hidden">
        <div className="flex items-center justify-between mb-2 text-[11px] font-mono text-[#64748b]">
          <span>Métrica activa: <strong className="text-[#f8fafc]">{metricLabel}</strong></span>
          <span className="text-[10px]">Pasa el cursor sobre un día para ver su desglose</span>
        </div>

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none overflow-visible"
        >
          {/* Grid lines */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={svgWidth - paddingRight}
            y2={paddingTop}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingLeft}
            y1={zeroY}
            x2={svgWidth - paddingRight}
            y2={zeroY}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.5"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={svgWidth - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="3 3"
          />

          {/* Y Axis Labels */}
          <text
            x={paddingLeft - 8}
            y={paddingTop + 4}
            fill="#64748b"
            fontSize="9"
            fontFamily="JetBrains Mono"
            textAnchor="end"
          >
            +{absMax.toFixed(0)}{metricMode === 'winrate' ? 'bb' : '$'}
          </text>
          <text
            x={paddingLeft - 8}
            y={zeroY + 3}
            fill="#94a3b8"
            fontSize="9"
            fontFamily="JetBrains Mono"
            textAnchor="end"
            fontWeight="bold"
          >
            0
          </text>
          <text
            x={paddingLeft - 8}
            y={paddingTop + chartHeight}
            fill="#64748b"
            fontSize="9"
            fontFamily="JetBrains Mono"
            textAnchor="end"
          >
            -{absMax.toFixed(0)}{metricMode === 'winrate' ? 'bb' : '$'}
          </text>

          {/* 7 Day Bars */}
          {weekdayStats.map((d, idx) => {
            const val = getMetricValue(d);
            const isPositive = val >= 0;
            const isBest = d.dayIndex === overallStats.bestDay?.dayIndex && d.daysCount > 0;
            const isHovered = hoveredDay?.dayIndex === d.dayIndex;

            // X center position for this bar slot
            const xCenter = paddingLeft + idx * barSlotWidth + barSlotWidth / 2;
            const barX = xCenter - barWidth / 2;

            // Bar height relative to absMax
            const barHeight = Math.max(3, (Math.abs(val) / absMax) * (chartHeight / 2));
            const barY = isPositive ? zeroY - barHeight : zeroY;

            // Colors
            let fillColor = isPositive ? '#10b981' : '#ef4444';
            if (metricMode === 'avg' && isPositive) fillColor = '#38bdf8';
            if (metricMode === 'winrate' && isPositive) fillColor = '#a855f7';

            return (
              <g
                key={d.dayIndex}
                className="cursor-pointer transition-opacity duration-150"
                opacity={hoveredDay && !isHovered ? 0.45 : 1}
                onMouseEnter={() => setHoveredDay(d)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Background highlight on hover */}
                {isHovered && (
                  <rect
                    x={xCenter - barSlotWidth / 2 + 2}
                    y={paddingTop}
                    width={barSlotWidth - 4}
                    height={chartHeight + 25}
                    fill="rgba(255, 255, 255, 0.04)"
                    rx="6"
                  />
                )}

                {/* Best day star / badge */}
                {isBest && (
                  <g transform={`translate(${xCenter - 8}, ${paddingTop - 18})`}>
                    <text
                      x="8"
                      y="10"
                      fill="#eab308"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      ★
                    </text>
                  </g>
                )}

                {/* The Value Bar */}
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={fillColor}
                  rx="4"
                  opacity={isHovered ? 1 : 0.88}
                  stroke={isHovered ? '#ffffff' : 'none'}
                  strokeWidth="1.5"
                />

                {/* Value Label above/below bar */}
                <text
                  x={xCenter}
                  y={isPositive ? barY - 6 : barY + barHeight + 11}
                  fill={fillColor}
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {d.daysCount === 0 ? '—' : `${isPositive ? '+' : ''}${val.toFixed(metricMode === 'winrate' ? 1 : 1)}${metricMode === 'winrate' ? '' : '$'}`}
                </text>

                {/* Day of Week Label (X-Axis) */}
                <text
                  x={xCenter}
                  y={paddingTop + chartHeight + 20}
                  fill={isHovered ? '#f8fafc' : d.isWeekend ? '#38bdf8' : '#94a3b8'}
                  fontSize="11"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                  fontWeight={isHovered || isBest ? 'bold' : 'normal'}
                >
                  {d.shortName}
                </text>

                {/* Subtitle with days count */}
                <text
                  x={xCenter}
                  y={paddingTop + chartHeight + 32}
                  fill="#64748b"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  {d.daysCount} {d.daysCount === 1 ? 'día' : 'días'}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered Day Tooltip Box */}
        {hoveredDay && (
          <div className="mt-3 p-3 rounded-lg bg-[#131b2e] border border-[#10b981]/40 flex flex-wrap items-center justify-between gap-3 text-mono text-[11px] animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
              <span className="text-[#f8fafc] font-bold text-[13px] font-sans">
                {hoveredDay.name} {hoveredDay.isWeekend ? '(Fin de Semana)' : '(Día Laborable)'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#050507] text-[#64748b] text-[10px]">
                {hoveredDay.daysCount} días registrados
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[#94a3b8]">
              <div>
                Ganancia Mesa: <strong className={hoveredDay.directProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
                  {hoveredDay.directProfit >= 0 ? '+' : ''}${hoveredDay.directProfit.toFixed(2)}
                </strong>
              </div>
              <div>
                Rakeback: <strong className="text-[#38bdf8]">+${hoveredDay.rakeback.toFixed(2)}</strong>
              </div>
              <div>
                Neto Acumulado: <strong className={`font-bold ${hoveredDay.totalNet >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {hoveredDay.totalNet >= 0 ? '+' : ''}${hoveredDay.totalNet.toFixed(2)} USD
                </strong>
              </div>
              <div>
                Promedio/Día: <strong className="text-[#f8fafc]">
                  {hoveredDay.avgProfitPerDay >= 0 ? '+' : ''}${hoveredDay.avgProfitPerDay.toFixed(2)}/día
                </strong>
              </div>
              <div>
                Balance: <strong className="text-[#10b981]">{hoveredDay.winningDays}G</strong> - <strong className="text-[#ef4444]">{hoveredDay.losingDays}P</strong> ({hoveredDay.winDayPct.toFixed(0)}% victoria)
              </div>
              <div>
                Manos: <strong className="text-[#f8fafc]">{hoveredDay.totalHands.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7-Day Granular Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-mono">
        {weekdayStats.map((d) => {
          const isBest = d.dayIndex === overallStats.bestDay?.dayIndex && d.daysCount > 0;
          return (
            <div
              key={d.dayIndex}
              onClick={() => setHoveredDay(d)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                isBest
                  ? 'bg-[#064e3b]/15 border-[#10b981]/50 shadow-sm'
                  : 'bg-[#050507] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.18)]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className={`font-bold font-sans ${d.isWeekend ? 'text-[#38bdf8]' : 'text-[#f8fafc]'}`}>
                  {d.name}
                </span>
                {isBest && <span className="text-[10px] text-[#eab308]">★ Top</span>}
              </div>

              <div className="my-1.5">
                <div className={`text-[13px] font-bold tabular-nums ${d.totalNet >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {d.daysCount === 0 ? '$0.00' : `${d.totalNet >= 0 ? '+' : ''}$${d.totalNet.toFixed(2)}`}
                </div>
                <div className="text-[10px] text-[#64748b] mt-0.5">
                  {d.daysCount === 0 ? '0 días' : `${d.avgProfitPerDay >= 0 ? '+' : ''}$${d.avgProfitPerDay.toFixed(1)}/d`}
                </div>
              </div>

              <div className="pt-1.5 border-t border-[rgba(255,255,255,0.06)] text-[9px] text-[#64748b] flex items-center justify-between">
                <span>{d.daysCount} días</span>
                <span className={d.winDayPct >= 60 ? 'text-[#10b981]' : ''}>
                  {d.winDayPct.toFixed(0)}% W
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
