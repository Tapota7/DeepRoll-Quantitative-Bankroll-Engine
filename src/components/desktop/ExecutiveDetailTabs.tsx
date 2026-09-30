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
    { id: 'varianza', label: 'Distribución, Matriz & Monte Carlo', icon: 'query_stats' },
  ];

  return (
    <div className="flex flex-col gap-4 w-full font-mono">
      {/* Tab Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-1.5 p-1 bg-[#131b2e] rounded-xl border border-[rgba(255,255,255,0.08)]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1e293b] text-[#38bdf8] border border-[#38bdf8]/30 shadow-sm'
                    : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1a233a]'
                }`}
              >
                <span className={`material-symbols-outlined text-[17px] ${isActive ? 'text-[#38bdf8]' : ''}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded bg-[#050507] text-[10px] text-[#64748b]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
          <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
          <span>Vista bajo demanda • Cero scroll vertical innecesario</span>
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="flex flex-col gap-5 animate-in fade-in duration-150">
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
