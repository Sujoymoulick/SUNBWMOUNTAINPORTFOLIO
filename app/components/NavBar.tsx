"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useLenis } from "lenis/react";

// WebGL component — SSR disabled
const InfiniteMenu = dynamic(() => import("./InfiniteMenu"), { ssr: false });
import Galaxy from "@/components/ui/galaxy";

const LINKS = [
  { label: "Home",       href: "#home",     description: "Start here"       },
  { label: "About",      href: "#about",    description: "The Synthesist"   },
  { label: "Career",     href: "#journey",  description: "My Experience"    },
  { label: "Tech Stack", href: "#tech",     description: "Kinetic Stack"    },
  { label: "Projects",   href: "#projects", description: "Selected Works"   },
  { label: "Contact",    href: "#contact",  description: "Let's Talk"       },
];

/** Images for each nav item in the InfiniteMenu sphere */
const MENU_ITEMS = [
  { image: "/manu logo/home logo.png", link: "#home", title: "Home", description: "Start here" },
  { image: "/manu logo/about logo.png", link: "#about", title: "About", description: "The Synthesist" },
  { image: "/manu logo/career logo.png", link: "#journey", title: "Career", description: "My Experience" },
  { image: "/manu logo/Tech sack logo.png", link: "#tech", title: "Tech Stack", description: "Kinetic Stack" },
  { image: "/manu logo/project logo.png", link: "#projects", title: "Projects", description: "Selected Works" },
  { image: "/manu logo/contact logo.png", link: "#contact", title: "Contact", description: "Let's Talk" },
];

export default function NavBar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [active,     setActive]     = useState("#home");
  const [menuOpen,   setMenuOpen]   = useState(false);

  const lenis = useLenis();   // access global Lenis instance

  /* Scroll-based background */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Active section highlight */
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(`#${e.target.id}`); }),
      { threshold: 0.45 }
    );
    sections.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, []);

  /* Lock body scroll while menu is open */
  useEffect(() => {
    if (menuOpen) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [menuOpen, lenis]);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Handle InfiniteMenu item click — smooth-scroll to anchor */
  const handleMenuNav = (link: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const target = document.querySelector(link);
      if (target) lenis?.scrollTo(target as HTMLElement, { duration: 1.4 });
    }, 300); // wait for close animation
  };

  return (
    <>
      {/* ── Top nav bar ─────────────────────────────────────────────── */}
      <header
        style={{
          position: "fixed",
          top: scrolled ? "1rem" : "0",
          left: scrolled ? "1rem" : "0",
          right: scrolled ? "1rem" : "0",
          zIndex: 100,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          border: scrolled ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
          background: scrolled ? "rgba(10,10,12,0.7)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderRadius: scrolled ? "1.5rem" : "0",
          maxWidth: scrolled ? "1100px" : "100%",
          margin: "0 auto",
        }}
      >
        <nav
          className="px-4 md:px-8"
          style={{
            maxWidth: "1200px", margin: "0 auto",
            height: "68px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo */}
          <a href="#home" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, var(--primary-fixed-dim), var(--primary))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}
            >
              SM
            </span>
          </a>

          {/* Nav links are exclusively inside the InfiniteMenu overlay */}

          {/* ── Right-side row: CV + menu button ─────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <a
              href="/My_resume_2026.pdf"
              download
              className="grad-primary desktop-cv"
              style={{
                padding: "0.5rem 1.25rem", borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", color: "var(--on-primary)",
                transition: "filter var(--transition-std)", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.15)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.filter = "brightness(1)")}
            >
              Download CV
            </a>

            {/* ── 3-dot / grid menu button — always visible ──── */}
            <button
              id="menu-toggle-btn"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
              style={{
                width: "44px", height: "44px",
                borderRadius: "var(--radius-sm)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "5px",
                background: menuOpen ? "rgba(0,219,233,0.2)" : "rgba(10,10,12,0.6)",
                border: `1px solid ${menuOpen ? "rgba(0,219,233,0.5)" : "rgba(255,255,255,0.1)"}`,
                backdropFilter: "blur(8px)",
                transition: "all var(--transition-std)",
                cursor: "pointer",
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (!menuOpen) { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.08)"; el.style.borderColor = "rgba(0,219,233,0.3)"; }}}
              onMouseLeave={e => { if (!menuOpen) { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.borderColor = "rgba(59,73,75,0.35)"; }}}
            >
              {/* Three-dot icon → transforms to × when open */}
              {menuOpen ? (
                /* × close icon */
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <line x1="3" y1="3" x2="13" y2="13" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="13" y1="3" x2="3" y2="13" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                /* Hamburger menu icon */
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                  <rect width="20" height="2" rx="1" fill="white" />
                  <rect y="6" width="20" height="2" rx="1" fill="white" />
                  <rect y="12" width="20" height="2" rx="1" fill="white" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* ── InfiniteMenu full-screen overlay ─────────────────────────── */}
      <div
        aria-modal="true"
        role="dialog"
        aria-label="Navigation menu"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(13,14,15,0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          transition: "opacity 0.35s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Galaxy Background inside Menu */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -1,
            pointerEvents: "none",
            maskImage: "radial-gradient(circle at center, black, transparent 95%)",
          }}
        >
          {menuOpen && (
            <Galaxy 
              mouseInteraction={true}
              mouseRepulsion={true}
              density={1.5}
              glowIntensity={0.6}
              saturation={0.3}
              hueShift={185}
              starSpeed={0.3}
              transparent={true}
            />
          )}
        </div>
        {/* Header row inside overlay */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.25rem 2rem",
            borderBottom: "1px solid rgba(59,73,75,0.3)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "1rem", fontWeight: 800, letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, var(--primary-fixed-dim), var(--primary))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}
          >
            SM // NAVIGATION
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            {/* Hint — hidden on mobile */}
            <p className="label-tech nav-hint" style={{ opacity: 0.4 }}>
              DRAG · CLICK ↗ TO NAVIGATE
            </p>

            {/* Close button — always visible */}
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              style={{
                width: "40px", height: "40px",
                borderRadius: "var(--radius-sm)",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,219,233,0.08)",
                border: "1px solid rgba(0,219,233,0.3)",
                cursor: "pointer",
                transition: "all var(--transition-std)",
                flexShrink: 0,
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(0,219,233,0.18)"; el.style.borderColor = "var(--primary)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(0,219,233,0.08)"; el.style.borderColor = "rgba(0,219,233,0.3)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <line x1="1" y1="1" x2="13" y2="13" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="13" y1="1" x2="1" y2="13" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* InfiniteMenu canvas area */}
        <div style={{ flex: 1, position: "relative" }}>
          {menuOpen && (
            <InfiniteMenu
              items={MENU_ITEMS}
              scale={1.0}
              onLinkClick={handleMenuNav}
            />
          )}
        </div>

        {/* Bottom hint row — hidden on mobile */}
        <div
          className="nav-bottom-links"
          style={{
            padding: "1rem 2rem",
            borderTop: "1px solid rgba(59,73,75,0.2)",
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {LINKS.map(l => (
            <button
              key={l.href}
              onClick={() => handleMenuNav(l.href)}
              className="label-tech"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: active === l.href ? "var(--primary)" : "var(--on-surface-variant)",
                transition: "color var(--transition-std)",
                padding: "0.25rem 0",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--primary)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = active === l.href ? "var(--primary)" : "var(--on-surface-variant)")}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-cv        { display: none !important; }
          .nav-bottom-links  { display: none !important; }
          .nav-hint          { display: none !important; }
        }
      `}</style>
    </>
  );
}
