import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
import uuid

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['football_league']

# Division 1 Teams with standing data
division_1_teams = [
    {"name": "V.L. PLAK LA MULA", "division": 1, "pj": 4, "pg": 4, "pe": 0, "pp": 0, "gf": 12, "gc": 1, "pts": 12},
    {"name": "S.D. COSMOS", "division": 1, "pj": 4, "pg": 4, "pe": 0, "pp": 0, "gf": 9, "gc": 3, "pts": 12},
    {"name": "YAGÜE CUATRO CANTONES", "division": 1, "pj": 4, "pg": 3, "pe": 0, "pp": 1, "gf": 11, "gc": 6, "pts": 9},
    {"name": "BAR SORIA", "division": 1, "pj": 4, "pg": 3, "pe": 0, "pp": 1, "gf": 11, "gc": 6, "pts": 9},
    {"name": "C.D. TEDEON", "division": 1, "pj": 4, "pg": 2, "pe": 1, "pp": 1, "gf": 8, "gc": 4, "pts": 7},
    {"name": "BERONES VETERANOS LOGROÑO", "division": 1, "pj": 4, "pg": 1, "pe": 1, "pp": 2, "gf": 6, "gc": 9, "pts": 4},
    {"name": "BERCEO VETERANOS", "division": 1, "pj": 4, "pg": 1, "pe": 1, "pp": 2, "gf": 6, "gc": 10, "pts": 4},
    {"name": "VAREA DIERO", "division": 1, "pj": 4, "pg": 1, "pe": 0, "pp": 3, "gf": 8, "gc": 10, "pts": 3},
    {"name": "24 TEAM", "division": 1, "pj": 4, "pg": 1, "pe": 0, "pp": 3, "gf": 2, "gc": 11, "pts": 3},
    {"name": "TABERNA 11 METROS", "division": 1, "pj": 4, "pg": 0, "pe": 2, "pp": 2, "gf": 5, "gc": 7, "pts": 2},
    {"name": "HORMIGONES ANGULO NAXARA C.D.", "division": 1, "pj": 4, "pg": 0, "pe": 2, "pp": 2, "gf": 5, "gc": 12, "pts": 2},
    {"name": "F.C. AMERICA", "division": 1, "pj": 4, "pg": 0, "pe": 1, "pp": 3, "gf": 3, "gc": 7, "pts": 1},
]

# Division 2 Teams with standing data
division_2_teams = [
    {"name": "BAR CAFÉ BALA", "division": 2, "pj": 4, "pg": 3, "pe": 1, "pp": 0, "gf": 8, "gc": 4, "pts": 10},
    {"name": "C.F. ECUADOR", "division": 2, "pj": 4, "pg": 3, "pe": 0, "pp": 1, "gf": 10, "gc": 5, "pts": 9},
    {"name": "BRISK IMPORT IBERICA", "division": 2, "pj": 4, "pg": 3, "pe": 0, "pp": 1, "gf": 9, "gc": 5, "pts": 9},
    {"name": "FLOR DEL CAMPO - ICARO BISTRO BAR", "division": 2, "pj": 4, "pg": 3, "pe": 0, "pp": 1, "gf": 8, "gc": 4, "pts": 9},
    {"name": "PODOACTIVA VILLAMEDIANA VETERANOS", "division": 2, "pj": 4, "pg": 2, "pe": 2, "pp": 0, "gf": 10, "gc": 6, "pts": 8},
    {"name": "VENDING LARDERO", "division": 2, "pj": 4, "pg": 2, "pe": 0, "pp": 2, "gf": 4, "gc": 8, "pts": 6},
    {"name": "F.C. MARRUECOS", "division": 2, "pj": 4, "pg": 1, "pe": 2, "pp": 1, "gf": 11, "gc": 8, "pts": 5},
    {"name": "BOLIVIANOS UNIDOS", "division": 2, "pj": 4, "pg": 1, "pe": 1, "pp": 2, "gf": 7, "gc": 7, "pts": 4},
    {"name": "VIANES", "division": 2, "pj": 4, "pg": 1, "pe": 1, "pp": 2, "gf": 11, "gc": 16, "pts": 4},
    {"name": "INOXIDABLES DMEDINA", "division": 2, "pj": 4, "pg": 1, "pe": 0, "pp": 3, "gf": 8, "gc": 12, "pts": 3},
    {"name": "PEÑA BETICA LOGROÑO", "division": 2, "pj": 4, "pg": 0, "pe": 1, "pp": 3, "gf": 8, "gc": 13, "pts": 1},
    {"name": "VILLEGAS", "division": 2, "pj": 4, "pg": 0, "pe": 0, "pp": 4, "gf": 2, "gc": 8, "pts": 0},
]

