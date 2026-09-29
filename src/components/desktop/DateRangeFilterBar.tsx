import React from 'react';

export type DateRangePreset = 'all' | '7d' | '14d' | '30d' | 'custom';

export interface DateRangeFilterProps {
  preset: DateRangePreset;
  onSelectPreset: (preset: DateRangePreset) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onReset: () => void;
  totalSessionsCount: number;
  filteredSessionsCount: number;
  filteredHands: number;
  filteredProfit: number;
}

export const DateRangeFilterBar: React.FC<DateRangeFilterProps> = ({
  preset,
  onSelectPreset,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
  totalSessionsCount,
  filteredSessionsCount,
  filteredHands,
  filteredProfit,
}) => {
  const isFiltered = preset !== 'all';
  const presets: { id: DateRangePreset; label: string }[] = [
    { id: 'all', label: 'Todo el historial' },
    { id: '7d', label: 'Últimos 7 días' },
    { id: '14d', label: 'Últimos 14 días' },
    { id: '30d', label: 'Últimos 30 días' },
    { id: 'custom', label: 'Personalizado' },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#0a1020] rounded-xl border border-[rgba(255,255,255,0.1)] shadow-inner font-mono text-[12px]">
      {/* Top row: Label + Presets + Filtered badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#38bdf8] text-[18px]">date_range</span>
          <span className="font-sans font-bold text-[#f8fafc] text-[13px] tracking-tight">
            Rango de Fechas
          </span>
          <span className="text-[#64748b] text-[11px]">•</span>
          <span className="text-[11px] text-[#94a3b8]">Filtrado dinámico de auditoría</span>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 bg-[#050507] p-1 rounded-lg border border-[rgba(255,255,255,0.08)]">
          {presets.map((p) => {
            const isActive = preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPreset(p.id)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1e293b] text-[#38bdf8] border border-[rgba(255,255,255,0.14)] shadow-sm'
                    : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#131b2e]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Second row: Custom Date Pickers & Summary Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
        {/* Custom Date Pickers (visible if custom or always convenient) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#050507] px-2.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)]">
            <span className="text-[10px] text-[#64748b] uppercase font-semibold">Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                onStartDateChange(e.target.value);
                if (preset !== 'custom') onSelectPreset('custom');
              }}
              className="bg-transparent text-[#f8fafc] text-[11px] font-mono outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#050507] px-2.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)]">
            <span className="text-[10px] text-[#64748b] uppercase font-semibold">Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                onEndDateChange(e.target.value);
                if (preset !== 'custom') onSelectPreset('custom');
              }}
              className="bg-transparent text-[#f8fafc] text-[11px] font-mono outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#2e3b52] text-[#94a3b8] hover:text-[#f8fafc] text-[11px] transition-colors cursor-pointer border border-[rgba(255,255,255,0.08)]"
              title="Restablecer filtro a todo el historial"
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              <span>Restablecer</span>
            </button>
          )}
        </div>

        {/* Live Filter Indicator Metrics */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#050507] border border-[rgba(255,255,255,0.08)]">
            <span className="text-[#64748b]">Sesiones:</span>
            <span className="text-[#38bdf8] font-bold tabular-nums">
              {filteredSessionsCount} / {totalSessionsCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#050507] border border-[rgba(255,255,255,0.08)]">
            <span className="text-[#64748b]">Muestra:</span>
            <span className="text-[#f8fafc] font-bold tabular-nums">
              {filteredHands.toLocaleString()} manos
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#050507] border border-[rgba(255,255,255,0.08)]">
            <span className="text-[#64748b]">Neto Periodo:</span>
            <span
              className={`font-bold tabular-nums ${
                filteredProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
              }`}
            >
              {filteredProfit >= 0 ? `+$${filteredProfit.toFixed(2)}` : `-$${Math.abs(filteredProfit).toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
