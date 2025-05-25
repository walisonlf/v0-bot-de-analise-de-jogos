# Bot de Análise de Futebol - Sistema Completo

Sistema completo com bot de análise automatizada e dashboard web para monitoramento de apostas esportivas.

## 🚀 Funcionalidades

### 🤖 Bot de Análise
- Coleta automática de dados via The Odds API
- Análise de value betting em tempo real
- Notificações via Telegram
- Execução agendada a cada 12 horas
- Logs detalhados de atividade

### 📊 Dashboard Web
- Monitoramento em tempo real do bot
- Visualização de oportunidades encontradas
- Gráficos de analytics e performance
- Histórico de atividades
- Configurações personalizáveis

## 🛠️ Instalação

### 1. Instalar dependências
\`\`\`bash
npm install
\`\`\`

### 2. Configurar variáveis de ambiente
Copie `.env.local` e configure suas credenciais do Supabase:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 3. Configurar banco de dados
Execute o SQL no Supabase para criar as tabelas necessárias (veja database/schema.sql)

### 4. Iniciar o dashboard
\`\`\`bash
npm run dev
\`\`\`

### 5. Iniciar o bot
\`\`\`bash
npm run bot
\`\`\`

## 📱 Uso

### Dashboard
- Acesse http://localhost:3000
- Monitore o status do bot em tempo real
- Visualize oportunidades e analytics
- Configure parâmetros de análise

### Bot
- Executa automaticamente a cada 12 horas
- Envia notificações para o Telegram
- Salva dados no Supabase
- Logs detalhados no console

## 🔧 Configuração

### Parâmetros do Bot
- **Odds mínimas/máximas**: 1.5 - 5.0
- **Valor mínimo**: 5%
- **Confiança mínima**: 70%
- **Ligas monitoradas**: Premier League, La Liga, Serie A, Bundesliga, Brasileirão

### Telegram
- Token: Configurado automaticamente
- Chat ID: -4980709993
- Mensagens formatadas com HTML

## 📊 Estrutura do Banco

### Tabelas principais:
- `bot_status`: Status e configurações do bot
- `opportunities`: Oportunidades de apostas encontradas
- `daily_analytics`: Métricas diárias de performance
- `activity_logs`: Logs detalhados de atividade

## 🚀 Deploy

### Vercel (Dashboard)
\`\`\`bash
vercel --prod
\`\`\`

### Servidor (Bot)
\`\`\`bash
# PM2 para produção
pm2 start bot/run-bot.js --name "football-bot"
\`\`\`

## 📈 Monitoramento

- Dashboard web em tempo real
- Logs no console
- Notificações Telegram
- Métricas no Supabase

## ⚠️ Importante

- Configure suas próprias credenciais
- Use com responsabilidade
- Apenas para fins educacionais
- Não garantia de lucros
