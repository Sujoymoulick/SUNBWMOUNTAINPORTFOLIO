import NavBar          from "./components/NavBar";
import HeroSection     from "./components/HeroSection";
import AboutSection    from "./components/AboutSection";
import TechSection     from "./components/TechSection";
import CertificationsSection from "./components/CertificationsSection";
import ProjectsSection from "./components/ProjectsSection";
import ContactSection  from "./components/ContactSection";
import AnimatedFooter from "@/components/ui/animated-footer";
import { PixelCursorTrail } from "@/components/ui/pixel-trail";

export default function Home() {
  return (
    <>
      <NavBar />
      <PixelCursorTrail />
      <main>
        <HeroSection />
        <AboutSection />
        <TechSection />
        <CertificationsSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <div className="bg-black py-16 flex flex-col items-center gap-6 relative z-50">
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--primary-fixed-dim)] to-transparent opacity-40" />
        <p className="text-[0.65rem] md:text-[0.75rem] uppercase tracking-[0.25em] text-[var(--on-surface-variant)] flex items-center gap-2 font-mono">
          <svg className="size-3 text-[var(--primary-fixed-dim)]" viewBox="0 0 80 80" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M67.4307 11.5693C52.005 -3.85643 26.995 -3.85643 11.5693 11.5693C-3.85643 26.995 -3.85643 52.005 11.5693 67.4307C26.995 82.8564 52.005 82.8564 67.4307 67.4307C82.8564 52.005 82.8564 26.995 67.4307 11.5693ZM17.9332 17.9332C29.8442 6.02225 49.1558 6.02225 61.0668 17.9332C72.9777 29.8442 72.9777 49.1558 61.0668 61.0668C59.7316 62.4019 58.3035 63.5874 56.8032 64.6232L56.8241 64.6023C46.8657 54.6439 46.8657 38.4982 56.8241 28.5398L58.2383 27.1256L51.8744 20.7617L50.4602 22.1759C40.5018 32.1343 24.3561 32.1343 14.3977 22.1759L14.3768 22.1968C15.4126 20.6965 16.5981 19.2684 17.9332 17.9332ZM34.0282 38.6078C25.6372 38.9948 17.1318 36.3344 10.3131 30.6265C7.56889 39.6809 9.12599 49.76 14.9844 57.6517L34.0282 38.6078ZM21.3483 64.0156C29.24 69.874 39.3191 71.4311 48.3735 68.6869C42.6656 61.8682 40.0052 53.3628 40.3922 44.9718L21.3483 64.0156Z"
            />
          </svg>
          © 2026 Kinetic Luminary. All rights reserved.
        </p>
      </div>
      <AnimatedFooter 
          copyrightText="© 2026 Kinetic Luminary. All rights reserved."
          barCount={23}
          leftLinks={[]}
          rightLinks={[]}
      />
    </>
  );
}
