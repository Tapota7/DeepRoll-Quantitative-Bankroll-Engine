-- ==============================================================================
-- DeepRoll / Némesis Poker - Esquema Canónico Relacional (PostgreSQL / Supabase)
-- Especialidad: database-sql-data-modeling & appsec-code-hardening
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla Maestra de Sesiones Diarias Auditadas
CREATE TABLE IF NOT EXISTS cash_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- auth.users(id) en Supabase
    session_code VARCHAR(20) NOT NULL, -- '#001', '#002', etc.
    played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    operator VARCHAR(50) NOT NULL DEFAULT 'GGPoker' CHECK (operator IN ('GGPoker')),
    stake VARCHAR(20) NOT NULL CHECK (stake IN ('NL5 Deep', 'NL10 Deep', 'NL25 Deep', 'NL50 Deep')),
    big_blind NUMERIC(5, 2) NOT NULL CHECK (big_blind > 0),
    hands_played INTEGER NOT NULL CHECK (hands_played > 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    
    -- Variables Financieras
    table_profit NUMERIC(10, 2) NOT NULL, -- Resultado bruto directo de la mesa
    rakeback NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (rakeback >= 0),
    net_result NUMERIC(10, 2) GENERATED ALWAYS AS (table_profit + rakeback) STORED,
    
    -- Variables Cuantitativas y Psicológicas
    bb_winrate NUMERIC(6, 2) NOT NULL,
    buyin_impact NUMERIC(6, 2) NOT NULL,
    mental_rating SMALLINT NOT NULL DEFAULT 10 CHECK (mental_rating BETWEEN 1 AND 10),
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_user_session_code UNIQUE (user_id, session_code)
);

-- 2. Índices B-Tree Estratégicos para Consultas de Alto Rendimiento
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON cash_sessions (user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_stake ON cash_sessions (user_id, stake, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_winrate ON cash_sessions (user_id, bb_winrate);

-- 3. Tabla de Auditoría Financiera del Ledger Consolidado
CREATE TABLE IF NOT EXISTS bankroll_ledgers (
    user_id UUID PRIMARY KEY,
    initial_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    poker_profit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_deposits NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_withdrawals NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    rakeback_bonuses NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    manual_adjustments NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    ath_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    ath_session_id VARCHAR(50),
    valley_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    valley_session_id VARCHAR(50),
    max_drawdown NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    current_drawdown NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Políticas de Seguridad RLS (Row Level Security) para Supabase
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bankroll_ledgers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage only their own sessions"
ON cash_sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage only their own ledger"
ON bankroll_ledgers FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
