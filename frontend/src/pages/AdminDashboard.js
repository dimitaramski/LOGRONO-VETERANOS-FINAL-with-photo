import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const AdminDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("teams");
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showFixtureModal, setShowFixtureModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);

  // Form states
  const [teamForm, setTeamForm] = useState({ name: "", division: 1, logo_url: "" });
  const [editingTeam, setEditingTeam] = useState(null);
  const [playerForm, setPlayerForm] = useState({ name: "", team_id: "", jersey_number: "" });
  const [fixtureForm, setFixtureForm] = useState({
    division: 1,
    week_number: 1,
    home_team_id: "",
    away_team_id: "",
    match_date: "",
  });
  const [userForm, setUserForm] = useState({ username: "", password: "", role: "team", team_id: "" });
  const [instagramForm, setInstagramForm] = useState({ instagram_url: "", description: "" });
  const [instagramPosts, setInstagramPosts] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "teams") {
        const res = await api.get("/teams");
        setTeams(res.data);
      } else if (activeTab === "players") {
        const [playersRes, teamsRes] = await Promise.all([
          api.get("/players"),
          api.get("/teams"),
        ]);
        setPlayers(playersRes.data);
        setTeams(teamsRes.data);
      } else if (activeTab === "fixtures") {
        const [fixturesRes, teamsRes] = await Promise.all([
          api.get("/fixtures"),
          api.get("/teams"),
        ]);
        setFixtures(fixturesRes.data);
        setTeams(teamsRes.data);
      } else if (activeTab === "users") {
        const [usersRes, teamsRes] = await Promise.all([
          api.get("/users"),
          api.get("/teams"),
        ]);
        setUsers(usersRes.data);
        setTeams(teamsRes.data);
      } else if (activeTab === "instagram") {
        const res = await api.get("/instagram-posts");
        setInstagramPosts(res.data);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInstagramPost = async (e) => {
    e.preventDefault();
    try {
      await api.post("/instagram-posts", instagramForm);
      toast.success("Instagram post added successfully");
      setShowInstagramModal(false);
      setInstagramForm({ instagram_url: "", description: "" });
      fetchData();
    } catch (error) {
      toast.error("Failed to add post");
    }
  };

  const handleDeleteInstagramPost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/instagram-posts/${postId}`);
      toast.success("Post deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        // Update existing team
        await api.put(`/teams/${editingTeam.id}`, teamForm);
        toast.success("Team updated successfully");
      } else {
        // Create new team
        await api.post("/teams", teamForm);
        toast.success("Team created successfully");
      }
      setShowTeamModal(false);
      setTeamForm({ name: "", division: 1, logo_url: "" });
      setEditingTeam(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save team");
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamForm({ 
      name: team.name, 
      division: team.division,
      logo_url: team.logo_url || ""
    });
    setShowTeamModal(true);
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    try {
      const data = { ...playerForm };
      if (data.jersey_number) {
        data.jersey_number = parseInt(data.jersey_number);
      } else {
        delete data.jersey_number;
      }
      await api.post("/players", data);
      toast.success("Player created successfully");
      setShowPlayerModal(false);
      setPlayerForm({ name: "", team_id: "", jersey_number: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create player");
    }
  };

  const handleCreateFixture = async (e) => {
    e.preventDefault();
    try {
      await api.post("/fixtures", fixtureForm);
      toast.success("Fixture created successfully");
      setShowFixtureModal(false);
      setFixtureForm({
        division: 1,
        week_number: 1,
        home_team_id: "",
        away_team_id: "",
        match_date: "",
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create fixture");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const data = { ...userForm };
      if (!data.team_id) {
        delete data.team_id;
      }
      await api.post("/auth/register", data);
      toast.success("User created successfully");
      setShowUserModal(false);
      setUserForm({ username: "", password: "", role: "team", team_id: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create user");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      await api.delete(`/teams/${teamId}`);
      toast.success("Team deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete team");
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm("Are you sure you want to delete this player?")) return;
    try {
      await api.delete(`/players/${playerId}`);
      toast.success("Player deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete player");
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : "Unknown";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f10] to-[#1a1a1b]">
      {/* Navigation */}
      <nav className="navbar fixed w-full top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gradient" data-testid="admin-dashboard-title">
            Admin Dashboard
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 bg-[#1a1a1b] border border-[#f4c542]/20 mb-8">
              <TabsTrigger
                value="teams"
                className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                data-testid="teams-tab"
              >
                Teams
              </TabsTrigger>
              <TabsTrigger
                value="players"
                className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                data-testid="players-tab"
              >
                Players
              </TabsTrigger>
              <TabsTrigger
                value="fixtures"
                className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                data-testid="fixtures-tab"
              >
                Fixtures
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                data-testid="users-tab"
              >
                Users
              </TabsTrigger>
              <TabsTrigger
                value="instagram"
                className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                data-testid="instagram-tab"
              >
                Instagram
              </TabsTrigger>
            </TabsList>

            {/* Teams Tab */}
            <TabsContent value="teams">
              <Card className="glass-card border-[#f4c542]/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl text-[#f4c542]">Teams Management</CardTitle>
                    <Button className="btn-primary" onClick={() => setShowTeamModal(true)} data-testid="add-team-btn">
                      + Add Team
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center text-[#f4c542]">Loading...</div>
                  ) : (
                    <div className="space-y-4">
                      {teams.map((team) => (
                        <div
                          key={team.id}
                          className="flex justify-between items-center p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                          data-testid={`team-item-${team.id}`}
                        >
                          <div className="flex items-center gap-4">
                            {team.logo_url && (
                              <img 
                                src={team.logo_url} 
                                alt={`${team.name} logo`}
                                className="w-12 h-12 rounded-full object-cover border-2 border-[#f4c542]/20"
                                data-testid={`team-logo-${team.id}`}
                              />
                            )}
                            <div>
                              <p className="text-[#e5e5e5] font-semibold" data-testid={`team-name-${team.id}`}>{team.name}</p>
                              <p className="text-sm text-[#b5b5b5]" data-testid={`team-division-${team.id}`}>Division {team.division}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="btn-secondary"
                              size="sm"
                              onClick={() => handleEditTeam(team)}
                              data-testid={`edit-team-${team.id}`}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteTeam(team.id)}
                              data-testid={`delete-team-${team.id}`}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Players Tab */}
            <TabsContent value="players">
              <Card className="glass-card border-[#f4c542]/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl text-[#f4c542]">Players Management</CardTitle>
                    <Button className="btn-primary" onClick={() => setShowPlayerModal(true)} data-testid="add-player-btn">
                      + Add Player
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center text-[#f4c542]">Loading...</div>
                  ) : (
                    <div className="space-y-4">
                      {players.map((player) => (
                        <div
                          key={player.id}
                          className="flex justify-between items-center p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                          data-testid={`player-item-${player.id}`}
                        >
                          <div>
                            <p className="text-[#e5e5e5] font-semibold" data-testid={`player-name-${player.id}`}>
                              {player.name} {player.jersey_number && `#${player.jersey_number}`}
                            </p>
                            <p className="text-sm text-[#b5b5b5]" data-testid={`player-team-${player.id}`}>{getTeamName(player.team_id)}</p>
                            <p className="text-sm text-[#f4c542]" data-testid={`player-goals-${player.id}`}>
                              ⚽ Goals: {player.goals_scored} | 🟨 Yellow: {player.yellow_cards || 0} | 🟥 Red: {player.red_cards || 0}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePlayer(player.id)}
                            data-testid={`delete-player-${player.id}`}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fixtures Tab */}
            <TabsContent value="fixtures">
              <Card className="glass-card border-[#f4c542]/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl text-[#f4c542]">Fixtures Management</CardTitle>
                    <Button className="btn-primary" onClick={() => setShowFixtureModal(true)} data-testid="add-fixture-btn">
                      + Add Fixture
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center text-[#f4c542]">Loading...</div>
                  ) : (
                    <div className="space-y-4">
                      {fixtures.map((fixture) => (
                        <div
                          key={fixture.id}
                          className="p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                          data-testid={`fixture-item-${fixture.id}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-[#e5e5e5] font-semibold" data-testid={`fixture-teams-${fixture.id}`}>
                                {getTeamName(fixture.home_team_id)} vs {getTeamName(fixture.away_team_id)}
                              </p>
                              <p className="text-sm text-[#b5b5b5]" data-testid={`fixture-details-${fixture.id}`}>
                                Week {fixture.week_number} • Division {fixture.division}
                              </p>
                              {fixture.status === "completed" && (
                                <p className="text-[#f4c542] font-bold" data-testid={`fixture-score-${fixture.id}`}>
                                  Score: {fixture.home_score} - {fixture.away_score}
                                </p>
                              )}
                            </div>
                            <Button
                              className="btn-primary"
                              onClick={() => navigate(`/admin/fixture/${fixture.id}`)}
                              data-testid={`edit-fixture-${fixture.id}`}
                            >
                              Edit Match
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="glass-card border-[#f4c542]/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl text-[#f4c542]">Users Management</CardTitle>
                    <Button className="btn-primary" onClick={() => setShowUserModal(true)} data-testid="add-user-btn">
                      + Add User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center text-[#f4c542]">Loading...</div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((u) => (
                        <div
                          key={u.id}
                          className="p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                          data-testid={`user-item-${u.id}`}
                        >
                          <p className="text-[#e5e5e5] font-semibold" data-testid={`user-username-${u.id}`}>{u.username}</p>
                          <p className="text-sm text-[#b5b5b5]" data-testid={`user-role-${u.id}`}>
                            Role: {u.role}
                            {u.team_id && ` • Team: ${getTeamName(u.team_id)}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Instagram Tab */}
            <TabsContent value="instagram">
              <Card className="glass-card border-[#f4c542]/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl text-[#f4c542]">Instagram Posts</CardTitle>
                    <Button className="btn-primary" onClick={() => setShowInstagramModal(true)} data-testid="add-instagram-btn">
                      + Add Post
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center text-[#f4c542]">Loading...</div>
                  ) : (
                    <div className="space-y-4">
                      {instagramPosts.map((post) => (
                        <div
                          key={post.id}
                          className="p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10 flex justify-between items-start"
                          data-testid={`instagram-item-${post.id}`}
                        >
                          <div className="flex-1">
                            <a 
                              href={post.instagram_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#f4c542] hover:text-[#ffd700] break-all"
                              data-testid={`instagram-url-${post.id}`}
                            >
                              {post.instagram_url}
                            </a>
                            {post.description && (
                              <p className="text-[#b5b5b5] text-sm mt-2" data-testid={`instagram-desc-${post.id}`}>
                                {post.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteInstagramPost(post.id)}
                            data-testid={`delete-instagram-${post.id}`}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                      {instagramPosts.length === 0 && (
                        <p className="text-center text-[#b5b5b5]" data-testid="no-instagram-posts">
                          No Instagram posts added yet
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Team Modal */}
      <Dialog open={showTeamModal} onOpenChange={(open) => {
        setShowTeamModal(open);
        if (!open) {
          setEditingTeam(null);
          setTeamForm({ name: "", division: 1, logo_url: "" });
        }
      }}>
        <DialogContent className="bg-[#1a1a1b] border border-[#f4c542]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#f4c542]">
              {editingTeam ? "Edit Team" : "Add New Team"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <Label className="text-[#e5e5e5]">Team Name</Label>
              <Input
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                placeholder="Enter team name"
                required
                className="input-field"
                data-testid="team-name-input"
              />
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Division</Label>
              <Select
                value={teamForm.division.toString()}
                onValueChange={(v) => setTeamForm({ ...teamForm, division: parseInt(v) })}
              >
                <SelectTrigger className="input-field" data-testid="team-division-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  <SelectItem value="1" data-testid="division-1-option">1st Division</SelectItem>
                  <SelectItem value="2" data-testid="division-2-option">2nd Division</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Team Logo URL (Optional)</Label>
              <Input
                value={teamForm.logo_url}
                onChange={(e) => setTeamForm({ ...teamForm, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="input-field"
                data-testid="team-logo-input"
              />
              <p className="text-xs text-[#b5b5b5] mt-1">
                Paste an image URL or upload to image hosting (Imgur, etc.)
              </p>
              {teamForm.logo_url && (
                <div className="mt-3">
                  <p className="text-sm text-[#b5b5b5] mb-2">Preview:</p>
                  <img 
                    src={teamForm.logo_url} 
                    alt="Team logo preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#f4c542]/20"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                    data-testid="team-logo-preview"
                  />
                </div>
              )}
            </div>
            <Button type="submit" className="btn-primary w-full" data-testid="create-team-submit">
              {editingTeam ? "Update Team" : "Create Team"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Player Modal */}
      <Dialog open={showPlayerModal} onOpenChange={setShowPlayerModal}>
        <DialogContent className="bg-[#1a1a1b] border border-[#f4c542]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#f4c542]">Add New Player</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePlayer} className="space-y-4">
            <div>
              <Label className="text-[#e5e5e5]">Player Name</Label>
              <Input
                value={playerForm.name}
                onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                placeholder="Enter player name"
                required
                className="input-field"
                data-testid="player-name-input"
              />
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Team</Label>
              <Select
                value={playerForm.team_id}
                onValueChange={(v) => setPlayerForm({ ...playerForm, team_id: v })}
              >
                <SelectTrigger className="input-field" data-testid="player-team-select">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id} data-testid={`team-option-${team.id}`}>
                      {team.name} (Division {team.division})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Jersey Number (Optional)</Label>
              <Input
                type="number"
                value={playerForm.jersey_number}
                onChange={(e) => setPlayerForm({ ...playerForm, jersey_number: e.target.value })}
                placeholder="Enter jersey number"
                className="input-field"
                data-testid="player-jersey-input"
              />
            </div>
            <Button type="submit" className="btn-primary w-full" data-testid="create-player-submit">
              Create Player
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Fixture Modal */}
      <Dialog open={showFixtureModal} onOpenChange={setShowFixtureModal}>
        <DialogContent className="bg-[#1a1a1b] border border-[#f4c542]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#f4c542]">Add New Fixture</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFixture} className="space-y-4">
            <div>
              <Label className="text-[#e5e5e5]">Division</Label>
              <Select
                value={fixtureForm.division.toString()}
                onValueChange={(v) => setFixtureForm({ ...fixtureForm, division: parseInt(v) })}
              >
                <SelectTrigger className="input-field" data-testid="fixture-division-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  <SelectItem value="1" data-testid="fixture-division-1-option">1st Division</SelectItem>
                  <SelectItem value="2" data-testid="fixture-division-2-option">2nd Division</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Week Number</Label>
              <Input
                type="number"
                value={fixtureForm.week_number}
                onChange={(e) => setFixtureForm({ ...fixtureForm, week_number: parseInt(e.target.value) })}
                placeholder="Week number"
                required
                className="input-field"
                data-testid="fixture-week-input"
              />
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Home Team</Label>
              <Select
                value={fixtureForm.home_team_id}
                onValueChange={(v) => setFixtureForm({ ...fixtureForm, home_team_id: v })}
              >
                <SelectTrigger className="input-field" data-testid="fixture-home-team-select">
                  <SelectValue placeholder="Select home team" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  {teams
                    .filter((t) => t.division === fixtureForm.division)
                    .map((team) => (
                      <SelectItem key={team.id} value={team.id} data-testid={`home-team-option-${team.id}`}>
                        {team.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Away Team</Label>
              <Select
                value={fixtureForm.away_team_id}
                onValueChange={(v) => setFixtureForm({ ...fixtureForm, away_team_id: v })}
              >
                <SelectTrigger className="input-field" data-testid="fixture-away-team-select">
                  <SelectValue placeholder="Select away team" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  {teams
                    .filter((t) => t.division === fixtureForm.division)
                    .map((team) => (
                      <SelectItem key={team.id} value={team.id} data-testid={`away-team-option-${team.id}`}>
                        {team.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Match Date</Label>
              <Input
                type="datetime-local"
                value={fixtureForm.match_date}
                onChange={(e) => setFixtureForm({ ...fixtureForm, match_date: e.target.value })}
                required
                className="input-field"
                data-testid="fixture-date-input"
              />
            </div>
            <Button type="submit" className="btn-primary w-full" data-testid="create-fixture-submit">
              Create Fixture
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="bg-[#1a1a1b] border border-[#f4c542]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#f4c542]">Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <Label className="text-[#e5e5e5]">Username</Label>
              <Input
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                placeholder="Enter username"
                required
                className="input-field"
                data-testid="user-username-input"
              />
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Password</Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Enter password"
                required
                className="input-field"
                data-testid="user-password-input"
              />
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Role</Label>
              <Select
                value={userForm.role}
                onValueChange={(v) => setUserForm({ ...userForm, role: v })}
              >
                <SelectTrigger className="input-field" data-testid="user-role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  <SelectItem value="team" data-testid="role-team-option">Team User</SelectItem>
                  <SelectItem value="admin" data-testid="role-admin-option">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {userForm.role === "team" && (
              <div>
                <Label className="text-[#e5e5e5]">Team</Label>
                <Select
                  value={userForm.team_id}
                  onValueChange={(v) => setUserForm({ ...userForm, team_id: v })}
                >
                  <SelectTrigger className="input-field" data-testid="user-team-select">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id} data-testid={`user-team-option-${team.id}`}>
                        {team.name} (Division {team.division})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button type="submit" className="btn-primary w-full" data-testid="create-user-submit">
              Create User
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Instagram Post Modal */}
      <Dialog open={showInstagramModal} onOpenChange={setShowInstagramModal}>
        <DialogContent className="bg-[#1a1a1b] border border-[#f4c542]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#f4c542]">Add Instagram Post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateInstagramPost} className="space-y-4">
            <div>
              <Label className="text-[#e5e5e5]">Instagram Post URL</Label>
              <Input
                value={instagramForm.instagram_url}
                onChange={(e) => setInstagramForm({ ...instagramForm, instagram_url: e.target.value })}
                placeholder="https://www.instagram.com/p/..."
                required
                className="input-field"
                data-testid="instagram-url-input"
              />
              <p className="text-xs text-[#b5b5b5] mt-1">
                Copy the link from Instagram post or reel
              </p>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Description (Optional)</Label>
              <Input
                value={instagramForm.description}
                onChange={(e) => setInstagramForm({ ...instagramForm, description: e.target.value })}
                placeholder="Brief description of the post"
                className="input-field"
                data-testid="instagram-description-input"
              />
            </div>
            <Button type="submit" className="btn-primary w-full" data-testid="create-instagram-submit">
              Add Post
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;