import React from "react";
import { BRAND } from "../config/api";

const Header = ({ onOpenGuide, backendStatus, loading, error }) => (
  <div style={{ background: BRAND, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 26, fontWeight: "900", color: "white", letterSpacing: -1 }}>Mono</span>
        <span style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: "600" }}>v2.0</span>
      </div>
      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 }}>
        Monocarton Imposition Planner — maximise yield, minimise waste
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <button
        onClick={onOpenGuide}
        style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "6px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: "600" }}>
        📖 User Guide
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: error ? "#e74c3c" : loading ? "#f39c12" : "#27ae60" }} />
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
          {error ? "Backend offline" : loading ? "Calculating..." : "Backend connected"}
        </span>
      </div>
    </div>
  </div>
);

export default Header;