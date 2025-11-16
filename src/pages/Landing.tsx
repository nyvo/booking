/**
 * Marketing Landing Page
 * Public-facing page targeting yoga teachers
 * Favrit-inspired Scandinavian sharpness with Cluely calm aesthetic
 */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PricingSection from "@/components/PricingSection";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header + Hero - Extended gradient */}
      <div className="bg-soft-gradient relative overflow-hidden pb-12">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          {/* Header / Navigation */}
          <nav className="flex items-center justify-between py-8">
            <div className="text-xl font-semibold text-foreground">
              YogaBooking
            </div>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full font-semibold px-6"
            >
              Logg inn
            </Button>
          </nav>

          {/* Hero Content - Increased height and spacing */}
          <div className="grid gap-24 py-28 md:grid-cols-12 md:py-44">
            {/* Left: Headline + CTAs - 6 columns */}
            <div className="space-y-10 md:col-span-6">
              <div className="space-y-8">
                <h1 className="text-5xl font-semibold leading-tight text-foreground md:text-6xl lg:text-7xl">
                  Enklere yogaundervisning
                </h1>
                <p className="max-w-[580px] text-xl leading-[1.7] text-muted-foreground">
                  Mindre administrasjon, mer tid til det du elsker. En rolig
                  platform for yogalærere som vil ha bedre oversikt.
                </p>
              </div>
              <div className="flex gap-4">
                <Button size="lg" className="rounded-full px-8 text-base">
                  Start gratis
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 text-base"
                >
                  Se hvordan det fungerer
                </Button>
              </div>
            </div>

            {/* Right: Larger Product Preview - 5 columns */}
            <div className="order-first md:order-last md:col-span-5 md:col-start-8">
              <div className="rounded-xl border border-border/20 bg-white/95 p-6 backdrop-blur">
                <div className="mb-5 space-y-1">
                  <h3 className="text-lg font-medium text-foreground">
                    Kommende timer
                  </h3>
                  <p className="text-base text-muted-foreground">I dag</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-border/15 bg-background/50 p-4">
                    <div>
                      <p className="text-base font-medium text-foreground">
                        Morgen Vinyasa
                      </p>
                      <p className="text-sm text-muted-foreground">
                        09:00 – 10:00
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-medium text-foreground">
                        8/12
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border/15 bg-background/50 p-4">
                    <div>
                      <p className="text-base font-medium text-foreground">
                        Yin Yoga
                      </p>
                      <p className="text-sm text-muted-foreground">
                        18:00 – 19:15
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-medium text-foreground">
                        12/15
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border/15 bg-background/50 p-4">
                    <div>
                      <p className="text-base font-medium text-foreground">
                        Hatha Yoga
                      </p>
                      <p className="text-sm text-muted-foreground">
                        19:00 – 20:30
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-medium text-foreground">
                        5/10
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Section - Alternating bg (white) */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-28 md:px-8">
          <div className="space-y-16">
            <div className="space-y-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                For yogalærere
              </p>
              <h2 className="text-5xl font-semibold leading-tight text-foreground md:text-6xl">
                Laget for yogalærere
              </h2>
              <p className="max-w-[580px] text-xl leading-[1.7] text-muted-foreground">
                En rolig platform som gir deg kontroll – uten stress og
                unødvendig kompleksitet.
              </p>
            </div>

            <div className="grid gap-12 md:grid-cols-3">
              <div className="space-y-3">
                <p className="max-w-[580px] text-lg leading-[1.7] text-foreground">
                  Opprett kurs og enkelttimer på minutter – ingen lange skjemaer
                </p>
              </div>
              <div className="space-y-3">
                <p className="max-w-[580px] text-lg leading-[1.7] text-foreground">
                  Del med elevene dine via en enkel lenke – ingen frem og
                  tilbake på meldinger
                </p>
              </div>
              <div className="space-y-3">
                <p className="max-w-[580px] text-lg leading-[1.7] text-foreground">
                  Motta betaling automatisk – færre oppfølginger og purringer
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Alternating bg (slate-50) */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-28 md:px-8">
          <div className="mb-20 space-y-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
              Kom i gang
            </p>
            <h2 className="text-5xl font-semibold leading-tight text-foreground md:text-6xl">
              Slik fungerer det
            </h2>
          </div>

          <div className="space-y-16">
            {/* Step 1 */}
            <div className="flex gap-8">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                1
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-medium text-foreground">
                  Lag kurs
                </h3>
                <p className="max-w-[580px] text-lg leading-[1.7] text-muted-foreground">
                  Opprett et kurs eller en enkelttime. Sett tidspunkt, pris og
                  antall plasser. Det tar under ett minutt.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-8">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                2
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-medium text-foreground">
                  Del med elever
                </h3>
                <p className="max-w-[580px] text-lg leading-[1.7] text-muted-foreground">
                  Send en enkel lenke til elevene dine via e-post eller sosiale
                  medier. De booker og betaler direkte – ingen meldinger frem og
                  tilbake.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-8">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                3
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-medium text-foreground">
                  Få betaling
                </h3>
                <p className="max-w-[580px] text-lg leading-[1.7] text-muted-foreground">
                  Utbetalinger kommer automatisk til kontoen din. Du slipper å
                  purre, og kan holde fokus på undervisningen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 1 - Alternating bg (white) */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-28 md:px-8">
          <div className="grid gap-20 md:grid-cols-12 md:items-center">
            {/* Text Side - 5 columns */}
            <div className="space-y-8 md:col-span-5">
              <div className="space-y-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                  Oversikt
                </p>
                <h2 className="text-5xl font-semibold leading-tight text-foreground md:text-6xl">
                  Alle kursene dine på ett sted
                </h2>
              </div>
              <ul className="space-y-5 text-lg leading-[1.7] text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span className="max-w-[580px]">
                    Se alle kurs og enkelttimer på ett sted
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span className="max-w-[580px]">
                    Sjekk påmeldinger og ledige plasser
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span className="max-w-[580px]">
                    Rediger detaljer når som helst
                  </span>
                </li>
              </ul>
            </div>

            {/* Preview Side - 6 columns */}
            <div className="space-y-5 md:col-span-6 md:col-start-7">
              <div className="rounded-xl border border-border/10 bg-white p-6">
                <div className="mb-4 space-y-1">
                  <h3 className="text-lg font-medium text-foreground">
                    Morgen Vinyasa
                  </h3>
                  <p className="text-base text-muted-foreground">
                    Mandag kl. 09:00 • 60 min
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-muted-foreground">
                    8 påmeldte av 12
                  </span>
                  <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                    Aktiv
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border/10 bg-white p-6">
                <div className="mb-4 space-y-1">
                  <h3 className="text-lg font-medium text-foreground">
                    Yin Yoga
                  </h3>
                  <p className="text-base text-muted-foreground">
                    Onsdag kl. 18:00 • 75 min
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-muted-foreground">
                    12 påmeldte av 15
                  </span>
                  <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                    Aktiv
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border/10 bg-white p-6">
                <div className="mb-4 space-y-1">
                  <h3 className="text-lg font-medium text-foreground">
                    Hatha Yoga
                  </h3>
                  <p className="text-base text-muted-foreground">
                    Fredag kl. 10:00 • 90 min
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-muted-foreground">
                    5 påmeldte av 10
                  </span>
                  <span className="rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent-foreground">
                    Aktiv
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2 - Alternating bg (slate-50) */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-28 md:px-8">
          <div className="grid gap-20 md:grid-cols-12 md:items-center">
            {/* Preview Side - 6 columns */}
            <div className="order-2 md:order-1 md:col-span-6">
              <div className="rounded-xl border border-border/10 bg-white p-6">
                <div className="mb-5 space-y-1">
                  <h3 className="text-lg font-medium text-foreground">
                    Timeplanen din
                  </h3>
                  <p className="text-base text-muted-foreground">
                    Mandag 15. november
                  </p>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-l-2 border-primary pl-4">
                    <div>
                      <p className="text-base font-medium text-foreground">
                        Morgen Vinyasa
                      </p>
                      <p className="text-sm text-muted-foreground">
                        09:00 – 10:00
                      </p>
                    </div>
                    <span className="text-base text-muted-foreground">
                      8 elever
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-l-2 border-accent pl-4">
                    <div>
                      <p className="text-base font-medium text-foreground">
                        Yin Yoga
                      </p>
                      <p className="text-sm text-muted-foreground">
                        18:00 – 19:15
                      </p>
                    </div>
                    <span className="text-base text-muted-foreground">
                      12 elever
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-l-2 border-primary/40 pl-4">
                    <div>
                      <p className="text-base font-medium text-foreground">
                        Hatha Yoga
                      </p>
                      <p className="text-sm text-muted-foreground">
                        I morgen 10:00
                      </p>
                    </div>
                    <span className="text-base text-muted-foreground">
                      5 elever
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Side - 5 columns */}
            <div className="order-1 space-y-8 md:order-2 md:col-span-5 md:col-start-8">
              <div className="space-y-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                  Timeplan
                </p>
                <h2 className="text-5xl font-semibold leading-tight text-foreground md:text-6xl">
                  Alltid oppdatert
                </h2>
              </div>
              <ul className="space-y-5 text-lg leading-[1.7] text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span className="max-w-[580px]">
                    Se kommende timer i en rolig kalendervisning
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span className="max-w-[580px]">
                    Få varsler når elever booker eller avbestiller
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span className="max-w-[580px]">
                    Hold oversikt uten stress
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section - Alternating bg (white) */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-28 md:px-8">
          <div className="mb-16 space-y-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
              Dashboard
            </p>
            <h2 className="text-5xl font-semibold leading-tight text-foreground md:text-6xl">
              Se alt på ett sted
            </h2>
            <p className="max-w-[580px] text-xl leading-[1.7] text-muted-foreground">
              En enkel oversikt som gir deg kontroll over timer, elever og
              inntekter – uten rot og forvirring.
            </p>
          </div>

          <div className="rounded-xl border border-border/10 bg-white">
            {/* Stats Row */}
            <div className="border-b border-border/15 px-6 py-8">
              <div className="grid grid-cols-2 gap-12 md:grid-cols-3">
                <div>
                  <p className="text-4xl font-normal text-foreground">12</p>
                  <p className="mt-2 text-base text-muted-foreground">
                    Aktive kurs
                  </p>
                </div>
                <div>
                  <p className="text-4xl font-normal text-foreground">47</p>
                  <p className="mt-2 text-base text-muted-foreground">
                    Aktive elever
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-4xl font-normal text-foreground">8</p>
                  <p className="mt-2 text-base text-muted-foreground">
                    Timer denne uken
                  </p>
                </div>
              </div>
            </div>

            {/* Sessions */}
            <div className="p-6">
              <div className="mb-5 space-y-1">
                <h3 className="text-lg font-medium text-foreground">
                  Kommende timer
                </h3>
                <p className="text-base text-muted-foreground">Neste 7 dager</p>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-border/15 bg-background/50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-medium text-foreground">
                        Morgen Vinyasa
                      </p>
                      <p className="text-sm text-muted-foreground">
                        I dag kl. 09:00
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-medium text-foreground">
                        8 av 12
                      </p>
                      <p className="text-xs text-muted-foreground">påmeldte</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/15 bg-background/50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-medium text-foreground">
                        Yin Yoga
                      </p>
                      <p className="text-sm text-muted-foreground">
                        I dag kl. 18:00
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-medium text-foreground">
                        12 av 15
                      </p>
                      <p className="text-xs text-muted-foreground">påmeldte</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Alternating bg (slate-50) */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-28 md:px-8">
          <div className="mb-20 space-y-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
              Tilbakemeldinger
            </p>
            <h2 className="text-5xl font-semibold leading-tight text-foreground md:text-6xl">
              Hva lærere sier
            </h2>
          </div>

          <div className="space-y-20">
            {/* Testimonial 1 */}
            <div className="flex gap-8">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                AS
              </div>
              <div className="space-y-6">
                <p className="max-w-[580px] text-2xl leading-[1.6] text-foreground">
                  "Endelig slipper jeg å holde styr på Excel-ark og
                  Vipps-meldinger. Alt er på ett sted, og elevene mine elsker
                  hvor enkelt det er å booke."
                </p>
                <div>
                  <p className="text-base font-medium text-foreground">
                    Amira Solberg
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Yogalærer, Oslo
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="flex gap-8">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent/10 text-base font-semibold text-accent-foreground">
                KL
              </div>
              <div className="space-y-6">
                <p className="max-w-[580px] text-2xl leading-[1.6] text-foreground">
                  "Jeg bruker mindre tid på administrasjon og mer tid på å
                  forberede timene. Plattformen er så rolig og intuitiv."
                </p>
                <div>
                  <p className="text-base font-medium text-foreground">
                    Kari Lindgren
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Yogainstruktør, Bergen
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="flex gap-8">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                SH
              </div>
              <div className="space-y-6">
                <p className="max-w-[580px] text-2xl leading-[1.6] text-foreground">
                  "Betaling skjer automatisk, og jeg får god oversikt over
                  inntektene mine. Det gir meg ro i hverdagen."
                </p>
                <div>
                  <p className="text-base font-medium text-foreground">
                    Sofie Hansen
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Yogalærer, Trondheim
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Footer */}
      <footer className="border-t border-border/20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
          <div className="mb-6 text-xl font-semibold text-foreground">
            YogaBooking
          </div>
          <div className="flex flex-wrap items-center gap-3 text-base text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">
              Hjelp
            </a>
            <span>·</span>
            <a href="#" className="transition-colors hover:text-foreground">
              Kontakt
            </a>
            <span>·</span>
            <a href="#" className="transition-colors hover:text-foreground">
              Personvern
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
