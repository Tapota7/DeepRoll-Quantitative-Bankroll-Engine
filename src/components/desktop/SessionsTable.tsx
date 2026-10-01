import React, { useState } from 'react';
import { Session } from '../../types/poker';
import { DateRangeFilterBar, DateRangePreset } from './DateRangeFilterBar';

interface SessionsTableProps {
  sessions: Session[];
  totalSessionsCount?: number;
  onEditSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
  dateRangePreset?: DateRangePreset;
  onSelectDatePreset?: (preset: DateRangePreset) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (val: string) => void;
  onEndDateChange?: (val: string) => void;
  onResetDateFilter?: () => void;
}

export const SessionsTable: React.FC<SessionsTableProps> = ({
  sessions,
  totalSessionsCount = sessions.length,
  onEditSession,
  onDeleteSession,
  dateRangePreset = 'all',
  onSelectDatePreset,
  startDate = '',
  endDate = '',
  onStartDateChange,
  onEndDateChange,
  onResetDateFilter,
}) => {
  const [sortOrder, setSortOrder] = useState<string>('recent');
  const [showAll, setShowAll] = useState<boolean>(true);

  // Sorting
  const sortedSessions = [...sessions].sort((a, b) => {
    if (sortOrder === 'profit') return b.netProfit - a.netProfit;
    if (sortOrder === 'winrate') return b.winrateBB100 - a.winrateBB100;
    if (sortOrder === 'hands') return b.hands - a.hands;
    return b.timestamp - a.timestamp;
  });

  const displaySessions = showAll ? sortedSessions : sortedSessions.slice(0, 5);

  // Summary calculations for the displayed sessions
  const totalHands = sessions.reduce((acc, s) => acc + s.hands, 0);
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalDirect = sessions.reduce((acc, s) => acc + s.directProfit, 0);
  const totalRakeback = sessions.reduce((acc, s) => acc + s.rakeback, 0);
  const totalNet = sessions.reduce((acc, s) => acc + s.netProfit, 0);
  const totalCajas = sessions.reduce((acc, s) => acc + s.cajasImpact, 0);
  const weightedWinrate =
    totalHands > 0
      ? (
          sessions.reduce((acc, s) => acc + (s.directProfit / s.bb), 0) /
          (totalHands / 100)
        ).toFixed(1)
      : '0.0';

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col bg-[#111218] rounded-2xl border border-white/[0.06] p-6 shadow-sm gap-4">
      {/* Table Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-[#34d399]">receipt_long</span>
          <div>
            <h3 className="text-[15px] font-semibold text-zinc-100 tracking-tight font-sans">
              Auditoría y Registro de Sesiones
            </h3>
            <p className="text-[12px] text-zinc-500 font-sans">
              {sessions.length === totalSessionsCount
                ? `Mostrando las ${sessions.length} sesiones registradas en GGPoker`
                : `Filtro temporal activo: ${sessions.length} de ${totalSessionsCount} sesiones en el rango seleccionado`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.06] transition-colors cursor-pointer"
          >
            {showAll ? 'Ver solo 5 recientes' : `Ver todas (${sessions.length})`}
          </button>

          <span className="text-zinc-500 font-sans">Ordenar:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-[#090a0f] border border-white/[0.08] text-zinc-200 px-2.5 py-1 rounded-lg outline-none cursor-pointer hover:border-white/[0.15]"
          >
            <option value="recent">Más reciente primero</option>
            <option value="profit">Mayor beneficio ($)</option>
            <option value="winrate">Mayor winrate (bb/100)</option>
            <option value="hands">Mayor volumen (manos)</option>
          </select>
        </div>
      </div>

      {/* Date Range Selector at the top of the panel */}
      {onSelectDatePreset && onStartDateChange && onEndDateChange && onResetDateFilter && (
        <DateRangeFilterBar
          preset={dateRangePreset}
          onSelectPreset={onSelectDatePreset}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          onReset={onResetDateFilter}
          totalSessionsCount={totalSessionsCount}
          filteredSessionsCount={sessions.length}
          filteredHands={totalHands}
          filteredProfit={totalNet}
        />
      )}

      {/* Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-[12px]">
          <thead>
            <tr className="bg-[#090a0f] text-zinc-500 text-[10px] tracking-wider uppercase border-b border-white/[0.06]">
              <th className="py-2.5 px-3"># ID</th>
              <th className="py-2.5 px-3">Fecha / Día</th>
              <th className="py-2.5 px-3">Operador</th>
              <th className="py-2.5 px-3">Nivel</th>
              <th className="py-2.5 px-3 text-right">Manos</th>
              <th className="py-2.5 px-3 text-right">Duración</th>
              <th className="py-2.5 px-3 text-right">Ganancia Mesa</th>
              <th className="py-2.5 px-3 text-right">Rakeback</th>
              <th className="py-2.5 px-3 text-right">Resultado Neto</th>
              <th className="py-2.5 px-3 text-right">Impacto Cajas</th>
              <th className="py-2.5 px-3 text-right">Winrate</th>
              <th className="py-2.5 px-3">Notas</th>
              <th className="py-2.5 px-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {displaySessions.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-8 text-center text-[#64748b] font-mono">
                  No se encontraron sesiones en el rango de fechas seleccionado.
                </td>
              </tr>
            ) : (
              displaySessions.map((session) => {
                const isNetPositive = session.netProfit >= 0;
                const isDirectPositive = session.directProfit >= 0;
                const isATH = session.isATH;

                return (
                  <tr
                    key={session.id}
                    className={`hover:bg-[#1e293b]/60 transition-colors ${
                      isATH ? 'bg-[#064e3b]/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-[#94a3b8]">{session.id}</td>
                    <td className="py-2.5 px-3 text-[#f8fafc] whitespace-nowrap">{session.date}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1.5 text-[#f8fafc] font-semibold text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                        GGPoker
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#050507] text-[#38bdf8] text-[10px] font-bold border border-[rgba(255,255,255,0.08)]">
                        {session.stake}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#f8fafc] tabular-nums">
                      {session.hands.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#64748b] tabular-nums">
                      {session.durationFormatted}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                        isDirectPositive ? 'text-[#10b981]' : 'text-[#ef4444]'
                      }`}
                    >
                      {isDirectPositive ? `+$${session.directProfit.toFixed(2)}` : `-$${Math.abs(session.directProfit).toFixed(2)}`}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#ffb95f] font-semibold tabular-nums">
                      +${session.rakeback.toFixed(2)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                        isNetPositive ? 'text-[#10b981]' : 'text-[#ef4444]'
                      }`}
                    >
                      {isNetPositive ? `+$${session.netProfit.toFixed(2)}` : `-$${Math.abs(session.netProfit).toFixed(2)}`}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-semibold tabular-nums ${
                        session.cajasImpact >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
                      }`}
                    >
                      {session.cajasImpact >= 0 ? `+${session.cajasImpact.toFixed(2)} cx` : `${session.cajasImpact.toFixed(2)} cx`}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                        session.winrateBB100 >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
                      }`}
                    >
                      {session.winrateBB100 >= 0
                        ? `+${session.winrateBB100.toFixed(1)} bb/100`
                        : `${session.winrateBB100.toFixed(1)} bb/100`}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                        {isATH && (
                          <span className="px-1.5 py-0.2 rounded bg-[#064e3b] text-[#10b981] text-[9px] font-bold">
                            ATH
                          </span>
                        )}
                        <span className="text-[#64748b] text-[11px] truncate">{session.notes}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditSession(session)}
                          className="p-1 rounded text-[#94a3b8] hover:text-[#38bdf8] hover:bg-[#1e293b] transition-colors cursor-pointer"
                          title="Editar metadatos de sesión"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteSession(session)}
                          className="p-1 rounded text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#1e293b] transition-colors cursor-pointer"
                          title="Eliminar sesión con recálculo"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Summary Footer */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-zinc-400 font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 uppercase">
            Subtotal {sessions.length} {sessions.length === 1 ? 'Día' : 'Días'} en Filtro:
          </span>
          <span className="text-zinc-100 font-bold">
            {totalHands.toLocaleString()} manos registradas
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>
            Ganancia Mesa:{' '}
            <strong className={`font-bold tabular-nums ${totalDirect >= 0 ? 'text-[#34d399]' : 'text-[#fb7185]'}`}>
              {totalDirect >= 0 ? `+$${totalDirect.toFixed(2)}` : `-$${Math.abs(totalDirect).toFixed(2)}`}
            </strong>
          </span>
          <span>
            Rakeback: <strong className="text-[#fbbf24] font-bold">+${totalRakeback.toFixed(2)}</strong>
          </span>
          <span>
            Resultado neto:{' '}
            <strong className={`font-bold tabular-nums ${totalNet >= 0 ? 'text-[#34d399]' : 'text-[#fb7185]'}`}>
              {totalNet >= 0 ? `+$${totalNet.toFixed(2)}` : `-$${Math.abs(totalNet).toFixed(2)}`} ({totalCajas >= 0 ? `+${totalCajas.toFixed(2)}` : totalCajas.toFixed(2)} cx)
            </strong>
          </span>
          <span>
            Winrate: <strong className="text-[#34d399] font-bold">+{weightedWinrate} bb/100</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
