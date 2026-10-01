import React from 'react';

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
    shortName: 'Todos',
    blinds: 'Global',
    buyin: 'Todas',
    color: '#34d399',
  },
  {
    id: 'NL5 Deep',
    name: 'NL5 Deep',
    shortName: 'NL5',
    blinds: '$0.05',
    buyin: '$5',
    color: '#34d399',
  },
  {
    id: 'NL10 Deep',
    name: 'NL10 Deep',
    shortName: 'NL10',
    blinds: '$0.10',
    buyin: '$10',
    color: '#38bdf8',
  },
  {
    id: 'NL25 Deep',
    name: 'NL25 Deep',
    shortName: 'NL25',
    blinds: '$0.25',
    buyin: '$25',
    color: '#a855f7',
  },
  {
    id: 'NL50 Deep',
    name: 'NL50 Deep',
    shortName: 'NL50',
    blinds: '$0.50',
    buyin: '$50',
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
  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-[#090a0f]/90 backdrop-blur-md border-b border-white/[0.06] z-40 px-6 flex items-center justify-between gap-4 select-none">
      {/* Active Tab Title */}
      <div className="flex items-center gap-3">
        <h1 className="font-sans text-[15px] font-semibold text-zinc-100 tracking-tight">
          {activeTabTitle}
        </h1>
      </div>

      {/* Sleek Segmented Pill Control for Stake Filtering */}
      <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.06] gap-1">
        {STAKE_OPTIONS.map((opt) => {
          const isSelected = opt.id === selectedStake;
          const count = stakeCounts[opt.id] ?? 0;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectStake(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-sans transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white/[0.12] text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              }`}
            >
              <span>{opt.shortName}</span>
              {count > 0 && (
                <span className={`text-[10px] font-mono ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Button: Nueva Sesión */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenNewSessionModal}
          type="button"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-[#090a0f] font-sans font-semibold text-[12px] shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Registrar Sesión</span>
        </button>
      </div>
    </header>
  );
};
