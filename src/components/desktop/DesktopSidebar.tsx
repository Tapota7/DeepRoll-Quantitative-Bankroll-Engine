import React from 'react';
import { DesktopTab, BankrollLedger } from '../../types/poker';

interface DesktopSidebarProps {
  activeTab: DesktopTab;
  onSelectTab: (tab: DesktopTab) => void;
  ledger: BankrollLedger;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onSelectTab,
  ledger,
}) => {
  const navItems: { id: DesktopTab; label: string; icon: string }[] = [
    { id: 'resumen', label: 'Resumen', icon: 'grid_view' },
    { id: 'sesiones', label: 'Sesiones', icon: 'receipt_long' },
    { id: 'analisis', label: 'Análisis Avanzado', icon: 'show_chart' },
    { id: 'banca', label: 'Banca & Riesgo', icon: 'account_balance' },
    { id: 'configuracion', label: 'Configuración', icon: 'tune' },
  ];

  const totalCajas = (ledger.currentBalance / 5.0).toFixed(0);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#131b2e] z-50 flex flex-col justify-between py-4 border-r border-[rgba(255,255,255,0.08)] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-4">
        {/* Brand */}
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#050507] border border-[rgba(255,255,255,0.16)] flex items-center justify-center rounded-lg shadow-inner">
              <span className="material-symbols-outlined text-[#4edea3] text-[20px]">query_stats</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[16px] font-bold tracking-tight text-[#f8fafc] leading-none">
                DeepRoll
              </span>
              <span className="font-mono text-[10px] text-[#64748b] tracking-widest mt-1 uppercase font-semibold">
                QUANT ENGINE v2.4
              </span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-[#050507] text-[#adc6ff] font-mono text-[10px] font-semibold uppercase tracking-wider border border-[rgba(255,255,255,0.08)]">
            PRO
          </span>
        </div>

        {/* Bankroll Snapshot Widget */}
        <div className="px-3.5 py-2.5 mx-3 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#64748b] font-medium tracking-wider uppercase">Banca Total</span>
            <span className="flex items-center gap-1.5 text-[#10b981] text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#064e3b]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
              SAFE ({totalCajas} cx)
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[18px] font-bold text-[#f8fafc] tabular-nums tracking-tight">
              ${ledger.currentBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="font-mono text-[11px] text-[#10b981] font-semibold">+40.8% ROI</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-[13px] text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#222a3d] text-[#4edea3] font-semibold border border-[rgba(255,255,255,0.16)] shadow-sm'
                    : 'text-[#94a3b8] hover:bg-[#222a3d] hover:text-[#f8fafc] font-medium'
                }`}
              >
                <span className={`material-symbols-outlined text-[19px] ${isActive ? 'text-[#4edea3]' : ''}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User / Telemetry */}
      <div className="px-3 flex flex-col gap-3">
        <div className="p-3 rounded-lg bg-[#050507] border border-[rgba(255,255,255,0.08)] flex flex-col gap-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between text-[#64748b]">
            <span>RUN RATE</span>
            <span className="text-[#10b981] font-semibold tabular-nums">+39.3 bb/100</span>
          </div>
          <div className="flex items-center justify-between text-[#64748b]">
            <span>SHARPE RATIO</span>
            <span className="text-[#38bdf8] font-semibold tabular-nums">1.84 (Alto)</span>
          </div>
          <div className="flex items-center justify-between text-[#64748b]">
            <span>RUIN PROB.</span>
            <span className="text-[#f8fafc] font-semibold tabular-nums">&lt; 0.01%</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1 border-t border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1e293b] border border-[rgba(255,255,255,0.08)] flex items-center justify-center font-mono font-bold text-[12px] text-[#4edea3]">
              HG
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-[#f8fafc] truncate max-w-[105px]">
                Hero Grinder
              </span>
              <span className="font-mono text-[10px] text-[#64748b]">PRO PASS • NL5</span>
            </div>
          </div>
          <button
            className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors p-1"
            title="Cerrar sesión / Perfil"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
