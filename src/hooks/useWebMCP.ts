import { useEffect } from 'react';
import { Session, BankrollLedger } from '../types/poker';
import { calculateSessionMetrics } from '../utils/pokerMath';

export interface WebMCPRegisterSessionArgs {
  stake: 'NL5 Deep' | 'NL10 Deep' | 'NL25 Deep' | 'NL50 Deep';
  hands: number;
  durationMinutes: number;
  directProfitUSD: number;
  rakebackUSD?: number;
  notes?: string;
}

export interface UseWebMCPProps {
  ledger: BankrollLedger;
  sessions: Session[];
  activeBoxSize: number;
  onSaveSession: (session: Session) => void;
  nextSessionNumber: number;
}

/**
 * Hook Agent-Native WebMCP para DeepRoll / Némesis Poker.
 * Registra herramientas estructuradas en document.modelContext y window.__DEEPROLL_WEBMCP__
 * permitiendo que agentes de IA o extensiones operen el bankroll sin recurrir a scraping frágil.
 */
export function useWebMCP({
  ledger,
  sessions,
  activeBoxSize,
  onSaveSession,
  nextSessionNumber,
}: UseWebMCPProps) {
  useEffect(() => {
    // 1. Tool Handler: Registrar sesión de poker auditada
    const handleRegisterSession = async (args: WebMCPRegisterSessionArgs) => {
      const {
        stake = 'NL5 Deep',
        hands,
        durationMinutes,
        directProfitUSD,
        rakebackUSD = 0,
        notes = 'Registrado vía Agent-Native WebMCP',
      } = args;

      if (!hands || hands <= 0) {
        throw new Error('Parámetro inválido: "hands" debe ser un número entero mayor a 0.');
      }
      if (!durationMinutes || durationMinutes <= 0) {
        throw new Error('Parámetro inválido: "durationMinutes" debe ser mayor a 0.');
      }

      const metrics = calculateSessionMetrics({
        stake,
        hands,
        durationMinutes,
        directProfit: directProfitUSD,
        rakeback: rakebackUSD,
      });

      const newSession: Session = {
        id: `#0${nextSessionNumber}`,
        date: 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        operator: 'GGPoker',
        stake,
        bb: metrics.bigBlind,
        hands,
        durationMinutes,
        durationFormatted: metrics.durationFormatted,
        rakeback: rakebackUSD,
        directProfit: directProfitUSD,
        netProfit: metrics.netProfit,
        cajasImpact: metrics.cajasImpact,
        winrateBB100: metrics.winrateBB100,
        notes,
        tiltScore: 10,
        tags: ['#AgentNative', '#WebMCP'],
      };

      onSaveSession(newSession);

      return {
        success: true,
        message: `Sesión ${newSession.id} conciliada e insertada en el ledger con éxito.`,
        session: newSession,
        summary: {
          netProfitUSD: newSession.netProfit,
          cajasImpact: newSession.cajasImpact,
          winrateBB100: newSession.winrateBB100,
          hourlyProfitUSD: metrics.hourlyProfitUSD,
        },
      };
    };

    // 2. Tool Handler: Consultar telemetría y estado de banca
    const handleGetBankrollTelemetry = async () => {
      const totalHands = sessions.reduce((acc, s) => acc + s.hands, 0);
      const cajasCount = parseFloat((ledger.currentBalance / activeBoxSize).toFixed(1));

      return {
        success: true,
        currentBalanceUSD: ledger.currentBalance,
        activeBoxSizeUSD: activeBoxSize,
        currentBankrollCajas: cajasCount,
        pokerProfitUSD: ledger.pokerProfit,
        totalSessions: sessions.length,
        totalHands,
        maxDrawdownUSD: ledger.maxDrawdown,
        athBalanceUSD: ledger.athBalance,
      };
    };

    // 3. Registro en el estándar WebMCP del navegador si document.modelContext está presente
    const modelContext = (document as unknown as { modelContext?: { registerTool?: (tool: unknown) => () => void } }).modelContext;
    let unregisterSessionTool: (() => void) | undefined;
    let unregisterStatusTool: (() => void) | undefined;

    if (modelContext && typeof modelContext.registerTool === 'function') {
      unregisterSessionTool = modelContext.registerTool({
        name: 'register_poker_session',
        description: 'Registra y concilia una nueva sesión de poker en el ledger de DeepRoll con métricas cuantitativas calculadas puramente.',
        parameters: {
          type: 'object',
          properties: {
            stake: {
              type: 'string',
              enum: ['NL5 Deep', 'NL10 Deep', 'NL25 Deep', 'NL50 Deep'],
              description: 'Nivel jugado en GGPoker (NL5, NL10, NL25 o NL50).',
            },
            hands: { type: 'number', minimum: 1, description: 'Cantidad total de manos jugadas en la sesión.' },
            durationMinutes: { type: 'number', minimum: 1, description: 'Duración total de la sesión en minutos.' },
            directProfitUSD: { type: 'number', description: 'Ganancia o pérdida directa en la mesa en dólares (excluyendo rakeback).' },
            rakebackUSD: { type: 'number', minimum: 0, description: 'Rakeback acreditado (Fish Buffet).' },
            notes: { type: 'string', description: 'Notas cualitativas sobre la sesión o dinámica de mesa.' },
          },
          required: ['stake', 'hands', 'durationMinutes', 'directProfitUSD'],
        },
        execute: handleRegisterSession,
      });

      unregisterStatusTool = modelContext.registerTool({
        name: 'get_bankroll_telemetry',
        description: 'Obtiene la telemetría en tiempo real de la banca, cajas disponibles según el stake activo y drawdowns.',
        parameters: { type: 'object', properties: {} },
        execute: handleGetBankrollTelemetry,
      });
    }

    // 4. Exposición en API Global para inspección, agentes en DevTools y testing
    const globalWebMCP = {
      version: '1.0.0 (Agent-Native WebMCP)',
      tools: {
        register_poker_session: handleRegisterSession,
        get_bankroll_telemetry: handleGetBankrollTelemetry,
      },
    };

    (window as unknown as { __DEEPROLL_WEBMCP__?: typeof globalWebMCP }).__DEEPROLL_WEBMCP__ = globalWebMCP;

    return () => {
      if (typeof unregisterSessionTool === 'function') unregisterSessionTool();
      if (typeof unregisterStatusTool === 'function') unregisterStatusTool();
    };
  }, [ledger, sessions, activeBoxSize, onSaveSession, nextSessionNumber]);
}
