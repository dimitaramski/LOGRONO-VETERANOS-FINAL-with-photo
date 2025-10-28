import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../App";
import { toast } from "sonner";

const LoginPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", response.data.access_token);
      setUser(response.data.user);
      toast.success(`Welcome back, ${response.data.user.username}!`);
      
      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/team");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f10] to-[#1a1a1b] flex items-center justify-center px-6">
      <Card className="w-full max-w-md bg-[#1a1a1b] border-[#f4c542]/20">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            <span className="text-gradient">Liga Veteranos</span>
            <br />
            <span className="text-[#e5e5e5] text-xl">Team Login</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#e5e5e5]">
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="input-field w-full"
                data-testid="login-username-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#e5e5e5]">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="input-field w-full"
                data-testid="login-password-input"
              />
            </div>
            <Button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
              data-testid="login-submit-btn"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button
              variant="link"
              className="text-[#f4c542] hover:text-[#ffd700]"
              onClick={() => navigate("/")}
              data-testid="back-home-btn"
            >
              ← Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;