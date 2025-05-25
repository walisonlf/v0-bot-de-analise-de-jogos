"""
Script para configuração segura de credenciais
"""

import os
import json
import getpass
import keyring
from pathlib import Path
from cryptography.fernet import Fernet
import sys

class CredentialSetup:
    """Configurador de credenciais seguras"""
    
    def __init__(self):
        self.service_name = "football-betting-bot"
        self.config_dir = Path('config')
        self.config_dir.mkdir(exist_ok=True)
    
    def interactive_setup(self):
        """Configuração interativa de credenciais"""
        print("🔐 Configuração Segura de Credenciais")
        print("=" * 50)
        
        # Coletar credenciais
        credentials = self._collect_credentials()
        
        # Escolher método de armazenamento
        storage_method = self._choose_storage_method()
        
        # Armazenar credenciais
        if storage_method == '1':
            self._setup_environment_variables(credentials)
        elif storage_method == '2':
            self._setup_encrypted_file(credentials)
        elif storage_method == '3':
            self._setup_keyring(credentials)
        elif storage_method == '4':
            self._setup_config_file(credentials)
        
        print("\n✅ Credenciais configuradas com sucesso!")
        print("⚠️  Mantenha suas credenciais seguras e nunca as compartilhe.")
    
    def _collect_credentials(self) -> dict:
        """Coleta credenciais do usuário"""
        print("\n📝 Insira suas credenciais:")
        
        credentials = {}
        
        # API Key da The Odds API
        print("\n1. The Odds API Key:")
        print("   Obtenha em: https://the-odds-api.com/")
        credentials['ODDS_API_KEY'] = getpass.getpass("   API Key: ").strip()
        
        # Token do Bot Telegram
        print("\n2. Telegram Bot Token:")
        print("   Obtenha com @BotFather no Telegram")
        credentials['TELEGRAM_BOT_TOKEN'] = getpass.getpass("   Bot Token: ").strip()
        
        # Chat ID do Telegram
        print("\n3. Telegram Chat ID:")
        print("   Use @userinfobot para descobrir o ID do seu grupo")
        credentials['TELEGRAM_CHAT_ID'] = input("   Chat ID: ").strip()
        
        # Validar credenciais
        if not self._validate_credentials(credentials):
            print("❌ Credenciais inválidas. Tente novamente.")
            return self._collect_credentials()
        
        return credentials
    
    def _validate_credentials(self, credentials: dict) -> bool:
        """Valida formato das credenciais"""
        # Validar API Key (deve ter pelo menos 32 caracteres)
        if len(credentials['ODDS_API_KEY']) < 32:
            print("❌ API Key muito curta")
            return False
        
        # Validar Token do Telegram
        if ':' not in credentials['TELEGRAM_BOT_TOKEN']:
            print("❌ Token do Telegram inválido")
            return False
        
        # Validar Chat ID
        try:
            int(credentials['TELEGRAM_CHAT_ID'])
        except ValueError:
            print("❌ Chat ID deve ser numérico")
            return False
        
        return True
    
    def _choose_storage_method(self) -> str:
        """Permite escolher método de armazenamento"""
        print("\n🔒 Escolha o método de armazenamento:")
        print("1. Variáveis de ambiente (.env)")
        print("2. Arquivo criptografado (mais seguro)")
        print("3. Keyring do sistema (recomendado)")
        print("4. Arquivo JSON (menos seguro)")
        
        while True:
            choice = input("\nEscolha (1-4): ").strip()
            if choice in ['1', '2', '3', '4']:
                return choice
            print("❌ Escolha inválida. Digite 1, 2, 3 ou 4.")
    
    def _setup_environment_variables(self, credentials: dict):
        """Configura variáveis de ambiente"""
        env_file = Path('.env')
        
        env_content = f"""# Credenciais do Bot de Análise de Futebol
# MANTENHA ESTE ARQUIVO SEGURO E NÃO O COMPARTILHE

# The Odds API
ODDS_API_KEY={credentials['ODDS_API_KEY']}

# Telegram
TELEGRAM_BOT_TOKEN={credentials['TELEGRAM_BOT_TOKEN']}
TELEGRAM_CHAT_ID={credentials['TELEGRAM_CHAT_ID']}

# Configurações opcionais
LOG_LEVEL=INFO
DATABASE_PATH=./data/football_bot.db
"""
        
        with open(env_file, 'w') as f:
            f.write(env_content)
        
        print(f"✅ Arquivo .env criado em {env_file.absolute()}")
        print("⚠️  Adicione .env ao .gitignore para não commitá-lo!")
        
        # Criar .gitignore se não existir
        gitignore = Path('.gitignore')
        if not gitignore.exists():
            with open(gitignore, 'w') as f:
                f.write(".env\n*.log\ndata/\n__pycache__/\n")
            print("✅ Arquivo .gitignore criado")
    
    def _setup_encrypted_file(self, credentials: dict):
        """Configura arquivo criptografado"""
        # Gerar chave de criptografia
        key = Fernet.generate_key()
        key_file = self.config_dir / 'key.key'
        
        with open(key_file, 'wb') as f:
            f.write(key)
        
        # Criptografar credenciais
        fernet = Fernet(key)
        credentials_json = json.dumps(credentials).encode()
        encrypted_data = fernet.encrypt(credentials_json)
        
        encrypted_file = self.config_dir / 'credentials.enc'
        with open(encrypted_file, 'wb') as f:
            f.write(encrypted_data)
        
        print(f"✅ Credenciais criptografadas salvas em {encrypted_file}")
        print(f"🔑 Chave de criptografia salva em {key_file}")
        print("⚠️  Mantenha ambos os arquivos seguros!")
    
    def _setup_keyring(self, credentials: dict):
        """Configura credenciais no keyring do sistema"""
        try:
            keyring.set_password(self.service_name, 'odds_api_key', credentials['ODDS_API_KEY'])
            keyring.set_password(self.service_name, 'telegram_bot_token', credentials['TELEGRAM_BOT_TOKEN'])
            keyring.set_password(self.service_name, 'telegram_chat_id', credentials['TELEGRAM_CHAT_ID'])
            
            print("✅ Credenciais salvas no keyring do sistema")
            print("🔒 Suas credenciais estão protegidas pelo sistema operacional")
            
        except Exception as e:
            print(f"❌ Erro ao salvar no keyring: {e}")
            print("💡 Tente outro método de armazenamento")
    
    def _setup_config_file(self, credentials: dict):
        """Configura arquivo JSON (menos seguro)"""
        config_file = self.config_dir / 'credentials.json'
        
        with open(config_file, 'w') as f:
            json.dump(credentials, f, indent=2)
        
        print(f"✅ Credenciais salvas em {config_file}")
        print("⚠️  ATENÇÃO: Este método é menos seguro!")
        print("⚠️  Adicione config/ ao .gitignore!")
        
        # Atualizar .gitignore
        gitignore = Path('.gitignore')
        gitignore_content = ""
        if gitignore.exists():
            with open(gitignore, 'r') as f:
                gitignore_content = f.read()
        
        if 'config/' not in gitignore_content:
            with open(gitignore, 'a') as f:
                f.write("\nconfig/\n")
    
    def test_credentials(self):
        """Testa se as credenciais estão funcionando"""
        print("\n🧪 Testando credenciais...")
        
        try:
            from src.config import Config
            config = Config()
            
            print("✅ Credenciais carregadas com sucesso")
            
            # Mostrar dados mascarados
            masked_data = config.mask_sensitive_data()
            print("\n📊 Configuração atual:")
            for key, value in masked_data.items():
                print(f"   {key}: {value}")
            
            return True
            
        except Exception as e:
            print(f"❌ Erro ao carregar credenciais: {e}")
            return False

def main():
    """Função principal do script"""
    if len(sys.argv) > 1 and sys.argv[1] == 'test':
        # Apenas testar credenciais existentes
        setup = CredentialSetup()
        setup.test_credentials()
    else:
        # Configuração interativa
        setup = CredentialSetup()
        setup.interactive_setup()
        
        # Testar após configuração
        if input("\n🧪 Testar credenciais agora? (s/N): ").lower().startswith('s'):
            setup.test_credentials()

if __name__ == "__main__":
    main()
