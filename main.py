"""
Bot de Análise Pré-Live de Jogos de Futebol
Sistema automatizado para análise de apostas esportivas
"""

import asyncio
import logging
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

from src.data_collector import OddsDataCollector
from src.analyzer import BettingAnalyzer
from src.telegram_bot import TelegramNotifier
from src.database import DatabaseManager
from src.config import Config

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class FootballBettingBot:
    """Classe principal do bot de análise de apostas"""
    
    def __init__(self):
        self.config = Config()
        self.data_collector = OddsDataCollector(self.config.ODDS_API_KEY)
        self.analyzer = BettingAnalyzer()
        self.telegram_notifier = TelegramNotifier(
            self.config.TELEGRAM_BOT_TOKEN,
            self.config.TELEGRAM_CHAT_ID
        )
        self.db_manager = DatabaseManager()
        
    async def run_analysis_cycle(self):
        """Executa um ciclo completo de análise"""
        try:
            logger.info("Iniciando ciclo de análise...")
            
            # 1. Coletar dados da API
            logger.info("Coletando dados de jogos...")
            games_data = await self.data_collector.fetch_upcoming_games()
            
            if not games_data:
                logger.warning("Nenhum jogo encontrado para análise")
                return
            
            logger.info(f"Encontrados {len(games_data)} jogos para análise")
            
            # 2. Armazenar dados no banco
            await self.db_manager.store_games_data(games_data)
            
            # 3. Analisar jogos e identificar oportunidades
            logger.info("Analisando oportunidades de apostas...")
            betting_opportunities = []
            
            for game in games_data:
                opportunities = await self.analyzer.analyze_game(game)
                betting_opportunities.extend(opportunities)
            
            # 4. Filtrar e ranquear oportunidades
            filtered_opportunities = self.analyzer.filter_opportunities(betting_opportunities)
            
            if not filtered_opportunities:
                logger.info("Nenhuma oportunidade de aposta identificada neste ciclo")
                return
            
            # 5. Enviar sugestões via Telegram
            logger.info(f"Enviando {len(filtered_opportunities)} sugestões via Telegram...")
            for opportunity in filtered_opportunities:
                await self.telegram_notifier.send_betting_suggestion(opportunity)
                await asyncio.sleep(1)  # Evitar spam
            
            logger.info("Ciclo de análise concluído com sucesso")
            
        except Exception as e:
            logger.error(f"Erro durante ciclo de análise: {str(e)}")
            await self.telegram_notifier.send_error_notification(str(e))

async def main():
    """Função principal"""
    bot = FootballBettingBot()
    
    logger.info("Bot de Análise Pré-Live iniciado")
    
    # Executar análise imediatamente
    await bot.run_analysis_cycle()
    
    # Agendar próximas execuções (a cada 12 horas)
    while True:
        try:
            # Aguardar 12 horas
            await asyncio.sleep(12 * 60 * 60)
            await bot.run_analysis_cycle()
        except KeyboardInterrupt:
            logger.info("Bot interrompido pelo usuário")
            break
        except Exception as e:
            logger.error(f"Erro no loop principal: {str(e)}")
            await asyncio.sleep(60)  # Aguardar 1 minuto antes de tentar novamente

if __name__ == "__main__":
    asyncio.run(main())
