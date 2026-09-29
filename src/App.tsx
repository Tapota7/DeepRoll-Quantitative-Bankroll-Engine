import React, { useState, useEffect, useMemo } from 'react';
import {
  Session,
  BankrollLedger,
  DesktopTab,
  Operator,
} from './types/poker';
import { INITIAL_SESSIONS, INITIAL_LEDGER } from './data/mockData';
import { DateRangePreset } from './components/desktop/DateRangeFilterBar';

// Desktop Components
import { DesktopSidebar } from './components/desktop/DesktopSidebar';
import { DesktopHeader } from './components/desktop/DesktopHeader';
import { BankrollGrowthChart } from './components/desktop/BankrollGrowthChart';
import { UnderwaterChart } from './components/desktop/UnderwaterChart';
import { QuantTelemetryRibbon } from './components/desktop/QuantTelemetryRibbon';
import { DistributionHistogram } from './components/desktop/DistributionHistogram';
import { CrossPerformanceMatrix } from './components/desktop/CrossPerformanceMatrix';
import { WeekdayProfitabilityChart } from './components/desktop/WeekdayProfitabilityChart';
import { DailyPerformanceCard } from './components/desktop/DailyPerformanceCard';
import { MonteCarloModule } from './components/desktop/MonteCarloModule';
import { TransitionSimulator } from './components/desktop/TransitionSimulator';
import { SessionsTable } from './components/desktop/SessionsTable';
import { BancaRiesgoView } from './components/desktop/BancaRiesgoView';
import { ConfiguracionView } from './components/desktop/ConfiguracionView';

// Modals
import { EditSessionDrawer } from './components/modals/EditSessionDrawer';
import { DeleteSessionModal } from './components/modals/DeleteSessionModal';
import { ShotPlannerModal } from './components/modals/ShotPlannerModal';
import { NewSessionModal } from './components/modals/NewSessionModal';
import { QuickTransactionModal } from './components/modals/QuickTransactionModal';

