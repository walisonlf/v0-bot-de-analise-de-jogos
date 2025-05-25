"""
Gerenciador de credenciais com operações avançadas
"""

import os
import json
import keyring
import getpass
from pathlib import Path
from cryptography.fernet import Fernet
import argparse

class CredentialManager:
    """Gerenciador avançado de credenciais"""
    
    def __init__(self):
        self.service_name = "football-betting-bot"
        self.config_dir = Path('config')
    
    def rotate_credentials(self):
        """Rotaciona credenciais existentes"""
        print("🔄 Rotação de Credenciais")
        print("=" * 30)
        
        current_method = self._detect_current_method()
        print(f"📍 Método atual: {current_method}")
        
        if input("Continuar com a rotação? (s/N): ").lower().startswith('s'):
            # Backup das credenciais atuais
            self._backup_credentials()
            
            # Configurar novas credenciais
            from scripts.setup_credentials import CredentialSetup
            setup = CredentialSetup()
            setup.interactive_setup()
    
    def _detect_current_method(self) -> str:
        """Detecta método atual de armazenamento"""
        if Path('.env').exists():
            return "Variáveis de ambiente (.env)"
        elif (self.config_dir / 'credentials.enc').exists():
            return "Arquivo criptografado"
        elif self._check_keyring():
            return "Keyring do sistema"
        elif (self.config_dir / 'credentials.json').exists():
            return "Arquivo JSON"
        else:
            return "Nenhum método detectado"
    
    def _check_keyring(self) -> bool:
        """Verifica se existem credenciais no keyring"""
        try:
            return keyring.get_password(self.service_name, 'odds_api_key') is not None
        except:
            return False
    
    def _backup_credentials(self):
        """Faz backup das credenciais atuais"""
        backup_dir = Path('backup')
        backup_dir.mkdir(exist_ok=True)
        
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Backup baseado no método atual
        if Path('.env').exists():
            backup_file = backup_dir / f'env_backup_{timestamp}.txt'
            os.rename('.env', backup_file)
            print(f"✅ Backup salvo em {backup_file}")
        
        if (self.config_dir / 'credentials.enc').exists():
            backup_file = backup_dir / f'encrypted_backup_{timestamp}.enc'
            os.rename(self.config_dir / 'credentials.enc', backup_file)
            print(f"✅ Backup criptografado salvo em {backup_file}")
    
    def export_credentials(self, format_type: str = 'env'):
        """Exporta credenciais em diferentes formatos"""
        try:
            from src.config import Config
            config = Config()
            
            if format_type == 'env':
                self._export_to_env(config)
            elif format_type == 'json':
                self._export_to_json(config)
            elif format_type == 'encrypted':
                self._export_to_encrypted(config)
            
        except Exception as e:
            print(f"❌ Erro ao exportar: {e}")
    
    def _export_to_env(self, config):
        """Exporta para formato .env"""
        env_content = f"""ODDS_API_KEY={config.ODDS_API_KEY}
TELEGRAM_BOT_TOKEN={config.TELEGRAM_BOT_TOKEN}
TELEGRAM_CHAT_ID={config.TELEGRAM_CHAT_ID}
"""
        
        export_file = Path('export') / 'credentials.env'
        export_file.parent.mkdir(exist_ok=True)
        
        with open(export_file, 'w') as f:
            f.write(env_content)
        
        print(f"✅ Credenciais exportadas para {export_file}")
    
    def _export_to_json(self, config):
        """Exporta para formato JSON"""
        credentials = {
            'ODDS_API_KEY': config.ODDS_API_KEY,
            'TELEGRAM_BOT_TOKEN': config.TELEGRAM_BOT_TOKEN,
            'TELEGRAM_CHAT_ID': config.TELEGRAM_CHAT_ID
        }
        
        export_file = Path('export') / 'credentials.json'
        export_file.parent.mkdir(exist_ok=True)
        
        with open(export_file, 'w') as f:
            json.dump(credentials, f, indent=2)
        
        print(f"✅ Credenciais exportadas para {export_file}")
    
    def _export_to_encrypted(self, config):
        """Exporta para formato criptografado"""
        credentials = {
            'ODDS_API_KEY': config.ODDS_API_KEY,
            'TELEGRAM_BOT_TOKEN': config.TELEGRAM_BOT_TOKEN,
            'TELEGRAM_CHAT_ID': config.TELEGRAM_CHAT_ID
        }
        
        # Gerar nova chave
        key = Fernet.generate_key()
        fernet = Fernet(key)
        
        # Criptografar
        credentials_json = json.dumps(credentials).encode()
        encrypted_data = fernet.encrypt(credentials_json)
        
        export_dir = Path('export')
        export_dir.mkdir(exist_ok=True)
        
        # Salvar arquivos
        with open(export_dir / 'credentials.enc', 'wb') as f:
            f.write(encrypted_data)
        
        with open(export_dir / 'key.key', 'wb') as f:
            f.write(key)
        
        print(f"✅ Credenciais criptografadas exportadas para {export_dir}")
    
    def validate_all_methods(self):
        """Valida todos os métodos de configuração"""
        print("🔍 Validando métodos de configuração...")
        
        methods = [
            ("Variáveis de ambiente", self._validate_env),
            ("Arquivo criptografado", self._validate_encrypted),
            ("Keyring do sistema", self._validate_keyring),
            ("Arquivo JSON", self._validate_json)
        ]
        
        for method_name, validator in methods:
            try:
                if validator():
                    print(f"✅ {method_name}: OK")
                else:
                    print(f"❌ {method_name}: Não configurado")
            except Exception as e:
                print(f"⚠️  {method_name}: Erro - {e}")
    
    def _validate_env(self) -> bool:
        """Valida configuração por variáveis de ambiente"""
        env_file = Path('.env')
        if not env_file.exists():
            return False
        
        with open(env_file, 'r') as f:
            content = f.read()
        
        required_vars = ['ODDS_API_KEY', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']
        return all(var in content for var in required_vars)
    
    def _validate_encrypted(self) -> bool:
        """Valida configuração criptografada"""
        return (self.config_dir / 'credentials.enc').exists() and (self.config_dir / 'key.key').exists()
    
    def _validate_keyring(self) -> bool:
        """Valida configuração no keyring"""
        try:
            required_keys = ['odds_api_key', 'telegram_bot_token', 'telegram_chat_id']
            return all(keyring.get_password(self.service_name, key) for key in required_keys)
        except:
            return False
    
    def _validate_json(self) -> bool:
        """Valida configuração JSON"""
        config_file = self.config_dir / 'credentials.json'
        if not config_file.exists():
            return False
        
        try:
            with open(config_file, 'r') as f:
                data = json.load(f)
            
            required_keys = ['ODDS_API_KEY', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']
            return all(key in data and data[key] for key in required_keys)
        except:
            return False

def main():
    """Função principal com argumentos de linha de comando"""
    parser = argparse.ArgumentParser(description='Gerenciador de Credenciais')
    parser.add_argument('action', choices=['rotate', 'export', 'validate'], 
                       help='Ação a ser executada')
    parser.add_argument('--format', choices=['env', 'json', 'encrypted'], 
                       default='env', help='Formato para exportação')
    
    args = parser.parse_args()
    manager = CredentialManager()
    
    if args.action == 'rotate':
        manager.rotate_credentials()
    elif args.action == 'export':
        manager.export_credentials(args.format)
    elif args.action == 'validate':
        manager.validate_all_methods()

if __name__ == "__main__":
    main()
