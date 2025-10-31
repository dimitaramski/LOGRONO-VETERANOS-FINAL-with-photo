import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
import uuid

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['football_league']

# Division 1 Teams
division_1_teams = [
    {"name": "V.L. PLAK LA MULA", "division": 1},
    {"name": "S.D. COSMOS", "division": 1},
    {"name": "YAGÜE CUATRO CANTONES", "division": 1},
    {"name": "BAR SORIA", "division": 1},
    {"name": "C.D. TEDEON", "division": 1},
    {"name": "BERONES VETERANOS LOGROÑO", "division": 1},
    {"name": "BERCEO VETERANOS", "division": 1},
    {"name": "VAREA DIERO", "division": 1},
    {"name": "24 TEAM", "division": 1},
    {"name": "TABERNA 11 METROS", "division": 1},
    {"name": "HORMIGONES ANGULO NAXARA C.D.", "division": 1},
    {"name": "F.C. AMERICA", "division": 1},
]

# Division 2 Teams
division_2_teams = [
    {"name": "BAR CAFÉ BALA", "division": 2},
    {"name": "C.F. ECUADOR", "division": 2},
    {"name": "BRISK IMPORT IBERICA", "division": 2},
    {"name": "FLOR DEL CAMPO - ICARO BISTRO BAR", "division": 2},
    {"name": "PODOACTIVA VILLAMEDIANA VETERANOS", "division": 2},
    {"name": "VENDING LARDERO", "division": 2},
    {"name": "F.C. MARRUECOS", "division": 2},
    {"name": "BOLIVIANOS UNIDOS", "division": 2},
    {"name": "VIANES", "division": 2},
    {"name": "INOXIDABLES DMEDINA", "division": 2},
    {"name": "PEÑA BETICA LOGROÑO", "division": 2},
    {"name": "VILLEGAS", "division": 2},
]

# Division 1 Fixtures with scores (from the calendar)
division_1_fixtures = [
    # Jornada 1 - 05/10/2025
    {"week": 1, "date": "2025-10-05", "home": "V.L. PLAK LA MULA", "away": "BERONES VETERANOS LOGROÑO", "home_score": 3, "away_score": 0},
    {"week": 1, "date": "2025-10-05", "home": "YAGÜE CUATRO CANTONES", "away": "S.D. COSMOS", "home_score": 0, "away_score": 1},
    {"week": 1, "date": "2025-10-05", "home": "F.C. AMERICA", "away": "24 TEAM", "home_score": 0, "away_score": 1},
    {"week": 1, "date": "2025-10-05", "home": "BERCEO VETERANOS", "away": "C.D. TEDEON", "home_score": 1, "away_score": 1},
    {"week": 1, "date": "2025-10-05", "home": "VAREA DIERO", "away": "HORMIGONES ANGULO NAXARA C.D.", "home_score": 2, "away_score": 2},
    {"week": 1, "date": "2025-10-05", "home": "TABERNA 11 METROS", "away": "BAR SORIA", "home_score": 1, "away_score": 3},
    
    # Jornada 2 - 12/10/2025
    {"week": 2, "date": "2025-10-12", "home": "HORMIGONES ANGULO NAXARA C.D.", "away": "YAGÜE CUATRO CANTONES", "home_score": 0, "away_score": 5},
    {"week": 2, "date": "2025-10-12", "home": "BAR SORIA", "away": "BERONES VETERANOS LOGROÑO", "home_score": 4, "away_score": 1},
    {"week": 2, "date": "2025-10-12", "home": "C.D. TEDEON", "away": "TABERNA 11 METROS", "home_score": 1, "away_score": 1},
    {"week": 2, "date": "2025-10-12", "home": "BERCEO VETERANOS", "away": "V.L. PLAK LA MULA", "home_score": 0, "away_score": 3},
    {"week": 2, "date": "2025-10-12", "home": "24 TEAM", "away": "VAREA DIERO", "home_score": 0, "away_score": 1},
    {"week": 2, "date": "2025-10-12", "home": "S.D. COSMOS", "away": "F.C. AMERICA", "home_score": 2, "away_score": 1},
    
    # Jornada 3 - 19/10/2025
    {"week": 3, "date": "2025-10-19", "home": "YAGÜE CUATRO CANTONES", "away": "TABERNA 11 METROS", "home_score": 3, "away_score": 2},
    {"week": 3, "date": "2025-10-19", "home": "F.C. AMERICA", "away": "BERCEO VETERANOS", "home_score": 1, "away_score": 1},
    {"week": 3, "date": "2025-10-19", "home": "BAR SORIA", "away": "S.D. COSMOS", "home_score": 1, "away_score": 2},
    {"week": 3, "date": "2025-10-19", "home": "24 TEAM", "away": "V.L. PLAK LA MULA", "home_score": 1, "away_score": 3},
    {"week": 3, "date": "2025-10-19", "home": "VAREA DIERO", "away": "C.D. TEDEON", "home_score": 2, "away_score": 3},
    {"week": 3, "date": "2025-10-19", "home": "BERONES VETERANOS LOGROÑO", "away": "HORMIGONES ANGULO NAXARA C.D.", "home_score": 3, "away_score": 1},
    
    # Jornada 4 - 26/10/2025
    {"week": 4, "date": "2025-10-26", "home": "HORMIGONES ANGULO NAXARA C.D.", "away": "BERCEO VETERANOS", "home_score": 2, "away_score": 1},
    {"week": 4, "date": "2025-10-26", "home": "BAR SORIA", "away": "F.C. AMERICA", "home_score": 3, "away_score": 1},
    {"week": 4, "date": "2025-10-26", "home": "VILLEGAS", "away": "FLOR DEL CAMPO - ICARO BISTRO BAR", "home_score": 0, "away_score": 2},
    {"week": 4, "date": "2025-10-26", "home": "C.F. ECUADOR", "away": "PEÑA BETICA LOGROÑO", "home_score": 5, "away_score": 1},
    {"week": 4, "date": "2025-10-26", "home": "BAR CAFÉ BALA", "away": "INOXIDABLES DMEDINA", "home_score": 0, "away_score": 1},
    {"week": 4, "date": "2025-10-26", "home": "VIANES", "away": "PODOACTIVA VILLAMEDIANA VETERANOS", "home_score": 1, "away_score": 4},
]

