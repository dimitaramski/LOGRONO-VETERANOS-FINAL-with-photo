#!/usr/bin/env python3
"""
Backend API Testing for Liga Veteranos Logroño
Tests database population and API endpoints functionality
"""

import requests
import json
from typing import Dict, List, Any

# Backend URL from frontend environment
BACKEND_URL = "https://veteran-league.preview.emergentagent.com/api"

class LigaVeteranosAPITester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.test_results = []
        
    def log_test(self, test_name: str, passed: bool, message: str, data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "passed": passed,
            "message": message,
            "data": data
        }
        self.test_results.append(result)
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        
    def test_api_connection(self):
        """Test basic API connectivity"""
        try:
            response = requests.get(f"{self.backend_url}/", timeout=10)
            if response.status_code == 200:
                self.log_test("API Connection", True, "Backend API is accessible")
                return True
            else:
                self.log_test("API Connection", False, f"API returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Connection", False, f"Failed to connect to API: {str(e)}")
            return False
    
    def test_teams_endpoint(self):
        """Test GET /api/teams endpoint and verify team data"""
        try:
            response = requests.get(f"{self.backend_url}/teams", timeout=10)
            
            if response.status_code != 200:
                self.log_test("Teams Endpoint", False, f"API returned status {response.status_code}")
                return False
                
            teams = response.json()
            
            # Check total number of teams
            if len(teams) != 24:
                self.log_test("Teams Count", False, f"Expected 24 teams, found {len(teams)}")
                return False
            
            # Count teams by division
            division_1_teams = [t for t in teams if t.get('division') == 1]
            division_2_teams = [t for t in teams if t.get('division') == 2]
            
            if len(division_1_teams) != 12:
                self.log_test("Division 1 Teams", False, f"Expected 12 Division 1 teams, found {len(division_1_teams)}")
                return False
                
            if len(division_2_teams) != 12:
                self.log_test("Division 2 Teams", False, f"Expected 12 Division 2 teams, found {len(division_2_teams)}")
                return False
            
            # Check for specific Division 1 teams mentioned in requirements
            div1_team_names = [t['name'] for t in division_1_teams]
            expected_div1_teams = ["V.L. PLAK LA MULA", "S.D. COSMOS", "YAGÜE CUATRO CANTONES", "BAR SORIA"]
            
            missing_div1 = [team for team in expected_div1_teams if team not in div1_team_names]
            if missing_div1:
                self.log_test("Division 1 Expected Teams", False, f"Missing expected teams: {missing_div1}")
                return False
            
            # Check for specific Division 2 teams mentioned in requirements  
            div2_team_names = [t['name'] for t in division_2_teams]
            expected_div2_teams = ["BAR CAFÉ BALA", "C.F. ECUADOR", "BRISK IMPORT IBERICA"]
            
            missing_div2 = [team for team in expected_div2_teams if team not in div2_team_names]
            if missing_div2:
                self.log_test("Division 2 Expected Teams", False, f"Missing expected teams: {missing_div2}")
                return False
            
            self.log_test("Teams Endpoint", True, f"All 24 teams found with correct divisions and expected team names")
            return True
            
        except Exception as e:
            self.log_test("Teams Endpoint", False, f"Error testing teams endpoint: {str(e)}")
            return False
    
    def test_standings_division_1(self):
        """Test GET /api/standings/division/1 endpoint"""
        try:
            response = requests.get(f"{self.backend_url}/standings/division/1", timeout=10)
            
            if response.status_code != 200:
                self.log_test("Division 1 Standings", False, f"API returned status {response.status_code}")
                return False
                
            standings = response.json()
            
            if not standings:
                self.log_test("Division 1 Standings", False, "No standings data returned")
                return False
            
            # Check if top 2 teams are as expected
            if len(standings) >= 2:
                top_team = standings[0]
                second_team = standings[1]
                
                # Check if top teams have expected names and points
                expected_top_teams = ["V.L. PLAK LA MULA", "S.D. COSMOS"]
                
                if top_team['team_name'] in expected_top_teams and top_team['points'] == 12:
                    if second_team['team_name'] in expected_top_teams and second_team['points'] == 12:
                        self.log_test("Division 1 Standings", True, f"Top teams correct: {top_team['team_name']} and {second_team['team_name']} both with 12 points")
                        return True
                
                self.log_test("Division 1 Standings", False, f"Top teams don't match expected: {top_team['team_name']} ({top_team['points']} pts), {second_team['team_name']} ({second_team['points']} pts)")
                return False
            else:
                self.log_test("Division 1 Standings", False, f"Not enough teams in standings: {len(standings)}")
                return False
                
        except Exception as e:
            self.log_test("Division 1 Standings", False, f"Error testing Division 1 standings: {str(e)}")
            return False
    
    def test_standings_division_2(self):
        """Test GET /api/standings/division/2 endpoint"""
        try:
            response = requests.get(f"{self.backend_url}/standings/division/2", timeout=10)
            
            if response.status_code != 200:
                self.log_test("Division 2 Standings", False, f"API returned status {response.status_code}")
                return False
                
            standings = response.json()
            
            if not standings:
                self.log_test("Division 2 Standings", False, "No standings data returned")
                return False
            
            # Check if top team is as expected
            if len(standings) >= 1:
                top_team = standings[0]
                
                if top_team['team_name'] == "BAR CAFÉ BALA" and top_team['points'] == 10:
                    # Check second place teams have 9 points
                    second_place_points = []
                    for team in standings[1:]:
                        if team['points'] == 9:
                            second_place_points.append(team['team_name'])
                    
                    if second_place_points:
                        self.log_test("Division 2 Standings", True, f"Top team correct: {top_team['team_name']} (10 pts), second place teams with 9 pts: {second_place_points}")
                        return True
                    else:
                        self.log_test("Division 2 Standings", False, "No second place teams with 9 points found")
                        return False
                else:
                    self.log_test("Division 2 Standings", False, f"Top team incorrect: {top_team['team_name']} ({top_team['points']} pts), expected BAR CAFÉ BALA (10 pts)")
                    return False
            else:
                self.log_test("Division 2 Standings", False, f"Not enough teams in standings: {len(standings)}")
                return False
                
        except Exception as e:
            self.log_test("Division 2 Standings", False, f"Error testing Division 2 standings: {str(e)}")
            return False
    
    def test_fixtures_division_1(self):
        """Test GET /api/fixtures/division/1 endpoint"""
        try:
            response = requests.get(f"{self.backend_url}/fixtures/division/1", timeout=10)
            
            if response.status_code != 200:
                self.log_test("Division 1 Fixtures", False, f"API returned status {response.status_code}")
                return False
                
            fixtures = response.json()
            
            if not fixtures:
                self.log_test("Division 1 Fixtures", False, "No fixtures data returned")
                return False
            
            # Group fixtures by week number (Jornada)
            jornadas = {}
            for fixture in fixtures:
                week = fixture.get('week_number')
                if week not in jornadas:
                    jornadas[week] = []
                jornadas[week].append(fixture)
            
            # Check if we have fixtures for Jornadas 1-11
            expected_jornadas = list(range(1, 12))  # 1 to 11
            actual_jornadas = sorted(jornadas.keys())
            
            if not all(j in actual_jornadas for j in expected_jornadas):
                missing_jornadas = [j for j in expected_jornadas if j not in actual_jornadas]
                self.log_test("Division 1 Fixtures", False, f"Missing Jornadas: {missing_jornadas}")
                return False
            
            # Check completed fixtures (Jornadas 1-4) have scores
            completed_jornadas = [1, 2, 3, 4]
            incomplete_completed = []
            
            for jornada in completed_jornadas:
                if jornada in jornadas:
                    for fixture in jornadas[jornada]:
                        if fixture.get('home_score') is None or fixture.get('away_score') is None:
                            incomplete_completed.append(f"Jornada {jornada}")
                            break
            
            if incomplete_completed:
                self.log_test("Division 1 Fixtures", False, f"Completed jornadas missing scores: {incomplete_completed}")
                return False
            
            # Check future fixtures (Jornadas 5-11) don't have scores yet
            future_jornadas = list(range(5, 12))
            completed_future = []
            
            for jornada in future_jornadas:
                if jornada in jornadas:
                    for fixture in jornadas[jornada]:
                        if fixture.get('home_score') is not None and fixture.get('away_score') is not None:
                            completed_future.append(f"Jornada {jornada}")
                            break
            
            if completed_future:
                self.log_test("Division 1 Fixtures", False, f"Future jornadas unexpectedly have scores: {completed_future}")
                return False
            
            self.log_test("Division 1 Fixtures", True, f"Fixtures correct: Jornadas 1-11 exist, 1-4 have scores, 5-11 are scheduled")
            return True
            
        except Exception as e:
            self.log_test("Division 1 Fixtures", False, f"Error testing Division 1 fixtures: {str(e)}")
            return False
    
    def test_fixtures_division_2(self):
        """Test GET /api/fixtures/division/2 endpoint"""
        try:
            response = requests.get(f"{self.backend_url}/fixtures/division/2", timeout=10)
            
            if response.status_code != 200:
                self.log_test("Division 2 Fixtures", False, f"API returned status {response.status_code}")
                return False
                
            fixtures = response.json()
            
            if not fixtures:
                self.log_test("Division 2 Fixtures", False, "No fixtures data returned")
                return False
            
            # Group fixtures by week number (Jornada)
            jornadas = {}
            for fixture in fixtures:
                week = fixture.get('week_number')
                if week not in jornadas:
                    jornadas[week] = []
                jornadas[week].append(fixture)
            
            # Check if we have fixtures for Jornadas 1-6
            expected_jornadas = list(range(1, 7))  # 1 to 6
            actual_jornadas = sorted(jornadas.keys())
            
            if not all(j in actual_jornadas for j in expected_jornadas):
                missing_jornadas = [j for j in expected_jornadas if j not in actual_jornadas]
                self.log_test("Division 2 Fixtures", False, f"Missing Jornadas: {missing_jornadas}")
                return False
            
            # Check that completed fixtures have scores
            completed_fixtures = 0
            total_fixtures = len(fixtures)
            
            for fixture in fixtures:
                if fixture.get('home_score') is not None and fixture.get('away_score') is not None:
                    completed_fixtures += 1
            
            if completed_fixtures == 0:
                self.log_test("Division 2 Fixtures", False, "No completed fixtures found with scores")
                return False
            
            self.log_test("Division 2 Fixtures", True, f"Fixtures correct: Jornadas 1-6 exist, {completed_fixtures}/{total_fixtures} fixtures have scores")
            return True
            
        except Exception as e:
            self.log_test("Division 2 Fixtures", False, f"Error testing Division 2 fixtures: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 60)
        print("LIGA VETERANOS LOGROÑO - BACKEND API TESTING")
        print("=" * 60)
        print(f"Testing backend URL: {self.backend_url}")
        print()
        
        # Test API connection first
        if not self.test_api_connection():
            print("\n❌ Cannot connect to backend API. Stopping tests.")
            return False
        
        print()
        
        # Run all endpoint tests
        tests = [
            self.test_teams_endpoint,
            self.test_standings_division_1,
            self.test_standings_division_2,
            self.test_fixtures_division_1,
            self.test_fixtures_division_2
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test in tests:
            if test():
                passed_tests += 1
            print()
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Tests Passed: {passed_tests}/{total_tests}")
        
        if passed_tests == total_tests:
            print("🎉 ALL TESTS PASSED - Database is correctly populated!")
        else:
            print("⚠️  SOME TESTS FAILED - Database may need population or fixes")
            
        print()
        print("DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result['passed'] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        return passed_tests == total_tests

if __name__ == "__main__":
    tester = LigaVeteranosAPITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)