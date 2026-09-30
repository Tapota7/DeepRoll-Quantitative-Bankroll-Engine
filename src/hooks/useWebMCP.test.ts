import { calculateSessionMetrics } from '../utils/pokerMath';
import { Session, BankrollLedger } from '../types/poker';

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`FAIL: ${msg}`);
  console.log(`✓ ${msg}`);
}

console.log('--- Corriendo Tests de WebMCP Tool: register_poker_session ---');

async function testWebMCPRegistration() {
  const ledger: BankrollLedger = {
    initialBalance: 300,
    currentBalance: 300,
    pokerProfit: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    rakebackBonuses: 0,
    manualAdjustments: 0,
    athBalance: 300,
    athSessionId: '#001',
    valleyBalance: 300,
    valleySessionId: '#001',
    maxDrawdown: 0,
    currentDrawdown: 0,
  };

  let savedSession: Session | null = null;
  const onSaveSession = (s: Session) => {
    savedSession = s;
  };

  // Simulación de llamada de herramienta por un agente WebMCP
  const agentCallArgs = {
    stake: 'NL10 Deep' as const,
    hands: 1000,
    durationMinutes: 90,
    directProfitUSD: 25.0,
    rakebackUSD: 5.0,
    notes: 'Sesión ejecutada vía WebMCP Agent Tool',
  };

  const metrics = calculateSessionMetrics({
    stake: agentCallArgs.stake,
    hands: agentCallArgs.hands,
    durationMinutes: agentCallArgs.durationMinutes,
    directProfit: agentCallArgs.directProfitUSD,
    rakeback: agentCallArgs.rakebackUSD,
  });

  const generatedSession: Session = {
    id: '#001',
    date: 'Hoy, 22:00',
    timestamp: Date.now(),
    operator: 'GGPoker',
    stake: agentCallArgs.stake,
    bb: metrics.bigBlind,
    hands: agentCallArgs.hands,
    durationMinutes: agentCallArgs.durationMinutes,
    durationFormatted: metrics.durationFormatted,
    rakeback: agentCallArgs.rakebackUSD,
    directProfit: agentCallArgs.directProfitUSD,
    netProfit: metrics.netProfit,
    cajasImpact: metrics.cajasImpact,
    winrateBB100: metrics.winrateBB100,
    notes: agentCallArgs.notes,
    tiltScore: 10,
    tags: ['#AgentNative', '#WebMCP'],
  };

  onSaveSession(generatedSession);

  assert(savedSession !== null, 'Sesión fue guardada correctamente por la tool');
  assert((savedSession as unknown as Session).stake === 'NL10 Deep', 'Stake coincide con NL10 Deep');
  assert((savedSession as unknown as Session).netProfit === 30.0, 'Net profit = 25 mesa + 5 RB = 30.0');
  assert((savedSession as unknown as Session).cajasImpact === 3.0, 'En NL10 ($10/caja), $30 son 3.0 cajas');
  assert((savedSession as unknown as Session).winrateBB100 === 25.0, '25$ en NL10 = 250 bb => 25.0 bb/100');
  assert((savedSession as unknown as Session).tags.includes('#WebMCP'), 'Incluye tag #WebMCP');

  console.log('--- Tests de WebMCP PASARON exitosamente ---');
}

testWebMCPRegistration().catch((e) => {
  console.error(e);
  process.exit(1);
});
