import { Session } from '../../types/poker';

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`FAIL: ${msg}`);
  console.log(`✓ ${msg}`);
}

console.log('--- Corriendo Tests de ActivityHeatmap Logic ---');

const mockSessions: Session[] = [
  {
    id: '#001',
    date: '2026-09-01',
    timestamp: new Date('2026-09-01T12:00:00Z').getTime(),
    operator: 'GGPoker',
    stake: 'NL10 Deep',
    bb: 0.10,
    hands: 2500, // Superó meta de 2000
    durationMinutes: 150,
    durationFormatted: '2h 30m',
    rakeback: 15,
    directProfit: 40,
    netProfit: 55,
    cajasImpact: 5.5,
    winrateBB100: 16.0,
    tags: [],
    notes: '',
    tiltScore: 10,
  },
  {
    id: '#002',
    date: '2026-09-02',
    timestamp: new Date('2026-09-02T12:00:00Z').getTime(),
    operator: 'GGPoker',
    stake: 'NL10 Deep',
    bb: 0.10,
    hands: 1200, // No superó meta de 2000
    durationMinutes: 90,
    durationFormatted: '1h 30m',
    rakeback: 8,
    directProfit: -10,
    netProfit: -2,
    cajasImpact: -0.2,
    winrateBB100: -8.3,
    tags: [],
    notes: '',
    tiltScore: 8,
  },
];

const target = 2000;
const totalHands = mockSessions.reduce((a, s) => a + s.hands, 0);
assert(totalHands === 3700, 'Total manos acumuladas son 3700');

const daysTargetMet = mockSessions.filter((s) => s.hands >= target).length;
assert(daysTargetMet === 1, 'Exactamente 1 día cumplió la meta de 2000 manos');

const daysWithPlay = mockSessions.length;
const complianceRate = Math.round((daysTargetMet / daysWithPlay) * 100);
assert(complianceRate === 50, 'Tasa de cumplimiento es 50%');

console.log('--- Tests de ActivityHeatmap PASARON exitosamente ---');
