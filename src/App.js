import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import LayoutPage from "./features/layout/LayoutPage";
import UserGuide from "./guide/UserGuide";

export default function App() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <BrowserRouter basename="/monocarton-editor">
      <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh" }}>

        <Header
          onOpenGuide={() => setGuideOpen(true)}
          loading={loading}
          error={error}
        />

        {/* Problem statement banner */}
        <div style={{ background: "#e8f0f7", borderBottom: "1px solid #d0dcea", padding: "14px 32px" }}>
          <p style={{ margin: 0, fontSize: 14, color: "#2c3e50", lineHeight: 1.6 }}>
            <strong>What is Mono?</strong> Enter your 3D carton dimensions and sheet size — Mono automatically calculates the flat dieline size, optimal nesting saving, and best layout for maximum yield. All dimensions in millimetres.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: "#fdecea", border: "1px solid #e74c3c", padding: "10px 32px", fontSize: 13, color: "#c0392b" }}>
            ⚠️ {error}
          </div>
        )}

        <Routes>
          <Route path="/" element={
            <LayoutPage
              onError={setError}
              onLoading={setLoading}
            />
          } />
        </Routes>

        <UserGuide open={guideOpen} onClose={() => setGuideOpen(false)} />

        {/* Footer */}
        <div style={{ borderTop: "1px solid #e0e0e0", padding: "14px 32px", background: "white", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa" }}>
          <span><strong style={{ color: "#1a4a7a" }}>Mono</strong> v2.0 — Monocarton Imposition Planner</span>
          <span>Built by Deepak · Powered by FastAPI + Fabric.js</span>
        </div>
      </div>
    </BrowserRouter>
  );
}