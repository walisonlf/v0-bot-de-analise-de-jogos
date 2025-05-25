#!/bin/bash

# Script de configuração automática do ambiente

echo "🤖 Configuração Automática do Bot de Análise Pré-Live de Futebol..."
echo "=================================================================="

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado. Instale Python 3.11+ primeiro."
    exit 1
fi

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Atualizar pip
pip install --upgrade pip

# Instalar dependências
echo "📚 Instalando dependências..."
pip install -r requirements.txt

# Executar configuração automática
echo "🔑 Executando configuração automática de credenciais..."
python scripts/auto_setup.py

# Verificar se a configuração foi bem-sucedida
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SETUP COMPLETO!"
    echo ""
    echo "🚀 Para iniciar o bot agora, execute:"
    echo "   source venv/bin/activate"
    echo "   python run_bot.py"
    echo ""
    echo "📊 Ou para usar Docker:"
    echo "   docker-compose up -d"
    echo ""
    echo "📋 Comandos úteis:"
    echo "   - Ver logs: tail -f bot.log"
    echo "   - Parar Docker: docker-compose down"
    echo "   - Ver status: docker-compose ps"
else
    echo "❌ Erro na configuração automática. Verifique os logs acima."
    exit 1
fi
