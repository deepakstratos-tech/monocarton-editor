import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import LayoutPage from "./features/layout/LayoutPage";
import JobsPage from "./features/jobs/JobsPage";
import PlannerPage from "./features/jobs/PlannerPage";
import UserGuide from "./guide/UserGuide";
import { BRAND, BRAND_LIGHT } from "./config/api";

export default function App() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);

  return (
    <BrowserRouter basename="/monocarton-editor">
      <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh" }}>

        <Header
          onOpenGuide={() => setGuideOpen(true)}
          loading={loading}
          error={error}
          jobCount={jobs.length}
        />

        {error && (
          <div style={{ background: "#fdecea", border: "1px solid #e74c3c", padding: "10px 32px", fontSize: 13, color: "#c0392b" }}>
            ⚠️ {error}
          </div>
        )}

        <Routes>
          <Route path="/" element={
            <LayoutPage onError={setError} onLoading={setLoading} />
          } />
          <Route path="/jobs" element={
            <JobsPage jobs={jobs} setJobs={setJobs} />
          } />
          <Route path="/planner" element={
            <PlannerPage jobs={jobs} />
          } />
        </Routes>

        <UserGuide open={guideOpen} onClose={() => setGuideOpen(false)} />

        <div style={{ borderTop: "1px solid #e0e0e0", padding: "14px 32px", background: "white", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa" }}>
          <span><strong style={{ color: BRAND }}>Mono</strong> v2.0 — Monocarton Imposition Planner</span>
          <span>Built by Deepak · Powered by FastAPI + Fabric.js</span>
        </div>
      </div>
    </BrowserRouter>
  );
}
