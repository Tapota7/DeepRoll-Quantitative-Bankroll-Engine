import { Session, BankrollLedger, Operator } from '../types/poker';

export interface BackupPayload {
  app: 'DeepRoll Quantitative Bankroll Engine';
  version: '2.4';
  exportedAt: string;
  metadata: {
    totalSessions: number;
    totalHands: number;
    totalProfitUSD: number;
    currentBalanceUSD: number;
  };
  ledger: BankrollLedger;
  sessions: Session[];
}

/**
 * Genera y descarga un archivo JSON estructurado con el estado completo del ledger y las sesiones.
 */
export function exportBackupJSON(ledger: BankrollLedger, sessions: Session[]): void {
  const payload: BackupPayload = {
    app: 'DeepRoll Quantitative Bankroll Engine',
    version: '2.4',
    exportedAt: new Date().toISOString(),
    metadata: {
      totalSessions: sessions.length,
      totalHands: sessions.reduce((acc, s) => acc + s.hands, 0),
      totalProfitUSD: ledger.pokerProfit,
      currentBalanceUSD: ledger.currentBalance,
    },
    ledger,
    sessions,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DeepRoll_Ledger_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Genera y descarga un CSV compatible con Excel y Google Sheets.
 */
export function exportBackupCSV(sessions: Session[]): void {
  const headers = [
    'ID',
    'Fecha',
    'Operador',
    'Stake',
    'BigBlind_USD',
    'Manos',
    'Duracion_Minutos',
    'Ganancia_Mesa_USD',
    'Rakeback_USD',
    'Beneficio_Neto_USD',
    'Winrate_bb100',
    'Impacto_Cajas',
    'Tilt_Score',
    'Notas',
  ];

  const escapeCSV = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = sessions.map((s) => [
    escapeCSV(s.id),
    escapeCSV(s.date),
    escapeCSV(s.operator),
    escapeCSV(s.stake),
    escapeCSV(s.bb),
    escapeCSV(s.hands),
    escapeCSV(s.durationMinutes),
    escapeCSV(s.directProfit),
    escapeCSV(s.rakeback),
    escapeCSV(s.netProfit),
    escapeCSV(s.winrateBB100),
    escapeCSV(s.cajasImpact),
    escapeCSV(s.tiltScore),
    escapeCSV(s.notes),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DeepRoll_Sesiones_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Valida y parsea un archivo de backup JSON importado por el usuario.
 */
export async function parseAndValidateBackupJSON(file: File): Promise<{ ledger: BankrollLedger; sessions: Session[] }> {
  const text = await file.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('El archivo seleccionado no es un JSON válido.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Formato de backup inválido: debe ser un objeto.');
  }

  const obj = parsed as Record<string, unknown>;

  // Verificar presencia de sessions y ledger
  if (!Array.isArray(obj.sessions)) {
    throw new Error('El backup no contiene la colección "sessions".');
  }

  if (typeof obj.ledger !== 'object' || obj.ledger === null) {
    throw new Error('El backup no contiene el objeto de estado "ledger".');
  }

  const rawLedger = obj.ledger as Record<string, unknown>;
  const validatedLedger: BankrollLedger = {
    initialBalance: Number(rawLedger.initialBalance) || 0,
    currentBalance: Number(rawLedger.currentBalance) || 0,
    pokerProfit: Number(rawLedger.pokerProfit) || 0,
    totalDeposits: Number(rawLedger.totalDeposits) || 0,
    totalWithdrawals: Number(rawLedger.totalWithdrawals) || 0,
    rakebackBonuses: Number(rawLedger.rakebackBonuses) || 0,
    manualAdjustments: Number(rawLedger.manualAdjustments) || 0,
    athBalance: Number(rawLedger.athBalance) || 0,
    athSessionId: String(rawLedger.athSessionId || '#001'),
    valleyBalance: Number(rawLedger.valleyBalance) || 0,
    valleySessionId: String(rawLedger.valleySessionId || '#001'),
    maxDrawdown: Number(rawLedger.maxDrawdown) || 0,
    currentDrawdown: Number(rawLedger.currentDrawdown) || 0,
  };

  const validatedSessions: Session[] = (obj.sessions as Record<string, unknown>[]).map((s, index) => {
    const bigBlind = Number(s.bb) || 0.05;
    const direct = typeof s.directProfit === 'number' ? s.directProfit : (Number(s.netProfit) || 0) - (Number(s.rakeback) || 0);
    const rb = Number(s.rakeback) || 0;
    const net = typeof s.netProfit === 'number' ? s.netProfit : direct + rb;
    const hands = Math.max(1, Number(s.hands) || 100);
    const durationMin = Number(s.durationMinutes) || 60;

    return {
      id: String(s.id || `#${String(index + 1).padStart(3, '0')}`),
      date: String(s.date || 'Fecha importada'),
      timestamp: Number(s.timestamp) || Date.now(),
      operator: 'GGPoker' as Operator,
      stake: String(s.stake || 'NL5 Deep'),
      bb: bigBlind,
      hands,
      durationMinutes: durationMin,
      durationFormatted: String(s.durationFormatted || `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`),
      rakeback: rb,
      directProfit: direct,
      netProfit: net,
      cajasImpact: typeof s.cajasImpact === 'number' ? s.cajasImpact : parseFloat((net / (100 * bigBlind)).toFixed(2)),
      winrateBB100: typeof s.winrateBB100 === 'number' ? s.winrateBB100 : parseFloat(((direct / bigBlind) / (hands / 100)).toFixed(2)),
      notes: String(s.notes || ''),
      tiltScore: Math.min(10, Math.max(1, Number(s.tiltScore) || 10)),
      tags: Array.isArray(s.tags) ? s.tags.map(String) : [],
    };
  });

  return {
    ledger: validatedLedger,
    sessions: validatedSessions,
  };
}
