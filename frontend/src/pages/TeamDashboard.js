import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../App";
import { toast } from "sonner";

const TeamDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState([]);
  const [teams, setTeams] = useState({});
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [scoreForm, setScoreForm] = useState({ home_score: "", away_score: "", status: "completed" });
  const [goalForm, setGoalForm] = useState({ player_id: "", team_side: "", minute: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fixturesRes, teamsRes, playersRes] = await Promise.all([
        api.get("/fixtures"),
        api.get("/teams"),
        api.get("/players"),
      ]);

      // Filter fixtures for user's team
      const teamFixtures = fixturesRes.data.filter(
        (f) => f.home_team_id === user.team_id || f.away_team_id === user.team_id
      );
      setFixtures(teamFixtures);

      const teamsMap = {};
      teamsRes.data.forEach((team) => {
        teamsMap[team.id] = team;
      });
      setTeams(teamsMap);

      setPlayers(playersRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleOpenScoreModal = (fixture) => {
    setSelectedFixture(fixture);
    setScoreForm({
      home_score: fixture.home_score !== null ? fixture.home_score.toString() : "",
      away_score: fixture.away_score !== null ? fixture.away_score.toString() : "",
      status: "completed",
    });
    setShowScoreModal(true);
  };

  const handleOpenGoalModal = (fixture) => {
    setSelectedFixture(fixture);
    const isHome = fixture.home_team_id === user.team_id;
    setGoalForm({
      player_id: "",
      team_side: isHome ? "home" : "away",
      minute: "",
    });
    setShowGoalModal(true);
  };

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/fixtures/${selectedFixture.id}`, {
        home_score: parseInt(scoreForm.home_score),
        away_score: parseInt(scoreForm.away_score),
        status: scoreForm.status,
      });
      toast.success("Score updated successfully");
      setShowScoreModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update score");
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const data = {
        player_id: goalForm.player_id,
        team_side: goalForm.team_side,
      };
      if (goalForm.minute) {
        data.minute = parseInt(goalForm.minute);
      }
      await api.post(`/fixtures/${selectedFixture.id}/goals`, data);
      toast.success("Goal scorer added successfully");
      setShowGoalModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add goal scorer");
    }
  };

  const getTeamPlayers = () => {
    return players.filter((p) => p.team_id === user.team_id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f10] to-[#1a1a1b]">
      {/* Navigation */}
      <nav className="navbar fixed w-full top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gradient" data-testid="team-dashboard-title">
            {teams[user.team_id]?.name || "Team Dashboard"}
          </h1>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              className="text-[#e5e5e5] hover:text-[#f4c542]"
              onClick={() => navigate("/")}
              data-testid="nav-home-btn"
            >
              Home
            </Button>
            <Button
              className="btn-secondary"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Card className="glass-card border-[#f4c542]/20">
            <CardHeader>
              <CardTitle className="text-2xl text-[#f4c542]">Your Fixtures</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-[#f4c542]">Loading...</div>
              ) : fixtures.length === 0 ? (
                <div className="text-center text-[#b5b5b5]" data-testid="no-fixtures-message">No fixtures scheduled</div>
              ) : (
                <div className="space-y-4">
                  {fixtures.map((fixture) => {
                    const isHome = fixture.home_team_id === user.team_id;
                    return (
                      <div
                        key={fixture.id}
                        className="p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                        data-testid={`fixture-${fixture.id}`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex-1">
                            <p className="text-[#e5e5e5] font-semibold" data-testid={`fixture-teams-${fixture.id}`}>
                              {teams[fixture.home_team_id]?.name || "Unknown"} vs{" "}
                              {teams[fixture.away_team_id]?.name || "Unknown"}
                            </p>
                            <p className="text-sm text-[#b5b5b5]" data-testid={`fixture-week-${fixture.id}`}>
                              Week {fixture.week_number} •{" "}
                              {new Date(fixture.match_date).toLocaleDateString()}
                            </p>
                          </div>
                          {fixture.status === "completed" && (
                            <div className="text-2xl font-bold text-[#f4c542]" data-testid={`fixture-score-${fixture.id}`}>
                              {fixture.home_score} - {fixture.away_score}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            className="btn-primary"
                            onClick={() => handleOpenScoreModal(fixture)}
                            data-testid={`update-score-btn-${fixture.id}`}
                          >
                            Update Score
                          </Button>
                          <Button
                            size="sm"
                            className="btn-secondary"
                            onClick={() => handleOpenGoalModal(fixture)}
                            data-testid={`add-goal-btn-${fixture.id}`}
                          >
                            Add Goal Scorer
                          </Button>
                        </div>

                        {/* Display goal scorers */}
                        {(fixture.home_scorers.length > 0 || fixture.away_scorers.length > 0) && (
                          <div className="mt-4 pt-4 border-t border-[#f4c542]/10">
                            {fixture.home_scorers.length > 0 && (
                              <div className="mb-2" data-testid={`home-scorers-${fixture.id}`}>
                                <p className="text-sm text-[#b5b5b5] mb-1">
                                  {teams[fixture.home_team_id]?.name} scorers:
                                </p>
                                {fixture.home_scorers.map((scorer, idx) => (
                                  <p key={idx} className="text-sm text-[#e5e5e5]" data-testid={`home-scorer-${idx}`}>
                                    ⚽ {scorer.player_name}
                                    {scorer.minute && ` (${scorer.minute}')`}
                                  </p>
                                ))}
                              </div>
                            )}
                            {fixture.away_scorers.length > 0 && (
                              <div data-testid={`away-scorers-${fixture.id}`}>
                                <p className="text-sm text-[#b5b5b5] mb-1">
                                  {teams[fixture.away_team_id]?.name} scorers:
                                </p>
                                {fixture.away_scorers.map((scorer, idx) => (
                                  <p key={idx} className="text-sm text-[#e5e5e5]" data-testid={`away-scorer-${idx}`}>
                                    ⚽ {scorer.player_name}
                                    {scorer.minute && ` (${scorer.minute}')`}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Score Modal */}
      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="bg-[#1a1a1b] border border-[#f4c542]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#f4c542]">Update Score</DialogTitle>
          </DialogHeader>
          {selectedFixture && (
            <form onSubmit={handleUpdateScore} className="space-y-4">
              <div>
                <Label className="text-[#e5e5e5]">
                  {teams[selectedFixture.home_team_id]?.name} (Home)
                </Label>
                <Input
                  type="number"
                  value={scoreForm.home_score}
                  onChange={(e) => setScoreForm({ ...scoreForm, home_score: e.target.value })}
                  placeholder="Home score"
                  required
                  min="0"
                  className="input-field"
                  data-testid="home-score-input"
                />
              </div>
              <div>
                <Label className="text-[#e5e5e5]">
                  {teams[selectedFixture.away_team_id]?.name} (Away)
                </Label>
                <Input
                  type="number"
                  value={scoreForm.away_score}
                  onChange={(e) => setScoreForm({ ...scoreForm, away_score: e.target.value })}
                  placeholder="Away score"
                  required
                  min="0"
                  className="input-field"
                  data-testid="away-score-input"
                />
              </div>
              <Button type="submit" className="btn-primary w-full" data-testid="update-score-submit">
                Update Score
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Goal Scorer Modal */}
      <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
        <DialogContent className="bg-[#1a1a1b] border border-[#f4c542]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#f4c542]">Add Goal Scorer</DialogTitle>
          </DialogHeader>
          {selectedFixture && (
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <Label className="text-[#e5e5e5]">Player</Label>
                <Select
                  value={goalForm.player_id}
                  onValueChange={(v) => setGoalForm({ ...goalForm, player_id: v })}
                >
                  <SelectTrigger className="input-field" data-testid="player-select">
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                    {getTeamPlayers().map((player) => (
                      <SelectItem key={player.id} value={player.id} data-testid={`player-option-${player.id}`}>
                        {player.name}
                        {player.jersey_number && ` #${player.jersey_number}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#e5e5e5]">Minute (Optional)</Label>
                <Input
                  type="number"
                  value={goalForm.minute}
                  onChange={(e) => setGoalForm({ ...goalForm, minute: e.target.value })}
                  placeholder="Goal minute"
                  min="1"
                  max="120"
                  className="input-field"
                  data-testid="minute-input"
                />
              </div>
              <Button type="submit" className="btn-primary w-full" data-testid="add-goal-submit">
                Add Goal
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamDashboard;
