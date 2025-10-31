import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../App";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const SanctionsPage = () => {
  const { t } = useTranslation();
  const [sanctions, setSanctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSanctions();
  }, []);

  const fetchSanctions = async () => {
    setLoading(true);
    try {
      const response = await api.get("/sanctions");
      setSanctions(response.data);
    } catch (error) {
      toast.error("Failed to load sanctions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const yellowCardPlayers = sanctions.filter((s) => s.total_yellow_cards > 0 && s.total_red_cards === 0);
  const redCardPlayers = sanctions.filter((s) => s.total_red_cards > 0);

  const isPlayerSuspended = (sanction) => {
    if (!sanction.suspension_from_week || !sanction.suspension_to_week) return false;
    // You could add current week logic here
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f10] to-[#1a1a1b] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient mb-4">
            {t("sanctions.title", "Sanciones / Sanctions")}
          </h1>
          <p className="text-[#b5b5b5] text-lg">
            {t("sanctions.subtitle", "Jugadores con tarjetas amarillas y rojas / Players with yellow and red cards")}
          </p>
        </div>

        <div className="space-y-8">
          {/* Red Cards Section */}
          <Card className="glass-card border-[#f4c542]/20">
            <CardHeader>
              <CardTitle className="text-2xl text-red-500">
                🟥 {t("sanctions.redCards", "Tarjetas Rojas / Red Cards")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-[#f4c542] py-8">Loading...</div>
              ) : redCardPlayers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#f4c542]/20">
                        <th className="text-left py-3 px-4 text-[#f4c542] font-semibold">
                          {t("sanctions.player", "Jugador / Player")}
                        </th>
                        <th className="text-left py-3 px-4 text-[#f4c542] font-semibold">
                          {t("sanctions.team", "Equipo / Team")}
                        </th>
                        <th className="text-center py-3 px-2 text-[#f4c542] font-semibold">
                          {t("sanctions.redCardsCount", "Rojas / Red")}
                        </th>
                        <th className="text-center py-3 px-2 text-[#f4c542] font-semibold">
                          {t("sanctions.yellowCardsCount", "Amarillas / Yellow")}
                        </th>
                        <th className="text-center py-3 px-4 text-[#f4c542] font-semibold">
                          {t("sanctions.suspension", "Suspensión / Suspension")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {redCardPlayers.map((sanction) => (
                        <tr
                          key={sanction.id}
                          className="border-b border-[#f4c542]/10 hover:bg-[#f4c542]/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-[#e5e5e5]">{sanction.player_name}</td>
                          <td className="py-3 px-4 text-[#e5e5e5]">{sanction.team_name}</td>
                          <td className="text-center py-3 px-2 text-red-500 font-bold">
                            {sanction.total_red_cards}
                          </td>
                          <td className="text-center py-3 px-2 text-yellow-500 font-bold">
                            {sanction.total_yellow_cards}
                          </td>
                          <td className="text-center py-3 px-4">
                            {sanction.suspension_games ? (
                              <div className="text-[#e5e5e5]">
                                <p className="font-semibold text-red-500">
                                  {sanction.suspension_games} {t("sanctions.games", "partidos / games")}
                                </p>
                                {sanction.suspension_from_week && sanction.suspension_to_week && (
                                  <p className="text-sm text-[#b5b5b5]">
                                    {t("sanctions.weeks", "Semanas / Weeks")} {sanction.suspension_from_week} - {sanction.suspension_to_week}
                                  </p>
                                )}
                                {sanction.notes && (
                                  <p className="text-xs text-[#b5b5b5] mt-1">{sanction.notes}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#b5b5b5]">
                                {t("sanctions.pending", "Pendiente / Pending")}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-[#b5b5b5] py-8">
                  {t("sanctions.noRedCards", "No hay tarjetas rojas / No red cards")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Yellow Cards Section */}
          <Card className="glass-card border-[#f4c542]/20">
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-500">
                🟨 {t("sanctions.yellowCards", "Tarjetas Amarillas / Yellow Cards")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-[#f4c542] py-8">Loading...</div>
              ) : yellowCardPlayers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#f4c542]/20">
                        <th className="text-left py-3 px-4 text-[#f4c542] font-semibold">
                          {t("sanctions.player", "Jugador / Player")}
                        </th>
                        <th className="text-left py-3 px-4 text-[#f4c542] font-semibold">
                          {t("sanctions.team", "Equipo / Team")}
                        </th>
                        <th className="text-center py-3 px-2 text-[#f4c542] font-semibold">
                          {t("sanctions.yellowCardsCount", "Amarillas / Yellow")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {yellowCardPlayers.map((sanction) => (
                        <tr
                          key={sanction.id}
                          className="border-b border-[#f4c542]/10 hover:bg-[#f4c542]/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-[#e5e5e5]">{sanction.player_name}</td>
                          <td className="py-3 px-4 text-[#e5e5e5]">{sanction.team_name}</td>
                          <td className="text-center py-3 px-2 text-yellow-500 font-bold">
                            {sanction.total_yellow_cards}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-[#b5b5b5] py-8">
                  {t("sanctions.noYellowCards", "No hay tarjetas amarillas / No yellow cards")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SanctionsPage;
