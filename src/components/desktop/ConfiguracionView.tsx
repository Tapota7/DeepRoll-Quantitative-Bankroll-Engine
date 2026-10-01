import React, { useState, useRef } from 'react';
import { BankrollLedger, Session } from '../../types/poker';
import { exportBackupJSON, exportBackupCSV, parseAndValidateBackupJSON } from '../../services/backupService';

interface ConfiguracionViewProps {
  ledger: BankrollLedger;
  sessions: Session[];
  onResetData: () => void;
  onUpdateStartingBalance: (newBal: number) => void;
  onImportBackup: (data: { ledger: BankrollLedger; sessions: Session[] }) => void;
}

export const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({
  ledger,
  sessions,
  onResetData,
  onUpdateStartingBalance,
  onImportBackup,
}) => {
  const [startingVal, setStartingVal] = useState<string>(ledger.initialBalance.toString());
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(startingVal);
    if (!isNaN(val) && val >= 0) {
      onUpdateStartingBalance(val);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseAndValidateBackupJSON(file);
      onImportBackup(data);
      setImportStatus({
        type: 'success',
        message: `Backup restaurado con éxito: ${data.sessions.length} sesiones y balance de $${data.ledger.currentBalance.toFixed(2)} USD.`,
      });
      setTimeout(() => setImportStatus(null), 5000);
    } catch (err: unknown) {
      setImportStatus({
        type: 'error',
        message: (err as Error).message || 'Error al procesar el archivo de backup.',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const totalHands = sessions.reduce((a, s) => a + s.hands, 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl font-mono text-[12px]">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="font-sans text-[20px] font-bold text-[#f8fafc]">
            Configuración &amp; Integridad del Motor
          </h2>
          <p className="text-[12px] text-[#64748b]">
            Parámetros base de capital, exportación segura, auditoría y resiliencia de datos
          </p>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#1e293b] text-[#38bdf8] font-bold text-[10px]">
          v2.4 AUDITED PASS
        </span>
      </div>

      {/* Starting capital form */}
      <div className="p-6 rounded-2xl bg-[#111218] border border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-sans text-[15px] font-bold text-zinc-100">
              Capital Inicial del Ciclo
            </h3>
            <p className="font-sans text-[12px] text-zinc-400 mt-0.5">
              Define la base de partida sobre la cual se calculan el ROI%, la curva de crecimiento y el factor de recuperación.
            </p>
          </div>
          <span className="text-[12px] text-[#34d399] font-mono font-bold">
            Actual: ${ledger.initialBalance.toFixed(2)} USD
          </span>
        </div>

        <form onSubmit={handleSave} className="flex items-center gap-3 max-w-md">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2 text-zinc-500">$</span>
            <input
              type="number"
              step="0.01"
              value={startingVal}
              onChange={(e) => setStartingVal(e.target.value)}
              className="w-full bg-white/[0.03] py-2 pl-7 pr-3 rounded-lg border border-white/[0.08] text-zinc-100 font-mono font-bold outline-none focus:border-[#34d399] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-[#090a0f] font-sans font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Actualizar Base
          </button>
        </form>

        {savedNotice && (
          <span className="text-[#34d399] font-medium text-[11px] flex items-center gap-1 animate-in fade-in duration-200 font-sans">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            Base de partida actualizada correctamente en el ledger.
          </span>
        )}
      </div>

      {/* Resiliencia, Backup y Exportación */}
      <div className="p-6 rounded-2xl bg-[#111218] border border-white/[0.06] space-y-4">
        <div>
          <h3 className="font-sans text-[15px] font-bold text-zinc-100">
            Resiliencia y Copias de Seguridad (Backup Seguro)
          </h3>
          <p className="font-sans text-[12px] text-zinc-400 mt-0.5">
            Protege tu historial contra limpiezas accidentales del navegador o fallos de caché. Puedes exportar e importar cuando lo desees.
          </p>
        </div>

        {/* Resumen de Datos Locales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block font-sans">Sesiones Guardadas</span>
            <span className="text-[16px] font-bold text-zinc-200 font-mono tabular-nums">
              {sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block font-sans">Muestra de Manos</span>
            <span className="text-[16px] font-bold text-zinc-200 font-mono tabular-nums">
              {totalHands.toLocaleString()} manos
            </span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block font-sans">Estado de Persistencia</span>
            <span className="text-[15px] font-medium text-[#34d399] flex items-center gap-1 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></span>
              LocalStorage v2
            </span>
          </div>
        </div>

        {/* Acciones de Exportación e Importación */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => exportBackupJSON(ledger, sessions)}
            className="px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 font-sans font-medium border border-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 text-[12px]"
          >
            <span className="material-symbols-outlined text-[16px] text-zinc-400">download</span>
            <span>Descargar Backup JSON</span>
          </button>

          <button
            type="button"
            onClick={() => exportBackupCSV(sessions)}
            className="px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 font-sans font-medium border border-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 text-[12px]"
          >
            <span className="material-symbols-outlined text-[16px] text-zinc-400">table_view</span>
            <span>Exportar CSV (Excel / Sheets)</span>
          </button>

          {/* Input oculto para subida de archivo */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 font-sans font-medium border border-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 text-[12px]"
          >
            <span className="material-symbols-outlined text-[16px] text-zinc-400">upload_file</span>
            <span>Restaurar Backup JSON</span>
          </button>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-xl border text-[11px] font-sans flex items-center gap-2 animate-in fade-in duration-200 ${
              importStatus.type === 'success'
                ? 'bg-[#34d399]/10 border-[#34d399]/30 text-[#34d399]'
                : 'bg-[#fb7185]/10 border-[#fb7185]/30 text-[#fb7185]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {importStatus.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>

      {/* Zona de peligro: Reset */}
      <div className="p-6 rounded-2xl bg-[#111218] border border-red-500/20 space-y-4">
        <div>
          <h3 className="font-sans text-[15px] font-bold text-red-400">
            Zona de Peligro: Restablecer Motor
          </h3>
          <p className="font-sans text-[12px] text-zinc-400 mt-0.5">
            Borra permanentemente todas las sesiones registradas y devuelve los balances a cero. Te recomendamos exportar un backup antes de proceder.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onResetData}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors flex items-center gap-1.5 cursor-pointer font-sans font-semibold text-[12px] active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">delete_forever</span>
            <span>Borrar Todo y Dejar en Cero</span>
          </button>
        </div>
      </div>
    </div>
  );
};
