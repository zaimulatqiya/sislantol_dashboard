import Link from "next/link";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { landingData } from "../constants/landingData";

export function LandingHeader() {
  const { logoText, loginButtonText, loginLink } = landingData.header;

  return (
    <header className="w-full flex items-center justify-between py-6 px-8 lg:px-16 absolute top-0 left-0 z-50">
      <div className="flex items-center gap-2">
        <Truck className="h-6 w-6 text-black" />
        <span className="text-xl font-bold tracking-tight text-black">{logoText}</span>
      </div>
      <Link href={loginLink}>
        <Button className="bg-black hover:bg-black/90 text-white rounded-full px-6 font-medium cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95">
          {loginButtonText}
        </Button>
      </Link>
    </header>
  );
}
