import React, { useState, useMemo } from 'react';
import { Session } from '../../types/poker';

interface ActivityHeatmapProps {
  sessions: Session[];
  dailyTarget?: number;
  onTargetChange?: (newTarget: number) => void;
}

interface DayData {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Mon, 6 = Sun
  hands: number;
  netProfit: number;
  rakeback: number;
  directProfit: number;
  durationMinutes: number;
  sessionCount: number;
  sessions: Session[];
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  sessions,
  dailyTarget = 2000,
  onTargetChange,
}) => {
  const [currentTarget, setCurrentTarget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('deeproll_daily_target');
      return saved ? parseInt(saved, 10) : dailyTarget;
    } catch {
      return dailyTarget;
    }
  });

  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [tempTarget, setTempTarget] = useState<string>(currentTarget.toString());

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(tempTarget, 10);
    if (!isNaN(val) && val > 0) {
      setCurrentTarget(val);
      localStorage.setItem('deeproll_daily_target', val.toString());
      if (onTargetChange) onTargetChange(val);
    }
    setIsEditingTarget(false);
  };

  // Helper to format Date to YYYY-MM-DD in local time
  const getLocalDateKey = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate calendar grid for the last 26 weeks (~6 months)
  const { weeks, stats, daysMap } = useMemo(() => {
    // Map sessions by day key
    const map = new Map<string, DayData>();

    sessions.forEach((s) => {
      const d = new Date(s.timestamp || Date.now());
      const key = getLocalDateKey(d);

      if (!map.has(key)) {
        map.set(key, {
          date: d,
          dateKey: key,
          dayOfWeek: (d.getDay() + 6) % 7, // Adjust so Monday = 0, Sunday = 6
          hands: 0,
          netProfit: 0,
          rakeback: 0,
          directProfit: 0,
          durationMinutes: 0,
          sessionCount: 0,
          sessions: [],
        });
      }

      const dayObj = map.get(key)!;
      dayObj.hands += s.hands;
      dayObj.netProfit += s.netProfit;
      dayObj.rakeback += s.rakeback;
      dayObj.directProfit += s.directProfit;
      dayObj.durationMinutes += s.durationMinutes;
      dayObj.sessionCount += 1;
      dayObj.sessions.push(s);
    });

    // Determine the end date (today) and start date (26 weeks ago, aligned with Monday)
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // 25 full previous weeks + current week = 26 weeks
    const todayDayOfWeek = (today.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (25 * 7 + todayDayOfWeek));
    startDate.setHours(0, 0, 0, 0);

    const generatedWeeks: DayData[][] = [];
    let currentWeek: DayData[] = [];
    let totalHands6M = 0;
    let daysWithPlay = 0;
    let daysTargetMet = 0;
    let totalProfit6M = 0;

    const curr = new Date(startDate);
    while (curr <= today) {
      const key = getLocalDateKey(curr);
      const existing = map.get(key);

      const dayData: DayData = existing || {
        date: new Date(curr),
        dateKey: key,
        dayOfWeek: (curr.getDay() + 6) % 7,
        hands: 0,
        netProfit: 0,
        rakeback: 0,
        directProfit: 0,
        durationMinutes: 0,
        sessionCount: 0,
        sessions: [],
      };

      if (dayData.hands > 0) {
        totalHands6M += dayData.hands;
        daysWithPlay += 1;
        totalProfit6M += dayData.netProfit;
        if (dayData.hands >= currentTarget) {
          daysTargetMet += 1;
        }
      }

      currentWeek.push(dayData);

      if (dayData.dayOfWeek === 6 || curr.getTime() >= today.getTime()) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }

      curr.setDate(curr.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      generatedWeeks.push(currentWeek);
    }

    return {
      weeks: generatedWeeks,
      daysMap: map,
      stats: {
        totalHands6M,
        daysWithPlay,
        daysTargetMet,
        totalProfit6M,
        complianceRate: daysWithPlay > 0 ? Math.round((daysTargetMet / daysWithPlay) * 100) : 0,
      },
    };
  }, [sessions, currentTarget]);

  // Color intensity based on hands played vs target
  const getCellColor = (hands: number) => {
    if (hands === 0) return 'bg-white/[0.04] hover:bg-white/[0.1]';
    const ratio = hands / currentTarget;
    if (ratio < 0.4) return 'bg-[#0e4429] hover:bg-[#135a37]'; // Verde oscuro suave
    if (ratio < 0.75) return 'bg-[#006d32] hover:bg-[#00873d]'; // Verde medio
    if (ratio < 1.1) return 'bg-[#26a641] hover:bg-[#2dc04c]'; // Verde objetivo cumplido
    return 'bg-[#39d353] hover:bg-[#4ae365]'; // Verde intenso / superado
  };

  const dayLabels = ['Lun', 'Mié', 'Vie', 'Dom'];

  return (
    <div className="flex flex-col bg-[#111218] rounded-2xl border border-white/[0.06] p-6 gap-5 select-none">
      {/* Header: Title, Target Config and Quick Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#34d399] text-[20px]">calendar_month</span>
            <h3 className="font-sans text-[15px] font-semibold text-zinc-100 tracking-tight">
              Actividad &amp; Volumen de Manos (Últimos 6 Meses)
            </h3>
          </div>
          <p className="text-[12px] text-zinc-500 font-sans mt-0.5">
            Registro diario de constancia estilo GitHub. Haz clic en cualquier día para ver la sesión.
          </p>
        </div>

        {/* Daily Target Setting */}
        <div className="flex items-center gap-3">
          {isEditingTarget ? (
            <form onSubmit={handleSaveTarget} className="flex items-center gap-2">
              <span className="text-[12px] text-zinc-400 font-sans">Meta:</span>
              <input
                type="number"
                step="100"
                min="100"
                value={tempTarget}
                onChange={(e) => setTempTarget(e.target.value)}
                className="w-24 px-2 py-1 bg-white/[0.06] border border-white/[0.12] rounded-lg text-zinc-100 font-mono text-[12px] font-bold outline-none focus:border-[#34d399]"
                autoFocus
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-[#10b981] hover:bg-[#059669] text-[#090a0f] font-sans font-semibold rounded-lg text-[11px] cursor-pointer"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTarget(false)}
                className="px-2 py-1 text-zinc-400 hover:text-zinc-200 text-[11px] cursor-pointer"
              >
                Cancelar
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.06]">
              <span className="text-[11px] text-zinc-400 font-sans">Objetivo diario:</span>
              <span className="font-mono text-[12px] font-bold text-zinc-100">
                {currentTarget.toLocaleString()} manos
              </span>
              <button
                type="button"
                onClick={() => {
                  setTempTarget(currentTarget.toString());
                  setIsEditingTarget(true);
                }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 ml-1 cursor-pointer"
                title="Cambiar objetivo diario de manos"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Grid & Day-of-week labels */}
      <div className="flex items-start gap-2.5 overflow-x-auto pb-2">
        {/* Day-of-week indicator labels */}
        <div className="flex flex-col justify-between h-[106px] text-[10px] text-zinc-500 font-sans pr-1 select-none">
          <span>Lun</span>
          <span>Mié</span>
          <span>Vie</span>
          <span>Dom</span>
        </div>

        {/* 26 Weeks Columns */}
        <div className="flex gap-1.5">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => {
                const isSelected = selectedDay?.dateKey === day.dateKey;
                const hasProfit = day.netProfit > 0;
                const hasLoss = day.netProfit < 0;

                return (
                  <div
                    key={day.dateKey}
                    onClick={() => {
                      if (day.hands > 0) {
                        setSelectedDay(day);
                      }
                    }}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-3.5 h-3.5 rounded-sm transition-all relative ${getCellColor(
                      day.hands
                    )} ${
                      day.hands > 0 ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isSelected
                        ? 'ring-2 ring-white scale-110 z-10'
                        : ''
                    }`}
                  >
                    {/* Small financial outcome dot indicator */}
                    {day.hands > 0 && (
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-1 h-1 rounded-full ${
                          hasProfit ? 'bg-[#34d399]' : hasLoss ? 'bg-[#fb7185]' : 'bg-zinc-400'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend & Summary Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/[0.04] text-[11px] font-sans">
        <div className="flex items-center gap-4 text-zinc-400">
          <span>
            Total 6M:{' '}
            <strong className="text-zinc-100 font-mono">
              {stats.totalHands6M.toLocaleString()} manos
            </strong>
          </span>
          <span>•</span>
          <span>
            Días jugados:{' '}
            <strong className="text-zinc-100 font-mono">{stats.daysWithPlay} días</strong>
          </span>
          <span>•</span>
          <span>
            Meta alcanzada:{' '}
            <strong className="text-[#34d399] font-mono font-bold">
              {stats.daysTargetMet} ({stats.complianceRate}%)
            </strong>
          </span>
        </div>

        {/* Intensity Legend */}
        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
          <span>Menos</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-white/[0.04]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#0e4429]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#006d32]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#26a641]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#39d353]" />
          <span>Más de {currentTarget.toLocaleString()}</span>
        </div>
      </div>

      {/* Interactive Floating Hover Info / Click Details */}
      {(hoveredDay && hoveredDay.hands > 0) || selectedDay ? (
        (() => {
          const active = selectedDay || hoveredDay;
          if (!active || active.hands === 0) return null;

          const hours = (active.durationMinutes / 60).toFixed(1);
          const winrate = active.hands > 0 && active.sessions[0]?.bb
            ? (active.directProfit / active.sessions[0].bb / (active.hands / 100)).toFixed(1)
            : '0.0';

          return (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-[14px] ${
                    active.netProfit >= 0 ? 'bg-[#34d399]/10 text-[#34d399]' : 'bg-[#fb7185]/10 text-[#fb7185]'
                  }`}
                >
                  {active.netProfit >= 0 ? '+' : '-'}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-100 font-sans font-semibold text-[13px]">
                      {active.date.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="font-mono text-[12px] text-zinc-300">
                      {active.hands.toLocaleString()} manos ({Math.round((active.hands / currentTarget) * 100)}% de la meta)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-sans">
                    {active.durationMinutes > 0 ? `${hours} horas jugadas` : 'Sin duración'} • {active.sessionCount} sesión
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-[12px] font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-sans">Ganancia Neta</span>
                  <span
                    className={`font-bold tabular-nums text-[14px] ${
                      active.netProfit >= 0 ? 'text-[#34d399]' : 'text-[#fb7185]'
                    }`}
                  >
                    {active.netProfit >= 0 ? `+$${active.netProfit.toFixed(2)}` : `-$${Math.abs(active.netProfit).toFixed(2)}`}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-sans">Fish Buffet</span>
                  <span className="text-zinc-300 font-bold tabular-nums">
                    +${active.rakeback.toFixed(2)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-sans">Winrate Mesa</span>
                  <span
                    className={`font-bold tabular-nums ${
                      parseFloat(winrate) >= 0 ? 'text-zinc-200' : 'text-[#fb7185]'
                    }`}
                  >
                    {parseFloat(winrate) >= 0 ? `+${winrate}` : winrate} bb
                  </span>
                </div>

                {selectedDay && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="p-1 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    title="Cerrar detalle"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()
      ) : null}
    </div>
  );
};
