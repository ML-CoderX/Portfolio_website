import { KageLandingPage } from "@designcodeio/threeui";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const KagePage = () => {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#05070a]">
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white backdrop-blur-md border border-white/10 text-xs font-mono tracking-wide transition-all duration-200 shadow-lg hover:scale-105"
        aria-label="Back to Portfolio"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Portfolio</span>
      </Link>
      <KageLandingPage style={{ width: "100%", height: "100%" }} />
    </main>
  );
};

export default KagePage;
