"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";

/* ── Floating ellipse shape ────────────────────────────────────────── */
function ElegantShape({
  style,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  color = "rgba(0,219,233,0.12)",
  floatDuration = 12,
}: {
  style?: CSSProperties;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  color?: string;
  floatDuration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      style={{ position: "absolute", ...style }}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height, position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "9999px",
            background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
            border: "1.5px solid rgba(0,219,233,0.13)",
            backdropFilter: "blur(2px)",
            boxShadow: "0 8px 32px 0 rgba(0,219,233,0.06)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ── Main hero component ───────────────────────────────────────────── */
interface HeroGeometricProps {
  badge?: string;
  title1?: string;
  title2?: string;
}

export function HeroGeometric({
  badge = "Kinetic Void · Portfolio",
  title1 = "Architect of the",
  title2 = "Digital Frontier",
}: HeroGeometricProps) {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#131314",
      }}
    >
      {/* Ambient radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,219,233,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Floating shapes — full viewport spread ── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>

        {/* Top-left large sweep */}
        <ElegantShape delay={0.3} width={620} height={145} rotate={12}
          color="rgba(0,219,233,0.14)"
          style={{ left: "-8%", top: "14%" }} />

        {/* Top-right */}
        <ElegantShape delay={0.55} width={420} height={100} rotate={-18}
          color="rgba(0,240,255,0.11)"
          style={{ right: "-4%", top: "8%" }} />

        {/* Center-right wide */}
        <ElegantShape delay={0.5} width={520} height={118} rotate={-12}
          color="rgba(0,240,255,0.10)"
          style={{ right: "-3%", top: "58%" }} />

        {/* Center-left */}
        <ElegantShape delay={0.65} width={360} height={88} rotate={8}
          color="rgba(125,244,255,0.09)"
          style={{ left: "-4%", top: "50%" }} />

        {/* Bottom-left */}
        <ElegantShape delay={0.4} width={300} height={76} rotate={-8}
          color="rgba(125,244,255,0.10)"
          floatDuration={10}
          style={{ left: "6%", bottom: "8%" }} />

        {/* Bottom-center */}
        <ElegantShape delay={0.8} width={440} height={95} rotate={6}
          color="rgba(0,219,233,0.09)"
          floatDuration={14}
          style={{ left: "28%", bottom: "4%" }} />

        {/* Bottom-right */}
        <ElegantShape delay={0.9} width={260} height={65} rotate={-20}
          color="rgba(0,219,233,0.08)"
          floatDuration={11}
          style={{ right: "6%", bottom: "10%" }} />

        {/* Upper-center-right accent */}
        <ElegantShape delay={0.6} width={200} height={58} rotate={22}
          color="rgba(0,219,233,0.09)"
          floatDuration={9}
          style={{ right: "18%", top: "13%" }} />

        {/* Upper-center-left small */}
        <ElegantShape delay={0.7} width={160} height={42} rotate={-28}
          color="rgba(150,209,214,0.08)"
          floatDuration={8}
          style={{ left: "22%", top: "7%" }} />

        {/* Mid-screen thin */}
        <ElegantShape delay={1.0} width={340} height={55} rotate={5}
          color="rgba(0,219,233,0.07)"
          floatDuration={16}
          style={{ left: "35%", top: "38%" }} />

        {/* Far right mid */}
        <ElegantShape delay={0.85} width={180} height={48} rotate={-14}
          color="rgba(125,244,255,0.07)"
          floatDuration={13}
          style={{ right: "8%", top: "38%" }} />

      </div>

      {/* ── Content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "0 1.5rem",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <motion.div
          custom={0} variants={fadeUp} initial="hidden" animate="visible"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.3rem 0.9rem",
            borderRadius: "9999px",
            background: "rgba(0,219,233,0.05)",
            border: "1px solid rgba(0,219,233,0.2)",
            marginBottom: "2.5rem",
          }}
        >
          {/* Animated pulse dot */}
          <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
            <motion.span
              animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "#00dbe9",
              }}
            />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00dbe9", flexShrink: 0 }} />
          </span>
          <span
            style={{
              fontSize: "0.78rem",
              letterSpacing: "0.06em",
              color: "#00dbe9",
              fontWeight: 500,
            }}
          >
            {badge}
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          custom={1} variants={fadeUp} initial="hidden" animate="visible"
          style={{
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            marginBottom: "1.5rem",
            fontSize: "clamp(2.8rem, 8vw, 6rem)",
          }}
        >
          <span
            style={{
              background: "linear-gradient(180deg, #e5e2e3 0%, rgba(229,226,227,0.75) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "block",
            }}
          >
            {title1}
          </span>
          <span
            style={{
              background: "linear-gradient(90deg, #7df4ff 0%, #dbfcff 50%, #00dbe9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "block",
            }}
          >
            {title2}
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          custom={2} variants={fadeUp} initial="hidden" animate="visible"
          style={{
            fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
            color: "rgba(185,202,203,0.6)",
            lineHeight: 1.7,
            fontWeight: 300,
            letterSpacing: "0.02em",
            maxWidth: "540px",
            margin: "0 auto 2.5rem",
          }}
        >
          Full-stack engineer crafting high-performance web experiences at the
          intersection of design and motion.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3} variants={fadeUp} initial="hidden" animate="visible"
          style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}
        >
          <a
            href="#projects"
            style={{
              padding: "0.75rem 1.75rem",
              borderRadius: "0.375rem",
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #00dbe9, #7df4ff)",
              color: "#00363a",
              boxShadow: "0 0 28px rgba(0,219,233,0.28)",
              transition: "filter 300ms ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.12)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.filter = "brightness(1)")}
          >
            View Projects
          </a>
          <a
            href="#contact"
            style={{
              padding: "0.75rem 1.75rem",
              borderRadius: "0.375rem",
              fontWeight: 600,
              fontSize: "0.8rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(0,219,233,0.28)",
              color: "#dbfcff",
              transition: "background 300ms ease, border-color 300ms ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(0,219,233,0.1)"; el.style.borderColor = "rgba(0,219,233,0.5)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.borderColor = "rgba(0,219,233,0.28)"; }}
          >
            Get in Touch
          </a>
        </motion.div>
      </div>

      {/* Top & bottom edge fades */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, #131314 0%, transparent 15%, transparent 80%, #131314 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
