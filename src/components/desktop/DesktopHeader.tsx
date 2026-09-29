import React, { useState, useRef, useEffect } from 'react';

export interface StakeOption {
  id: string;
  name: string;
  shortName: string;
  blinds: string;
  buyin: string;
  color: string;
}

export const STAKE_OPTIONS: StakeOption[] = [
  {
    id: 'all',
    name: 'Todos los Niveles',
    shortName: 'Todos (Consolidado)',
    blinds: 'Global / Promedio',
    buyin: 'Todas las cajas',
    color: '#10b981',
  },
  {
    id: 'NL5 Deep',
    name: 'No Limit 5 Deep',
    shortName: 'NL5 Deep',
    blinds: '$0.02 / $0.05',
    buyin: '100bb = $5.00',
    color: '#34d399',
  },
  {
    id: 'NL10 Deep',
    name: 'No Limit 10 Deep',
    shortName: 'NL10 Deep',
    blinds: '$0.05 / $0.10',
    buyin: '100bb = $10.00',
    color: '#38bdf8',
  },
  {
    id: 'NL25 Deep',
    name: 'No Limit 25 Deep',
    shortName: 'NL25 Deep',
    blinds: '$0.10 / $0.25',
    buyin: '100bb = $25.00',
    color: '#a855f7',
  },
  {
    id: 'NL50 Deep',
    name: 'No Limit 50 Deep',
    shortName: 'NL50 Deep',
    blinds: '$0.25 / $0.50',
    buyin: '100bb = $50.00',
    color: '#f59e0b',
  },
];

interface DesktopHeaderProps {
  onOpenNewSessionModal: () => void;
  activeTabTitle: string;
  selectedStake: string;
  onSelectStake: (stake: string) => void;
  stakeCounts?: Record<string, number>;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  onOpenNewSessionModal,
  activeTabTitle,
  selectedStake,
  onSelectStake,
  stakeCounts = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption =
    STAKE_OPTIONS.find((opt) => opt.id === selectedStake) || STAKE_OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-[#050507]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)] z-40 px-6 flex items-center justify-between gap-4">
      {/* Active Section Title & Interactive Level Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <h1 className="font-sans text-[15px] font-semibold text-[#f8fafc] tracking-tight">
            {activeTabTitle}
          </h1>
        </div>

        <span className="text-[#64748b] text-[12px]">•</span>

        {/* Level / Stake Selector Dropdown */}
        <div className="relative font-mono" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131b2e] hover:bg-[#1a243b] text-[#f8fafc] text-[11px] font-semibold border border-[rgba(255,255,255,0.12)] hover:border-[#10b981]/50 transition-all shadow-sm cursor-pointer"
            title="Cambiar nivel / stake para filtrar todas las estadísticas"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: currentOption.color }}
            />
            <span className="font-sans font-bold">{currentOption.name}</span>
            <span className="text-[#64748b] text-[10px]">({currentOption.blinds})</span>
            <span className="material-symbols-outlined text-[15px] text-[#94a3b8] transition-transform duration-150">
              {isOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute left-0 mt-1.5 w-72 rounded-xl bg-[#0d1424] border border-[rgba(255,255,255,0.14)] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1.5 text-[10px] text-[#64748b] uppercase tracking-wider border-b border-[rgba(255,255,255,0.06)] mb-1 flex items-center justify-between">
                <span>Seleccionar Nivel / Stake</span>
                <span className="text-[#10b981] font-bold">FILTRO GLOBAL</span>
              </div>

              <div className="flex flex-col gap-0.5">
                {STAKE_OPTIONS.map((opt) => {
                  const isSelected = opt.id === selectedStake;
                  const count =
                    opt.id === 'all'
                      ? stakeCounts['all'] ?? 0
                      : stakeCounts[opt.id] ?? 0;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onSelectStake(opt.id);
                        setIsOpen(false);
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#10b981]/15 text-[#f8fafc] border border-[#10b981]/40'
                          : 'hover:bg-[#131b2e] text-[#94a3b8] hover:text-[#f8fafc]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: opt.color }}
                        />
                        <div className="flex flex-col">
                          <span
                            className={`font-sans text-[12px] font-bold ${
                              isSelected ? 'text-[#10b981]' : 'text-[#f8fafc]'
                            }`}
                          >
                            {opt.name}
                          </span>
                          <span className="text-[10px] text-[#64748b]">
                            {opt.blinds} • {opt.buyin}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#050507] text-[10px] text-[#94a3b8] border border-[rgba(255,255,255,0.06)]">
                          {count} {count === 1 ? 'ses' : 'ses'}
                        </span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[14px] text-[#10b981]">
                            check
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-1 pt-1.5 border-t border-[rgba(255,255,255,0.06)] px-2 py-1 text-[10px] text-[#64748b] leading-tight">
                💡 Al cambiar de nivel, las gráficas, winrates y auditoría se recalculan automáticamente.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="flex items-center gap-3 shrink-0 font-mono">
        <button
          onClick={onOpenNewSessionModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#10b981] hover:bg-[#34d399] text-[#050507] font-bold text-[12px] transition-all shadow-[0_0_12px_rgba(16,185,129,0.25)] active:scale-95 cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          <span>REGISTRAR SESIÓN</span>
        </button>
      </div>
    </header>
  );
};
