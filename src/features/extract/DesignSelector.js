import React, { useState, useRef, useEffect, useCallback } from "react";
import { API_BASE, BRAND, BRAND_LIGHT } from "../../config/api";

const POINT_RADIUS = 7;
const LINE_COLOR = "#1a4a7a";
const FILL_COLOR = "rgba(26, 74, 122, 0.15)";
const POINT_COLOR = "#e74c3c";
const CLOSE_THRESHOLD = 20;

// ── FULL SCREEN MODAL CANVAS ──
const PolygonCanvas = ({ imageBase64, imageSize, onComplete, onCancel }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [polygon, setPolygon] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const [isClosed, setIsClosed] = useState(false);

  // Load image into ref
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => { imageRef.current = img; drawCanvas(); };
    img.src = `data:image/png;base64,${imageBase64}`;
  }, [imageBase64]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (polygon.length === 0) {
      // Draw instruction overlay
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, canvas.width, 44);
      ctx.fillStyle = "white";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("Click to place points around the carton dieline. Click the green dot to close the polygon.", 16, 28);
      return;
    }

    // Draw filled polygon if closed
    if (isClosed && polygon.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(polygon[0].x, polygon[0].y);
      polygon.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fillStyle = FILL_COLOR;
      ctx.fill();
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else {
      // Draw lines
      ctx.beginPath();
      ctx.moveTo(polygon[0].x, polygon[0].y);
      polygon.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      if (mousePos) ctx.lineTo(mousePos.x, mousePos.y);
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Dashed closing line preview
      if (mousePos && polygon.length >= 3) {
        ctx.beginPath();
        ctx.setLineDash([6, 4]);
        ctx.moveTo(mousePos.x, mousePos.y);
        ctx.lineTo(polygon[0].x, polygon[0].y);
        ctx.strokeStyle = "rgba(26,74,122,0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw points
    polygon.forEach((p, idx) => {
      const isFirst = idx === 0;
      const radius = isFirst ? POINT_RADIUS + 3 : POINT_RADIUS;

      // Outer ring
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fill();

      // Point
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isFirst ? "#27ae60" : POINT_COLOR;
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label first point
      if (isFirst) {
        ctx.fillStyle = "#27ae60";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("START", p.x + 14, p.y + 4);
      }

      // Point number
      ctx.fillStyle = "white";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(idx + 1, p.x, p.y + 3);
      ctx.textAlign = "left";
    });

    // Status bar at bottom
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.fillStyle = "white";
    ctx.font = "13px sans-serif";

    if (isClosed) {
      ctx.fillText(`✓ Polygon closed — ${polygon.length} points. Click "Extract Design" to continue.`, 16, canvas.height - 16);
    } else if (polygon.length >= 3) {
      ctx.fillText(`${polygon.length} points placed. Click near the green START point to close, or keep adding points.`, 16, canvas.height - 16);
    } else {
      ctx.fillText(`${polygon.length} point(s) placed. Keep clicking to trace the carton outline.`, 16, canvas.height - 16);
    }
  }, [polygon, mousePos, isClosed]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const isNearFirstPoint = (pos) => {
    if (polygon.length < 3) return false;
    const first = polygon[0];
    const dx = pos.x - first.x;
    const dy = pos.y - first.y;
    return Math.sqrt(dx * dx + dy * dy) < CLOSE_THRESHOLD;
  };

  const handleClick = (e) => {
    if (isClosed) return;
    const pos = getCanvasCoords(e);
    if (isNearFirstPoint(pos)) {
      setIsClosed(true);
      return;
    }
    setPolygon(prev => [...prev, pos]);
  };

  const handleMouseMove = (e) => {
    if (isClosed) return;
    setMousePos(getCanvasCoords(e));
  };

  const handleUndo = () => {
    if (isClosed) { setIsClosed(false); return; }
    setPolygon(prev => prev.slice(0, -1));
  };

  const handleReset = () => {
    setPolygon([]);
    setIsClosed(false);
    setMousePos(null);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(0,0,0,0.92)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top toolbar */}
      <div style={{
        background: "#1a4a7a", padding: "12px 20px",
        display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
      }}>
        <span style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
          ✏️ Draw Polygon — Carton Dieline Selection
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <div style={{
            background: "rgba(255,255,255,0.15)", color: "white",
            borderRadius: 6, padding: "4px 12px", fontSize: 12,
          }}>
            Points: {polygon.length}
          </div>
          <div style={{
            background: isClosed ? "#27ae60" : "rgba(255,255,255,0.15)",
            color: "white", borderRadius: 6, padding: "4px 12px", fontSize: 12,
          }}>
            {isClosed ? "✓ Closed" : "Open"}
          </div>
          <button onClick={handleUndo} style={{
            padding: "5px 14px", borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.3)",
            background: "transparent", color: "white",
            cursor: "pointer", fontSize: 13,
          }}>↩ Undo</button>
          <button onClick={handleReset} style={{
            padding: "5px 14px", borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.3)",
            background: "transparent", color: "white",
            cursor: "pointer", fontSize: 13,
          }}>🔄 Reset</button>
          <button
            onClick={() => onComplete(polygon)}
            disabled={!isClosed || polygon.length < 3}
            style={{
              padding: "5px 18px", borderRadius: 6, border: "none",
              background: isClosed ? "#27ae60" : "#555",
              color: "white", fontWeight: "700",
              cursor: isClosed ? "pointer" : "not-allowed", fontSize: 13,
            }}>
            Extract Design →
          </button>
          <button onClick={onCancel} style={{
            padding: "5px 14px", borderRadius: 6,
            border: "1px solid rgba(255,0,0,0.4)",
            background: "rgba(255,0,0,0.15)", color: "#ff8080",
            cursor: "pointer", fontSize: 13,
          }}>✕ Cancel</button>
        </div>
      </div>

      {/* Canvas area */}
      <div style={{
        flex: 1, overflow: "auto",
        display: "flex", alignItems: "flex-start",
        justifyContent: "center", padding: 16,
      }}>
        <canvas
          ref={canvasRef}
          width={imageSize.w}
          height={imageSize.h}
          style={{
            maxWidth: "100%",
            cursor: isClosed ? "default" : "crosshair",
            display: "block",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
        />
      </div>
    </div>
  );
};

