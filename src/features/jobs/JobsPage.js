import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BRAND, BRAND_LIGHT, BOX_STYLES,
  PAPER_TYPES, LAMINATION_TYPES, COLOUR_TYPES, STAMPING_TYPES, API_BASE
} from "../../config/api";
import SectionPanel from "../../components/SectionPanel";
import Tooltip from "../../components/Tooltip";
import PDFExtract from "../extract/PDFExtract";

const inputStyle = {
  width: "100%", padding: "7px 8px", borderRadius: 6,
  border: "1px solid #ddd", fontSize: 13, marginTop: 4,
  boxSizing: "border-box",
};
const labelStyle = {
  fontSize: 11, color: "#666", fontWeight: "700",
  textTransform: "uppercase", letterSpacing: 0.6,
};

const EMPTY_JOB = {
  client_name: "",
  product_name: "",
  style: "bottom_side_lock",
  length: "",
  width: "",
  height: "",
  quantity: "",
  paper_type: "FBB",
  gsm: "",
  lamination: "UV",
  colours: "CMYK",
  stamping: "NONE",
};

const JobsPage = ({ jobs, setJobs }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_JOB);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.client_name) return "Client name is required";
    if (!form.product_name) return "Product name is required";
    if (!form.length || !form.width || !form.height) return "All dimensions are required";
    if (!form.quantity || form.quantity <= 0) return "Quantity must be greater than 0";
    if (!form.gsm || form.gsm <= 0) return "GSM is required";
    return null;
  };

  const handleAddJob = async () => {
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/jobs/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{
          ...form,
          length: Number(form.length),
          width: Number(form.width),
          height: Number(form.height),
          quantity: Number(form.quantity),
          gsm: Number(form.gsm),
        }]),
      });

      if (!response.ok) {
        const err = await response.json();
        setError(`Backend error: ${JSON.stringify(err.detail)}`);
        return;
      }

      const data = await response.json();

      // Guard — make sure we got a valid response
      if (!data || !Array.isArray(data) || data.length === 0 || !data[0]) {
        setError("Invalid response from backend.");
        return;
      }

      const enrichedJob = data[0];

      if (editingId) {
        setJobs(prev => prev.map(j => j.job_id === editingId ? enrichedJob : j));
        setEditingId(null);
      } else {
        setJobs(prev => [...prev, enrichedJob]);
      }
      setForm(EMPTY_JOB);
    } catch (err) {
      setError(`Could not connect to backend: ${err.message}`);
    }
  };

  const handleEdit = (job) => {
    setEditingId(job.job_id);
    setForm({
      client_name: job.client_name,
      product_name: job.product_name,
      style: job.style,
      length: job.length,
      width: job.width,
      height: job.height,
      quantity: job.quantity,
      paper_type: job.paper_type,
      gsm: job.gsm,
      lamination: job.lamination,
      colours: job.colours,
      stamping: job.stamping,
    });
  };

  const handleDelete = (job_id) => {
    setJobs(prev => prev.filter(j => j.job_id !== job_id));
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(EMPTY_JOB);
    setError(null);
  };

  return (
    <div style={{ padding: "24px 32px", background: "#f4f6f9", minHeight: "calc(100vh - 120px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: BRAND, fontSize: 20 }}>📋 Job Management</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>
            Add carton jobs from different clients. Compatible jobs can be imposed together on one sheet.
          </p>
        </div>
        {jobs.length >= 2 && (
          <button
            onClick={() => navigate("/planner")}
            style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: BRAND, color: "white", fontWeight: "700", cursor: "pointer", fontSize: 14 }}>
            Plan Imposition →
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>

        {/* ADD JOB FORM */}
        <div style={{ flex: "0 0 380px" }}>
          <SectionPanel title={editingId ? "✏️ Edit Job" : "➕ Add New Job"}>

            {error && (
              <div style={{ background: "#fdecea", border: "1px solid #e74c3c", borderRadius: 6, padding: "8px 12px", marginBottom: 12, fontSize: 13, color: "#c0392b" }}>
                ⚠️ {error}
              </div>
            )}

            {/* PDF Extract */}
            <PDFExtract onExtracted={({ style, length, width, height, product_name }) => {
              handleChange("style", style);
              handleChange("length", length);
              handleChange("width", width);
              handleChange("height", height);
              if (product_name) handleChange("product_name", product_name);
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

            {/* Client + Product */}
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Client Name</label>
                <input style={inputStyle} value={form.client_name}
                  onChange={e => handleChange("client_name", e.target.value)}
                  placeholder="e.g. Fronius Biotech" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Product Name</label>
                <input style={inputStyle} value={form.product_name}
                  onChange={e => handleChange("product_name", e.target.value)}
                  placeholder="e.g. Musli Power" />
              </div>
            </div>

            {/* Box Style */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Box Style</label>
              <select style={inputStyle} value={form.style}
                onChange={e => handleChange("style", e.target.value)}>
                {BOX_STYLES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* L W H */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {[
                { label: "L (mm)", field: "length", tip: "Length of folded box" },
                { label: "W (mm)", field: "width", tip: "Width of folded box" },
                { label: "H (mm)", field: "height", tip: "Height of folded box" },
              ].map(({ label, field, tip }) => (
                <div key={field} style={{ flex: 1 }}>
                  <label style={labelStyle}>{label}<Tooltip text={tip} /></label>
                  <input type="number" style={inputStyle} value={form[field]}
                    onChange={e => handleChange(field, e.target.value)} />
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Quantity Required <Tooltip text="Total units to be printed" /></label>
              <input type="number" style={inputStyle} value={form.quantity}
                onChange={e => handleChange("quantity", e.target.value)}
                placeholder="e.g. 5000" />
            </div>

            {/* Paper Type + GSM */}
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Paper Type</label>
                <select style={inputStyle} value={form.paper_type}
                  onChange={e => handleChange("paper_type", e.target.value)}>
                  {PAPER_TYPES.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>GSM</label>
                <input type="number" style={inputStyle} value={form.gsm}
                  onChange={e => handleChange("gsm", e.target.value)}
                  placeholder="e.g. 330" />
              </div>
            </div>

            {/* Lamination + Colours */}
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Lamination</label>
                <select style={inputStyle} value={form.lamination}
                  onChange={e => handleChange("lamination", e.target.value)}>
                  {LAMINATION_TYPES.map(l => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Colours</label>
                <select style={inputStyle} value={form.colours}
                  onChange={e => handleChange("colours", e.target.value)}>
                  {COLOUR_TYPES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stamping */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Stamping / Special Finish</label>
              <select style={inputStyle} value={form.stamping}
                onChange={e => handleChange("stamping", e.target.value)}>
                {STAMPING_TYPES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleAddJob} style={{
                flex: 1, padding: "10px 0", borderRadius: 7, border: "none",
                background: BRAND, color: "white", fontWeight: "700",
                cursor: "pointer", fontSize: 13,
              }}>
                {editingId ? "Update Job" : "Add Job"}
              </button>
              {editingId && (
                <button onClick={handleCancel} style={{
                  padding: "10px 16px", borderRadius: 7,
                  border: "1px solid #ddd", background: "white",
                  color: "#666", fontWeight: "600", cursor: "pointer", fontSize: 13,
                }}>
                  Cancel
                </button>
              )}
            </div>
          </SectionPanel>
        </div>

        {/* JOBS LIST */}
        <div style={{ flex: 1, minWidth: 300 }}>
          {jobs.length === 0 ? (
            <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <div style={{ fontSize: 16, color: "#888", marginBottom: 8 }}>No jobs added yet</div>
              <div style={{ fontSize: 13, color: "#aaa" }}>Add at least 2 jobs to plan an imposition</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {jobs.filter(job => job && job.job_id).map((job, idx) => (
                <div key={job.job_id} style={{
                  background: "white", borderRadius: 12, padding: 16,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  borderLeft: `4px solid ${["#4F86C6","#e67e22","#27ae60","#9b59b6","#e74c3c","#1abc9c","#f39c12","#2c3e50"][idx % 8]}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: "800", fontSize: 15, color: BRAND }}>{job.product_name}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{job.client_name}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleEdit(job)} style={{
                        padding: "4px 12px", borderRadius: 6, border: "1px solid #ddd",
                        background: "white", cursor: "pointer", fontSize: 12, color: "#666",
                      }}>Edit</button>
                      <button onClick={() => handleDelete(job.job_id)} style={{
                        padding: "4px 12px", borderRadius: 6, border: "1px solid #fcc",
                        background: "#fff5f5", cursor: "pointer", fontSize: 12, color: "#e74c3c",
                      }}>Remove</button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {[
                      { label: "Size", value: `${job.length}×${job.width}×${job.height}mm` },
                      { label: "Flat", value: `${job.flat_w}×${job.flat_h}mm` },
                      { label: "Qty", value: job.quantity.toLocaleString() },
                      { label: "Paper", value: job.paper_type },
                      { label: "GSM", value: job.gsm },
                      { label: "Lam", value: job.lamination },
                      { label: "Colours", value: job.colours },
                    ].map(({ label, value }) => (
                      <div key={label} style={{
                        background: "#f8f9fa", borderRadius: 6,
                        padding: "4px 8px", fontSize: 11,
                      }}>
                        <span style={{ color: "#888" }}>{label}: </span>
                        <span style={{ fontWeight: "700", color: "#333" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {jobs.length >= 2 && (
                <button
                  onClick={() => navigate("/planner")}
                  style={{
                    padding: "12px 0", borderRadius: 10, border: "none",
                    background: BRAND, color: "white", fontWeight: "700",
                    cursor: "pointer", fontSize: 14, marginTop: 8,
                  }}>
                  Plan Imposition with {jobs.length} Jobs →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
