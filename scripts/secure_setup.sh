#!/bin/bash

# Script de configuração segura completa

set -e  # Parar em caso de erro

echo "🔐 Configuração Segura do Bot de Análise de Futebol"
echo "=================================================="

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado. Instale Python 3.11+ primeiro."
    exit 1
fi

# Criar ambiente virtual
echo "📦 Criando ambiente virtual..."
python3 -m venv venv
source venv/bin/activate

# Atualizar pip
pip install --upgrade pip

# Instalar dependências
echo "📚 Instalando dependências..."
pip install -r requirements.txt

# Instalar dependências de segurança
pip install cryptography keyring python-dotenv

# Criar diretórios necessários
echo "📁 Criando estrutura de diretórios..."
mkdir -p {data,logs,config,backup,export}

# Configurar permissões restritivas
chmod 700 {config,backup,export}
chmod 755 {data,logs}

# Configurar credenciais
echo "🔑 Configurando credenciais..."
python scripts/setup_credentials.py

# Criar script de inicialização segura
cat > start_bot_secure.sh << 'EOF'
#!/bin/bash

# Script de inicialização segura

# Verificar se as credenciais estão configuradas
echo "🔍 Verificando credenciais..."
python scripts/setup_credentials.py test

if [ $? -ne 0 ]; then
    echo "❌ Credenciais não configuradas corretamente"
    echo "Execute: python scripts/setup_credentials.py"
    exit 1
fi

# Verificar permissões de arquivos
echo "🔒 Verificando permissões..."
find config -type f -exec chmod 600 {} \;
find backup -type f -exec chmod 600 {} \;

# Iniciar bot
echo "🚀 Iniciando bot..."
python run_bot.py
EOF

chmod +x start_bot_secure.sh

# Configurar .gitignore seguro
cat > .gitignore << 'EOF'
# Credenciais e dados sensíveis
.env
config/
backup/
export/

# Logs
*.log
logs/

# Dados
data/

# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
pip-log.txt
pip-delete-this-directory.txt
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.log
.git
.mypy_cache
.pytest_cache
.hypothesis

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF

# Configurar hooks de segurança
echo "🛡️  Configurando hooks de segurança..."
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Hook de pré-commit para verificar segurança

echo "🔍 Verificando segurança antes do commit..."

# Verificar se há credenciais no código
if grep -r "ODDS_API_KEY\|TELEGRAM_BOT_TOKEN" --include="*.py" src/ 2>/dev/null; then
    echo "❌ ERRO: Credenciais encontradas no código!"
    echo "Use variáveis de ambiente ou arquivos de configuração seguros."
    exit 1
fi

# Verificar se arquivos sensíveis estão sendo commitados
sensitive_files=(".env" "config/" "backup/" "*.key" "*.enc")
for pattern in "${sensitive_files[@]}"; do
    if git diff --cached --name-only | grep -q "$pattern"; then
        echo "❌ ERRO: Tentativa de commit de arquivo sensível: $pattern"
        exit 1
    fi
done

echo "✅ Verificação de segurança passou"
EOF

chmod +x .git/hooks/pre-commit

# Configurar monitoramento de segurança
cat > scripts/security_monitor.py << 'EOF'
#!/usr/bin/env python3
"""
Monitor de segurança para o bot
"""

import os
import stat
import logging
from pathlib import Path

def check_file_permissions():
    """Verifica permissões de arquivos sensíveis"""
    sensitive_paths = [
        Path('.env'),
        Path('config/'),
        Path('backup/'),
        Path('export/')
    ]
    
    issues = []
    
    for path in sensitive_paths:
        if path.exists():
            if path.is_file():
                mode = oct(stat.S_IMODE(path.stat().st_mode))
                if mode != '0o600':
                    issues.append(f"{path}: permissões {mode} (deveria ser 0o600)")
            elif path.is_dir():
                mode = oct(stat.S_IMODE(path.stat().st_mode))
                if mode != '0o700':
                    issues.append(f"{path}: permissões {mode} (deveria ser 0o700)")
    
    return issues

def check_git_security():
    """Verifica configurações de segurança do Git"""
    issues = []
    
    # Verificar .gitignore
    gitignore = Path('.gitignore')
    if gitignore.exists():
        content = gitignore.read_text()
        required_patterns = ['.env', 'config/', '*.key', '*.enc']
        
        for pattern in required_patterns:
            if pattern not in content:
                issues.append(f".gitignore: padrão '{pattern}' ausente")
    else:
        issues.append(".gitignore não encontrado")
    
    return issues

def main():
    """Executa verificações de segurança"""
    print("🛡️  Monitor de Segurança")
    print("=" * 25)
    
    all_issues = []
    
    # Verificar permissões
    perm_issues = check_file_permissions()
    all_issues.extend(perm_issues)
    
    # Verificar Git
    git_issues = check_git_security()
    all_issues.extend(git_issues)
    
    if all_issues:
        print("⚠️  Problemas de segurança encontrados:")
        for issue in all_issues:
            print(f"   - {issue}")
        return 1
    else:
        print("✅ Todas as verificações de segurança passaram")
        return 0

if __name__ == "__main__":
    exit(main())
EOF

chmod +x scripts/security_monitor.py

echo ""
echo "✅ Configuração segura concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Ative o ambiente virtual: source venv/bin/activate"
echo "2. Execute o monitor de segurança: python scripts/security_monitor.py"
echo "3. Inicie o bot: ./start_bot_secure.sh"
echo ""
echo "🔧 Comandos úteis:"
echo "- Rotar credenciais: python scripts/credential_manager.py rotate"
echo "- Exportar credenciais: python scripts/credential_manager.py export"
echo "- Validar configuração: python scripts/credential_manager.py validate"
echo ""
echo "⚠️  IMPORTANTE:"
echo "- Mantenha suas credenciais seguras"
echo "- Execute verificações de segurança regularmente"
echo "- Nunca commite arquivos sensíveis"
