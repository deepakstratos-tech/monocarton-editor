import React, { useState, useRef } from "react";
import { API_BASE, BRAND, BRAND_LIGHT, BOX_STYLES } from "../../config/api";
import SectionPanel from "../../components/SectionPanel";

const PDFExtract = ({ onExtracted }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    handleFile(dropped);
  };

  const handleExtract = async () => {
    if (!file) { setError("Please select a PDF file first."); return; }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/extract/pdf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Extraction failed");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Could not extract from PDF. Try entering dimensions manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseResult = () => {
    if (!result || !result.success) return;
    onExtracted({
      style: result.box_style || "bottom_side_lock",
      length: result.length,
      width: result.width,
      height: result.height,
      product_name: result.product_name || "",
    });
  };

  const getConfidenceColor = (confidence) => {
    if (!confidence) return "#888";
    if (confidence.startsWith("High")) return "#27ae60";
    if (confidence.startsWith("Medium")) return "#f39c12";
    return "#e74c3c";
  };

  const getStyleLabel = (styleId) => {
    const style = BOX_STYLES.find(s => s.id === styleId);
    return style ? style.label : styleId;
  };

  return (
    <SectionPanel title="📄 Extract from PDF Artwork">

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? BRAND : "#ccc"}`,
          borderRadius: 10,
          padding: 24,
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? BRAND_LIGHT : "#fafafa",
          transition: "all 0.2s",
          marginBottom: 12,
        }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          onChange={e => handleFile(e.target.files[0])}
        />
        <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
        {file ? (
          <div>
            <div style={{ fontWeight: "700", color: BRAND, fontSize: 14 }}>{file.name}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              {(file.size / 1024).toFixed(1)} KB — Click to change
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 14, color: "#555", fontWeight: "600" }}>
              Drop PDF artwork here or click to browse
            </div>
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
              Supports Makin Laboratories and standard artwork PDF formats
            </div>
          </div>
        )}
      </div>

      {/* Extract button */}
      <button
        onClick={handleExtract}
        disabled={!file || loading}
        style={{
          width: "100%", padding: "10px 0", borderRadius: 7,
          border: "none", background: file && !loading ? BRAND : "#ccc",
          color: "white", fontWeight: "700", cursor: file && !loading ? "pointer" : "not-allowed",
          fontSize: 13, marginBottom: 12,
        }}>
        {loading ? "⏳ Extracting..." : "Extract Dimensions from PDF"}
      </button>

      {/* Error */}
      {error && (
        <div style={{
          background: "#fdecea", border: "1px solid #e74c3c",
          borderRadius: 8, padding: "10px 12px",
          fontSize: 13, color: "#c0392b", marginBottom: 12,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{
          background: result.success ? "#e8f5e9" : "#fff8e1",
          border: `1px solid ${result.success ? "#66bb6a" : "#f9a825"}`,
          borderRadius: 10, padding: 16,
        }}>
          {result.success ? (
            <>
              <div style={{ fontWeight: "800", color: "#27ae60", fontSize: 14, marginBottom: 12 }}>
                ✅ Dimensions extracted successfully
              </div>

              {/* Extracted values */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {[
                  { label: "Product Name", value: result.product_name || "Not found" },
                  { label: "Box Style", value: getStyleLabel(result.box_style) },
                  { label: "Length (L)", value: `${result.length} ${result.unit}` },
                  { label: "Width (W)", value: `${result.width} ${result.unit}` },
                  { label: "Height (H)", value: `${result.height} ${result.unit}` },
                  { label: "Unit", value: result.unit?.toUpperCase() || "mm" },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    background: "white", borderRadius: 6,
                    padding: "6px 10px",
                  }}>
                    <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: "700", color: "#333" }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Confidence */}
              <div style={{
                fontSize: 12, color: getConfidenceColor(result.confidence),
                marginBottom: 12, fontWeight: "600",
              }}>
                🎯 Confidence: {result.confidence || "Unknown"}
              </div>

              {/* Notes */}
              {result.notes && (
                <div style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>
                  ℹ️ {result.notes}
                </div>
              )}

              {/* Raw text preview */}
              {result.raw_text && (
                <details style={{ marginBottom: 12 }}>
                  <summary style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>
                    View extracted text
                  </summary>
                  <pre style={{
                    fontSize: 10, color: "#666", background: "#f8f9fa",
                    borderRadius: 6, padding: 8, marginTop: 6,
                    overflow: "auto", maxHeight: 120, whiteSpace: "pre-wrap",
                  }}>
                    {result.raw_text}
                  </pre>
                </details>
              )}

              {/* Use dimensions button */}
              <button
                onClick={handleUseResult}
                style={{
                  width: "100%", padding: "10px 0", borderRadius: 7,
                  border: "none", background: BRAND, color: "white",
                  fontWeight: "700", cursor: "pointer", fontSize: 13,
                }}>
                Use These Dimensions →
              </button>
            </>
          ) : (
            <>
              <div style={{ fontWeight: "800", color: "#f39c12", fontSize: 14, marginBottom: 8 }}>
                ⚠️ Could not extract dimensions automatically
              </div>
              <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>
                {result.notes}
              </div>
              {result.raw_text && (
                <details>
                  <summary style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>
                    View extracted text to find dimensions manually
                  </summary>
                  <pre style={{
                    fontSize: 10, color: "#666", background: "#f8f9fa",
                    borderRadius: 6, padding: 8, marginTop: 6,
                    overflow: "auto", maxHeight: 120, whiteSpace: "pre-wrap",
                  }}>
                    {result.raw_text}
                  </pre>
                </details>
              )}
            </>
          )}
        </div>
      )}
    </SectionPanel>
  );
};

export default PDFExtract;
