import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const SharedNavigation = ({ currentPage }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get logo settings from localStorage or use defaults
  const logoUrl = localStorage.getItem('leagueLogo') || "https://customer-assets.emergentagent.com/job_veteran-league/artifacts/4py6oacw_Screenshot%202025-10-31%20at%2017.19.50.png";
  const logoWidth = parseInt(localStorage.getItem('logoWidth')) || 50;
  const logoHeight = parseInt(localStorage.getItem('logoHeight')) || 50;

  return (
    <nav className="navbar fixed w-full top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src={logoUrl}
            alt="Liga Veteranos Logroño Logo"
            style={{ width: `${logoWidth}px`, height: `${logoHeight}px` }}
            className="object-contain"
            onError={(e) => {
              e.target.src = "https://customer-assets.emergentagent.com/job_veteran-league/artifacts/4py6oacw_Screenshot%202025-10-31%20at%2017.19.50.png";
            }}
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
            className={`${currentPage === 'fixtures' ? 'text-[#f4c542]' : 'text-[#e5e5e5]'} hover:text-[#f4c542]`}
            onClick={() => navigate("/fixtures")}
          >
            {t('fixtures')}
          </Button>
          <Button
            variant="ghost"
            className={`${currentPage === 'standings' ? 'text-[#f4c542]' : 'text-[#e5e5e5]'} hover:text-[#f4c542]`}
            onClick={() => navigate("/standings")}
          >
            {t('standings')}
          </Button>
          <Button
            variant="ghost"
            className={`${currentPage === 'top-scorers' ? 'text-[#f4c542]' : 'text-[#e5e5e5]'} hover:text-[#f4c542]`}
            onClick={() => navigate("/top-scorers")}
          >
            {t('topScorers')}
          </Button>
          <Button
            variant="ghost"
            className={`${currentPage === 'copa' ? 'text-[#f4c542]' : 'text-[#e5e5e5]'} hover:text-[#f4c542]`}
            onClick={() => navigate("/copa")}
          >
            {t('copa', 'Copa')}
          </Button>
          <Button
            variant="ghost"
            className={`${currentPage === 'sanctions' ? 'text-[#f4c542]' : 'text-[#e5e5e5]'} hover:text-[#f4c542]`}
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
              className={`w-full text-left ${currentPage === 'fixtures' ? 'text-[#f4c542]' : 'text-[#e5e5e5]'} hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start`}
              onClick={() => { navigate("/fixtures"); setMobileMenuOpen(false); }}
            >
              ⚽ {t('fixtures')}
            </Button>
            <Button
              variant="ghost"
              className={`w-full text-left ${currentPage === 'standings' ? 'text-[#f4c542]' : 'text-[#e5e5e5]'} hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start`}
              onClick={() => { navigate("/standings"); setMobileMenuOpen(false); }}
            >
              📊 {t('standings')}
            </Button>
            <Button
              variant="ghost"
              className={`w-full text-left ${currentPage === 'top-scorers' ? 'text-[#f4c542]' : 'text-[#e5e5e5]'} hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start`}
              onClick={() => { navigate("/top-scorers"); setMobileMenuOpen(false); }}
            >
              🏆 {t('topScorers')}
            </Button>
            <Button
              variant="ghost"
              className={`w-full text-left ${currentPage === 'copa' ? 'text-[#f4c542]' : 'text-[#e5e5e5]'} hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start`}
              onClick={() => { navigate("/copa"); setMobileMenuOpen(false); }}
            >
              🏅 {t('copa', 'Copa del Veteranos')}
            </Button>
            <Button
              variant="ghost"
              className={`w-full text-left ${currentPage === 'sanctions' ? 'text-[#f4c542]' : 'text-[#e5e5e5]'} hover:text-[#f4c542] hover:bg-[#f4c542]/10 justify-start`}
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
  );
};

export default SharedNavigation;