import { LandingHeader } from "@/features/landing/components/LandingHeader";
import { LandingHero } from "@/features/landing/components/LandingHero";
import { LandingFooter } from "@/features/landing/components/LandingFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-white relative font-sans">
      <LandingHeader />
      <LandingHero />
      <LandingFooter />
    </main>
  );
}
