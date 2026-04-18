"use client";

const SOCIALS = [
  { label: "LinkedIn", href: "https://linkedin.com/in/sujoy-moulick" },
  { label: "GitHub",   href: "https://github.com/sujoy-moulick" },
  { label: "YouTube",  href: "https://youtube.com" },
];

export default function Footer() {
  return (
    <footer
      style={{
        padding: "2.5rem 2rem",
        background: "var(--surface-container-low)",
        borderTop: "1px solid rgba(59,73,75,0.35)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <p className="label-tech" style={{ opacity: 0.5 }}>
          © 2024 SM // KINETIC LUMINARY. ALL RIGHTS RESERVED.
        </p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="label-tech"
              style={{
                color: "var(--on-surface-variant)",
                transition: "color var(--transition-std)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--primary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--on-surface-variant)")
              }
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
