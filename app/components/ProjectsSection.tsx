"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Stack from "./Stack";
import Galaxy from "@/components/ui/galaxy";

const PROJECTS = [
  {
    id: "vectorx",
    index: "01",
    title: "VectorX",
    tagline: "Gaming SaaS Platform",
    desc: "A specialized simulator platform focusing on retro and vector-based aesthetics. It serves as a library for 2D and 3D games that utilize specific wireframe and anti-gravity mechanics.",
    tags: ["Next.js", "Three.js", "WebGL", "SaaS"],
    links: { live: "https://vector-x.vercel.app", code: "https://github.com/sujoymoulick/VectorX" },
    accent: "#00dbe9",
    bg: "linear-gradient(135deg, #1a2f31 0%, #0e1f21 100%)",
  },
  {
    id: "findo",
    index: "02",
    title: "Findo",
    tagline: "Personal Finance Hub",
    desc: "Privacy-focused expense tracker designed with an emphasis on local data persistence and a clean interface. Demonstrates advanced state handling and secure local storage logic.",
    tags: ["React", "IndexedDB", "Tailwind", "Privacy"],
    links: { live: "https://findo-finance.vercel.app", code: "https://github.com/sujoymoulick/findo" },
    accent: "#96d1d6",
    bg: "linear-gradient(135deg, #1a2a2f 0%, #0e1a20 100%)",
  },
  {
    id: "adhyayan",
    index: "03",
    title: "Adhyayan",
    tagline: "Gamified Learning Platform",
    desc: "A dynamic experience transforming traditional studying through interactive learning, competitive quizzes, and growth tracking dashboard with academic visualization.",
    tags: ["Next.js", "Framer Motion", "Supabase", "Gamification"],
    links: { live: "https://adhyayan-learning.vercel.app", code: "https://github.com/sujoymoulick/adhyayan" },
    accent: "#fed639",
    bg: "linear-gradient(135deg, #2a2510 0%, #1a1808 100%)",
  },
  {
    id: "attendance",
    index: "04",
    title: "Attendance System",
    tagline: "Automated Presence Tracking",
    desc: "Full-stack digitised solution utilizing QR-code logic to eliminate manual errors, featuring role-based access control and real-time admin metrics.",
    tags: ["React", "Node.js", "Supabase", "QR Logic"],
    links: { live: "https://attendance-sys.vercel.app", code: "https://github.com/sujoymoulick/Attendance-System" },
    accent: "#dbfcff",
    bg: "linear-gradient(135deg, #152528 0%, #0d181b 100%)",
  },
];

