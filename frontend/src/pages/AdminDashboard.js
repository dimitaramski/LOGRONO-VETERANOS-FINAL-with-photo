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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api } from "../App";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const AdminDashboard = ({ user, setUser }) => {
  const { t, i18n } = useTranslation();
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

  // Copa states
  const [copaGroups, setCopaGroups] = useState([]);
  const [copaFixtures, setCopaFixtures] = useState([]);
  const [copaBrackets, setCopaBrackets] = useState([]);
  const [showCopaGroupModal, setShowCopaGroupModal] = useState(false);
  const [showCopaFixtureModal, setShowCopaFixtureModal] = useState(false);
  const [showCopaBracketModal, setShowCopaBracketModal] = useState(false);
  const [copaGroupForm, setCopaGroupForm] = useState({ group_name: "A", team_ids: [] });
  const [copaFixtureForm, setCopaFixtureForm] = useState({
    group_name: "A",
    jornada: 1,
    home_team_id: "",
    away_team_id: "",
    match_date: "",
  });
  const [copaBracketForm, setCopaBracketForm] = useState({
    round_type: "round_of_16",
    match_position: 1,
    home_team_id: "",
    away_team_id: "",
    match_date: "",
  });

  // Sanctions states
  const [sanctions, setSanctions] = useState([]);
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [sanctionForm, setSanctionForm] = useState({
    player_id: "",
    suspension_games: "",
    suspension_from_week: "",
    suspension_to_week: "",
    notes: "",
  });

  // Settings states
  const [logoUrl, setLogoUrl] = useState("https://em-content.zobj.net/source/apple/391/soccer-ball_26bd.png");
  const [newLogoUrl, setNewLogoUrl] = useState("");
  const [logoWidth, setLogoWidth] = useState(40);
  const [logoHeight, setLogoHeight] = useState(40);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Load logo from localStorage on mount
  useEffect(() => {
    const savedLogo = localStorage.getItem('leagueLogo');
    const savedWidth = localStorage.getItem('logoWidth');
    const savedHeight = localStorage.getItem('logoHeight');
    
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
    if (savedWidth) {
      setLogoWidth(parseInt(savedWidth));
    }
    if (savedHeight) {
      setLogoHeight(parseInt(savedHeight));
    }
  }, []);

  // Load logo from localStorage on mount
  useEffect(() => {
    const savedLogo = localStorage.getItem('leagueLogo');
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, []);

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
      } else if (activeTab === "copa") {
        const [groupsRes, fixturesRes, bracketsRes, teamsRes] = await Promise.all([
          api.get("/copa/groups"),
          api.get("/copa/fixtures"),
          api.get("/copa/brackets"),
          api.get("/teams"),
        ]);
        setCopaGroups(groupsRes.data);
        setCopaFixtures(fixturesRes.data);
        setCopaBrackets(bracketsRes.data);
        setTeams(teamsRes.data);
      } else if (activeTab === "sanctions") {
        const res = await api.get("/sanctions");
        setSanctions(res.data);
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
    console.log("Delete clicked for post:", postId);
    if (!window.confirm("Are you sure you want to delete this Instagram post?")) {
      console.log("Delete cancelled by user");
      return;
    }
    console.log("Proceeding with delete...");
    try {
      const response = await api.delete(`/instagram-posts/${postId}`);
      console.log("Delete response:", response);
      toast.success("Instagram post deleted successfully");
      await fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.detail || "Failed to delete Instagram post. Please try again.");
    }
  };

  // Copa handlers
  const handleCreateCopaGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post("/copa/groups", copaGroupForm);
      toast.success("Copa group created successfully");
      setShowCopaGroupModal(false);
      setCopaGroupForm({ group_name: "A", team_ids: [] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create Copa group");
    }
  };

  const handleUpdateCopaGroup = async (groupName) => {
    try {
      await api.put(`/copa/groups/${groupName}`, copaGroupForm);
      toast.success("Copa group updated successfully");
      setShowCopaGroupModal(false);
      setCopaGroupForm({ group_name: "A", team_ids: [] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update Copa group");
    }
  };

  const handleDeleteCopaGroup = async (groupName) => {
    if (!window.confirm(`Are you sure you want to delete Group ${groupName}?`)) {
      return;
    }
    try {
      await api.delete(`/copa/groups/${groupName}`);
      toast.success("Copa group deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete Copa group");
    }
  };

  const handleCreateCopaFixture = async (e) => {
    e.preventDefault();
    try {
      await api.post("/copa/fixtures", copaFixtureForm);
      toast.success("Copa fixture created successfully");
      setShowCopaFixtureModal(false);
      setCopaFixtureForm({
        group_name: "A",
        jornada: 1,
        home_team_id: "",
        away_team_id: "",
        match_date: "",
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create Copa fixture");
    }
  };

  const handleDeleteCopaFixture = async (fixtureId) => {
    if (!window.confirm("Are you sure you want to delete this Copa fixture?")) {
      return;
    }
    try {
      await api.delete(`/copa/fixtures/${fixtureId}`);
      toast.success("Copa fixture deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete Copa fixture");
    }
  };

  const handleCreateCopaBracket = async (e) => {
    e.preventDefault();
    try {
      await api.post("/copa/brackets", copaBracketForm);
      toast.success("Copa bracket created successfully");
      setShowCopaBracketModal(false);
      setCopaBracketForm({
        round_type: "round_of_16",
        match_position: 1,
        home_team_id: "",
        away_team_id: "",
        match_date: "",
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create Copa bracket");
    }
  };

  const handleDeleteCopaBracket = async (bracketId) => {
    if (!window.confirm("Are you sure you want to delete this Copa bracket?")) {
      return;
    }
    try {
      await api.delete(`/copa/brackets/${bracketId}`);
      toast.success("Copa bracket deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete Copa bracket");
    }
  };

  // Sanction handlers
  const handleUpdateSanction = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/sanctions/${sanctionForm.player_id}`, {
        suspension_games: sanctionForm.suspension_games ? parseInt(sanctionForm.suspension_games) : null,
        suspension_from_week: sanctionForm.suspension_from_week ? parseInt(sanctionForm.suspension_from_week) : null,
        suspension_to_week: sanctionForm.suspension_to_week ? parseInt(sanctionForm.suspension_to_week) : null,
        notes: sanctionForm.notes || null,
      });
      toast.success("Sanction updated successfully");
      setShowSanctionModal(false);
      setSanctionForm({
        player_id: "",
        suspension_games: "",
        suspension_from_week: "",
        suspension_to_week: "",
        notes: "",
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update sanction");
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
        await api.put(`/teams/${editingTeam.id}`, teamForm);
        toast.success("Team updated successfully");
      } else {
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
    console.log("Delete team clicked:", teamId);
    if (!window.confirm("Are you sure you want to delete this team? This will affect all associated data.")) {
      return;
    }
    try {
      const response = await api.delete(`/teams/${teamId}`);
      console.log("Team delete response:", response);
      toast.success("Team deleted successfully");
      await fetchData();
    } catch (error) {
      console.error("Delete team error:", error);
      toast.error(error.response?.data?.detail || "Failed to delete team. It may have associated players or fixtures.");
    }
  };

  const handleDeletePlayer = async (playerId) => {
    console.log("Delete player clicked:", playerId);
    if (!window.confirm("Are you sure you want to delete this player?")) {
      return;
    }
    try {
      const response = await api.delete(`/players/${playerId}`);
      console.log("Player delete response:", response);
      toast.success("Player deleted successfully");
      await fetchData();
    } catch (error) {
      console.error("Delete player error:", error);
      toast.error(error.response?.data?.detail || "Failed to delete player. Please try again.");
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
            {t('admin.title')}
          </h1>
          <div className="flex gap-4 items-center">
            {/* Language Switcher */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`text-sm ${i18n.language === 'es' ? 'text-[#f4c542] font-bold' : 'text-[#e5e5e5]'}`}
                onClick={() => i18n.changeLanguage('es')}
                data-testid="admin-lang-es"
              >
                ES
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`text-sm ${i18n.language === 'en' ? 'text-[#f4c542] font-bold' : 'text-[#e5e5e5]'}`}
                onClick={() => i18n.changeLanguage('en')}
                data-testid="admin-lang-en"
              >
                EN
              </Button>
            </div>
            <Button
              variant="ghost"
              className="text-[#e5e5e5] hover:text-[#f4c542]"
              onClick={() => navigate("/")}
              data-testid="nav-home-btn"
            >
              {t('admin.home')}
            </Button>
            <Button
              className="btn-secondary"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              {t('admin.logout')}
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-8 bg-[#1a1a1b] border border-[#f4c542]/20 mb-8">
              <TabsTrigger
                value="teams"
                className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                data-testid="teams-tab"
              >
                {t('admin.teams')}
              </TabsTrigger>
              <TabsTrigger
                value="players"
                className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                data-testid="players-tab"
              >
                {t('admin.players')}
              </TabsTrigger>
              <TabsTrigger
                value="fixtures"
                className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                data-testid="fixtures-tab"
              >
                {t('admin.fixtures')}
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                data-testid="users-tab"
              >
                {t('admin.users')}
              </TabsTrigger>
              <TabsTrigger
                value="copa"
                className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                data-testid="copa-tab"
              >
                {t('admin.copa')}
              </TabsTrigger>
              <TabsTrigger
                value="sanctions"
                className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                data-testid="sanctions-tab"
              >
                {t('admin.sanctions')}
              </TabsTrigger>
              <TabsTrigger
                value="instagram"
                className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                data-testid="instagram-tab"
              >
                {t('admin.instagram')}
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                data-testid="settings-tab"
              >
                {t('admin.settings', 'Settings')}
              </TabsTrigger>
            </TabsList>

            {/* Teams Tab */}
            <TabsContent value="teams">
              <Card className="glass-card border-[#f4c542]/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl text-[#f4c542]">{t('admin.teamsManagement')}</CardTitle>
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
                    <CardTitle className="text-2xl text-[#f4c542]">{t('admin.playersManagement')}</CardTitle>
                    <Button className="btn-primary" onClick={() => setShowPlayerModal(true)} data-testid="add-player-btn">
                      + Add Player
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center text-[#f4c542]">Loading...</div>
                  ) : (
                    <Accordion type="multiple" className="w-full space-y-2">
                      {teams.map((team) => {
                        const teamPlayers = players.filter(p => p.team_id === team.id);
                        return (
                          <AccordionItem
                            key={team.id}
                            value={team.id}
                            className="border border-[#f4c542]/20 rounded-lg bg-[#0f0f10]/30 overflow-hidden"
                            data-testid={`team-folder-${team.id}`}
                          >
                            <AccordionTrigger className="px-4 hover:no-underline hover:bg-[#f4c542]/5">
                              <div className="flex items-center gap-4 w-full">
                                {team.logo_url && (
                                  <img 
                                    src={team.logo_url} 
                                    alt={`${team.name} logo`}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-[#f4c542]/20"
                                    data-testid={`team-folder-logo-${team.id}`}
                                  />
                                )}
                                <div className="flex-1 text-left">
                                  <p className="text-[#e5e5e5] font-semibold text-base" data-testid={`team-folder-name-${team.id}`}>
                                    {team.name}
                                  </p>
                                  <p className="text-sm text-[#b5b5b5]" data-testid={`team-folder-info-${team.id}`}>
                                    Division {team.division} • {teamPlayers.length} player{teamPlayers.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="space-y-3 mt-2">
                                {teamPlayers.length === 0 ? (
                                  <p className="text-center text-[#b5b5b5] py-4" data-testid={`no-players-${team.id}`}>
                                    No players in this team yet
                                  </p>
                                ) : (
                                  teamPlayers.map((player) => (
                                    <div
                                      key={player.id}
                                      className="flex justify-between items-center p-3 bg-[#1a1a1b]/50 rounded-lg border border-[#f4c542]/10"
                                      data-testid={`player-item-${player.id}`}
                                    >
                                      <div>
                                        <p className="text-[#e5e5e5] font-semibold" data-testid={`player-name-${player.id}`}>
                                          {player.name} {player.jersey_number && `#${player.jersey_number}`}
                                        </p>
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
                                  ))
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                      {teams.length === 0 && (
                        <p className="text-center text-[#b5b5b5] py-8" data-testid="no-teams">
                          No teams available. Please create teams first.
                        </p>
                      )}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fixtures Tab */}
            <TabsContent value="fixtures">
              <Card className="glass-card border-[#f4c542]/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl text-[#f4c542]">{t('admin.fixturesManagement')}</CardTitle>
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
                    <CardTitle className="text-2xl text-[#f4c542]">{t('admin.usersManagement')}</CardTitle>
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

            {/* Sanctions Tab */}
            <TabsContent value="sanctions">
              <Card className="glass-card border-[#f4c542]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#f4c542]">{t('admin.sanctionsManagement')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center text-[#f4c542]">Loading...</div>
                  ) : (
                    <div className="space-y-6">
                      {/* Red Cards */}
                      <div>
                        <h3 className="text-xl font-bold text-red-500 mb-4">🟥 Red Cards</h3>
                        {sanctions.filter((s) => s.total_red_cards > 0).length > 0 ? (
                          <div className="space-y-3">
                            {sanctions
                              .filter((s) => s.total_red_cards > 0)
                              .map((sanction) => (
                                <div
                                  key={sanction.id}
                                  className="p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                                  data-testid={`sanction-item-${sanction.id}`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="text-[#e5e5e5] font-semibold">
                                        {sanction.player_name} - {sanction.team_name}
                                      </p>
                                      <p className="text-sm text-[#b5b5b5]">
                                        🟥 Red Cards: {sanction.total_red_cards} | 🟨 Yellow Cards: {sanction.total_yellow_cards}
                                      </p>
                                      {sanction.suspension_games ? (
                                        <div className="mt-2 p-2 bg-red-500/10 rounded">
                                          <p className="text-red-500 font-semibold">
                                            Suspended: {sanction.suspension_games} games
                                          </p>
                                          {sanction.suspension_from_week && sanction.suspension_to_week && (
                                            <p className="text-sm text-[#e5e5e5]">
                                              Weeks: {sanction.suspension_from_week} - {sanction.suspension_to_week}
                                            </p>
                                          )}
                                          {sanction.notes && (
                                            <p className="text-xs text-[#b5b5b5] mt-1">{sanction.notes}</p>
                                          )}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-yellow-500 mt-2">⚠️ Suspension not set</p>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      className="btn-secondary"
                                      onClick={() => {
                                        setSanctionForm({
                                          player_id: sanction.player_id,
                                          suspension_games: sanction.suspension_games?.toString() || "",
                                          suspension_from_week: sanction.suspension_from_week?.toString() || "",
                                          suspension_to_week: sanction.suspension_to_week?.toString() || "",
                                          notes: sanction.notes || "",
                                        });
                                        setShowSanctionModal(true);
                                      }}
                                      data-testid={`edit-sanction-${sanction.id}`}
                                    >
                                      Edit Suspension
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-[#b5b5b5]">No red cards recorded</p>
                        )}
                      </div>

                      {/* Yellow Cards */}
                      <div>
                        <h3 className="text-xl font-bold text-yellow-500 mb-4">🟨 Yellow Cards</h3>
                        {sanctions.filter((s) => s.total_yellow_cards > 0 && s.total_red_cards === 0).length > 0 ? (
                          <div className="space-y-2">
                            {sanctions
                              .filter((s) => s.total_yellow_cards > 0 && s.total_red_cards === 0)
                              .map((sanction) => (
                                <div
                                  key={sanction.id}
                                  className="p-3 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-[#e5e5e5]">
                                        {sanction.player_name} - {sanction.team_name}
                                      </p>
                                      <p className="text-sm text-yellow-500">
                                        🟨 Yellow Cards: {sanction.total_yellow_cards}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-[#b5b5b5]">No yellow cards recorded</p>
                        )}
                      </div>
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
                    <CardTitle className="text-2xl text-[#f4c542]">{t('admin.instagramPosts')}</CardTitle>
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

            {/* Copa Tab */}
            <TabsContent value="copa">
              <div className="space-y-8">
                {/* {t('admin.copaGroups')} */}
                <Card className="glass-card border-[#f4c542]/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl text-[#f4c542]">{t('admin.copaGroups')}</CardTitle>
                      <Button className="btn-primary" onClick={() => setShowCopaGroupModal(true)} data-testid="add-copa-group-btn">
                        + Add/Edit Group
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center text-[#f4c542]">Loading...</div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {["A", "B", "C", "D"].map((groupName) => {
                          const group = copaGroups.find((g) => g.group_name === groupName);
                          return (
                            <div
                              key={groupName}
                              className="p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                              data-testid={`copa-group-${groupName}`}
                            >
                              <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xl font-bold text-[#f4c542]">Group {groupName}</h3>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="btn-secondary"
                                    onClick={() => {
                                      const existingGroup = copaGroups.find((g) => g.group_name === groupName);
                                      setCopaGroupForm({
                                        group_name: groupName,
                                        team_ids: existingGroup?.team_ids || [],
                                      });
                                      setShowCopaGroupModal(true);
                                    }}
                                    data-testid={`edit-copa-group-${groupName}`}
                                  >
                                    Edit
                                  </Button>
                                  {group && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteCopaGroup(groupName)}
                                      data-testid={`delete-copa-group-${groupName}`}
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              </div>
                              {group && group.team_ids.length > 0 ? (
                                <div className="space-y-2">
                                  {group.team_ids.map((teamId) => (
                                    <div key={teamId} className="text-[#e5e5e5] text-sm">
                                      • {getTeamName(teamId)}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[#b5b5b5] text-sm">No teams assigned yet</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* {t('admin.copaFixtures')} */}
                <Card className="glass-card border-[#f4c542]/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl text-[#f4c542]">{t('admin.copaFixtures')}</CardTitle>
                      <Button className="btn-primary" onClick={() => setShowCopaFixtureModal(true)} data-testid="add-copa-fixture-btn">
                        + Add Fixture
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center text-[#f4c542]">Loading...</div>
                    ) : (
                      <div className="space-y-4">
                        {copaFixtures.map((fixture) => (
                          <div
                            key={fixture.id}
                            className="p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                            data-testid={`copa-fixture-item-${fixture.id}`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-[#e5e5e5] font-semibold">
                                  {getTeamName(fixture.home_team_id)} vs {getTeamName(fixture.away_team_id)}
                                </p>
                                <p className="text-sm text-[#b5b5b5]">
                                  Group {fixture.group_name} • Jornada {fixture.jornada}
                                </p>
                                {fixture.status === "completed" && (
                                  <p className="text-[#f4c542] font-bold">
                                    Score: {fixture.home_score} - {fixture.away_score}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCopaFixture(fixture.id)}
                                data-testid={`delete-copa-fixture-${fixture.id}`}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                        {copaFixtures.length === 0 && (
                          <p className="text-center text-[#b5b5b5]">No Copa fixtures added yet</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Copa Brackets */}
                <Card className="glass-card border-[#f4c542]/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl text-[#f4c542]">{t('admin.copaBrackets')}</CardTitle>
                      <Button className="btn-primary" onClick={() => setShowCopaBracketModal(true)} data-testid="add-copa-bracket-btn">
                        + Add Bracket Match
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center text-[#f4c542]">Loading...</div>
                    ) : (
                      <div className="space-y-6">
                        {["round_of_16", "quarter_final", "semi_final", "final"].map((roundType) => {
                          const roundBrackets = copaBrackets.filter((b) => b.round_type === roundType);
                          const roundLabel = {
                            round_of_16: "Round of 16",
                            quarter_final: "Quarter Finals",
                            semi_final: "Semi Finals",
                            final: "Final",
                          }[roundType];

                          return (
                            <div key={roundType}>
                              <h3 className="text-lg font-bold text-[#f4c542] mb-3">{roundLabel}</h3>
                              {roundBrackets.length > 0 ? (
                                <div className="space-y-3">
                                  {roundBrackets.map((bracket) => (
                                    <div
                                      key={bracket.id}
                                      className="p-4 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10"
                                      data-testid={`copa-bracket-${bracket.id}`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <p className="text-[#e5e5e5]">
                                            {bracket.home_team_id ? getTeamName(bracket.home_team_id) : "TBD"} vs{" "}
                                            {bracket.away_team_id ? getTeamName(bracket.away_team_id) : "TBD"}
                                          </p>
                                          {bracket.status === "completed" && (
                                            <p className="text-[#f4c542] text-sm">
                                              Score: {bracket.home_score} - {bracket.away_score}
                                            </p>
                                          )}
                                        </div>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => handleDeleteCopaBracket(bracket.id)}
                                          data-testid={`delete-copa-bracket-${bracket.id}`}
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[#b5b5b5] text-sm">No {roundLabel.toLowerCase()} matches added yet</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="glass-card border-[#f4c542]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#f4c542]">
                    {t('admin.settings', 'Settings')} - {t('admin.logoManagement', 'Logo Management')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Logo Preview */}
                    <div>
                      <Label className="text-[#e5e5e5] mb-2 block">
                        {t('admin.currentLogo', 'Current Logo')}
                      </Label>
                      <div className="p-6 bg-[#0f0f10]/50 rounded-lg border border-[#f4c542]/10 flex items-center justify-center">
                        <img
                          src={logoUrl}
                          alt="League Logo"
                          className="w-32 h-32 object-contain"
                          onError={(e) => {
                            e.target.src = "https://em-content.zobj.net/source/apple/391/soccer-ball_26bd.png";
                          }}
                        />
                      </div>
                    </div>

                    {/* Update Logo */}
                    <div>
                      <Label className="text-[#e5e5e5] mb-2 block">
                        {t('admin.updateLogo', 'Update Logo URL')}
                      </Label>
                      <div className="flex gap-4">
                        <Input
                          value={newLogoUrl}
                          onChange={(e) => setNewLogoUrl(e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="input-field flex-1"
                        />
                        <Button
                          className="btn-primary"
                          onClick={() => {
                            if (newLogoUrl.trim()) {
                              setLogoUrl(newLogoUrl);
                              localStorage.setItem('leagueLogo', newLogoUrl);
                              toast.success(t('admin.logoUpdated', 'Logo updated successfully'));
                              setNewLogoUrl("");
                            }
                          }}
                        >
                          {t('admin.update', 'Update')}
                        </Button>
                      </div>
                      <p className="text-xs text-[#b5b5b5] mt-2">
                        {t('admin.logoUrlDesc', 'Enter the URL of the logo image (PNG, JPG, SVG supported). Recommended size: 200x200px')}
                      </p>
                    </div>

                    {/* Reset to Default */}
                    <div>
                      <Button
                        variant="outline"
                        className="border-[#f4c542]/20 text-[#f4c542] hover:bg-[#f4c542]/10"
                        onClick={() => {
                          const defaultLogo = "https://em-content.zobj.net/source/apple/391/soccer-ball_26bd.png";
                          setLogoUrl(defaultLogo);
                          localStorage.setItem('leagueLogo', defaultLogo);
                          toast.success(t('admin.logoReset', 'Logo reset to default'));
                        }}
                      >
                        {t('admin.resetToDefault', 'Reset to Default Logo')}
                      </Button>
                    </div>
                  </div>
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

      {/* Copa Group Modal */}
      <Dialog open={showCopaGroupModal} onOpenChange={setShowCopaGroupModal}>
        <DialogContent className="bg-[#1a1a1b] border border-[#f4c542]/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#f4c542]">
              Manage Copa Group {copaGroupForm.group_name}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const existingGroup = copaGroups.find((g) => g.group_name === copaGroupForm.group_name);
              if (existingGroup) {
                handleUpdateCopaGroup(copaGroupForm.group_name);
              } else {
                handleCreateCopaGroup(e);
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label className="text-[#e5e5e5]">Group Name</Label>
              <Select
                value={copaGroupForm.group_name}
                onValueChange={(v) => {
                  const existingGroup = copaGroups.find((g) => g.group_name === v);
                  setCopaGroupForm({
                    group_name: v,
                    team_ids: existingGroup?.team_ids || [],
                  });
                }}
              >
                <SelectTrigger className="input-field" data-testid="copa-group-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  <SelectItem value="A">Group A</SelectItem>
                  <SelectItem value="B">Group B</SelectItem>
                  <SelectItem value="C">Group C</SelectItem>
                  <SelectItem value="D">Group D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#e5e5e5] mb-2 block">Select Teams (Select 6 teams)</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto p-2 border border-[#f4c542]/20 rounded">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`team-${team.id}`}
                      checked={copaGroupForm.team_ids.includes(team.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCopaGroupForm({
                            ...copaGroupForm,
                            team_ids: [...copaGroupForm.team_ids, team.id],
                          });
                        } else {
                          setCopaGroupForm({
                            ...copaGroupForm,
                            team_ids: copaGroupForm.team_ids.filter((id) => id !== team.id),
                          });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`team-${team.id}`} className="text-[#e5e5e5] cursor-pointer">
                      {team.name} (Division {team.division})
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#b5b5b5] mt-2">
                Selected: {copaGroupForm.team_ids.length} / 6 teams
              </p>
            </div>
            <Button type="submit" className="btn-primary w-full" data-testid="save-copa-group-btn">
              Save Group
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Copa Fixture Modal */}
      <Dialog open={showCopaFixtureModal} onOpenChange={setShowCopaFixtureModal}>
        <DialogContent className="bg-[#1a1a1b] border border-[#f4c542]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#f4c542]">Add Copa Fixture</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCopaFixture} className="space-y-4">
            <div>
              <Label className="text-[#e5e5e5]">Group</Label>
              <Select
                value={copaFixtureForm.group_name}
                onValueChange={(v) => setCopaFixtureForm({ ...copaFixtureForm, group_name: v })}
              >
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  <SelectItem value="A">Group A</SelectItem>
                  <SelectItem value="B">Group B</SelectItem>
                  <SelectItem value="C">Group C</SelectItem>
                  <SelectItem value="D">Group D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Jornada</Label>
              <Select
                value={copaFixtureForm.jornada.toString()}
                onValueChange={(v) => setCopaFixtureForm({ ...copaFixtureForm, jornada: parseInt(v) })}
              >
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <SelectItem key={j} value={j.toString()}>
                      Jornada {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Home Team</Label>
              <Select
                value={copaFixtureForm.home_team_id}
                onValueChange={(v) => setCopaFixtureForm({ ...copaFixtureForm, home_team_id: v })}
              >
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select home team" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Away Team</Label>
              <Select
                value={copaFixtureForm.away_team_id}
                onValueChange={(v) => setCopaFixtureForm({ ...copaFixtureForm, away_team_id: v })}
              >
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select away team" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
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
                value={copaFixtureForm.match_date}
                onChange={(e) => setCopaFixtureForm({ ...copaFixtureForm, match_date: e.target.value })}
                required
                className="input-field"
              />
            </div>
            <Button type="submit" className="btn-primary w-full">
              Create Fixture
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Copa Bracket Modal */}
      <Dialog open={showCopaBracketModal} onOpenChange={setShowCopaBracketModal}>
        <DialogContent className="bg-[#1a1a1b] border border-[#f4c542]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#f4c542]">Add Knockout Bracket Match</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCopaBracket} className="space-y-4">
            <div>
              <Label className="text-[#e5e5e5]">Round Type</Label>
              <Select
                value={copaBracketForm.round_type}
                onValueChange={(v) => setCopaBracketForm({ ...copaBracketForm, round_type: v })}
              >
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  <SelectItem value="round_of_16">Round of 16</SelectItem>
                  <SelectItem value="quarter_final">Quarter Final</SelectItem>
                  <SelectItem value="semi_final">Semi Final</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Match Position</Label>
              <Input
                type="number"
                value={copaBracketForm.match_position}
                onChange={(e) => setCopaBracketForm({ ...copaBracketForm, match_position: parseInt(e.target.value) })}
                required
                min="1"
                className="input-field"
                placeholder="1, 2, 3..."
              />
              <p className="text-xs text-[#b5b5b5] mt-1">
                Position in the bracket (1-8 for R16, 1-4 for QF, 1-2 for SF, 1 for Final)
              </p>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Home Team (Optional)</Label>
              <Select
                value={copaBracketForm.home_team_id}
                onValueChange={(v) => setCopaBracketForm({ ...copaBracketForm, home_team_id: v })}
              >
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select home team or leave as TBD" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  <SelectItem value="">TBD</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Away Team (Optional)</Label>
              <Select
                value={copaBracketForm.away_team_id}
                onValueChange={(v) => setCopaBracketForm({ ...copaBracketForm, away_team_id: v })}
              >
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select away team or leave as TBD" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1b] border-[#f4c542]/20">
                  <SelectItem value="">TBD</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Match Date (Optional)</Label>
              <Input
                type="datetime-local"
                value={copaBracketForm.match_date}
                onChange={(e) => setCopaBracketForm({ ...copaBracketForm, match_date: e.target.value })}
                className="input-field"
              />
            </div>
            <Button type="submit" className="btn-primary w-full">
              Create Bracket Match
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sanction Modal */}
      <Dialog open={showSanctionModal} onOpenChange={setShowSanctionModal}>
        <DialogContent className="bg-[#1a1a1b] border border-[#f4c542]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#f4c542]">Edit Player Suspension</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSanction} className="space-y-4">
            <div>
              <Label className="text-[#e5e5e5]">Suspension Games</Label>
              <Input
                type="number"
                value={sanctionForm.suspension_games}
                onChange={(e) => setSanctionForm({ ...sanctionForm, suspension_games: e.target.value })}
                placeholder="Number of games (e.g., 1, 2, 3)"
                min="0"
                className="input-field"
                data-testid="suspension-games-input"
              />
              <p className="text-xs text-[#b5b5b5] mt-1">
                How many games the player will be suspended
              </p>
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Suspension From Week</Label>
              <Input
                type="number"
                value={sanctionForm.suspension_from_week}
                onChange={(e) => setSanctionForm({ ...sanctionForm, suspension_from_week: e.target.value })}
                placeholder="Starting week number"
                min="1"
                max="22"
                className="input-field"
                data-testid="suspension-from-week-input"
              />
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Suspension To Week</Label>
              <Input
                type="number"
                value={sanctionForm.suspension_to_week}
                onChange={(e) => setSanctionForm({ ...sanctionForm, suspension_to_week: e.target.value })}
                placeholder="Ending week number"
                min="1"
                max="22"
                className="input-field"
                data-testid="suspension-to-week-input"
              />
            </div>
            <div>
              <Label className="text-[#e5e5e5]">Notes (Optional)</Label>
              <Input
                value={sanctionForm.notes}
                onChange={(e) => setSanctionForm({ ...sanctionForm, notes: e.target.value })}
                placeholder="Additional notes about the suspension"
                className="input-field"
                data-testid="suspension-notes-input"
              />
            </div>
            <Button type="submit" className="btn-primary w-full" data-testid="save-sanction-btn">
              Save Suspension
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;