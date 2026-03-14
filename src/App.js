import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import UserGuide from "./UserGuide";

const SCALE = 0.5; // 1mm = 0.5px
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

const BOX_STYLES = [
  { id: "bottom_side_lock", label: "Bottom Side Lock", desc: "Most common in pharma" },
  { id: "straight_tuck_end", label: "Straight Tuck End", desc: "Both tucks same direction" },
  { id: "reverse_tuck_end", label: "Reverse Tuck End", desc: "Tucks face opposite directions" },
  { id: "lock_bottom", label: "Lock Bottom", desc: "Pre-glued auto locking base" },
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

// ── FLAT DIELINE SVG ──
const FlatDieline = ({ style, L, W, H, flatW, flatH, topTuck, bottomTuck, glueFlap }) => {
  if (!L || !W || !H) return null;

  const scale = 0.6;
  const pw = flatW * scale;
  const ph = flatH * scale;
  const pL = L * scale;
  const pW = W * scale;
  const pTop = topTuck * scale;
  const pBot = bottomTuck * scale;
  const pGlue = glueFlap * scale;
  const pH = H * scale;

  const totalW = pw + pGlue + 10;
  const totalH = ph + 10;
  const ox = 5; // offset x
  const oy = 5; // offset y

  // Panel positions
  const x0 = ox;                    // start of glue flap
  const x1 = ox + pGlue;            // start of first L panel
  const x2 = ox + pGlue + pL;       // start of W panel (front)
  const x3 = ox + pGlue + pL + pW;  // start of second L panel
  const x4 = ox + pGlue + pL + pW + pL; // start of back W panel

  const yTop = oy;
  const yMain = oy + pTop;
  const yBot = oy + pTop + pH;

  const dimStyle = { fontSize: 8, fill: "#e74c3c", fontFamily: "monospace" };
  const panelStyle = { fontSize: 7, fill: "#666", fontFamily: "sans-serif" };

  return (
    <svg width={totalW + 20} height={totalH + 20} style={{ display: "block", margin: "0 auto" }}>

      {/* Top tuck flap */}
      <rect x={x2} y={yTop} width={pW} height={pTop}
        fill="#dbeafe" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,2" />
      <text x={x2 + pW / 2} y={yTop + pTop / 2} textAnchor="middle" dominantBaseline="middle" style={panelStyle}>TOP TUCK</text>

      {/* Glue flap */}
      <rect x={x0} y={yMain} width={pGlue} height={pH}
        fill="#fef9c3" stroke="#eab308" strokeWidth="1" strokeDasharray="3,2" />
      <text x={x0 + pGlue / 2} y={yMain + pH / 2} textAnchor="middle" dominantBaseline="middle"
        style={{ ...panelStyle, fontSize: 6 }} transform={`rotate(-90, ${x0 + pGlue / 2}, ${yMain + pH / 2})`}>GLUE</text>

      {/* Left side panel */}
      <rect x={x1} y={yMain} width={pL} height={pH}
        fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
      <text x={x1 + pL / 2} y={yMain + pH / 2} textAnchor="middle" dominantBaseline="middle" style={panelStyle}>LEFT</text>

      {/* Front panel */}
      <rect x={x2} y={yMain} width={pW} height={pH}
        fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" />
      <text x={x2 + pW / 2} y={yMain + pH / 2} textAnchor="middle" dominantBaseline="middle"
        style={{ ...panelStyle, fontSize: 8, fontWeight: "bold" }}>FRONT</text>

      {/* Right side panel */}
      <rect x={x3} y={yMain} width={pL} height={pH}
        fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
      <text x={x3 + pL / 2} y={yMain + pH / 2} textAnchor="middle" dominantBaseline="middle" style={panelStyle}>RIGHT</text>

      {/* Back panel */}
      <rect x={x4} y={yMain} width={pW} height={pH}
        fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
      <text x={x4 + pW / 2} y={yMain + pH / 2} textAnchor="middle" dominantBaseline="middle" style={panelStyle}>BACK</text>

      {/* Bottom tuck/lock */}
      <rect x={x2} y={yBot} width={pW} height={pBot}
        fill="#fce7f3" stroke="#db2777" strokeWidth="1" strokeDasharray="3,2" />
      <text x={x2 + pW / 2} y={yBot + pBot / 2} textAnchor="middle" dominantBaseline="middle"
        style={{ ...panelStyle, fontSize: 6 }}>
        {style === "bottom_side_lock" || style === "lock_bottom" ? "BOT LOCK" : "BOT TUCK"}
      </text>

      {/* ── DIMENSION ANNOTATIONS ── */}

      {/* Flat Width arrow */}
      <line x1={x1} y1={oy + ph + 16} x2={x1 + pw} y2={oy + ph + 16} stroke="#e74c3c" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
      <text x={x1 + pw / 2} y={oy + ph + 26} textAnchor="middle" style={dimStyle}>Flat W: {flatW}mm</text>

      {/* Flat Height arrow */}
      <line x1={totalW + 8} y1={yTop} x2={totalW + 8} y2={yTop + ph} stroke="#e74c3c" strokeWidth="1" />
      <text x={totalW + 10} y={yTop + ph / 2} dominantBaseline="middle" style={{ ...dimStyle, fontSize: 7 }}>Flat H: {flatH}mm</text>

      {/* Top tuck annotation */}
      <line x1={x4 + pW + 4} y1={yTop} x2={x4 + pW + 4} y2={yMain} stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
      <text x={x4 + pW + 6} y={yTop + pTop / 2} dominantBaseline="middle" style={{ ...dimStyle, fontSize: 6, fill: "#3b82f6" }}>{topTuck}mm</text>

      {/* Height annotation */}
      <line x1={x4 + pW + 4} y1={yMain} x2={x4 + pW + 4} y2={yBot} stroke="#7c3aed" strokeWidth="1" strokeDasharray="2,2" />
      <text x={x4 + pW + 6} y={yMain + pH / 2} dominantBaseline="middle" style={{ ...dimStyle, fontSize: 6, fill: "#7c3aed" }}>H:{H}mm</text>

      {/* Bottom tuck annotation */}
      <line x1={x4 + pW + 4} y1={yBot} x2={x4 + pW + 4} y2={yBot + pBot} stroke="#db2777" strokeWidth="1" strokeDasharray="2,2" />
      <text x={x4 + pW + 6} y={yBot + pBot / 2} dominantBaseline="middle" style={{ ...dimStyle, fontSize: 6, fill: "#db2777" }}>{bottomTuck}mm</text>

      {/* W annotation */}
      <line x1={x2} y1={oy - 4} x2={x2 + pW} y2={oy - 4} stroke="#7c3aed" strokeWidth="1" />
      <text x={x2 + pW / 2} y={oy - 6} textAnchor="middle" style={{ ...dimStyle, fontSize: 6, fill: "#7c3aed" }}>W:{W}mm</text>

      {/* L annotation */}
      <line x1={x1} y1={oy - 4} x2={x1 + pL} y2={oy - 4} stroke="#16a34a" strokeWidth="1" />
      <text x={x1 + pL / 2} y={oy - 6} textAnchor="middle" style={{ ...dimStyle, fontSize: 6, fill: "#16a34a" }}>L:{L}mm</text>

      {/* Arrow marker */}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#e74c3c" />
        </marker>
      </defs>
    </svg>
  );
};

// ── 3D ISOMETRIC PREVIEW ──
const IsometricBox = ({ L, W, H }) => {
  if (!L || !W || !H) return null;

  // Dynamic scale based on box size
  // Target max dimension of about 150px
  const maxDim = Math.max(L, W, H);
  const scale = Math.min(150 / maxDim, 1.2);

  const l = L * scale;
  const w = W * scale;
  const h = H * scale;

  const cos30 = Math.cos(Math.PI / 6);
  const sin30 = Math.sin(Math.PI / 6);

  const padX = 50;
  const padY = 30;

  const ox = padX + w * cos30;
  const oy = padY + h + l * sin30 + w * sin30;

  const iso = (x, y, z) => ({
    sx: ox + (x - y) * cos30,
    sy: oy - z - (x + y) * sin30,
  });

  const A = iso(0, 0, 0);
  const B = iso(l, 0, 0);
  const C = iso(l, w, 0);
  const D = iso(0, w, 0);
  const E = iso(0, 0, h);
  const F = iso(l, 0, h);
  const G = iso(l, w, h);
  const HH = iso(0, w, h);

  const pt = (p) => `${p.sx},${p.sy}`;
  const face = (pts) => pts.map(pt).join(" ");

  const svgW = l * cos30 + w * cos30 + padX * 2 + 30;
  const svgH = h + l * sin30 + w * sin30 + padY * 2 + 40;

  return (
    <svg width={svgW} height={svgH} style={{ display: "block", margin: "0 auto" }}>

      {/* Bottom face */}
      <polygon points={face([A, B, C, D])}
        fill="#e0d7f7" stroke="#7c3aed" strokeWidth="0.5" opacity="0.4" />

      {/* Front face */}
      <polygon points={face([A, B, F, E])}
        fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" />

      {/* Right face */}
      <polygon points={face([B, C, G, F])}
        fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1.5" />

      {/* Top face */}
      <polygon points={face([E, F, G, HH])}
        fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1.5" />

      {/* Edge lines */}
      <line x1={A.sx} y1={A.sy} x2={E.sx} y2={E.sy} stroke="#7c3aed" strokeWidth="1" />
      <line x1={B.sx} y1={B.sy} x2={F.sx} y2={F.sy} stroke="#7c3aed" strokeWidth="1" />
      <line x1={C.sx} y1={C.sy} x2={G.sx} y2={G.sy} stroke="#7c3aed" strokeWidth="1.5" />

      {/* L label — below front bottom edge, centered */}
      <text
        x={(A.sx + B.sx) / 2}
        y={svgH - 26}
        textAnchor="middle" fontSize="10"
        fill="#7c3aed" fontWeight="bold">
        L: {L}mm
      </text>

      {/* W label — below right bottom edge */}
      <text
        x={(B.sx + C.sx) / 2 + 14}
        y={svgH - 12}
        textAnchor="middle" fontSize="10"
        fill="#5b21b6" fontWeight="bold">
        W: {W}mm
      </text>

      {/* H label — left of vertical edge */}
      <text
        x={A.sx - 30}
        y={(A.sy + E.sy) / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="#4c1d95" fontWeight="bold">
        H: {H}mm
      </text>
    </svg>
  );
};

export default function App() {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  // Carton spec
  const [boxStyle, setBoxStyle] = useState("bottom_side_lock");
  const [length, setLength] = useState(45);
  const [width, setWidth] = useState(45);
  const [height, setHeight] = useState(83);
  const [nestingOverride, setNestingOverride] = useState(null);

  // Sheet spec
  const [sheetW, setSheetW] = useState(700);
  const [sheetH, setSheetH] = useState(1000);
  const [margin, setMargin] = useState(10);

  // Calculated flat size
  const [flatSpec, setFlatSpec] = useState(null);

  // Layout
  const [algorithm, setAlgorithm] = useState("straight");
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparison, setComparison] = useState(null);

  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#fdf6e3",
      selection: true,
    });
    fabricRef.current = canvas;
    return () => canvas.dispose();
  }, []);

  // Fetch flat size whenever carton spec changes
  useEffect(() => {
    if (!length || !width || !height) return;
    fetchFlatSize();
  }, [boxStyle, length, width, height]);

  const fetchFlatSize = async () => {
    try {
      const response = await fetch(`${API_BASE}/carton/flat-size`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: boxStyle,
          length, width, height
        }),
      });
      const data = await response.json();
      setFlatSpec(data);
    } catch (err) {
      console.error("Flat size error:", err);
    }
  };

  const buildLayoutRequest = () => ({
    style: boxStyle,
    length, width, height,
    nesting_pct_override: nestingOverride,
    sheet_w: sheetW,
    sheet_h: sheetH,
    margin,
  });

  const fetchLayout = useCallback(async () => {
    if (!length || !width || !height || !sheetW || !sheetH) return;
    setLoading(true);
    setError(null);
    try {
      const selected = ALGORITHMS.find(a => a.id === algorithm);
      const response = await fetch(`${API_BASE}${selected.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildLayoutRequest()),
      });
      if (!response.ok) throw new Error("Backend error");
      const data = await response.json();
      setStats(data);
      renderLayout(data);
    } catch (err) {
      setError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  }, [boxStyle, length, width, height, sheetW, sheetH, margin, nestingOverride, algorithm]);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  const fetchCompare = async () => {
    try {
      const response = await fetch(`${API_BASE}/layout/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildLayoutRequest()),
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

    canvas.add(new fabric.Text(`${data.margin}mm margin`, {
      left: 4, top: 2, fontSize: 8, fill: "#c0392b",
      selectable: false, evented: false,
    }));
    // Remainder space info
    const remainderW = data.usable_w - (data.cartons_per_row * data.flat_w);
    const remainderH = data.usable_h - (data.num_rows * data.flat_h);
    canvas.add(new fabric.Text(
      `Remainder: ${remainderW.toFixed(1)}mm W × ${remainderH.toFixed(1)}mm H`,
      {
        left: data.sheet_w * SCALE - 4,
        top: data.sheet_h * SCALE - 14,
        fontSize: 8,
        fill: "#888",
        textAlign: "right",
        originX: "right",
        selectable: false,
        evented: false,
      }
    ));

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
      width: w - 1, height: h - 1,
      fill, stroke, strokeWidth: 1, opacity: 0.85,
    });

    const arrow = new fabric.Text(carton.flipped ? "▼" : "▲", {
      left: w / 2, top: h / 2 - 6,
      fontSize: 8, fill: "white",
      originX: "center", originY: "center",
    });

    const label = new fabric.Text(`${Math.round(carton.w)}×${Math.round(carton.h)}`, {
      left: w / 2, top: h / 2 + 5,
      fontSize: 6, fill: "white",
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
    stats.cartons.forEach(c => { dxf += rectDXF(c.x, c.y, c.w, c.h); });
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

  const inputStyle = { width: "100%", padding: "7px 8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, marginTop: 4, boxSizing: "border-box" };
  const labelStyle = { fontSize: 11, color: "#666", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 };
  const sectionStyle = { background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" };
  const sectionTitleStyle = { fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16, borderBottom: "2px solid " + BRAND_LIGHT, paddingBottom: 8 };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f4f6f9", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ background: BRAND, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26, fontWeight: "900", color: "white", letterSpacing: -1 }}>Mono</span>
            <span style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: "600" }}>v2.0</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 }}>
            Monocarton Imposition Planner — maximise yield, minimise waste
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => setGuideOpen(true)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              padding: "6px 16px",
              borderRadius: 20,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: "600",
            }}>
            📖 User Guide
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: error ? "#e74c3c" : loading ? "#f39c12" : "#27ae60" }} />
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              {error ? "Backend offline" : loading ? "Calculating..." : "Backend connected"}
            </span>
          </div>
        </div>
      </div>
      
      {/* PROBLEM STATEMENT */}
      <div style={{ background: BRAND_LIGHT, borderBottom: "1px solid #d0dcea", padding: "14px 32px" }}>
        <p style={{ margin: 0, fontSize: 14, color: "#2c3e50", lineHeight: 1.6 }}>
          <strong>What is Mono?</strong> Enter your 3D carton dimensions and sheet size — Mono automatically calculates the flat dieline size, optimal nesting saving, and best layout for maximum yield. All dimensions in millimetres.
        </p>
      </div>

      {error && (
        <div style={{ background: "#fdecea", border: "1px solid #e74c3c", padding: "10px 32px", fontSize: 13, color: "#c0392b" }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ padding: "24px 32px", display: "flex", gap: 24, flexWrap: "wrap" }}>

        {/* LEFT PANEL */}
        <div style={{ flex: "0 0 340px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Carton Specification */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>📦 Carton Specification</div>

            {/* Box Style */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Box Style <Tooltip text="The structural style of the carton determines flap dimensions" /></label>
              <select value={boxStyle} onChange={e => setBoxStyle(e.target.value)} style={{ ...inputStyle, marginTop: 4 }}>
                {BOX_STYLES.map(s => (
                  <option key={s.id} value={s.id}>{s.label} — {s.desc}</option>
                ))}
              </select>
            </div>

            {/* L W H inputs */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Length L (mm)", value: length, set: setLength, tip: "Length of the folded box" },
                { label: "Width W (mm)", value: width, set: setWidth, tip: "Width of the folded box" },
                { label: "Height H (mm)", value: height, set: setHeight, tip: "Height of the folded box" },
              ].map(({ label, value, set, tip }) => (
                <div key={label} style={{ flex: 1 }}>
                  <label style={labelStyle}>{label}<Tooltip text={tip} /></label>
                  <input type="number" value={value} onChange={e => set(Number(e.target.value))} style={inputStyle} />
                </div>
              ))}
            </div>

            {/* Calculated flat size */}
            {flatSpec && (
              <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 12 }}>
                <div style={{ fontWeight: "700", color: BRAND, marginBottom: 8, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  ── Calculated Automatically ──
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    { label: "Flat Width", value: `${flatSpec.flat_w} mm`, color: "#1565c0" },
                    { label: "Flat Height", value: `${flatSpec.flat_h} mm`, color: "#1565c0" },
                    { label: "Top Tuck Depth", value: `${flatSpec.top_tuck_depth} mm`, color: "#3b82f6" },
                    { label: "Bottom Depth", value: `${flatSpec.bottom_tuck_depth} mm`, color: "#db2777" },
                    { label: "Glue Flap", value: `${flatSpec.glue_flap} mm`, color: "#eab308" },
                    { label: "Nesting Saving", value: `${flatSpec.nesting_saving_pct}%`, color: "#27ae60" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "white", borderRadius: 6, padding: "6px 8px", borderLeft: `3px solid ${color}` }}>
                      <div style={{ fontSize: 10, color: "#888" }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: "700", color }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Nesting override */}
                <div style={{ marginTop: 10 }}>
                  <label style={{ ...labelStyle, fontSize: 10 }}>
                    Override Nesting Saving % <Tooltip text="Leave blank to use calculated value. Override if your press achieves different results." />
                  </label>
                  <input
                    type="number"
                    placeholder={`Auto: ${flatSpec.nesting_saving_pct}%`}
                    value={nestingOverride ?? ""}
                    onChange={e => setNestingOverride(e.target.value ? Number(e.target.value) : null)}
                    style={{ ...inputStyle, marginTop: 4, fontSize: 12 }}
                  />
                </div>
              </div>
            )}

            {/* Flat Dieline */}
            {flatSpec && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: "700", color: BRAND, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  Flat Dieline
                </div>
                <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 8, padding: 8, overflowX: "auto" }}>
                  <FlatDieline
                    style={boxStyle}
                    L={length} W={width} H={height}
                    flatW={flatSpec.flat_w}
                    flatH={flatSpec.flat_h}
                    topTuck={flatSpec.top_tuck_depth}
                    bottomTuck={flatSpec.bottom_tuck_depth}
                    glueFlap={flatSpec.glue_flap}
                  />
                </div>
              </div>
            )}

            {/* 3D Preview */}
            {length && width && height && (
              <div>
                <div style={{ fontSize: 11, fontWeight: "700", color: BRAND, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  3D Preview
                </div>
                <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
                  <IsometricBox L={length} W={width} H={height} />
                </div>
              </div>
            )}
          </div>

          {/* Sheet Dimensions */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>🗒️ Sheet Dimensions</div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "Width (mm)", value: sheetW, set: setSheetW, tip: "Full width of the print sheet in mm" },
                { label: "Height (mm)", value: sheetH, set: setSheetH, tip: "Full height of the print sheet in mm" },
              ].map(({ label, value, set, tip }) => (
                <div key={label} style={{ flex: 1 }}>
                  <label style={labelStyle}>{label}<Tooltip text={tip} /></label>
                  <input type="number" value={value} onChange={e => set(Number(e.target.value))} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <label style={labelStyle}>Border Margin (mm)<Tooltip text="Margin applied on all 4 sides" /></label>
              <input type="number" value={margin} onChange={e => setMargin(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>

          {/* Algorithm Selector */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>🧮 Algorithm</div>
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
            {stats.algorithm_notes && (
              <div style={{ marginTop: 12, padding: "8px 12px", background: "#f8f9fa", borderRadius: 6, fontSize: 12, color: "#666", borderLeft: `3px solid ${ALGORITHMS.find(a => a.id === algorithm)?.color}` }}>
                ℹ️ {stats.algorithm_notes}
              </div>
            )}
          </div>

          {/* Tumble info */}
          {algorithm === "tumble" && stats.pair_height > 0 && (
            <div style={{ background: "#fff8e1", border: "1px solid #f9a825", borderRadius: 10, padding: 14, fontSize: 12, color: "#555", lineHeight: 1.6 }}>
              <strong>Tumble Nesting:</strong> Each ▲▼ pair takes <strong>{stats.pair_height}mm</strong> instead of <strong>{(flatSpec?.flat_h * 2).toFixed(1)}mm</strong> — saving <strong>{stats.nesting_saving_mm}mm</strong> per pair.
            </div>
          )}

          {/* Export */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>⬇️ Export & Tools</div>
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
            <StatCard label="Flat Size" value={flatSpec ? `${flatSpec.flat_w}×${flatSpec.flat_h}` : "—"} color="#16a085" sub="mm (W × H)" />
          </div>

          {/* Comparison Table */}
          {comparison && (
            <div style={{ ...sectionStyle, marginBottom: 20 }}>
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
              <button onClick={() => setComparison(null)} style={{ marginTop: 10, fontSize: 11, color: "#aaa", background: "none", border: "none", cursor: "pointer" }}>
                ✕ Close comparison
              </button>
            </div>
          )}

          {/* Canvas */}
          <div style={sectionStyle}>
            <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>🖼️ Layout Preview</span>
              <span style={{ fontSize: 11, color: loading ? "#f39c12" : "#aaa", fontWeight: "400", textTransform: "none" }}>
                {loading ? "⏳ Calculating..." : "Drag cartons to adjust manually"}
              </span>
            </div>

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
        <span><strong style={{ color: BRAND }}>Mono</strong> v2.0 — Monocarton Imposition Planner</span>
        <span>Built by Deepak · Powered by FastAPI + Fabric.js</span>
      </div>

      <UserGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}