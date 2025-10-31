#!/usr/bin/env python3
"""
Debug script to see what's currently in the database
"""

import requests
import json

BACKEND_URL = "https://veteran-league.preview.emergentagent.com/api"

def debug_teams():
    """Check what teams are currently in the database"""
    print("=" * 50)
    print("CURRENT TEAMS IN DATABASE")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BACKEND_URL}/teams", timeout=10)
        if response.status_code == 200:
            teams = response.json()
            print(f"Total teams: {len(teams)}")
            
            div1_teams = [t for t in teams if t.get('division') == 1]
            div2_teams = [t for t in teams if t.get('division') == 2]
            
            print(f"\nDivision 1 teams ({len(div1_teams)}):")
            for team in div1_teams:
                print(f"  - {team['name']}")
            
            print(f"\nDivision 2 teams ({len(div2_teams)}):")
            for team in div2_teams:
                print(f"  - {team['name']}")
        else:
            print(f"Error: API returned status {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

def debug_standings():
    """Check current standings"""
    print("\n" + "=" * 50)
    print("CURRENT STANDINGS")
    print("=" * 50)
    
    for division in [1, 2]:
        print(f"\nDivision {division} Standings:")
        try:
            response = requests.get(f"{BACKEND_URL}/standings/division/{division}", timeout=10)
            if response.status_code == 200:
                standings = response.json()
                for i, team in enumerate(standings[:5]):  # Show top 5
                    print(f"  {i+1}. {team['team_name']} - {team['points']} pts (P:{team['games_played']} W:{team['games_won']} D:{team['games_draw']} L:{team['games_lost']} GF:{team['goals_for']} GA:{team['goals_against']})")
            else:
                print(f"  Error: API returned status {response.status_code}")
        except Exception as e:
            print(f"  Error: {e}")

def debug_fixtures():
    """Check current fixtures"""
    print("\n" + "=" * 50)
    print("CURRENT FIXTURES")
    print("=" * 50)
    
    for division in [1, 2]:
        print(f"\nDivision {division} Fixtures:")
        try:
            response = requests.get(f"{BACKEND_URL}/fixtures/division/{division}", timeout=10)
            if response.status_code == 200:
                fixtures = response.json()
                print(f"  Total fixtures: {len(fixtures)}")
                
                # Group by week
                weeks = {}
                for fixture in fixtures:
                    week = fixture.get('week_number')
                    if week not in weeks:
                        weeks[week] = []
                    weeks[week].append(fixture)
                
                print(f"  Weeks with fixtures: {sorted(weeks.keys())}")
                
                # Show completed vs scheduled
                completed = [f for f in fixtures if f.get('home_score') is not None and f.get('away_score') is not None]
                scheduled = [f for f in fixtures if f.get('home_score') is None or f.get('away_score') is None]
                
                print(f"  Completed fixtures: {len(completed)}")
                print(f"  Scheduled fixtures: {len(scheduled)}")
                
                # Show a few examples
                if completed:
                    print("  Example completed fixture:")
                    f = completed[0]
                    print(f"    Week {f['week_number']}: {f.get('home_team_id', 'Unknown')} {f['home_score']}-{f['away_score']} {f.get('away_team_id', 'Unknown')}")
                
            else:
                print(f"  Error: API returned status {response.status_code}")
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    debug_teams()
    debug_standings()
    debug_fixtures()