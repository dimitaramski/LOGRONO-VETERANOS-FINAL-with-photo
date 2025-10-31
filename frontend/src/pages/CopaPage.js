import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../App";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const CopaPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "standings";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedGroup, setSelectedGroup] = useState("A");
  const [selectedJornada, setSelectedJornada] = useState("all");
  const [groups, setGroups] = useState([]);
  const [standings, setStandings] = useState({});
  const [fixtures, setFixtures] = useState([]);
  const [brackets, setBrackets] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedGroup]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupsRes, teamsRes, fixturesRes, bracketsRes] = await Promise.all([
        api.get("/copa/groups"),
        api.get("/teams"),
        api.get("/copa/fixtures"),
        api.get("/copa/brackets"),
      ]);

      setGroups(groupsRes.data);
      setTeams(teamsRes.data);
      setFixtures(fixturesRes.data);
      setBrackets(bracketsRes.data);

      // Fetch standings for all groups
      const standingsData = {};
      for (const group of groupsRes.data) {
        try {
          const standingsRes = await api.get(`/copa/standings/${group.group_name}`);
          standingsData[group.group_name] = standingsRes.data;
        } catch (error) {
          standingsData[group.group_name] = [];
        }
      }
      setStandings(standingsData);
    } catch (error) {
      toast.error("Failed to load Copa data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : "Unknown";
  };

  const getTeamLogo = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    return team?.logo_url;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const filteredFixtures = fixtures.filter((f) => {
    if (selectedGroup !== "all" && f.group_name !== selectedGroup) return false;
    if (selectedJornada !== "all" && f.jornada.toString() !== selectedJornada) return false;
    return true;
  });

  const getBracketMatches = (roundType) => {
    return brackets.filter((b) => b.round_type === roundType).sort((a, b) => a.match_position - b.match_position);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f10] to-[#1a1a1b] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient mb-4">
            {t("copa.title", "Copa del Veteranos")}
          </h1>
          <p className="text-[#b5b5b5] text-lg">
            {t("copa.subtitle", "Tournament competition with teams from both divisions")}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 bg-[#1a1a1b] border border-[#f4c542]/20 mb-8">
            <TabsTrigger
              value="standings"
              className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
            >
              {t("copa.standings", "Standings")}
            </TabsTrigger>
            <TabsTrigger
              value="fixtures"
              className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
            >
              {t("copa.fixtures", "Fixtures")}
            </TabsTrigger>
            <TabsTrigger
              value="brackets"
              className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
            >
              {t("copa.brackets", "Knockout Brackets")}
            </TabsTrigger>
          </TabsList>

          {/* Standings Tab */}
          <TabsContent value="standings">
            <Tabs value={selectedGroup} onValueChange={setSelectedGroup}>
              <TabsList className="grid w-full grid-cols-4 bg-[#1a1a1b] border border-[#f4c542]/20 mb-6">
                <TabsTrigger
                  value="A"
                  className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                >
                  {t("copa.groupA", "Group A")}
                </TabsTrigger>
                <TabsTrigger
                  value="B"
                  className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                >
                  {t("copa.groupB", "Group B")}
                </TabsTrigger>
                <TabsTrigger
                  value="C"
                  className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                >
                  {t("copa.groupC", "Group C")}
                </TabsTrigger>
                <TabsTrigger
                  value="D"
                  className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                >
                  {t("copa.groupD", "Group D")}
                </TabsTrigger>
              </TabsList>

              {["A", "B", "C", "D"].map((group) => (
                <TabsContent key={group} value={group}>
                  <Card className="glass-card border-[#f4c542]/20">
                    <CardHeader>
                      <CardTitle className="text-2xl text-[#f4c542]">
                        {t("copa.groupTitle", { group }, `Group ${group} Standings`)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center text-[#f4c542] py-8">Loading...</div>
                      ) : standings[group] && standings[group].length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[#f4c542]/20">
                                <th className="text-left py-3 px-2 text-[#f4c542] font-semibold">#</th>
                                <th className="text-left py-3 px-4 text-[#f4c542] font-semibold">
                                  {t("standings.team", "Team")}
                                </th>
                                <th className="text-center py-3 px-2 text-[#f4c542] font-semibold">PJ</th>
                                <th className="text-center py-3 px-2 text-[#f4c542] font-semibold">PG</th>
                                <th className="text-center py-3 px-2 text-[#f4c542] font-semibold">PE</th>
                                <th className="text-center py-3 px-2 text-[#f4c542] font-semibold">PP</th>
                                <th className="text-center py-3 px-2 text-[#f4c542] font-semibold">GF</th>
                                <th className="text-center py-3 px-2 text-[#f4c542] font-semibold">GC</th>
                                <th className="text-center py-3 px-2 text-[#f4c542] font-semibold">
                                  {t("standings.pts", "PTS")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {standings[group].map((row) => {
                                const teamLogo = getTeamLogo(row.team_id);
                                const isQualified = row.position <= 2;
                                return (
                                  <tr
                                    key={row.team_id}
                                    className={`border-b border-[#f4c542]/10 hover:bg-[#f4c542]/5 transition-colors ${
                                      isQualified ? "bg-[#f4c542]/10" : ""
                                    }`}
                                  >
                                    <td className="py-3 px-2 text-[#e5e5e5] font-semibold">{row.position}</td>
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-3">
                                        {teamLogo && (
                                          <img
                                            src={teamLogo}
                                            alt={row.team_name}
                                            className="w-8 h-8 rounded-full object-cover border border-[#f4c542]/20"
                                          />
                                        )}
                                        <span className="text-[#e5e5e5]">{row.team_name}</span>
                                        {isQualified && (
                                          <span className="text-xs text-[#f4c542] ml-2">✓ {t("copa.qualified", "Qualified")}</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="text-center py-3 px-2 text-[#e5e5e5]">{row.games_played}</td>
                                    <td className="text-center py-3 px-2 text-[#e5e5e5]">{row.games_won}</td>
                                    <td className="text-center py-3 px-2 text-[#e5e5e5]">{row.games_draw}</td>
                                    <td className="text-center py-3 px-2 text-[#e5e5e5]">{row.games_lost}</td>
                                    <td className="text-center py-3 px-2 text-[#e5e5e5]">{row.goals_for}</td>
                                    <td className="text-center py-3 px-2 text-[#e5e5e5]">{row.goals_against}</td>
                                    <td className="text-center py-3 px-2 text-[#f4c542] font-bold">{row.points}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-[#b5b5b5] py-8">
                          {t("copa.noStandings", "No standings available yet")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* Fixtures Tab */}
          <TabsContent value="fixtures">
            <Card className="glass-card border-[#f4c542]/20">
              <CardHeader>
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <CardTitle className="text-2xl text-[#f4c542]">
                    {t("copa.groupFixtures", "Group Stage Fixtures")}
                  </CardTitle>
                  <div className="flex gap-4">
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger className="w-[140px] input-field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                        <SelectItem value="all">{t("copa.allGroups", "All Groups")}</SelectItem>
                        <SelectItem value="A">{t("copa.groupA", "Group A")}</SelectItem>
                        <SelectItem value="B">{t("copa.groupB", "Group B")}</SelectItem>
                        <SelectItem value="C">{t("copa.groupC", "Group C")}</SelectItem>
                        <SelectItem value="D">{t("copa.groupD", "Group D")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedJornada} onValueChange={setSelectedJornada}>
                      <SelectTrigger className="w-[140px] input-field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                        <SelectItem value="all">{t("copa.allJornadas", "All Jornadas")}</SelectItem>
                        {[1, 2, 3, 4, 5].map((j) => (
                          <SelectItem key={j} value={j.toString()}>
                            {t("copa.jornada", { number: j }, `Jornada ${j}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center text-[#f4c542] py-8">Loading...</div>
                ) : filteredFixtures.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFixtures.map((fixture) => {
                      const homeLogo = getTeamLogo(fixture.home_team_id);
                      const awayLogo = getTeamLogo(fixture.away_team_id);
                      return (
                        <div
                          key={fixture.id}
                          className="p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-[#f4c542]">
                              {t("copa.group", "Group")} {fixture.group_name} • {t("copa.jornada", { number: fixture.jornada }, `Jornada ${fixture.jornada}`)}
                            </span>
                            {fixture.status === "completed" && (
                              <span className="text-xs text-[#4ade80] px-2 py-1 rounded bg-[#4ade80]/10">
                                {t("fixtures.completed", "Completed")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {homeLogo && (
                                <img
                                  src={homeLogo}
                                  alt={getTeamName(fixture.home_team_id)}
                                  className="w-10 h-10 rounded-full object-cover border border-[#f4c542]/20"
                                />
                              )}
                              <span className="text-[#e5e5e5] font-semibold">
                                {getTeamName(fixture.home_team_id)}
                              </span>
                            </div>
                            {fixture.status === "completed" ? (
                              <div className="text-center px-6">
                                <span className="text-2xl font-bold text-[#f4c542]">
                                  {fixture.home_score} - {fixture.away_score}
                                </span>
                              </div>
                            ) : (
                              <div className="text-center px-6">
                                <span className="text-[#b5b5b5]">vs</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3 flex-1 justify-end">
                              <span className="text-[#e5e5e5] font-semibold">
                                {getTeamName(fixture.away_team_id)}
                              </span>
                              {awayLogo && (
                                <img
                                  src={awayLogo}
                                  alt={getTeamName(fixture.away_team_id)}
                                  className="w-10 h-10 rounded-full object-cover border border-[#f4c542]/20"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-[#b5b5b5] py-8">
                    {t("copa.noFixtures", "No fixtures available")}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brackets Tab */}
          <TabsContent value="brackets">
            <div className="space-y-8">
              {/* Round of 16 */}
              <Card className="glass-card border-[#f4c542]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#f4c542]">
                    {t("copa.roundOf16", "Round of 16")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center text-[#f4c542] py-8">Loading...</div>
                  ) : getBracketMatches("round_of_16").length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getBracketMatches("round_of_16").map((match) => (
                        <div
                          key={match.id}
                          className="p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[#e5e5e5]">
                                {match.home_team_id ? getTeamName(match.home_team_id) : t("copa.tbd", "TBD")}
                              </span>
                              {match.status === "completed" && (
                                <span className="text-[#f4c542] font-bold">{match.home_score}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#e5e5e5]">
                                {match.away_team_id ? getTeamName(match.away_team_id) : t("copa.tbd", "TBD")}
                              </span>
                              {match.status === "completed" && (
                                <span className="text-[#f4c542] font-bold">{match.away_score}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-[#b5b5b5] py-8">
                      {t("copa.noBrackets", "Knockout brackets not set up yet")}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quarter Finals */}
              <Card className="glass-card border-[#f4c542]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#f4c542]">
                    {t("copa.quarterFinals", "Quarter Finals")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getBracketMatches("quarter_final").length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getBracketMatches("quarter_final").map((match) => (
                        <div
                          key={match.id}
                          className="p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[#e5e5e5]">
                                {match.home_team_id ? getTeamName(match.home_team_id) : t("copa.tbd", "TBD")}
                              </span>
                              {match.status === "completed" && (
                                <span className="text-[#f4c542] font-bold">{match.home_score}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#e5e5e5]">
                                {match.away_team_id ? getTeamName(match.away_team_id) : t("copa.tbd", "TBD")}
                              </span>
                              {match.status === "completed" && (
                                <span className="text-[#f4c542] font-bold">{match.away_score}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-[#b5b5b5] py-8">
                      {t("copa.noBrackets", "Knockout brackets not set up yet")}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Semi Finals */}
              <Card className="glass-card border-[#f4c542]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#f4c542]">
                    {t("copa.semiFinals", "Semi Finals")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getBracketMatches("semi_final").length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getBracketMatches("semi_final").map((match) => (
                        <div
                          key={match.id}
                          className="p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[#e5e5e5]">
                                {match.home_team_id ? getTeamName(match.home_team_id) : t("copa.tbd", "TBD")}
                              </span>
                              {match.status === "completed" && (
                                <span className="text-[#f4c542] font-bold">{match.home_score}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#e5e5e5]">
                                {match.away_team_id ? getTeamName(match.away_team_id) : t("copa.tbd", "TBD")}
                              </span>
                              {match.status === "completed" && (
                                <span className="text-[#f4c542] font-bold">{match.away_score}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-[#b5b5b5] py-8">
                      {t("copa.noBrackets", "Knockout brackets not set up yet")}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Final */}
              <Card className="glass-card border-[#f4c542]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#f4c542]">
                    {t("copa.final", "Final")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getBracketMatches("final").length > 0 ? (
                    <div className="max-w-md mx-auto">
                      {getBracketMatches("final").map((match) => (
                        <div
                          key={match.id}
                          className="p-6 bg-[#0f0f10]/50 rounded-lg border-2 border-[#f4c542]/30"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[#e5e5e5] text-lg font-semibold">
                                {match.home_team_id ? getTeamName(match.home_team_id) : t("copa.tbd", "TBD")}
                              </span>
                              {match.status === "completed" && (
                                <span className="text-[#f4c542] font-bold text-2xl">{match.home_score}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#e5e5e5] text-lg font-semibold">
                                {match.away_team_id ? getTeamName(match.away_team_id) : t("copa.tbd", "TBD")}
                              </span>
                              {match.status === "completed" && (
                                <span className="text-[#f4c542] font-bold text-2xl">{match.away_score}</span>
                              )}
                            </div>
                            {match.status === "completed" && match.winner_team_id && (
                              <div className="text-center mt-4 pt-4 border-t border-[#f4c542]/20">
                                <p className="text-[#f4c542] font-bold text-xl">
                                  🏆 {t("copa.champion", "Champion")}: {getTeamName(match.winner_team_id)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-[#b5b5b5] py-8">
                      {t("copa.noFinal", "Final match not set up yet")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CopaPage;
