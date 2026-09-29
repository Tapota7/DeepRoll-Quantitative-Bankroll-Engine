import React, { useState } from 'react';
import { BankrollLedger } from '../../types/poker';

interface ConfiguracionViewProps {
  ledger: BankrollLedger;
  onResetData: () => void;
  onUpdateStartingBalance: (newBal: number) => void;
}

export const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({
  ledger,
  onResetData,
  onUpdateStartingBalance,
}) => {
  const [startingVal, setStartingVal] = useState<string>(ledger.initialBalance.toString());
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(startingVal);
    if (!isNaN(val) && val > 0) {
      onUpdateStartingBalance(val);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl font-mono text-[12px]">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="font-sans text-[20px] font-bold text-[#f8fafc]">
            Configuración del Motor Cuantitativo
          </h2>
          <p className="text-[12px] text-[#64748b]">
            Parámetros base de capital, modelos de varianza y preferencias operativas
          </p>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#1e293b] text-[#38bdf8] font-bold text-[10px]">
          v2.4 QUANT PASS
        </span>
      </div>

      {/* Starting capital form */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-[rgba(255,255,255,0.08)] space-y-4">
        <h3 className="font-sans text-[15px] font-bold text-[#f8fafc]">
          Capital Inicial del Ciclo
        </h3>
        <p className="font-sans text-[12px] text-[#94a3b8]">
          Define la base de partida sobre la cual se calculan el ROI%, la curva de crecimiento y el factor de recuperación (RF).
        </p>

        <form onSubmit={handleSave} className="flex items-center gap-3 max-w-md">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2 text-[#64748b]">$</span>
            <input
              type="number"
              step="0.01"
              value={startingVal}
              onChange={(e) => setStartingVal(e.target.value)}
              className="w-full bg-[#050507] py-2 pl-7 pr-3 rounded border border-[rgba(255,255,255,0.1)] text-[#f8fafc] font-bold outline-none focus:border-[#38bdf8]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#10b981] hover:bg-[#34d399] text-[#050507] font-bold rounded transition-colors"
          >
            Actualizar Base
          </button>
        </form>

        {savedNotice && (
          <span className="text-[#10b981] font-semibold text-[11px] flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            Base de partida actualizada correctamente.
          </span>
        )}
      </div>

      {/* Backup and reset */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-[rgba(255,255,255,0.08)] space-y-4">
        <h3 className="font-sans text-[15px] font-bold text-[#f8fafc]">
          Gestión de Datos y Trazabilidad
        </h3>
        <p className="font-sans text-[12px] text-[#94a3b8]">
          Tus datos se almacenan y concilian en tiempo real. Puedes restablecer la muestra demostrativa o descargar una copia de seguridad.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onResetData}
            className="px-4 py-2 bg-[#1e293b] hover:bg-[#7f1d1d] text-[#ef4444] rounded border border-[#ef4444]/30 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Restablecer Datos Demo (28 sesiones)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
