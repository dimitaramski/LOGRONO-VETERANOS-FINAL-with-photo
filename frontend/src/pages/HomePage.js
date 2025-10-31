import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "../App";
import { toast } from "sonner";
import SharedNavigation from "../components/SharedNavigation";

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
      <SharedNavigation currentPage="home" />

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
                onClick={() => navigate("/standings?division=1")}
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
                onClick={() => navigate("/standings?division=2")}
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