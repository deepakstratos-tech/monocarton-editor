import React from "react";

const FlatDieline = ({ style, L, W, H, flatW, flatH, topTuck, bottomTuck, glueFlap }) => {
  if (!L || !W || !H) return null;

  const scale = 0.6;
  const pW = W * scale;
  const pL = L * scale;
  const pTop = topTuck * scale;
  const pBot = bottomTuck * scale;
  const pGlue = glueFlap * scale;
  const pH = H * scale;
  const pw = flatW * scale;
  const ph = flatH * scale;

  const totalW = pw + pGlue + 30;
  const totalH = ph + 30;
  const ox = 5;
  const oy = 5;

  const x0 = ox;
  const x1 = ox + pGlue;
  const x2 = ox + pGlue + pL;
  const x3 = ox + pGlue + pL + pW;
  const x4 = ox + pGlue + pL + pW + pL;

  const yTop = oy;
  const yMain = oy + pTop;
  const yBot = oy + pTop + pH;

  const dimStyle = { fontSize: 8, fill: "#e74c3c", fontFamily: "monospace" };
  const panelStyle = { fontSize: 7, fill: "#666", fontFamily: "sans-serif" };

  return (
    <svg width={totalW + 40} height={totalH + 20} style={{ display: "block", margin: "0 auto" }}>
      <rect x={x2} y={yTop} width={pW} height={pTop} fill="#dbeafe" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,2" />
      <text x={x2 + pW / 2} y={yTop + pTop / 2} textAnchor="middle" dominantBaseline="middle" style={panelStyle}>TOP TUCK</text>

      <rect x={x0} y={yMain} width={pGlue} height={pH} fill="#fef9c3" stroke="#eab308" strokeWidth="1" strokeDasharray="3,2" />
      <text x={x0 + pGlue / 2} y={yMain + pH / 2} textAnchor="middle" dominantBaseline="middle" style={{ ...panelStyle, fontSize: 6 }} transform={`rotate(-90, ${x0 + pGlue / 2}, ${yMain + pH / 2})`}>GLUE</text>

      <rect x={x1} y={yMain} width={pL} height={pH} fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
      <text x={x1 + pL / 2} y={yMain + pH / 2} textAnchor="middle" dominantBaseline="middle" style={panelStyle}>LEFT</text>

      <rect x={x2} y={yMain} width={pW} height={pH} fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" />
      <text x={x2 + pW / 2} y={yMain + pH / 2} textAnchor="middle" dominantBaseline="middle" style={{ ...panelStyle, fontSize: 8, fontWeight: "bold" }}>FRONT</text>

      <rect x={x3} y={yMain} width={pL} height={pH} fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
      <text x={x3 + pL / 2} y={yMain + pH / 2} textAnchor="middle" dominantBaseline="middle" style={panelStyle}>RIGHT</text>

      <rect x={x4} y={yMain} width={pW} height={pH} fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
      <text x={x4 + pW / 2} y={yMain + pH / 2} textAnchor="middle" dominantBaseline="middle" style={panelStyle}>BACK</text>

      <rect x={x2} y={yBot} width={pW} height={pBot} fill="#fce7f3" stroke="#db2777" strokeWidth="1" strokeDasharray="3,2" />
      <text x={x2 + pW / 2} y={yBot + pBot / 2} textAnchor="middle" dominantBaseline="middle" style={{ ...panelStyle, fontSize: 6 }}>
        {style === "bottom_side_lock" || style === "lock_bottom" ? "BOT LOCK" : "BOT TUCK"}
      </text>

      <line x1={x1} y1={oy + ph + 16} x2={x1 + pw} y2={oy + ph + 16} stroke="#e74c3c" strokeWidth="1" />
      <text x={x1 + pw / 2} y={oy + ph + 26} textAnchor="middle" style={dimStyle}>Flat W: {flatW}mm</text>

      <line x1={totalW + 8} y1={yTop} x2={totalW + 8} y2={yTop + ph} stroke="#e74c3c" strokeWidth="1" />
      <text x={totalW + 10} y={yTop + ph / 2} dominantBaseline="middle" style={{ ...dimStyle, fontSize: 7 }}>Flat H: {flatH}mm</text>

      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#e74c3c" />
        </marker>
      </defs>
    </svg>
  );
};

export default FlatDieline;