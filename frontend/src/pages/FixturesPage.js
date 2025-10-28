import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../App";
import { toast } from "sonner";

const FixturesPage = () => {
  const navigate = useNavigate();
  const [division, setDivision] = useState(1);
  const [fixtures, setFixtures] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [division]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fixturesRes, teamsRes] = await Promise.all([
        api.get(`/fixtures/division/${division}`),
        api.get("/teams"),
      ]);

      setFixtures(fixturesRes.data);
      
      const teamsMap = {};
      teamsRes.data.forEach((team) => {
        teamsMap[team.id] = team;
      });
      setTeams(teamsMap);
    } catch (error) {
      toast.error("Failed to load fixtures");
    } finally {
      setLoading(false);
    }
  };

  const groupByWeek = () => {
    const grouped = {};
    fixtures.forEach((fixture) => {
      if (!grouped[fixture.week_number]) {
        grouped[fixture.week_number] = [];
      }
      grouped[fixture.week_number].push(fixture);
    });
    return grouped;
  };

  const weeks = groupByWeek();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f10] to-[#1a1a1b]">
      {/* Navigation */}
      <nav className="navbar fixed w-full top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1
            className="text-2xl font-bold text-gradient cursor-pointer"
            onClick={() => navigate("/")}
            data-testid="logo-home-link"
          >
            Liga Veteranos Logroño
          </h1>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              className="text-[#f4c542] hover:text-[#ffd700]"
              onClick={() => navigate("/fixtures")}
              data-testid="nav-fixtures-btn"
            >
              Fixtures
            </Button>
            <Button
              variant="ghost"
              className="text-[#e5e5e5] hover:text-[#f4c542]"
              onClick={() => navigate("/standings")}
              data-testid="nav-standings-btn"
            >
              Standings
            </Button>
            <Button
              variant="ghost"
              className="text-[#e5e5e5] hover:text-[#f4c542]"
              onClick={() => navigate("/top-scorers")}
              data-testid="nav-top-scorers-btn"
            >
              Top Scorers
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-center">
            <span className="text-gradient">Fixtures</span>
          </h2>

          <Tabs value={division.toString()} onValueChange={(v) => setDivision(parseInt(v))} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-[#1a1a1b] border border-[#f4c542]/20">
              <TabsTrigger value="1" className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]" data-testid="division-1-tab">
                1st Division
              </TabsTrigger>
              <TabsTrigger value="2" className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]" data-testid="division-2-tab">
                2nd Division
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="text-center text-[#f4c542] text-xl">Loading fixtures...</div>
          ) : Object.keys(weeks).length === 0 ? (
            <div className="text-center text-[#b5b5b5] text-xl" data-testid="no-fixtures-message">No fixtures scheduled yet</div>
          ) : (
            <div className="space-y-8">
              {Object.keys(weeks)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((weekNum) => (
                  <Card key={weekNum} className="glass-card border-[#f4c542]/20" data-testid={`week-${weekNum}-card`}>
                    <CardHeader>
                      <CardTitle className="text-2xl text-[#f4c542]">
                        Week {weekNum}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {weeks[weekNum].map((fixture) => (
                          <div
                            key={fixture.id}
                            className="flex items-center justify-between p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                            data-testid={`fixture-${fixture.id}`}
                          >
                            <div className="flex-1 text-right">
                              <p className="text-[#e5e5e5] font-semibold" data-testid={`home-team-${fixture.id}`}>
                                {teams[fixture.home_team_id]?.name || "Unknown"}
                              </p>
                            </div>
                            <div className="px-8 text-center">
                              {fixture.status === "completed" ? (
                                <div className="text-2xl font-bold text-[#f4c542]" data-testid={`score-${fixture.id}`}>
                                  {fixture.home_score} - {fixture.away_score}
                                </div>
                              ) : (
                                <div className="text-[#b5b5b5]" data-testid={`vs-${fixture.id}`}>VS</div>
                              )}
                              <p className="text-xs text-[#b5b5b5] mt-1" data-testid={`date-${fixture.id}`}>
                                {new Date(fixture.match_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex-1">
                              <p className="text-[#e5e5e5] font-semibold" data-testid={`away-team-${fixture.id}`}>
                                {teams[fixture.away_team_id]?.name || "Unknown"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixturesPage;