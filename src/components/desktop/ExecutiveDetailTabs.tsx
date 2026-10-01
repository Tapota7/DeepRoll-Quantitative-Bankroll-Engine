import React, { useState } from 'react';
import { Session } from '../../types/poker';
import { DateRangePreset } from './DateRangeFilterBar';
import { SessionsTable } from './SessionsTable';
import { DailyPerformanceCard } from './DailyPerformanceCard';
import { WeekdayProfitabilityChart } from './WeekdayProfitabilityChart';
import { DistributionHistogram } from './DistributionHistogram';
import { CrossPerformanceMatrix } from './CrossPerformanceMatrix';
import { MonteCarloModule } from './MonteCarloModule';
import { TransitionSimulator } from './TransitionSimulator';

interface ExecutiveDetailTabsProps {
  sessions: Session[];
  totalSessionsCount: number;
  onEditSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
  dateRangePreset: DateRangePreset;
  onSelectDatePreset: (preset: DateRangePreset) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onResetDateFilter: () => void;
  defaultSubTab?: 'sesiones' | 'rendimiento' | 'varianza';
}

export const ExecutiveDetailTabs: React.FC<ExecutiveDetailTabsProps> = ({
  sessions,
  totalSessionsCount,
  onEditSession,
  onDeleteSession,
  dateRangePreset,
  onSelectDatePreset,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onResetDateFilter,
  defaultSubTab = 'sesiones',
}) => {
  const [activeTab, setActiveTab] = useState<'sesiones' | 'rendimiento' | 'varianza'>(defaultSubTab);

  const tabs: { id: 'sesiones' | 'rendimiento' | 'varianza'; label: string; icon: string; badge?: string }[] = [
    { id: 'sesiones', label: 'Auditoría de Sesiones', icon: 'table_view', badge: `${sessions.length}` },
    { id: 'rendimiento', label: 'Rendimiento Diario & Calendario', icon: 'calendar_view_week' },
    { id: 'varianza', label: 'Distribución & Modelos', icon: 'query_stats' },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-sans transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.1] text-white font-medium shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className={`material-symbols-outlined text-[16px] ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-[10px] text-zinc-400 font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-[12px] text-zinc-500 font-sans">
          Vista bajo demanda
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="flex flex-col gap-5">
        {activeTab === 'sesiones' && (
          <SessionsTable
            sessions={sessions}
            totalSessionsCount={totalSessionsCount}
            onEditSession={onEditSession}
            onDeleteSession={onDeleteSession}
            dateRangePreset={dateRangePreset}
            onSelectDatePreset={onSelectDatePreset}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            onResetDateFilter={onResetDateFilter}
          />
        )}

        {activeTab === 'rendimiento' && (
          <>
            <DailyPerformanceCard sessions={sessions} />
            <WeekdayProfitabilityChart sessions={sessions} />
          </>
        )}

        {activeTab === 'varianza' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-6">
                <DistributionHistogram sessions={sessions} />
              </div>
              <div className="lg:col-span-6">
                <CrossPerformanceMatrix sessions={sessions} />
              </div>
            </div>
            <MonteCarloModule />
            <TransitionSimulator />
          </>
        )}
      </div>
    </div>
  );
};
