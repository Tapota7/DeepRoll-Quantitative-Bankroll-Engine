/**
 * Dominio Matemático y Cuantitativo de Sesiones de Cash Game
 * Desacoplado de la UI para garantizar pureza y testing unitario.
 */

export interface SessionCalculationInput {
  stake: string;
  hands: number;
  durationMinutes: number;
  directProfit: number;
  rakeback: number;
}

export interface SessionCalculationResult {
  bigBlind: number;
  buyinCaja: number;
  netProfit: number;
  bbWon: number;
  winrateBB100: number;
  cajasImpact: number;
  hourlyProfitUSD: number;
  durationFormatted: string;
}

/**
 * Retorna el valor de la ciega grande (Big Blind en USD) según el stake.
 */
export function getBigBlindFromStake(stake: string): number {
  if (stake.includes('NL50')) return 0.50;
  if (stake.includes('NL25')) return 0.25;
  if (stake.includes('NL10')) return 0.10;
  return 0.05; // NL5 Deep por defecto
}

/**
 * Formatea minutos a formato legible "Xh Ym"
 */
export function formatDuration(durationMinutes: number): string {
  const safeMinutes = Math.max(0, Math.floor(durationMinutes || 0));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Calcula todas las métricas derivadas de una sesión de poker:
 * - Net Profit = directProfit (mesa) + rakeback (Fish Buffet)
 * - bbWon = directProfit / bigBlind (el winrate en ciegas mide la habilidad en mesa)
 * - winrateBB100 = bbWon / (hands / 100)
 * - cajasImpact = netProfit / (100 * bigBlind)
 * - hourlyProfitUSD = netProfit / (durationMinutes / 60)
 */
export function calculateSessionMetrics(input: SessionCalculationInput): SessionCalculationResult {
  const bigBlind = getBigBlindFromStake(input.stake);
  const buyinCaja = 100 * bigBlind;
  
  const direct = typeof input.directProfit === 'number' && !isNaN(input.directProfit) ? input.directProfit : 0;
  const rb = typeof input.rakeback === 'number' && !isNaN(input.rakeback) ? input.rakeback : 0;
  const hands = typeof input.hands === 'number' && !isNaN(input.hands) ? Math.max(0, input.hands) : 0;
  const duration = typeof input.durationMinutes === 'number' && !isNaN(input.durationMinutes) ? Math.max(0, input.durationMinutes) : 0;

  const netProfit = parseFloat((direct + rb).toFixed(2));
  const bbWon = direct / bigBlind;
  const winrateBB100 = hands > 0 ? parseFloat((bbWon / (hands / 100)).toFixed(2)) : 0;
  const cajasImpact = parseFloat((netProfit / buyinCaja).toFixed(2));
  
  const hours = duration / 60;
  const hourlyProfitUSD = hours > 0 ? parseFloat((netProfit / hours).toFixed(2)) : 0;

  return {
    bigBlind,
    buyinCaja,
    netProfit,
    bbWon: parseFloat(bbWon.toFixed(2)),
    winrateBB100,
    cajasImpact,
    hourlyProfitUSD,
    durationFormatted: formatDuration(duration),
  };
}
