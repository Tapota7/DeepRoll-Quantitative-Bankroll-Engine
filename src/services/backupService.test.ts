import { parseAndValidateBackupJSON } from './backupService';
import { Session, BankrollLedger } from '../types/poker';

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`FAIL: ${msg}`);
  console.log(`✓ ${msg}`);
}

console.log('--- Corriendo Tests de Servicio: backupService ---');

async function runTests() {
  const mockLedger: BankrollLedger = {
    initialBalance: 500,
    currentBalance: 820.5,
    pokerProfit: 320.5,
    totalDeposits: 0,
    totalWithdrawals: 0,
    rakebackBonuses: 50,
    manualAdjustments: 0,
    athBalance: 820.5,
    athSessionId: '#010',
    valleyBalance: 480,
    valleySessionId: '#002',
    maxDrawdown: -20,
    currentDrawdown: 0,
  };

  const mockSession: Session = {
    id: '#001',
    date: 'Hoy, 20:00',
    timestamp: Date.now(),
    operator: 'GGPoker',
    stake: 'NL10 Deep',
    bb: 0.10,
    hands: 1500,
    durationMinutes: 120,
    durationFormatted: '2h 0m',
    rakeback: 12.5,
    directProfit: 45.0,
    netProfit: 57.5,
    cajasImpact: 5.75,
    winrateBB100: 30.0,
    tags: ['#A-Game'],
    notes: 'Excelente sesión',
    tiltScore: 10,
  };

  // 1. Simular archivo válido
  const validPayload = {
    app: 'DeepRoll Quantitative Bankroll Engine',
    version: '2.4',
    ledger: mockLedger,
    sessions: [mockSession],
  };

  const fakeFile = {
    text: async () => JSON.stringify(validPayload),
  } as unknown as File;

  const result = await parseAndValidateBackupJSON(fakeFile);
  assert(result.sessions.length === 1, 'Importa exactamente 1 sesión');
  assert(result.sessions[0].id === '#001', 'Conserva ID de sesión #001');
  assert(result.sessions[0].stake === 'NL10 Deep', 'Conserva stake NL10 Deep');
  assert(result.ledger.currentBalance === 820.5, 'Conserva balance del ledger 820.5');

  // 2. Simular archivo corrupto / incompleto
  const corruptFile = {
    text: async () => JSON.stringify({ invalid: true }),
  } as unknown as File;

  let errorThrown = false;
  try {
    await parseAndValidateBackupJSON(corruptFile);
  } catch (err: unknown) {
    errorThrown = true;
    assert((err as Error).message.includes('sessions'), 'Captura error de archivo sin sessions');
  }
  assert(errorThrown, 'Archivo inválido rechaza importación de forma segura');

  console.log('--- Tests de backupService PASARON exitosamente ---');
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
