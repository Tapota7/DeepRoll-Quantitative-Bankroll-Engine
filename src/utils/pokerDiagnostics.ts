import { Session } from '../types/poker';

export interface FatigueDiagnostic {
  hasSufficientData: boolean;
  shortSessionCount: number;
  longSessionCount: number;
  shortWinrateBB100: number; // < 90 min
  longWinrateBB100: number;  // >= 90 min
  winrateDeltaBB100: number; // short - long
  hasFatigueDrop: boolean;
  recommendation: string;
}

export interface RakebackDiagnostic {
  hasSufficientData: boolean;
  totalDirectUSD: number;
  totalRakebackUSD: number;
  totalNetUSD: number;
  rakebackSharePct: number;
  profile: 'natural_winner' | 'rakeback_grinder' | 'table_bleeder' | 'neutral';
  title: string;
  description: string;
}

export interface ConsistencyDiagnostic {
  totalSessions: number;
  totalHands: number;
  avgHandsPerSession: number;
  estimatedWeeklyHands: number;
  negativeStreakDays: number;
  avgTiltScore: number;
  healthScore: number; // 0 a 100
  status: 'optimo' | 'moderado' | 'alerta';
  message: string;
}

export interface QuantitativeDiagnosticReport {
  fatigue: FatigueDiagnostic;
  rakeback: RakebackDiagnostic;
  consistency: ConsistencyDiagnostic;
}

/**
 * Calcula el winrate ponderado por manos (bb/100) para un subconjunto de sesiones.
 */
function calculateWeightedWinrate(sessions: Session[]): number {
  const totalHands = sessions.reduce((acc, s) => acc + s.hands, 0);
  if (totalHands === 0) return 0;
  const totalBb = sessions.reduce((acc, s) => acc + (s.directProfit / s.bb), 0);
  return parseFloat(((totalBb / (totalHands / 100))).toFixed(2));
}

/**
 * Motor de Diagnóstico Cuantitativo Heurístico para Némesis / DeepRoll
 */
