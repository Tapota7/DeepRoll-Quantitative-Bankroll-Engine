import React, { useState } from 'react';
import { Session, Operator } from '../../types/poker';

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
  const operator: Operator = 'GGPoker';
  const [stake, setStake] = useState<string>('NL5 Deep');
  const [hands, setHands] = useState<number>(1200);
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [directProfit, setDirectProfit] = useState<number>(28.5); // Ganancia de la mesa
  const [rakeback, setRakeback] = useState<number>(3.8);
  const [notes, setNotes] = useState<string>('Sesión auditada en GGPoker');
  const [tiltScore, setTiltScore] = useState<number>(10);
  const [tags, setTags] = useState<string[]>(['#A-Game', '#GGPoker']);

  if (!isOpen) return null;

  // Stake configuration
  const bigBlind = stake.includes('NL50') ? 0.5 : stake.includes('NL25') ? 0.25 : stake.includes('NL10') ? 0.1 : 0.05;
  const buyinCaja = 100 * bigBlind; // $5 para NL5, $10 para NL10, $25 para NL25, $50 para NL50

  // Calculations
  const netProfit = directProfit + rakeback;
  const bbWon = directProfit / bigBlind;
  const winrateBB100 = hands > 0 ? bbWon / (hands / 100) : 0;
  const cajasImpact = netProfit / buyinCaja;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idFormatted = `#0${nextSessionNumber}`;
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;

    const newSess: Session = {
      id: idFormatted,
      date: 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      operator,
      stake,
      bb: bigBlind,
      hands,
      durationMinutes,
      durationFormatted: `${hours}h ${mins}m`,
      rakeback,
      directProfit,
      netProfit,
      cajasImpact: parseFloat(cajasImpact.toFixed(2)),
      winrateBB100: parseFloat(winrateBB100.toFixed(1)),
      notes,
      tiltScore,
      tags,
    };

    onSaveSession(newSess);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#131b2e] rounded-xl border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col overflow-hidden text-[#dae2fd] font-mono animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-[#050507]/90 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#10b981] text-[22px]">add_circle</span>
            <h3 className="font-sans text-[17px] font-bold text-[#f8fafc]">
              Registrar Nueva Sesión #0{nextSessionNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors p-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto text-[12px]">
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
              <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">Stake</label>
              <select
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="bg-[#050507] p-2.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#f8fafc] outline-none cursor-pointer"
              >
                <option value="NL5 Deep">NL5 Deep ($0.02/$0.05)</option>
                <option value="NL10 Deep">NL10 Deep ($0.05/$0.10)</option>
                <option value="NL25 Deep">NL25 Deep ($0.10/$0.25)</option>
                <option value="NL50 Deep">NL50 Deep ($0.25/$0.50)</option>
              </select>
            </div>
          </div>

          {/* Manos Jugadas y Duración */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">Manos Jugadas</label>
              <div className="flex items-center bg-[#050507] rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2">
                <span className="material-symbols-outlined text-[#38bdf8] text-[18px] mr-2">casino</span>
                <input
                  type="number"
                  min="1"
                  value={hands}
                  onChange={(e) => setHands(Number(e.target.value))}
                  className="w-full bg-transparent text-[#f8fafc] outline-none font-bold text-[13px]"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">Duración (minutos)</label>
              <div className="flex items-center bg-[#050507] rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2">
                <span className="material-symbols-outlined text-[#64748b] text-[18px] mr-2">timer</span>
                <input
                  type="number"
                  min="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-transparent text-[#f8fafc] outline-none font-bold text-[13px]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Ganancia de la Mesa & Rakeback */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">
                  Ganancia de la Mesa ($)
                </label>
                <span className="text-[9px] text-[#64748b]">± USD</span>
              </div>
              <div className="flex items-center bg-[#050507] rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 focus-within:border-[#10b981]">
                <span className={`text-[15px] font-bold mr-1.5 ${directProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={directProfit}
                  onChange={(e) => setDirectProfit(parseFloat(e.target.value) || 0)}
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
              <div className="flex items-center bg-[#050507] rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 focus-within:border-[#ffb95f]">
                <span className="text-[#ffb95f] text-[15px] font-bold mr-1.5">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rakeback}
                  onChange={(e) => setRakeback(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-[#ffb95f] outline-none font-bold text-[15px] tabular-nums"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Resumen Calculado en Vivo */}
          <div className="p-3.5 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] grid grid-cols-3 gap-2">
            <div>
              <span className="text-[9px] text-[#64748b] uppercase block">Resultado Neto</span>
              <span className={`text-[15px] font-bold tabular-nums ${netProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-[#64748b] uppercase block">Impacto Cajas</span>
              <span className={`text-[15px] font-bold tabular-nums ${cajasImpact >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {cajasImpact >= 0 ? `+${cajasImpact.toFixed(2)} cx` : `${cajasImpact.toFixed(2)} cx`}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-[#64748b] uppercase block">Winrate bb/100</span>
              <span className={`text-[15px] font-bold tabular-nums ${winrateBB100 >= 0 ? 'text-[#38bdf8]' : 'text-[#ef4444]'}`}>
                {winrateBB100 >= 0 ? `+${winrateBB100.toFixed(1)}` : winrateBB100.toFixed(1)} bb
              </span>
            </div>
          </div>

          {/* Notas de la Sesión */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">Notas de la Sesión</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[#050507] p-2.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#f8fafc] text-[12px] font-sans h-16 resize-none focus:border-[rgba(255,255,255,0.2)] outline-none"
              placeholder="Anotaciones sobre dinámicas de mesa, recreacionales o sensaciones de juego..."
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-[rgba(255,255,255,0.08)]">
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
              <span>Conciliar e Insertar en Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
