"use client";

import dynamic from "next/dynamic";

const CircularGallery = dynamic(() => import("./CircularGallery"), { ssr: false });
const Galaxy = dynamic(() => import("@/components/ui/galaxy"), { ssr: false });

const CERT_ITEMS = [
  { image: "/certificate/DM.png", text: "Digital Marketing" },
  { image: "/certificate/Generative AI.png", text: "Generative AI" },
  { image: "/certificate/Graphic-design.png", text: "Graphic Design" },
  { image: "/certificate/HTML-CSS-JS.png", text: "Web Development" },
  { image: "/certificate/LLM.png", text: "Large Language Models" },
  { image: "/certificate/ResponsibleAI.png", text: "Responsible AI" },
  { image: "/certificate/Software engineering.png", text: "Software Engineering" },
  { image: "/certificate/cloud computing.png", text: "Cloud Computing" },
  { image: "/certificate/cyber-sequrity.png", text: "Cyber Security" },
  { image: "/certificate/mongodb.png", text: "MongoDB" }
];

export default function CertificationsSection() {
  return (
    <section 
      id="certifications" 
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
        paddingTop: "6rem",
        paddingBottom: "6rem",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Dynamic Galaxy Background */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)"
        }}
      >
        <Galaxy 
          mouseInteraction={true}
          mouseRepulsion={true}
          density={1.8}
          glowIntensity={0.6}
          saturation={0.5}
          hueShift={185}
          starSpeed={0.4}
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

      <div style={{ zIndex: 20, textAlign: "center", marginBottom: "4rem" }}>
        <h2 style={{
          fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          fontFamily: "var(--font-sans)",
          background: "linear-gradient(135deg, var(--on-surface) 0%, var(--primary-fixed) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Certifications
        </h2>
        <p className="label-tech" style={{ marginTop: "1.5rem", opacity: 0.6 }}>
          DRAG TO BROWSE · VERIFIED CREDENTIALS
        </p>
      </div>

      <div style={{ height: "500px", width: "100%", position: "relative", zIndex: 15 }}>
        <CircularGallery 
          items={CERT_ITEMS}
          bend={3} 
          textColor="var(--primary)" 
          borderRadius={0.05} 
          scrollEase={0.05}
          scrollSpeed={2.5}
          font="bold 30px var(--font-sans)"
        />
      </div>

      {/* Top and Bottom edge fades for seamless blending */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to bottom, var(--surface) 0%, transparent 15%, transparent 85%, var(--surface) 100%)" }} />
    </section>
  );
}
