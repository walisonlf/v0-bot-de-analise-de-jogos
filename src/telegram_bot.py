"""
Módulo de integração com Telegram
"""

import aiohttp
import logging
from typing import Dict, Any
from datetime import datetime

from src.analyzer import BettingOpportunity

logger = logging.getLogger(__name__)

class TelegramNotifier:
    """Notificador via Telegram"""
    
    def __init__(self, bot_token: str, chat_id: str):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.base_url = f"https://api.telegram.org/bot{bot_token}"
        
    async def send_message(self, text: str, parse_mode: str = 'HTML') -> bool:
        """Envia mensagem para o Telegram"""
        url = f"{self.base_url}/sendMessage"
        
        payload = {
            'chat_id': self.chat_id,
            'text': text,
            'parse_mode': parse_mode
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        logger.info("Mensagem enviada com sucesso")
                        return True
                    else:
                        error_text = await response.text()
                        logger.error(f"Erro ao enviar mensagem: {response.status} - {error_text}")
                        return False
                        
        except Exception as e:
            logger.error(f"Erro na requisição Telegram: {str(e)}")
            return False
    
    def format_betting_message(self, opportunity: BettingOpportunity) -> str:
        """Formata mensagem de sugestão de aposta"""
        
        # Emojis para diferentes tipos de aposta
        market_emoji = {
            '1X2': '⚽',
            'Over/Under': '🎯',
            'Handicap': '📊'
        }
        
        emoji = market_emoji.get(opportunity.market, '💰')
        
        # Formatação da data/hora
        game_time = opportunity.commence_time.strftime('%d/%m %H:%M')
        
        # Nível de confiança em estrelas
        stars = '⭐' * min(int(opportunity.confidence * 5), 5)
        
        message = f"""
{emoji} <b>SUGESTÃO DE APOSTA</b> {emoji}

🏆 <b>Liga:</b> {opportunity.league.replace('soccer_', '').replace('_', ' ').title()}
⚽ <b>Jogo:</b> {opportunity.home_team} vs {opportunity.away_team}
🕐 <b>Horário:</b> {game_time}

💡 <b>Mercado:</b> {opportunity.market}
🎯 <b>Seleção:</b> {opportunity.selection}
💰 <b>Melhor Odd:</b> {opportunity.best_odds:.2f} ({opportunity.bookmaker})

📊 <b>Análise:</b>
• Probabilidade Calculada: {opportunity.calculated_probability:.1%}
• Probabilidade Implícita: {opportunity.implied_probability:.1%}
• Valor Detectado: {opportunity.value:.2%}
• Confiança: {opportunity.confidence:.1%} {stars}

📝 <b>Justificativa:</b>
{opportunity.justification}

⚠️ <i>Aposte com responsabilidade. Esta é apenas uma sugestão baseada em análise automatizada.</i>
        """
        
        return message.strip()
    
    async def send_betting_suggestion(self, opportunity: BettingOpportunity) -> bool:
        """Envia sugestão de aposta"""
        message = self.format_betting_message(opportunity)
        return await self.send_message(message)
    
    async def send_error_notification(self, error_message: str) -> bool:
        """Envia notificação de erro"""
        message = f"""
🚨 <b>ERRO NO BOT</b> 🚨

⏰ <b>Horário:</b> {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}

❌ <b>Erro:</b>
{error_message}

🔧 O sistema tentará se recuperar automaticamente.
        """
        
        return await self.send_message(message.strip())
    
    async def send_daily_summary(self, opportunities_sent: int, total_games_analyzed: int) -> bool:
        """Envia resumo diário"""
        message = f"""
📊 <b>RESUMO DIÁRIO</b> 📊

⏰ <b>Data:</b> {datetime.now().strftime('%d/%m/%Y')}

📈 <b>Estatísticas:</b>
• Jogos Analisados: {total_games_analyzed}
• Sugestões Enviadas: {opportunities_sent}
• Taxa de Oportunidades: {(opportunities_sent/total_games_analyzed*100) if total_games_analyzed > 0 else 0:.1f}%

🤖 Bot funcionando normalmente.
        """
        
        return await self.send_message(message.strip())
