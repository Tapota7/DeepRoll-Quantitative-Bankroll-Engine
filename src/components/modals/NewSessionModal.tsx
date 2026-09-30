import React from 'react';
import { Session } from '../../types/poker';
import { useSessionForm } from '../../hooks/useSessionForm';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (newSession: Session) => void;
  nextSessionNumber: number;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  isOpen,
  onClose,
  onSaveSession,
  nextSessionNumber,
}) => {
  const { state, actions, refs } = useSessionForm({
    isOpen,
    nextSessionNumber,
    onSaveSession,
    onClose,
  });

  if (!isOpen) return null;

  const { stake, hands, durationMinutes, directProfit, rakeback, notes, metrics } = state;
  const {
    setStake,
    setHands,
    setDurationMinutes,
    setDirectProfit,
    setRakeback,
    setNotes,
    handleSubmit,
  } = actions;

  const durationPresets = [60, 90, 120, 180];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#131b2e] rounded-xl border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col overflow-hidden text-[#dae2fd] font-mono">
        {/* Header */}
        <div className="p-4 bg-[#050507]/90 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#10b981] text-[22px]">add_circle</span>
            <div>
              <h3 className="font-sans text-[17px] font-bold text-[#f8fafc] leading-tight">
                Registrar Nueva Sesión #{String(nextSessionNumber).padStart(3, '0')}
              </h3>
              <p className="text-[10px] text-[#64748b]">Carga rápida con atajos • 1 sesión consolidada por día</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors p-1 rounded-md hover:bg-[#1e293b] cursor-pointer"
            type="button"
            title="Cerrar (Esc)"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form
          ref={refs.formRef}
          onSubmit={handleSubmit}
          data-toolname="register_poker_session"
          data-tooldescription="Registra y concilia una nueva sesión de poker en el ledger de DeepRoll con métricas cuantitativas"
          className="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto text-[12px]"
        >
          {/* Operador (GGPoker único) y Stake */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">Operador</label>
              <div className="bg-[#050507] p-2.5 rounded-lg border border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                  <span className="text-[#f8fafc] font-bold">GGPoker</span>
                </div>
                <span className="text-[10px] text-[#10b981] bg-[#064e3b]/40 px-2 py-0.5 rounded font-mono">
                  EXCLUSIVO
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">
                Nivel / Stake ({metrics.buyinCaja}$/cx)
              </label>
              <select
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                data-toolparam="stake"
                className="bg-[#050507] p-2.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#f8fafc] outline-none cursor-pointer focus:border-[#10b981] transition-colors"
              >
                <option value="NL5 Deep">NL5 Deep ($0.02/$0.05) • $5/cx</option>
                <option value="NL10 Deep">NL10 Deep ($0.05/$0.10) • $10/cx</option>
                <option value="NL25 Deep">NL25 Deep ($0.10/$0.25) • $25/cx</option>
                <option value="NL50 Deep">NL50 Deep ($0.25/$0.50) • $50/cx</option>
              </select>
            </div>
          </div>

          {/* Manos Jugadas y Duración */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">
                Manos Jugadas <span className="text-[#38bdf8]">*</span>
              </label>
              <div className="flex items-center bg-[#050507] rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 focus-within:border-[#38bdf8] transition-colors">
                <span className="material-symbols-outlined text-[#38bdf8] text-[18px] mr-2">casino</span>
                <input
                  ref={refs.firstInputRef}
                  type="number"
                  min="1"
                  step="1"
                  value={hands || ''}
                  onChange={(e) => setHands(parseInt(e.target.value, 10) || 0)}
                  onFocus={(e) => e.target.select()}
                  data-toolparam="hands"
                  className="w-full bg-transparent text-[#f8fafc] outline-none font-bold text-[13px] tabular-nums"
                  placeholder="Ej: 1200"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">
                  Duración ({metrics.durationFormatted})
                </label>
              </div>
              <div className="flex items-center bg-[#050507] rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 focus-within:border-[#64748b] transition-colors">
                <span className="material-symbols-outlined text-[#64748b] text-[18px] mr-2">timer</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={durationMinutes || ''}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
                  onFocus={(e) => e.target.select()}
                  data-toolparam="durationMinutes"
                  className="w-full bg-transparent text-[#f8fafc] outline-none font-bold text-[13px] tabular-nums"
                  placeholder="Minutos (ej: 120)"
                  required
                />
              </div>
              {/* Presets de duración para carga en 1 click */}
              <div className="flex items-center gap-1.5 mt-1">
                {durationPresets.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      durationMinutes === mins
                        ? 'bg-[#1e293b] text-[#38bdf8] border border-[#38bdf8]/40'
                        : 'bg-[#050507] text-[#64748b] hover:text-[#f8fafc]'
                    }`}
                  >
                    {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ganancia de la Mesa & Rakeback */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">
                  Ganancia en Mesa ($)
                </label>
                <span className="text-[9px] text-[#64748b]">± USD Directo</span>
              </div>
              <div className="flex items-center bg-[#050507] rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 focus-within:border-[#10b981] transition-colors">
                <span className={`text-[15px] font-bold mr-1.5 ${directProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={Number.isNaN(directProfit) ? '' : directProfit}
                  onChange={(e) => setDirectProfit(parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  data-toolparam="directProfitUSD"
                  className={`w-full bg-transparent outline-none font-bold text-[15px] tabular-nums ${
                    directProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
                  }`}
                  placeholder="Ej: 28.50 o -15.00"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">
                  Rakeback ($)
                </label>
                <span className="text-[9px] text-[#ffb95f]">Fish Buffet</span>
              </div>
              <div className="flex items-center bg-[#050507] rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 focus-within:border-[#ffb95f] transition-colors">
                <span className="text-[#ffb95f] text-[15px] font-bold mr-1.5">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={Number.isNaN(rakeback) ? '' : rakeback}
                  onChange={(e) => setRakeback(parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  data-toolparam="rakebackUSD"
                  className="w-full bg-transparent text-[#ffb95f] outline-none font-bold text-[15px] tabular-nums"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Resumen Calculado en Vivo con Métricas Desacopladas */}
          <div className="p-3.5 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] grid grid-cols-3 gap-2">
            <div>
              <span className="text-[9px] text-[#64748b] uppercase block">Resultado Neto</span>
              <span className={`text-[15px] font-bold tabular-nums ${metrics.netProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {metrics.netProfit >= 0 ? `+$${metrics.netProfit.toFixed(2)}` : `-$${Math.abs(metrics.netProfit).toFixed(2)}`}
              </span>
              {rakeback > 0 && (
                <span className="text-[9px] text-[#ffb95f] block">
                  incl. +${rakeback.toFixed(2)} RB
                </span>
              )}
            </div>
            <div>
              <span className="text-[9px] text-[#64748b] uppercase block">Impacto Cajas</span>
              <span className={`text-[15px] font-bold tabular-nums ${metrics.cajasImpact >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {metrics.cajasImpact >= 0 ? `+${metrics.cajasImpact.toFixed(2)} cx` : `${metrics.cajasImpact.toFixed(2)} cx`}
              </span>
              <span className="text-[9px] text-[#64748b] block">
                base ${metrics.buyinCaja} / caja
              </span>
            </div>
            <div>
              <span className="text-[9px] text-[#64748b] uppercase block">Winrate Mesa</span>
              <span className={`text-[15px] font-bold tabular-nums ${metrics.winrateBB100 >= 0 ? 'text-[#38bdf8]' : 'text-[#ef4444]'}`}>
                {metrics.winrateBB100 >= 0 ? `+${metrics.winrateBB100.toFixed(1)}` : metrics.winrateBB100.toFixed(1)} bb/100
              </span>
              <span className="text-[9px] text-[#64748b] block">
                {metrics.hourlyProfitUSD >= 0 ? `+$${metrics.hourlyProfitUSD.toFixed(1)}/h` : `-$${Math.abs(metrics.hourlyProfitUSD).toFixed(1)}/h`}
              </span>
            </div>
          </div>

          {/* Notas de la Sesión */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">Notas de la Sesión</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-toolparam="notes"
              className="bg-[#050507] p-2.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#f8fafc] text-[12px] font-sans h-16 resize-none focus:border-[rgba(255,255,255,0.2)] outline-none"
              placeholder="Dinámicas de mesa, recreacionales detectados o calidad del A-game..."
            />
          </div>

          {/* Botones de Acción con Atajos de Teclado */}
          <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-1.5 text-[10px] text-[#64748b]">
              <kbd className="px-1.5 py-0.5 rounded bg-[#1e293b] text-[#94a3b8] font-mono border border-[rgba(255,255,255,0.1)]">Ctrl+Enter</kbd>
              <span>para guardar</span>
              <span className="mx-1">•</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1e293b] text-[#94a3b8] font-mono border border-[rgba(255,255,255,0.1)]">Esc</kbd>
              <span>cancelar</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#10b981] hover:bg-[#34d399] text-[#050507] font-bold shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Conciliar e Insertar</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
