import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

const SCALE = 10;
const BRAND = "#1a4a7a";
const BRAND_LIGHT = "#e8f0f7";
const STRAIGHT_COLOR = "#4F86C6";
const TUMBLE_NORMAL = "#4F86C6";
const TUMBLE_FLIPPED = "#e67e22";

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
  const [layoutType, setLayoutType] = useState("straight");
  const [stats, setStats] = useState({});

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#fdf6e3",
      selection: true,
    });
    fabricRef.current = canvas;
    return () => canvas.dispose();
  }, []);

  useEffect(() => {
    drawLayout();
  }, [cartonW, cartonH, sheetW, sheetH, margin, nestingPct, layoutType]);

  const calcTumbleRows = (usableH, cartonH, nestingPct) => {
    const nestingSaving = cartonH * (nestingPct / 100);
    const pairHeight = cartonH * 2 - nestingSaving;
    const fullPairs = Math.floor(usableH / pairHeight);
    const remainingH = usableH - fullPairs * pairHeight;
    const extraRow = remainingH >= cartonH ? 1 : 0;

    const rows = [];
    let currentY = 0;
    for (let i = 0; i < fullPairs; i++) {
      rows.push({ y: currentY, flipped: false });
      currentY += cartonH;
      rows.push({ y: currentY - nestingSaving, flipped: true });
      currentY += cartonH - nestingSaving;
    }
    if (extraRow) rows.push({ y: currentY, flipped: false });

    return { rows, nestingSaving, pairHeight };
  };

  const getUtilizationColor = (pct) => {
    const n = parseFloat(pct);
    if (n >= 80) return "#27ae60";
    if (n >= 60) return "#f39c12";
    return "#e74c3c";
  };

  const drawLayout = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.setWidth(sheetW * SCALE);
    canvas.setHeight(sheetH * SCALE);

    const usableW = sheetW - margin * 2;
    const usableH = sheetH - margin * 2;
    const offsetX = margin * SCALE;
    const offsetY = margin * SCALE;

    // Sheet background
    canvas.add(new fabric.Rect({
      left: 0, top: 0,
      width: sheetW * SCALE, height: sheetH * SCALE,
      fill: "#fdf6e3", stroke: "#333", strokeWidth: 2,
      selectable: false, evented: false,
    }));

    // Margin border
    canvas.add(new fabric.Rect({
      left: 0, top: 0,
      width: sheetW * SCALE, height: sheetH * SCALE,
      fill: "transparent",
      stroke: "#fdf6e3",
      strokeWidth: margin * SCALE * 2,
      selectable: false, evented: false,
    }));

    // Usable area
    canvas.add(new fabric.Rect({
      left: offsetX, top: offsetY,
      width: usableW * SCALE, height: usableH * SCALE,
      fill: "rgba(39,174,96,0.04)",
      stroke: "#27ae60", strokeWidth: 1,
      strokeDashArray: [4, 3],
      selectable: false, evented: false,
    }));

    // Margin label
    canvas.add(new fabric.Text(`${margin}" margin`, {
      left: 4, top: 2, fontSize: 8, fill: "#c0392b",
      selectable: false, evented: false,
    }));

    if (layoutType === "straight") {
      const perRow = Math.floor(usableW / cartonW);
      const numRows = Math.floor(usableH / cartonH);
      const total = perRow * numRows;
      const utilization = ((total * cartonW * cartonH) / (usableW * usableH) * 100).toFixed(1);
      setStats({ perRow, numRows, total, utilization, nestingSaving: null, pairHeight: null });

      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < perRow; col++) {
          const x = offsetX + col * cartonW * SCALE;
          const y = offsetY + row * cartonH * SCALE;
          drawCarton(canvas, x, y, cartonW, cartonH, false);
        }
      }
    } else {
      const perRow = Math.floor(usableW / cartonW);
      const { rows, nestingSaving, pairHeight } = calcTumbleRows(usableH, cartonH, nestingPct);
      const total = perRow * rows.length;
      const utilization = ((total * cartonW * cartonH) / (usableW * usableH) * 100).toFixed(1);
      setStats({ perRow, numRows: rows.length, total, utilization, nestingSaving: nestingSaving.toFixed(2), pairHeight: pairHeight.toFixed(2) });

      rows.forEach(({ y: rowY, flipped }) => {
        for (let col = 0; col < perRow; col++) {
          const x = offsetX + col * cartonW * SCALE;
          const y = offsetY + rowY * SCALE;
          drawCarton(canvas, x, y, cartonW, cartonH, flipped);
        }
      });
    }

    canvas.renderAll();
  };

  const drawCarton = (canvas, x, y, w, h, flipped) => {
    const fill = flipped ? TUMBLE_FLIPPED : STRAIGHT_COLOR;
    const stroke = flipped ? "#a04000" : "#1a4a7a";

    const rect = new fabric.Rect({
      left: 0, top: 0,
      width: w * SCALE - 2, height: h * SCALE - 2,
      fill, stroke, strokeWidth: 1, opacity: 0.85,
    });

    const arrow = new fabric.Text(flipped ? "▼" : "▲", {
      left: (w * SCALE) / 2, top: (h * SCALE) / 2 - 8,
      fontSize: 10, fill: "white",
      originX: "center", originY: "center",
    });

    const label = new fabric.Text(`${w}×${h}`, {
      left: (w * SCALE) / 2, top: (h * SCALE) / 2 + 6,
      fontSize: 7, fill: "white",
      originX: "center", originY: "center",
    });

    canvas.add(new fabric.Group([rect, arrow, label], {
      left: x, top: y, hasControls: true, hasBorders: true,
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
    const usableW = sheetW - margin * 2;
    const usableH = sheetH - margin * 2;
    const offsetX = margin;
    const offsetY = margin;
    const perRow = Math.floor(usableW / cartonW);

    let rowYList = [];
    if (layoutType === "straight") {
      const numRows = Math.floor(usableH / cartonH);
      for (let r = 0; r < numRows; r++) rowYList.push(r * cartonH);
    } else {
      const { rows } = calcTumbleRows(usableH, cartonH, nestingPct);
      rowYList = rows.map(r => r.y);
    }

    let dxf = `0\nSECTION\n2\nENTITIES\n`;
    dxf += rectDXF(0, 0, sheetW, sheetH);
    rowYList.forEach(rowY => {
      for (let col = 0; col < perRow; col++) {
        dxf += rectDXF(offsetX + col * cartonW, offsetY + rowY, cartonW, cartonH);
      }
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
    `10\n${x}\n20\n${y}\n10\n${x+w}\n20\n${y}\n` +
    `10\n${x+w}\n20\n${y+h}\n10\n${x}\n20\n${y+h}\n0\nSEQLEND\n`;

  const inputStyle = { width: 72, padding: "7px 8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, marginTop: 4, outline: "none" };
  const labelStyle = { fontSize: 11, color: "#666", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f4f6f9", minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <div style={{ background: BRAND, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26, fontWeight: "900", color: "white", letterSpacing: -1 }}>Mono</span>
            <span style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: "600" }}>v1.0</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 }}>
            Monocarton Imposition Planner — maximise yield, minimise waste
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "right" }}>
          Built for packaging professionals
        </div>
      </div>

      {/* ── PROBLEM STATEMENT BANNER ── */}
      <div style={{ background: BRAND_LIGHT, borderBottom: "1px solid #d0dcea", padding: "14px 32px" }}>
        <p style={{ margin: 0, fontSize: 14, color: "#2c3e50", lineHeight: 1.6 }}>
          <strong>What is Mono?</strong> Mono helps you calculate how many cartons fit on a print sheet and visualises the optimal layout — supporting both <strong>Straight</strong> (all cartons same direction) and <strong>Tumble</strong> (alternate rows flipped 180° for tighter nesting) imposition. Enter your job specs below to get started.
        </p>
      </div>

      <div style={{ padding: "24px 32px", display: "flex", gap: 24, flexWrap: "wrap" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ flex: "0 0 320px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Job Setup */}
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

          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16, borderBottom: "2px solid " + BRAND_LIGHT, paddingBottom: 8 }}>
              ⚙️ Press Constraints
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { label: "Border Margin (in)", value: margin, set: setMargin, tip: "Margin applied on all 4 sides for gripper, side lay and bleed" },
                { label: "Nesting Saving %", value: nestingPct, set: setNestingPct, tip: "How much vertical space is saved per row pair in tumble layout due to profile nesting. Depends on carton shape." },
              ].map(({ label, value, set, tip }) => (
                <div key={label} style={{ flex: 1, minWidth: 100 }}>
                  <label style={labelStyle}>{label}<Tooltip text={tip} /></label>
                  <input type="number" value={value} onChange={(e) => set(Number(e.target.value))} style={{ ...inputStyle, width: "100%" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Layout Type Toggle */}
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16, borderBottom: "2px solid " + BRAND_LIGHT, paddingBottom: 8 }}>
              🔄 Layout Type
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { value: "straight", label: "Straight", icon: "▲▲▲", desc: "All cartons same direction" },
                { value: "tumble", label: "Tumble", icon: "▲▼▲", desc: "Alternate rows flipped 180°" },
              ].map(({ value, label, icon, desc }) => (
                <button key={value} onClick={() => setLayoutType(value)} style={{
                  flex: 1, padding: "12px 8px", borderRadius: 8, cursor: "pointer",
                  border: `2px solid ${layoutType === value ? BRAND : "#ddd"}`,
                  background: layoutType === value ? BRAND_LIGHT : "white",
                  color: layoutType === value ? BRAND : "#666",
                  fontWeight: layoutType === value ? "700" : "400",
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: "700" }}>{label}</div>
                  <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tumble explanation */}
          {layoutType === "tumble" && (
            <div style={{ background: "#fff8e1", border: "1px solid #f9a825", borderRadius: 10, padding: 14, fontSize: 12, color: "#555", lineHeight: 1.6 }}>
              <strong>How Tumble Works:</strong> Each ▲▼ pair takes <strong>{stats.pairHeight}"</strong> instead of <strong>{(cartonH * 2).toFixed(1)}"</strong> — saving <strong>{stats.nestingSaving}"</strong> per pair. The flipped row (▼) nests its profile into the gap left by the normal row (▲).
            </div>
          )}

          {/* Export */}
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, borderBottom: "2px solid " + BRAND_LIGHT, paddingBottom: 8 }}>
              ⬇️ Export
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={exportSVG} style={{ padding: "9px 0", borderRadius: 7, border: "none", background: "#27ae60", color: "white", fontWeight: "700", cursor: "pointer", fontSize: 13 }}>
                Export SVG — for Illustrator / Esko
              </button>
              <button onClick={exportDXF} style={{ padding: "9px 0", borderRadius: 7, border: "none", background: BRAND, color: "white", fontWeight: "700", cursor: "pointer", fontSize: 13 }}>
                Export DXF — for ArtiosCAD / AutoCAD
              </button>
              <button onClick={drawLayout} style={{ padding: "9px 0", borderRadius: 7, border: "1px solid #ddd", background: "white", color: "#666", fontWeight: "600", cursor: "pointer", fontSize: 13 }}>
                🔄 Reset Layout
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, minWidth: 300 }}>

          {/* Stats */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <StatCard label="Total Cartons" value={stats.total} color="#1565c0" sub="per sheet" />
            <StatCard label="Sheet Utilization" value={`${stats.utilization}%`} color={getUtilizationColor(stats.utilization)} sub={parseFloat(stats.utilization) >= 80 ? "Excellent" : parseFloat(stats.utilization) >= 60 ? "Moderate" : "Low"} />
            <StatCard label="Columns × Rows" value={`${stats.perRow} × ${stats.numRows}`} color="#6a1b9a" sub="layout grid" />
            {layoutType === "tumble" && stats.nestingSaving && (
              <StatCard label="Nesting Saved" value={`${stats.nestingSaving}"`} color="#e67e22" sub="per row pair" />
            )}
          </div>

          {/* Canvas area */}
          <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>🖼️ Layout Preview</span>
              <span style={{ fontSize: 11, color: "#aaa", fontWeight: "400", textTransform: "none" }}>Drag individual cartons to adjust manually</span>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12, color: "#555" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 14, height: 14, background: STRAIGHT_COLOR, borderRadius: 3, display: "inline-block" }} />
                Normal orientation (▲)
              </span>
              {layoutType === "tumble" && (
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 14, height: 14, background: TUMBLE_FLIPPED, borderRadius: 3, display: "inline-block" }} />
                  Flipped 180° (▼)
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 14, height: 14, background: "rgba(231,76,60,0.2)", border: "1px solid #e74c3c", borderRadius: 3, display: "inline-block" }} />
                Border margin
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 14, height: 14, background: "rgba(39,174,96,0.1)", border: "1px dashed #27ae60", borderRadius: 3, display: "inline-block" }} />
                Usable area
              </span>
            </div>

            <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 700 }}>
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: "1px solid #e0e0e0", padding: "14px 32px", background: "white", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#aaa" }}>
        <span><strong style={{ color: BRAND }}>Mono</strong> v1.0 — Monocarton Imposition Planner</span>
        <span>Built by Deepak · Powered by Fabric.js</span>
      </div>

    </div>
  );
}