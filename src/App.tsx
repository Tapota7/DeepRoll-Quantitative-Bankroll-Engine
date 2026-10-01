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
import { ActivityHeatmap } from './components/desktop/ActivityHeatmap';
import { DailyProfitBarChart } from './components/desktop/DailyProfitBarChart';
import { WeekdayProfitabilityChart } from './components/desktop/WeekdayProfitabilityChart';
import { ExecutiveMetricsStrip } from './components/desktop/ExecutiveMetricsStrip';
import { SessionsTable } from './components/desktop/SessionsTable';
import { ConfiguracionView } from './components/desktop/ConfiguracionView';

// Modals
import { EditSessionDrawer } from './components/modals/EditSessionDrawer';
import { DeleteSessionModal } from './components/modals/DeleteSessionModal';
import { NewSessionModal } from './components/modals/NewSessionModal';
import { QuickTransactionModal } from './components/modals/QuickTransactionModal';
import { useWebMCP } from './hooks/useWebMCP';

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
  const [desktopTab, setDesktopTab] = useState<DesktopTab>('resumen');

  // Modal States
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deletingSession, setDeletingSession] = useState<Session | null>(null);
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

  // Agent-Native WebMCP Runtime: expone herramientas estructuradas para agentes autónomos
  useWebMCP({
    ledger,
    sessions,
    activeBoxSize,
    onSaveSession: handleCreateNewSession,
    nextSessionNumber: sessions.length + 1,
  });

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

  const handleImportBackup = (importedData: { ledger: BankrollLedger; sessions: Session[] }) => {
    setSessions(importedData.sessions);
    setLedger(importedData.ledger);
  };

  const tabTitles: Record<DesktopTab, string> = {
    resumen: 'Dashboard',
    sesiones: 'Auditoría de Sesiones',
    analisis: 'Dashboard',
    banca: 'Dashboard',
    configuracion: 'Configuración del Motor',
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 font-sans selection:bg-[#34d399]/20 selection:text-white">
      {/* DESKTOP APP LAYOUT */}
      <div className="w-full min-h-screen">
        <DesktopSidebar
          activeTab={desktopTab}
          onSelectTab={setDesktopTab}
          ledger={ledger}
          boxSize={activeBoxSize}
        />

        <div className="pl-60">
          <DesktopHeader
            onOpenNewSessionModal={() => setIsNewSessionOpen(true)}
            activeTabTitle={tabTitles[desktopTab]}
            selectedStake={selectedStake}
            onSelectStake={setSelectedStake}
            stakeCounts={stakeCounts}
          />

          <main className="w-full pt-18 px-8 pb-12 min-h-screen flex flex-col gap-6 max-w-7xl mx-auto">
            {/* TAB ROUTING */}
            {desktopTab === 'resumen' && (
              <>
                {/* 4 GOLDEN EXECUTIVE KPIS */}
                <ExecutiveMetricsStrip
                  ledger={ledger}
                  sessions={filteredSessions}
                  boxSize={activeBoxSize}
                  selectedStake={selectedStake}
                />

                {/* GITHUB-STYLE 6-MONTH ACTIVITY HEATMAP */}
                <ActivityHeatmap sessions={filteredSessions} />

                {/* DUAL INTERACTIVE CHARTS: DAILY PNL BARS & WEEKDAY PROFITABILITY */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7">
                    <DailyProfitBarChart sessions={filteredSessions} />
                  </div>
                  <div className="lg:col-span-5">
                    <WeekdayProfitabilityChart sessions={filteredSessions} />
                  </div>
                </div>

                {/* BANKROLL GROWTH EVOLUTION */}
                <BankrollGrowthChart
                  ledger={ledger}
                  sessions={filteredSessions}
                  boxSize={activeBoxSize}
                />

                {/* AUDITORÍA Y TABLA DE SESIONES */}
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
            )}

            {desktopTab === 'configuracion' && (
              <ConfiguracionView
                ledger={ledger}
                sessions={sessions}
                onResetData={handleResetData}
                onUpdateStartingBalance={handleUpdateStartingBalance}
                onImportBackup={handleImportBackup}
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

      {/* 3. New Session Modal */}
      <NewSessionModal
        isOpen={isNewSessionOpen}
        onClose={() => setIsNewSessionOpen(false)}
        onSaveSession={handleCreateNewSession}
        nextSessionNumber={sessions.length + 1}
      />

      {/* 4. Quick Transaction Modal */}
      <QuickTransactionModal
        isOpen={quickTx.isOpen}
        type={quickTx.type}
        onClose={() => setQuickTx({ ...quickTx, isOpen: false })}
        onConfirm={handleQuickTransaction}
      />
    </div>
  );
}
