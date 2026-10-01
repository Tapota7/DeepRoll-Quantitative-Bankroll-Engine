import React from 'react';
import { DesktopTab, BankrollLedger } from '../../types/poker';

interface DesktopSidebarProps {
  activeTab: DesktopTab;
  onSelectTab: (tab: DesktopTab) => void;
  ledger: BankrollLedger;
  boxSize?: number;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onSelectTab,
  ledger,
  boxSize = 5.0,
}) => {
  const navItems: { id: DesktopTab; label: string; icon: string }[] = [
    { id: 'resumen', label: 'Resumen', icon: 'grid_view' },
    { id: 'sesiones', label: 'Sesiones', icon: 'receipt_long' },
    { id: 'analisis', label: 'Análisis Avanzado', icon: 'show_chart' },
    { id: 'banca', label: 'Banca & Riesgo', icon: 'account_balance' },
    { id: 'configuracion', label: 'Configuración', icon: 'tune' },
  ];

  const totalCajas = (ledger.currentBalance / boxSize).toFixed(0);

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#0c0d12] z-50 flex flex-col justify-between py-5 border-r border-white/[0.06] select-none">
      <div className="flex flex-col gap-6">
        {/* Brand */}
        <div className="px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/[0.06] border border-white/[0.08] flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined text-[#34d399] text-[18px]">query_stats</span>
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-[15px] font-bold text-zinc-100 tracking-tight leading-none">
                DeepRoll
              </span>
              <span className="text-[10px] text-zinc-500 font-sans tracking-wide mt-1">
                Bankroll Engine
              </span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-zinc-400 font-mono text-[9px] uppercase tracking-wider bg-white/[0.04] border border-white/[0.06]">
            v2.4
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[13px] font-sans text-left cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-semibold'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-[#34d399]' : 'text-zinc-500'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Calm Balance Pill & Profile */}
      <div className="px-3 flex flex-col gap-3">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-sans text-zinc-500 uppercase tracking-wider">
            <span>Banca Activa</span>
            <span className="font-mono text-zinc-400">{totalCajas} cx</span>
          </div>
          <div className="font-mono text-[16px] font-bold text-zinc-100 tabular-nums">
            ${ledger.currentBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center font-sans font-bold text-[11px] text-zinc-300">
              HG
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-zinc-200 truncate max-w-[110px]">
                Hero Grinder
              </span>
              <span className="text-[10px] text-zinc-500 font-sans">GGPoker Cash</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
