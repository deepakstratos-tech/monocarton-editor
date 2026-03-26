import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BRAND } from "../config/api";

const Header = ({ onOpenGuide, loading, error, jobCount }) => {
  const location = useLocation();

  const navLink = (path, label, badge) => {
    const active = location.pathname === path;
    return (
      <Link to={path} style={{
        color: active ? "white" : "rgba(255,255,255,0.7)",
        textDecoration: "none",
        fontSize: 13,
        fontWeight: active ? "700" : "400",
        padding: "4px 12px",
        borderRadius: 20,
        background: active ? "rgba(255,255,255,0.2)" : "transparent",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        {label}
        {badge > 0 && (
          <span style={{
            background: "#27ae60", color: "white",
            borderRadius: 10, fontSize: 10,
            padding: "1px 6px", fontWeight: "700",
          }}>
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div style={{ background: BRAND, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: "900", color: "white", letterSpacing: -1 }}>Mono</span>
            <span style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: "600" }}>v2.0</span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: "flex", gap: 4 }}>
          {navLink("/", "🖨️ Layout")}
          {navLink("/jobs", "📋 Jobs", jobCount)}
          {navLink("/planner", "🗓️ Planner")}
        </nav>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={onOpenGuide}
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "6px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: "600" }}>
          📖 Guide
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: error ? "#e74c3c" : loading ? "#f39c12" : "#27ae60" }} />
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
            {error ? "Offline" : loading ? "Loading..." : "Connected"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
