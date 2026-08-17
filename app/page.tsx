"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { HeroSplit } from "@/components/landing/hero-split";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesBento } from "@/components/landing/features-bento";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-paper text-sm text-ink/60">
        Loading…
      </div>
    );
  }

  return (
    <main className="relative bg-paper">
      <HeroSplit />
      <HowItWorks />
      <FeaturesBento />
      <LandingFooter />
    </main>
  );
}
