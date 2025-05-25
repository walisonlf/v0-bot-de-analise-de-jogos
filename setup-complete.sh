#!/bin/bash

echo "🚀 CONFIGURAÇÃO COMPLETA DO BOT DE ANÁLISE DE FUTEBOL"
echo "=================================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    echo "   Download: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado."
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

# Verificar se a instalação foi bem-sucedida
if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso!"
else
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

# Criar arquivo .env.local se não existir
if [ ! -f ".env.local" ]; then
    echo ""
    echo "📝 Criando arquivo .env.local..."
    cat > .env.local << 'EOF'
# Supabase Configuration
# IMPORTANTE: Substitua pelos seus valores reais do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Bot Configuration (já configurado)
ODDS_API_KEY=b20a60c467789212e83880d469695b0a
TELEGRAM_BOT_TOKEN=8149354380:AAGLNGoQI1hqM2M1mJq6uF05uw397i9kFmY
TELEGRAM_CHAT_ID=-4980709993
EOF
    echo "✅ Arquivo .env.local criado!"
    echo "⚠️  IMPORTANTE: Edite o .env.local com suas credenciais do Supabase"
else
    echo "✅ Arquivo .env.local já existe"
fi

# Criar scripts de execução
echo ""
echo "📜 Criando scripts de execução..."

# Script para iniciar o dashboard
cat > start-dashboard.sh << 'EOF'
#!/bin/bash
echo "🌐 Iniciando Dashboard Web..."
echo "📍 Acesse: http://localhost:3000"
echo "⏹️  Para parar: Ctrl+C"
echo ""
npm run dev
EOF

# Script para iniciar o bot
cat > start-bot.sh << 'EOF'
#!/bin/bash
echo "🤖 Iniciando Bot de Análise..."
echo "📱 Mensagens serão enviadas para o Telegram"
echo "⏹️  Para parar: Ctrl+C"
echo ""
npm run bot
EOF

# Script para iniciar ambos
cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando Sistema Completo..."
echo ""

# Função para cleanup
cleanup() {
    echo ""
    echo "🛑 Parando todos os processos..."
    kill $DASHBOARD_PID $BOT_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Iniciar dashboard em background
echo "🌐 Iniciando Dashboard..."
npm run dev &
DASHBOARD_PID=$!

# Aguardar um pouco
sleep 3

# Iniciar bot em background
echo "🤖 Iniciando Bot..."
npm run bot &
BOT_PID=$!

echo ""
echo "✅ Sistema iniciado com sucesso!"
echo "📍 Dashboard: http://localhost:3000"
echo "📱 Bot: Enviando mensagens para Telegram"
echo "⏹️  Para parar tudo: Ctrl+C"
echo ""

# Aguardar indefinidamente
wait
EOF

# Tornar scripts executáveis
chmod +x start-dashboard.sh start-bot.sh start-all.sh

echo "✅ Scripts criados:"
echo "   - start-dashboard.sh (apenas dashboard)"
echo "   - start-bot.sh (apenas bot)"
echo "   - start-all.sh (dashboard + bot)"

echo ""
echo "🎉 CONFIGURAÇÃO CONCLUÍDA!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Configure o Supabase (veja instruções abaixo)"
echo "2. Execute: ./start-dashboard.sh (para testar o dashboard)"
echo "3. Execute: ./start-bot.sh (para testar o bot)"
echo "4. Execute: ./start-all.sh (para executar tudo junto)"
echo ""
echo "🔧 CONFIGURAÇÃO DO SUPABASE:"
echo "1. Acesse: https://supabase.com"
echo "2. Crie um novo projeto"
echo "3. Vá em Settings > API"
echo "4. Copie a URL e a chave anon"
echo "5. Execute o SQL fornecido no SQL Editor"
echo "6. Edite o arquivo .env.local com suas credenciais"
echo ""
echo "✅ Pronto para usar!"
