import React from "react";
import { ALGORITHMS, BRAND, BRAND_LIGHT } from "../../config/api";
import SectionPanel from "../../components/SectionPanel";

const AlgorithmSelector = ({ algorithm, setAlgorithm, algorithmNotes }) => (
  <SectionPanel title="🧮 Algorithm">
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {ALGORITHMS.map(({ id, label, icon, desc, color }) => (
        <button key={id} onClick={() => setAlgorithm(id)} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 12px", borderRadius: 8, cursor: "pointer",
          border: `2px solid ${algorithm === id ? color : "#eee"}`,
          background: algorithm === id ? `${color}15` : "white",
          textAlign: "left", width: "100%",
        }}>
          <span style={{ fontSize: 16, width: 28, textAlign: "center" }}>{icon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: "700", color: algorithm === id ? color : "#333" }}>{label}</div>
            <div style={{ fontSize: 11, color: "#888" }}>{desc}</div>
          </div>
          {algorithm === id && (
            <span style={{ marginLeft: "auto", fontSize: 10, color, fontWeight: "700" }}>ACTIVE</span>
          )}
        </button>
      ))}
    </div>
    {algorithmNotes && (
      <div style={{ marginTop: 12, padding: "8px 12px", background: "#f8f9fa", borderRadius: 6, fontSize: 12, color: "#666", borderLeft: `3px solid ${ALGORITHMS.find(a => a.id === algorithm)?.color}` }}>
        ℹ️ {algorithmNotes}
      </div>
    )}
  </SectionPanel>
);

export default AlgorithmSelector;