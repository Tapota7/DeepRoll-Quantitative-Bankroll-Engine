export type Operator = 'GGPoker';

export interface Session {
  id: string; // e.g. "#028"
  date: string; // e.g. "Ayer, 21:15" or ISO
  timestamp: number;
  operator: Operator;
  stake: string; // e.g. "NL5"
  bb: number; // 0.05
  tablesCount?: number;
  hands: number; // e.g. 1240
  durationMinutes: number; // e.g. 130
  durationFormatted: string; // e.g. "2h 10m"
  buyin?: number;
  reloads?: number;
  cashout?: number;
  rakeback: number; // e.g. 4.20
  directProfit: number; // Ganancia de la mesa ($)
  netProfit: number; // directProfit + rakeback
  cajasImpact: number; // netProfit / (100 * bb)
  winrateBB100: number; // (directProfit / bb) / (hands / 100)
  tags: string[]; // ['#ViernesNoche', '#DeepPlay']
  notes: string;
  tiltScore: number; // 1 to 10
  isATH?: boolean;
}

export interface BankrollLedger {
  initialBalance: number;
  currentBalance: number;
  pokerProfit: number;
  totalDeposits: number;
  totalWithdrawals: number;
  rakebackBonuses: number;
  manualAdjustments: number;
  athBalance: number;
  athSessionId: string;
  valleyBalance: number;
  valleySessionId: string;
  maxDrawdown: number;
  currentDrawdown: number;
}

export interface MonteCarloScenario {
  name: string;
  p50Final: number;
  p95Final: number;
  p05Final: number;
  ror: number;
  targetHitProb: number;
  maxDownswingCajas: number;
  kelly: number;
}

export type DesktopTab = 'resumen' | 'sesiones' | 'analisis' | 'banca' | 'configuracion';