// ── MAIN DESIGN SELECTOR COMPONENT ──
const DesignSelector = ({ onDesignSaved, jobId, declaredStyle }) => {
  const [stage, setStage] = useState("upload");
  const [fullImage, setFullImage] = useState(null);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [design, setDesign] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const [styleDetection, setStyleDetection] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    const validTypes = [".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp"];
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!validTypes.includes(ext)) {
      setError("Please upload a PDF, PNG, JPG, or TIFF file.");
      return;
    }

    setLoading(true);
    setError(null);
    setStage("converting");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/extract/convert`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.notes);
        setStage("upload");
        setLoading(false);
        return;
      }

      setFullImage(data.image_base64);
      setImageSize({ w: data.width, h: data.height });
      setStage("ready");
      setLoading(false);

    } catch (err) {
      setError("Could not connect to backend.");
      setStage("upload");
      setLoading(false);
    }
  };

  const handlePolygonComplete = async (polygon) => {
    setShowModal(false);
    setLoading(true);
    setError(null);

    try {
      // Step 1: Crop the design
      const cropResponse = await fetch(`${API_BASE}/extract/crop-design`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: fullImage,
          polygon,
          job_id: jobId || "",
        }),
      });
      const cropData = await cropResponse.json();
      if (!cropData.success) {
        setError(cropData.notes);
        setLoading(false);
        return;
      }
      setDesign(cropData);

      // Step 2: Detect box style from polygon
      if (declaredStyle) {
        const detectResponse = await fetch(`${API_BASE}/extract/detect-box-style`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            polygon,
            image_width: imageSize.w,
            image_height: imageSize.h,
            declared_style: declaredStyle,
          }),
        });
        const detectData = await detectResponse.json();
        setStyleDetection(detectData);
      }

      setStage("previewing");

    } catch (err) {
      setError("Could not extract design.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!design) return;
    onDesignSaved(design);
    setStage("done");
  };

  const handleStartOver = () => {
    setStage("upload");
    setFullImage(null);
    setDesign(null);
    setError(null);
    setShowModal(false);
  };

  return (
    <div>
      {/* Fullscreen polygon modal */}
      {showModal && fullImage && (
        <PolygonCanvas
          imageBase64={fullImage}
          imageSize={imageSize}
          onComplete={handlePolygonComplete}
          onCancel={() => setShowModal(false)}
        />
      )}

      {/* Progress steps */}
      <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
        {[
          { id: "upload", label: "1. Upload" },
          { id: "ready", label: "2. Draw Polygon" },
          { id: "previewing", label: "3. Preview" },
          { id: "done", label: "4. Saved" },
        ].map(({ id, label }) => {
          const order = ["upload", "converting", "ready", "previewing", "done"];
          const cur = order.indexOf(stage);
          const idx = order.indexOf(id);
          const active = id === stage || (id === "upload" && stage === "converting");
          const done = idx < cur;
          return (
            <div key={id} style={{
              flex: 1, padding: "5px 4px", borderRadius: 5, textAlign: "center",
              background: active ? BRAND : done ? "#e8f5e9" : "#f0f0f0",
              color: active ? "white" : done ? "#27ae60" : "#999",
              fontSize: 10, fontWeight: active || done ? "700" : "400",
            }}>
              {done ? "✓ " : ""}{label}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fdecea", border: "1px solid #e74c3c", borderRadius: 6, padding: "8px 10px", marginBottom: 10, fontSize: 12, color: "#c0392b" }}>
          ⚠️ {error}
        </div>
      )}

      {/* UPLOAD stage */}
      {(stage === "upload" || stage === "converting") && (
        <div
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !loading && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? BRAND : "#ccc"}`,
            borderRadius: 8, padding: "20px 12px", textAlign: "center",
            cursor: loading ? "wait" : "pointer",
            background: dragOver ? BRAND_LIGHT : "#fafafa",
          }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif,.bmp"
            style={{ display: "none" }}
            onChange={e => handleFile(e.target.files[0])}
          />
          <div style={{ fontSize: 28, marginBottom: 6 }}>{loading ? "⏳" : "🖼️"}</div>
          <div style={{ fontSize: 13, fontWeight: "600", color: "#555" }}>
            {loading ? "Converting..." : "Drop artwork file or click to browse"}
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>PDF, PNG, JPG, TIFF</div>
        </div>
      )}

      {/* READY stage — show thumbnail + open modal button */}
      {stage === "ready" && fullImage && (
        <div>
          <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden", marginBottom: 10, maxHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
            <img
              src={`data:image/png;base64,${fullImage}`}
              alt="Artwork preview"
              style={{ maxWidth: "100%", maxHeight: 180, display: "block" }}
            />
          </div>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>
            ✅ File loaded — now draw a polygon around the carton dieline
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 8, border: "none",
              background: BRAND, color: "white", fontWeight: "700",
              cursor: "pointer", fontSize: 14,
            }}>
            ✏️ Open Full-Screen Polygon Editor
          </button>
          <button onClick={handleStartOver} style={{
            width: "100%", marginTop: 6, padding: "7px 0", borderRadius: 8,
            border: "1px solid #ddd", background: "white", color: "#888",
            cursor: "pointer", fontSize: 12,
          }}>
            ← Upload different file
          </button>
        </div>
      )}

      {/* STAGE: Previewing */}
      {stage === "previewing" && design && (
        <div>
          <div style={{ fontSize: 12, color: "#27ae60", fontWeight: "700", marginBottom: 10 }}>
            ✅ Design extracted — {design.polygon.length} point polygon
          </div>

          {/* Box style detection result — show as popup */}
          {styleDetection && (
            <div style={{
              background: styleDetection.match ? "#e8f5e9" : "#fff8e1",
              border: `1px solid ${styleDetection.match ? "#27ae60" : "#f9a825"}`,
              borderRadius: 10, padding: 14, marginBottom: 14,
            }}>
              <div style={{ fontWeight: "800", fontSize: 13, marginBottom: 8, color: styleDetection.match ? "#166534" : "#856404" }}>
                {styleDetection.match ? "✅ Box Style Confirmed" : "⚠️ Box Style Mismatch Detected"}
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ background: "white", borderRadius: 6, padding: "6px 10px", fontSize: 12 }}>
                  <div style={{ fontSize: 10, color: "#888" }}>You selected</div>
                  <div style={{ fontWeight: "700", color: "#1a4a7a" }}>{styleDetection.declared_style_name}</div>
                </div>
                <div style={{ fontSize: 18, color: "#aaa", display: "flex", alignItems: "center" }}>→</div>
                <div style={{
                  background: styleDetection.match ? "#e8f5e9" : "#fdecea",
                  borderRadius: 6, padding: "6px 10px", fontSize: 12,
                }}>
                  <div style={{ fontSize: 10, color: "#888" }}>Polygon suggests</div>
                  <div style={{ fontWeight: "700", color: styleDetection.match ? "#166534" : "#c0392b" }}>
                    {styleDetection.detected_style_name}
                  </div>
                </div>
                <div style={{
                  background: "#f8f9fa", borderRadius: 6, padding: "6px 10px", fontSize: 12,
                }}>
                  <div style={{ fontSize: 10, color: "#888" }}>Confidence</div>
                  <div style={{ fontWeight: "700", color: styleDetection.confidence === "High" ? "#27ae60" : styleDetection.confidence === "Medium" ? "#f39c12" : "#e74c3c" }}>
                    {styleDetection.confidence}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: "#555", marginBottom: 10, lineHeight: 1.5 }}>
                {styleDetection.suggestion}
              </div>

              {/* Ratio breakdown */}
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#dbeafe", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}>
                  Top flap: <strong>{(styleDetection.top_ratio * 100).toFixed(1)}%</strong> of flat height
                </div>
                <div style={{ background: "#fce7f3", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}>
                  Bottom flap: <strong>{(styleDetection.bottom_ratio * 100).toFixed(1)}%</strong> of flat height
                </div>
              </div>

              {/* Suggest change button */}
              {!styleDetection.match && styleDetection.confidence !== "Low" && onStyleSuggested && (
                <button
                  onClick={() => onStyleSuggested(styleDetection.detected_style)}
                  style={{
                    padding: "7px 14px", borderRadius: 6, border: "none",
                    background: "#f39c12", color: "white", fontWeight: "700",
                    cursor: "pointer", fontSize: 12, marginRight: 8,
                  }}>
                  ✓ Change to {styleDetection.detected_style_name}
                </button>
              )}
              <button
                onClick={() => setStyleDetection(null)}
                style={{
                  padding: "7px 14px", borderRadius: 6,
                  border: "1px solid #ddd", background: "white",
                  color: "#666", cursor: "pointer", fontSize: 12,
                }}>
                Keep {styleDetection.declared_style_name}
              </button>
            </div>
          )}

          {/* Design preview */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>DESIGN</div>
              <div style={{ border: "1px solid #eee", borderRadius: 6, overflow: "hidden" }}>
                <img src={`data:image/png;base64,${design.cropped_image_base64}`} alt="Design" style={{ width: "100%", display: "block" }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>MASK (nesting)</div>
              <div style={{ border: "1px solid #333", borderRadius: 6, overflow: "hidden", background: "#111" }}>
                <img src={`data:image/png;base64,${design.mask_image_base64}`} alt="Mask" style={{ width: "100%", display: "block" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSave} style={{
              flex: 1, padding: "10px 0", borderRadius: 7, border: "none",
              background: "#27ae60", color: "white", fontWeight: "700",
              cursor: "pointer", fontSize: 13,
            }}>
              ✓ Save to Job
            </button>
            <button onClick={() => setShowModal(true)} style={{
              padding: "10px 14px", borderRadius: 7,
              border: "1px solid #ddd", background: "white",
              color: "#666", cursor: "pointer", fontSize: 12,
            }}>
              ← Redo
            </button>
          </div>
        </div>
      )}

      {/* DONE stage */}
      {stage === "done" && (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
          <div style={{ fontSize: 13, fontWeight: "700", color: "#27ae60", marginBottom: 4 }}>Design saved</div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>Artwork will appear on the layout canvas</div>
          <button onClick={handleStartOver} style={{
            fontSize: 12, color: "#888", background: "none",
            border: "1px solid #ddd", borderRadius: 6,
            padding: "5px 12px", cursor: "pointer",
          }}>
            Upload another
          </button>
        </div>
      )}
    </div>
  );
};

export default DesignSelector;