export default function ProjectsSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHeaderVisible(true); io.disconnect(); } },
      { threshold: 0.3 }
    );
    if (headerRef.current) io.observe(headerRef.current);
    return () => io.disconnect();
  }, []);

  const projectCards = useMemo(() => PROJECTS.map((p) => (
    <div
      key={p.id}
      style={{
        height: "100%",
        width: "100%",
        background: p.bg,
        borderRadius: "32px",
        border: `1px solid ${p.accent}33`,
        display: "flex",
        gap: "2.5rem",
        alignItems: "stretch",
        overflow: "hidden",
        position: "relative",
        boxShadow: `0 40px 100px -20px ${p.accent}15, 0 20px 50px -10px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          width: "6px",
          flexShrink: 0,
          background: `linear-gradient(180deg, ${p.accent}, transparent)`,
          borderRadius: "6px 0 0 6px",
        }}
      />

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "2.5rem 2.5rem 2.5rem 0",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <p
                className="label-tech"
                style={{ color: p.accent, marginBottom: "0.4rem" }}
              >
                {p.index} // {p.tagline}
              </p>
              <h3
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  color: "var(--on-surface)",
                  letterSpacing: "-0.02em",
                }}
              >
                {p.title}
              </h3>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: `${p.accent}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: p.accent,
                fontSize: "1.2rem",
                border: `1px solid ${p.accent}33`,
              }}
            >
              ↗
            </div>
          </div>
          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.8,
              color: "var(--on-surface-variant)",
              maxWidth: "520px",
            }}
          >
            {p.desc}
          </p>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {p.tags.map((t) => (
              <span
                key={t}
                style={{
                  padding: "0.25rem 0.85rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  background: `${p.accent}12`,
                  color: p.accent,
                  border: `1px solid ${p.accent}25`,
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Interaction Hint */}
          <p 
            style={{ 
              fontSize: "0.65rem", 
              color: "var(--on-surface-variant)", 
              opacity: 0.4,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontWeight: 600
            }}
          >
            Drag to flip
          </p>

          {/* Links */}
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[
              { label: "Live ↗", href: p.links.live },
              { label: "Code ↗", href: p.links.code },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: p.accent,
                  borderBottom: `2px solid ${p.accent}33`,
                  paddingBottom: "2px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = p.accent}
                onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = `${p.accent}33`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative orb */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-60px",
          right: "-60px",
          width: "240px",
          height: "240px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${p.accent}25, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
    </div>
  )), []);

  return (
    <section
      id="projects"
      style={{
        position: "relative",
        background: "var(--surface)",
        overflow: "hidden",
      }}
    >
      {/* Background Galaxy */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          maskImage:
            "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <Galaxy 
          mouseInteraction={true}
          mouseRepulsion={true}
          density={1.4}
          glowIntensity={0.5}
          saturation={0.3}
          hueShift={185}
          starSpeed={0.25}
          transparent={true}
        />
        
        {/* Top edge blur */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: "150px",
          background: "linear-gradient(to bottom, var(--surface), transparent)",
          backdropFilter: "blur(8px)",
          pointerEvents: "none",
          zIndex: 1
        }} />
        
        {/* Bottom edge blur */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0, height: "150px",
          background: "linear-gradient(to top, var(--surface), transparent)",
          backdropFilter: "blur(8px)",
          pointerEvents: "none",
          zIndex: 1
        }} />
      </div>
      {/* Section header — outside ScrollStack so it scrolls normally */}
      <div
        ref={headerRef}
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "8rem 2rem 4rem",
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "none" : "translateY(24px)",
          transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "2rem",
          }}
        >
          <div style={{ maxWidth: "540px" }}>
            <p
              className="label-tech"
              style={{ color: "var(--primary-fixed-dim)", marginBottom: "0.75rem" }}
            >
              03 // WORK & PROJECTS
            </p>
            <h2
              className="display-md"
              style={{ color: "var(--on-surface)" }}
            >
              Selected Works.
            </h2>
          </div>
          <p className="body-lg" style={{ maxWidth: "360px" }}>
            Scroll through — each project stacks as you descend.
            A showcase of complex systems distilled into intuitive interfaces.
          </p>
        </div>
      </div>

      {/* ── 3D Draggable Stack ─────────────────── */}
      <div 
        style={{ 
          height: "80vh", 
          position: "relative", 
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "1000px",
          margin: "0 auto",
          paddingBottom: "10vh"
        }}
      >
        <Stack
          randomRotation={true}
          sensitivity={160}
          sendToBackOnClick={true}
          animationConfig={{ stiffness: 280, damping: 18 }}
          cards={projectCards}
        />
      </div>

      
      {/* ── Explore More CTA ────────────────────── */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "center", 
          marginTop: "0rem", 
          paddingBottom: "8rem",
          position: "relative",
          zIndex: 20
        }}
      >
        <a 
          href="https://github.com/sujoymoulick"
          target="_blank"
          rel="noopener noreferrer"
          className="label-tech"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.85rem 2rem",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--primary-fixed-dim)",
            color: "var(--primary-fixed-dim)",
            textDecoration: "none",
            background: "rgba(0, 219, 233, 0.05)",
            backdropFilter: "blur(4px)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 0 20px rgba(0, 219, 233, 0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--primary-fixed-dim)";
            e.currentTarget.style.color = "var(--surface)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 219, 233, 0.4)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0, 219, 233, 0.05)";
            e.currentTarget.style.color = "var(--primary-fixed-dim)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 219, 233, 0.1)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span>Explore More Projects</span>
          <span style={{ fontSize: "1.2rem" }}>↗</span>
        </a>
      </div>


      <style>{`
        .stack-container {
          width: 54rem !important;
          height: 28rem !important;
        }
        @media (max-width: 1024px) {
          .stack-container { width: 42rem !important; height: 32rem !important; }
        }
        @media (max-width: 768px) {
          .stack-container { width: 90vw !important; height: 32rem !important; }
        }
      `}</style>
    </section>
  );
}
