export const API_BASE = "https://web-production-e59f.up.railway.app";

export const ALGORITHMS = [
  { id: "straight", label: "Straight", icon: "▲▲▲", desc: "All cartons same direction", endpoint: "/layout/straight", color: "#1565c0" },
  { id: "tumble", label: "Tumble", icon: "▲▼▲", desc: "Alternate rows flipped 180°", endpoint: "/layout/tumble", color: "#6a1b9a" },
  { id: "first_fit", label: "First Fit", icon: "→→→", desc: "Place in first available spot", endpoint: "/layout/first-fit", color: "#27ae60" },
  { id: "first_fit_decreasing", label: "FFD", icon: "↓→→", desc: "Largest first, then First Fit", endpoint: "/layout/first-fit-decreasing", color: "#e67e22" },
  { id: "nfdh", label: "NFDH", icon: "▬▬▬", desc: "Shelf based, tallest first", endpoint: "/layout/nfdh", color: "#c0392b" },
  { id: "best_fit", label: "Best Fit", icon: "◎◎◎", desc: "Least wasted space per shelf", endpoint: "/layout/best-fit", color: "#16a085" },
];

export const BOX_STYLES = [
  { id: "bottom_side_lock", label: "Bottom Side Lock", desc: "Most common in pharma" },
  { id: "straight_tuck_end", label: "Straight Tuck End", desc: "Both tucks same direction" },
  { id: "reverse_tuck_end", label: "Reverse Tuck End", desc: "Tucks face opposite directions" },
  { id: "lock_bottom", label: "Lock Bottom", desc: "Pre-glued auto locking base" },
];

export const BRAND = "#1a4a7a";
export const BRAND_LIGHT = "#e8f0f7";
export const STRAIGHT_COLOR = "#4F86C6";
export const TUMBLE_FLIPPED = "#e67e22";
export const SCALE = 0.5; // 1mm = 0.5px