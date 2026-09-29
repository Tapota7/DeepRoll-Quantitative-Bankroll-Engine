import React, { useState } from 'react';
import { Session, BankrollLedger } from '../../types/poker';

interface DeleteSessionModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (sessionId: string) => void;
  onSwitchToEdit: (session: Session) => void;
  ledger: BankrollLedger;
}

export const DeleteSessionModal: React.FC<DeleteSessionModalProps> = ({
  session,
  isOpen,
  onClose,
  onConfirmDelete,
  onSwitchToEdit,
  ledger,
}) => {
  const [confirmedCheck, setConfirmedCheck] = useState<boolean>(false);

  if (!isOpen || !session) return null;

  const netDeduction = session.netProfit;
  const postBankroll = Math.max(0, ledger.currentBalance - netDeduction);
  const netCajas = (netDeduction / 10).toFixed(2);
  const priorWinrate = 39.3;
  const postWinrate = (priorWinrate - 2.1).toFixed(1);

  const handleDelete = () => {
    if (confirmedCheck) {
      onConfirmDelete(session.id);
      setConfirmedCheck(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#131b2e] rounded-xl border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col overflow-hidden text-[#dae2fd] font-mono animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-[#050507]/90 border-b border-[rgba(255,255,255,0.08)] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-[#ef4444]/15 text-[#ef4444] flex items-center justify-center shrink-0 mt-0.5 border border-[#ef4444]/30">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-sans text-[17px] text-[#f8fafc] font-bold tracking-tight">
                  ¿Eliminar Sesión Auditada {session.id}?
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#7f1d1d] text-[#ffb4ab] border border-[#ef4444]/40 uppercase font-semibold">
                  ACCIÓN DESTRUCTIVA // LEDGER AUDIT
                </span>
              </div>
              <p className="font-sans text-[12px] text-[#94a3b8] leading-snug">
                Esta acción eliminará el registro contable y{' '}
                <span className="text-[#f59e0b] font-medium">recalculará retroactivamente</span> el saldo
                consolidado de la banca, la curva de drawdown acumulada y el winrate global del ciclo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-[#f8fafc] p-1 transition-colors rounded"
            title="Cerrar modal"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3.5 bg-[#131b2e] overflow-y-auto max-h-[75vh] text-[12px]">
          {/* Session Overview */}
          <div className="bg-[#050507] rounded p-3 border border-[rgba(255,255,255,0.08)] flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span>
                <span className="font-sans text-[13px] font-semibold text-[#f8fafc]">
                  Sesión {session.id} — {session.operator}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1e293b] text-[#adc6ff] font-medium">
                  {session.stake} 170-200bb
                </span>
              </div>
              <span className="text-[10px] text-[#64748b]">ID REGISTRO: {session.id}-GG-NL5</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#64748b] uppercase">Fecha &amp; Duración</span>
                <span className="text-[#f8fafc] font-medium truncate">{session.date}</span>
                <span className="text-[10px] text-[#64748b]">
                  {session.durationFormatted} ({session.hands.toLocaleString()} manos)
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#64748b] uppercase">Beneficio Directo</span>
                <span className="text-[#10b981] font-semibold">
                  {session.directProfit >= 0 ? `+$${session.directProfit.toFixed(2)}` : `-$${Math.abs(session.directProfit).toFixed(2)}`} USD
                </span>
                <span className="text-[10px] text-[#4edea3]">
                  +{session.cajasImpact} cx (+{Math.round(session.directProfit / session.bb)} bb)
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#64748b] uppercase">Rakeback Asociado</span>
                <span className="text-[#ffb95f] font-semibold">+${session.rakeback.toFixed(2)} USD</span>
                <span className="text-[10px] text-[#64748b]">Devolución calculada</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#64748b] uppercase">Crecimiento Neto</span>
                <span className="text-[#10b981] font-bold">
                  {session.netProfit >= 0 ? `+$${session.netProfit.toFixed(2)}` : `-$${Math.abs(session.netProfit).toFixed(2)}`} USD
                </span>
                <span className="text-[10px] text-[#10b981]">+{netCajas} cajas en total</span>
              </div>
            </div>
          </div>

          {/* Simulation Output */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[#64748b] uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <span className="material-symbols-outlined text-[#f59e0b] text-[15px]">analytics</span>
                SIMULACIÓN DE RECÁLCULO EN VIVO (LEDGER TEÓRICO)
              </span>
              <span className="text-[10px] text-[#64748b]">27 sesiones restantes</span>
            </div>

            <div className="bg-[#050507] rounded p-3 border border-[rgba(255,255,255,0.08)] flex flex-col gap-2.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded bg-[#1e293b] flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase">
                    <span>Banca Consolidada</span>
                    <span className="text-[#ef4444] font-semibold">
                      -${netDeduction.toFixed(2)} (-{netCajas} cx)
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#94a3b8]">
                      Actual: <strong className="text-[#f8fafc] font-semibold">${ledger.currentBalance.toFixed(2)}</strong>
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-[#64748b]">trending_flat</span>
                    <span className="text-[#f8fafc]">
                      Post: <strong className="text-[#ef4444] font-bold">${postBankroll.toFixed(2)} USD</strong>
                    </span>
                  </div>
                  <div className="w-full bg-[#171f33] rounded-full h-1 mt-1 overflow-hidden">
                    <div className="bg-[#ef4444] h-full" style={{ width: '98.6%' }}></div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#1e293b] flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between text-[#64748b] text-[10px] uppercase">
                    <span>Winrate Acumulado (30D)</span>
                    <span className="text-[#f59e0b] font-semibold">-2,1 bb/100</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#94a3b8]">
                      Actual: <strong className="text-[#38bdf8] font-semibold">+{priorWinrate}</strong>
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-[#64748b]">trending_flat</span>
                    <span className="text-[#f8fafc]">
                      Post: <strong className="text-[#38bdf8] font-bold">+{postWinrate} bb/100</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-[#64748b] truncate">
                    Muestra recalculada: 23.350 manos auditadas
                  </span>
                </div>
              </div>

              <div className="p-2 rounded bg-[#171f33] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffb95f] text-[16px]">flag</span>
                  <span className="text-[#94a3b8]">Impacto en Meta NL10 ($3.000):</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#64748b] line-through">81,7%</span>
                  <span className="material-symbols-outlined text-[12px] text-[#64748b]">arrow_forward</span>
                  <span className="text-[#f59e0b] font-semibold">80,6%</span>
                  <span className="text-[10px] text-[#64748b]">(+{netCajas} cajas adicionales requeridas)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Shortcut Notice */}
          <div className="p-3 rounded bg-[#1e3a8a]/30 border border-[#1e3a8a] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#38bdf8] text-[18px] shrink-0 mt-0.5">edit_note</span>
            <div className="flex flex-col gap-0.5 font-sans text-[12px]">
              <span className="font-semibold text-[#f8fafc]">¿Solo necesitas corregir un error contable?</span>
              <p className="text-[#94a3b8] leading-snug">
                Si ingresaste un cashout erróneo, omitiste reentradas o necesitas ajustar el conteo de manos, es recomendable{' '}
                <button
                  onClick={() => {
                    onClose();
                    onSwitchToEdit(session);
                  }}
                  className="text-[#adc6ff] hover:text-[#f8fafc] underline font-medium inline transition-colors"
                  type="button"
                >
                  editar los metadatos de la sesión
                </button>{' '}
                para preservar la continuidad cronológica del ledger.
              </p>
            </div>
          </div>

          {/* Checkbox Agreement */}
          <label className="flex items-start gap-2.5 p-2.5 rounded bg-[#050507] border border-[rgba(255,255,255,0.08)] cursor-pointer hover:bg-[#1e293b] transition-colors">
            <input
              type="checkbox"
              checked={confirmedCheck}
              onChange={(e) => setConfirmedCheck(e.target.checked)}
              className="mt-0.5 rounded border-[rgba(255,255,255,0.16)] bg-[#171f33] text-[#ef4444] focus:ring-0 cursor-pointer"
            />
            <span className="font-sans text-[12px] text-[#94a3b8] leading-snug select-none">
              Comprendo que esta acción desajustará el histórico de banca, restará ${netDeduction.toFixed(2)} USD del balance activo y alterará la curva de drawdown en 1 sesión de manera irreversible.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#050507]/90 border-t border-[rgba(255,255,255,0.08)] flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-[#64748b]">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>CERTIFICACIÓN CUANTITATIVA DEEPROLL</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-[#1e293b] hover:bg-[#334155] text-[#f8fafc] transition-colors shadow-sm"
              type="button"
            >
              Cancelar y conservar registro
            </button>
            <button
              onClick={handleDelete}
              disabled={!confirmedCheck}
              className={`px-4 py-2 rounded font-semibold transition-colors flex items-center gap-1.5 shadow-md ${
                confirmedCheck
                  ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white cursor-pointer'
                  : 'bg-[#7f1d1d]/50 text-[#94a3b8] cursor-not-allowed opacity-60'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">delete_forever</span>
              <span>Eliminar definitivamente del ledger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
