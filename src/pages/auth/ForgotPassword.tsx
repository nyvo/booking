import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Leaf, Mail } from "lucide-react";
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // For now, since Supabase is not configured, we'll show a success message
      // In production, this will call supabase.auth.resetPasswordForEmail

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demonstration, always succeed
      setSent(true);

      // Future implementation:
      // const { error } = await supabase.auth.resetPasswordForEmail(email, {
      //   redirectTo: `${window.location.origin}/reset-password`,
      // });
      // if (error) throw error;
      // setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke sende e-post");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
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
            <CardHeader className="space-y-1 text-center pb-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-medium">
                Sjekk e-posten din
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Vi har sendt instruksjoner for å tilbakestille passordet til{" "}
                <br />
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="mb-2 font-medium">Ikke mottatt e-post?</p>
                <ul className="list-inside list-disc space-y-1 text-xs">
                  <li>Sjekk søppelpost-mappen</li>
                  <li>Kontroller at e-postadressen er riktig</li>
                  <li>Vent noen minutter og prøv igjen</li>
                </ul>
              </div>

              <Button
                onClick={() => setSent(false)}
                variant="outline"
                className="w-full rounded-full cursor-pointer"
              >
                Prøv en annen e-postadresse
              </Button>

              <Link to={ROUTES.AUTH.LOGIN}>
                <Button className="w-full rounded-full cursor-pointer">
                  Tilbake til innlogging
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              Tilbakestill passord
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Skriv inn e-postadressen din så sender vi deg en lenke for å
              tilbakestille passordet
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
                  autoFocus
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full cursor-pointer"
                size="lg"
                disabled={loading}
              >
                {loading ? "Sender..." : "Send tilbakestillingslenke"}
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

            <Link to={ROUTES.AUTH.LOGIN}>
              <Button
                variant="outline"
                className="w-full rounded-full cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tilbake til innlogging
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
