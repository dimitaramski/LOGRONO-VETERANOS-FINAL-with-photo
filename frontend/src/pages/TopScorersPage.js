import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../App";
import { toast } from "sonner";

const TopScorersPage = () => {
  const navigate = useNavigate();
  const [topScorers, setTopScorers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopScorers();
  }, []);

  const fetchTopScorers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/top-scorers");
      setTopScorers(response.data);
    } catch (error) {
      toast.error("Failed to load top scorers");
    } finally {
      setLoading(false);
    }
  };

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
              className="text-[#e5e5e5] hover:text-[#f4c542]"
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
              className="text-[#f4c542] hover:text-[#ffd700]"
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
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-center">
            <span className="text-gradient">Top Scorers</span>
          </h2>

          {loading ? (
            <div className="text-center text-[#f4c542] text-xl">Loading top scorers...</div>
          ) : (
            <Card className="glass-card border-[#f4c542]/20">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="top-scorers-table">
                    <thead>
                      <tr className="table-header">
                        <th className="p-4 text-left">Rank</th>
                        <th className="p-4 text-left">Player</th>
                        <th className="p-4 text-left">Team</th>
                        <th className="p-4 text-center">Goals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topScorers.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-[#b5b5b5]" data-testid="no-scorers-message">
                            No goals scored yet this season
                          </td>
                        </tr>
                      ) : (
                        topScorers.map((scorer, index) => (
                          <tr key={scorer.player_id} className="table-row" data-testid={`scorer-row-${scorer.player_id}`}>
                            <td className="p-4" data-testid={`rank-${scorer.player_id}`}>
                              {index === 0 && (
                                <span className="text-3xl" data-testid="gold-trophy">🥇</span>
                              )}
                              {index === 1 && (
                                <span className="text-3xl" data-testid="silver-trophy">🥈</span>
                              )}
                              {index === 2 && (
                                <span className="text-3xl" data-testid="bronze-trophy">🥉</span>
                              )}
                              {index > 2 && (
                                <span className="text-[#f4c542] font-bold">{index + 1}</span>
                              )}
                            </td>
                            <td className="p-4 text-[#e5e5e5] font-semibold" data-testid={`player-name-${scorer.player_id}`}>
                              {scorer.player_name}
                            </td>
                            <td className="p-4 text-[#b5b5b5]" data-testid={`team-name-${scorer.player_id}`}>
                              {scorer.team_name}
                            </td>
                            <td className="p-4 text-center" data-testid={`goals-${scorer.player_id}`}>
                              <span className="text-2xl font-bold text-[#f4c542]">{scorer.goals}</span>
                            </td>
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

export default TopScorersPage;