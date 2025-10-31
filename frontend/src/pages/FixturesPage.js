import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../App";
import { toast } from "sonner";
import SharedNavigation from "../components/SharedNavigation";
import { useTranslation } from "react-i18next";

const FixturesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [division, setDivision] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [fixtures, setFixtures] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, [division]);

  useEffect(() => {
    // Update time every minute for live matches
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

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

  const getMatchMinute = (matchDate) => {
    const match = new Date(matchDate);
    const now = currentTime;
    const diffMs = now - match;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) return null; // Not started yet
    if (diffMins <= 45) return diffMins; // First half
    if (diffMins <= 60) return "HT"; // Halftime (45-60 mins)
    if (diffMins <= 105) return diffMins - 15; // Second half (subtract halftime)
    return "FT"; // Full time
  };

  const getMatchStatus = (fixture) => {
    if (fixture.status === "completed") return "FT";
    const minute = getMatchMinute(fixture.match_date);
    if (minute === null) return "scheduled";
    if (minute === "HT") return "HT";
    if (minute === "FT") return "FT";
    return `${minute}'`;
  };

  const isMatchLive = (fixture) => {
    if (fixture.status === "completed") return false;
    const minute = getMatchMinute(fixture.match_date);
    return minute !== null && minute !== "FT";
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

  const getAllWeeks = () => {
    // Return all 22 weeks (11 first half + 11 second half)
    return Array.from({ length: 22 }, (_, i) => i + 1);
  };

  const getAvailableWeeks = () => {
    return getAllWeeks();
  };

  const getFilteredWeeks = () => {
    const fixturesGrouped = groupByWeek();
    const allWeeks = getAllWeeks();
    
    if (selectedWeek === "all") {
      // Show all weeks, including empty ones
      const result = {};
      allWeeks.forEach(week => {
        result[week] = fixturesGrouped[week] || [];
      });
      return result;
    }
    
    // Single week selected
    return { [selectedWeek]: fixturesGrouped[selectedWeek] || [] };
  };

  const weeks = getFilteredWeeks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f10] to-[#1a1a1b]">
      <SharedNavigation currentPage="fixtures" />

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-center">
            <span className="text-gradient">{t('fixtures')}</span>
          </h2>

          <Tabs value={division.toString()} onValueChange={(v) => setDivision(parseInt(v))} className="mb-4">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-[#1a1a1b] border border-[#f4c542]/20">
              <TabsTrigger value="1" className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]" data-testid="division-1-tab">
                {t('firstDivision')}
              </TabsTrigger>
              <TabsTrigger value="2" className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]" data-testid="division-2-tab">
                {t('secondDivision')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Week Filter */}
          <div className="mb-8 max-w-md mx-auto">
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="input-field" data-testid="week-filter-select">
                <SelectValue placeholder={t('filterByWeek', 'Filtrar por jornada')} />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                <SelectItem value="all" data-testid="week-all-option">{t('allWeeks', 'Todas las jornadas')}</SelectItem>
                {getAvailableWeeks().map((week) => (
                  <SelectItem key={week} value={week} data-testid={`week-${week}-option`}>
                    {t('week', 'Jornada')} {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center text-[#f4c542] text-xl">{t('loadingFixtures', 'Cargando partidos...')}</div>
          ) : Object.keys(weeks).length === 0 ? (
            <div className="text-center text-[#b5b5b5] text-xl" data-testid="no-fixtures-message">{t('noFixtures', 'No hay partidos programados')}</div>
          ) : (
            <div className="space-y-8">
              {Object.keys(weeks)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((weekNum) => (
                  <Card key={weekNum} className="glass-card border-[#f4c542]/20" data-testid={`week-${weekNum}-card`}>
                    <CardHeader>
                      <CardTitle className="text-2xl text-[#f4c542] flex items-center gap-2">
                        Week {weekNum}
                        {parseInt(weekNum) <= 11 && (
                          <span className="text-sm text-[#b5b5b5] font-normal">(First Half)</span>
                        )}
                        {parseInt(weekNum) > 11 && (
                          <span className="text-sm text-[#b5b5b5] font-normal">(Second Half)</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {weeks[weekNum].length === 0 ? (
                        <div className="text-center py-8 text-[#b5b5b5]" data-testid={`no-matches-week-${weekNum}`}>
                          <p className="text-lg mb-2">📅 No matches scheduled yet</p>
                          <p className="text-sm">Check back later for fixture updates</p>
                        </div>
                      ) : (
                      <div className="space-y-4">
                        {weeks[weekNum].map((fixture) => {
                          const status = getMatchStatus(fixture);
                          const live = isMatchLive(fixture);
                          
                          return (
                          <div
                            key={fixture.id}
                            className="flex items-center justify-between p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10 hover:border-[#f4c542]/30 cursor-pointer transition-all"
                            onClick={() => {
                              setSelectedFixture(fixture);
                              setShowMatchDetails(true);
                            }}
                            data-testid={`fixture-${fixture.id}`}
                          >
                            <div className="flex-1 flex items-center justify-end gap-3">
                              <p className="text-[#e5e5e5] font-semibold" data-testid={`home-team-${fixture.id}`}>
                                {teams[fixture.home_team_id]?.name || "Unknown"}
                              </p>
                              {teams[fixture.home_team_id]?.logo_url && (
                                <img 
                                  src={teams[fixture.home_team_id].logo_url} 
                                  alt={`${teams[fixture.home_team_id].name} logo`}
                                  className="w-10 h-10 rounded-full object-cover"
                                  data-testid={`home-logo-${fixture.id}`}
                                />
                              )}
                            </div>
                            
                            <div className="px-8 text-center min-w-[120px]">
                              {live && (
                                <div className="text-xs text-red-500 font-bold mb-1 animate-pulse" data-testid={`live-${fixture.id}`}>
                                  ● LIVE {status}
                                </div>
                              )}
                              {fixture.status === "completed" || status === "FT" ? (
                                <div className="text-2xl font-bold text-[#f4c542]" data-testid={`score-${fixture.id}`}>
                                  {fixture.home_score || 0} - {fixture.away_score || 0}
                                </div>
                              ) : status === "HT" ? (
                                <div>
                                  <div className="text-xl font-bold text-orange-400" data-testid={`halftime-${fixture.id}`}>HT</div>
                                  <div className="text-sm text-[#b5b5b5]">{fixture.home_score || 0} - {fixture.away_score || 0}</div>
                                </div>
                              ) : status === "scheduled" ? (
                                <div className="text-[#b5b5b5]" data-testid={`vs-${fixture.id}`}>VS</div>
                              ) : (
                                <div>
                                  <div className="text-xl font-bold text-green-400" data-testid={`minute-${fixture.id}`}>{status}</div>
                                  <div className="text-sm text-[#b5b5b5]">{fixture.home_score || 0} - {fixture.away_score || 0}</div>
                                </div>
                              )}
                              <p className="text-xs text-[#b5b5b5] mt-1" data-testid={`date-${fixture.id}`}>
                                {new Date(fixture.match_date).toLocaleString()}
                              </p>
                            </div>
                            
                            <div className="flex-1 flex items-center gap-3">
                              {teams[fixture.away_team_id]?.logo_url && (
                                <img 
                                  src={teams[fixture.away_team_id].logo_url} 
                                  alt={`${teams[fixture.away_team_id].name} logo`}
                                  className="w-10 h-10 rounded-full object-cover"
                                  data-testid={`away-logo-${fixture.id}`}
                                />
                              )}
                              <p className="text-[#e5e5e5] font-semibold" data-testid={`away-team-${fixture.id}`}>
                                {teams[fixture.away_team_id]?.name || "Unknown"}
                              </p>
                            </div>
                          </div>
                        );
                        })}
                      </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Match Details Modal */}
      <Dialog open={showMatchDetails} onOpenChange={setShowMatchDetails}>
        <DialogContent className="bg-[#1a1a1b] border border-[#f4c542]/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#f4c542]">
              Match Details
            </DialogTitle>
          </DialogHeader>
          {selectedFixture && (
            <div className="space-y-6">
              {/* Match Header */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-8 mb-4">
                  <div className="text-center">
                    {teams[selectedFixture.home_team_id]?.logo_url && (
                      <img 
                        src={teams[selectedFixture.home_team_id].logo_url} 
                        alt="Home team"
                        className="w-16 h-16 mx-auto rounded-full object-cover mb-2"
                      />
                    )}
                    <p className="text-[#e5e5e5] font-bold">{teams[selectedFixture.home_team_id]?.name}</p>
                  </div>
                  
                  <div className="text-center">
                    {isMatchLive(selectedFixture) && (
                      <div className="text-sm text-red-500 font-bold mb-2 animate-pulse">
                        ● LIVE {getMatchStatus(selectedFixture)}
                      </div>
                    )}
                    <div className="text-4xl font-bold text-[#f4c542]">
                      {selectedFixture.home_score || 0} - {selectedFixture.away_score || 0}
                    </div>
                    {getMatchStatus(selectedFixture) === "HT" && (
                      <div className="text-orange-400 font-bold mt-1">Half Time</div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    {teams[selectedFixture.away_team_id]?.logo_url && (
                      <img 
                        src={teams[selectedFixture.away_team_id].logo_url} 
                        alt="Away team"
                        className="w-16 h-16 mx-auto rounded-full object-cover mb-2"
                      />
                    )}
                    <p className="text-[#e5e5e5] font-bold">{teams[selectedFixture.away_team_id]?.name}</p>
                  </div>
                </div>
                <p className="text-sm text-[#b5b5b5]">
                  {new Date(selectedFixture.match_date).toLocaleString()}
                </p>
              </div>

              {/* Goal Scorers */}
              {(selectedFixture.home_scorers?.length > 0 || selectedFixture.away_scorers?.length > 0) && (
                <div className="border-t border-[#f4c542]/20 pt-4">
                  <h3 className="text-lg font-bold text-[#f4c542] mb-3">⚽ Goal Scorers</h3>
                  <div className="space-y-2">
                    {selectedFixture.home_scorers?.map((scorer, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[#e5e5e5]">
                        <span>{scorer.player_name}</span>
                        <span className="text-[#f4c542]">{scorer.minute}'</span>
                      </div>
                    ))}
                    {selectedFixture.away_scorers?.map((scorer, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[#e5e5e5]">
                        <span>{scorer.player_name}</span>
                        <span className="text-[#f4c542]">{scorer.minute}'</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cards */}
              {(selectedFixture.home_cards?.length > 0 || selectedFixture.away_cards?.length > 0) && (
                <div className="border-t border-[#f4c542]/20 pt-4">
                  <h3 className="text-lg font-bold text-[#f4c542] mb-3">Cards</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#b5b5b5] mb-2">{teams[selectedFixture.home_team_id]?.name}</p>
                      {selectedFixture.home_cards?.map((card, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[#e5e5e5] mb-1">
                          <span>
                            {card.card_type === "yellow" ? "🟨" : "🟥"} {card.player_name}
                          </span>
                          <span className="text-[#f4c542]">{card.minute}'</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm text-[#b5b5b5] mb-2">{teams[selectedFixture.away_team_id]?.name}</p>
                      {selectedFixture.away_cards?.map((card, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[#e5e5e5] mb-1">
                          <span>
                            {card.card_type === "yellow" ? "🟨" : "🟥"} {card.player_name}
                          </span>
                          <span className="text-[#f4c542]">{card.minute}'</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No events message */}
              {!selectedFixture.home_scorers?.length && 
               !selectedFixture.away_scorers?.length && 
               !selectedFixture.home_cards?.length && 
               !selectedFixture.away_cards?.length && (
                <div className="text-center text-[#b5b5b5] py-8">
                  No match events recorded yet
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FixturesPage;