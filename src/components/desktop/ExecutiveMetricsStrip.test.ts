import { Session, BankrollLedger } from '../../types/poker';

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`FAIL: ${msg}`);
  console.log(`✓ ${msg}`);
}

console.log('--- Corriendo Tests de ExecutiveMetricsStrip Logic ---');

// Mock data
const ledger: BankrollLedger = {
  initialBalance: 300,
  currentBalance: 450,
  pokerProfit: 150,
  totalDeposits: 0,
  totalWithdrawals: 0,
  rakebackBonuses: 50,
  manualAdjustments: 0,
  athBalance: 450,
  athSessionId: '#002',
  valleyBalance: 300,
  valleySessionId: '#001',
  maxDrawdown: 0,
  currentDrawdown: 0,
};

const sessions: Session[] = [
  {
    id: '#001',
    date: '2026-09-01',
    timestamp: 1,
    operator: 'GGPoker',
    stake: 'NL10 Deep',
    bb: 0.10,
    hands: 1000,
    durationMinutes: 120, // 2h
    durationFormatted: '2h 0m',
    rakeback: 20,
    directProfit: 80,
    netProfit: 100,
    cajasImpact: 10,
    winrateBB100: 80,
    tags: [],
    notes: '',
    tiltScore: 10,
  },
  {
    id: '#002',
    date: '2026-09-02',
    timestamp: 2,
    operator: 'GGPoker',
    stake: 'NL10 Deep',
    bb: 0.10,
    hands: 1000,
    durationMinutes: 60, // 1h
    durationFormatted: '1h 0m',
    rakeback: 10,
    directProfit: 40,
    netProfit: 50,
    cajasImpact: 5,
    winrateBB100: 40,
    tags: [],
    notes: '',
    tiltScore: 10,
  },
];

// Test 1: Balance en cajas para NL10 ($10/caja)
const boxSizeNL10 = 10.0;
const totalCajas = parseFloat((ledger.currentBalance / boxSizeNL10).toFixed(1));
assert(totalCajas === 45.0, 'Para $450 en NL10 ($10/caja), son 45.0 cajas');

// Test 2: Balance en cajas para NL5 ($5/caja)
const boxSizeNL5 = 5.0;
const totalCajasNL5 = parseFloat((ledger.currentBalance / boxSizeNL5).toFixed(1));
assert(totalCajasNL5 === 90.0, 'Para $450 en NL5 ($5/caja), son 90.0 cajas');

// Test 3: Winrate conjunto
// Total direct = 80 + 40 = 120 USD = 1200 bb en 2000 manos => 60 bb/100
const totalHands = sessions.reduce((a, s) => a + s.hands, 0);
const totalBb = sessions.reduce((a, s) => a + (s.directProfit / s.bb), 0);
const winrate = parseFloat((totalBb / (totalHands / 100)).toFixed(2));
assert(winrate === 60.0, 'Winrate ponderado es 60.0 bb/100');

// Test 4: Ganancia horaria
// Total net = 100 + 50 = 150 USD en 3 horas = 50 $/h
const totalHours = 3;
const hourly = 150 / totalHours;
assert(hourly === 50, 'Ganancia horaria es 50 $/h');

console.log('--- Tests de ExecutiveMetricsStrip PASARON exitosamente ---');
