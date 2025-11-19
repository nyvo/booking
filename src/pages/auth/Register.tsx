import { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";
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

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passordene samsvarer ikke");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Passordet må være minst 6 tegn");
      return;
    }

    setLoading(true);

    try {
      // For now, since Supabase is not configured, we'll show a success message
      // In production, this will call supabase.auth.signUp with role: 'teacher'

      // Temporary: Show error that Supabase needs configuration
      throw new Error(
        "Supabase er ikke konfigurert ennå. Vennligst sett opp Supabase-prosjektet ditt og legg til legitimasjon i .env.local",
      );

      // Future implementation:
      // const { data, error } = await supabase.auth.signUp({
      //   email,
      //   password,
      //   options: {
      //     data: { name, phone, role: 'teacher' }
      //   }
      // });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrering mislyktes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo - soft and calm */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-medium">Yoga Booking</span>
          </div>
        </div>

        <Card className="border border-border/60 shadow-sm rounded-3xl bg-white/80 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-medium text-center">
              Start som yogalærer
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Opprett din lærerkonto og begynn å undervise
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
                <Label htmlFor="name" className="text-sm">
                  Fullt navn
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ola Nordmann"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="rounded-xl"
                />
              </div>

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
                <Label
                  htmlFor="phone"
                  className="text-sm text-muted-foreground"
                >
                  Telefon (valgfritt)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+47 123 45 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">
                  Passord
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minst 6 tegn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm">
                  Bekreft passord
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Skriv inn passordet på nytt"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Oppretter lærerkonto..." : "Opprett lærerkonto"}
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
              <span className="text-muted-foreground">
                Har du allerede en konto?{" "}
              </span>
              <Link
                to={ROUTES.AUTH.LOGIN}
                className="font-medium text-primary hover:underline cursor-pointer"
              >
                Logg inn
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Ved å registrere deg godtar du våre{" "}
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
