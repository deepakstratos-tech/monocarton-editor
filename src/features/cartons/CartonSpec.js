import React from "react";
import { BOX_STYLES, BRAND, BRAND_LIGHT } from "../../config/api";
import Tooltip from "../../components/Tooltip";
import SectionPanel from "../../components/SectionPanel";
import FlatDieline from "./FlatDieline";
import IsometricBox from "./IsometricBox";
import PDFExtract from "../extract/PDFExtract";

const inputStyle = { width: "100%", padding: "7px 8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, marginTop: 4, boxSizing: "border-box" };
const labelStyle = { fontSize: 11, color: "#666", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 };

const CartonSpec = ({
  boxStyle, setBoxStyle,
  length, setLength,
  width, setWidth,
  height, setHeight,
  flatSpec,
  nestingOverride, setNestingOverride,
}) => {
  return (
    <SectionPanel title="📦 Carton Specification">
      {/* PDF Extract */}
      <PDFExtract onExtracted={({ style, length, width, height, product_name }) => {
        setBoxStyle(style);
        setLength(length);
        setWidth(width);
        setHeight(height);
      }} />

      {/* Divider */}
      <div style={{
        borderTop: "1px solid #eee",
        margin: "16px 0",
        position: "relative",
      }}>
        <span style={{
          position: "absolute", top: -9, left: "50%",
          transform: "translateX(-50%)",
          background: "white", padding: "0 8px",
          fontSize: 11, color: "#aaa",
        }}>
          or enter manually
        </span>
      </div>

      {/* Box Style */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Box Style <Tooltip text="The structural style determines flap dimensions" /></label>
        <select value={boxStyle} onChange={e => setBoxStyle(e.target.value)} style={{ ...inputStyle, marginTop: 4 }}>
          {BOX_STYLES.map(s => (
            <option key={s.id} value={s.id}>{s.label} — {s.desc}</option>
          ))}
        </select>
      </div>

      {/* L W H */}
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
              Override Nesting Saving % <Tooltip text="Leave blank to use calculated value." />
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
          <div style={{ fontSize: 11, fontWeight: "700", color: BRAND, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Flat Dieline</div>
          <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 8, padding: 8, overflowX: "auto" }}>
            <FlatDieline
              style={boxStyle} L={length} W={width} H={height}
              flatW={flatSpec.flat_w} flatH={flatSpec.flat_h}
              topTuck={flatSpec.top_tuck_depth} bottomTuck={flatSpec.bottom_tuck_depth}
              glueFlap={flatSpec.glue_flap}
            />
          </div>
        </div>
      )}

      {/* 3D Preview */}
      {length && width && height && (
        <div>
          <div style={{ fontSize: 11, fontWeight: "700", color: BRAND, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>3D Preview</div>
          <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
            <IsometricBox L={length} W={width} H={height} />
          </div>
        </div>
      )}
    </SectionPanel>
  );
};

export default CartonSpec;