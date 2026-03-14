import React from "react";

const IsometricBox = ({ L, W, H }) => {
  if (!L || !W || !H) return null;

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
      <polygon points={face([A, B, C, D])} fill="#e0d7f7" stroke="#7c3aed" strokeWidth="0.5" opacity="0.4" />
      <polygon points={face([A, B, F, E])} fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" />
      <polygon points={face([B, C, G, F])} fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1.5" />
      <polygon points={face([E, F, G, HH])} fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1.5" />
      <line x1={A.sx} y1={A.sy} x2={E.sx} y2={E.sy} stroke="#7c3aed" strokeWidth="1" />
      <line x1={B.sx} y1={B.sy} x2={F.sx} y2={F.sy} stroke="#7c3aed" strokeWidth="1" />
      <line x1={C.sx} y1={C.sy} x2={G.sx} y2={G.sy} stroke="#7c3aed" strokeWidth="1.5" />
      <text x={(A.sx + B.sx) / 2} y={svgH - 26} textAnchor="middle" fontSize="10" fill="#7c3aed" fontWeight="bold">L:{L}mm</text>
      <text x={(B.sx + C.sx) / 2 + 14} y={svgH - 12} textAnchor="middle" fontSize="10" fill="#5b21b6" fontWeight="bold">W:{W}mm</text>
      <text x={A.sx - 30} y={(A.sy + E.sy) / 2} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#4c1d95" fontWeight="bold">H:{H}mm</text>
    </svg>
  );
};

export default IsometricBox;