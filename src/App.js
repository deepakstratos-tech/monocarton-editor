import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";

const SCALE = 10;
const BRAND = "#1a4a7a";
const BRAND_LIGHT = "#e8f0f7";
const STRAIGHT_COLOR = "#4F86C6";
const TUMBLE_FLIPPED = "#e67e22";

const API_BASE = "https://web-production-e59f.up.railway.app";

const ALGORITHMS = [
  { id: "straight", label: "Straight", icon: "▲▲▲", desc: "All cartons same direction", endpoint: "/layout/straight", color: "#1565c0" },
  { id: "tumble", label: "Tumble", icon: "▲▼▲", desc: "Alternate rows flipped 180°", endpoint: "/layout/tumble", color: "#6a1b9a" },
  { id: "first_fit", label: "First Fit", icon: "→→→", desc: "Place in first available spot", endpoint: "/layout/first-fit", color: "#27ae60" },
  { id: "first_fit_decreasing", label: "FFD", icon: "↓→→", desc: "Largest first, then First Fit", endpoint: "/layout/first-fit-decreasing", color: "#e67e22" },
  { id: "nfdh", label: "NFDH", icon: "▬▬▬", desc: "Shelf based, tallest first", endpoint: "/layout/nfdh", color: "#c0392b" },
  { id: "best_fit", label: "Best Fit", icon: "◎◎◎", desc: "Least wasted space per shelf", endpoint: "/layout/best-fit", color: "#16a085" },
];

const Tooltip = ({ text }) => (
  <span title={text} style={{ marginLeft: 4, cursor: "help", color: "#aaa", fontSize: 11 }}>ⓘ</span>
);

const StatCard = ({ label, value, color, sub }) => (
  <div style={{ background: "white", borderRadius: 10, padding: "12px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: `4px solid ${color}`, minWidth: 120 }}>
    <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: "800", color }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{sub}</div>}
  </div>
);

