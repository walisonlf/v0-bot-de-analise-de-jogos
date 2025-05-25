-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela para status do bot
CREATE TABLE IF NOT EXISTS bot_status (
  id SERIAL PRIMARY KEY,
  status VARCHAR(20) NOT NULL DEFAULT 'offline',
  last_analysis TIMESTAMP,
  next_analysis TIMESTAMP,
  games_analyzed_today INTEGER DEFAULT 0,
  opportunities_found_today INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para oportunidades de apostas
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id VARCHAR(255),
  home_team VARCHAR(255) NOT NULL,
  away_team VARCHAR(255) NOT NULL,
  league VARCHAR(255) NOT NULL,
  market VARCHAR(100) NOT NULL,
  selection VARCHAR(255) NOT NULL,
  odds DECIMAL(10,2) NOT NULL,
  value DECIMAL(5,4) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  bookmaker VARCHAR(255) NOT NULL,
  commence_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para analytics diários
CREATE TABLE IF NOT EXISTS daily_analytics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  games_analyzed INTEGER DEFAULT 0,
  opportunities_found INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para logs de atividade
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir status inicial do bot
INSERT INTO bot_status (status, updated_at) 
VALUES ('offline', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- Inserir dados de exemplo para analytics (últimos 7 dias)
INSERT INTO daily_analytics (date, games_analyzed, opportunities_found, success_rate) VALUES
  (CURRENT_DATE - INTERVAL '6 days', 15, 3, 75.5),
  (CURRENT_DATE - INTERVAL '5 days', 22, 5, 82.1),
  (CURRENT_DATE - INTERVAL '4 days', 18, 2, 68.3),
  (CURRENT_DATE - INTERVAL '3 days', 25, 7, 89.2),
  (CURRENT_DATE - INTERVAL '2 days', 20, 4, 76.8),
  (CURRENT_DATE - INTERVAL '1 day', 19, 6, 91.4),
  (CURRENT_DATE, 12, 2, 85.0)
ON CONFLICT (date) DO UPDATE SET 
  games_analyzed = EXCLUDED.games_analyzed,
  opportunities_found = EXCLUDED.opportunities_found,
  success_rate = EXCLUDED.success_rate;

-- Inserir algumas oportunidades de exemplo
INSERT INTO opportunities (
  home_team, away_team, league, market, selection, 
  odds, value, confidence, bookmaker, commence_time, status
) VALUES
  ('Manchester City', 'Liverpool', 'soccer_england_premier_league', '1X2', 'Manchester City', 2.10, 0.08, 0.75, 'Bet365', CURRENT_TIMESTAMP + INTERVAL '2 hours', 'pending'),
  ('Barcelona', 'Real Madrid', 'soccer_spain_la_liga', 'Over/Under', 'Over 2.5', 1.85, 0.12, 0.82, 'Betfair', CURRENT_TIMESTAMP + INTERVAL '1 day', 'pending'),
  ('Flamengo', 'Palmeiras', 'soccer_brazil_serie_a', '1X2', 'Empate', 3.20, 0.15, 0.78, 'Betano', CURRENT_TIMESTAMP + INTERVAL '3 hours', 'won'),
  ('Bayern Munich', 'Borussia Dortmund', 'soccer_germany_bundesliga', '1X2', 'Bayern Munich', 1.95, 0.09, 0.73, 'Betway', CURRENT_TIMESTAMP + INTERVAL '5 hours', 'pending'),
  ('Juventus', 'AC Milan', 'soccer_italy_serie_a', 'Over/Under', 'Under 2.5', 2.45, 0.11, 0.79, 'Pinnacle', CURRENT_TIMESTAMP + INTERVAL '6 hours', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Inserir logs de atividade de exemplo
INSERT INTO activity_logs (type, message, details) VALUES
  ('analysis', 'Análise iniciada para 25 jogos das principais ligas europeias', '{"leagues": ["Premier League", "La Liga", "Serie A"], "games_count": 25}'),
  ('opportunity', 'Nova oportunidade identificada: Manchester City vs Liverpool', '{"market": "1X2", "value": "8.5%", "confidence": "75%"}'),
  ('success', 'Aposta vencedora: Barcelona vs Real Madrid - Over 2.5 gols', '{"odds": 1.85, "profit": "12.3%"}'),
  ('error', 'Falha na conexão com The Odds API - tentando novamente', '{"error_code": "TIMEOUT", "retry_count": 2}'),
  ('analysis', 'Ciclo de análise concluído com sucesso', '{"games_analyzed": 18, "opportunities_found": 4, "execution_time": "45s"}')
ON CONFLICT (id) DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date DESC);

-- Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_bot_status_updated_at ON bot_status;
CREATE TRIGGER update_bot_status_updated_at
    BEFORE UPDATE ON bot_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
