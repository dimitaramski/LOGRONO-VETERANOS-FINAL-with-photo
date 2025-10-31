import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../App";
import { toast } from "sonner";
import SharedNavigation from "../components/SharedNavigation";
import { useTranslation } from "react-i18next";

const StandingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [division, setDivision] = useState(() => {
    const divParam = searchParams.get('division');
    return divParam ? parseInt(divParam) : 1;
  });
  const [standings, setStandings] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandings();
  }, [division]);

  useEffect(() => {
    const divParam = searchParams.get('division');
    if (divParam) {
      setDivision(parseInt(divParam));
    }
  }, [searchParams]);

  const fetchStandings = async () => {
    setLoading(true);
    try {
      const [standingsRes, teamsRes] = await Promise.all([
        api.get(`/standings/division/${division}`),
        api.get("/teams"),
      ]);
      setStandings(standingsRes.data);
      
      const teamsMap = {};
      teamsRes.data.forEach((team) => {
        teamsMap[team.id] = team;
      });
      setTeams(teamsMap);
    } catch (error) {
      toast.error("Failed to load standings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f10] to-[#1a1a1b]">
      <SharedNavigation currentPage="standings" />

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-center">
            <span className="text-gradient">{t('standings')}</span>
          </h2>

          <Tabs value={division.toString()} onValueChange={(v) => {
            const newDiv = parseInt(v);
            setDivision(newDiv);
            setSearchParams({ division: v });
          }} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-[#1a1a1b] border border-[#f4c542]/20">
              <TabsTrigger value="1" className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]" data-testid="division-1-tab">
                {t('firstDivision')}
              </TabsTrigger>
              <TabsTrigger value="2" className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]" data-testid="division-2-tab">
                {t('secondDivision')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="text-center text-[#f4c542] text-xl">Loading standings...</div>
          ) : (
            <Card className="glass-card border-[#f4c542]/20">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="standings-table">
                    <thead>
                      <tr className="table-header">
                        <th className="p-4 text-left">Pos</th>
                        <th className="p-4 text-left">Team</th>
                        <th className="p-4 text-center">GP</th>
                        <th className="p-4 text-center">W</th>
                        <th className="p-4 text-center">D</th>
                        <th className="p-4 text-center">L</th>
                        <th className="p-4 text-center">GF</th>
                        <th className="p-4 text-center">GA</th>
                        <th className="p-4 text-center">GD</th>
                        <th className="p-4 text-center">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="p-8 text-center text-[#b5b5b5]" data-testid="no-standings-message">
                            No standings data available yet
                          </td>
                        </tr>
                      ) : (
                        standings.map((row) => (
                          <tr key={row.team_id} className="table-row" data-testid={`team-row-${row.team_id}`}>
                            <td className="p-4 font-bold text-[#f4c542]" data-testid={`pos-${row.team_id}`}>{row.position}</td>
                            <td className="p-4 text-[#e5e5e5] font-semibold" data-testid={`name-${row.team_id}`}>
                              <div className="flex items-center gap-3">
                                {teams[row.team_id]?.logo_url && (
                                  <img 
                                    src={teams[row.team_id].logo_url} 
                                    alt={`${row.team_name} logo`}
                                    className="w-8 h-8 rounded-full object-cover"
                                    data-testid={`logo-${row.team_id}`}
                                  />
                                )}
                                <span>{row.team_name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center text-[#b5b5b5]" data-testid={`gp-${row.team_id}`}>{row.games_played}</td>
                            <td className="p-4 text-center text-[#b5b5b5]" data-testid={`w-${row.team_id}`}>{row.games_won}</td>
                            <td className="p-4 text-center text-[#b5b5b5]" data-testid={`d-${row.team_id}`}>{row.games_draw}</td>
                            <td className="p-4 text-center text-[#b5b5b5]" data-testid={`l-${row.team_id}`}>{row.games_lost}</td>
                            <td className="p-4 text-center text-[#b5b5b5]" data-testid={`gf-${row.team_id}`}>{row.goals_for}</td>
                            <td className="p-4 text-center text-[#b5b5b5]" data-testid={`ga-${row.team_id}`}>{row.goals_against}</td>
                            <td className="p-4 text-center font-semibold" data-testid={`gd-${row.team_id}`}>
                              <span className={row.goal_difference > 0 ? "text-green-500" : row.goal_difference < 0 ? "text-red-500" : "text-[#b5b5b5]"}>
                                {row.goal_difference > 0 ? "+" : ""}{row.goal_difference}
                              </span>
                            </td>
                            <td className="p-4 text-center font-bold text-[#f4c542]" data-testid={`pts-${row.team_id}`}>{row.points}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StandingsPage;