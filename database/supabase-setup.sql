-- =====================================================
-- CONFIGURAÇÃO COMPLETA DO SUPABASE
-- Execute este SQL no SQL Editor do Supabase
-- =====================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar tabela para status do bot
CREATE TABLE IF NOT EXISTS public.bot_status (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'offline',
    last_analysis TIMESTAMPTZ,
    next_analysis TIMESTAMPTZ,
    games_analyzed_today INTEGER DEFAULT 0,
    opportunities_found_today INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela para oportunidades de apostas
CREATE TABLE IF NOT EXISTS public.opportunities (
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
    commence_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criar tabela para analytics diários
CREATE TABLE IF NOT EXISTS public.daily_analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    games_analyzed INTEGER DEFAULT 0,
    opportunities_found INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    total_value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Criar tabela para logs de atividade
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_league ON public.opportunities(league);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON public.activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON public.daily_analytics(date DESC);

-- 7. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar trigger para bot_status
DROP TRIGGER IF EXISTS update_bot_status_updated_at ON public.bot_status;
CREATE TRIGGER update_bot_status_updated_at
    BEFORE UPDATE ON public.bot_status
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Inserir dados iniciais

-- Status inicial do bot
INSERT INTO public.bot_status (id, status, created_at, updated_at) 
VALUES (1, 'offline', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
    updated_at = NOW();

-- Analytics dos últimos 7 dias (dados de exemplo)
INSERT INTO public.daily_analytics (date, games_analyzed, opportunities_found, success_rate, total_value) VALUES
    (CURRENT_DATE - INTERVAL '6 days', 15, 3, 75.50, 245.80),
    (CURRENT_DATE - INTERVAL '5 days', 22, 5, 82.10, 412.30),
    (CURRENT_DATE - INTERVAL '4 days', 18, 2, 68.30, 156.90),
    (CURRENT_DATE - INTERVAL '3 days', 25, 7, 89.20, 623.45),
    (CURRENT_DATE - INTERVAL '2 days', 20, 4, 76.80, 298.70),
    (CURRENT_DATE - INTERVAL '1 day', 19, 6, 91.40, 534.20),
    (CURRENT_DATE, 12, 2, 85.00, 187.60)
ON CONFLICT (date) DO UPDATE SET 
    games_analyzed = EXCLUDED.games_analyzed,
    opportunities_found = EXCLUDED.opportunities_found,
    success_rate = EXCLUDED.success_rate,
    total_value = EXCLUDED.total_value;

-- Oportunidades de exemplo
INSERT INTO public.opportunities (
    home_team, away_team, league, market, selection, 
    odds, value, confidence, bookmaker, commence_time, status
) VALUES
    ('Manchester City', 'Liverpool', 'soccer_england_premier_league', '1X2', 'Manchester City', 2.10, 0.0850, 0.7500, 'Bet365', NOW() + INTERVAL '2 hours', 'pending'),
    ('Barcelona', 'Real Madrid', 'soccer_spain_la_liga', 'Over/Under', 'Over 2.5', 1.85, 0.1200, 0.8200, 'Betfair', NOW() + INTERVAL '1 day', 'pending'),
    ('Flamengo', 'Palmeiras', 'soccer_brazil_serie_a', '1X2', 'Empate', 3.20, 0.1500, 0.7800, 'Betano', NOW() + INTERVAL '3 hours', 'won'),
    ('Bayern Munich', 'Borussia Dortmund', 'soccer_germany_bundesliga', '1X2', 'Bayern Munich', 1.95, 0.0900, 0.7300, 'Betway', NOW() + INTERVAL '5 hours', 'pending'),
    ('Juventus', 'AC Milan', 'soccer_italy_serie_a', 'Over/Under', 'Under 2.5', 2.45, 0.1100, 0.7900, 'Pinnacle', NOW() + INTERVAL '6 hours', 'lost'),
    ('Arsenal', 'Chelsea', 'soccer_england_premier_league', '1X2', 'Arsenal', 2.30, 0.0750, 0.7200, 'William Hill', NOW() + INTERVAL '8 hours', 'pending'),
    ('Atletico Madrid', 'Sevilla', 'soccer_spain_la_liga', 'Over/Under', 'Over 1.5', 1.65, 0.0650, 0.7100, 'Bet365', NOW() + INTERVAL '12 hours', 'won')
ON CONFLICT (id) DO NOTHING;

-- Logs de atividade de exemplo
INSERT INTO public.activity_logs (type, message, details) VALUES
    ('analysis', 'Sistema iniciado - Primeira análise em execução', '{"version": "1.0.0", "startup_time": "2024-01-15T10:00:00Z"}'),
    ('analysis', 'Análise iniciada para 25 jogos das principais ligas europeias', '{"leagues": ["Premier League", "La Liga", "Serie A", "Bundesliga", "Brasileirão"], "games_count": 25}'),
    ('opportunity', 'Nova oportunidade identificada: Manchester City vs Liverpool', '{"market": "1X2", "selection": "Manchester City", "value": "8.5%", "confidence": "75%", "odds": 2.10}'),
    ('opportunity', 'Nova oportunidade identificada: Barcelona vs Real Madrid', '{"market": "Over/Under", "selection": "Over 2.5", "value": "12.0%", "confidence": "82%", "odds": 1.85}'),
    ('success', 'Aposta vencedora: Flamengo vs Palmeiras - Empate', '{"odds": 3.20, "profit": "15.0%", "confidence": "78%"}'),
    ('success', 'Aposta vencedora: Arsenal vs Chelsea - Arsenal', '{"odds": 2.30, "profit": "7.5%", "confidence": "72%"}'),
    ('error', 'Falha temporária na conexão com The Odds API', '{"error_code": "TIMEOUT", "retry_count": 2, "next_retry": "2024-01-15T10:05:00Z"}'),
    ('analysis', 'Ciclo de análise concluído com sucesso', '{"games_analyzed": 18, "opportunities_found": 4, "execution_time": "45s", "api_calls": 12}'),
    ('analysis', 'Análise agendada executada automaticamente', '{"trigger": "cron", "schedule": "every_12_hours", "games_found": 22}'),
    ('opportunity', 'Oportunidade de alto valor detectada: Bayern vs Dortmund', '{"market": "1X2", "selection": "Bayern Munich", "value": "9.0%", "confidence": "73%", "odds": 1.95}')
ON CONFLICT (id) DO NOTHING;

-- 10. Configurar Row Level Security (RLS) - OPCIONAL
-- Descomente as linhas abaixo se quiser habilitar segurança por linha

-- ALTER TABLE public.bot_status ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (para o dashboard)
-- CREATE POLICY "Allow public read access" ON public.bot_status FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access" ON public.opportunities FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access" ON public.daily_analytics FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access" ON public.activity_logs FOR SELECT USING (true);

-- 11. Verificar se tudo foi criado corretamente
DO $$
BEGIN
    -- Verificar tabelas
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bot_status') THEN
        RAISE NOTICE '✅ Tabela bot_status criada com sucesso';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'opportunities') THEN
        RAISE NOTICE '✅ Tabela opportunities criada com sucesso';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_analytics') THEN
        RAISE NOTICE '✅ Tabela daily_analytics criada com sucesso';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_logs') THEN
        RAISE NOTICE '✅ Tabela activity_logs criada com sucesso';
    END IF;
    
    RAISE NOTICE '🎉 Configuração do Supabase concluída com sucesso!';
    RAISE NOTICE '📊 Dados de exemplo inseridos';
    RAISE NOTICE '🚀 Sistema pronto para uso';
END $$;

-- 12. Mostrar resumo dos dados inseridos
SELECT 
    'bot_status' as tabela,
    COUNT(*) as registros
FROM public.bot_status
UNION ALL
SELECT 
    'opportunities' as tabela,
    COUNT(*) as registros
FROM public.opportunities
UNION ALL
SELECT 
    'daily_analytics' as tabela,
    COUNT(*) as registros
FROM public.daily_analytics
UNION ALL
SELECT 
    'activity_logs' as tabela,
    COUNT(*) as registros
FROM public.activity_logs
ORDER BY tabela;