export default function App() {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const [cartonW, setCartonW] = useState(6);
  const [cartonH, setCartonH] = useState(9);
  const [sheetW, setSheetW] = useState(23);
  const [sheetH, setSheetH] = useState(36);
  const [margin, setMargin] = useState(1);
  const [nestingPct, setNestingPct] = useState(10);
  const [algorithm, setAlgorithm] = useState("straight");
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#fdf6e3",
      selection: true,
    });
    fabricRef.current = canvas;
    return () => canvas.dispose();
  }, []);

  const fetchLayout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const selected = ALGORITHMS.find(a => a.id === algorithm);
      const response = await fetch(`${API_BASE}${selected.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carton_w: cartonW,
          carton_h: cartonH,
          sheet_w: sheetW,
          sheet_h: sheetH,
          margin: margin,
          nesting_pct: nestingPct,
        }),
      });
      if (!response.ok) throw new Error("Backend error");
      const data = await response.json();
      setStats(data);
      renderLayout(data);
    } catch (err) {
      setError("Could not connect to backend. Make sure it is running.");
    } finally {
      setLoading(false);
    }
  }, [cartonW, cartonH, sheetW, sheetH, margin, nestingPct, algorithm]);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  const fetchCompare = async () => {
    try {
      const response = await fetch(`${API_BASE}/layout/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carton_w: cartonW,
          carton_h: cartonH,
          sheet_w: sheetW,
          sheet_h: sheetH,
          margin: margin,
          nesting_pct: nestingPct,
        }),
      });
      const data = await response.json();
      setComparison(data);
    } catch (err) {
      setError("Could not fetch comparison.");
    }
  };

  const renderLayout = (data) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.setWidth(data.sheet_w * SCALE);
    canvas.setHeight(data.sheet_h * SCALE);

    canvas.add(new fabric.Rect({
      left: 0, top: 0,
      width: data.sheet_w * SCALE, height: data.sheet_h * SCALE,
      fill: "#fdf6e3", stroke: "#333", strokeWidth: 2,
      selectable: false, evented: false,
    }));

    canvas.add(new fabric.Rect({
      left: 0, top: 0,
      width: data.sheet_w * SCALE, height: data.sheet_h * SCALE,
      fill: "transparent",
      stroke: "rgba(231,76,60,0.35)",
      strokeWidth: data.margin * SCALE * 2,
      selectable: false, evented: false,
    }));

    canvas.add(new fabric.Rect({
      left: data.margin * SCALE, top: data.margin * SCALE,
      width: data.usable_w * SCALE, height: data.usable_h * SCALE,
      fill: "rgba(39,174,96,0.04)",
      stroke: "#27ae60", strokeWidth: 1,
      strokeDashArray: [4, 3],
      selectable: false, evented: false,
    }));

    canvas.add(new fabric.Text(`${data.margin}" margin`, {
      left: 4, top: 2, fontSize: 8, fill: "#c0392b",
      selectable: false, evented: false,
    }));

    data.cartons.forEach(carton => drawCarton(canvas, carton));
    canvas.renderAll();
  };

  const drawCarton = (canvas, carton) => {
    const x = carton.x * SCALE;
    const y = carton.y * SCALE;
    const w = carton.w * SCALE;
    const h = carton.h * SCALE;
    const fill = carton.flipped ? TUMBLE_FLIPPED : STRAIGHT_COLOR;
    const stroke = carton.flipped ? "#a04000" : "#1a4a7a";

    const rect = new fabric.Rect({
      left: 0, top: 0,
      width: w - 2, height: h - 2,
      fill, stroke, strokeWidth: 1, opacity: 0.85,
    });

    const arrow = new fabric.Text(carton.flipped ? "▼" : "▲", {
      left: w / 2, top: h / 2 - 8,
      fontSize: 10, fill: "white",
      originX: "center", originY: "center",
    });

    const label = new fabric.Text(`${carton.w}×${carton.h}`, {
      left: w / 2, top: h / 2 + 6,
      fontSize: 7, fill: "white",
      originX: "center", originY: "center",
    });

    canvas.add(new fabric.Group([rect, arrow, label], {
      left: x, top: y,
      hasControls: true, hasBorders: true,
    }));
  };

  const exportSVG = () => {
    const svg = fabricRef.current.toSVG();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mono-layout.svg";
    a.click();
  };

  const exportDXF = () => {
    if (!stats.cartons || stats.cartons.length === 0) return;
    let dxf = `0\nSECTION\n2\nENTITIES\n`;
    dxf += rectDXF(0, 0, stats.sheet_w, stats.sheet_h);
    stats.cartons.forEach(carton => {
      dxf += rectDXF(carton.x, carton.y, carton.w, carton.h);
    });
    dxf += `0\nENDSEC\n0\nEOF`;
    const blob = new Blob([dxf], { type: "application/dxf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mono-layout.dxf";
    a.click();
  };

  const rectDXF = (x, y, w, h) =>
    `0\nLWPOLYLINE\n8\n0\n70\n1\n90\n4\n` +
    `10\n${x}\n20\n${y}\n10\n${x + w}\n20\n${y}\n` +
    `10\n${x + w}\n20\n${y + h}\n10\n${x}\n20\n${y + h}\n0\nSEQLEND\n`;

  const getUtilizationColor = (pct) => {
    const n = parseFloat(pct);
    if (n >= 80) return "#27ae60";
    if (n >= 60) return "#f39c12";
    return "#e74c3c";
  };

  const inputStyle = { width: 72, padding: "7px 8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, marginTop: 4 };
  const labelStyle = { fontSize: 11, color: "#666", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f4f6f9", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ background: BRAND, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26, fontWeight: "900", color: "white", letterSpacing: -1 }}>Mono</span>
            <span style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: "600" }}>v1.1</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 }}>
            Monocarton Imposition Planner — maximise yield, minimise waste
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: error ? "#e74c3c" : loading ? "#f39c12" : "#27ae60" }} />
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
            {error ? "Backend offline" : loading ? "Calculating..." : "Backend connected"}
          </span>
        </div>
      </div>

      {/* PROBLEM STATEMENT */}
      <div style={{ background: BRAND_LIGHT, borderBottom: "1px solid #d0dcea", padding: "14px 32px" }}>
        <p style={{ margin: 0, fontSize: 14, color: "#2c3e50", lineHeight: 1.6 }}>
          <strong>What is Mono?</strong> Mono helps you calculate how many cartons fit on a print sheet and visualises the optimal layout — supporting Straight, Tumble, and four additional algorithms. Select an algorithm below to compare approaches.
        </p>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div style={{ background: "#fdecea", border: "1px solid #e74c3c", padding: "10px 32px", fontSize: 13, color: "#c0392b" }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ padding: "24px 32px", display: "flex", gap: 24, flexWrap: "wrap" }}>

        {/* LEFT PANEL */}
        <div style={{ flex: "0 0 320px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Carton Dimensions */}
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16, borderBottom: "2px solid " + BRAND_LIGHT, paddingBottom: 8 }}>
              📦 Carton Dimensions
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { label: "Width (in)", value: cartonW, set: setCartonW, tip: "Flat width of the carton including glue flaps" },
                { label: "Height (in)", value: cartonH, set: setCartonH, tip: "Flat height of the carton including tuck flaps" },
              ].map(({ label, value, set, tip }) => (
                <div key={label} style={{ flex: 1 }}>
                  <label style={labelStyle}>{label}<Tooltip text={tip} /></label>
                  <input type="number" value={value} onChange={(e) => set(Number(e.target.value))} style={{ ...inputStyle, width: "100%" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Sheet Dimensions */}
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16, borderBottom: "2px solid " + BRAND_LIGHT, paddingBottom: 8 }}>
              🗒️ Sheet Dimensions
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { label: "Width (in)", value: sheetW, set: setSheetW, tip: "Full width of the print sheet" },
                { label: "Height (in)", value: sheetH, set: setSheetH, tip: "Full height of the print sheet" },
              ].map(({ label, value, set, tip }) => (
                <div key={label} style={{ flex: 1 }}>
                  <label style={labelStyle}>{label}<Tooltip text={tip} /></label>
                  <input type="number" value={value} onChange={(e) => set(Number(e.target.value))} style={{ ...inputStyle, width: "100%" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Press Constraints */}
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16, borderBottom: "2px solid " + BRAND_LIGHT, paddingBottom: 8 }}>
              ⚙️ Press Constraints
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { label: "Border Margin (in)", value: margin, set: setMargin, tip: "Margin on all 4 sides" },
                { label: "Nesting Saving %", value: nestingPct, set: setNestingPct, tip: "Vertical space saved per row pair in tumble layout" },
              ].map(({ label, value, set, tip }) => (
                <div key={label} style={{ flex: 1 }}>
                  <label style={labelStyle}>{label}<Tooltip text={tip} /></label>
                  <input type="number" value={value} onChange={(e) => set(Number(e.target.value))} style={{ ...inputStyle, width: "100%" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Algorithm Selector */}
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16, borderBottom: "2px solid " + BRAND_LIGHT, paddingBottom: 8 }}>
              🧮 Algorithm
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ALGORITHMS.map(({ id, label, icon, desc, color }) => (
                <button key={id} onClick={() => setAlgorithm(id)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                  border: `2px solid ${algorithm === id ? color : "#eee"}`,
                  background: algorithm === id ? `${color}15` : "white",
                  textAlign: "left", width: "100%",
                  transition: "all 0.15s",
                }}>
                  <span style={{ fontSize: 18, width: 32, textAlign: "center" }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: "700", color: algorithm === id ? color : "#333" }}>{label}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>{desc}</div>
                  </div>
                  {algorithm === id && (
                    <span style={{ marginLeft: "auto", fontSize: 11, color, fontWeight: "700" }}>ACTIVE</span>
                  )}
                </button>
              ))}
            </div>

            {/* Algorithm notes from backend */}
            {stats.algorithm_notes && (
              <div style={{ marginTop: 12, padding: "8px 12px", background: "#f8f9fa", borderRadius: 6, fontSize: 12, color: "#666", borderLeft: `3px solid ${ALGORITHMS.find(a => a.id === algorithm)?.color}` }}>
                ℹ️ {stats.algorithm_notes}
              </div>
            )}
          </div>

          {/* Tumble info */}
          {algorithm === "tumble" && stats.pair_height > 0 && (
            <div style={{ background: "#fff8e1", border: "1px solid #f9a825", borderRadius: 10, padding: 14, fontSize: 12, color: "#555", lineHeight: 1.6 }}>
              <strong>How Tumble Works:</strong> Each ▲▼ pair takes <strong>{stats.pair_height}"</strong> instead of <strong>{(cartonH * 2).toFixed(1)}"</strong> — saving <strong>{stats.nesting_saving}"</strong> per pair.
            </div>
          )}

          {/* Export */}
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, borderBottom: "2px solid " + BRAND_LIGHT, paddingBottom: 8 }}>
              ⬇️ Export & Tools
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={exportSVG} style={{ padding: "9px 0", borderRadius: 7, border: "none", background: "#27ae60", color: "white", fontWeight: "700", cursor: "pointer", fontSize: 13 }}>
                Export SVG — for Illustrator / Esko
              </button>
              <button onClick={exportDXF} style={{ padding: "9px 0", borderRadius: 7, border: "none", background: BRAND, color: "white", fontWeight: "700", cursor: "pointer", fontSize: 13 }}>
                Export DXF — for ArtiosCAD / AutoCAD
              </button>
              <button onClick={fetchCompare} style={{ padding: "9px 0", borderRadius: 7, border: "none", background: "#6a1b9a", color: "white", fontWeight: "700", cursor: "pointer", fontSize: 13 }}>
                ⚖️ Compare All Algorithms
              </button>
              <button onClick={fetchLayout} style={{ padding: "9px 0", borderRadius: 7, border: "1px solid #ddd", background: "white", color: "#666", fontWeight: "600", cursor: "pointer", fontSize: 13 }}>
                🔄 Reset Layout
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, minWidth: 300 }}>

          {/* Stats */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <StatCard label="Total Cartons" value={stats.total_cartons ?? "—"} color="#1565c0" sub="per sheet" />
            <StatCard
              label="Sheet Utilization"
              value={stats.utilization ? `${stats.utilization}%` : "—"}
              color={getUtilizationColor(stats.utilization)}
              sub={stats.utilization >= 80 ? "Excellent" : stats.utilization >= 60 ? "Moderate" : "Low"}
            />
            <StatCard label="Columns × Rows" value={stats.cartons_per_row ? `${stats.cartons_per_row} × ${stats.num_rows}` : "—"} color="#6a1b9a" sub="layout grid" />
            {algorithm === "tumble" && stats.nesting_saving > 0 && (
              <StatCard label="Nesting Saved" value={`${stats.nesting_saving}"`} color="#e67e22" sub="per row pair" />
            )}
          </div>

          {/* Comparison Table */}
          {comparison && (
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
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        {row.utilization}%
                      </td>
                      <td style={{ padding: "8px 12px", fontSize: 11, color: "#888" }}>
                        {row.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setComparison(null)} style={{ marginTop: 10, fontSize: 11, color: "#aaa", background: "none", border: "none", cursor: "pointer" }}>
                ✕ Close comparison
              </button>
            </div>
          )}

          {/* Canvas */}
          <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>🖼️ Layout Preview</span>
              <span style={{ fontSize: 11, color: loading ? "#f39c12" : "#aaa", fontWeight: "400", textTransform: "none" }}>
                {loading ? "⏳ Fetching from backend..." : "Drag cartons to adjust manually"}
              </span>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12, color: "#555", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 14, height: 14, background: STRAIGHT_COLOR, borderRadius: 3, display: "inline-block" }} /> Normal (▲)
              </span>
              {algorithm === "tumble" && (
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 14, height: 14, background: TUMBLE_FLIPPED, borderRadius: 3, display: "inline-block" }} /> Flipped 180° (▼)
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 14, height: 14, background: "rgba(231,76,60,0.2)", border: "1px solid #e74c3c", borderRadius: 3, display: "inline-block" }} /> Border margin
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 14, height: 14, background: "rgba(39,174,96,0.1)", border: "1px dashed #27ae60", borderRadius: 3, display: "inline-block" }} /> Usable area
              </span>
            </div>

            <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 700 }}>
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid #e0e0e0", padding: "14px 32px", background: "white", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa" }}>
        <span><strong style={{ color: BRAND }}>Mono</strong> v1.1 — Monocarton Imposition Planner</span>
        <span>Built by Deepak · Powered by FastAPI + Fabric.js</span>
      </div>
    </div>
  );
}