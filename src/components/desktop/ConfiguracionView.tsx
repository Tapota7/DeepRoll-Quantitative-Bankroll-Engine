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
      <div className="p-5 rounded-xl bg-[#0f172a] border border-[rgba(255,255,255,0.08)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-sans text-[15px] font-bold text-[#f8fafc]">
              Capital Inicial del Ciclo
            </h3>
            <p className="font-sans text-[12px] text-[#94a3b8] mt-0.5">
              Define la base de partida sobre la cual se calculan el ROI%, la curva de crecimiento y el factor de recuperación.
            </p>
          </div>
          <span className="text-[11px] text-[#10b981] font-bold">
            Actual: ${ledger.initialBalance.toFixed(2)} USD
          </span>
        </div>

        <form onSubmit={handleSave} className="flex items-center gap-3 max-w-md">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2 text-[#64748b]">$</span>
            <input
              type="number"
              step="0.01"
              value={startingVal}
              onChange={(e) => setStartingVal(e.target.value)}
              className="w-full bg-[#050507] py-2 pl-7 pr-3 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#f8fafc] font-bold outline-none focus:border-[#38bdf8] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#10b981] hover:bg-[#34d399] text-[#050507] font-bold rounded-lg transition-colors cursor-pointer"
          >
            Actualizar Base
          </button>
        </form>

        {savedNotice && (
          <span className="text-[#10b981] font-semibold text-[11px] flex items-center gap-1 animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            Base de partida actualizada correctamente en el ledger.
          </span>
        )}
      </div>

      {/* Resiliencia, Backup y Exportación */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-[rgba(255,255,255,0.08)] space-y-4">
        <div>
          <h3 className="font-sans text-[15px] font-bold text-[#f8fafc]">
            Resiliencia y Copias de Seguridad (Backup Seguro)
          </h3>
          <p className="font-sans text-[12px] text-[#94a3b8] mt-0.5">
            Protege tu historial contra limpiezas accidentales del navegador o fallos de caché. Puedes exportar e importar cuando lo desees.
          </p>
        </div>

        {/* Resumen de Datos Locales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.06)]">
          <div>
            <span className="text-[10px] text-[#64748b] uppercase block">Sesiones Guardadas</span>
            <span className="text-[16px] font-bold text-[#f8fafc] tabular-nums">
              {sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748b] uppercase block">Muestra de Manos</span>
            <span className="text-[16px] font-bold text-[#38bdf8] tabular-nums">
              {totalHands.toLocaleString()} manos
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748b] uppercase block">Estado de Persistencia</span>
            <span className="text-[16px] font-bold text-[#10b981] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              LocalStorage v2
            </span>
          </div>
        </div>

        {/* Acciones de Exportación e Importación */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => exportBackupJSON(ledger, sessions)}
            className="px-3.5 py-2 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-[#38bdf8] font-semibold border border-[#38bdf8]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Descargar Backup JSON</span>
          </button>

          <button
            type="button"
            onClick={() => exportBackupCSV(sessions)}
            className="px-3.5 py-2 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-[#10b981] font-semibold border border-[#10b981]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">table_view</span>
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
            className="px-3.5 py-2 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-[#ffb95f] font-semibold border border-[#ffb95f]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Restaurar Backup JSON</span>
          </button>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-lg border text-[11px] flex items-center gap-2 animate-in fade-in duration-200 ${
              importStatus.type === 'success'
                ? 'bg-[#064e3b]/30 border-[#10b981]/40 text-[#6ffbbe]'
                : 'bg-[#7f1d1d]/30 border-[#ef4444]/40 text-[#fca5a5]'
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
      <div className="p-5 rounded-xl bg-[#0f172a] border border-[#ef4444]/20 space-y-4">
        <div>
          <h3 className="font-sans text-[15px] font-bold text-[#ef4444]">
            Zona de Peligro: Restablecer Motor
          </h3>
          <p className="font-sans text-[12px] text-[#94a3b8] mt-0.5">
            Borra permanentemente todas las sesiones registradas y devuelve los balances a cero. Te recomendamos exportar un backup antes de proceder.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onResetData}
            className="px-4 py-2 bg-[#1e293b] hover:bg-[#7f1d1d] text-[#ef4444] rounded-lg border border-[#ef4444]/40 transition-colors flex items-center gap-1.5 cursor-pointer font-bold active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">delete_forever</span>
            <span>Borrar Todo y Dejar en Cero</span>
          </button>
        </div>
      </div>
    </div>
  );
};
