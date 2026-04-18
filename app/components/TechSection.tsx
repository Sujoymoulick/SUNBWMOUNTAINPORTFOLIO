"use client";
import { useEffect, useRef, useState } from "react";
import DecryptedText from "@/components/ui/decrypted-text";
import Galaxy from "@/components/ui/galaxy";
import TechVoxelScene from "./TechVoxelScene";

const SKILLS = [
  { name: "Next.js",      cat: "React Framework",  lvl: 95 },
  { name: "React.js",     cat: "UI Library",        lvl: 96 },
  { name: "Node.js",      cat: "Runtime Env",       lvl: 90 },
  { name: "Express",      cat: "Web Framework",     lvl: 88 },
  { name: "MongoDB",      cat: "NoSQL Database",    lvl: 85 },
  { name: "Tailwind CSS", cat: "Utility Styling",   lvl: 92 },
  { name: "TypeScript",   cat: "Typed JS",          lvl: 90 },
  { name: "AWS",          cat: "Cloud Platform",    lvl: 78 },
  { name: "Docker",       cat: "Containerisation",  lvl: 76 },
  { name: "Git / CI-CD",  cat: "Version Control",   lvl: 94 },
  { name: "Three.js",     cat: "3D / WebGL",        lvl: 70 },
  { name: "PostgreSQL",   cat: "Relational DB",     lvl: 82 },
];

const CATEGORIES = [
  { label: "All",      filter: null },
  { label: "Frontend", filter: (s: typeof SKILLS[0]) => ["React.js","Next.js","Tailwind CSS","TypeScript","Three.js"].some(n => s.name === n) },
  { label: "Backend",  filter: (s: typeof SKILLS[0]) => ["Node.js","Express","MongoDB","PostgreSQL"].some(n => s.name === n) },
  { label: "DevOps",   filter: (s: typeof SKILLS[0]) => ["AWS","Docker","Git / CI-CD"].some(n => s.name === n) },
];


export default function TechSection() {
  const ref      = useRef<HTMLElement>(null);
  const [cat, setCat] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target
              .querySelectorAll(".fade-up")
              .forEach((el, i) =>
                setTimeout(() => el.classList.add("visible"), i * 60)
              );
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [cat]);

  const filteredSkills =
    CATEGORIES[cat].filter
      ? SKILLS.filter(CATEGORIES[cat].filter!)
      : SKILLS;

  return (
    <section
      id="tech"
      ref={ref}
      style={{
        padding: "10rem 2rem",
        background: "var(--surface)",
        position: "relative",
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
          density={1.6}
          glowIntensity={0.5}
          saturation={0.4}
          hueShift={185}
          starSpeed={0.3}
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

      {/* Accent orb */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,219,233,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          zIndex: 20,
        }}
      >
        {/* Header */}
        <div
          className="fade-up"
          style={{ maxWidth: "620px", marginBottom: "4rem" }}
        >
          <p
            className="label-tech"
            style={{ color: "var(--primary-fixed-dim)", marginBottom: "0.75rem" }}
          >
            02 // ARCHITECTURE & TOOLS
          </p>
          <h2 className="display-md" style={{ color: "var(--on-surface)", marginBottom: "1rem" }}>
            <DecryptedText 
              text="The Kinetic Stack." 
              animateOn="view" 
              revealDirection="center"
              className="display-md"
            />
          </h2>
          <p className="body-lg">
            A meticulously curated ecosystem of modern frameworks and libraries,
            engineered for high-performance, scalable digital experiences.
          </p>
        </div>

        {/* Category filter */}
        <div
          className="fade-up"
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          {CATEGORIES.map((c, i) => (
            <button
              key={c.label}
              onClick={() => setCat(i)}
              style={{
                padding: "0.45rem 1.1rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                border: "1px solid",
                borderColor:
                  cat === i ? "var(--primary-fixed-dim)" : "rgba(59,73,75,0.4)",
                background:
                  cat === i ? "rgba(0,219,233,0.12)" : "transparent",
                color:
                  cat === i ? "var(--primary)" : "var(--on-surface-variant)",
                transition: "all var(--transition-std)",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* 3D Voxel Scene */}
        <div className="fade-up" style={{ minHeight: "500px", width: "100%" }}>
          <TechVoxelScene skills={filteredSkills} />
        </div>
      </div>
    </section>
  );
}
