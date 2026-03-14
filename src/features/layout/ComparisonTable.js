import React from "react";
import { BRAND, BRAND_LIGHT } from "../../config/api";

const ComparisonTable = ({ comparison, onClose }) => {
  if (!comparison) return null;

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>⚖️ Algorithm Comparison</span>
        <span style={{ fontSize: 11, color: "#27ae60", fontWeight: "700" }}>
          Best: {comparison.best_algorithm} ({comparison.best_total} cartons)
        </span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: BRAND_LIGHT }}>
            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: BRAND }}>Algorithm</th>
            <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: BRAND }}>Cartons</th>
            <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: BRAND }}>Utilization</th>
            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: BRAND }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {comparison.comparison.map((row, idx) => (
            <tr key={row.algorithm} style={{
              background: idx === 0 ? "#e8f5e9" : idx % 2 === 0 ? "#f9f9f9" : "white",
              borderBottom: "1px solid #eee"
            }}>
              <td style={{ padding: "8px 12px", fontWeight: idx === 0 ? "700" : "400" }}>
                {idx === 0 && "🏆 "}{row.algorithm.replace(/_/g, " ").toUpperCase()}
              </td>
              <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: idx === 0 ? "#27ae60" : "#333" }}>
                {row.total_cartons}
              </td>
              <td style={{ padding: "8px 12px", textAlign: "center" }}>{row.utilization}%</td>
              <td style={{ padding: "8px 12px", fontSize: 11, color: "#888" }}>{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={onClose} style={{ marginTop: 10, fontSize: 11, color: "#aaa", background: "none", border: "none", cursor: "pointer" }}>
        ✕ Close comparison
      </button>
    </div>
  );
};

export default ComparisonTable;