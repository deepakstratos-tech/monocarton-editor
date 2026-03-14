import React from "react";

const StatCard = ({ label, value, color, sub }) => (
  <div style={{ background: "white", borderRadius: 10, padding: "12px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: `4px solid ${color}`, minWidth: 120 }}>
    <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: "800", color }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{sub}</div>}
  </div>
);

export default StatCard;