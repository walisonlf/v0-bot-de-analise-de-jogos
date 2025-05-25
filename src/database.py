"""
Módulo de gerenciamento de banco de dados
"""

import sqlite3
import aiosqlite
import logging
import json
from typing import List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Gerenciador de banco de dados"""
    
    def __init__(self, db_path: str = 'football_bot.db'):
        self.db_path = db_path
        
    async def init_database(self):
        """Inicializa o banco de dados"""
        async with aiosqlite.connect(self.db_path) as db:
            # Tabela de jogos
            await db.execute('''
                CREATE TABLE IF NOT EXISTS games (
                    id TEXT PRIMARY KEY,
                    home_team TEXT NOT NULL,
                    away_team TEXT NOT NULL,
                    league TEXT NOT NULL,
                    commence_time TIMESTAMP NOT NULL,
                    data_json TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Tabela de oportunidades enviadas
            await db.execute('''
                CREATE TABLE IF NOT EXISTS opportunities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    game_id TEXT NOT NULL,
                    market TEXT NOT NULL,
                    selection TEXT NOT NULL,
                    odds REAL NOT NULL,
                    bookmaker TEXT NOT NULL,
                    value_detected REAL NOT NULL,
                    confidence REAL NOT NULL,
                    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (game_id) REFERENCES games (id)
                )
            ''')
            
            # Tabela de logs de execução
            await db.execute('''
                CREATE TABLE IF NOT EXISTS execution_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    execution_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    games_analyzed INTEGER NOT NULL,
                    opportunities_found INTEGER NOT NULL,
                    opportunities_sent INTEGER NOT NULL,
                    status TEXT NOT NULL
                )
            ''')
            
            await db.commit()
            logger.info("Banco de dados inicializado")
    
    async def store_games_data(self, games: List[Dict[str, Any]]):
        """Armazena dados dos jogos"""
        async with aiosqlite.connect(self.db_path) as db:
            for game in games:
                await db.execute('''
                    INSERT OR REPLACE INTO games 
                    (id, home_team, away_team, league, commence_time, data_json)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    game['id'],
                    game['home_team'],
                    game['away_team'],
                    game.get('sport', 'Unknown'),
                    game['commence_time'],
                    json.dumps(game)
                ))
            
            await db.commit()
            logger.info(f"Armazenados {len(games)} jogos no banco de dados")
    
    async def store_opportunity(self, opportunity) -> int:
        """Armazena oportunidade enviada"""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute('''
                INSERT INTO opportunities 
                (game_id, market, selection, odds, bookmaker, value_detected, confidence)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                opportunity.game_id,
                opportunity.market,
                opportunity.selection,
                opportunity.best_odds,
                opportunity.bookmaker,
                opportunity.value,
                opportunity.confidence
            ))
            
            await db.commit()
            return cursor.lastrowid
    
    async def log_execution(self, games_analyzed: int, opportunities_found: int, 
                          opportunities_sent: int, status: str = 'SUCCESS'):
        """Registra log de execução"""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                INSERT INTO execution_logs 
                (games_analyzed, opportunities_found, opportunities_sent, status)
                VALUES (?, ?, ?, ?)
            ''', (games_analyzed, opportunities_found, opportunities_sent, status))
            
            await db.commit()
    
    async def get_recent_opportunities(self, hours: int = 24) -> List[Dict]:
        """Busca oportunidades recentes"""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute('''
                SELECT * FROM opportunities 
                WHERE sent_at > datetime('now', '-{} hours')
                ORDER BY sent_at DESC
            '''.format(hours))
            
            rows = await cursor.fetchall()
            columns = [description[0] for description in cursor.description]
            
            return [dict(zip(columns, row)) for row in rows]