export default function App() {
  // Persistent Sessions & Ledger (v2 initialized to zero)
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const saved = localStorage.getItem('deeproll_sessions_v2');
      if (saved) {
        const parsed: Session[] = JSON.parse(saved);
        return parsed.map((s) => ({
          ...s,
          operator: 'GGPoker' as Operator,
          directProfit:
            s.directProfit ??
            (s.cashout != null && s.buyin != null
              ? s.cashout - s.buyin
              : s.netProfit - (s.rakeback || 0)),
        }));
      }
      return INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  const [ledger, setLedger] = useState<BankrollLedger>(() => {
    try {
      const saved = localStorage.getItem('deeproll_ledger_v2');
      return saved ? JSON.parse(saved) : INITIAL_LEDGER;
    } catch {
      return INITIAL_LEDGER;
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('deeproll_sessions_v2', JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('deeproll_ledger_v2', JSON.stringify(ledger));
    } catch (e) {
      console.error(e);
    }
  }, [ledger]);

  // Tab State
  const [desktopTab, setDesktopTab] = useState<DesktopTab>('analisis');

  // Modal States
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deletingSession, setDeletingSession] = useState<Session | null>(null);
  const [isShotPlannerOpen, setIsShotPlannerOpen] = useState<boolean>(false);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState<boolean>(false);
  const [quickTx, setQuickTx] = useState<{
    isOpen: boolean;
    type: 'deposit' | 'withdraw' | 'adjustment';
  }>({
    isOpen: false,
    type: 'deposit',
  });

  // Date Filter State for Auditoría de Sesiones & Associated Charts
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Level / Stake Filter State ('all' | 'NL5 Deep' | 'NL10 Deep' | 'NL25 Deep' | 'NL50 Deep')
  const [selectedStake, setSelectedStake] = useState<string>('all');

  const stakeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: sessions.length,
      'NL5 Deep': 0,
      'NL10 Deep': 0,
      'NL25 Deep': 0,
      'NL50 Deep': 0,
    };
    sessions.forEach((s) => {
      if (s.stake.includes('NL50')) counts['NL50 Deep'] = (counts['NL50 Deep'] || 0) + 1;
      else if (s.stake.includes('NL25')) counts['NL25 Deep'] = (counts['NL25 Deep'] || 0) + 1;
      else if (s.stake.includes('NL10')) counts['NL10 Deep'] = (counts['NL10 Deep'] || 0) + 1;
      else counts['NL5 Deep'] = (counts['NL5 Deep'] || 0) + 1;
    });
    return counts;
  }, [sessions]);

  const filteredSessions = React.useMemo(() => {
    let list = sessions;

    // 1. Date Range Filter
    if (dateRangePreset !== 'all') {
      const latestTs = sessions.length > 0 ? Math.max(...sessions.map((s) => s.timestamp)) : Date.now();
      if (dateRangePreset === '7d') {
        const cutoff = latestTs - 7 * 86400000;
        list = list.filter((s) => s.timestamp >= cutoff);
      } else if (dateRangePreset === '14d') {
        const cutoff = latestTs - 14 * 86400000;
        list = list.filter((s) => s.timestamp >= cutoff);
      } else if (dateRangePreset === '30d') {
        const cutoff = latestTs - 30 * 86400000;
        list = list.filter((s) => s.timestamp >= cutoff);
      } else if (dateRangePreset === 'custom') {
        list = list.filter((s) => {
          let valid = true;
          if (customStartDate) {
            const startTs = new Date(customStartDate + 'T00:00:00').getTime();
            if (s.timestamp < startTs) valid = false;
          }
          if (customEndDate) {
            const endTs = new Date(customEndDate + 'T23:59:59').getTime();
            if (s.timestamp > endTs) valid = false;
          }
          return valid;
        });
      }
    }

    // 2. Stake / Level Filter
    if (selectedStake !== 'all') {
      list = list.filter((s) => {
        if (selectedStake === 'NL5 Deep') return s.stake.includes('NL5') && !s.stake.includes('NL50');
        if (selectedStake === 'NL10 Deep') return s.stake.includes('NL10');
        if (selectedStake === 'NL25 Deep') return s.stake.includes('NL25');
        if (selectedStake === 'NL50 Deep') return s.stake.includes('NL50');
        return s.stake === selectedStake;
      });
    }

    return list;
  }, [sessions, dateRangePreset, customStartDate, customEndDate, selectedStake]);

  // Derive active box size (100bb in USD) from selectedStake
  const activeBoxSize = useMemo(() => {
    if (selectedStake === 'NL5 Deep') return 5.0;
    if (selectedStake === 'NL10 Deep') return 10.0;
    if (selectedStake === 'NL25 Deep') return 25.0;
    if (selectedStake === 'NL50 Deep') return 50.0;
    // 'all': weighted average by hands played
    if (filteredSessions.length === 0) return 5.0;
    const totalHands = filteredSessions.reduce((a, s) => a + s.hands, 0);
    if (totalHands === 0) return (filteredSessions[0]?.bb ?? 0.05) * 100;
    const weightedBB = filteredSessions.reduce((a, s) => a + (s.bb * s.hands), 0) / totalHands;
    return parseFloat((weightedBB * 100).toFixed(2));
  }, [selectedStake, filteredSessions]);

  const handleResetDateFilter = () => {
    setDateRangePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Recalculate Ledger from sessions
  const recalculateLedger = (currentSessions: Session[], currentLedger: BankrollLedger) => {
    const totalPokerProfit = currentSessions.reduce((acc, s) => acc + s.netProfit, 0);
    const newCurrent =
      currentLedger.initialBalance +
      totalPokerProfit +
      currentLedger.totalDeposits -
      currentLedger.totalWithdrawals +
      currentLedger.manualAdjustments;

    // Peak ATH and Max DD
    let running = currentLedger.initialBalance;
    let maxRunning = running;
    let maxSessionId = '#001';
    let maxDD = 0;

    currentSessions
      .slice()
      .reverse()
      .forEach((s) => {
        running += s.netProfit;
        if (running > maxRunning) {
          maxRunning = running;
          maxSessionId = s.id;
        }
        const dd = running - maxRunning;
        if (dd < maxDD) {
          maxDD = dd;
        }
      });

    const currentDD = newCurrent - Math.max(maxRunning, currentLedger.athBalance);

    return {
      ...currentLedger,
      currentBalance: parseFloat(newCurrent.toFixed(2)),
      pokerProfit: parseFloat(totalPokerProfit.toFixed(2)),
      athBalance: parseFloat(Math.max(maxRunning, currentLedger.athBalance).toFixed(2)),
      athSessionId: maxSessionId,
      maxDrawdown: parseFloat(maxDD.toFixed(2)),
      currentDrawdown: parseFloat(currentDD.toFixed(2)),
    };
  };

  // Handlers
  const handleSaveUpdatedSession = (updatedSession: Session) => {
    const updatedList = sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s));
    setSessions(updatedList);
    setLedger((prev) => recalculateLedger(updatedList, prev));
    setEditingSession(null);
  };

  const handleConfirmDelete = (sessionId: string) => {
    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    setLedger((prev) => recalculateLedger(filtered, prev));
    setDeletingSession(null);
  };

  const handleCreateNewSession = (newSession: Session) => {
    const updatedList = [newSession, ...sessions];
    setSessions(updatedList);
    setLedger((prev) => recalculateLedger(updatedList, prev));
  };

  const handleQuickTransaction = (
    type: 'deposit' | 'withdraw' | 'adjustment',
    amount: number,
    source: string
  ) => {
    setLedger((prev) => {
      let deposits = prev.totalDeposits;
      let withdrawals = prev.totalWithdrawals;
      let adjustments = prev.manualAdjustments;

      if (type === 'deposit') deposits += amount;
      if (type === 'withdraw') withdrawals += amount;
      if (type === 'adjustment') adjustments += amount;

      const newBalance =
        prev.initialBalance +
        prev.pokerProfit +
        deposits -
        withdrawals +
        adjustments;

      return {
        ...prev,
        totalDeposits: deposits,
        totalWithdrawals: withdrawals,
        manualAdjustments: adjustments,
        currentBalance: parseFloat(newBalance.toFixed(2)),
      };
    });
  };

  const handleResetData = () => {
    if (confirm('¿Borrar todos los datos y dejar la aplicación en cero?')) {
      setSessions([]);
      setLedger(INITIAL_LEDGER);
      localStorage.removeItem('deeproll_sessions_v2');
      localStorage.removeItem('deeproll_ledger_v2');
      localStorage.removeItem('deeproll_sessions');
      localStorage.removeItem('deeproll_ledger');
    }
  };

  const handleUpdateStartingBalance = (newBase: number) => {
    setLedger((prev) => ({
      ...prev,
      initialBalance: newBase,
      currentBalance: parseFloat(
        (newBase + prev.pokerProfit + prev.totalDeposits - prev.totalWithdrawals + prev.manualAdjustments).toFixed(2)
      ),
    }));
  };

  const tabTitles: Record<DesktopTab, string> = {
    resumen: 'Resumen General',
    sesiones: 'Auditoría de Sesiones',
    analisis: 'Análisis Avanzado',
    banca: 'Banca & Gestión de Riesgo',
    configuracion: 'Configuración del Motor',
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd]">
      {/* DESKTOP APP LAYOUT */}
      <div className="w-full min-h-screen">
        <DesktopSidebar
          activeTab={desktopTab}
          onSelectTab={setDesktopTab}
          ledger={ledger}
          boxSize={activeBoxSize}
        />

        <div className="pl-64">
          <DesktopHeader
            onOpenNewSessionModal={() => setIsNewSessionOpen(true)}
            activeTabTitle={tabTitles[desktopTab]}
            selectedStake={selectedStake}
            onSelectStake={setSelectedStake}
            stakeCounts={stakeCounts}
          />

          <main className="w-full pt-20 px-6 pb-12 min-h-screen flex flex-col gap-5">
            {/* Global Context Indicator & Quick Level Switcher */}
            <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.08)] text-[#94a3b8] text-[12px] font-mono">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold mr-1">
                    Nivel / Stake:
                  </span>
                  {[
                    { id: 'all', label: 'Todos los Niveles', color: '#10b981' },
                    { id: 'NL5 Deep', label: 'NL5 ($0.05)', color: '#34d399' },
                    { id: 'NL10 Deep', label: 'NL10 ($0.10)', color: '#38bdf8' },
                    { id: 'NL25 Deep', label: 'NL25 ($0.25)', color: '#a855f7' },
                    { id: 'NL50 Deep', label: 'NL50 ($0.50)', color: '#f59e0b' },
                  ].map((lvl) => {
                    const isSelected = selectedStake === lvl.id;
                    const count = stakeCounts[lvl.id] ?? 0;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setSelectedStake(lvl.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#050507] text-[#f8fafc] border border-[#10b981]/50 shadow-sm'
                            : 'bg-[#050507]/60 text-[#94a3b8] border border-transparent hover:text-[#f8fafc] hover:border-[rgba(255,255,255,0.08)]'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: lvl.color }}
                        />
                        <span>{lvl.label}</span>
                        <span className="px-1 py-0.2 rounded bg-[#171f33] text-[9.5px] text-[#64748b]">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
                  <span className="text-[#f8fafc] font-semibold text-[11px]">
                    {selectedStake === 'all'
                      ? 'Consolidado Global • Promedio de todos los niveles'
                      : `${selectedStake} • Filtrando ${filteredSessions.length} de ${sessions.length} sesiones`}
                  </span>
                </div>
              </div>

              {/* Telemetry Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[rgba(255,255,255,0.06)] text-[#64748b] text-[11px]">
                <div className="flex items-center gap-4">
                  <span>
                    Muestra:{' '}
                    <strong className="text-[#f8fafc] tabular-nums">
                      {filteredSessions.reduce((a, b) => a + b.hands, 0).toLocaleString()} manos
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Días registrados:{' '}
                    <strong className="text-[#f8fafc] tabular-nums">
                      {filteredSessions.length} {filteredSessions.length === 1 ? 'día' : 'días'}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Winrate medio:{' '}
                    <strong className="text-[#10b981] tabular-nums font-bold">
                      {filteredSessions.reduce((a, b) => a + b.hands, 0) > 0
                        ? `+${(filteredSessions.reduce((a, b) => a + (b.directProfit / b.bb), 0) / (filteredSessions.reduce((a, b) => a + b.hands, 0) / 100)).toFixed(1)} bb/100`
                        : '0.0 bb/100'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span>
                    Neto en periodo:{' '}
                    <strong
                      className={`tabular-nums ${
                        filteredSessions.reduce((a, b) => a + b.netProfit, 0) >= 0
                          ? 'text-[#10b981]'
                          : 'text-[#ef4444]'
                      }`}
                    >
                      {filteredSessions.reduce((a, b) => a + b.netProfit, 0) >= 0 ? '+' : ''}$
                      {filteredSessions.reduce((a, b) => a + b.netProfit, 0).toFixed(2)} USD
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* TAB ROUTING */}
            {desktopTab === 'analisis' && (
              <>
                {/* LEVEL 1: DUAL CHART ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-8">
                    <BankrollGrowthChart ledger={ledger} sessions={filteredSessions} boxSize={activeBoxSize} />
                  </div>
                  <div className="lg:col-span-4">
                    <UnderwaterChart ledger={ledger} sessions={filteredSessions} />
                  </div>
                </div>

                {/* LEVEL 2: 6 SCIENTIFIC KPIS */}
                <QuantTelemetryRibbon ledger={ledger} sessions={filteredSessions} boxSize={activeBoxSize} />

                {/* LEVEL 3: HISTOGRAM & CROSS MATRIX */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-6">
                    <DistributionHistogram sessions={filteredSessions} />
                  </div>
                  <div className="lg:col-span-6">
                    <CrossPerformanceMatrix sessions={filteredSessions} />
                  </div>
                </div>

                {/* LEVEL 3.2: RESUMEN DE RENDIMIENTO DIARIO */}
                <DailyPerformanceCard sessions={filteredSessions} />

                {/* LEVEL 3.3: RENTABILIDAD POR DÍAS DE LA SEMANA (LUNES A DOMINGO) */}
                <WeekdayProfitabilityChart sessions={filteredSessions} />

                {/* LEVEL 3.4: MONTE CARLO PROJECTION */}
                <MonteCarloModule />

                {/* LEVEL 3.5: TRANSITION & BREAK-EVEN SIMULATOR */}
                <TransitionSimulator />

                {/* LEVEL 4: GRANULAR AUDIT TABLE */}
                <SessionsTable
                  sessions={filteredSessions}
                  totalSessionsCount={sessions.length}
                  onEditSession={(s) => setEditingSession(s)}
                  onDeleteSession={(s) => setDeletingSession(s)}
                  dateRangePreset={dateRangePreset}
                  onSelectDatePreset={setDateRangePreset}
                  startDate={customStartDate}
                  endDate={customEndDate}
                  onStartDateChange={setCustomStartDate}
                  onEndDateChange={setCustomEndDate}
                  onResetDateFilter={handleResetDateFilter}
                />
              </>
            )}

            {desktopTab === 'resumen' && (
              <>
                {/* Resumen Executive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-8">
                    <BankrollGrowthChart ledger={ledger} sessions={filteredSessions} boxSize={activeBoxSize} />
                  </div>
                  <div className="lg:col-span-4">
                    <UnderwaterChart ledger={ledger} sessions={filteredSessions} />
                  </div>
                </div>
                <QuantTelemetryRibbon ledger={ledger} sessions={filteredSessions} boxSize={activeBoxSize} />
                <DailyPerformanceCard sessions={filteredSessions} />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-6">
                    <DistributionHistogram sessions={filteredSessions} />
                  </div>
                  <div className="lg:col-span-6">
                    <CrossPerformanceMatrix sessions={filteredSessions} />
                  </div>
                </div>
                <SessionsTable
                  sessions={filteredSessions}
                  totalSessionsCount={sessions.length}
                  onEditSession={(s) => setEditingSession(s)}
                  onDeleteSession={(s) => setDeletingSession(s)}
                  dateRangePreset={dateRangePreset}
                  onSelectDatePreset={setDateRangePreset}
                  startDate={customStartDate}
                  endDate={customEndDate}
                  onStartDateChange={setCustomStartDate}
                  onEndDateChange={setCustomEndDate}
                  onResetDateFilter={handleResetDateFilter}
                />
              </>
            )}

            {desktopTab === 'sesiones' && (
              <>
                <SessionsTable
                  sessions={filteredSessions}
                  totalSessionsCount={sessions.length}
                  onEditSession={(s) => setEditingSession(s)}
                  onDeleteSession={(s) => setDeletingSession(s)}
                  dateRangePreset={dateRangePreset}
                  onSelectDatePreset={setDateRangePreset}
                  startDate={customStartDate}
                  endDate={customEndDate}
                  onStartDateChange={setCustomStartDate}
                  onEndDateChange={setCustomEndDate}
                  onResetDateFilter={handleResetDateFilter}
                />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-6">
                    <DistributionHistogram sessions={filteredSessions} />
                  </div>
                  <div className="lg:col-span-6">
                    <CrossPerformanceMatrix sessions={filteredSessions} />
                  </div>
                </div>
              </>
            )}

            {desktopTab === 'banca' && (
              <BancaRiesgoView
                ledger={ledger}
                boxSize={activeBoxSize}
                onOpenTransactionModal={(type) => setQuickTx({ isOpen: true, type })}
                onOpenShotPlanner={() => setIsShotPlannerOpen(true)}
              />
            )}

            {desktopTab === 'configuracion' && (
              <ConfiguracionView
                ledger={ledger}
                onResetData={handleResetData}
                onUpdateStartingBalance={handleUpdateStartingBalance}
              />
            )}
          </main>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODALS AND DRAWERS */}
      {/* ==================================================================== */}
      {/* 1. Edit Session Drawer */}
      <EditSessionDrawer
        session={editingSession}
        isOpen={editingSession !== null}
        onClose={() => setEditingSession(null)}
        onSave={handleSaveUpdatedSession}
      />

      {/* 2. Delete Session Modal */}
      <DeleteSessionModal
        session={deletingSession}
        isOpen={deletingSession !== null}
        onClose={() => setDeletingSession(null)}
        onConfirmDelete={handleConfirmDelete}
        onSwitchToEdit={(s) => {
          setDeletingSession(null);
          setEditingSession(s);
        }}
        ledger={ledger}
      />

      {/* 3. Shot Planner Modal */}
      <ShotPlannerModal
        isOpen={isShotPlannerOpen}
        onClose={() => setIsShotPlannerOpen(false)}
        ledger={ledger}
        onConfirmProtocol={(stake, budget) => {
          alert(`Protocolo de Shot-Taking para ${stake} activado: Reserva de $${budget} USD configurada con alerta de stop-loss.`);
        }}
      />

      {/* 4. New Session Modal */}
      <NewSessionModal
        isOpen={isNewSessionOpen}
        onClose={() => setIsNewSessionOpen(false)}
        onSaveSession={handleCreateNewSession}
        nextSessionNumber={sessions.length + 1}
      />

      {/* 5. Quick Transaction Modal */}
      <QuickTransactionModal
        isOpen={quickTx.isOpen}
        type={quickTx.type}
        onClose={() => setQuickTx({ ...quickTx, isOpen: false })}
        onConfirm={handleQuickTransaction}
      />
    </div>
  );
}
