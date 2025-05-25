"""
Script para executar o bot
"""

import asyncio
import sys
import logging
from src.database import DatabaseManager

async def setup_and_run():
    """Configura e executa o bot"""
    
    # Inicializar banco de dados
    db_manager = DatabaseManager()
    await db_manager.init_database()
    
    # Importar e executar o bot principal
    from main import main
    await main()

if __name__ == "__main__":
    try:
        asyncio.run(setup_and_run())
    except KeyboardInterrupt:
        print("\nBot interrompido pelo usuário")
        sys.exit(0)
    except Exception as e:
        logging.error(f"Erro fatal: {str(e)}")
        sys.exit(1)
