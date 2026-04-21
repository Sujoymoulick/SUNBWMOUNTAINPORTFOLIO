"use client";
import { useEffect, useRef, useState } from "react";
import Galaxy from "@/components/ui/galaxy";

export default function ContactSection() {
  const ref = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target
              .querySelectorAll(".fade-up")
              .forEach((el, i) =>
                setTimeout(() => el.classList.add("visible"), i * 120)
              );
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("Sending....");
    
    const formData = new FormData(e.target as HTMLFormElement);
    formData.append("access_key", "8f919b40-4b8b-4a00-a533-81b01d685c1d");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setResult("Form Submitted Successfully");
        setSent(true);
        setForm({ name: "", email: "", message: "" });
      } else {
        setResult("Error: " + (data.message || "Something went wrong"));
      }
    } catch (err) {
      setResult("Error: Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.85rem 1rem",
    background: "var(--surface-container-lowest)",
    border: "none",
    borderBottom: "1px solid var(--outline-variant)",
    color: "var(--on-surface)",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color var(--transition-std)",
    borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
  };

  return (
    <section
      id="contact"
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
          density={1.5}
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
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, var(--primary-fixed-dim), transparent)",
          opacity: 0.3,
        }}
      />

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          position: "relative",
          zIndex: 20,
        }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24"
      >
        {/* Left */}
        <div className="text-center lg:text-left">
          <div className="fade-up" style={{ marginBottom: "2rem" }}>
            <p
              className="label-tech"
              style={{ color: "var(--primary-fixed-dim)", marginBottom: "0.75rem" }}
            >
              04 // GET IN TOUCH
            </p>
            <h2 className="display-md" style={{ color: "var(--on-surface)", marginBottom: "1rem" }}>
              Let&apos;s Build Something{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-fixed-dim), var(--primary))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Remarkable.
              </span>
            </h2>
            <p className="body-lg">
              Whether you have a project in mind, a collaboration opportunity, or
              just want to connect — my inbox is always open.
            </p>
          </div>

          {/* Contact details */}
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[
              { icon: "✉", label: "Email",    val: "sujoymoulick@email.com" },
              { icon: "🔗", label: "LinkedIn", val: "linkedin.com/in/sujoy-moulick" },
              { icon: "⌥",  label: "GitHub",  val: "github.com/sujoy-moulick" },
            ].map((c) => (
              <div
                key={c.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-container-low)",
                  border: "1px solid rgba(59,73,75,0.25)",
                  transition: "all var(--transition-std)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "var(--surface-container)";
                  el.style.borderColor = "rgba(0,219,233,0.2)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "var(--surface-container-low)";
                  el.style.borderColor = "rgba(59,73,75,0.25)";
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{c.icon}</span>
                <div>
                  <p className="label-tech" style={{ marginBottom: "0.1rem" }}>
                    {c.label}
                  </p>
                  <p style={{ fontSize: "0.82rem", color: "var(--on-surface)" }}>
                    {c.val}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div className="fade-up">
          {sent ? (
            <div
              style={{
                padding: "3rem 2rem",
                borderRadius: "var(--radius-lg)",
                background: "rgba(0,219,233,0.06)",
                border: "1px solid rgba(0,219,233,0.25)",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "1rem",
                }}
              >
                ✓
              </p>
              <h3
                className="headline-sm"
                style={{ color: "var(--primary)", marginBottom: "0.5rem" }}
              >
                Message Sent!
              </h3>
              <p className="body-lg">
                Thanks for reaching out — I&apos;ll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                padding: "2.5rem",
                borderRadius: "var(--radius-lg)",
                background: "var(--surface-container-low)",
                border: "1px solid rgba(59,73,75,0.25)",
              }}
            >
              <div>
                <label
                  className="label-tech"
                  style={{ display: "block", marginBottom: "0.5rem" }}
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  style={inputStyle}
                  onFocus={(e) =>
                    ((e.target as HTMLInputElement).style.borderBottomColor =
                      "var(--primary)")
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLInputElement).style.borderBottomColor =
                      "var(--outline-variant)")
                  }
                />
              </div>
              <div>
                <label
                  className="label-tech"
                  style={{ display: "block", marginBottom: "0.5rem" }}
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  style={inputStyle}
                  onFocus={(e) =>
                    ((e.target as HTMLInputElement).style.borderBottomColor =
                      "var(--primary)")
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLInputElement).style.borderBottomColor =
                      "var(--outline-variant)")
                  }
                />
              </div>
              <div>
                <label
                  className="label-tech"
                  style={{ display: "block", marginBottom: "0.5rem" }}
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell me about your project..."
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "120px",
                  }}
                  onFocus={(e) =>
                    ((e.target as HTMLTextAreaElement).style.borderBottomColor =
                      "var(--primary)")
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLTextAreaElement).style.borderBottomColor =
                      "var(--outline-variant)")
                  }
                />
              </div>
              <button
                type="submit"
                className="grad-primary"
                disabled={loading}
                style={{
                  padding: "0.9rem",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--on-primary)",
                  transition: "filter var(--transition-std), transform var(--transition-std)",
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (loading) return;
                  const el = e.currentTarget as HTMLElement;
                  el.style.filter = "brightness(1.15)";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  if (loading) return;
                  const el = e.currentTarget as HTMLElement;
                  el.style.filter = "brightness(1)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {loading ? "Sending..." : "Send Message →"}
              </button>
              {result && !sent && (
                <p style={{ 
                  textAlign: "center", 
                  fontSize: "0.8rem", 
                  color: result.includes("Error") ? "#ff5252" : "var(--primary)",
                  marginTop: "-0.5rem"
                }}>
                  {result}
                </p>
              )}
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .contact-grid { gap: 4rem !important; }
        }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </section>
  );
}
