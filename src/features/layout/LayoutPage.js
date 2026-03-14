import React, { useState, useEffect, useCallback } from "react";
import { BRAND, BRAND_LIGHT } from "../../config/api";
import CartonSpec from "../cartons/CartonSpec";
import AlgorithmSelector from "./AlgorithmSelector";
import LayoutCanvas from "./LayoutCanvas";
import ComparisonTable from "./ComparisonTable";
import SectionPanel from "../../components/SectionPanel";
import StatCard from "../../components/StatCard";
import Tooltip from "../../components/Tooltip";
import useFlatSize from "../../hooks/useFlatSize";
import useLayout from "../../hooks/useLayout";

const inputStyle = { width: "100%", padding: "7px 8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, marginTop: 4, boxSizing: "border-box" };
const labelStyle = { fontSize: 11, color: "#666", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 };

const LayoutPage = ({ onError, onLoading }) => {
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

  // Algorithm
  const [algorithm, setAlgorithm] = useState("straight");

  // Hooks
  const { flatSpec } = useFlatSize(boxStyle, length, width, height);
  const { stats, loading, error, comparison, setComparison, fetchLayout, fetchCompare } = useLayout();

  // Notify parent of loading/error state
  useEffect(() => { if (onError) onError(error); }, [error]);
  useEffect(() => { if (onLoading) onLoading(loading); }, [loading]);

  const buildParams = useCallback(() => ({
    style: boxStyle,
    length, width, height,
    nesting_pct_override: nestingOverride,
    sheet_w: sheetW,
    sheet_h: sheetH,
    margin,
  }), [boxStyle, length, width, height, nestingOverride, sheetW, sheetH, margin]);

  useEffect(() => {
    if (!length || !width || !height || !sheetW || !sheetH) return;
    fetchLayout(algorithm, buildParams());
  }, [algorithm, boxStyle, length, width, height, sheetW, sheetH, margin, nestingOverride]);

  const handleExportSVG = () => {
    // Trigger SVG export via canvas ref — handled in LayoutCanvas
    const svg = document.querySelector("canvas")?.closest(".canvas-container")?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mono-layout.svg";
    a.click();
  };

  const handleExportDXF = () => {
    if (!stats.cartons || stats.cartons.length === 0) return;
    const rectDXF = (x, y, w, h) =>
      `0\nLWPOLYLINE\n8\n0\n70\n1\n90\n4\n10\n${x}\n20\n${y}\n10\n${x+w}\n20\n${y}\n10\n${x+w}\n20\n${y+h}\n10\n${x}\n20\n${y+h}\n0\nSEQLEND\n`;
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

  const getUtilizationColor = (pct) => {
    const n = parseFloat(pct);
    if (n >= 80) return "#27ae60";
    if (n >= 60) return "#f39c12";
    return "#e74c3c";
  };

  return (
    <div style={{ padding: "24px 32px", display: "flex", gap: 24, flexWrap: "wrap", background: "#f4f6f9", minHeight: "calc(100vh - 120px)" }}>

      {/* LEFT PANEL */}
      <div style={{ flex: "0 0 340px", display: "flex", flexDirection: "column", gap: 16 }}>

        <CartonSpec
          boxStyle={boxStyle} setBoxStyle={setBoxStyle}
          length={length} setLength={setLength}
          width={width} setWidth={setWidth}
          height={height} setHeight={setHeight}
          flatSpec={flatSpec}
          nestingOverride={nestingOverride}
          setNestingOverride={setNestingOverride}
        />

        {/* Sheet Dimensions */}
        <SectionPanel title="🗒️ Sheet Dimensions">
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            {[
              { label: "Width (mm)", value: sheetW, set: setSheetW, tip: "Full width of the print sheet" },
              { label: "Height (mm)", value: sheetH, set: setSheetH, tip: "Full height of the print sheet" },
            ].map(({ label, value, set, tip }) => (
              <div key={label} style={{ flex: 1 }}>
                <label style={labelStyle}>{label}<Tooltip text={tip} /></label>
                <input type="number" value={value} onChange={e => set(Number(e.target.value))} style={inputStyle} />
              </div>
            ))}
          </div>
          <div>
            <label style={labelStyle}>Border Margin (mm)<Tooltip text="Margin on all 4 sides" /></label>
            <input type="number" value={margin} onChange={e => setMargin(Number(e.target.value))} style={inputStyle} />
          </div>
        </SectionPanel>

        <AlgorithmSelector
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          algorithmNotes={stats.algorithm_notes}
        />

        {/* Tumble info */}
        {algorithm === "tumble" && stats.pair_height > 0 && (
          <div style={{ background: "#fff8e1", border: "1px solid #f9a825", borderRadius: 10, padding: 14, fontSize: 12, color: "#555", lineHeight: 1.6 }}>
            <strong>Tumble Nesting:</strong> Each ▲▼ pair takes <strong>{stats.pair_height}mm</strong> instead of <strong>{flatSpec ? (flatSpec.flat_h * 2).toFixed(1) : "—"}mm</strong> — saving <strong>{stats.nesting_saving_mm}mm</strong> per pair.
          </div>
        )}

        {/* Export */}
        <SectionPanel title="⬇️ Export & Tools">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={handleExportSVG} style={{ padding: "9px 0", borderRadius: 7, border: "none", background: "#27ae60", color: "white", fontWeight: "700", cursor: "pointer", fontSize: 13 }}>
              Export SVG — for Illustrator / Esko
            </button>
            <button onClick={handleExportDXF} style={{ padding: "9px 0", borderRadius: 7, border: "none", background: BRAND, color: "white", fontWeight: "700", cursor: "pointer", fontSize: 13 }}>
              Export DXF — for ArtiosCAD / AutoCAD
            </button>
            <button onClick={() => fetchCompare(buildParams())} style={{ padding: "9px 0", borderRadius: 7, border: "none", background: "#6a1b9a", color: "white", fontWeight: "700", cursor: "pointer", fontSize: 13 }}>
              ⚖️ Compare All Algorithms
            </button>
            <button onClick={() => fetchLayout(algorithm, buildParams())} style={{ padding: "9px 0", borderRadius: 7, border: "1px solid #ddd", background: "white", color: "#666", fontWeight: "600", cursor: "pointer", fontSize: 13 }}>
              🔄 Reset Layout
            </button>
          </div>
        </SectionPanel>
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

        <ComparisonTable comparison={comparison} onClose={() => setComparison(null)} />

        <LayoutCanvas data={stats.cartons ? stats : null} algorithm={algorithm} loading={loading} />
      </div>
    </div>
  );
};

export default LayoutPage;