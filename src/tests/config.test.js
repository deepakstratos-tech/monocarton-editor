import {
  ALGORITHMS, BOX_STYLES, PAPER_TYPES,
  LAMINATION_TYPES, COLOUR_TYPES, STAMPING_TYPES,
  BRAND, SCALE, API_BASE
} from "../config/api";

// ══════════════════════════════════════════════════
// CONFIG / API CONSTANTS
// ══════════════════════════════════════════════════

describe("config/api.js", () => {

  test("API_BASE is defined and not empty", () => {
    expect(API_BASE).toBeDefined();
    expect(API_BASE.length).toBeGreaterThan(0);
  });

  test("BRAND color is a valid hex", () => {
    expect(BRAND).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test("SCALE is a positive number", () => {
    expect(SCALE).toBeGreaterThan(0);
  });

  test("ALGORITHMS has 6 entries", () => {
    expect(ALGORITHMS).toHaveLength(6);
  });

  test("each algorithm has required fields", () => {
    ALGORITHMS.forEach(algo => {
      expect(algo).toHaveProperty("id");
      expect(algo).toHaveProperty("label");
      expect(algo).toHaveProperty("endpoint");
      expect(algo).toHaveProperty("color");
      expect(algo.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  test("algorithm endpoints start with /layout/", () => {
    ALGORITHMS.forEach(algo => {
      expect(algo.endpoint).toMatch(/^\/layout\//);
    });
  });

  test("BOX_STYLES has 4 entries", () => {
    expect(BOX_STYLES).toHaveLength(4);
  });

  test("each box style has id and label", () => {
    BOX_STYLES.forEach(style => {
      expect(style).toHaveProperty("id");
      expect(style).toHaveProperty("label");
    });
  });

  test("bottom_side_lock is in BOX_STYLES", () => {
    const ids = BOX_STYLES.map(s => s.id);
    expect(ids).toContain("bottom_side_lock");
  });

  test("PAPER_TYPES has entries", () => {
    expect(PAPER_TYPES.length).toBeGreaterThan(0);
  });

  test("FBB is in PAPER_TYPES", () => {
    const ids = PAPER_TYPES.map(p => p.id);
    expect(ids).toContain("FBB");
  });

  test("LAMINATION_TYPES includes NONE and UV", () => {
    const ids = LAMINATION_TYPES.map(l => l.id);
    expect(ids).toContain("NONE");
    expect(ids).toContain("UV");
  });

  test("COLOUR_TYPES includes CMYK", () => {
    const ids = COLOUR_TYPES.map(c => c.id);
    expect(ids).toContain("CMYK");
  });

  test("STAMPING_TYPES includes NONE", () => {
    const ids = STAMPING_TYPES.map(s => s.id);
    expect(ids).toContain("NONE");
  });
});
