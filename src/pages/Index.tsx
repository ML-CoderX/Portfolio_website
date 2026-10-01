import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import EducationSection from "@/components/EducationSection";
import ExperienceSection from "@/components/ExperienceSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
import ScrollToTop from "@/components/ScrollToTop";
import Terminal from "@/components/Terminal";
import Finale from "@/components/Finale";
import { PortfolioBackground } from "@/components/PortfolioBackground";

const Index = () => {
  return (
    <div className="relative isolate min-h-screen text-foreground selection:bg-cyan-500 selection:text-black">
      {/* Living Atmospheric 3D AI Technologist Background */}
      <PortfolioBackground />

      <Navbar />
      <ScrollToTop />
      <Terminal />
      <HeroSection />
      <AboutSection />
      <EducationSection />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
      <Finale />
    </div>
  );
};

export default Index;
