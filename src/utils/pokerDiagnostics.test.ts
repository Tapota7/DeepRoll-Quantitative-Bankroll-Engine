import { generateQuantitativeDiagnostics } from './pokerDiagnostics';
import { Session } from '../types/poker';

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`FAIL: ${msg}`);
  console.log(`✓ ${msg}`);
}

console.log('--- Corriendo Tests de Diagnóstico Cuantitativo: pokerDiagnostics ---');

// Mock data con fatiga clara:
// Sesiones cortas (<90 min): winrate alto (+30 bb/100)
// Sesiones largas (>=90 min): winrate bajo/negativo (-5 bb/100)
const sessionsWithFatigue: Session[] = [
  {
    id: '#001',
    date: '2026-09-01',
    timestamp: 1000,
    operator: 'GGPoker',
    stake: 'NL10 Deep',
    bb: 0.10,
    hands: 600,
    durationMinutes: 60, // corta
    durationFormatted: '1h 0m',
    rakeback: 5,
    directProfit: 18.0, // 18 / 0.10 = 180 bb / 6 = 30 bb/100
    netProfit: 23.0,
    cajasImpact: 2.3,
    winrateBB100: 30.0,
    tags: [],
    notes: '',
    tiltScore: 9,
  },
  {
    id: '#002',
    date: '2026-09-02',
    timestamp: 2000,
    operator: 'GGPoker',
    stake: 'NL10 Deep',
    bb: 0.10,
    hands: 600,
    durationMinutes: 70, // corta
    durationFormatted: '1h 10m',
    rakeback: 5,
    directProfit: 15.0, // 15 / 0.10 = 150 bb / 6 = 25 bb/100
    netProfit: 20.0,
    cajasImpact: 2.0,
    winrateBB100: 25.0,
    tags: [],
    notes: '',
    tiltScore: 9,
  },
  {
    id: '#003',
    date: '2026-09-03',
    timestamp: 3000,
    operator: 'GGPoker',
    stake: 'NL10 Deep',
    bb: 0.10,
    hands: 1200,
    durationMinutes: 130, // larga
    durationFormatted: '2h 10m',
    rakeback: 10,
    directProfit: -12.0, // -12 / 0.10 = -120 bb / 12 = -10 bb/100
    netProfit: -2.0,
    cajasImpact: -0.2,
    winrateBB100: -10.0,
    tags: [],
    notes: '',
    tiltScore: 6,
  },
  {
    id: '#004',
    date: '2026-09-04',
    timestamp: 4000,
    operator: 'GGPoker',
    stake: 'NL10 Deep',
    bb: 0.10,
    hands: 1200,
    durationMinutes: 140, // larga
    durationFormatted: '2h 20m',
    rakeback: 10,
    directProfit: 0.0, // 0 bb/100
    netProfit: 10.0,
    cajasImpact: 1.0,
    winrateBB100: 0.0,
    tags: [],
    notes: '',
    tiltScore: 7,
  },
];

const report = generateQuantitativeDiagnostics(sessionsWithFatigue);

// Test 1: Fatiga
assert(report.fatigue.hasSufficientData === true, 'Tiene suficientes datos de fatiga');
assert(report.fatigue.hasFatigueDrop === true, 'Detecta caída de rendimiento por fatiga');
assert(report.fatigue.shortWinrateBB100 > report.fatigue.longWinrateBB100, 'Winrate corto es mayor que largo');
assert(report.fatigue.recommendation.includes('descansos'), 'Recomienda descansos al detectar fatiga');

// Test 2: Rakeback Profile
// Total net = 23 + 20 - 2 + 10 = 51. Total rakeback = 30. Ratio = 30/51 = ~58.8%
assert(report.rakeback.profile === 'rakeback_grinder', 'Clasificado como rakeback_grinder con 58.8% RB share');
assert(report.rakeback.rakebackSharePct > 50, 'Rakeback share es mayor al 50%');

// Test 3: Estado con lista vacía
const emptyReport = generateQuantitativeDiagnostics([]);
assert(emptyReport.fatigue.hasSufficientData === false, 'Lista vacía no tiene datos de fatiga');
assert(emptyReport.consistency.totalSessions === 0, 'Total sesiones = 0');

console.log('--- Tests de pokerDiagnostics PASARON exitosamente ---');
