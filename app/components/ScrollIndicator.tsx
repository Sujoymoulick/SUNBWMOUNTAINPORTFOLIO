"use client";

export default function ScrollIndicator() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "2.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        animation: "fadeInUp 1s 1.2s both",
        zIndex: 2,
      }}
    >
      <span className="label-tech" style={{ color: "var(--primary-fixed-dim)", opacity: 0.6 }}>
        SCROLL
      </span>
      <div
        style={{
          width: "1px",
          height: "48px",
          background:
            "linear-gradient(to bottom, var(--primary-fixed-dim), transparent)",
          animation: "scrollLine 1.8s ease-in-out infinite",
          transformOrigin: "top",
        }}
      />
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes scrollLine {
          0%   { transform: scaleY(0); opacity: 0; }
          40%  { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
