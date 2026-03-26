import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { SCALE, STRAIGHT_COLOR, TUMBLE_FLIPPED, BRAND } from "../../config/api";

const LayoutCanvas = ({ data, algorithm, loading, designAssets = {} }) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#fdf6e3",
      selection: true,
    });
    fabricRef.current = canvas;
    return () => canvas.dispose();
  }, []);

  // ── DRAW SINGLE CARTON ──
  const drawCarton = (canvas, carton, designAssets = {}) => {
    const x = carton.x * SCALE;
    const y = carton.y * SCALE;
    const w = carton.w * SCALE;
    const h = carton.h * SCALE;
    const fill = carton.flipped ? TUMBLE_FLIPPED : STRAIGHT_COLOR;
    const stroke = carton.flipped ? "#a04000" : "#1a4a7a";

    // Check if we have a design asset
    const design = designAssets["default"] || designAssets[carton.job_id];

    if (design?.cropped_image_base64) {
      // Render with artwork image
      const imgEl = new window.Image();
      imgEl.onload = () => {
        const fabricImg = new fabric.Image(imgEl, {
          left: 0, top: 0,
          scaleX: (w - 2) / imgEl.width,
          scaleY: (h - 2) / imgEl.height,
        });

        const border = new fabric.Rect({
          left: 0, top: 0,
          width: w - 2, height: h - 2,
          fill: "transparent",
          stroke, strokeWidth: 1.5,
        });

        canvas.add(new fabric.Group([fabricImg, border], {
          left: x, top: y,
          hasControls: true, hasBorders: true,
        }));
        canvas.renderAll();
      };
      imgEl.src = `data:image/png;base64,${design.cropped_image_base64}`;
    } else {
      // Fallback — plain coloured rectangle
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

      const label = new fabric.Text(
        `${Math.round(carton.w)}×${Math.round(carton.h)}`,
        {
          left: w / 2, top: h / 2 + 5,
          fontSize: 6, fill: "white",
          originX: "center", originY: "center",
        }
      );

      canvas.add(new fabric.Group([rect, arrow, label], {
        left: x, top: y,
        hasControls: true, hasBorders: true,
      }));
    }
  };

  useEffect(() => {
    if (!data) return;
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

    // Usable area
    canvas.add(new fabric.Rect({
      left: data.margin * SCALE, top: data.margin * SCALE,
      width: data.usable_w * SCALE, height: data.usable_h * SCALE,
      fill: "rgba(39,174,96,0.04)",
      stroke: "#27ae60", strokeWidth: 1,
      strokeDashArray: [4, 3],
      selectable: false, evented: false,
    }));

    // Margin label
    canvas.add(new fabric.Text(`${data.margin}mm margin`, {
      left: 4, top: 2, fontSize: 8, fill: "#c0392b",
      selectable: false, evented: false,
    }));

    // Remainder info
    const remainderW = data.usable_w - (data.cartons_per_row * data.flat_w);
    const remainderH = data.usable_h - (data.num_rows * data.flat_h);
    canvas.add(new fabric.Text(
      `Remainder: ${remainderW.toFixed(1)}mm W × ${remainderH.toFixed(1)}mm H`,
      {
        left: data.sheet_w * SCALE - 4,
        top: data.sheet_h * SCALE - 14,
        fontSize: 8, fill: "#888",
        textAlign: "right", originX: "right",
        selectable: false, evented: false,
      }
    ));

    // Draw all cartons
    data.cartons.forEach(carton => drawCarton(canvas, carton, designAssets));

    canvas.renderAll();
  }, [data, designAssets]);

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: 13, fontWeight: "800", color: BRAND, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>🖼️ Layout Preview</span>
        <span style={{ fontSize: 11, color: loading ? "#f39c12" : "#aaa", fontWeight: "400", textTransform: "none" }}>
          {loading ? "⏳ Calculating..." : "Drag cartons to adjust manually"}
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
        {designAssets["default"] && (
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 14, background: "#f0f0f0", border: "1px solid #999", borderRadius: 3, display: "inline-block" }} /> Artwork
          </span>
        )}
      </div>

      <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 700 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default LayoutCanvas;
