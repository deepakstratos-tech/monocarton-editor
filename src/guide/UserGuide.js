import { useState } from "react";

const UserGuide = ({ open, onClose }) => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "📋 What is Mono?" },
    { id: "howto", label: "🚀 How to Use Mono" },
    { id: "boxstyles", label: "📦 Box Styles" },
    { id: "dieline", label: "📐 The Flat Dieline" },
    { id: "algorithms", label: "🧮 Layout Algorithms" },
    { id: "results", label: "📊 Reading Results" },
    { id: "tumble", label: "🔄 Tumble Layout" },
    { id: "export", label: "⬇️ Exporting Files" },
    { id: "glossary", label: "📖 Glossary" },
    { id: "jobs", label: "📋 Job Management" },
    { id: "planner", label: "🗓️ Imposition Planner" },
    { id: "pdfextract", label: "📄 PDF Extraction" },
  ];

  const content = {
    overview: (
      <div>
        <h2 style={{ color: "#1a4a7a", marginTop: 0 }}>What is Mono?</h2>
        <p>Mono is a carton imposition planning tool built specifically for packaging professionals. It helps you answer one critical question:</p>
        <div style={{ background: "#e8f0f7", borderRadius: 8, padding: 16, margin: "16px 0", fontSize: 15, fontWeight: "600", color: "#1a4a7a", textAlign: "center" }}>
          "How many cartons can I fit on a print sheet — and what is the best arrangement?"
        </div>
        <p>In packaging, the number of cartons you can fit on a sheet directly affects your cost per unit. More cartons per sheet means lower cost, less paper waste, and faster production.</p>
        <p>Mono takes your 3D box dimensions and sheet size, automatically calculates the flat dieline size, and uses multiple algorithms to find the layout that gives you the maximum number of cartons per sheet.</p>
        <h3 style={{ color: "#1a4a7a" }}>Who is Mono for?</h3>
        <ul style={{ lineHeight: 2 }}>
          <li>Print shop managers planning imposition for pharmaceutical cartons</li>
          <li>Packaging designers who want to quickly check yield before sending to press</li>
          <li>Production planners comparing straight vs tumble layout options</li>
        </ul>
        <h3 style={{ color: "#1a4a7a" }}>What Mono is NOT</h3>
        <ul style={{ lineHeight: 2 }}>
          <li>Mono is not a design tool — it does not create artwork</li>
          <li>Mono is not a replacement for ArtiosCAD for complex jobs</li>
          <li>Mono is currently in development — always validate results against your press before production use</li>
        </ul>
      </div>
    ),

    howto: (
      <div>
        <h2 style={{ color: "#1a4a7a", marginTop: 0 }}>How to Use Mono</h2>
        <p>Follow these steps in order for the best results:</p>
        {[
          { step: "1", title: "Select Your Box Style", color: "#1565c0", content: "Choose the structural style of your carton from the Box Style dropdown. This is the most important step — the wrong style will give incorrect flat size calculations. If you are unsure, Bottom Side Lock is the most common style for pharmaceutical cartons." },
          { step: "2", title: "Enter Box Dimensions", color: "#6a1b9a", content: "Enter the Length (L), Width (W), and Height (H) of the finished folded box in millimetres. These are the 3D dimensions of the box as it would sit on a shelf — not the flat size. Mono calculates the flat size automatically." },
          { step: "3", title: "Check the Flat Dieline", color: "#27ae60", content: "Once you enter the dimensions, the Flat Dieline diagram updates automatically. Check that it looks correct — the proportions of Front, Back, Left, Right panels and the tuck flap depths should match your actual carton design." },
          { step: "4", title: "Enter Sheet Dimensions", color: "#e67e22", content: "Enter the Width and Height of your print sheet in millimetres. Also set the Border Margin — this is the non-printable area around all 4 edges of the sheet (typically 10-15mm for most presses)." },
          { step: "5", title: "Select an Algorithm", color: "#c0392b", content: "Choose a layout algorithm. If you are unsure, start with Straight for a baseline, then try Tumble to see if nesting gives you more cartons. Use Compare All Algorithms to see all options at once." },
          { step: "6", title: "Read the Results", color: "#16a085", content: "The stats at the top show Total Cartons, Sheet Utilization, Columns × Rows, and Flat Size. The Layout Preview shows exactly how the cartons are arranged on the sheet." },
          { step: "7", title: "Export", color: "#1a4a7a", content: "Export SVG for use in Adobe Illustrator or Esko. Export DXF for use in ArtiosCAD or AutoCAD. The exported file contains the exact carton positions at real-world scale in millimetres." },
        ].map(({ step, title, color, content }) => (
          <div key={step} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: 14, flexShrink: 0 }}>
              {step}
            </div>
            <div>
              <div style={{ fontWeight: "700", color, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{content}</div>
            </div>
          </div>
        ))}
      </div>
    ),

    boxstyles: (
      <div>
        <h2 style={{ color: "#1a4a7a", marginTop: 0 }}>Box Styles</h2>
        <p>The box style determines how the carton is constructed — specifically where the flaps are and how they fold. Mono uses the box style to calculate the correct flat dieline size and nesting saving percentage.</p>
        {[
          {
            name: "Bottom Side Lock",
            color: "#1565c0",
            common: "Most common in pharma",
            description: "The top has a tuck flap that inserts into the box. The bottom has interlocking side panels that lock together without glue. Very popular in pharma because it works well on automatic filling lines.",
            flatFormula: "Flat W = 2(L+W) + 10mm glue flap\nFlat H = H + (H×0.4 top tuck) + (H×0.5 bottom lock)",
            nestingNote: "Top tuck flap (40% of H) nests into bottom lock area of adjacent row in tumble layout.",
            examples: "Musli Power Capsule, Meplex Tablet, Trujoint Plus"
          },
          {
            name: "Straight Tuck End",
            color: "#27ae60",
            common: "Common for lighter products",
            description: "Both top and bottom of the carton have tuck flaps that fold in the same direction. Simple to manufacture and suitable for lighter products.",
            flatFormula: "Flat W = 2(L+W) + 10mm glue flap\nFlat H = H + (H×0.35 top tuck) + (H×0.35 bottom tuck)",
            nestingNote: "Both tucks face same direction — moderate nesting saving in tumble layout.",
            examples: "Small tablet boxes, sachet cartons"
          },
          {
            name: "Reverse Tuck End",
            color: "#6a1b9a",
            common: "Best nesting in tumble layout",
            description: "Similar to Straight Tuck End but top and bottom tuck flaps face opposite directions. Creates better nesting opportunity in tumble layout because opposing tucks interlock more efficiently.",
            flatFormula: "Flat W = 2(L+W) + 10mm glue flap\nFlat H = H + (H×0.35 top tuck) + (H×0.35 bottom tuck)",
            nestingNote: "Opposing tucks create better nesting in tumble — typically higher yield than Straight Tuck End.",
            examples: "Syrup cartons, VAAV Syrup"
          },
          {
            name: "Lock Bottom",
            color: "#e67e22",
            common: "Best for heavy products",
            description: "The bottom is pre-glued and folds out automatically when the box is erected. Creates a very strong base suitable for heavy products like bottles.",
            flatFormula: "Flat W = 2(L+W) + 10mm glue flap\nFlat H = H + (H×0.4 top tuck) + (H×0.6 bottom lock)",
            nestingNote: "Large bottom lock panels leave significant nesting opportunity — good tumble yield for tall boxes.",
            examples: "Syrup bottles, heavy supplement cartons"
          },
        ].map(({ name, color, common, description, flatFormula, nestingNote, examples }) => (
          <div key={name} style={{ background: "white", border: `1px solid ${color}30`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontWeight: "800", fontSize: 15, color }}>{name}</div>
              <div style={{ fontSize: 11, background: `${color}15`, color, padding: "2px 8px", borderRadius: 20, fontWeight: "600" }}>{common}</div>
            </div>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: "0 0 10px" }}>{description}</p>
            <div style={{ background: "#f8f9fa", borderRadius: 6, padding: 10, marginBottom: 8, fontSize: 12, fontFamily: "monospace", color: "#333", whiteSpace: "pre-line" }}>
              {flatFormula}
            </div>
            <div style={{ fontSize: 12, color: "#27ae60", marginBottom: 6 }}>🔄 <strong>Nesting:</strong> {nestingNote}</div>
            <div style={{ fontSize: 12, color: "#888" }}>📦 <strong>Examples:</strong> {examples}</div>
          </div>
        ))}
      </div>
    ),

    dieline: (
      <div>
        <h2 style={{ color: "#1a4a7a", marginTop: 0 }}>The Flat Dieline</h2>
        <p>The flat dieline is the unfolded carton — the shape that gets printed, cut, and creased before being folded into a box. Understanding the dieline is essential for layout planning because it is the actual shape that occupies space on the print sheet.</p>
        <h3 style={{ color: "#1a4a7a" }}>Panel Colours</h3>
        {[
          { color: "#ede9fe", border: "#7c3aed", label: "Front Panel (Purple)", desc: "The main face of the carton. Width = W, Height = H." },
          { color: "#f1f5f9", border: "#64748b", label: "Back Panel (Grey)", desc: "The back face. Same dimensions as Front. Width = W, Height = H." },
          { color: "#dcfce7", border: "#16a34a", label: "Side Panels (Green)", desc: "Left and right faces. Width = L, Height = H." },
          { color: "#dbeafe", border: "#3b82f6", label: "Top Tuck Flap (Blue)", desc: "Closes the top of the box. Depth = 35-40% of H. Key to nesting saving in tumble layout." },
          { color: "#fce7f3", border: "#db2777", label: "Bottom Flap (Pink)", desc: "Bottom closure — tuck or lock depending on style. Depth = 35-60% of H." },
          { color: "#fef9c3", border: "#eab308", label: "Glue Flap (Yellow)", desc: "Narrow strip glued to hold the carton together. Standard width = 10mm." },
        ].map(({ color, border, label, desc }) => (
          <div key={label} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
            <div style={{ width: 24, height: 24, background: color, border: `2px solid ${border}`, borderRadius: 4, flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: "700", fontSize: 13, color: border }}>{label}</div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{desc}</div>
            </div>
          </div>
        ))}
        <h3 style={{ color: "#1a4a7a" }}>Flat Size Formula</h3>
        <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 14, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
          <div><strong>Flat Width</strong> = 2 × (L + W) + Glue Flap</div>
          <div><strong>Flat Height</strong> = H + Top Tuck Depth + Bottom Flap Depth</div>
        </div>
        <h3 style={{ color: "#1a4a7a" }}>Example — Musli Power Capsule</h3>
        <div style={{ background: "#e8f5e9", borderRadius: 8, padding: 14, fontFamily: "monospace", fontSize: 12, lineHeight: 2 }}>
          <div>Box: L=45mm, W=45mm, H=83mm (Bottom Side Lock)</div>
          <div>Flat W = 2×(45+45) + 10 = <strong>190mm</strong></div>
          <div>Top Tuck = 83 × 0.40 = <strong>33.2mm</strong></div>
          <div>Bottom Lock = 83 × 0.50 = <strong>41.5mm</strong></div>
          <div>Flat H = 83 + 33.2 + 41.5 = <strong>157.7mm</strong></div>
        </div>
      </div>
    ),

    algorithms: (
      <div>
        <h2 style={{ color: "#1a4a7a", marginTop: 0 }}>Layout Algorithms</h2>
        <p>Mono offers 6 different algorithms. Always use <strong>Compare All Algorithms</strong> to find the best one for your specific job.</p>
        {[
          { icon: "▲▲▲", name: "Straight Layout", color: "#1565c0", when: "Use as your baseline first", how: "Places all cartons in the same orientation, row by row left to right, top to bottom.", pros: "Simple and predictable", cons: "No nesting — wastes tuck flap space between rows", bestFor: "Jobs where carton artwork cannot be rotated or flipped" },
          { icon: "▲▼▲", name: "Tumble Layout", color: "#6a1b9a", when: "Use for maximum nesting yield", how: "Alternates row orientation — odd rows face up (▲) and even rows face down (▼). The tuck flap of the downward row nests into the gap of the upward row.", pros: "Best nesting — typically 15-25% more cartons than straight", cons: "Artwork must be designed for tumble printing", bestFor: "Pharmaceutical cartons with prominent tuck flaps" },
          { icon: "→→→", name: "First Fit", color: "#27ae60", when: "Quick baseline check", how: "Places each carton in the first available position, scanning left to right and top to bottom.", pros: "Fast and simple", cons: "No optimisation", bestFor: "Quick checks" },
          { icon: "↓→→", name: "First Fit Decreasing (FFD)", color: "#e67e22", when: "Mixed sizes or checking rotation", how: "Tries both normal and 90° rotated orientations and picks the one that fits more cartons.", pros: "Automatically checks if rotation improves yield", cons: "Rotation may not suit artwork direction", bestFor: "Checking if rotating the carton gives better yield" },
          { icon: "▬▬▬", name: "NFDH", color: "#c0392b", when: "Multi-SKU jobs", how: "Sorts cartons tallest first, packs into shelves. Each shelf height equals the tallest carton in it.", pros: "Efficient for mixed sizes", cons: "Same as straight for identical sizes", bestFor: "Multiple carton heights on one sheet" },
          { icon: "◎◎◎", name: "Best Fit", color: "#16a085", when: "Minimise trim waste", how: "For each carton finds the shelf with least remaining space that still fits.", pros: "Minimises waste at shelf ends", cons: "Slower for large jobs", bestFor: "Minimising trim waste at sheet edges" },
        ].map(({ icon, name, color, when, how, pros, cons, bestFor }) => (
          <div key={name} style={{ background: "white", border: `1px solid ${color}30`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div style={{ fontWeight: "800", fontSize: 14, color }}>{name}</div>
              <div style={{ fontSize: 11, background: `${color}15`, color, padding: "2px 8px", borderRadius: 20, fontWeight: "600", marginLeft: "auto" }}>{when}</div>
            </div>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.5, margin: "0 0 8px" }}>{how}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 120, background: "#e8f5e9", borderRadius: 6, padding: "5px 8px", fontSize: 12 }}>✅ {pros}</div>
              <div style={{ flex: 1, minWidth: 120, background: "#fdecea", borderRadius: 6, padding: "5px 8px", fontSize: 12 }}>⚠️ {cons}</div>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>🎯 <strong>Best for:</strong> {bestFor}</div>
          </div>
        ))}
      </div>
    ),

    results: (
      <div>
        <h2 style={{ color: "#1a4a7a", marginTop: 0 }}>Reading the Results</h2>
        <p>After Mono calculates the layout, four stat cards appear at the top of the screen.</p>
        {[
          { label: "Total Cartons", color: "#1565c0", desc: "The total number of cartons that fit on one sheet. Higher is better — it means lower cost per unit.", tip: "Compare across algorithms using Compare All Algorithms to find the best approach." },
          { label: "Sheet Utilization %", color: "#27ae60", desc: "The percentage of usable sheet area covered by cartons. 100% = zero waste. 75-90% is excellent for standard carton shapes.", tip: "Green = 80%+ Excellent. Amber = 60-80% Moderate. Red = below 60% — try a different algorithm or sheet size." },
          { label: "Columns × Rows", color: "#6a1b9a", desc: "How cartons are arranged — columns across the width and rows down the height. 3×6 means 3 across and 6 down = 18 total.", tip: "Try changing sheet orientation (portrait vs landscape) for a different arrangement." },
          { label: "Flat Size", color: "#16a085", desc: "The calculated flat dieline dimensions in mm — Width × Height. This is the actual size of the carton on the sheet before folding.", tip: "Cross-check this against your actual dieline file to verify Mono's calculation is correct." },
        ].map(({ label, color, desc, tip }) => (
          <div key={label} style={{ background: "white", borderLeft: `4px solid ${color}`, borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: "800", color, fontSize: 15, marginBottom: 6 }}>{label}</div>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: "0 0 8px" }}>{desc}</p>
            <div style={{ background: `${color}10`, borderRadius: 6, padding: "6px 10px", fontSize: 12, color }}>
              💡 <strong>Tip:</strong> {tip}
            </div>
          </div>
        ))}
      </div>
    ),

    tumble: (
      <div>
        <h2 style={{ color: "#1a4a7a", marginTop: 0 }}>Tumble Layout Explained</h2>
        <p>Tumble layout is the most powerful feature in Mono for maximising yield. Understanding how it works helps you get the most out of it.</p>
        <h3 style={{ color: "#1a4a7a" }}>What is Tumble Layout?</h3>
        <p>In tumble layout, alternate rows of cartons are flipped 180°. Row 1 faces up (▲), Row 2 faces down (▼), Row 3 faces up again, and so on.</p>
        <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 14, fontFamily: "monospace", fontSize: 13, lineHeight: 2.5, textAlign: "center", margin: "16px 0" }}>
          <div style={{ color: "#1565c0" }}>▲ ▲ ▲ — Row 1: Normal orientation</div>
          <div style={{ color: "#e67e22" }}>▼ ▼ ▼ — Row 2: Flipped 180°</div>
          <div style={{ color: "#1565c0" }}>▲ ▲ ▲ — Row 3: Normal orientation</div>
          <div style={{ color: "#e67e22" }}>▼ ▼ ▼ — Row 4: Flipped 180°</div>
        </div>
        <h3 style={{ color: "#1a4a7a" }}>Why Does This Save Space?</h3>
        <p>A carton has a tuck flap at the top that protrudes beyond the main body. When you flip the adjacent row 180°, the tuck flap of the flipped row points downward — into the gap beside the bottom of the normal row. These two flaps nest into each other's space, reducing the vertical gap between rows.</p>
        <h3 style={{ color: "#1a4a7a" }}>The Pair Height Concept</h3>
        <p>In straight layout, two rows take up exactly 2 × Flat Height. In tumble layout, a ▲▼ pair takes less:</p>
        <div style={{ background: "#e8f5e9", borderRadius: 8, padding: 14, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
          <div>Straight: 2 rows = 2 × 157.7mm = 315.4mm</div>
          <div>Tumble pair: 2 × 157.7mm − 33.2mm nesting = 282.2mm</div>
          <div><strong>Saving per pair: 33.2mm</strong></div>
        </div>
        <h3 style={{ color: "#1a4a7a" }}>Nesting Saving %</h3>
        <p>The nesting saving percentage is calculated automatically from your box style and dimensions. It equals the top tuck flap depth divided by the flat height:</p>
        <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 14, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
          <div>Nesting Saving % = Top Tuck Depth ÷ Flat Height × 100</div>
          <div>= 33.2 ÷ 157.7 × 100 = 21.05%</div>
        </div>
        <p>You can override this value manually if your press achieves different results in practice.</p>
        <h3 style={{ color: "#1a4a7a" }}>When NOT to use Tumble</h3>
        <ul style={{ lineHeight: 2, fontSize: 13, color: "#555" }}>
          <li>When the carton artwork has a specific up direction that cannot be flipped</li>
          <li>When the carton has no tuck flap — a plain rectangular carton with flat top and bottom gets zero nesting benefit from tumble</li>
          <li>When your press operator confirms tumble is not suitable for the job</li>
        </ul>
      </div>
    ),

    export: (
      <div>
        <h2 style={{ color: "#1a4a7a", marginTop: 0 }}>Exporting Files</h2>
        <p>Mono can export the layout in two formats. Both exports use real-world millimetre coordinates.</p>
        {[
          {
            format: "SVG Export",
            color: "#27ae60",
            icon: "🎨",
            desc: "Scalable Vector Graphics — an open standard format that can be opened in Adobe Illustrator, Esko PackEdge, Inkscape, and most design tools.",
            use: "Share with your designer to overlay artwork on the layout. Import into Esko for prepress work.",
            contains: "Sheet boundary, margin border, usable area boundary, and all carton rectangles at correct positions and sizes in mm.",
            button: "Export SVG — for Illustrator / Esko"
          },
          {
            format: "DXF Export",
            color: "#1a4a7a",
            icon: "📐",
            desc: "Drawing Exchange Format — the standard CAD interchange format supported by ArtiosCAD, AutoCAD, and most CAD packaging tools.",
            use: "Import into ArtiosCAD to create a proper dieline imposition. Use in AutoCAD for die cutting tool planning.",
            contains: "Sheet boundary and all carton outlines as LWPOLYLINE entities with precise mm coordinates.",
            button: "Export DXF — for ArtiosCAD / AutoCAD"
          },
        ].map(({ format, color, icon, desc, use, contains, button }) => (
          <div key={format} style={{ background: "white", borderLeft: `4px solid ${color}`, borderRadius: 10, padding: 16, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: "800", fontSize: 15, color, marginBottom: 8 }}>{icon} {format}</div>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: "0 0 10px" }}>{desc}</p>
            <div style={{ fontSize: 12, marginBottom: 6 }}><strong>Use when:</strong> {use}</div>
            <div style={{ fontSize: 12, marginBottom: 10, color: "#888" }}><strong>File contains:</strong> {contains}</div>
            <div style={{ background: `${color}15`, borderRadius: 6, padding: "6px 12px", fontSize: 12, color, fontWeight: "600", display: "inline-block" }}>
              Button: "{button}"
            </div>
          </div>
        ))}
        <div style={{ background: "#fff8e1", border: "1px solid #f9a825", borderRadius: 8, padding: 14, fontSize: 13, color: "#555" }}>
          ⚠️ <strong>Important:</strong> Always verify the exported layout against your actual dieline file before sending to press. Mono calculates flat sizes using standard industry ratios — your actual carton may have slightly different flap dimensions.
        </div>
      </div>
    ),

    jobs: (
      <div>
        <h2 style={{ color: "#1a4a7a", marginTop: 0 }}>Job Management</h2>
        <p>The Jobs page allows you to add multiple carton jobs from different clients. Each job carries its own specifications — dimensions, paper type, GSM, lamination, and more. Compatible jobs can then be imposed together on a single sheet to maximise efficiency.</p>

        <h3 style={{ color: "#1a4a7a" }}>How to Add a Job</h3>
        {[
          { step: "1", title: "Select Box Style", color: "#1565c0", content: "Choose the structural style of the carton — Bottom Side Lock, Straight Tuck End, Reverse Tuck End, or Lock Bottom." },
          { step: "2", title: "Enter Dimensions", color: "#6a1b9a", content: "Enter Length, Width and Height in millimetres. These are the 3D dimensions of the finished folded box." },
          { step: "3", title: "Enter Quantity", color: "#27ae60", content: "Enter the total number of units required. This is used to calculate impressions needed and overrun percentage." },
          { step: "4", title: "Set Print Specifications", color: "#e67e22", content: "Select Paper Type, GSM, Lamination, Colours and Stamping. These are used by the compatibility checker to determine which jobs can be combined." },
          { step: "5", title: "Click Add Job", color: "#c0392b", content: "The backend automatically calculates the flat dieline size. The job appears in the list on the right." },
        ].map(({ step, title, color, content }) => (
          <div key={step} style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: 13, flexShrink: 0 }}>
              {step}
            </div>
            <div>
              <div style={{ fontWeight: "700", color, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{content}</div>
            </div>
          </div>
        ))}

        <h3 style={{ color: "#1a4a7a" }}>Print Specifications Explained</h3>
        {[
          { label: "Paper Type", color: "#1565c0", desc: "The board substrate. FBB (Folding Box Board) is most common for pharmaceutical cartons. Jobs must share the same paper type to be combined." },
          { label: "GSM", color: "#6a1b9a", desc: "Grams per Square Metre — the weight of the board. Jobs within ±10 GSM of each other can be combined (configurable in the Planner)." },
          { label: "Lamination", color: "#27ae60", desc: "The surface finish applied after printing. Gloss, Matt, Soft Touch, UV Varnish, or None. Jobs must share the same lamination to be combined." },
          { label: "Colours", color: "#e67e22", desc: "The colour specification — CMYK only, or CMYK with Pantone inks. A soft warning is shown if combined jobs have different colour specs." },
          { label: "Stamping", color: "#c0392b", desc: "Special finishing such as Hot Foil Stamping or Embossing. A soft warning is shown if combined jobs have different stamping requirements." },
        ].map(({ label, color, desc }) => (
          <div key={label} style={{ borderLeft: `3px solid ${color}`, paddingLeft: 12, marginBottom: 12 }}>
            <div style={{ fontWeight: "700", color, fontSize: 13 }}>{label}</div>
            <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5, marginTop: 2 }}>{desc}</div>
          </div>
        ))}

        <h3 style={{ color: "#1a4a7a" }}>Managing Jobs</h3>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
          Each job in the list shows its dimensions, flat size, quantity, paper type, GSM and lamination at a glance.
          Use the <strong>Edit</strong> button to modify a job and <strong>Remove</strong> to delete it.
          Once you have at least 2 jobs, the <strong>Plan Imposition</strong> button appears to take you to the Planner.
        </p>
      </div>
    ),

    planner: (
      <div>
        <h2 style={{ color: "#1a4a7a", marginTop: 0 }}>Imposition Planner</h2>
        <p>The Planner is where multiple jobs come together on a single sheet. It has three steps — Compatibility Check, Impression Alignment Analysis, and Multi-SKU Layout.</p>

        <h3 style={{ color: "#1a4a7a" }}>Step 1 — Check Compatibility</h3>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
          Click <strong>Check Compatibility</strong> to verify which jobs can be combined on the same sheet.
          The checker applies three hard constraints:
        </p>
        <div style={{ background: "#fdecea", border: "1px solid #e74c3c", borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: "700", color: "#e74c3c", marginBottom: 6, fontSize: 13 }}>🚫 Hard Constraints — must match to combine</div>
          {[
            "Paper Type — must be identical",
            "GSM — must be within tolerance (default ±10 GSM)",
            "Lamination — must be identical",
          ].map(c => <div key={c} style={{ fontSize: 12, color: "#555", padding: "2px 0" }}>• {c}</div>)}
        </div>
        <div style={{ background: "#fff8e1", border: "1px solid #f9a825", borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <div style={{ fontWeight: "700", color: "#f39c12", marginBottom: 6, fontSize: 13 }}>⚠️ Soft Warnings — will warn but not block</div>
          {[
            "Colours — different Pantone counts",
            "Stamping — different finishing requirements",
          ].map(c => <div key={c} style={{ fontSize: 12, color: "#555", padding: "2px 0" }}>• {c}</div>)}
        </div>

        <h3 style={{ color: "#1a4a7a" }}>Step 2 — Impression Alignment</h3>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
          This is the most important step for colour consistency. In offset printing, every press run produces a slightly different colour result. If two jobs finish at different impressions, the second job will have a colour variation.
        </p>
        <div style={{ background: "#e8f0f7", borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: "700", color: "#1a4a7a", marginBottom: 6, fontSize: 13 }}>How Alignment Score Works</div>
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
            Mono calculates how many cartons of each job fit on the sheet and finds the combination where all jobs complete in the same number of impressions. A score of <strong>100%</strong> means perfect alignment — all jobs finish together in one press run, guaranteeing colour consistency.
          </div>
        </div>
        <div style={{ fontFamily: "monospace", background: "#f8f9fa", borderRadius: 8, padding: 12, fontSize: 12, lineHeight: 2, marginBottom: 16 }}>
          <div>Example — 5000 units each, 700×1000mm sheet:</div>
          <div>Job A: 6 cartons/sheet → 834 impressions</div>
          <div>Job B: 3 cartons/sheet → 1667 impressions ← misaligned ❌</div>
          <div style={{ marginTop: 8 }}>Better layout:</div>
          <div>Job A: 5 cartons/sheet → 1000 impressions</div>
          <div>Job B: 3 cartons/sheet → 1000 impressions ← aligned ✅</div>
        </div>

        <h3 style={{ color: "#1a4a7a" }}>Step 3 — Multi-SKU Layout</h3>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
          Click <strong>Run Multi-SKU Layout</strong> to generate the full imposition. The canvas shows all jobs colour-coded — each job has its own colour so you can immediately see how the sheet is divided. The per-job summary table shows cartons per sheet, impressions needed, actual printed quantity, and overrun percentage for each job.
        </p>

        <h3 style={{ color: "#1a4a7a" }}>Overrun</h3>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
          Overrun is the difference between the quantity required and the actual quantity printed. Since you always print in complete impressions, some overrun is inevitable. The default tolerance is 5% — jobs exceeding this show a warning. Overrun means extra units that become waste or stock.
        </p>
        <div style={{ fontFamily: "monospace", background: "#f8f9fa", borderRadius: 8, padding: 12, fontSize: 12, lineHeight: 2 }}>
          <div>Quantity required: 5000</div>
          <div>Cartons per sheet: 6</div>
          <div>Impressions: ceil(5000/6) = 834</div>
          <div>Actual printed: 834 × 6 = 5004</div>
          <div>Overrun: (5004-5000)/5000 = 0.08% ← acceptable ✅</div>
        </div>
      </div>
    ),

    pdfextract: (
      <div>
        <h2 style={{ color: "#1a4a7a", marginTop: 0 }}>PDF Extraction</h2>
        <p>Mono can automatically extract carton dimensions from PDF artwork files. This saves time when working with standard artwork files from clients or print houses.</p>

        <h3 style={{ color: "#1a4a7a" }}>How to Use</h3>
        {[
          { step: "1", title: "Open Layout or Jobs page", color: "#1565c0", content: "The PDF extraction tool is available in the Carton Specification panel on the Layout page, and in the Add Job form on the Jobs page." },
          { step: "2", title: "Upload PDF", color: "#6a1b9a", content: "Drag and drop a PDF artwork file or click to browse. Supports standard pharmaceutical artwork formats including Makin Laboratories artwork files." },
          { step: "3", title: "Click Extract", color: "#27ae60", content: "Mono sends the PDF to the backend which tries multiple extraction methods to find the carton dimensions." },
          { step: "4", title: "Review result", color: "#e67e22", content: "If dimensions are found, they are shown with a confidence rating. Review the extracted text to verify accuracy." },
          { step: "5", title: "Click Use These Dimensions", color: "#c0392b", content: "The extracted dimensions are automatically populated into the carton specification form. You can then adjust any values if needed." },
        ].map(({ step, title, color, content }) => (
          <div key={step} style={{ display: "flex", gap: 16, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: 13, flexShrink: 0 }}>
              {step}
            </div>
            <div>
              <div style={{ fontWeight: "700", color, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{content}</div>
            </div>
          </div>
        ))}

        <h3 style={{ color: "#1a4a7a" }}>Extraction Methods</h3>
        {[
          { label: "📝 Text Extraction", color: "#27ae60", desc: "For PDFs with selectable text. Fast and accurate. Uses pdfplumber and pymupdf to extract text from the PDF directly." },
          { label: "🔍 OCR", color: "#f39c12", desc: "For image-based PDFs where the content is embedded as an image. Slower but handles scanned and image-only artwork files. Always verify OCR results before using." },
        ].map(({ label, color, desc }) => (
          <div key={label} style={{ background: "white", borderLeft: `3px solid ${color}`, borderRadius: 8, padding: 12, marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: "700", color, fontSize: 13, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}

        <h3 style={{ color: "#1a4a7a" }}>Confidence Levels</h3>
        {[
          { label: "High", color: "#27ae60", desc: "Dimension pattern found in a labelled field like Dimension/Foil Width or Outer Size. Very reliable." },
          { label: "Medium", color: "#f39c12", desc: "Dimension pattern found but in a less specific context. Verify before using." },
          { label: "Low", color: "#e74c3c", desc: "Pattern found but uncertain. Always verify manually." },
        ].map(({ label, color, desc }) => (
          <div key={label} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
            <div style={{ background: color, color: "white", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: "700", flexShrink: 0 }}>{label}</div>
            <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}

        <h3 style={{ color: "#1a4a7a" }}>Supported Formats</h3>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
          The extractor looks for these dimension formats in artwork files:
        </p>
        <div style={{ fontFamily: "monospace", background: "#f8f9fa", borderRadius: 8, padding: 12, fontSize: 12, lineHeight: 2 }}>
          <div>L 45 x W 45 x H 83 mm</div>
          <div>L- 45 x W- 45 x H- 83</div>
          <div>45 (L) x 45 (W) x 83 (H) mm</div>
          <div>Outer Size : 45 (L) x 45 (W) x 83 (H) mm</div>
          <div>Dimension/Foil Width L 45 x W 45 x H 83</div>
          <div>45 x 45 x 83 mm</div>
        </div>

        <div style={{ background: "#fff8e1", border: "1px solid #f9a825", borderRadius: 8, padding: 12, marginTop: 16, fontSize: 13, color: "#555" }}>
          ⚠️ <strong>Always verify extracted dimensions</strong> against your actual artwork before using for production planning. Mono's extraction is a time-saving tool — not a replacement for manual verification.
        </div>
      </div>
    ),

    glossary: (
      <div>
        <h2 style={{ color: "#1a4a7a", marginTop: 0 }}>Glossary</h2>
        <p>Key terms used in Mono and in carton packaging:</p>
        {[
          { term: "Imposition", def: "The arrangement of cartons on a print sheet to maximise the number of cartons per sheet and minimise waste." },
          { term: "Flat Size", def: "The dimensions of the carton when completely unfolded flat. This is what gets printed on the sheet." },
          { term: "Dieline", def: "The cut and crease pattern of a flat carton. Shows all panels, flaps, and fold lines." },
          { term: "Tuck Flap", def: "A flap at the top or bottom of a carton that tucks inside the box to close it. The depth of the tuck flap is the key factor in nesting saving." },
          { term: "Nesting", def: "The arrangement of cartons so that the protruding parts of one carton fit into the recessed parts of an adjacent carton, reducing the space between them." },
          { term: "Nesting Saving", def: "The amount of space saved per row pair in a tumble layout due to nesting. Expressed in mm and as a percentage of flat height." },
          { term: "Tumble Layout", def: "A layout where alternate rows are flipped 180° to enable nesting between rows. Typically gives 15-25% more cartons than straight layout." },
          { term: "Straight Layout", def: "A layout where all cartons face the same direction. Simple but no nesting benefit." },
          { term: "Sheet Utilization", def: "The percentage of the usable sheet area covered by cartons. Higher is better." },
          { term: "Gripper Margin", def: "The area at the edge of a sheet that the press grips to feed the paper. This area cannot be printed. Included in the border margin setting in Mono." },
          { term: "GSM", def: "Grams per Square Metre — the weight/thickness of the board. Common values in pharma packaging: 300-350 GSM." },
          { term: "FBB", def: "Folding Box Board — the most common board type for pharmaceutical cartons." },
          { term: "Bottom Side Lock", def: "A carton style with a tuck top and interlocking bottom panels. Most common in pharma packaging." },
          { term: "Reverse Tuck End", def: "A carton style where the top and bottom tuck flaps face opposite directions. Good nesting properties in tumble layout." },
          { term: "DXF", def: "Drawing Exchange Format — a CAD file format used by ArtiosCAD, AutoCAD, and other design tools for carton dielines." },
          { term: "SVG", def: "Scalable Vector Graphics — an open format for vector artwork, supported by Illustrator, Esko, and most design tools." },
          { term: "Pair Height", def: "In tumble layout, the vertical space taken up by one ▲▼ pair of rows. Equal to 2 × Flat Height minus the nesting saving." },
          { term: "Gang Printing", def: "Imposing multiple different jobs on a single sheet to maximise sheet utilisation and reduce cost per unit." },
          { term: "Impression Alignment", def: "Arranging carton counts per job so that all jobs complete in the same number of press impressions — guaranteeing colour consistency across all jobs." },
          { term: "Overrun", def: "The extra units printed beyond the required quantity due to rounding up to complete impressions. Typically 0-5% is acceptable." },
          { term: "Compatibility", def: "Whether two or more jobs can be combined on the same sheet — determined by matching paper type, GSM tolerance, and lamination." },
          { term: "Multi-SKU Layout", def: "An imposition layout containing multiple different carton designs (SKUs) on a single sheet." },
          { term: "OCR", def: "Optical Character Recognition — technology that reads text from images. Used by Mono to extract dimensions from image-based PDF artwork files." },
        ].map(({ term, def }) => (
          <div key={term} style={{ borderBottom: "1px solid #f0f0f0", padding: "10px 0" }}>
            <div style={{ fontWeight: "700", color: "#1a4a7a", fontSize: 13 }}>{term}</div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginTop: 2 }}>{def}</div>
          </div>
        ))}
      </div>
    ),
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999 }}
      />

      {/* Sidebar */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 680, background: "white", zIndex: 1000,
        display: "flex", flexDirection: "column",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease",
      }}>

        {/* Sidebar Header */}
        <div style={{ background: "#1a4a7a", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "white", fontWeight: "900", fontSize: 18 }}>📖 Mono User Guide</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>Everything you need to know about using Mono</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
            ✕
          </button>
        </div>

        {/* Sidebar Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Section Nav */}
          <div style={{ width: 200, background: "#f8f9fa", borderRight: "1px solid #eee", overflowY: "auto", padding: "12px 0" }}>
            {sections.map(({ id, label }) => (
              <button key={id} onClick={() => setActiveSection(id)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "10px 16px", border: "none", cursor: "pointer",
                background: activeSection === id ? "#e8f0f7" : "transparent",
                color: activeSection === id ? "#1a4a7a" : "#555",
                fontWeight: activeSection === id ? "700" : "400",
                fontSize: 13, borderLeft: activeSection === id ? "3px solid #1a4a7a" : "3px solid transparent",
                lineHeight: 1.4,
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: 24, fontSize: 14, lineHeight: 1.7, color: "#333" }}>
            {content[activeSection]}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserGuide;