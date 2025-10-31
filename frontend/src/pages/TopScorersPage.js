import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../App";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SharedNavigation from "../components/SharedNavigation";

const TopScorersPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [topScorers, setTopScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const division1Scorers = topScorers.filter(s => s.division === 1);
  const division2Scorers = topScorers.filter(s => s.division === 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f10] to-[#1a1a1b]">
      {/* Navigation */}
      <nav className="navbar fixed w-full top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="https://em-content.zobj.net/source/apple/391/soccer-ball_26bd.png"
              alt="Logo"
              className="w-10 h-10"
            />
            <h1
              className="text-xl md:text-2xl font-bold text-gradient cursor-pointer"
              onClick={() => navigate("/")}
              data-testid="logo-home-link"
            >
              Liga Veteranos Logroño
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4 items-center">
            <Button
              variant="ghost"
              className="text-[#e5e5e5] hover:text-[#f4c542]"
              onClick={() => navigate("/fixtures")}
            >
              {t('fixtures')}
            </Button>
            <Button
              variant="ghost"
              className="text-[#e5e5e5] hover:text-[#f4c542]"
              onClick={() => navigate("/standings")}
            >
              {t('standings')}
            </Button>
            <Button
              variant="ghost"
              className="text-[#f4c542] hover:text-[#ffd700]"
              onClick={() => navigate("/top-scorers")}
            >
              {t('topScorers')}
            </Button>
            <Button
              variant="ghost"
              className="text-[#e5e5e5] hover:text-[#f4c542]"
              onClick={() => navigate("/copa")}
            >
              {t('copa', 'Copa')}
            </Button>
            <Button
              variant="ghost"
              className="text-[#e5e5e5] hover:text-[#f4c542]"
              onClick={() => navigate("/sanctions")}
            >
              {t('sanctions', 'Sanciones')}
            </Button>

            {/* Language Switcher */}
            <div className="flex gap-2 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className={`text-sm ${i18n.language === 'es' ? 'text-[#f4c542] font-bold' : 'text-[#e5e5e5]'}`}
                onClick={() => i18n.changeLanguage('es')}
              >
                ES
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`text-sm ${i18n.language === 'en' ? 'text-[#f4c542] font-bold' : 'text-[#e5e5e5]'}`}
                onClick={() => i18n.changeLanguage('en')}
              >
                EN
              </Button>
            </div>

            <Button className="btn-primary" onClick={() => navigate("/login")}>
              {t('login')}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden text-[#f4c542]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            ☰
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#1a1a1b] border-t border-[#f4c542]/20 shadow-xl">
            <div className="flex flex-col p-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full text-left text-[#e5e5e5] hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start"
                onClick={() => { navigate("/fixtures"); setMobileMenuOpen(false); }}
              >
                ⚽ {t('fixtures')}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-[#e5e5e5] hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start"
                onClick={() => { navigate("/standings"); setMobileMenuOpen(false); }}
              >
                📊 {t('standings')}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-[#f4c542] hover:text-[#ffd700] hover:bg-[#f4c542]/10 justify-start"
                onClick={() => { navigate("/top-scorers"); setMobileMenuOpen(false); }}
              >
                🏆 {t('topScorers')}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-[#e5e5e5] hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start"
                onClick={() => { navigate("/copa"); setMobileMenuOpen(false); }}
              >
                🏅 {t('copa', 'Copa del Veteranos')}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-[#e5e5e5] hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start"
                onClick={() => { navigate("/sanctions"); setMobileMenuOpen(false); }}
              >
                🟥 {t('sanctions', 'Sanciones')}
              </Button>
              
              <div className="border-t border-[#f4c542]/20 my-2 pt-2">
                <div className="flex gap-2 justify-center mb-2">
                  <Button
                    variant="ghost"
                    className={`text-sm ${i18n.language === 'es' ? 'text-[#f4c542] font-bold' : 'text-[#e5e5e5]'}`}
                    onClick={() => i18n.changeLanguage('es')}
                  >
                    ES
                  </Button>
                  <Button
                    variant="ghost"
                    className={`text-sm ${i18n.language === 'en' ? 'text-[#f4c542] font-bold' : 'text-[#e5e5e5]'}`}
                    onClick={() => i18n.changeLanguage('en')}
                  >
                    EN
                  </Button>
                </div>
                <Button
                  className="btn-primary w-full"
                  onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                >
                  {t('login')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-center">
            <span className="text-gradient">{t('topScorersPageTitle')}</span>
          </h2>

          {loading ? (
            <div className="text-center text-[#f4c542] text-xl">{t('loading')}</div>
          ) : (
            <Tabs defaultValue="division1">
              <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1b] border border-[#f4c542]/20 mb-6">
                <TabsTrigger
                  value="division1"
                  className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                >
                  {t('firstDivision')}
                </TabsTrigger>
                <TabsTrigger
                  value="division2"
                  className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#0f0f10]"
                >
                  {t('secondDivision')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="division1">
                <Card className="glass-card border-[#f4c542]/20">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="table-header">
                            <th className="p-4 text-left">{t('rank')}</th>
                            <th className="p-4 text-left">{t('player')}</th>
                            <th className="p-4 text-left">{t('team')}</th>
                            <th className="p-4 text-center">{t('goals')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {division1Scorers.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="p-8 text-center text-[#b5b5b5]">
                                {t('noGoalsScored')}
                              </td>
                            </tr>
                          ) : (
                            division1Scorers.map((scorer, index) => (
                              <tr key={scorer.player_id} className="table-row">
                                <td className="p-4">
                                  {index === 0 && <span className="text-3xl">🥇</span>}
                                  {index === 1 && <span className="text-3xl">🥈</span>}
                                  {index === 2 && <span className="text-3xl">🥉</span>}
                                  {index > 2 && <span className="text-[#f4c542] font-bold">{index + 1}</span>}
                                </td>
                                <td className="p-4 text-[#e5e5e5] font-semibold">{scorer.player_name}</td>
                                <td className="p-4 text-[#b5b5b5]">{scorer.team_name}</td>
                                <td className="p-4 text-center">
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
              </TabsContent>

              <TabsContent value="division2">
                <Card className="glass-card border-[#f4c542]/20">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="table-header">
                            <th className="p-4 text-left">{t('rank')}</th>
                            <th className="p-4 text-left">{t('player')}</th>
                            <th className="p-4 text-left">{t('team')}</th>
                            <th className="p-4 text-center">{t('goals')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {division2Scorers.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="p-8 text-center text-[#b5b5b5]">
                                {t('noGoalsScored')}
                              </td>
                            </tr>
                          ) : (
                            division2Scorers.map((scorer, index) => (
                              <tr key={scorer.player_id} className="table-row">
                                <td className="p-4">
                                  {index === 0 && <span className="text-3xl">🥇</span>}
                                  {index === 1 && <span className="text-3xl">🥈</span>}
                                  {index === 2 && <span className="text-3xl">🥉</span>}
                                  {index > 2 && <span className="text-[#f4c542] font-bold">{index + 1}</span>}
                                </td>
                                <td className="p-4 text-[#e5e5e5] font-semibold">{scorer.player_name}</td>
                                <td className="p-4 text-[#b5b5b5]">{scorer.team_name}</td>
                                <td className="p-4 text-center">
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
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopScorersPage;