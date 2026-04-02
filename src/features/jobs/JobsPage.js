import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BRAND, BRAND_LIGHT, BOX_STYLES,
  PAPER_TYPES, LAMINATION_TYPES, COLOUR_TYPES, STAMPING_TYPES, API_BASE
} from "../../config/api";
import SectionPanel from "../../components/SectionPanel";
import Tooltip from "../../components/Tooltip";
import DesignSelector from "../extract/DesignSelector";

const inputStyle = {
  width: "100%", padding: "7px 8px", borderRadius: 6,
  border: "1px solid #ddd", fontSize: 13, marginTop: 4,
  boxSizing: "border-box",
};
const labelStyle = {
  fontSize: 11, color: "#666", fontWeight: "700",
  textTransform: "uppercase", letterSpacing: 0.6,
};

const JOB_COLORS = ["#4F86C6","#e67e22","#27ae60","#9b59b6","#e74c3c","#1abc9c","#f39c12","#2c3e50"];

const EMPTY_JOB = {
  client_name: "", product_name: "",
  style: "bottom_side_lock",
  length: "", width: "", height: "",
  quantity: "", paper_type: "FBB", gsm: "",
  lamination: "UV", colours: "CMYK", stamping: "NONE",
};

const JobsPage = ({ jobs, setJobs }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_JOB);
  const [editingId, setEditingId] = useState(null);
  const [pendingDesign, setPendingDesign] = useState(null);
  const [expandedDesign, setExpandedDesign] = useState(null); // job_id of expanded artwork section
  const [error, setError] = useState(null);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

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
          length: Number(form.length), width: Number(form.width),
          height: Number(form.height), quantity: Number(form.quantity),
          gsm: Number(form.gsm),
        }]),
      });

      if (!response.ok) {
        const err = await response.json();
        setError(`Backend error: ${JSON.stringify(err.detail)}`);
        return;
      }

      const data = await response.json();
      if (!data || !Array.isArray(data) || !data[0]) {
        setError("Invalid response from backend.");
        return;
      }

      const enrichedJob = { ...data[0], design: pendingDesign || null };

      if (editingId) {
        setJobs(prev => prev.map(j => j.job_id === editingId ? enrichedJob : j));
        setEditingId(null);
      } else {
        setJobs(prev => [...prev, enrichedJob]);
      }

      setForm(EMPTY_JOB);
      setPendingDesign(null);

    } catch (err) {
      setError(`Could not connect to backend: ${err.message}`);
    }
  };

  const handleEdit = (job) => {
    setEditingId(job.job_id);
    setPendingDesign(job.design || null);
    setForm({
      client_name: job.client_name, product_name: job.product_name,
      style: job.style, length: job.length, width: job.width, height: job.height,
      quantity: job.quantity, paper_type: job.paper_type, gsm: job.gsm,
      lamination: job.lamination, colours: job.colours, stamping: job.stamping,
    });
  };

  const handleDelete = (job_id) => setJobs(prev => prev.filter(j => j.job_id !== job_id));

  const handleCancel = () => {
    setEditingId(null);
    setForm(EMPTY_JOB);
    setPendingDesign(null);
    setError(null);
  };

  const handleSaveDesignToJob = (job_id, design) => {
    setJobs(prev => prev.map(j => j.job_id === job_id ? { ...j, design } : j));
    setExpandedDesign(null);
  };

  const handleRemoveDesignFromJob = (job_id) => {
    setJobs(prev => prev.map(j => j.job_id === job_id ? { ...j, design: null } : j));
  };

  return (
    <div style={{ padding: "24px 32px", background: "#f4f6f9", minHeight: "calc(100vh - 120px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: BRAND, fontSize: 20 }}>📋 Job Management</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>
            Add carton jobs. Upload artwork for each job to use in imposition layout.
          </p>
        </div>
        {jobs.length >= 2 && (
          <button onClick={() => navigate("/planner")} style={{
            padding: "10px 20px", borderRadius: 8, border: "none",
            background: BRAND, color: "white", fontWeight: "700", cursor: "pointer", fontSize: 14,
          }}>
            Plan Imposition →
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>

        {/* ADD/EDIT JOB FORM */}
        <div style={{ flex: "0 0 380px" }}>
          <SectionPanel title={editingId ? "✏️ Edit Job" : "➕ Add New Job"}>

            {error && (
              <div style={{ background: "#fdecea", border: "1px solid #e74c3c", borderRadius: 6, padding: "8px 12px", marginBottom: 12, fontSize: 13, color: "#c0392b" }}>
                ⚠️ {error}
              </div>
            )}

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
                { label: "L (mm)", field: "length", tip: "Length" },
                { label: "W (mm)", field: "width", tip: "Width" },
                { label: "H (mm)", field: "height", tip: "Height" },
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
              <label style={labelStyle}>Quantity Required</label>
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
                  {PAPER_TYPES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
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
                  {LAMINATION_TYPES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Colours</label>
                <select style={inputStyle} value={form.colours}
                  onChange={e => handleChange("colours", e.target.value)}>
                  {COLOUR_TYPES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Stamping */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Stamping</label>
              <select style={inputStyle} value={form.stamping}
                onChange={e => handleChange("stamping", e.target.value)}>
                {STAMPING_TYPES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {/* Artwork for new job */}
            <div style={{ borderTop: `2px solid ${BRAND_LIGHT}`, paddingTop: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: "700", color: BRAND, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                🎨 Carton Artwork <span style={{ fontSize: 10, color: "#aaa", fontWeight: "400" }}>(optional)</span>
              </div>
              {pendingDesign ? (
                <div>
                  <div style={{ border: "1px solid #eee", borderRadius: 6, overflow: "hidden", marginBottom: 6 }}>
                    <img src={`data:image/png;base64,${pendingDesign.cropped_image_base64}`} alt="Design" style={{ width: "100%", display: "block" }} />
                  </div>
                  <div style={{ fontSize: 12, color: "#27ae60", marginBottom: 6 }}>
                    ✅ {pendingDesign.polygon.length} point polygon ready
                  </div>
                  <button onClick={() => setPendingDesign(null)} style={{
                    fontSize: 11, color: "#e74c3c", background: "none",
                    border: "1px solid #fcc", borderRadius: 6,
                    padding: "3px 8px", cursor: "pointer",
                  }}>
                    × Remove
                  </button>
                </div>
              ) : (
                <DesignSelector
                  onDesignSaved={setPendingDesign}
                  jobId=""
                  declaredStyle={form.style}
                  onStyleSuggested={(suggestedStyle) => {
                    handleChange("style", suggestedStyle);
                  }}
                />
              )}
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
                  borderLeft: `4px solid ${JOB_COLORS[idx % 8]}`,
                }}>
                  {/* Job header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: "800", fontSize: 15, color: BRAND }}>{job.product_name}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{job.client_name}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleEdit(job)} style={{
                        padding: "4px 10px", borderRadius: 6, border: "1px solid #ddd",
                        background: "white", cursor: "pointer", fontSize: 12, color: "#666",
                      }}>Edit</button>
                      <button onClick={() => handleDelete(job.job_id)} style={{
                        padding: "4px 10px", borderRadius: 6, border: "1px solid #fcc",
                        background: "#fff5f5", cursor: "pointer", fontSize: 12, color: "#e74c3c",
                      }}>Remove</button>
                    </div>
                  </div>

                  {/* Job specs */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {[
                      { label: "Size", value: `${job.length}×${job.width}×${job.height}mm` },
                      { label: "Flat", value: `${job.flat_w}×${job.flat_h}mm` },
                      { label: "Qty", value: Number(job.quantity).toLocaleString() },
                      { label: "Paper", value: job.paper_type },
                      { label: "GSM", value: job.gsm },
                      { label: "Lam", value: job.lamination },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: "#f8f9fa", borderRadius: 5, padding: "3px 8px", fontSize: 11 }}>
                        <span style={{ color: "#888" }}>{label}: </span>
                        <span style={{ fontWeight: "700", color: "#333" }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Artwork section */}
                  <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
                    {job.design ? (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ flex: 1, fontSize: 12, color: "#27ae60", fontWeight: "700" }}>
                            🎨 Artwork saved — {job.design.polygon.length} point polygon
                          </div>
                          <button
                            onClick={() => setExpandedDesign(expandedDesign === job.job_id ? null : job.job_id)}
                            style={{ fontSize: 11, color: BRAND, background: "none", border: "1px solid #ddd", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}>
                            {expandedDesign === job.job_id ? "▲ Hide" : "▼ Show"}
                          </button>
                          <button
                            onClick={() => handleRemoveDesignFromJob(job.job_id)}
                            style={{ fontSize: 11, color: "#e74c3c", background: "none", border: "1px solid #fcc", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}>
                            × Remove
                          </button>
                        </div>

                        {expandedDesign === job.job_id && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <div style={{ flex: 1, border: "1px solid #eee", borderRadius: 6, overflow: "hidden" }}>
                              <img src={`data:image/png;base64,${job.design.cropped_image_base64}`} alt="Design" style={{ width: "100%", display: "block" }} />
                            </div>
                            <div style={{ flex: 1, border: "1px solid #333", borderRadius: 6, overflow: "hidden", background: "#111" }}>
                              <img src={`data:image/png;base64,${job.design.mask_image_base64}`} alt="Mask" style={{ width: "100%", display: "block" }} />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ fontSize: 12, color: "#aaa", flex: 1 }}>🎨 No artwork uploaded</div>
                          <button
                            onClick={() => setExpandedDesign(expandedDesign === job.job_id ? null : job.job_id)}
                            style={{ fontSize: 11, color: BRAND, background: BRAND_LIGHT, border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontWeight: "600" }}>
                            + Upload Artwork
                          </button>
                        </div>

                        {expandedDesign === job.job_id && (
                          <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 12 }}>
                            <DesignSelector
                              onDesignSaved={(design) => handleSaveDesignToJob(job.job_id, design)}
                              jobId={job.job_id}
                              declaredStyle={job.style}
                              onStyleSuggested={(suggestedStyle) => {
                                setJobs(prev => prev.map(j =>
                                  j.job_id === job.job_id ? { ...j, style: suggestedStyle } : j
                                ));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {jobs.length >= 2 && (
                <button onClick={() => navigate("/planner")} style={{
                  padding: "12px 0", borderRadius: 10, border: "none",
                  background: BRAND, color: "white", fontWeight: "700",
                  cursor: "pointer", fontSize: 14, marginTop: 4,
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
