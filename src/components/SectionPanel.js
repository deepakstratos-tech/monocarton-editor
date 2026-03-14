import React from "react";
import { BRAND, BRAND_LIGHT } from "../config/api";

const SectionPanel = ({ title, children }) => (
  <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
    <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16, borderBottom: "2px solid " + BRAND_LIGHT, paddingBottom: 8 }}>
      {title}
    </div>
    {children}
  </div>
);

export default SectionPanel;