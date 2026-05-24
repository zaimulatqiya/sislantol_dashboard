import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { landingData } from "../constants/landingData";

export function LandingHero() {
  const {
    badgeText,
    title,
    subtitle,
    primaryButtonText,
    primaryButtonLink,

    previewImage,
    previewImageAlt,
  } = landingData.hero;

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 flex flex-col items-center justify-center min-h-screen text-center px-4 w-full">
      {/* Background gradients if needed to match the soft vibe */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white" />

      {/* Badge */}
      <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 text-sm text-blue-600 mb-6">
        {badgeText}
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto whitespace-pre-line leading-tight">
        {title}
      </h1>

      {/* Subtitle */}
      <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
        {subtitle}
      </p>

      {/* Buttons */}
      <div className="mt-10 flex items-center justify-center w-full">
        <Link href={primaryButtonLink}>
          <Button className="bg-black hover:bg-black/90 text-white rounded-full px-8 py-6 h-auto text-base font-medium flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/20 active:scale-95 group">
            {primaryButtonText} <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      {/* Dashboard Preview Image */}
      <div className="mt-20 w-full max-w-6xl mx-auto relative rounded-2xl shadow-2xl overflow-hidden border border-slate-100 bg-white/50 p-2 backdrop-blur-sm">
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
          <Image
            src={previewImage}
            alt={previewImageAlt}
            fill
            className="object-cover object-top"
            priority
          />
        </div>
      </div>
    </section>
  );
}
