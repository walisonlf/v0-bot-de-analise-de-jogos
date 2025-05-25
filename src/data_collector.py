"""
Módulo de coleta de dados da The Odds API
"""

import aiohttp
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class OddsDataCollector:
    """Coletor de dados da The Odds API"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = 'https://api.the-odds-api.com/v4'
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Optional[Dict]:
        """Faz requisição para a API"""
        if not self.session:
            self.session = aiohttp.ClientSession()
            
        params['apiKey'] = self.api_key
        url = f"{self.base_url}/{endpoint}"
        
        try:
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"Requisição bem-sucedida para {endpoint}")
                    return data
                else:
                    logger.error(f"Erro na API: {response.status} - {await response.text()}")
                    return None
                    
        except Exception as e:
            logger.error(f"Erro na requisição: {str(e)}")
            return None
    
    async def fetch_upcoming_games(self, hours_ahead: int = 24) -> List[Dict[str, Any]]:
        """Busca jogos futuros nas próximas horas"""
        from src.config import Config
        config = Config()
        
        all_games = []
        
        for sport in config.TARGET_LEAGUES:
            logger.info(f"Buscando jogos para {sport}")
            
            params = {
                'sport': sport,
                'regions': 'us,uk,eu',
                'markets': ','.join(config.TARGET_MARKETS),
                'oddsFormat': 'decimal',
                'dateFormat': 'iso'
            }
            
            data = await self._make_request('sports/{}/odds'.format(sport), params)
            
            if data:
                # Filtrar jogos nas próximas horas
                now = datetime.now()
                cutoff_time = now + timedelta(hours=hours_ahead)
                
                for game in data:
                    game_time = datetime.fromisoformat(game['commence_time'].replace('Z', '+00:00'))
                    
                    if now < game_time < cutoff_time:
                        game['sport'] = sport
                        all_games.append(game)
                        
            await asyncio.sleep(0.5)  # Rate limiting
        
        logger.info(f"Total de jogos coletados: {len(all_games)}")
        return all_games
    
    async def fetch_game_odds(self, game_id: str, sport: str) -> Optional[Dict]:
        """Busca odds específicas de um jogo"""
        from src.config import Config
        config = Config()
        
        params = {
            'sport': sport,
            'regions': 'us,uk,eu',
            'markets': ','.join(config.TARGET_MARKETS),
            'oddsFormat': 'decimal',
            'dateFormat': 'iso'
        }
        
        endpoint = f'sports/{sport}/odds'
        data = await self._make_request(endpoint, params)
        
        if data:
            for game in data:
                if game['id'] == game_id:
                    return game
        
        return None
