import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fabric } from "fabric";
import { BRAND, BRAND_LIGHT, API_BASE, SCALE } from "../../config/api";
import SectionPanel from "../../components/SectionPanel";
import StatCard from "../../components/StatCard";
import Tooltip from "../../components/Tooltip";

const inputStyle = {
  width: "100%", padding: "7px 8px", borderRadius: 6,
  border: "1px solid #ddd", fontSize: 13, marginTop: 4,
  boxSizing: "border-box",
};
const labelStyle = {
  fontSize: 11, color: "#666", fontWeight: "700",
  textTransform: "uppercase", letterSpacing: 0.6,
};

const PlannerPage = ({ jobs }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const [sheetW, setSheetW] = useState(700);
  const [sheetH, setSheetH] = useState(1000);
  const [margin, setMargin] = useState(10);
  const [overrunTolerance, setOverrunTolerance] = useState(5);
  const [gsmTolerance, setGsmTolerance] = useState(10);

  const [compatibility, setCompatibility] = useState(null);
  const [alignment, setAlignment] = useState(null);
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("compatibility");

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#fdf6e3",
      selection: false,
    });
    fabricRef.current = canvas;
    return () => canvas.dispose();
  }, []);

  useEffect(() => {
    if (layout) renderLayout(layout);
  }, [layout]);

  const buildRequest = () => {
  const req = {
    sheet_w: sheetW,
    sheet_h: sheetH,
    margin,
    overrun_tolerance_pct: overrunTolerance,
    gsm_tolerance: gsmTolerance,
    jobs: jobs.map(j => ({
      job_id: j.job_id,
      client_name: j.client_name,
      product_name: j.product_name,
      style: j.style,
      length: j.length,
      width: j.width,
      height: j.height,
      quantity: j.quantity,
      paper_type: j.paper_type,
      gsm: j.gsm,
      lamination: j.lamination,
      colours: j.colours,
      stamping: j.stamping,
    })),
  };
  console.log("Request:", JSON.stringify(req, null, 2));
  return req;
};

  const checkCompatibility = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/jobs/check-compatibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequest()),
      });
      const data = await response.json();
      setCompatibility(data);
      setActiveTab("compatibility");
    } catch (err) {
      setError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const analyseAlignment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/jobs/analyse-alignment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequest()),
      });
      const data = await response.json();
      setAlignment(data);
      setActiveTab("alignment");
    } catch (err) {
      setError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const runLayout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/jobs/multi-sku-layout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequest()),
      });
      const data = await response.json();

      // DEBUG — remove after fixing
    console.log("Layout data:", JSON.stringify(data, null, 2));
    console.log("Total cartons:", data.total_cartons_per_sheet);
    console.log("Sheet size:", data.sheet_w, "x", data.sheet_h);
    console.log("Cartons array length:", data.cartons?.length);
    console.log("First carton:", data.cartons?.[0]);
    console.log("Last carton:", data.cartons?.[data.cartons?.length - 1]);


      setLayout(data);
      setActiveTab("layout");
    } catch (err) {
      setError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const renderLayout = (data) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  canvas.clear();
  canvas.setWidth(data.sheet_w * SCALE);
  canvas.setHeight(data.sheet_h * SCALE);

  // Sheet background
  canvas.add(new fabric.Rect({
    left: 0, top: 0,
    width: data.sheet_w * SCALE, height: data.sheet_h * SCALE,
    fill: "#fdf6e3", stroke: "#333", strokeWidth: 2,
    selectable: false, evented: false,
  }));

  // Margin border
  canvas.add(new fabric.Rect({
    left: 0, top: 0,
    width: data.sheet_w * SCALE, height: data.sheet_h * SCALE,
    fill: "transparent",
    stroke: "rgba(231,76,60,0.35)",
    strokeWidth: data.margin * SCALE * 2,
    selectable: false, evented: false,
  }));

  // Margin label
  canvas.add(new fabric.Text(`${data.margin}mm margin`, {
    left: 4, top: 2, fontSize: 8, fill: "#c0392b",
    selectable: false, evented: false,
  }));

  // Separate cartons into artwork vs plain
  const cartonsWithArtwork = [];
  const cartonsWithoutArtwork = [];

  data.cartons.forEach(carton => {
    const job = jobs.find(j => j.job_id === carton.job_id);
    const design = job?.design;
    if (design?.cropped_image_base64) {
      cartonsWithArtwork.push({ carton, design });
    } else {
      cartonsWithoutArtwork.push({ carton });
    }
  });

  // Draw plain cartons immediately
  cartonsWithoutArtwork.forEach(({ carton }) => {
    const x = carton.x * SCALE;
    const y = carton.y * SCALE;
    const w = carton.w * SCALE;
    const h = carton.h * SCALE;

    const rect = new fabric.Rect({
      left: 0, top: 0,
      width: w - 1, height: h - 1,
      fill: carton.color,
      stroke: "#fff", strokeWidth: 1, opacity: 0.85,
    });

    const label = new fabric.Text(
      (carton.product_name || "").substring(0, 8),
      {
        left: w / 2, top: h / 2,
        fontSize: Math.max(5, Math.min(9, h / 10)),
        fill: "white",
        originX: "center", originY: "center",
        fontWeight: "bold",
      }
    );

    canvas.add(new fabric.Group([rect, label], {
      left: x, top: y, selectable: false,
    }));
  });

  // Draw artwork cartons using fabric.Image.fromURL
  if (cartonsWithArtwork.length === 0) {
    canvas.renderAll();
    return;
  }

  let loadedCount = 0;
  const total = cartonsWithArtwork.length;

  const checkAndRender = () => {
    loadedCount++;
    if (loadedCount === total) canvas.renderAll();
  };

  cartonsWithArtwork.forEach(({ carton, design }) => {
    const x = carton.x * SCALE;
    const y = carton.y * SCALE;
    const w = carton.w * SCALE;
    const h = carton.h * SCALE;

    fabric.Image.fromURL(
      `data:image/png;base64,${design.cropped_image_base64}`,
      (fabricImg) => {
        fabricImg.set({
          left: 0, top: 0,
          scaleX: (w - 2) / fabricImg.width,
          scaleY: (h - 2) / fabricImg.height,
        });

        const border = new fabric.Rect({
          left: 0, top: 0,
          width: w - 2, height: h - 2,
          fill: "transparent",
          stroke: "#999", strokeWidth: 1,
        });

        canvas.add(new fabric.Group([fabricImg, border], {
          left: x, top: y, selectable: false,
        }));

        checkAndRender();
      },
      { crossOrigin: "anonymous" }
    );
  });
};

  const exportDXF = () => {
    if (!layout?.cartons?.length) return;
    const rectDXF = (x, y, w, h) =>
      `0\nLWPOLYLINE\n8\n0\n70\n1\n90\n4\n10\n${x}\n20\n${y}\n10\n${x+w}\n20\n${y}\n10\n${x+w}\n20\n${y+h}\n10\n${x}\n20\n${y+h}\n0\nSEQLEND\n`;
    let dxf = `0\nSECTION\n2\nENTITIES\n`;
    dxf += rectDXF(0, 0, layout.sheet_w, layout.sheet_h);
    layout.cartons.forEach(c => { dxf += rectDXF(c.x, c.y, c.w, c.h); });
    dxf += `0\nENDSEC\n0\nEOF`;
    const blob = new Blob([dxf], { type: "application/dxf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mono-multi-sku-layout.dxf";
    a.click();
  };

  if (jobs.length < 2) {
    return (
      <div style={{ padding: "24px 32px", background: "#f4f6f9", minHeight: "calc(100vh - 120px)" }}>
        <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>Not enough jobs</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Add at least 2 jobs to plan an imposition</div>
          <button onClick={() => navigate("/jobs")} style={{
            padding: "10px 20px", borderRadius: 8, border: "none",
            background: BRAND, color: "white", fontWeight: "700", cursor: "pointer",
          }}>
            ← Go to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 32px", background: "#f4f6f9", minHeight: "calc(100vh - 120px)" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: BRAND, fontSize: 20 }}>🗓️ Imposition Planner</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>
            {jobs.length} jobs loaded — check compatibility, analyse alignment, then run layout
          </p>
        </div>
        <button onClick={() => navigate("/jobs")} style={{
          padding: "8px 16px", borderRadius: 8, border: "1px solid #ddd",
          background: "white", color: "#666", cursor: "pointer", fontSize: 13,
        }}>
          ← Back to Jobs
        </button>
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>

        {/* LEFT PANEL */}
        <div style={{ flex: "0 0 320px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Jobs loaded */}
          <SectionPanel title="📦 Jobs in Plan">
            {jobs.map((job, idx) => (
              <div key={job.job_id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 0", borderBottom: "1px solid #f0f0f0",
              }}>
                <div style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: ["#4F86C6","#e67e22","#27ae60","#9b59b6","#e74c3c","#1abc9c","#f39c12","#2c3e50"][idx % 8],
                  flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: "700", color: "#333" }}>{job.product_name}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{job.client_name} · {job.quantity.toLocaleString()} units</div>
                </div>
              </div>
            ))}
          </SectionPanel>

          {/* Sheet settings */}
          <SectionPanel title="🗒️ Sheet Settings">
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              {[
                { label: "Width (mm)", value: sheetW, set: setSheetW },
                { label: "Height (mm)", value: sheetH, set: setSheetH },
              ].map(({ label, value, set }) => (
                <div key={label} style={{ flex: 1 }}>
                  <label style={labelStyle}>{label}</label>
                  <input type="number" style={inputStyle} value={value}
                    onChange={e => set(Number(e.target.value))} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              {[
                { label: "Margin (mm)", value: margin, set: setMargin },
                { label: "GSM Tolerance", value: gsmTolerance, set: setGsmTolerance, tip: "Acceptable GSM difference between jobs" },
              ].map(({ label, value, set, tip }) => (
                <div key={label} style={{ flex: 1 }}>
                  <label style={labelStyle}>{label}{tip && <Tooltip text={tip} />}</label>
                  <input type="number" style={inputStyle} value={value}
                    onChange={e => set(Number(e.target.value))} />
                </div>
              ))}
            </div>
            <div>
              <label style={labelStyle}>Overrun Tolerance % <Tooltip text="Maximum acceptable overrun per job" /></label>
              <input type="number" style={inputStyle} value={overrunTolerance}
                onChange={e => setOverrunTolerance(Number(e.target.value))} />
            </div>
          </SectionPanel>

          {/* Actions */}
          <SectionPanel title="⚡ Actions">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={checkCompatibility} disabled={loading} style={{
                padding: "10px 0", borderRadius: 7, border: "none",
                background: "#27ae60", color: "white", fontWeight: "700",
                cursor: "pointer", fontSize: 13, opacity: loading ? 0.7 : 1,
              }}>
                1. Check Compatibility
              </button>
              <button onClick={analyseAlignment} disabled={loading} style={{
                padding: "10px 0", borderRadius: 7, border: "none",
                background: "#6a1b9a", color: "white", fontWeight: "700",
                cursor: "pointer", fontSize: 13, opacity: loading ? 0.7 : 1,
              }}>
                2. Analyse Impression Alignment
              </button>
              <button onClick={runLayout} disabled={loading} style={{
                padding: "10px 0", borderRadius: 7, border: "none",
                background: BRAND, color: "white", fontWeight: "700",
                cursor: "pointer", fontSize: 13, opacity: loading ? 0.7 : 1,
              }}>
                3. Run Multi-SKU Layout
              </button>
              {layout && (
                <button onClick={exportDXF} style={{
                  padding: "10px 0", borderRadius: 7, border: "none",
                  background: "#16a085", color: "white", fontWeight: "700",
                  cursor: "pointer", fontSize: 13,
                }}>
                  ⬇️ Export DXF
                </button>
              )}
            </div>
            {loading && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#888", textAlign: "center" }}>
                ⏳ Processing...
              </div>
            )}
            {error && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#e74c3c" }}>
                ⚠️ {error}
              </div>
            )}
          </SectionPanel>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, minWidth: 300 }}>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {[
              { id: "compatibility", label: "Compatibility" },
              { id: "alignment", label: "Impression Alignment" },
              { id: "layout", label: "Layout Preview" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: "8px 16px", borderRadius: 8, border: "none",
                background: activeTab === tab.id ? BRAND : "white",
                color: activeTab === tab.id ? "white" : "#666",
                fontWeight: activeTab === tab.id ? "700" : "400",
                cursor: "pointer", fontSize: 13,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* COMPATIBILITY TAB */}
          {activeTab === "compatibility" && (
            <div>
              {!compatibility ? (
                <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                  <div style={{ fontSize: 13, color: "#888" }}>Click "Check Compatibility" to see if your jobs can be combined on one sheet.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Status banner */}
                  <div style={{
                    background: compatibility.compatible ? "#e8f5e9" : "#fdecea",
                    border: `1px solid ${compatibility.compatible ? "#66bb6a" : "#e74c3c"}`,
                    borderRadius: 10, padding: 16,
                  }}>
                    <div style={{ fontWeight: "800", fontSize: 16, color: compatibility.compatible ? "#27ae60" : "#e74c3c", marginBottom: 4 }}>
                      {compatibility.compatible ? "✅ All jobs are compatible" : "❌ Jobs have compatibility issues"}
                    </div>
                    {compatibility.notes.map((note, i) => (
                      <div key={i} style={{ fontSize: 13, color: "#555" }}>{note}</div>
                    ))}
                  </div>

                  {/* Groups */}
                  {compatibility.groups.length > 1 && (
                    <div style={{ background: "white", borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                      <div style={{ fontWeight: "700", color: BRAND, marginBottom: 10, fontSize: 13, textTransform: "uppercase" }}>Compatible Groups</div>
                      {compatibility.groups.map((group, idx) => (
                        <div key={idx} style={{ background: "#f8f9fa", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: "700", color: "#555", marginBottom: 6 }}>Group {idx + 1} — Can be imposed together</div>
                          {group.map(jobId => {
                            const job = jobs.find(j => j.job_id === jobId);
                            return job ? (
                              <div key={jobId} style={{ fontSize: 12, color: "#333", padding: "2px 0" }}>
                                • {job.product_name} ({job.client_name})
                              </div>
                            ) : null;
                          })}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Issues */}
                  {compatibility.issues.length > 0 && (
                    <div style={{ background: "white", borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                      <div style={{ fontWeight: "700", color: BRAND, marginBottom: 10, fontSize: 13, textTransform: "uppercase" }}>Issues Found</div>
                      {compatibility.issues.map((issue, idx) => {
                        const jobA = jobs.find(j => j.job_id === issue.job_id_a);
                        const jobB = jobs.find(j => j.job_id === issue.job_id_b);
                        return (
                          <div key={idx} style={{
                            background: issue.issue_type === "HARD" ? "#fdecea" : "#fff8e1",
                            border: `1px solid ${issue.issue_type === "HARD" ? "#e74c3c" : "#f9a825"}`,
                            borderRadius: 8, padding: 10, marginBottom: 8,
                          }}>
                            <div style={{ fontSize: 11, fontWeight: "700", color: issue.issue_type === "HARD" ? "#e74c3c" : "#f39c12", marginBottom: 4 }}>
                              {issue.issue_type === "HARD" ? "🚫 Hard Constraint" : "⚠️ Soft Warning"} — {issue.field.replace(/_/g, " ").toUpperCase()}
                            </div>
                            <div style={{ fontSize: 12, color: "#555" }}>{issue.message}</div>
                            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                              {jobA?.product_name} vs {jobB?.product_name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ALIGNMENT TAB */}
          {activeTab === "alignment" && (
            <div>
              {!alignment ? (
                <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                  <div style={{ fontSize: 13, color: "#888" }}>Click "Analyse Impression Alignment" to find the best layout for color consistency.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Recommendation */}
                  <div style={{ background: "#e8f0f7", border: "1px solid #b3cce8", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontWeight: "700", color: BRAND, marginBottom: 4, fontSize: 14 }}>📊 Recommendation</div>
                    <div style={{ fontSize: 13, color: "#333" }}>{alignment.recommendation}</div>
                  </div>

                  {/* Best option */}
                  <div style={{ background: "white", borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    <div style={{ fontWeight: "700", color: BRAND, marginBottom: 12, fontSize: 13, textTransform: "uppercase" }}>
                      🏆 Best Option — Score: {(alignment.best_option.alignment_score * 100).toFixed(1)}%
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                      <StatCard label="Target Impressions" value={alignment.best_option.target_impressions} color={BRAND} sub="press runs" />
                      <StatCard label="Alignment Score" value={`${(alignment.best_option.alignment_score * 100).toFixed(1)}%`} color="#27ae60" sub="color consistency" />
                      <StatCard label="Max Overrun" value={`${alignment.best_option.max_overrun_pct}%`} color={alignment.best_option.max_overrun_pct > 5 ? "#e74c3c" : "#27ae60"} sub="waste" />
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: BRAND_LIGHT }}>
                          <th style={{ padding: "8px 12px", textAlign: "left", color: BRAND }}>Job</th>
                          <th style={{ padding: "8px 12px", textAlign: "center", color: BRAND }}>Cartons/Sheet</th>
                          <th style={{ padding: "8px 12px", textAlign: "center", color: BRAND }}>Impressions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job, idx) => (
                          <tr key={job.job_id} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "8px 12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: ["#4F86C6","#e67e22","#27ae60","#9b59b6","#e74c3c","#1abc9c"][idx % 6] }} />
                                {job.product_name}
                              </div>
                            </td>
                            <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700" }}>
                              {alignment.best_option.cartons_per_job[job.job_id] || "—"}
                            </td>
                            <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: BRAND }}>
                              {alignment.best_option.impressions_per_job[job.job_id] || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* All options */}
                  {alignment.all_options.length > 1 && (
                    <div style={{ background: "white", borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                      <div style={{ fontWeight: "700", color: BRAND, marginBottom: 12, fontSize: 13, textTransform: "uppercase" }}>
                        All Options (Top {alignment.all_options.length})
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: BRAND_LIGHT }}>
                            <th style={{ padding: "6px 10px", textAlign: "left", color: BRAND }}>Rank</th>
                            <th style={{ padding: "6px 10px", textAlign: "center", color: BRAND }}>Alignment</th>
                            <th style={{ padding: "6px 10px", textAlign: "center", color: BRAND }}>Impressions</th>
                            <th style={{ padding: "6px 10px", textAlign: "center", color: BRAND }}>Utilization</th>
                            <th style={{ padding: "6px 10px", textAlign: "center", color: BRAND }}>Max Overrun</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alignment.all_options.map((opt, idx) => (
                            <tr key={idx} style={{
                              background: idx === 0 ? "#e8f5e9" : idx % 2 === 0 ? "#f9f9f9" : "white",
                              borderBottom: "1px solid #eee",
                            }}>
                              <td style={{ padding: "6px 10px", fontWeight: idx === 0 ? "700" : "400" }}>
                                {idx === 0 ? "🏆 " : ""}{idx + 1}
                              </td>
                              <td style={{ padding: "6px 10px", textAlign: "center", fontWeight: "700", color: idx === 0 ? "#27ae60" : "#333" }}>
                                {(opt.alignment_score * 100).toFixed(1)}%
                              </td>
                              <td style={{ padding: "6px 10px", textAlign: "center" }}>{opt.target_impressions}</td>
                              <td style={{ padding: "6px 10px", textAlign: "center" }}>{opt.utilization}%</td>
                              <td style={{ padding: "6px 10px", textAlign: "center", color: opt.max_overrun_pct > 5 ? "#e74c3c" : "#27ae60" }}>
                                {opt.max_overrun_pct}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* LAYOUT TAB */}
{activeTab === "layout" && (
  <div>
    {!layout ? (
      <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: 13, color: "#888" }}>Click "Run Multi-SKU Layout" to see the full imposition layout.</div>
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* ... all your stats, tables etc ... */}
      </div>
    )}
  </div>
)}

{/* Canvas — ALWAYS rendered, visibility toggled */}
<div style={{ display: activeTab === "layout" && layout ? "block" : "none" }}>
  <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
    <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>
      🖼️ Layout Preview
    </div>
    {layout && (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        {layout.jobs_summary.map((jobSummary) => {
          const job = jobs.find(j => j.job_id === jobSummary.job_id);
          return (
            <div key={jobSummary.job_id} style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, background: "#f8f9fa",
              borderRadius: 6, padding: "4px 8px",
            }}>
              {job?.design?.cropped_image_base64 ? (
                <img
                  src={`data:image/png;base64,${job.design.cropped_image_base64}`}
                  alt={jobSummary.product_name}
                  style={{ width: 20, height: 20, objectFit: "cover", borderRadius: 3, border: "1px solid #eee" }}
                />
              ) : (
                <div style={{ width: 12, height: 12, borderRadius: 3, background: jobSummary.color }} />
              )}
              <span>{jobSummary.product_name}</span>
            </div>
          );
        })}
      </div>
    )}
    <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 700 }}>
      <canvas ref={canvasRef} />
    </div>
  </div>
</div>
        </div>
      </div>
    </div>
  );
};

export default PlannerPage;