# Division 1 Fixtures - All Jornadas (1-11)
division_1_fixtures = [
    # Jornada 1 - 05/10/2025
    {"week": 1, "date": "2025-10-05", "home": "V.L. PLAK LA MULA", "away": "BERONES VETERANOS LOGROÑO", "home_score": 3, "away_score": 0},
    {"week": 1, "date": "2025-10-05", "home": "F.C. AMERICA", "away": "S.D. COSMOS", "home_score": 0, "away_score": 1},
    {"week": 1, "date": "2025-10-05", "home": "BERCEO VETERANOS", "away": "C.D. TEDEON", "home_score": 1, "away_score": 4},
    {"week": 1, "date": "2025-10-05", "home": "VAREA DIERO", "away": "BAR SORIA", "home_score": 2, "away_score": 3},
    {"week": 1, "date": "2025-10-05", "home": "TABERNA 11 METROS", "away": "HORMIGONES ANGULO NAXARA C.D.", "home_score": 2, "away_score": 2},
    
    # Jornada 2 - 12/10/2025
    {"week": 2, "date": "2025-10-12", "home": "HORMIGONES ANGULO NAXARA C.D.", "away": "YAGÜE CUATRO CANTONES", "home_score": 0, "away_score": 5},
    {"week": 2, "date": "2025-10-12", "home": "BAR SORIA", "away": "BERONES VETERANOS LOGROÑO", "home_score": 4, "away_score": 1},
    {"week": 2, "date": "2025-10-12", "home": "C.D. TEDEON", "away": "TABERNA 11 METROS", "home_score": 1, "away_score": 1},
    {"week": 2, "date": "2025-10-12", "home": "BERCEO VETERANOS", "away": "V.L. PLAK LA MULA", "home_score": 0, "away_score": 3},
    {"week": 2, "date": "2025-10-12", "home": "24 TEAM", "away": "VAREA DIERO", "home_score": 0, "away_score": 4},
    {"week": 2, "date": "2025-10-12", "home": "S.D. COSMOS", "away": "F.C. AMERICA", "home_score": 2, "away_score": 1},
    
    # Jornada 3 - 19/10/2025
    {"week": 3, "date": "2025-10-19", "home": "YAGÜE CUATRO CANTONES", "away": "TABERNA 11 METROS", "home_score": 3, "away_score": 2},
    {"week": 3, "date": "2025-10-19", "home": "F.C. AMERICA", "away": "BERCEO VETERANOS", "home_score": 1, "away_score": 1},
    {"week": 3, "date": "2025-10-19", "home": "BAR SORIA", "away": "S.D. COSMOS", "home_score": 1, "away_score": 2},
    {"week": 3, "date": "2025-10-19", "home": "24 TEAM", "away": "V.L. PLAK LA MULA", "home_score": 1, "away_score": 5},
    {"week": 3, "date": "2025-10-19", "home": "VAREA DIERO", "away": "C.D. TEDEON", "home_score": 1, "away_score": 3},
    {"week": 3, "date": "2025-10-19", "home": "BERONES VETERANOS LOGROÑO", "away": "HORMIGONES ANGULO NAXARA C.D.", "home_score": 1, "away_score": 1},
    
    # Jornada 4 - 26/10/2025
    {"week": 4, "date": "2025-10-26", "home": "HORMIGONES ANGULO NAXARA C.D.", "away": "BERCEO VETERANOS", "home_score": 2, "away_score": 4},
    {"week": 4, "date": "2025-10-26", "home": "BAR SORIA", "away": "F.C. AMERICA", "home_score": 3, "away_score": 1},
    {"week": 4, "date": "2025-10-26", "home": "C.D. TEDEON", "away": "V.L. PLAK LA MULA", "home_score": 0, "away_score": 1},
    {"week": 4, "date": "2025-10-26", "home": "24 TEAM", "away": "YAGÜE CUATRO CANTONES", "home_score": 0, "away_score": 2},
    {"week": 4, "date": "2025-10-26", "home": "BERONES VETERANOS LOGROÑO", "away": "VAREA DIERO", "home_score": 4, "away_score": 1},
    {"week": 4, "date": "2025-10-26", "home": "S.D. COSMOS", "away": "TABERNA 11 METROS", "home_score": 1, "away_score": 0},
    
    # Jornada 5 - 02/11/2025
    {"week": 5, "date": "2025-11-02", "home": "V.L. PLAK LA MULA", "away": "TABERNA 11 METROS", "home_score": None, "away_score": None},
    {"week": 5, "date": "2025-11-02", "home": "HORMIGONES ANGULO NAXARA C.D.", "away": "VAREA DIERO", "home_score": None, "away_score": None},
    {"week": 5, "date": "2025-11-02", "home": "C.D. TEDEON", "away": "F.C. AMERICA", "home_score": None, "away_score": None},
    {"week": 5, "date": "2025-11-02", "home": "BERCEO VETERANOS", "away": "YAGÜE CUATRO CANTONES", "home_score": None, "away_score": None},
    {"week": 5, "date": "2025-11-02", "home": "24 TEAM", "away": "BAR SORIA", "home_score": None, "away_score": None},
    {"week": 5, "date": "2025-11-02", "home": "S.D. COSMOS", "away": "BERONES VETERANOS LOGROÑO", "home_score": None, "away_score": None},
    
    # Jornada 6 - 09/11/2025
    {"week": 6, "date": "2025-11-09", "home": "V.L. PLAK LA MULA", "away": "YAGÜE CUATRO CANTONES", "home_score": None, "away_score": None},
    {"week": 6, "date": "2025-11-09", "home": "HORMIGONES ANGULO NAXARA C.D.", "away": "BAR SORIA", "home_score": None, "away_score": None},
    {"week": 6, "date": "2025-11-09", "home": "C.D. TEDEON", "away": "BERONES VETERANOS LOGROÑO", "home_score": None, "away_score": None},
    {"week": 6, "date": "2025-11-09", "home": "BERCEO VETERANOS", "away": "VAREA DIERO", "home_score": None, "away_score": None},
    {"week": 6, "date": "2025-11-09", "home": "TABERNA 11 METROS", "away": "F.C. AMERICA", "home_score": None, "away_score": None},
    {"week": 6, "date": "2025-11-09", "home": "S.D. COSMOS", "away": "24 TEAM", "home_score": None, "away_score": None},
    
    # Jornada 7 - 16/11/2025
    {"week": 7, "date": "2025-11-16", "home": "F.C. AMERICA", "away": "YAGÜE CUATRO CANTONES", "home_score": None, "away_score": None},
    {"week": 7, "date": "2025-11-16", "home": "BAR SORIA", "away": "C.D. TEDEON", "home_score": None, "away_score": None},
    {"week": 7, "date": "2025-11-16", "home": "24 TEAM", "away": "HORMIGONES ANGULO NAXARA C.D.", "home_score": None, "away_score": None},
    {"week": 7, "date": "2025-11-16", "home": "VAREA DIERO", "away": "TABERNA 11 METROS", "home_score": None, "away_score": None},
    {"week": 7, "date": "2025-11-16", "home": "BERONES VETERANOS LOGROÑO", "away": "BERCEO VETERANOS", "home_score": None, "away_score": None},
    {"week": 7, "date": "2025-11-16", "home": "V.L. PLAK LA MULA", "away": "S.D. COSMOS", "home_score": None, "away_score": None},
    
    # Jornada 8 - 23/11/2025
    {"week": 8, "date": "2025-11-23", "home": "YAGÜE CUATRO CANTONES", "away": "C.D. TEDEON", "home_score": None, "away_score": None},
    {"week": 8, "date": "2025-11-23", "home": "F.C. AMERICA", "away": "HORMIGONES ANGULO NAXARA C.D.", "home_score": None, "away_score": None},
    {"week": 8, "date": "2025-11-23", "home": "BAR SORIA", "away": "V.L. PLAK LA MULA", "home_score": None, "away_score": None},
    {"week": 8, "date": "2025-11-23", "home": "TABERNA 11 METROS", "away": "BERCEO VETERANOS", "home_score": None, "away_score": None},
    {"week": 8, "date": "2025-11-23", "home": "VAREA DIERO", "away": "S.D. COSMOS", "home_score": None, "away_score": None},
    {"week": 8, "date": "2025-11-23", "home": "BERONES VETERANOS LOGROÑO", "away": "24 TEAM", "home_score": None, "away_score": None},
    
    # Jornada 9 - 30/11/2025
    {"week": 9, "date": "2025-11-30", "home": "V.L. PLAK LA MULA", "away": "VAREA DIERO", "home_score": None, "away_score": None},
    {"week": 9, "date": "2025-11-30", "home": "YAGÜE CUATRO CANTONES", "away": "BAR SORIA", "home_score": None, "away_score": None},
    {"week": 9, "date": "2025-11-30", "home": "F.C. AMERICA", "away": "BERONES VETERANOS LOGROÑO", "home_score": None, "away_score": None},
    {"week": 9, "date": "2025-11-30", "home": "C.D. TEDEON", "away": "HORMIGONES ANGULO NAXARA C.D.", "home_score": None, "away_score": None},
    {"week": 9, "date": "2025-11-30", "home": "BERCEO VETERANOS", "away": "S.D. COSMOS", "home_score": None, "away_score": None},
    {"week": 9, "date": "2025-11-30", "home": "TABERNA 11 METROS", "away": "24 TEAM", "home_score": None, "away_score": None},
    
    # Jornada 10 - 14/12/2025
    {"week": 10, "date": "2025-12-14", "home": "HORMIGONES ANGULO NAXARA C.D.", "away": "V.L. PLAK LA MULA", "home_score": None, "away_score": None},
    {"week": 10, "date": "2025-12-14", "home": "BAR SORIA", "away": "TABERNA 11 METROS", "home_score": None, "away_score": None},
    {"week": 10, "date": "2025-12-14", "home": "24 TEAM", "away": "BERCEO VETERANOS", "home_score": None, "away_score": None},
    {"week": 10, "date": "2025-12-14", "home": "VAREA DIERO", "away": "F.C. AMERICA", "home_score": None, "away_score": None},
    {"week": 10, "date": "2025-12-14", "home": "BERONES VETERANOS LOGROÑO", "away": "YAGÜE CUATRO CANTONES", "home_score": None, "away_score": None},
    {"week": 10, "date": "2025-12-14", "home": "S.D. COSMOS", "away": "C.D. TEDEON", "home_score": None, "away_score": None},
    
    # Jornada 11 - 21/12/2025
    {"week": 11, "date": "2025-12-21", "home": "V.L. PLAK LA MULA", "away": "F.C. AMERICA", "home_score": None, "away_score": None},
    {"week": 11, "date": "2025-12-21", "home": "YAGÜE CUATRO CANTONES", "away": "VAREA DIERO", "home_score": None, "away_score": None},
    {"week": 11, "date": "2025-12-21", "home": "HORMIGONES ANGULO NAXARA C.D.", "away": "S.D. COSMOS", "home_score": None, "away_score": None},
    {"week": 11, "date": "2025-12-21", "home": "C.D. TEDEON", "away": "24 TEAM", "home_score": None, "away_score": None},
    {"week": 11, "date": "2025-12-21", "home": "BERCEO VETERANOS", "away": "BAR SORIA", "home_score": None, "away_score": None},
    {"week": 11, "date": "2025-12-21", "home": "TABERNA 11 METROS", "away": "BERONES VETERANOS LOGROÑO", "home_score": None, "away_score": None},
]

