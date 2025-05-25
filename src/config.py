"""
Configurações seguras do sistema
"""

import os
import json
import logging
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from pathlib import Path
import base64
from cryptography.fernet import Fernet
import keyring

logger = logging.getLogger(__name__)

class SecureConfig:
    """Gerenciador seguro de configurações"""
    
    def __init__(self):
        self.config_methods = [
            self._load_from_environment,
            self._load_from_encrypted_file,
            self._load_from_keyring,
            self._load_from_config_file,
        ]
        
    def _load_from_environment(self) -> Dict[str, str]:
        """Carrega configurações de variáveis de ambiente"""
        return {
            'ODDS_API_KEY': os.getenv('ODDS_API_KEY'),
            'TELEGRAM_BOT_TOKEN': os.getenv('TELEGRAM_BOT_TOKEN'),
            'TELEGRAM_CHAT_ID': os.getenv('TELEGRAM_CHAT_ID'),
            'ENCRYPTION_KEY': os.getenv('ENCRYPTION_KEY')
        }
    
    def _load_from_encrypted_file(self) -> Dict[str, str]:
        """Carrega configurações de arquivo criptografado"""
        try:
            encrypted_file = Path('config/credentials.enc')
            key_file = Path('config/key.key')
            
            if not encrypted_file.exists() or not key_file.exists():
                return {}
            
            # Ler chave de criptografia
            with open(key_file, 'rb') as f:
                key = f.read()
            
            # Descriptografar arquivo
            fernet = Fernet(key)
            with open(encrypted_file, 'rb') as f:
                encrypted_data = f.read()
            
            decrypted_data = fernet.decrypt(encrypted_data)
            credentials = json.loads(decrypted_data.decode())
            
            logger.info("Credenciais carregadas de arquivo criptografado")
            return credentials
            
        except Exception as e:
            logger.warning(f"Erro ao carregar arquivo criptografado: {e}")
            return {}
    
    def _load_from_keyring(self) -> Dict[str, str]:
        """Carrega configurações do keyring do sistema"""
        try:
            service_name = "football-betting-bot"
            return {
                'ODDS_API_KEY': keyring.get_password(service_name, 'odds_api_key'),
                'TELEGRAM_BOT_TOKEN': keyring.get_password(service_name, 'telegram_bot_token'),
                'TELEGRAM_CHAT_ID': keyring.get_password(service_name, 'telegram_chat_id')
            }
        except Exception as e:
            logger.warning(f"Erro ao carregar do keyring: {e}")
            return {}
    
    def _load_from_config_file(self) -> Dict[str, str]:
        """Carrega configurações de arquivo JSON (menos seguro)"""
        try:
            config_file = Path('config/credentials.json')
            if config_file.exists():
                with open(config_file, 'r') as f:
                    credentials = json.load(f)
                logger.warning("Credenciais carregadas de arquivo não criptografado")
                return credentials
        except Exception as e:
            logger.warning(f"Erro ao carregar arquivo de configuração: {e}")
        
        return {}
    
    def load_credentials(self) -> Dict[str, str]:
        """Carrega credenciais usando múltiplos métodos"""
        credentials = {}
        
        for method in self.config_methods:
            try:
                method_credentials = method()
                # Atualizar apenas valores não vazios
                for key, value in method_credentials.items():
                    if value and value.strip():
                        credentials[key] = value
                        
            except Exception as e:
                logger.warning(f"Erro no método de configuração {method.__name__}: {e}")
        
        return credentials
    
    def validate_credentials(self, credentials: Dict[str, str]) -> bool:
        """Valida se todas as credenciais necessárias estão presentes"""
        required_keys = ['ODDS_API_KEY', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']
        
        missing_keys = []
        for key in required_keys:
            if not credentials.get(key):
                missing_keys.append(key)
        
        if missing_keys:
            logger.error(f"Credenciais obrigatórias não encontradas: {missing_keys}")
            return False
        
        # Validações básicas de formato
        if not self._validate_telegram_token(credentials['TELEGRAM_BOT_TOKEN']):
            logger.error("Token do Telegram inválido")
            return False
        
        if not self._validate_chat_id(credentials['TELEGRAM_CHAT_ID']):
            logger.error("Chat ID do Telegram inválido")
            return False
        
        return True
    
    def _validate_telegram_token(self, token: str) -> bool:
        """Valida formato do token do Telegram"""
        if not token:
            return False
        
        parts = token.split(':')
        if len(parts) != 2:
            return False
        
        try:
            int(parts[0])  # Bot ID deve ser numérico
            return len(parts[1]) >= 35  # Token deve ter pelo menos 35 caracteres
        except ValueError:
            return False
    
    def _validate_chat_id(self, chat_id: str) -> bool:
        """Valida formato do Chat ID"""
        if not chat_id:
            return False
        
        try:
            int(chat_id)  # Chat ID deve ser numérico
            return True
        except ValueError:
            return False

@dataclass
class Config:
    """Configurações do bot com carregamento seguro"""
    
    # Credenciais (carregadas dinamicamente)
    ODDS_API_KEY: str = field(default="")
    TELEGRAM_BOT_TOKEN: str = field(default="")
    TELEGRAM_CHAT_ID: str = field(default="")
    
    # Configurações da API
    ODDS_API_BASE_URL: str = 'https://api.the-odds-api.com/v4'
    
    # Ligas de interesse
    TARGET_LEAGUES: List[str] = field(default_factory=lambda: [
        'soccer_brazil_serie_a',
        'soccer_england_premier_league',
        'soccer_spain_la_liga',
        'soccer_italy_serie_a',
        'soccer_germany_bundesliga',
        'soccer_france_ligue_one',
        'soccer_uefa_champs_league',
        'soccer_uefa_europa_league'
    ])
    
    # Configurações de análise
    MIN_ODDS: float = 1.5
    MAX_ODDS: float = 5.0
    MIN_VALUE_THRESHOLD: float = 0.05  # 5% de valor mínimo
    MIN_CONFIDENCE: float = 0.7  # 70% de confiança mínima
    
    # Mercados de interesse
    TARGET_MARKETS: List[str] = field(default_factory=lambda: [
        'h2h',  # 1X2
        'totals',  # Over/Under
        'spreads'  # Handicap
    ])
    
    # Configurações de segurança
    MAX_API_REQUESTS_PER_HOUR: int = 500
    REQUEST_TIMEOUT: int = 30
    RETRY_ATTEMPTS: int = 3
    
    def __post_init__(self):
        """Carrega credenciais de forma segura após inicialização"""
        self._load_secure_credentials()
    
    def _load_secure_credentials(self):
        """Carrega credenciais usando o sistema seguro"""
        secure_config = SecureConfig()
        credentials = secure_config.load_credentials()
        
        if not secure_config.validate_credentials(credentials):
            raise ValueError("Credenciais inválidas ou ausentes. Verifique a configuração.")
        
        self.ODDS_API_KEY = credentials['ODDS_API_KEY']
        self.TELEGRAM_BOT_TOKEN = credentials['TELEGRAM_BOT_TOKEN']
        self.TELEGRAM_CHAT_ID = credentials['TELEGRAM_CHAT_ID']
        
        logger.info("Credenciais carregadas e validadas com sucesso")
    
    def mask_sensitive_data(self) -> Dict[str, Any]:
        """Retorna configurações com dados sensíveis mascarados para logs"""
        return {
            'ODDS_API_KEY': f"{self.ODDS_API_KEY[:8]}..." if self.ODDS_API_KEY else "NOT_SET",
            'TELEGRAM_BOT_TOKEN': f"{self.TELEGRAM_BOT_TOKEN.split(':')[0]}:..." if self.TELEGRAM_BOT_TOKEN else "NOT_SET",
            'TELEGRAM_CHAT_ID': f"...{self.TELEGRAM_CHAT_ID[-4:]}" if self.TELEGRAM_CHAT_ID else "NOT_SET",
            'TARGET_LEAGUES': len(self.TARGET_LEAGUES),
            'TARGET_MARKETS': len(self.TARGET_MARKETS),
            'MIN_ODDS': self.MIN_ODDS,
            'MAX_ODDS': self.MAX_ODDS
        }
