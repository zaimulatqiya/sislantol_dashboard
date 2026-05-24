import { landingData } from "../constants/landingData";

export function LandingFooter() {
  const { copyrightText } = landingData.footer;

  return (
    <footer className="w-full py-8 text-center text-sm text-slate-500 bg-white/50 border-t border-slate-100">
      <p>{copyrightText}</p>
    </footer>
  );
}
