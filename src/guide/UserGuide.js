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