from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# ============= Models =============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    role: str  # admin or team
    team_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    username: str
    password: str
    role: str
    team_id: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Team(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    division: int  # 1 or 2
    logo_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TeamCreate(BaseModel):
    name: str
    division: int
    logo_url: Optional[str] = None

class Player(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    team_id: str
    jersey_number: Optional[int] = None
    goals_scored: int = 0
    yellow_cards: int = 0
    red_cards: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PlayerCreate(BaseModel):
    name: str
    team_id: str
    jersey_number: Optional[int] = None

class GoalScorer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_id: str
    player_name: str
    minute: Optional[int] = None

class Card(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_id: str
    player_name: str
    card_type: str  # yellow or red
    minute: Optional[int] = None

class Fixture(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    division: int
    week_number: int
    home_team_id: str
    away_team_id: str
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    match_date: datetime
    status: str = "scheduled"  # scheduled or completed
    home_scorers: List[GoalScorer] = []
    away_scorers: List[GoalScorer] = []
    home_cards: List[Card] = []
    away_cards: List[Card] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FixtureCreate(BaseModel):
    division: int
    week_number: int
    home_team_id: str
    away_team_id: str
    match_date: str

class FixtureCreateBulk(BaseModel):
    division: int
    week_number: int
    fixtures: List[dict]  # [{home_team_id, away_team_id, match_date}]

class FixtureUpdate(BaseModel):
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    status: Optional[str] = None
    week_number: Optional[int] = None
    match_date: Optional[str] = None

class AddGoalScorer(BaseModel):
    player_id: str
    team_side: str  # home or away
    minute: Optional[int] = None

class AddCard(BaseModel):
    player_id: str
    team_side: str  # home or away
    card_type: str  # yellow or red
    minute: Optional[int] = None

class RemoveGoalScorer(BaseModel):
    goal_id: str
    team_side: str

class RemoveCard(BaseModel):
    card_id: str
    team_side: str

class StandingsRow(BaseModel):
    position: int
    team_id: str
    team_name: str
    games_played: int
    games_won: int
    games_draw: int
    games_lost: int
    goals_for: int
    goals_against: int
    goal_difference: int
    points: int

class TopScorer(BaseModel):
    player_id: str
    player_name: str
    team_id: str
    team_name: str
    goals: int

class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    payment_status: str = "pending"  # pending or completed
    amount: float = 5.0
    season: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubscriptionCreate(BaseModel):
    email: EmailStr
    season: str

class InstagramPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    instagram_url: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InstagramPostCreate(BaseModel):
    instagram_url: str
    description: Optional[str] = None

# Copa Models
class CopaGroup(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    group_name: str  # A, B, C, or D
    team_ids: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CopaGroupCreate(BaseModel):
    group_name: str
    team_ids: List[str]

class CopaFixture(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    group_name: str  # A, B, C, or D
    jornada: int  # 1-5
    home_team_id: str
    away_team_id: str
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    match_date: datetime
    status: str = "scheduled"  # scheduled, live, halftime, or completed
    home_scorers: List[GoalScorer] = []
    away_scorers: List[GoalScorer] = []
    home_cards: List[Card] = []
    away_cards: List[Card] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CopaFixtureCreate(BaseModel):
    group_name: str
    jornada: int
    home_team_id: str
    away_team_id: str
    match_date: str

class CopaFixtureUpdate(BaseModel):
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    status: Optional[str] = None
    jornada: Optional[int] = None
    match_date: Optional[str] = None

class CopaBracket(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    round_type: str  # round_of_16, quarter_final, semi_final, final
    match_position: int  # Position in the bracket (1-8 for R16, 1-4 for QF, 1-2 for SF, 1 for Final)
    home_team_id: Optional[str] = None
    away_team_id: Optional[str] = None
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    match_date: Optional[datetime] = None
    status: str = "scheduled"  # scheduled, live, halftime, or completed
    winner_team_id: Optional[str] = None
    home_scorers: List[GoalScorer] = []
    away_scorers: List[GoalScorer] = []
    home_cards: List[Card] = []
    away_cards: List[Card] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CopaBracketCreate(BaseModel):
    round_type: str
    match_position: int
    home_team_id: Optional[str] = None
    away_team_id: Optional[str] = None
    match_date: Optional[str] = None

class CopaBracketUpdate(BaseModel):
    home_team_id: Optional[str] = None
    away_team_id: Optional[str] = None
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    status: Optional[str] = None
    match_date: Optional[str] = None
    winner_team_id: Optional[str] = None

class CopaStandingsRow(BaseModel):
    position: int
    team_id: str
    team_name: str
    games_played: int
    games_won: int
    games_draw: int
    games_lost: int
    goals_for: int
    goals_against: int
    goal_difference: int
    points: int

# ============= Helper Functions =============

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user_doc is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        if isinstance(user_doc['created_at'], str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        
        return User(**user_doc)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ============= Routes =============

@api_router.get("/")
async def root():
    return {"message": "Liga Veteranos Logroño API"}

# Auth Routes
@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate, admin: User = Depends(get_admin_user)):
    # Check if username exists
    existing = await db.users.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        role=user_data.role,
        team_id=user_data.team_id
    )
    
    doc = user.model_dump()
    doc['hashed_password'] = hashed_password
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return user

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user_doc = await db.users.find_one({"username": user_data.username}, {"_id": 0})
    if not user_doc or not verify_password(user_data.password, user_doc['hashed_password']):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user_doc.pop('hashed_password')
    user = User(**user_doc)
    
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Team Routes
@api_router.get("/teams", response_model=List[Team])
async def get_teams():
    teams = await db.teams.find({}, {"_id": 0}).to_list(1000)
    for team in teams:
        if isinstance(team['created_at'], str):
            team['created_at'] = datetime.fromisoformat(team['created_at'])
    return teams

@api_router.get("/teams/{team_id}", response_model=Team)
async def get_team(team_id: str):
    team = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if isinstance(team['created_at'], str):
        team['created_at'] = datetime.fromisoformat(team['created_at'])
    return Team(**team)

@api_router.post("/teams", response_model=Team)
async def create_team(team_data: TeamCreate, admin: User = Depends(get_admin_user)):
    team = Team(**team_data.model_dump())
    doc = team.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.teams.insert_one(doc)
    return team

@api_router.put("/teams/{team_id}", response_model=Team)
async def update_team(team_id: str, team_data: TeamCreate, admin: User = Depends(get_admin_user)):
    result = await db.teams.update_one(
        {"id": team_id},
        {"$set": team_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if isinstance(team['created_at'], str):
        team['created_at'] = datetime.fromisoformat(team['created_at'])
    return Team(**team)

@api_router.delete("/teams/{team_id}")
async def delete_team(team_id: str, admin: User = Depends(get_admin_user)):
    result = await db.teams.delete_one({"id": team_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"message": "Team deleted successfully"}

# Player Routes
@api_router.get("/players", response_model=List[Player])
async def get_players():
    players = await db.players.find({}, {"_id": 0}).to_list(1000)
    for player in players:
        if isinstance(player['created_at'], str):
            player['created_at'] = datetime.fromisoformat(player['created_at'])
    return players

@api_router.get("/players/team/{team_id}", response_model=List[Player])
async def get_team_players(team_id: str):
    players = await db.players.find({"team_id": team_id}, {"_id": 0}).to_list(1000)
    for player in players:
        if isinstance(player['created_at'], str):
            player['created_at'] = datetime.fromisoformat(player['created_at'])
    return players

@api_router.post("/players", response_model=Player)
async def create_player(player_data: PlayerCreate, admin: User = Depends(get_admin_user)):
    player = Player(**player_data.model_dump())
    doc = player.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.players.insert_one(doc)
    return player

@api_router.put("/players/{player_id}", response_model=Player)
async def update_player(player_id: str, player_data: PlayerCreate, admin: User = Depends(get_admin_user)):
    result = await db.players.update_one(
        {"id": player_id},
        {"$set": player_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    
    player = await db.players.find_one({"id": player_id}, {"_id": 0})
    if isinstance(player['created_at'], str):
        player['created_at'] = datetime.fromisoformat(player['created_at'])
    return Player(**player)

@api_router.delete("/players/{player_id}")
async def delete_player(player_id: str, admin: User = Depends(get_admin_user)):
    result = await db.players.delete_one({"id": player_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    return {"message": "Player deleted successfully"}

# Fixture Routes
@api_router.get("/fixtures", response_model=List[Fixture])
async def get_fixtures():
    fixtures = await db.fixtures.find({}, {"_id": 0}).sort("week_number", 1).to_list(1000)
    for fixture in fixtures:
        if isinstance(fixture['match_date'], str):
            fixture['match_date'] = datetime.fromisoformat(fixture['match_date'])
        if isinstance(fixture['updated_at'], str):
            fixture['updated_at'] = datetime.fromisoformat(fixture['updated_at'])
    return fixtures

@api_router.get("/fixtures/division/{division}", response_model=List[Fixture])
async def get_division_fixtures(division: int):
    fixtures = await db.fixtures.find({"division": division}, {"_id": 0}).sort("week_number", 1).to_list(1000)
    for fixture in fixtures:
        if isinstance(fixture['match_date'], str):
            fixture['match_date'] = datetime.fromisoformat(fixture['match_date'])
        if isinstance(fixture['updated_at'], str):
            fixture['updated_at'] = datetime.fromisoformat(fixture['updated_at'])
    return fixtures

@api_router.post("/fixtures", response_model=Fixture)
async def create_fixture(fixture_data: FixtureCreate, admin: User = Depends(get_admin_user)):
    fixture_dict = fixture_data.model_dump()
    fixture_dict['match_date'] = datetime.fromisoformat(fixture_data.match_date)
    fixture = Fixture(**fixture_dict)
    
    doc = fixture.model_dump()
    doc['match_date'] = doc['match_date'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.fixtures.insert_one(doc)
    return fixture

@api_router.put("/fixtures/{fixture_id}", response_model=Fixture)
async def update_fixture(fixture_id: str, fixture_data: FixtureUpdate, current_user: User = Depends(get_current_user)):
    update_data = {k: v for k, v in fixture_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.fixtures.update_one(
        {"id": fixture_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Fixture not found")
    
    fixture = await db.fixtures.find_one({"id": fixture_id}, {"_id": 0})
    if isinstance(fixture['match_date'], str):
        fixture['match_date'] = datetime.fromisoformat(fixture['match_date'])
    if isinstance(fixture['updated_at'], str):
        fixture['updated_at'] = datetime.fromisoformat(fixture['updated_at'])
    
    return Fixture(**fixture)

@api_router.post("/fixtures/{fixture_id}/goals")
async def add_goal_scorer(fixture_id: str, goal_data: AddGoalScorer, current_user: User = Depends(get_current_user)):
    # Get player info
    player = await db.players.find_one({"id": goal_data.player_id}, {"_id": 0})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    goal_scorer = GoalScorer(
        player_id=goal_data.player_id,
        player_name=player['name'],
        minute=goal_data.minute
    )
    
    field = "home_scorers" if goal_data.team_side == "home" else "away_scorers"
    
    await db.fixtures.update_one(
        {"id": fixture_id},
        {"$push": {field: goal_scorer.model_dump()}}
    )
    
    # Update player goals count
    await db.players.update_one(
        {"id": goal_data.player_id},
        {"$inc": {"goals_scored": 1}}
    )
    
    return {"message": "Goal scorer added successfully"}

@api_router.delete("/fixtures/{fixture_id}/goals")
async def remove_goal_scorer(fixture_id: str, goal_data: RemoveGoalScorer, admin: User = Depends(get_admin_user)):
    # Get fixture to find the goal scorer
    fixture = await db.fixtures.find_one({"id": fixture_id}, {"_id": 0})
    if not fixture:
        raise HTTPException(status_code=404, detail="Fixture not found")
    
    field = "home_scorers" if goal_data.team_side == "home" else "away_scorers"
    scorers = fixture.get(field, [])
    
    # Find the goal scorer and player_id
    player_id = None
    for scorer in scorers:
        if scorer['id'] == goal_data.goal_id:
            player_id = scorer['player_id']
            break
    
    if not player_id:
        raise HTTPException(status_code=404, detail="Goal scorer not found")
    
    # Remove goal scorer from fixture
    await db.fixtures.update_one(
        {"id": fixture_id},
        {"$pull": {field: {"id": goal_data.goal_id}}}
    )
    
    # Decrement player goals count
    await db.players.update_one(
        {"id": player_id},
        {"$inc": {"goals_scored": -1}}
    )
    
    return {"message": "Goal scorer removed successfully"}

@api_router.post("/fixtures/{fixture_id}/cards")
async def add_card(fixture_id: str, card_data: AddCard, current_user: User = Depends(get_current_user)):
    # Get player info
    player = await db.players.find_one({"id": card_data.player_id}, {"_id": 0})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    card = Card(
        player_id=card_data.player_id,
        player_name=player['name'],
        card_type=card_data.card_type,
        minute=card_data.minute
    )
    
    field = "home_cards" if card_data.team_side == "home" else "away_cards"
    
    await db.fixtures.update_one(
        {"id": fixture_id},
        {"$push": {field: card.model_dump()}}
    )
    
    # Update player card count
    card_field = "yellow_cards" if card_data.card_type == "yellow" else "red_cards"
    await db.players.update_one(
        {"id": card_data.player_id},
        {"$inc": {card_field: 1}}
    )
    
    return {"message": "Card added successfully"}

@api_router.delete("/fixtures/{fixture_id}/cards")
async def remove_card(fixture_id: str, card_data: RemoveCard, admin: User = Depends(get_admin_user)):
    # Get fixture to find the card
    fixture = await db.fixtures.find_one({"id": fixture_id}, {"_id": 0})
    if not fixture:
        raise HTTPException(status_code=404, detail="Fixture not found")
    
    field = "home_cards" if card_data.team_side == "home" else "away_cards"
    cards = fixture.get(field, [])
    
    # Find the card and player_id
    player_id = None
    card_type = None
    for card in cards:
        if card['id'] == card_data.card_id:
            player_id = card['player_id']
            card_type = card['card_type']
            break
    
    if not player_id:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Remove card from fixture
    await db.fixtures.update_one(
        {"id": fixture_id},
        {"$pull": {field: {"id": card_data.card_id}}}
    )
    
    # Decrement player card count
    card_field = "yellow_cards" if card_type == "yellow" else "red_cards"
    await db.players.update_one(
        {"id": player_id},
        {"$inc": {card_field: -1}}
    )
    
    return {"message": "Card removed successfully"}

@api_router.delete("/fixtures/{fixture_id}")
async def delete_fixture(fixture_id: str, admin: User = Depends(get_admin_user)):
    result = await db.fixtures.delete_one({"id": fixture_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Fixture not found")
    return {"message": "Fixture deleted successfully"}

@api_router.post("/fixtures/bulk")
async def create_fixtures_bulk(data: FixtureCreateBulk, admin: User = Depends(get_admin_user)):
    created_fixtures = []
    for fixture_data in data.fixtures:
        fixture_dict = {
            "division": data.division,
            "week_number": data.week_number,
            "home_team_id": fixture_data["home_team_id"],
            "away_team_id": fixture_data["away_team_id"],
            "match_date": datetime.fromisoformat(fixture_data["match_date"])
        }
        fixture = Fixture(**fixture_dict)
        
        doc = fixture.model_dump()
        doc['match_date'] = doc['match_date'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.fixtures.insert_one(doc)
        created_fixtures.append(fixture)
    
    return {"message": f"Created {len(created_fixtures)} fixtures successfully"}

# Standings Route
@api_router.get("/standings/division/{division}", response_model=List[StandingsRow])
async def get_standings(division: int):
    teams = await db.teams.find({"division": division}, {"_id": 0}).to_list(1000)
    fixtures = await db.fixtures.find({"division": division, "status": "completed"}, {"_id": 0}).to_list(1000)
    
    standings = {}
    for team in teams:
        standings[team['id']] = {
            'team_id': team['id'],
            'team_name': team['name'],
            'games_played': 0,
            'games_won': 0,
            'games_draw': 0,
            'games_lost': 0,
            'goals_for': 0,
            'goals_against': 0,
            'points': 0
        }
    
    for fixture in fixtures:
        home_id = fixture['home_team_id']
        away_id = fixture['away_team_id']
        home_score = fixture['home_score'] or 0
        away_score = fixture['away_score'] or 0
        
        if home_id in standings and away_id in standings:
            standings[home_id]['games_played'] += 1
            standings[away_id]['games_played'] += 1
            standings[home_id]['goals_for'] += home_score
            standings[home_id]['goals_against'] += away_score
            standings[away_id]['goals_for'] += away_score
            standings[away_id]['goals_against'] += home_score
            
            if home_score > away_score:
                standings[home_id]['games_won'] += 1
                standings[home_id]['points'] += 3
                standings[away_id]['games_lost'] += 1
            elif home_score < away_score:
                standings[away_id]['games_won'] += 1
                standings[away_id]['points'] += 3
                standings[home_id]['games_lost'] += 1
            else:
                standings[home_id]['games_draw'] += 1
                standings[away_id]['games_draw'] += 1
                standings[home_id]['points'] += 1
                standings[away_id]['points'] += 1
    
    standings_list = list(standings.values())
    standings_list.sort(key=lambda x: (x['points'], x['goals_for'] - x['goals_against']), reverse=True)
    
    result = []
    for i, row in enumerate(standings_list):
        result.append(StandingsRow(
            position=i + 1,
            team_id=row['team_id'],
            team_name=row['team_name'],
            games_played=row['games_played'],
            games_won=row['games_won'],
            games_draw=row['games_draw'],
            games_lost=row['games_lost'],
            goals_for=row['goals_for'],
            goals_against=row['goals_against'],
            goal_difference=row['goals_for'] - row['goals_against'],
            points=row['points']
        ))
    
    return result

# Top Scorers Route
@api_router.get("/top-scorers", response_model=List[TopScorer])
async def get_top_scorers(division: Optional[int] = None):
    if division:
        teams = await db.teams.find({"division": division}, {"_id": 0}).to_list(1000)
        team_ids = [team['id'] for team in teams]
        players = await db.players.find({"team_id": {"$in": team_ids}}, {"_id": 0}).sort("goals_scored", -1).to_list(100)
    else:
        players = await db.players.find({}, {"_id": 0}).sort("goals_scored", -1).to_list(100)
    
    result = []
    for player in players:
        if player['goals_scored'] > 0:
            team = await db.teams.find_one({"id": player['team_id']}, {"_id": 0})
            result.append(TopScorer(
                player_id=player['id'],
                player_name=player['name'],
                team_id=player['team_id'],
                team_name=team['name'] if team else "Unknown",
                goals=player['goals_scored']
            ))
    
    return result

# Cards Statistics
class PlayerCards(BaseModel):
    player_id: str
    player_name: str
    team_id: str
    team_name: str
    yellow_cards: int
    red_cards: int

@api_router.get("/cards-statistics", response_model=List[PlayerCards])
async def get_cards_statistics(division: Optional[int] = None):
    if division:
        teams = await db.teams.find({"division": division}, {"_id": 0}).to_list(1000)
        team_ids = [team['id'] for team in teams]
        players = await db.players.find({
            "team_id": {"$in": team_ids},
            "$or": [{"yellow_cards": {"$gt": 0}}, {"red_cards": {"$gt": 0}}]
        }, {"_id": 0}).to_list(100)
    else:
        players = await db.players.find({
            "$or": [{"yellow_cards": {"$gt": 0}}, {"red_cards": {"$gt": 0}}]
        }, {"_id": 0}).to_list(100)
    
    result = []
    for player in players:
        team = await db.teams.find_one({"id": player['team_id']}, {"_id": 0})
        result.append(PlayerCards(
            player_id=player['id'],
            player_name=player['name'],
            team_id=player['team_id'],
            team_name=team['name'] if team else "Unknown",
            yellow_cards=player.get('yellow_cards', 0),
            red_cards=player.get('red_cards', 0)
        ))
    
    # Sort by red cards first, then yellow cards
    result.sort(key=lambda x: (x.red_cards, x.yellow_cards), reverse=True)
    return result

# Subscription Routes
@api_router.post("/subscriptions/create", response_model=Subscription)
async def create_subscription(sub_data: SubscriptionCreate):
    # Check if subscription already exists
    existing = await db.subscriptions.find_one({"email": sub_data.email, "season": sub_data.season})
    if existing:
        raise HTTPException(status_code=400, detail="Subscription already exists for this email and season")
    
    expires_at = datetime.now(timezone.utc) + timedelta(days=365)
    subscription = Subscription(
        email=sub_data.email,
        season=sub_data.season,
        payment_status="completed",  # Mock payment
        expires_at=expires_at
    )
    
    doc = subscription.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['expires_at'] = doc['expires_at'].isoformat()
    
    await db.subscriptions.insert_one(doc)
    return subscription

@api_router.get("/subscriptions/verify/{email}")
async def verify_subscription(email: str, season: str):
    subscription = await db.subscriptions.find_one(
        {"email": email, "season": season, "payment_status": "completed"},
        {"_id": 0}
    )
    
    if not subscription:
        return {"valid": False}
    
    if isinstance(subscription['expires_at'], str):
        expires_at = datetime.fromisoformat(subscription['expires_at'])
    else:
        expires_at = subscription['expires_at']
    
    is_valid = expires_at > datetime.now(timezone.utc)
    return {"valid": is_valid}

# User Management (Admin only)
@api_router.get("/users", response_model=List[User])
async def get_users(admin: User = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "hashed_password": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

# Initialize admin user
@api_router.post("/init-admin")
async def init_admin():
    existing = await db.users.find_one({"username": "admin"})
    if existing:
        return {"message": "Admin already exists"}
    
    hashed_password = get_password_hash("admin123")
    admin_user = User(username="admin", role="admin")
    
    doc = admin_user.model_dump()
    doc['hashed_password'] = hashed_password
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return {"message": "Admin user created", "username": "admin", "password": "admin123"}

# Instagram Posts Routes
@api_router.get("/instagram-posts", response_model=List[InstagramPost])
async def get_instagram_posts():
    posts = await db.instagram_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for post in posts:
        if isinstance(post['created_at'], str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
    return posts

@api_router.post("/instagram-posts", response_model=InstagramPost)
async def create_instagram_post(post_data: InstagramPostCreate, admin: User = Depends(get_admin_user)):
    post = InstagramPost(**post_data.model_dump())
    doc = post.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.instagram_posts.insert_one(doc)
    return post

@api_router.delete("/instagram-posts/{post_id}")
async def delete_instagram_post(post_id: str, admin: User = Depends(get_admin_user)):
    result = await db.instagram_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}

# ============= Copa Routes =============

# Copa Groups
@api_router.get("/copa/groups", response_model=List[CopaGroup])
async def get_copa_groups():
    groups = await db.copa_groups.find({}, {"_id": 0}).to_list(length=None)
    for group in groups:
        if isinstance(group.get('created_at'), str):
            group['created_at'] = datetime.fromisoformat(group['created_at'])
    return groups

@api_router.post("/copa/groups", response_model=CopaGroup)
async def create_copa_group(group_data: CopaGroupCreate, admin: User = Depends(get_admin_user)):
    # Check if group already exists
    existing = await db.copa_groups.find_one({"group_name": group_data.group_name})
    if existing:
        raise HTTPException(status_code=400, detail=f"Group {group_data.group_name} already exists")
    
    group = CopaGroup(**group_data.model_dump())
    doc = group.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.copa_groups.insert_one(doc)
    return group

@api_router.put("/copa/groups/{group_name}")
async def update_copa_group(group_name: str, group_data: CopaGroupCreate, admin: User = Depends(get_admin_user)):
    result = await db.copa_groups.update_one(
        {"group_name": group_name},
        {"$set": {"team_ids": group_data.team_ids}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"message": "Group updated successfully"}

@api_router.delete("/copa/groups/{group_name}")
async def delete_copa_group(group_name: str, admin: User = Depends(get_admin_user)):
    result = await db.copa_groups.delete_one({"group_name": group_name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"message": "Group deleted successfully"}

# Copa Fixtures
@api_router.get("/copa/fixtures", response_model=List[CopaFixture])
async def get_copa_fixtures():
    fixtures = await db.copa_fixtures.find({}, {"_id": 0}).to_list(length=None)
    for fixture in fixtures:
        if isinstance(fixture.get('match_date'), str):
            fixture['match_date'] = datetime.fromisoformat(fixture['match_date'])
        if isinstance(fixture.get('updated_at'), str):
            fixture['updated_at'] = datetime.fromisoformat(fixture['updated_at'])
    return fixtures

@api_router.post("/copa/fixtures", response_model=CopaFixture)
async def create_copa_fixture(fixture_data: CopaFixtureCreate, admin: User = Depends(get_admin_user)):
    fixture = CopaFixture(
        group_name=fixture_data.group_name,
        jornada=fixture_data.jornada,
        home_team_id=fixture_data.home_team_id,
        away_team_id=fixture_data.away_team_id,
        match_date=datetime.fromisoformat(fixture_data.match_date)
    )
    doc = fixture.model_dump()
    doc['match_date'] = doc['match_date'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.copa_fixtures.insert_one(doc)
    return fixture

@api_router.put("/copa/fixtures/{fixture_id}")
async def update_copa_fixture(fixture_id: str, update_data: CopaFixtureUpdate, admin: User = Depends(get_admin_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if 'match_date' in update_dict:
        update_dict['match_date'] = datetime.fromisoformat(update_dict['match_date']).isoformat()
    
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.copa_fixtures.update_one({"id": fixture_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Fixture not found")
    return {"message": "Fixture updated successfully"}

@api_router.delete("/copa/fixtures/{fixture_id}")
async def delete_copa_fixture(fixture_id: str, admin: User = Depends(get_admin_user)):
    result = await db.copa_fixtures.delete_one({"id": fixture_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Fixture not found")
    return {"message": "Fixture deleted successfully"}

# Copa Fixture - Add/Remove Scorers and Cards
@api_router.post("/copa/fixtures/{fixture_id}/scorers")
async def add_copa_goal_scorer(fixture_id: str, scorer_data: AddGoalScorer, admin: User = Depends(get_admin_user)):
    fixture = await db.copa_fixtures.find_one({"id": fixture_id})
    if not fixture:
        raise HTTPException(status_code=404, detail="Fixture not found")
    
    player = await db.players.find_one({"id": scorer_data.player_id})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    goal = GoalScorer(player_id=scorer_data.player_id, player_name=player['name'], minute=scorer_data.minute)
    
    if scorer_data.team_side == "home":
        await db.copa_fixtures.update_one({"id": fixture_id}, {"$push": {"home_scorers": goal.model_dump()}})
    else:
        await db.copa_fixtures.update_one({"id": fixture_id}, {"$push": {"away_scorers": goal.model_dump()}})
    
    await db.players.update_one({"id": scorer_data.player_id}, {"$inc": {"goals_scored": 1}})
    
    return {"message": "Goal scorer added successfully"}

@api_router.delete("/copa/fixtures/{fixture_id}/scorers")
async def remove_copa_goal_scorer(fixture_id: str, scorer_data: RemoveGoalScorer, admin: User = Depends(get_admin_user)):
    fixture = await db.copa_fixtures.find_one({"id": fixture_id})
    if not fixture:
        raise HTTPException(status_code=404, detail="Fixture not found")
    
    scorer_list = fixture.get(f"{scorer_data.team_side}_scorers", [])
    scorer_to_remove = next((s for s in scorer_list if s['id'] == scorer_data.goal_id), None)
    
    if not scorer_to_remove:
        raise HTTPException(status_code=404, detail="Goal scorer not found")
    
    await db.copa_fixtures.update_one(
        {"id": fixture_id},
        {"$pull": {f"{scorer_data.team_side}_scorers": {"id": scorer_data.goal_id}}}
    )
    
    await db.players.update_one({"id": scorer_to_remove['player_id']}, {"$inc": {"goals_scored": -1}})
    
    return {"message": "Goal scorer removed successfully"}

@api_router.post("/copa/fixtures/{fixture_id}/cards")
async def add_copa_card(fixture_id: str, card_data: AddCard, admin: User = Depends(get_admin_user)):
    fixture = await db.copa_fixtures.find_one({"id": fixture_id})
    if not fixture:
        raise HTTPException(status_code=404, detail="Fixture not found")
    
    player = await db.players.find_one({"id": card_data.player_id})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    card = Card(player_id=card_data.player_id, player_name=player['name'], card_type=card_data.card_type, minute=card_data.minute)
    
    if card_data.team_side == "home":
        await db.copa_fixtures.update_one({"id": fixture_id}, {"$push": {"home_cards": card.model_dump()}})
    else:
        await db.copa_fixtures.update_one({"id": fixture_id}, {"$push": {"away_cards": card.model_dump()}})
    
    if card_data.card_type == "yellow":
        await db.players.update_one({"id": card_data.player_id}, {"$inc": {"yellow_cards": 1}})
    else:
        await db.players.update_one({"id": card_data.player_id}, {"$inc": {"red_cards": 1}})
    
    return {"message": "Card added successfully"}

@api_router.delete("/copa/fixtures/{fixture_id}/cards")
async def remove_copa_card(fixture_id: str, card_data: RemoveCard, admin: User = Depends(get_admin_user)):
    fixture = await db.copa_fixtures.find_one({"id": fixture_id})
    if not fixture:
        raise HTTPException(status_code=404, detail="Fixture not found")
    
    card_list = fixture.get(f"{card_data.team_side}_cards", [])
    card_to_remove = next((c for c in card_list if c['id'] == card_data.card_id), None)
    
    if not card_to_remove:
        raise HTTPException(status_code=404, detail="Card not found")
    
    await db.copa_fixtures.update_one(
        {"id": fixture_id},
        {"$pull": {f"{card_data.team_side}_cards": {"id": card_data.card_id}}}
    )
    
    if card_to_remove['card_type'] == "yellow":
        await db.players.update_one({"id": card_to_remove['player_id']}, {"$inc": {"yellow_cards": -1}})
    else:
        await db.players.update_one({"id": card_to_remove['player_id']}, {"$inc": {"red_cards": -1}})
    
    return {"message": "Card removed successfully"}

# Copa Standings
@api_router.get("/copa/standings/{group_name}", response_model=List[CopaStandingsRow])
async def get_copa_standings(group_name: str):
    # Get group teams
    group = await db.copa_groups.find_one({"group_name": group_name})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Get fixtures for this group
    fixtures = await db.copa_fixtures.find({"group_name": group_name, "status": "completed"}, {"_id": 0}).to_list(length=None)
    
    # Calculate standings
    standings = {}
    for team_id in group['team_ids']:
        team = await db.teams.find_one({"id": team_id})
        if team:
            standings[team_id] = {
                "team_id": team_id,
                "team_name": team['name'],
                "games_played": 0,
                "games_won": 0,
                "games_draw": 0,
                "games_lost": 0,
                "goals_for": 0,
                "goals_against": 0,
                "points": 0
            }
    
    for fixture in fixtures:
        home_id = fixture['home_team_id']
        away_id = fixture['away_team_id']
        home_score = fixture.get('home_score', 0)
        away_score = fixture.get('away_score', 0)
        
        if home_id in standings:
            standings[home_id]['games_played'] += 1
            standings[home_id]['goals_for'] += home_score
            standings[home_id]['goals_against'] += away_score
            
            if home_score > away_score:
                standings[home_id]['games_won'] += 1
                standings[home_id]['points'] += 3
            elif home_score == away_score:
                standings[home_id]['games_draw'] += 1
                standings[home_id]['points'] += 1
            else:
                standings[home_id]['games_lost'] += 1
        
        if away_id in standings:
            standings[away_id]['games_played'] += 1
            standings[away_id]['goals_for'] += away_score
            standings[away_id]['goals_against'] += home_score
            
            if away_score > home_score:
                standings[away_id]['games_won'] += 1
                standings[away_id]['points'] += 3
            elif away_score == home_score:
                standings[away_id]['games_draw'] += 1
                standings[away_id]['points'] += 1
            else:
                standings[away_id]['games_lost'] += 1
    
    # Sort by points, then goal difference
    standings_list = list(standings.values())
    standings_list.sort(key=lambda x: (x['points'], x['goals_for'] - x['goals_against'], x['goals_for']), reverse=True)
    
    # Add position and goal difference
    for i, row in enumerate(standings_list):
        row['position'] = i + 1
        row['goal_difference'] = row['goals_for'] - row['goals_against']
    
    return [CopaStandingsRow(**row) for row in standings_list]

# Copa Brackets
@api_router.get("/copa/brackets", response_model=List[CopaBracket])
async def get_copa_brackets():
    brackets = await db.copa_brackets.find({}, {"_id": 0}).to_list(length=None)
    for bracket in brackets:
        if isinstance(bracket.get('match_date'), str):
            bracket['match_date'] = datetime.fromisoformat(bracket['match_date'])
        if isinstance(bracket.get('created_at'), str):
            bracket['created_at'] = datetime.fromisoformat(bracket['created_at'])
        if isinstance(bracket.get('updated_at'), str):
            bracket['updated_at'] = datetime.fromisoformat(bracket['updated_at'])
    return brackets

@api_router.post("/copa/brackets", response_model=CopaBracket)
async def create_copa_bracket(bracket_data: CopaBracketCreate, admin: User = Depends(get_admin_user)):
    bracket = CopaBracket(
        round_type=bracket_data.round_type,
        match_position=bracket_data.match_position,
        home_team_id=bracket_data.home_team_id,
        away_team_id=bracket_data.away_team_id,
        match_date=datetime.fromisoformat(bracket_data.match_date) if bracket_data.match_date else None
    )
    doc = bracket.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc.get('match_date'):
        doc['match_date'] = doc['match_date'].isoformat()
    await db.copa_brackets.insert_one(doc)
    return bracket

@api_router.put("/copa/brackets/{bracket_id}")
async def update_copa_bracket(bracket_id: str, update_data: CopaBracketUpdate, admin: User = Depends(get_admin_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if 'match_date' in update_dict and update_dict['match_date']:
        update_dict['match_date'] = datetime.fromisoformat(update_dict['match_date']).isoformat()
    
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.copa_brackets.update_one({"id": bracket_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Bracket not found")
    return {"message": "Bracket updated successfully"}

@api_router.delete("/copa/brackets/{bracket_id}")
async def delete_copa_bracket(bracket_id: str, admin: User = Depends(get_admin_user)):
    result = await db.copa_brackets.delete_one({"id": bracket_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bracket not found")
    return {"message": "Bracket deleted successfully"}

# Copa Bracket - Add/Remove Scorers and Cards
@api_router.post("/copa/brackets/{bracket_id}/scorers")
async def add_copa_bracket_goal_scorer(bracket_id: str, scorer_data: AddGoalScorer, admin: User = Depends(get_admin_user)):
    bracket = await db.copa_brackets.find_one({"id": bracket_id})
    if not bracket:
        raise HTTPException(status_code=404, detail="Bracket match not found")
    
    player = await db.players.find_one({"id": scorer_data.player_id})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    goal = GoalScorer(player_id=scorer_data.player_id, player_name=player['name'], minute=scorer_data.minute)
    
    if scorer_data.team_side == "home":
        await db.copa_brackets.update_one({"id": bracket_id}, {"$push": {"home_scorers": goal.model_dump()}})
    else:
        await db.copa_brackets.update_one({"id": bracket_id}, {"$push": {"away_scorers": goal.model_dump()}})
    
    await db.players.update_one({"id": scorer_data.player_id}, {"$inc": {"goals_scored": 1}})
    
    return {"message": "Goal scorer added successfully"}

@api_router.post("/copa/brackets/{bracket_id}/cards")
async def add_copa_bracket_card(bracket_id: str, card_data: AddCard, admin: User = Depends(get_admin_user)):
    bracket = await db.copa_brackets.find_one({"id": bracket_id})
    if not bracket:
        raise HTTPException(status_code=404, detail="Bracket match not found")
    
    player = await db.players.find_one({"id": card_data.player_id})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    card = Card(player_id=card_data.player_id, player_name=player['name'], card_type=card_data.card_type, minute=card_data.minute)
    
    if card_data.team_side == "home":
        await db.copa_brackets.update_one({"id": bracket_id}, {"$push": {"home_cards": card.model_dump()}})
    else:
        await db.copa_brackets.update_one({"id": bracket_id}, {"$push": {"away_cards": card.model_dump()}})
    
    if card_data.card_type == "yellow":
        await db.players.update_one({"id": card_data.player_id}, {"$inc": {"yellow_cards": 1}})
    else:
        await db.players.update_one({"id": card_data.player_id}, {"$inc": {"red_cards": 1}})
    
    return {"message": "Card added successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()