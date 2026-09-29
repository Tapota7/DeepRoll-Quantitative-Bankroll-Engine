import React, { useState, useEffect } from 'react';
import { Session, Operator } from '../../types/poker';

interface EditSessionDrawerProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSession: Session) => void;
}

export const EditSessionDrawer: React.FC<EditSessionDrawerProps> = ({
  session,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !session) return null;

  const [date, setDate] = useState(session.date);
  const operator: Operator = 'GGPoker';
  const [stake, setStake] = useState<string>(session.stake || 'NL5 Deep');
  const [hands, setHands] = useState<number>(session.hands);
  const [durationMinutes, setDurationMinutes] = useState<number>(session.durationMinutes);
  const [directProfit, setDirectProfit] = useState<number>(session.directProfit);
  const [rakeback, setRakeback] = useState<number>(session.rakeback);
  const [notes, setNotes] = useState<string>(session.notes);
  const [tiltScore, setTiltScore] = useState<number>(session.tiltScore || 10);
  const [tags, setTags] = useState<string[]>(session.tags || []);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [showAddTag, setShowAddTag] = useState<boolean>(false);

  useEffect(() => {
    if (session) {
      setDate(session.date);
      setStake(session.stake || 'NL5 Deep');
      setHands(session.hands);
      setDurationMinutes(session.durationMinutes);
      setDirectProfit(session.directProfit);
      setRakeback(session.rakeback);
      setNotes(session.notes);
      setTiltScore(session.tiltScore || 10);
      setTags(session.tags || []);
    }
  }, [session]);

  // Live Recalculations
  const netProfit = directProfit + rakeback;
  const bigBlind = stake.includes('NL50') ? 0.5 : stake.includes('NL25') ? 0.25 : stake.includes('NL10') ? 0.1 : 0.05;
  const bbWon = directProfit / bigBlind;
  const winrateBB100 = hands > 0 ? bbWon / (hands / 100) : 0;
  const cajas100bb = netProfit / (100 * bigBlind);

  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const durationBadge = `${hours}h ${mins}m (${durationMinutes} min)`;
  const handsPerHour = durationMinutes > 0 ? Math.round(hands / (durationMinutes / 60)) : 0;

  const handleAddTag = () => {
    if (newTagInput.trim()) {
      const formatted = newTagInput.startsWith('#') ? newTagInput.trim() : `#${newTagInput.trim()}`;
      if (!tags.includes(formatted)) {
        setTags([...tags, formatted]);
      }
      setNewTagInput('');
      setShowAddTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Session = {
      ...session,
      date,
      operator,
      stake,
      bb: bigBlind,
      hands,
      durationMinutes,
      durationFormatted: `${hours}h ${mins}m`,
      rakeback,
      directProfit,
      netProfit,
      cajasImpact: parseFloat(cajas100bb.toFixed(2)),
      winrateBB100: parseFloat(winrateBB100.toFixed(1)),
      notes,
      tiltScore,
      tags,
    };
    onSave(updated);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#050507]/85 backdrop-blur-md z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 bottom-0 w-full max-w-[560px] z-50 bg-[#131b2e] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200 border-l border-[rgba(255,255,255,0.08)]">
        {/* Drawer Header */}
        <header className="p-5 bg-[#050507]/95 border-b border-[rgba(255,255,255,0.08)] shrink-0 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#38bdf8]/15 text-[#38bdf8] flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                <span className="material-symbols-outlined text-[22px]">tune</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="font-sans text-[17px] text-[#f8fafc] font-semibold tracking-tight">
                  Editar Sesión {session.id}
                </h2>
                <div className="flex items-center gap-2 flex-wrap mt-0.5 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#1e293b] text-[#10b981] font-semibold uppercase">
                    GGPOKER EXCLUSIVO
                  </span>
                  <span className="text-[#64748b]">ID: {session.id}-GG</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b] transition-colors"
              title="Cerrar"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <p className="font-sans text-[12px] text-[#94a3b8]">
            Las modificaciones recalculan en tiempo real el saldo de banca, el winrate acumulado y las métricas.
          </p>
        </header>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5 font-mono text-[12px]">
          {/* SECTION 1: Temporalidad y Datos Básicos */}
          <section className="flex flex-col gap-3">
            <span className="text-[#64748b] uppercase tracking-wider flex items-center gap-1.5 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[#4edea3] text-[15px]">schedule</span>
              01. Temporalidad &amp; Operador
            </span>

            <div className="bg-[#050507] p-4 rounded-lg flex flex-col gap-3 border border-[rgba(255,255,255,0.08)]">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">Fecha &amp; Hora</label>
                  <input
                    className="w-full bg-[#171f33] rounded px-3 py-2 text-[#f8fafc] text-[12px] focus:outline-none border border-[rgba(255,255,255,0.08)]"
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">Duración (min)</label>
                  <input
                    className="w-full bg-[#171f33] rounded px-3 py-2 text-[#f8fafc] text-[12px] focus:outline-none border border-[rgba(255,255,255,0.08)]"
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center p-2.5 rounded bg-[#171f33] text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                  <span className="text-[#f8fafc] font-semibold">Sala: GGPoker</span>
                </div>
                <div className="flex flex-col gap-1">
                  <select
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    className="bg-[#050507] px-2 py-1 rounded border border-[rgba(255,255,255,0.1)] text-[#f8fafc] text-[11px] outline-none cursor-pointer"
                  >
                    <option value="NL5 Deep">NL5 Deep ($0.02/$0.05)</option>
                    <option value="NL10 Deep">NL10 Deep ($0.05/$0.10)</option>
                    <option value="NL25 Deep">NL25 Deep ($0.10/$0.25)</option>
                    <option value="NL50 Deep">NL50 Deep ($0.25/$0.50)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Manos Jugadas */}
          <section className="flex flex-col gap-3">
            <span className="text-[#64748b] uppercase tracking-wider flex items-center gap-1.5 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[#38bdf8] text-[15px]">casino</span>
              02. Muestreo de Manos
            </span>

            <div className="bg-[#050507] p-4 rounded-lg flex flex-col gap-2.5 border border-[rgba(255,255,255,0.08)]">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">Total de Manos</label>
                <div className="flex items-center bg-[#171f33] rounded px-3 py-2 border border-[rgba(255,255,255,0.08)]">
                  <input
                    className="w-full bg-transparent text-[#f8fafc] text-[14px] font-bold focus:outline-none"
                    type="number"
                    value={hands}
                    onChange={(e) => setHands(Number(e.target.value))}
                  />
                  <span className="text-[11px] text-[#94a3b8]">manos</span>
                </div>
              </div>
              <div className="text-[10px] text-[#64748b] flex items-center justify-between">
                <span>Ritmo de juego efectivo:</span>
                <span className="text-[#10b981] font-bold">{handsPerHour} manos/hora</span>
              </div>
            </div>
          </section>

          {/* SECTION 3: Ganancia de la Mesa & Rakeback */}
          <section className="flex flex-col gap-3">
            <span className="text-[#64748b] uppercase tracking-wider flex items-center gap-1.5 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[#10b981] text-[15px]">account_balance_wallet</span>
              03. Ganancia de la Mesa &amp; Rakeback
            </span>

            <div className="bg-[#050507] p-4 rounded-lg flex flex-col gap-3 border border-[rgba(255,255,255,0.08)]">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">
                    Ganancia de la Mesa ($)
                  </label>
                  <div className="flex items-center bg-[#171f33] rounded px-3 py-2 border border-[rgba(255,255,255,0.08)]">
                    <span className={`font-bold mr-1 ${directProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>$</span>
                    <input
                      className={`w-full bg-transparent font-bold text-[14px] focus:outline-none ${
                        directProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
                      }`}
                      type="number"
                      step="0.01"
                      value={directProfit}
                      onChange={(e) => setDirectProfit(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">
                    Rakeback ($)
                  </label>
                  <div className="flex items-center bg-[#171f33] rounded px-3 py-2 border border-[rgba(255,255,255,0.08)]">
                    <span className="text-[#ffb95f] font-bold mr-1">$</span>
                    <input
                      className="w-full bg-transparent text-[#ffb95f] font-bold text-[14px] focus:outline-none"
                      type="number"
                      step="0.01"
                      value={rakeback}
                      onChange={(e) => setRakeback(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Strip */}
              <div className="p-3 rounded bg-[#171f33] grid grid-cols-3 gap-2 mt-1">
                <div>
                  <span className="text-[9px] text-[#64748b] uppercase block">Resultado Neto</span>
                  <span className={`text-[14px] font-bold ${netProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#64748b] uppercase block">Impacto Cajas</span>
                  <span className={`text-[14px] font-bold ${cajas100bb >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {cajas100bb >= 0 ? `+${cajas100bb.toFixed(2)}` : cajas100bb.toFixed(2)} cx
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#64748b] uppercase block">Winrate bb/100</span>
                  <span className={`text-[14px] font-bold ${winrateBB100 >= 0 ? 'text-[#38bdf8]' : 'text-[#ef4444]'}`}>
                    {winrateBB100 >= 0 ? `+${winrateBB100.toFixed(1)}` : winrateBB100.toFixed(1)} bb
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: Notas y Etiquetas */}
          <section className="flex flex-col gap-2">
            <label className="text-[10px] text-[#94a3b8] uppercase font-semibold">Notas de la Sesión</label>
            <textarea
              className="w-full bg-[#050507] rounded-lg p-3 text-[#f8fafc] text-[12px] font-sans border border-[rgba(255,255,255,0.08)] focus:outline-none h-20 resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded bg-[#1e293b] text-[#38bdf8] text-[10px] flex items-center gap-1"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-[#ef4444]"
                  >
                    ×
                  </button>
                </span>
              ))}
              {showAddTag ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Tag..."
                    className="bg-[#050507] border border-[rgba(255,255,255,0.1)] px-2 py-0.5 rounded text-[10px] text-[#f8fafc] w-20 outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="text-[10px] text-[#10b981]"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddTag(true)}
                  className="text-[10px] text-[#64748b] hover:text-[#94a3b8]"
                >
                  + Tag
                </button>
              )}
            </div>
          </section>

          {/* Drawer Footer Actions */}
          <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] flex justify-end gap-3 mt-auto pb-4">
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
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};
