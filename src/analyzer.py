"""
Módulo de análise de apostas
"""

import logging
import statistics
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class BettingOpportunity:
    """Representa uma oportunidade de aposta"""
    game_id: str
    home_team: str
    away_team: str
    league: str
    commence_time: datetime
    market: str
    selection: str
    best_odds: float
    bookmaker: str
    implied_probability: float
    calculated_probability: float
    value: float
    confidence: float
    justification: str

class BettingAnalyzer:
    """Analisador de oportunidades de apostas"""
    
    def __init__(self):
        from src.config import Config
        self.config = Config()
    
    def calculate_implied_probability(self, odds: float) -> float:
        """Calcula probabilidade implícita das odds"""
        return 1 / odds if odds > 0 else 0
    
    def calculate_value(self, calculated_prob: float, odds: float) -> float:
        """Calcula o valor da aposta (Value Betting)"""
        implied_prob = self.calculate_implied_probability(odds)
        return (calculated_prob - implied_prob) / implied_prob if implied_prob > 0 else 0
    
    def analyze_h2h_market(self, game: Dict[str, Any]) -> List[BettingOpportunity]:
        """Analisa mercado 1X2 (Head to Head)"""
        opportunities = []
        
        # Encontrar mercado h2h
        h2h_market = None
        for bookmaker in game.get('bookmakers', []):
            for market in bookmaker.get('markets', []):
                if market['key'] == 'h2h':
                    h2h_market = market
                    break
            if h2h_market:
                break
        
        if not h2h_market:
            return opportunities
        
        # Coletar todas as odds para cada resultado
        home_odds = []
        draw_odds = []
        away_odds = []
        
        for bookmaker in game.get('bookmakers', []):
            for market in bookmaker.get('markets', []):
                if market['key'] == 'h2h':
                    for outcome in market['outcomes']:
                        if outcome['name'] == game['home_team']:
                            home_odds.append((outcome['price'], bookmaker['title']))
                        elif outcome['name'] == game['away_team']:
                            away_odds.append((outcome['price'], bookmaker['title']))
                        elif outcome['name'] == 'Draw':
                            draw_odds.append((outcome['price'], bookmaker['title']))
        
        # Analisar cada resultado
        results = [
            ('home', home_odds, game['home_team']),
            ('draw', draw_odds, 'Empate'),
            ('away', away_odds, game['away_team'])
        ]
        
        for result_type, odds_list, selection in results:
            if not odds_list:
                continue
                
            # Encontrar melhor odd
            best_odds, best_bookmaker = max(odds_list, key=lambda x: x[0])
            
            # Calcular probabilidade baseada na média das odds
            avg_odds = statistics.mean([odds for odds, _ in odds_list])
            market_implied_prob = self.calculate_implied_probability(avg_odds)
            
            # Análise simples: usar probabilidade de mercado como base
            # Em implementação real, usar modelos mais sofisticados
            calculated_prob = self.estimate_probability(game, result_type)
            
            # Calcular valor
            value = self.calculate_value(calculated_prob, best_odds)
            
            # Verificar se atende critérios
            if (self.config.MIN_ODDS <= best_odds <= self.config.MAX_ODDS and
                value >= self.config.MIN_VALUE_THRESHOLD):
                
                confidence = self.calculate_confidence(game, result_type, value)
                
                if confidence >= self.config.MIN_CONFIDENCE:
                    opportunity = BettingOpportunity(
                        game_id=game['id'],
                        home_team=game['home_team'],
                        away_team=game['away_team'],
                        league=game.get('sport', 'Unknown'),
                        commence_time=datetime.fromisoformat(game['commence_time'].replace('Z', '+00:00')),
                        market='1X2',
                        selection=selection,
                        best_odds=best_odds,
                        bookmaker=best_bookmaker,
                        implied_probability=self.calculate_implied_probability(best_odds),
                        calculated_probability=calculated_prob,
                        value=value,
                        confidence=confidence,
                        justification=f"Valor detectado: {value:.2%}. Probabilidade calculada ({calculated_prob:.2%}) vs implícita ({market_implied_prob:.2%})"
                    )
                    opportunities.append(opportunity)
        
        return opportunities
    
    def analyze_totals_market(self, game: Dict[str, Any]) -> List[BettingOpportunity]:
        """Analisa mercado Over/Under"""
        opportunities = []
        
        # Implementação similar ao h2h_market
        # Foco em Over/Under 2.5 gols como exemplo
        
        for bookmaker in game.get('bookmakers', []):
            for market in bookmaker.get('markets', []):
                if market['key'] == 'totals':
                    for outcome in market['outcomes']:
                        if outcome.get('point') == 2.5:  # Over/Under 2.5
                            odds = outcome['price']
                            selection = f"{outcome['name']} {outcome['point']}"
                            
                            # Análise simplificada
                            calculated_prob = self.estimate_totals_probability(game, outcome['name'], outcome['point'])
                            value = self.calculate_value(calculated_prob, odds)
                            
                            if (self.config.MIN_ODDS <= odds <= self.config.MAX_ODDS and
                                value >= self.config.MIN_VALUE_THRESHOLD):
                                
                                confidence = self.calculate_confidence(game, 'totals', value)
                                
                                if confidence >= self.config.MIN_CONFIDENCE:
                                    opportunity = BettingOpportunity(
                                        game_id=game['id'],
                                        home_team=game['home_team'],
                                        away_team=game['away_team'],
                                        league=game.get('sport', 'Unknown'),
                                        commence_time=datetime.fromisoformat(game['commence_time'].replace('Z', '+00:00')),
                                        market='Over/Under',
                                        selection=selection,
                                        best_odds=odds,
                                        bookmaker=bookmaker['title'],
                                        implied_probability=self.calculate_implied_probability(odds),
                                        calculated_probability=calculated_prob,
                                        value=value,
                                        confidence=confidence,
                                        justification=f"Análise de gols: {selection}. Valor: {value:.2%}"
                                    )
                                    opportunities.append(opportunity)
        
        return opportunities
    
    def estimate_probability(self, game: Dict[str, Any], result_type: str) -> float:
        """Estima probabilidade de um resultado (implementação básica)"""
        # Implementação simplificada - em produção usar modelos mais sofisticados
        
        if result_type == 'home':
            return 0.45  # Vantagem casa
        elif result_type == 'away':
            return 0.35
        else:  # draw
            return 0.20
    
    def estimate_totals_probability(self, game: Dict[str, Any], outcome_type: str, point: float) -> float:
        """Estima probabilidade para Over/Under"""
        # Implementação simplificada
        if outcome_type == 'Over' and point == 2.5:
            return 0.55  # Tendência para mais gols
        elif outcome_type == 'Under' and point == 2.5:
            return 0.45
        return 0.5
    
    def calculate_confidence(self, game: Dict[str, Any], analysis_type: str, value: float) -> float:
        """Calcula nível de confiança da análise"""
        base_confidence = 0.6
        
        # Aumentar confiança baseado no valor detectado
        value_bonus = min(value * 2, 0.3)  # Máximo 30% de bônus
        
        # Outros fatores podem ser adicionados aqui
        # Ex: número de bookmakers, liquidez do mercado, etc.
        
        return min(base_confidence + value_bonus, 1.0)
    
    async def analyze_game(self, game: Dict[str, Any]) -> List[BettingOpportunity]:
        """Analisa um jogo completo"""
        opportunities = []
        
        try:
            # Analisar diferentes mercados
            opportunities.extend(self.analyze_h2h_market(game))
            opportunities.extend(self.analyze_totals_market(game))
            
            logger.info(f"Jogo {game['home_team']} vs {game['away_team']}: {len(opportunities)} oportunidades encontradas")
            
        except Exception as e:
            logger.error(f"Erro ao analisar jogo {game.get('id', 'unknown')}: {str(e)}")
        
        return opportunities
    
    def filter_opportunities(self, opportunities: List[BettingOpportunity]) -> List[BettingOpportunity]:
        """Filtra e ranqueia oportunidades"""
        # Filtrar por critérios mínimos
        filtered = [
            opp for opp in opportunities
            if (opp.value >= self.config.MIN_VALUE_THRESHOLD and
                opp.confidence >= self.config.MIN_CONFIDENCE and
                self.config.MIN_ODDS <= opp.best_odds <= self.config.MAX_ODDS)
        ]
        
        # Ordenar por valor * confiança (score combinado)
        filtered.sort(key=lambda x: x.value * x.confidence, reverse=True)
        
        # Limitar a top 5 oportunidades por ciclo
        return filtered[:5]
