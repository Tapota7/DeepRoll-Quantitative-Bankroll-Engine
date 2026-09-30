import { calculateSessionMetrics, getBigBlindFromStake, formatDuration } from './pokerMath';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
  console.log(`✓ ${message}`);
}

console.log('--- Corriendo Tests de Dominio Cuantitativo: pokerMath ---');

// Test 1: Blind detection
assert(getBigBlindFromStake('NL5 Deep') === 0.05, 'NL5 Deep bb debe ser 0.05');
assert(getBigBlindFromStake('NL10 Deep') === 0.10, 'NL10 Deep bb debe ser 0.10');
assert(getBigBlindFromStake('NL25 Deep') === 0.25, 'NL25 Deep bb debe ser 0.25');
assert(getBigBlindFromStake('NL50 Deep') === 0.50, 'NL50 Deep bb debe ser 0.50');

// Test 2: Formato de duración
assert(formatDuration(90) === '1h 30m', '90 minutos formateado a 1h 30m');
assert(formatDuration(120) === '2h 0m', '120 minutos formateado a 2h 0m');
assert(formatDuration(45) === '0h 45m', '45 minutos formateado a 0h 45m');

// Test 3: Sesión ganadora en NL5
// 1200 manos, mesa +28.50, rakeback +3.80 => net = +32.30
// bbWon = 28.50 / 0.05 = 570 bb => winrate = 570 / 12 = 47.5 bb/100
// cajasImpact = 32.30 / 5.00 = +6.46 cajas
const nl5Result = calculateSessionMetrics({
  stake: 'NL5 Deep',
  hands: 1200,
  durationMinutes: 120,
  directProfit: 28.50,
  rakeback: 3.80,
});
assert(nl5Result.bigBlind === 0.05, 'NL5 bigBlind = 0.05');
assert(nl5Result.buyinCaja === 5.00, 'NL5 buyinCaja = 5.00');
assert(nl5Result.netProfit === 32.30, 'NL5 netProfit = 32.30 (28.50 + 3.80)');
assert(nl5Result.winrateBB100 === 47.5, 'NL5 winrateBB100 = 47.5 bb/100');
assert(nl5Result.cajasImpact === 6.46, 'NL5 cajasImpact = +6.46 cajas');
assert(nl5Result.hourlyProfitUSD === 16.15, 'NL5 hourlyProfitUSD = 32.30 / 2h = 16.15');

// Test 4: Sesión perdedora en mesa pero salvada parcialmente por Fish Buffet en NL10
// 1000 manos, mesa -15.00, rakeback +10.00 => net = -5.00
// bbWon = -15 / 0.10 = -150 bb => winrate = -15.0 bb/100
// cajasImpact = -5.00 / 10.00 = -0.50 cajas
const nl10Result = calculateSessionMetrics({
  stake: 'NL10 Deep',
  hands: 1000,
  durationMinutes: 60,
  directProfit: -15.00,
  rakeback: 10.00,
});
assert(nl10Result.bigBlind === 0.10, 'NL10 bigBlind = 0.10');
assert(nl10Result.buyinCaja === 10.00, 'NL10 buyinCaja = 10.00');
assert(nl10Result.netProfit === -5.00, 'NL10 netProfit = -5.00');
assert(nl10Result.winrateBB100 === -15.0, 'NL10 winrateBB100 = -15.0 bb/100');
assert(nl10Result.cajasImpact === -0.50, 'NL10 cajasImpact = -0.50 cajas');

// Test 5: Manejo de borde: 0 manos o duración 0
const edgeResult = calculateSessionMetrics({
  stake: 'NL50 Deep',
  hands: 0,
  durationMinutes: 0,
  directProfit: 0,
  rakeback: 0,
});
assert(edgeResult.winrateBB100 === 0, '0 manos no genera división por cero');
assert(edgeResult.cajasImpact === 0, '0 ganancia da 0 cajas');
assert(edgeResult.hourlyProfitUSD === 0, '0 minutos da 0 $/h');

console.log('--- Todos los tests unitarios PASARON exitosamente ---');
