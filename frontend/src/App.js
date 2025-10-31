import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "./i18n"; // Import i18n configuration
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFixtureEdit from "./pages/AdminFixtureEdit";
import TeamDashboard from "./pages/TeamDashboard";
import FixturesPage from "./pages/FixturesPage";
import StandingsPage from "./pages/StandingsPage";
import TopScorersPage from "./pages/TopScorersPage";
import CopaPage from "./pages/CopaPage";
import SanctionsPage from "./pages/SanctionsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f10] to-[#1a1a1b] flex items-center justify-center">
        <div className="text-[#f4c542] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/" element={<HomePage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? (
                  <AdminDashboard user={user} setUser={setUser} />
                ) : (
                  <Navigate to="/login" />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fixture/:fixtureId"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? (
                  <AdminFixtureEdit user={user} setUser={setUser} />
                ) : (
                  <Navigate to="/login" />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                {user?.role === "team" ? (
                  <TeamDashboard user={user} setUser={setUser} />
                ) : (
                  <Navigate to="/login" />
                )}
              </ProtectedRoute>
            }
          />
          <Route path="/fixtures" element={<FixturesPage />} />
          <Route path="/standings" element={<StandingsPage />} />
          <Route path="/top-scorers" element={<TopScorersPage />} />
          <Route path="/copa" element={<CopaPage />} />
          <Route path="/sanctions" element={<SanctionsPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;