# Division 2 Fixtures
division_2_fixtures = [
    # Jornada 1 - 05/10/2025
    {"week": 1, "date": "2025-10-05", "home": "FLOR DEL CAMPO - ICARO BISTRO BAR", "away": "BAR CAFÉ BALA", "home_score": 0, "away_score": 2},
    {"week": 1, "date": "2025-10-05", "home": "PEÑA BETICA LOGROÑO", "away": "VIANES", "home_score": 5, "away_score": 0},
    {"week": 1, "date": "2025-10-05", "home": "BRISK IMPORT IBERICA", "away": "C.F. ECUADOR", "home_score": 0, "away_score": 1},
    {"week": 1, "date": "2025-10-05", "home": "VENDING LARDERO", "away": "VILLEGAS", "home_score": 1, "away_score": 5},
    {"week": 1, "date": "2025-10-05", "home": "INOXIDABLES DMEDINA", "away": "F.C. MARRUECOS", "home_score": 1, "away_score": 5},
    {"week": 1, "date": "2025-10-05", "home": "PODOACTIVA VILLAMEDIANA VETERANOS", "away": "BOLIVIANOS UNIDOS", "home_score": 3, "away_score": 3},
    
    # Jornada 2 - 12/10/2025  
    {"week": 2, "date": "2025-10-12", "home": "BOLIVIANOS UNIDOS", "away": "PEÑA BETICA LOGROÑO", "home_score": 3, "away_score": 1},
    {"week": 2, "date": "2025-10-12", "home": "F.C. MARRUECOS", "away": "BAR CAFÉ BALA", "home_score": 3, "away_score": 3},
    {"week": 2, "date": "2025-10-12", "home": "VILLEGAS", "away": "FLOR DEL CAMPO - ICARO BISTRO BAR", "home_score": 1, "away_score": 3},
    {"week": 2, "date": "2025-10-12", "home": "VENDING LARDERO", "away": "FLOR DEL CAMPO - ICARO BISTRO BAR", "home_score": 1, "away_score": 5},
    {"week": 2, "date": "2025-10-12", "home": "C.F. ECUADOR", "away": "INOXIDABLES DMEDINA", "home_score": 5, "away_score": 3},
    {"week": 2, "date": "2025-10-12", "home": "VIANES", "away": "BRISK IMPORT IBERICA", "home_score": 0, "away_score": 5},
    
    # Jornada 3 - 19/10/2025
    {"week": 3, "date": "2025-10-19", "home": "PEÑA BETICA LOGROÑO", "away": "PODOACTIVA VILLAMEDIANA VETERANOS", "home_score": 1, "away_score": 1},
    {"week": 3, "date": "2025-10-19", "home": "BRISK IMPORT IBERICA", "away": "VENDING LARDERO", "home_score": 0, "away_score": 0},
    {"week": 3, "date": "2025-10-19", "home": "F.C. MARRUECOS", "away": "VIANES", "home_score": 0, "away_score": 1},
    {"week": 3, "date": "2025-10-19", "home": "C.F. ECUADOR", "away": "FLOR DEL CAMPO - ICARO BISTRO BAR", "home_score": 0, "away_score": 1},
    {"week": 3, "date": "2025-10-19", "home": "INOXIDABLES DMEDINA", "away": "VILLEGAS", "home_score": 3, "away_score": 0},
    {"week": 3, "date": "2025-10-19", "home": "BAR CAFÉ BALA", "away": "BOLIVIANOS UNIDOS", "home_score": 1, "away_score": 0},
    
    # Jornada 4 - 26/10/2025
    {"week": 4, "date": "2025-10-26", "home": "BOLIVIANOS UNIDOS", "away": "VENDING LARDERO", "home_score": 1, "away_score": 0},
    {"week": 4, "date": "2025-10-26", "home": "F.C. MARRUECOS", "away": "BRISK IMPORT IBERICA", "home_score": 2, "away_score": 3},
    {"week": 4, "date": "2025-10-26", "home": "VILLEGAS", "away": "FLOR DEL CAMPO - ICARO BISTRO BAR", "home_score": 1, "away_score": 3},
    {"week": 4, "date": "2025-10-26", "home": "C.F. ECUADOR", "away": "PEÑA BETICA LOGROÑO", "home_score": 5, "away_score": 1},
    {"week": 4, "date": "2025-10-26", "home": "BAR CAFÉ BALA", "away": "INOXIDABLES DMEDINA", "home_score": 0, "away_score": 1},
    {"week": 4, "date": "2025-10-26", "home": "VIANES", "away": "PODOACTIVA VILLAMEDIANA VETERANOS", "home_score": 1, "away_score": 4},
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