export function generateQuantitativeDiagnostics(sessions: Session[]): QuantitativeDiagnosticReport {
  const totalSessions = sessions.length;
  const totalHands = sessions.reduce((acc, s) => acc + s.hands, 0);
  const totalDirectUSD = parseFloat(sessions.reduce((acc, s) => acc + s.directProfit, 0).toFixed(2));
  const totalRakebackUSD = parseFloat(sessions.reduce((acc, s) => acc + s.rakeback, 0).toFixed(2));
  const totalNetUSD = parseFloat((totalDirectUSD + totalRakebackUSD).toFixed(2));

  // 1. Análisis de Fatiga y Rendimiento por Duración (<90 min vs >=90 min)
  const shortSessions = sessions.filter((s) => s.durationMinutes < 90);
  const longSessions = sessions.filter((s) => s.durationMinutes >= 90);
  const hasSufficientFatigueData = shortSessions.length >= 2 && longSessions.length >= 2;

  const shortWinrate = calculateWeightedWinrate(shortSessions);
  const longWinrate = calculateWeightedWinrate(longSessions);
  const winrateDelta = parseFloat((shortWinrate - longWinrate).toFixed(2));
  const hasFatigueDrop = hasSufficientFatigueData && winrateDelta >= 2.5;

  let fatigueRec = 'Acumula más sesiones para mapear la curva de fatiga mental.';
  if (hasSufficientFatigueData) {
    if (hasFatigueDrop) {
      fatigueRec = `Se detecta una caída de ${winrateDelta.toFixed(1)} bb/100 en sesiones ≥90 min. Tu rendimiento óptimo ocurre en bloques de 60 a 75 minutos. Planifica descansos obligatorios.`;
    } else if (winrateDelta <= -2.5) {
      fatigueRec = `Tu winrate mejora +${Math.abs(winrateDelta).toFixed(1)} bb/100 en sesiones largas. Tienes buena resistencia mental y aprovechas el cansancio de los rivales.`;
    } else {
      fatigueRec = 'Mantienes una estabilidad de winrate sólida tanto en sesiones cortas como extensas.';
    }
  }

  const fatigue: FatigueDiagnostic = {
    hasSufficientData: hasSufficientFatigueData,
    shortSessionCount: shortSessions.length,
    longSessionCount: longSessions.length,
    shortWinrateBB100: shortWinrate,
    longWinrateBB100: longWinrate,
    winrateDeltaBB100: winrateDelta,
    hasFatigueDrop,
    recommendation: fatigueRec,
  };

  // 2. Análisis de Dependencia de Rakeback (Fish Buffet Leverage)
  let rakebackShare = 0;
  if (totalNetUSD > 0) {
    rakebackShare = parseFloat(Math.min(100, Math.max(0, (totalRakebackUSD / totalNetUSD) * 100)).toFixed(1));
  } else if (totalRakebackUSD > 0) {
    rakebackShare = 100;
  }

  let profile: 'natural_winner' | 'rakeback_grinder' | 'table_bleeder' | 'neutral' = 'neutral';
  let rbTitle = 'Muestra en Recopilación';
  let rbDesc = 'Se necesitan sesiones registradas para categorizar tu ratio de ganancia neta vs. recompensas.';

  if (totalSessions >= 3) {
    if (totalDirectUSD > 0 && rakebackShare < 40) {
      profile = 'natural_winner';
      rbTitle = 'Ganador Natural en Mesas';
      rbDesc = `El ${ (100 - rakebackShare).toFixed(0) }% de tus ingresos proviene de tu edge técnico directo contra los rivales. El Fish Buffet es un multiplicador adicional.`;
    } else if (totalNetUSD > 0 && (totalDirectUSD <= 0 || rakebackShare >= 40)) {
      profile = 'rakeback_grinder';
      rbTitle = 'Rakeback Grinder / Varianza Neutralizada';
      rbDesc = `El Fish Buffet representa el ${rakebackShare.toFixed(0)}% de tu beneficio total. Tu volumen de juego sostiene la rentabilidad absorbiendo los costos del rake.`;
    } else if (totalNetUSD <= 0) {
      profile = 'table_bleeder';
      rbTitle = 'Déficit en Mesa > Rakeback';
      rbDesc = 'Las pérdidas directas superan la amortización del Fish Buffet. Se requiere auditoría de líneas y revisión de rangos.';
    }
  }

  const rakeback: RakebackDiagnostic = {
    hasSufficientData: totalSessions >= 3,
    totalDirectUSD,
    totalRakebackUSD,
    totalNetUSD,
    rakebackSharePct: rakebackShare,
    profile,
    title: rbTitle,
    description: rbDesc,
  };

  // 3. Consistencia, Rachas y Salud Operativa
  // Calcular racha negativa actual (>=2 días consecutivos con netProfit < 0)
  const sortedDesc = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
  let streakCount = 0;
  for (const s of sortedDesc) {
    if (s.netProfit < 0) streakCount++;
    else break;
  }
  const negativeStreakDays = streakCount >= 2 ? streakCount : 0;

  const avgTilt = totalSessions > 0
    ? parseFloat((sessions.reduce((acc, s) => acc + (s.tiltScore || 10), 0) / totalSessions).toFixed(1))
    : 10;

  const avgHands = totalSessions > 0 ? Math.round(totalHands / totalSessions) : 0;
  const estimatedWeekly = avgHands * Math.min(7, Math.max(1, totalSessions));

  // Score de salud de 0 a 100
  let health = 70;
  if (totalDirectUSD > 0) health += 15;
  if (avgTilt >= 8) health += 10;
  if (negativeStreakDays >= 3) health -= 25;
  else if (negativeStreakDays === 2) health -= 10;
  if (hasFatigueDrop) health -= 10;
  const healthScore = Math.min(100, Math.max(10, health));

  const consistency: ConsistencyDiagnostic = {
    totalSessions,
    totalHands,
    avgHandsPerSession: avgHands,
    estimatedWeeklyHands: estimatedWeekly,
    negativeStreakDays,
    avgTiltScore: avgTilt,
    healthScore,
    status: healthScore >= 75 ? 'optimo' : healthScore >= 50 ? 'moderado' : 'alerta',
    message: negativeStreakDays >= 2
      ? `Racha de ${negativeStreakDays} días en negativo. Monitorea el stop-loss y reduce mesas si es necesario.`
      : 'Cadencia de juego y estabilidad psicológica bajo control.',
  };

  return {
    fatigue,
    rakeback,
    consistency,
  };
}
