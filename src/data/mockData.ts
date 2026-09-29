import { Session, BankrollLedger } from '../types/poker';

export const INITIAL_LEDGER: BankrollLedger = {
  initialBalance: 0.00,
  currentBalance: 0.00,
  pokerProfit: 0.00,
  totalDeposits: 0.00,
  totalWithdrawals: 0.00,
  rakebackBonuses: 0.00,
  manualAdjustments: 0.00,
  athBalance: 0.00,
  athSessionId: '',
  valleyBalance: 0.00,
  valleySessionId: '',
  maxDrawdown: 0.00,
  currentDrawdown: 0.00,
};

export const INITIAL_SESSIONS: Session[] = [];
