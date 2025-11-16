import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/config/constants";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      // Redirect based on role
      const redirectTo =
        user.role === "teacher"
          ? ROUTES.TEACHER.DASHBOARD
          : ROUTES.STUDENT.BROWSE;
      navigate(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Innlogging mislyktes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Soft gradient background wash */}
      <div className="absolute inset-0 bg-soft-gradient pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8">
        {/* Logo - soft and calm */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-medium">Yoga Booking</span>
          </div>
        </div>

        <Card className="border border-border/60 shadow-sm rounded-3xl bg-white/80 backdrop-blur">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-medium text-center">
              Velkommen tilbake
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Logg inn for å fortsette til din konto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  E-post
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="deg@eksempel.no"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">
                    Passord
                  </Label>
                  <Link
                    to={ROUTES.AUTH.FORGOT_PASSWORD}
                    className="text-sm text-primary hover:underline cursor-pointer"
                  >
                    Glemt passord?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full cursor-pointer"
                size="lg"
                disabled={loading}
              >
                {loading ? "Logger inn..." : "Logg inn"}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/40"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-muted-foreground">
                  ELLER
                </span>
              </div>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Har du ikke konto? </span>
              <Link
                to={ROUTES.AUTH.REGISTER}
                className="font-medium text-primary hover:underline cursor-pointer"
              >
                Registrer deg gratis
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Ved å logge inn godtar du våre{" "}
          <Link
            to="#"
            className="underline hover:text-foreground cursor-pointer"
          >
            vilkår
          </Link>{" "}
          og{" "}
          <Link
            to="#"
            className="underline hover:text-foreground cursor-pointer"
          >
            personvernregler
          </Link>
        </p>
      </div>
    </div>
  );
}
