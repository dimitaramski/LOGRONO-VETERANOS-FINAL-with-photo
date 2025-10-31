import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "../App";
import { toast } from "sonner";

const HomePage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    fetchInstagramPosts();
  }, []);

  const fetchInstagramPosts = async () => {
    try {
      const response = await api.get("/instagram-posts");
      setInstagramPosts(response.data);
    } catch (error) {
      console.error("Failed to load Instagram posts");
    }
  };

  const getInstagramEmbedUrl = (url) => {
    // Convert Instagram URL to embed URL
    if (url.includes("/p/") || url.includes("/reel/")) {
      return url.endsWith("/") ? `${url}embed` : `${url}/embed`;
    }
    return url;
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/subscriptions/create", {
        email,
        season: "2024-2025",
      });
      toast.success("Subscription successful! Welcome to Liga Veteranos Logroño");
      setShowSubscribe(false);
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f10] to-[#1a1a1b]">
      {/* Navigation */}
      <nav className="navbar fixed w-full top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_ligaveteranos/artifacts/cxk15ekf_Screenshot%202025-10-31%20at%2012.07.51.png"
              alt="Liga Veteranos Logo" 
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-[#f4c542]"
              data-testid="league-logo"
            />
            <h1 className="text-lg sm:text-2xl font-bold text-gradient">Liga Veteranos Logroño</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4 items-center">
            <Button
              variant="ghost"
              className="text-[#e5e5e5] hover:text-[#f4c542]"
              onClick={() => navigate("/fixtures")}
              data-testid="nav-fixtures-btn"
            >
              {t('fixtures')}
            </Button>
            <Button
              variant="ghost"
              className="text-[#e5e5e5] hover:text-[#f4c542]"
              onClick={() => navigate("/standings")}
              data-testid="nav-standings-btn"
            >
              {t('standings')}
            </Button>
            <Button
              variant="ghost"
              className="text-[#e5e5e5] hover:text-[#f4c542]"
              onClick={() => navigate("/top-scorers")}
              data-testid="nav-top-scorers-btn"
            >
              {t('topScorers')}
            </Button>
            <Button
              variant="ghost"
              className="text-[#e5e5e5] hover:text-[#f4c542]"
              onClick={() => navigate("/copa")}
              data-testid="nav-copa-btn"
            >
              {t('copa', 'Copa')}
            </Button>
            <Button
              variant="ghost"
              className="text-[#e5e5e5] hover:text-[#f4c542]"
              onClick={() => navigate("/sanctions")}
              data-testid="nav-sanctions-btn"
            >
              {t('sanctions', 'Sanciones')}
            </Button>
            
            {/* Language Switcher */}
            <div className="flex gap-1 ml-2 border-l border-[#f4c542]/30 pl-4">
              <Button
                variant="ghost"
                size="sm"
                className={`text-sm ${i18n.language === 'es' ? 'text-[#f4c542] font-bold' : 'text-[#b5b5b5]'}`}
                onClick={() => changeLanguage('es')}
                data-testid="lang-es-btn"
              >
                ES
              </Button>
              <span className="text-[#b5b5b5]">/</span>
              <Button
                variant="ghost"
                size="sm"
                className={`text-sm ${i18n.language === 'en' ? 'text-[#f4c542] font-bold' : 'text-[#b5b5b5]'}`}
                onClick={() => changeLanguage('en')}
                data-testid="lang-en-btn"
              >
                EN
              </Button>
            </div>
            
            <Button
              className="btn-primary"
              onClick={() => navigate("/login")}
              data-testid="nav-login-btn"
            >
              {t('login')}
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-[#f4c542] focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#1a1a1b] border-t border-[#f4c542]/20 shadow-xl">
            <div className="flex flex-col p-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full text-left text-[#e5e5e5] hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start"
                onClick={() => { navigate("/fixtures"); setMobileMenuOpen(false); }}
                data-testid="mobile-fixtures-btn"
              >
                ⚽ {t('fixtures')}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-[#e5e5e5] hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start"
                onClick={() => { navigate("/standings"); setMobileMenuOpen(false); }}
                data-testid="mobile-standings-btn"
              >
                📊 {t('standings')}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-[#e5e5e5] hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start"
                onClick={() => { navigate("/top-scorers"); setMobileMenuOpen(false); }}
                data-testid="mobile-top-scorers-btn"
              >
                🏆 {t('topScorers')}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-[#e5e5e5] hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start"
                onClick={() => { navigate("/copa"); setMobileMenuOpen(false); }}
                data-testid="mobile-copa-btn"
              >
                🏅 {t('copa', 'Copa del Veteranos')}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-[#e5e5e5] hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start"
                onClick={() => { navigate("/sanctions"); setMobileMenuOpen(false); }}
                data-testid="mobile-sanctions-btn"
              >
                🟥 {t('sanctions', 'Sanciones')}
              </Button>
              
              <div className="border-t border-[#f4c542]/20 my-2 pt-2">
                <p className="text-[#b5b5b5] text-sm mb-2 px-3">Idioma / Language</p>
                <div className="flex gap-2">
                  <Button
                    variant={i18n.language === 'es' ? 'default' : 'ghost'}
                    className={`flex-1 ${i18n.language === 'es' ? 'bg-[#f4c542] text-[#0f0f10]' : 'text-[#e5e5e5]'}`}
                    onClick={() => changeLanguage('es')}
                    data-testid="mobile-lang-es"
                  >
                    🇪🇸 Español
                  </Button>
                  <Button
                    variant={i18n.language === 'en' ? 'default' : 'ghost'}
                    className={`flex-1 ${i18n.language === 'en' ? 'bg-[#f4c542] text-[#0f0f10]' : 'text-[#e5e5e5]'}`}
                    onClick={() => changeLanguage('en')}
                    data-testid="mobile-lang-en"
                  >
                    🇬🇧 English
                  </Button>
                </div>
              </div>

              <Button
                className="btn-primary w-full mt-2"
                onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                data-testid="mobile-login-btn"
              >
                {t('login')}
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            {t('welcomeTo')} <span className="text-gradient">{t('ligaVeteranos')}</span>
          </h2>
          <p className="text-lg sm:text-xl text-[#b5b5b5] mb-8 max-w-3xl mx-auto">
            {t('heroText')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              className="btn-primary text-base"
              onClick={() => setShowSubscribe(true)}
              data-testid="hero-subscribe-btn"
            >
              {t('subscribeFor')}
            </Button>
            <Button
              className="btn-secondary text-base"
              onClick={() => navigate("/standings")}
              data-testid="hero-view-standings-btn"
            >
              {t('viewStandings')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div 
            className="glass-card p-8 cursor-pointer transform hover:scale-105 transition-all duration-300" 
            onClick={() => navigate("/fixtures")}
            data-testid="feature-card-fixtures"
          >
            <div className="text-4xl mb-4">⚽</div>
            <h3 className="text-2xl font-bold mb-3 text-[#f4c542]">{t('weeklyFixtures')}</h3>
            <p className="text-[#b5b5b5]">
              {t('weeklyFixturesDesc')}
            </p>
          </div>
          <div 
            className="glass-card p-8 cursor-pointer transform hover:scale-105 transition-all duration-300" 
            onClick={() => navigate("/standings")}
            data-testid="feature-card-standings"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-3 text-[#f4c542]">{t('liveStandings')}</h3>
            <p className="text-[#b5b5b5]">
              {t('liveStandingsDesc')}
            </p>
          </div>
          <div 
            className="glass-card p-8 cursor-pointer transform hover:scale-105 transition-all duration-300" 
            onClick={() => navigate("/top-scorers")}
            data-testid="feature-card-scorers"
          >
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold mb-3 text-[#f4c542]">{t('topScorersTitle')}</h3>
            <p className="text-[#b5b5b5]">
              {t('topScorersDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Divisions Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#0f0f10]/50 to-[#1a1a1b]/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-12">
            {t('twoDivisions')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8" data-testid="division-card-1">
              <h3 className="text-3xl font-bold mb-4 text-[#f4c542]">{t('firstDivision')}</h3>
              <p className="text-[#b5b5b5] mb-4">
                {t('firstDivisionDesc')}
              </p>
              <Button
                className="btn-secondary"
                onClick={() => navigate("/standings")}
                data-testid="view-division-1-btn"
              >
                {t('viewStandings')}
              </Button>
            </div>
            <div className="glass-card p-8" data-testid="division-card-2">
              <h3 className="text-3xl font-bold mb-4 text-[#f4c542]">{t('secondDivision')}</h3>
              <p className="text-[#b5b5b5] mb-4">
                {t('secondDivisionDesc')}
              </p>
              <Button
                className="btn-secondary"
                onClick={() => navigate("/standings")}
                data-testid="view-division-2-btn"
              >
                {t('viewStandings')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Copa del Veteranos Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient">{t('copa.title', 'Copa del Veteranos')}</span>
            </h2>
            <p className="text-[#b5b5b5] text-lg max-w-3xl mx-auto">
              {t('copa.description', 'Tournament competition featuring teams from both divisions competing for the cup')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div 
              className="glass-card p-8 cursor-pointer transform hover:scale-105 transition-all duration-300" 
              onClick={() => navigate("/copa?tab=standings")}
              data-testid="copa-standings-card"
            >
              <div className="text-5xl mb-4">🏅</div>
              <h3 className="text-2xl font-bold mb-3 text-[#f4c542]">{t('copa.groupStandings', 'Group Standings')}</h3>
              <p className="text-[#b5b5b5] mb-4">
                {t('copa.groupStandingsDesc', 'View standings for all four groups (A, B, C, D) and track which teams qualify for knockouts')}
              </p>
              <Button
                className="btn-secondary"
                onClick={(e) => { e.stopPropagation(); navigate("/copa?tab=standings"); }}
                data-testid="copa-view-standings-btn"
              >
                {t('viewStandings')}
              </Button>
            </div>
            <div 
              className="glass-card p-8 cursor-pointer transform hover:scale-105 transition-all duration-300" 
              onClick={() => navigate("/copa?tab=fixtures")}
              data-testid="copa-fixtures-card"
            >
              <div className="text-5xl mb-4">⚽</div>
              <h3 className="text-2xl font-bold mb-3 text-[#f4c542]">{t('copa.fixturesAndBrackets', 'Fixtures & Brackets')}</h3>
              <p className="text-[#b5b5b5] mb-4">
                {t('copa.fixturesDesc', 'Follow group stage matches and knockout brackets from Round of 16 to the Final')}
              </p>
              <Button
                className="btn-secondary"
                onClick={(e) => { e.stopPropagation(); navigate("/copa?tab=fixtures"); }}
                data-testid="copa-view-fixtures-btn"
              >
                {t('viewFixtures')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Blog Section */}
      {instagramPosts.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
              <span className="text-gradient">{t('highlightsStories')}</span>
            </h2>
            <p className="text-center text-[#b5b5b5] mb-12 max-w-2xl mx-auto">
              {t('highlightsDesc')}
            </p>
            
            {/* Horizontal scroll carousel for all screen sizes */}
            <div className="overflow-x-auto pb-4 scrollbar-custom">
              <div className="flex gap-6 px-4" style={{ width: 'max-content' }}>
                {instagramPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="glass-card p-4 flex-shrink-0" 
                    style={{ width: '350px' }} 
                    data-testid={`instagram-post-${post.id}`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-3">
                      <iframe
                        src={getInstagramEmbedUrl(post.instagram_url)}
                        className="w-full h-full"
                        frameBorder="0"
                        scrolling="no"
                        allowTransparency={true}
                        title={`Instagram post ${post.id}`}
                      />
                    </div>
                    {post.description && (
                      <p className="text-[#e5e5e5] text-sm">{post.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scroll hint for users */}
            <div className="text-center mt-4">
              <p className="text-[#b5b5b5] text-sm">{t('scrollMore')}</p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#f4c542]/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[#b5b5b5]">
            © 2024 Liga Veteranos Logroño. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Subscribe Modal */}
      <Dialog open={showSubscribe} onOpenChange={setShowSubscribe}>
        <DialogContent className="bg-[#1a1a1b] border border-[#f4c542]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#f4c542]">
              Subscribe to Liga Veteranos
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#e5e5e5]">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="input-field w-full"
                data-testid="subscribe-email-input"
              />
            </div>
            <div className="p-4 bg-[#f4c542]/10 rounded-lg">
              <p className="text-[#e5e5e5] mb-2">{t('season')} 2024-2025</p>
              <p className="text-2xl font-bold text-[#f4c542]">€50.00</p>
              <p className="text-sm text-[#b5b5b5] mt-1">
                {t('subscriptionDesc', 'Full access to fixtures, standings, and statistics for the entire season')} - {t('perTeam', 'Per Team/Season')}
              </p>
            </div>
            <Button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
              data-testid="subscribe-submit-btn"
            >
              {loading ? "Processing..." : "Complete Subscription"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;