# Division 2 Fixtures - All Jornadas (1-6)
division_2_fixtures = [
    # Jornada 1 - 05/10/2025
    {"week": 1, "date": "2025-10-05", "home": "FLOR DEL CAMPO - ICARO BISTRO BAR", "away": "BAR CAFÉ BALA", "home_score": 0, "away_score": 2},
    {"week": 1, "date": "2025-10-05", "home": "PEÑA BETICA LOGROÑO", "away": "VIANES", "home_score": 5, "away_score": 6},
    {"week": 1, "date": "2025-10-05", "home": "BRISK IMPORT IBERICA", "away": "F.C. MARRUECOS", "home_score": 0, "away_score": 2},
    {"week": 1, "date": "2025-10-05", "home": "VENDING LARDERO", "away": "C.F. ECUADOR", "home_score": 1, "away_score": 0},
    {"week": 1, "date": "2025-10-05", "home": "INOXIDABLES DMEDINA", "away": "VILLEGAS", "home_score": 1, "away_score": 5},
    {"week": 1, "date": "2025-10-05", "home": "PODOACTIVA VILLAMEDIANA VETERANOS", "away": "BOLIVIANOS UNIDOS", "home_score": 3, "away_score": 3},
    
    # Jornada 2 - 12/10/2025
    {"week": 2, "date": "2025-10-12", "home": "BOLIVIANOS UNIDOS", "away": "PEÑA BETICA LOGROÑO", "home_score": 3, "away_score": 1},
    {"week": 2, "date": "2025-10-12", "home": "F.C. MARRUECOS", "away": "BAR CAFÉ BALA", "home_score": 3, "away_score": 3},
    {"week": 2, "date": "2025-10-12", "home": "VILLEGAS", "away": "PODOACTIVA VILLAMEDIANA VETERANOS", "home_score": 1, "away_score": 3},
    {"week": 2, "date": "2025-10-12", "home": "VENDING LARDERO", "away": "FLOR DEL CAMPO - ICARO BISTRO BAR", "home_score": 1, "away_score": 5},
    {"week": 2, "date": "2025-10-12", "home": "C.F. ECUADOR", "away": "INOXIDABLES DMEDINA", "home_score": 5, "away_score": 3},
    {"week": 2, "date": "2025-10-12", "home": "VIANES", "away": "BRISK IMPORT IBERICA", "home_score": 2, "away_score": 5},
    
    # Jornada 3 - 19/10/2025
    {"week": 3, "date": "2025-10-19", "home": "PEÑA BETICA LOGROÑO", "away": "PODOACTIVA VILLAMEDIANA VETERANOS", "home_score": 1, "away_score": 1},
    {"week": 3, "date": "2025-10-19", "home": "BRISK IMPORT IBERICA", "away": "VENDING LARDERO", "home_score": 2, "away_score": 0},
    {"week": 3, "date": "2025-10-19", "home": "F.C. MARRUECOS", "away": "VIANES", "home_score": 2, "away_score": 2},
    {"week": 3, "date": "2025-10-19", "home": "C.F. ECUADOR", "away": "FLOR DEL CAMPO - ICARO BISTRO BAR", "home_score": 0, "away_score": 1},
    {"week": 3, "date": "2025-10-19", "home": "INOXIDABLES DMEDINA", "away": "VILLEGAS", "home_score": 3, "away_score": 0},
    {"week": 3, "date": "2025-10-19", "home": "BAR CAFÉ BALA", "away": "BOLIVIANOS UNIDOS", "home_score": 1, "away_score": 0},
    
    # Jornada 4 - 26/10/2025
    {"week": 4, "date": "2025-10-26", "home": "BOLIVIANOS UNIDOS", "away": "VENDING LARDERO", "home_score": 1, "away_score": 2},
    {"week": 4, "date": "2025-10-26", "home": "F.C. MARRUECOS", "away": "BRISK IMPORT IBERICA", "home_score": 1, "away_score": 2},
    {"week": 4, "date": "2025-10-26", "home": "VILLEGAS", "away": "FLOR DEL CAMPO - ICARO BISTRO BAR", "home_score": 1, "away_score": 2},
    {"week": 4, "date": "2025-10-26", "home": "C.F. ECUADOR", "away": "PEÑA BETICA LOGROÑO", "home_score": 3, "away_score": 1},
    {"week": 4, "date": "2025-10-26", "home": "BAR CAFÉ BALA", "away": "INOXIDABLES DMEDINA", "home_score": 2, "away_score": 1},
    {"week": 4, "date": "2025-10-26", "home": "VIANES", "away": "PODOACTIVA VILLAMEDIANA VETERANOS", "home_score": 1, "away_score": 4},
    
    # Jornada 5 - 02/11/2025
    {"week": 5, "date": "2025-11-02", "home": "FLOR DEL CAMPO - ICARO BISTRO BAR", "away": "PODOACTIVA VILLAMEDIANA VETERANOS", "home_score": None, "away_score": None},
    {"week": 5, "date": "2025-11-02", "home": "BOLIVIANOS UNIDOS", "away": "INOXIDABLES DMEDINA", "home_score": None, "away_score": None},
    {"week": 5, "date": "2025-11-02", "home": "VILLEGAS", "away": "BRISK IMPORT IBERICA", "home_score": None, "away_score": None},
    {"week": 5, "date": "2025-11-02", "home": "VENDING LARDERO", "away": "PEÑA BETICA LOGROÑO", "home_score": None, "away_score": None},
    {"week": 5, "date": "2025-11-02", "home": "C.F. ECUADOR", "away": "F.C. MARRUECOS", "home_score": None, "away_score": None},
    {"week": 5, "date": "2025-11-02", "home": "VIANES", "away": "BAR CAFÉ BALA", "home_score": None, "away_score": None},
    
    # Jornada 6 - 09/11/2025
    {"week": 6, "date": "2025-11-09", "home": "FLOR DEL CAMPO - ICARO BISTRO BAR", "away": "PEÑA BETICA LOGROÑO", "home_score": None, "away_score": None},
    {"week": 6, "date": "2025-11-09", "home": "BOLIVIANOS UNIDOS", "away": "F.C. MARRUECOS", "home_score": None, "away_score": None},
    {"week": 6, "date": "2025-11-09", "home": "VILLEGAS", "away": "BAR CAFÉ BALA", "home_score": None, "away_score": None},
    {"week": 6, "date": "2025-11-09", "home": "VENDING LARDERO", "away": "INOXIDABLES DMEDINA", "home_score": None, "away_score": None},
    {"week": 6, "date": "2025-11-09", "home": "PODOACTIVA VILLAMEDIANA VETERANOS", "away": "BRISK IMPORT IBERICA", "home_score": None, "away_score": None},
    {"week": 6, "date": "2025-11-09", "home": "VIANES", "away": "C.F. ECUADOR", "home_score": None, "away_score": None},
]

async def populate_database():
    print("🏆 Starting database population for Liga Veteranos Logroño...")
    
    # Clear existing data
    print("\n🗑️  Clearing existing data...")
    await db.teams.delete_many({})
    await db.fixtures.delete_many({})
    await db.players.delete_many({})
    
    # Create all teams
    print("\n👥 Creating teams...")
    all_teams = division_1_teams + division_2_teams
    team_mapping = {}
    
    for team_data in all_teams:
        team_id = str(uuid.uuid4())
        team = {
            "id": team_id,
            "name": team_data["name"],
            "division": team_data["division"],
            "logo_url": None
        }
        await db.teams.insert_one(team)
        team_mapping[team_data["name"]] = team_id
        print(f"   ✓ Created {team_data['name']} (Division {team_data['division']})")
    
    # Create fixtures for Division 1
    print("\n⚽ Creating Division 1 fixtures...")
    for fixture_data in division_1_fixtures:
        fixture_id = str(uuid.uuid4())
        home_team_id = team_mapping[fixture_data["home"]]
        away_team_id = team_mapping[fixture_data["away"]]
        
        fixture = {
            "id": fixture_id,
            "division": 1,
            "week": fixture_data["week"],
            "home_team_id": home_team_id,
            "away_team_id": away_team_id,
            "home_score": fixture_data.get("home_score"),
            "away_score": fixture_data.get("away_score"),
            "match_date": datetime.strptime(fixture_data["date"], "%Y-%m-%d"),
            "status": "completed" if fixture_data.get("home_score") is not None else "scheduled",
            "home_scorers": [],
            "away_scorers": [],
            "home_cards": [],
            "away_cards": [],
            "updated_at": datetime.now()
        }
        await db.fixtures.insert_one(fixture)
        print(f"   ✓ Week {fixture_data['week']}: {fixture_data['home']} vs {fixture_data['away']}")
    
    # Create fixtures for Division 2
    print("\n⚽ Creating Division 2 fixtures...")
    for fixture_data in division_2_fixtures:
        fixture_id = str(uuid.uuid4())
        home_team_id = team_mapping[fixture_data["home"]]
        away_team_id = team_mapping[fixture_data["away"]]
        
        fixture = {
            "id": fixture_id,
            "division": 2,
            "week": fixture_data["week"],
            "home_team_id": home_team_id,
            "away_team_id": away_team_id,
            "home_score": fixture_data.get("home_score"),
            "away_score": fixture_data.get("away_score"),
            "match_date": datetime.strptime(fixture_data["date"], "%Y-%m-%d"),
            "status": "completed" if fixture_data.get("home_score") is not None else "scheduled",
            "home_scorers": [],
            "away_scorers": [],
            "home_cards": [],
            "away_cards": [],
            "updated_at": datetime.now()
        }
        await db.fixtures.insert_one(fixture)
        print(f"   ✓ Week {fixture_data['week']}: {fixture_data['home']} vs {fixture_data['away']}")
    
    print("\n✅ Database population complete!")
    print(f"   📊 Total teams created: {len(all_teams)}")
    print(f"   📅 Total fixtures created: {len(division_1_fixtures) + len(division_2_fixtures)}")
    print("\n🎉 Liga Veteranos Logroño data is ready!")

if __name__ == "__main__":
    asyncio.run(populate_database())
