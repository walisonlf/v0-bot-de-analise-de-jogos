# 🚀 GUIA COMPLETO DE EXECUÇÃO

## 📋 Pré-requisitos

1. **Node.js 18+** instalado
2. **npm** instalado
3. **Conta no Supabase** (gratuita)

## 🛠️ Instalação Rápida

### 1. Executar Setup Automático
\`\`\`bash
npm run setup
\`\`\`

### 2. Configurar Supabase

#### 2.1. Criar Projeto no Supabase
1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Crie uma nova organização (se necessário)
4. Clique em "New Project"
5. Escolha um nome e senha
6. Aguarde a criação (2-3 minutos)

#### 2.2. Obter Credenciais
1. Vá em **Settings** > **API**
2. Copie a **URL** do projeto
3. Copie a **anon/public** key

#### 2.3. Configurar Banco de Dados
1. Vá em **SQL Editor**
2. Clique em "New Query"
3. Cole o SQL fornecido no arquivo `database/supabase-setup.sql`
4. Clique em "Run" para executar

#### 2.4. Configurar Variáveis de Ambiente
Edite o arquivo `.env.local`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
\`\`\`

## 🧪 Testar Conexões

\`\`\`bash
npm run test-bot
\`\`\`

Este comando testa:
- ✅ Conexão com Telegram
- ✅ Conexão com The Odds API
- ✅ Conexão com Supabase

## 🚀 Executar o Sistema

### Opção 1: Dashboard + Bot (Recomendado)
\`\`\`bash
./start-all.sh
\`\`\`

### Opção 2: Apenas Dashboard
\`\`\`bash
./start-dashboard.sh
\`\`\`
Acesse: http://localhost:3000

### Opção 3: Apenas Bot
\`\`\`bash
./start-bot.sh
\`\`\`

## 📱 Verificar Funcionamento

### Dashboard
1. Acesse http://localhost:3000
2. Verifique se os dados aparecem
3. Teste as abas: Oportunidades, Analytics, Atividade

### Bot
1. Verifique mensagens no Telegram
2. Acompanhe logs no terminal
3. Verifique dados no dashboard

## 🔧 Solução de Problemas

### Erro: "Invalid URL"
- ✅ Configure as variáveis do Supabase no `.env.local`
- ✅ Reinicie a aplicação

### Erro: "relation does not exist"
- ✅ Execute o SQL no Supabase
- ✅ Verifique se as tabelas foram criadas

### Bot não envia mensagens
- ✅ Verifique se o bot foi adicionado ao grupo
- ✅ Teste com `npm run test-bot`

### API Odds não funciona
- ✅ Verifique se a chave API está válida
- ✅ Verifique limite de requisições

## 📊 Monitoramento

### Logs do Bot
\`\`\`bash
# Ver logs em tempo real
tail -f logs/bot.log
\`\`\`

### Status no Dashboard
- Acesse a aba "Atividade" para ver logs
- Verifique o status do bot na página principal

## 🔄 Atualizações

### Atualizar Dependências
\`\`\`bash
npm update
\`\`\`

### Reiniciar Serviços
\`\`\`bash
# Parar tudo: Ctrl+C
# Iniciar novamente:
./start-all.sh
\`\`\`

## 📈 Configurações Avançadas

### Alterar Frequência do Bot
Edite `bot/run-bot.js`, linha com `cron.schedule`:
\`\`\`js
// A cada 6 horas
cron.schedule("0 */6 * * *", () => {

// A cada hora
cron.schedule("0 * * * *", () => {

// Todos os dias às 9h e 21h
cron.schedule("0 9,21 * * *", () => {
\`\`\`

### Alterar Critérios de Análise
Edite as constantes em `bot/run-bot.js`:
\`\`\`js
MIN_ODDS: 1.5,        // Odds mínimas
MAX_ODDS: 5.0,        // Odds máximas
MIN_VALUE_THRESHOLD: 0.05,  // 5% valor mínimo
MIN_CONFIDENCE: 0.7,  // 70% confiança mínima
\`\`\`

## 🎯 Próximos Passos

1. ✅ Sistema funcionando
2. 📊 Acompanhar resultados
3. 🔧 Ajustar parâmetros conforme necessário
4. 📈 Analisar performance no dashboard
5. 🚀 Deploy em produção (opcional)

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs
2. Execute `npm run test-bot`
3. Consulte este guia
4. Verifique configurações do Supabase

---

**✅ Sistema pronto para uso!**
