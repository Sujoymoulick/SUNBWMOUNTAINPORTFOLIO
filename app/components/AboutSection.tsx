"use client";
import { useEffect, useRef } from "react";
import { CpuArchitecture } from "@/components/ui/cpu-architecture";
import Galaxy from "@/components/ui/galaxy";

export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target
              .querySelectorAll(".fade-up")
              .forEach((el, i) => {
                setTimeout(() => el.classList.add("visible"), i * 120);
              });
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={ref}
      style={{
        padding: "10rem 2rem",
        background:
          "linear-gradient(180deg, var(--surface) 0%, var(--surface-container-low) 100%)",
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
          density={1.5}
          glowIntensity={0.5}
          saturation={0.4}
          hueShift={185}
          starSpeed={0.35}
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

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6rem",
          alignItems: "center",
          position: "relative",
          zIndex: 20,
        }}
        className="about-grid"
      >
        {/* Left — code card */}
        <div className="fade-up">
          <div
            style={{
              background: "var(--surface-container-low)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid rgba(59,73,75,0.4)",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,219,233,0.06)",
            }}
          >
            {/* Window chrome */}
            <div
              style={{
                padding: "0.85rem 1.25rem",
                background: "var(--surface-container)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                borderBottom: "1px solid rgba(59,73,75,0.3)",
              }}
            >
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                <span
                  key={c}
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: c,
                  }}
                />
              ))}
              <span
                className="label-tech"
                style={{ marginLeft: "0.5rem", opacity: 0.5 }}
              >
                architect.ts
              </span>
            </div>
            {/* Code body */}
            <pre
              style={{
                padding: "1.75rem",
                fontFamily: "'Courier New', monospace",
                fontSize: "0.82rem",
                lineHeight: 1.8,
                color: "var(--on-surface-variant)",
                overflowX: "auto",
              }}
            >
              <code>
                <span style={{ color: "var(--secondary)" }}>const</span>
                {" engineer = "}
                <span style={{ color: "var(--secondary)" }}>new</span>
                {" Architect();\n"}
                {"engineer.buildSystem({\n"}
                {"  "}
                <span style={{ color: "var(--primary-fixed-dim)" }}>scalable</span>
                {": "}
                <span style={{ color: "var(--tertiary-container)" }}>true</span>
                {",\n"}
                {"  "}
                <span style={{ color: "var(--primary-fixed-dim)" }}>performance</span>
                {": "}
                <span style={{ color: "'#a5d6a7'" }}>&apos;optimal&apos;</span>
                {",\n"}
                {"  "}
                <span style={{ color: "var(--primary-fixed-dim)" }}>stack</span>
                {": [\n"}
                {"    "}
                <span style={{ color: "#a5d6a7" }}>&apos;React&apos;</span>
                {", "}
                <span style={{ color: "#a5d6a7" }}>&apos;Node&apos;</span>
                {", "}
                <span style={{ color: "#a5d6a7" }}>&apos;AWS&apos;</span>
                {"\n  ]\n});\n"}
                <span style={{ color: "rgba(185,202,203,0.4)" }}>
                  {"// Compiling logic into structure..."}
                </span>
              </code>
            </pre>
          </div>

          {/* Tags */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6rem",
              marginTop: "1.5rem",
            }}
          >
            {[
              "System Design",
              "API Architecture",
              "3D Motion",
              "Cloud Dev-Ops",
              "Creative Coding",
            ].map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "0.3rem 0.85rem",
                  borderRadius: "var(--radius-full)",
                  background: "var(--secondary-container)",
                  color: "var(--secondary)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-[var(--surface-container-low)]/50 border border-[rgba(59,73,75,0.2)]">
            <CpuArchitecture />
          </div>
        </div>

        {/* Right — text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="fade-up">
            <p className="label-tech" style={{ color: "var(--primary-fixed-dim)", marginBottom: "0.75rem" }}>
              01 // THE SYNTHESIST
            </p>
            <h2 className="display-md" style={{ color: "var(--on-surface)" }}>
              Merging Technical Precision with{" "}
              <em style={{ fontStyle: "italic", color: "var(--primary-fixed-dim)" }}>
                Artistic Vision
              </em>
            </h2>
          </div>
          <p className="body-lg fade-up">
            I&apos;m <strong>Sujoy Moulick</strong>, a full-stack developer who believes the best software feels
            inevitable — like it was the only way it could have been built. I
            approach every project as an architect, considering scalability,
            performance, and the human experience simultaneously.
          </p>
          <p className="body-lg fade-up">
            When I&apos;m not engineering backend systems or sculpting pixel-perfect
            UIs, I explore 3D motion design and generative art — pursuits that
            sharpen my eye for spatial reasoning and cinematic timing, skills I
            directly import into my production work.
          </p>

          {/* Values */}
          <div
            className="fade-up"
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}
          >
            {[
              { icon: "◈", label: "Performance First", desc: "Sub-100ms interactions as a baseline, not a goal." },
              { icon: "◉", label: "Systems Thinker",   desc: "Architecting for longevity, not just the sprint." },
              { icon: "◎", label: "Detail Obsessed",   desc: "The invisible polish is what users remember." },
            ].map((v) => (
              <div
                key={v.label}
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-container-low)",
                  border: "1px solid rgba(59,73,75,0.25)",
                  transition: "background var(--transition-std)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "var(--surface-container)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "var(--surface-container-low)")
                }
              >
                <span
                  style={{
                    fontSize: "1.2rem",
                    color: "var(--primary-fixed-dim)",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  {v.icon}
                </span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--on-surface)", marginBottom: "0.2rem" }}>
                    {v.label}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--on-surface-variant)", lineHeight: 1.5 }}>
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .about-grid { gap: 4rem !important; }
        }
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </section>
  );
}
