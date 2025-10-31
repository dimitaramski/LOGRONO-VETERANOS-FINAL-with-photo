import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const AdminFixtureEdit = ({ user, setUser }) => {
  const navigate = useNavigate();
  const { fixtureId } = useParams();
  
  const [fixture, setFixture] = useState(null);
  const [teams, setTeams] = useState({});
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Score edit
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  
  // Goal scorer add
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalTeamSide, setGoalTeamSide] = useState("");
  const [goalPlayerId, setGoalPlayerId] = useState("");
  const [goalMinute, setGoalMinute] = useState("");
  
  // Card add
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardTeamSide, setCardTeamSide] = useState("");
  const [cardPlayerId, setCardPlayerId] = useState("");
  const [cardType, setCardType] = useState("yellow");
  const [cardMinute, setCardMinute] = useState("");

  useEffect(() => {
    fetchData();
  }, [fixtureId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fixturesRes, teamsRes, playersRes] = await Promise.all([
        api.get("/fixtures"),
        api.get("/teams"),
        api.get("/players"),
      ]);

      const currentFixture = fixturesRes.data.find((f) => f.id === fixtureId);
      if (!currentFixture) {
        toast.error("Fixture not found");
        navigate("/admin");
        return;
      }
      setFixture(currentFixture);
      setHomeScore(currentFixture.home_score || "");
      setAwayScore(currentFixture.away_score || "");

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

  const handleUpdateScore = async () => {
    try {
      await api.put(`/fixtures/${fixtureId}`, {
        home_score: parseInt(homeScore),
        away_score: parseInt(awayScore),
        status: "completed",
      });
      toast.success("Score updated successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to update score");
    }
  };

  const handleAddGoal = async () => {
    try {
      const data = {
        player_id: goalPlayerId,
        team_side: goalTeamSide,
      };
      if (goalMinute) data.minute = parseInt(goalMinute);

      await api.post(`/fixtures/${fixtureId}/goals`, data);
      toast.success("Goal added successfully");
      setShowAddGoal(false);
      setGoalPlayerId("");
      setGoalMinute("");
      fetchData();
    } catch (error) {
      toast.error("Failed to add goal");
    }
  };

  const handleRemoveGoal = async (goalId, teamSide) => {
    if (!window.confirm("Remove this goal?")) return;
    try {
      await api.delete(`/fixtures/${fixtureId}/goals`, {
        data: { goal_id: goalId, team_side: teamSide },
      });
      toast.success("Goal removed successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to remove goal");
    }
  };

  const handleAddCard = async () => {
    try {
      const data = {
        player_id: cardPlayerId,
        team_side: cardTeamSide,
        card_type: cardType,
      };
      if (cardMinute) data.minute = parseInt(cardMinute);

      await api.post(`/fixtures/${fixtureId}/cards`, data);
      toast.success("Card added successfully");
      setShowAddCard(false);
      setCardPlayerId("");
      setCardMinute("");
      fetchData();
    } catch (error) {
      toast.error("Failed to add card");
    }
  };

  const handleRemoveCard = async (cardId, teamSide) => {
    if (!window.confirm("Remove this card?")) return;
    try {
      await api.delete(`/fixtures/${fixtureId}/cards`, {
        data: { card_id: cardId, team_side: teamSide },
      });
      toast.success("Card removed successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to remove card");
    }
  };

  const getTeamPlayers = (teamId) => {
    return players.filter((p) => p.team_id === teamId);
  };

  if (loading || !fixture) {
    return <div className="min-h-screen bg-gradient-to-br from-[#0f0f10] to-[#1a1a1b] flex items-center justify-center text-[#f4c542]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f10] to-[#1a1a1b] py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" className="text-[#f4c542] mb-4" onClick={() => navigate("/admin")} data-testid="back-to-admin">
          ← Back to Admin
        </Button>

        <Card className="glass-card border-[#f4c542]/20 mb-6">
          <CardHeader>
            <CardTitle className="text-3xl text-[#f4c542]">
              Edit Match
            </CardTitle>
            <p className="text-[#b5b5b5]">
              {teams[fixture.home_team_id]?.name} vs {teams[fixture.away_team_id]?.name}
            </p>
            <p className="text-sm text-[#b5b5b5]">
              Week {fixture.week_number} • {new Date(fixture.match_date).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Update */}
            <div className="p-4 bg-[#0f0f10]/50 rounded-lg">
              <h3 className="text-xl text-[#f4c542] mb-4">Match Score</h3>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="text-[#e5e5e5]">{teams[fixture.home_team_id]?.name}</Label>
                  <Input
                    type="number"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="input-field"
                    data-testid="edit-home-score"
                  />
                </div>
                <div className="text-center text-2xl text-[#f4c542]">vs</div>
                <div>
                  <Label className="text-[#e5e5e5]">{teams[fixture.away_team_id]?.name}</Label>
                  <Input
                    type="number"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="input-field"
                    data-testid="edit-away-score"
                  />
                </div>
              </div>
              <Button className="btn-primary mt-4" onClick={handleUpdateScore} data-testid="save-score-btn">
                Save Score
              </Button>
            </div>

            {/* Goal Scorers */}
            <div className="p-4 bg-[#0f0f10]/50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl text-[#f4c542]">Goal Scorers</h3>
                <Button className="btn-primary" onClick={() => setShowAddGoal(!showAddGoal)} data-testid="toggle-add-goal">
                  {showAddGoal ? "Cancel" : "+ Add Goal"}
                </Button>
              </div>

              {showAddGoal && (
                <div className="mb-4 p-4 border border-[#f4c542]/20 rounded-lg space-y-3">
                  <Select value={goalTeamSide} onValueChange={setGoalTeamSide}>
                    <SelectTrigger className="input-field" data-testid="goal-team-select">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                      <SelectItem value="home">{teams[fixture.home_team_id]?.name}</SelectItem>
                      <SelectItem value="away">{teams[fixture.away_team_id]?.name}</SelectItem>
                    </SelectContent>
                  </Select>

                  {goalTeamSide && (
                    <Select value={goalPlayerId} onValueChange={setGoalPlayerId}>
                      <SelectTrigger className="input-field" data-testid="goal-player-select">
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                        {getTeamPlayers(
                          goalTeamSide === "home" ? fixture.home_team_id : fixture.away_team_id
                        ).map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name} {player.jersey_number && `#${player.jersey_number}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Input
                    type="number"
                    value={goalMinute}
                    onChange={(e) => setGoalMinute(e.target.value)}
                    placeholder="Minute (optional)"
                    className="input-field"
                    data-testid="goal-minute-input"
                  />

                  <Button className="btn-primary w-full" onClick={handleAddGoal} disabled={!goalPlayerId} data-testid="submit-add-goal">
                    Add Goal
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {fixture.home_scorers?.length > 0 && (
                  <div>
                    <p className="text-sm text-[#b5b5b5] mb-2">{teams[fixture.home_team_id]?.name}:</p>
                    {fixture.home_scorers.map((scorer) => (
                      <div key={scorer.id} className="flex justify-between items-center text-[#e5e5e5] mb-1" data-testid={`home-goal-${scorer.id}`}>
                        <span>
                          ⚽ {scorer.player_name}
                          {scorer.minute && ` (${scorer.minute}')`}
                        </span>
                        <Button variant="destructive" size="sm" onClick={() => handleRemoveGoal(scorer.id, "home")} data-testid={`remove-home-goal-${scorer.id}`}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {fixture.away_scorers?.length > 0 && (
                  <div>
                    <p className="text-sm text-[#b5b5b5] mb-2">{teams[fixture.away_team_id]?.name}:</p>
                    {fixture.away_scorers.map((scorer) => (
                      <div key={scorer.id} className="flex justify-between items-center text-[#e5e5e5] mb-1" data-testid={`away-goal-${scorer.id}`}>
                        <span>
                          ⚽ {scorer.player_name}
                          {scorer.minute && ` (${scorer.minute}')`}
                        </span>
                        <Button variant="destructive" size="sm" onClick={() => handleRemoveGoal(scorer.id, "away")} data-testid={`remove-away-goal-${scorer.id}`}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {(!fixture.home_scorers || fixture.home_scorers.length === 0) &&
                  (!fixture.away_scorers || fixture.away_scorers.length === 0) && (
                    <p className="text-[#b5b5b5] text-center">No goals recorded</p>
                  )}
              </div>
            </div>

            {/* Cards */}
            <div className="p-4 bg-[#0f0f10]/50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl text-[#f4c542]">Cards</h3>
                <Button className="btn-primary" onClick={() => setShowAddCard(!showAddCard)} data-testid="toggle-add-card">
                  {showAddCard ? "Cancel" : "+ Add Card"}
                </Button>
              </div>

              {showAddCard && (
                <div className="mb-4 p-4 border border-[#f4c542]/20 rounded-lg space-y-3">
                  <Select value={cardTeamSide} onValueChange={setCardTeamSide}>
                    <SelectTrigger className="input-field" data-testid="card-team-select">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                      <SelectItem value="home">{teams[fixture.home_team_id]?.name}</SelectItem>
                      <SelectItem value="away">{teams[fixture.away_team_id]?.name}</SelectItem>
                    </SelectContent>
                  </Select>

                  {cardTeamSide && (
                    <Select value={cardPlayerId} onValueChange={setCardPlayerId}>
                      <SelectTrigger className="input-field" data-testid="card-player-select">
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                        {getTeamPlayers(
                          cardTeamSide === "home" ? fixture.home_team_id : fixture.away_team_id
                        ).map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name} {player.jersey_number && `#${player.jersey_number}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Select value={cardType} onValueChange={setCardType}>
                    <SelectTrigger className="input-field" data-testid="card-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                      <SelectItem value="yellow">🟨 Yellow Card</SelectItem>
                      <SelectItem value="red">🟥 Red Card</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    value={cardMinute}
                    onChange={(e) => setCardMinute(e.target.value)}
                    placeholder="Minute (optional)"
                    className="input-field"
                    data-testid="card-minute-input"
                  />

                  <Button className="btn-primary w-full" onClick={handleAddCard} disabled={!cardPlayerId} data-testid="submit-add-card">
                    Add Card
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {fixture.home_cards?.length > 0 && (
                  <div>
                    <p className="text-sm text-[#b5b5b5] mb-2">{teams[fixture.home_team_id]?.name}:</p>
                    {fixture.home_cards.map((card) => (
                      <div key={card.id} className="flex justify-between items-center text-[#e5e5e5] mb-1" data-testid={`home-card-${card.id}`}>
                        <span>
                          {card.card_type === "yellow" ? "🟨" : "🟥"} {card.player_name}
                          {card.minute && ` (${card.minute}')`}
                        </span>
                        <Button variant="destructive" size="sm" onClick={() => handleRemoveCard(card.id, "home")} data-testid={`remove-home-card-${card.id}`}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {fixture.away_cards?.length > 0 && (
                  <div>
                    <p className="text-sm text-[#b5b5b5] mb-2">{teams[fixture.away_team_id]?.name}:</p>
                    {fixture.away_cards.map((card) => (
                      <div key={card.id} className="flex justify-between items-center text-[#e5e5e5] mb-1" data-testid={`away-card-${card.id}`}>
                        <span>
                          {card.card_type === "yellow" ? "🟨" : "🟥"} {card.player_name}
                          {card.minute && ` (${card.minute}')`}
                        </span>
                        <Button variant="destructive" size="sm" onClick={() => handleRemoveCard(card.id, "away")} data-testid={`remove-away-card-${card.id}`}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {(!fixture.home_cards || fixture.home_cards.length === 0) &&
                  (!fixture.away_cards || fixture.away_cards.length === 0) && (
                    <p className="text-[#b5b5b5] text-center">No cards recorded</p>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminFixtureEdit;
