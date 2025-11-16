/**
 * Pricing Plans Section - Landing Page
 * Calm, Scandinavian-inspired pricing for yoga booking platform
 */

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BillingPeriod = "monthly" | "yearly";

interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  platformFee: string;
  features: string[];
  recommended?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Gratis",
    description: "Perfekt for å komme i gang",
    monthlyPrice: 0,
    yearlyPrice: 0,
    platformFee: "10% per booking",
    features: [
      "Ubegrensede timer",
      "Online betalinger",
      "Elevadministrasjon",
      "Grunnleggende dashboard",
      "E-poststøtte",
    ],
  },
  {
    id: "growth",
    name: "Vekst",
    description: "For aktive lærere",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    platformFee: "5% per booking",
    features: [
      "Alt i Gratis",
      "Analysedashboard",
      "Prioritert synlighet",
      "Tilpasset merkevare",
      "Prioritert støtte",
    ],
    recommended: true,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For studioer og travle timeplan",
    monthlyPrice: 499,
    yearlyPrice: 4990,
    platformFee: "2% per booking",
    features: [
      "Alt i Vekst",
      "Avansert analyse",
      "Topp prioritet synlighet",
      "Fremhevet plassering",
      "Dedikert støtte",
    ],
  },
];

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  const formatPrice = (tier: PricingTier): string => {
    const price =
      billingPeriod === "monthly" ? tier.monthlyPrice : tier.yearlyPrice;
    return price.toLocaleString("nb-NO");
  };

  const getBillingLabel = (tier: PricingTier): string => {
    if (tier.monthlyPrice === 0) return "";
    return billingPeriod === "monthly" ? "/ måned" : "/ år";
  };

  return (
    <section className="w-full bg-soft-gradient py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Header */}
        <div className="mb-16 space-y-8 text-center">
          <div className="space-y-6">
            <h2 className="text-5xl font-medium leading-tight text-foreground md:text-6xl">
              Planer for hver lærer
            </h2>
            <p className="mx-auto max-w-[600px] text-xl leading-[1.7] text-muted-foreground">
              Start gratis, voks i ditt eget tempo. Ingen overraskelser, bare
              enkel prising som skalerer med deg.
            </p>
          </div>

          {/* Billing Toggle - Inside container with smooth animation */}
          <div className="inline-flex items-center rounded-full bg-white border border-border p-1 shadow-sm">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`relative rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer ${
                billingPeriod === "monthly"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Månedlig
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`relative rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                billingPeriod === "yearly"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Årlig
              <span
                className={`rounded-full bg-primary/10 px-2 py-0.5 text-xs transition-all duration-300 ${
                  billingPeriod === "yearly"
                    ? "bg-white/20 text-white opacity-100"
                    : "text-primary opacity-70"
                }`}
              >
                2 måneder gratis
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 items-start">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`border shadow-sm rounded-3xl bg-white/80 backdrop-blur flex flex-col h-full ${
                tier.recommended
                  ? "border-primary/40 ring-2 ring-primary/10"
                  : "border-border"
              }`}
            >
              <CardHeader className="space-y-4">
                {/* Recommended Badge - Fixed height */}
                <div className="h-7">
                  {tier.recommended && (
                    <span className="inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Mest populær
                    </span>
                  )}
                </div>

                {/* Plan Name - Fixed height */}
                <div className="space-y-2 h-16">
                  <CardTitle className="text-2xl font-medium text-foreground">
                    {tier.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {tier.description}
                  </CardDescription>
                </div>

                {/* Price - Fixed height */}
                <div className="space-y-1 h-20">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-medium text-foreground transition-all duration-300">
                      {formatPrice(tier)}
                    </span>
                    <span className="text-base text-muted-foreground">NOK</span>
                  </div>
                  <p className="text-sm text-muted-foreground transition-all duration-300">
                    {getBillingLabel(tier)}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col space-y-6">
                {/* Platform Fee - Fixed height */}
                <div className="rounded-xl border border-border/30 bg-muted/30 px-4 py-3 h-[72px] flex flex-col justify-center">
                  <p className="text-sm text-muted-foreground">
                    Plattformavgift
                  </p>
                  <p className="text-base font-medium text-foreground">
                    {tier.platformFee}
                  </p>
                </div>

                {/* Features - Flexible height */}
                <ul className="space-y-3 flex-1">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                      <span className="text-sm text-foreground leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button - Aligned at bottom */}
                <div className="pt-4">
                  <Button
                    variant={tier.recommended ? "default" : "outline"}
                    className="w-full rounded-full cursor-pointer"
                    size="lg"
                  >
                    Velg {tier.name}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reassurance Text */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Alle planer inkluderer sikre betalinger, elevadministrasjon og
          e-poststøtte. Avbryt når som helst.
        </p>
      </div>
    </section>
  );
}
