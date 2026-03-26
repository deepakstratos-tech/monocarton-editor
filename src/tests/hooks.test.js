import { renderHook, waitFor, act } from "@testing-library/react";
import useFlatSize from "../hooks/useFlatSize";
import useLayout from "../hooks/useLayout";

global.fetch = jest.fn();

const mockFlatSpec = {
  flat_w: 190, flat_h: 157.7,
  top_tuck_depth: 33.2, bottom_tuck_depth: 41.5,
  glue_flap: 10, nesting_saving_pct: 21.05,
};

const mockLayoutData = {
  layout_type: "straight",
  total_cartons: 18,
  cartons_per_row: 3,
  num_rows: 6,
  utilization: 80.93,
  cartons: [],
  flat_w: 190, flat_h: 157.7,
  nesting_saving_mm: 33.2,
  nesting_saving_pct: 21.05,
  algorithm_notes: "Simple row by row.",
};

beforeEach(() => {
  fetch.mockClear();
});

// ══════════════════════════════════════════════════
// useFlatSize
// ══════════════════════════════════════════════════

describe("useFlatSize", () => {

  test("returns null flatSpec initially", () => {
    const { result } = renderHook(() =>
      useFlatSize("bottom_side_lock", 45, 45, 83)
    );
    expect(result.current.flatSpec).toBeNull();
  });

  test("fetches flat size from backend", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFlatSpec,
    });

    const { result } = renderHook(() =>
      useFlatSize("bottom_side_lock", 45, 45, 83)
    );

    await waitFor(() => {
      expect(result.current.flatSpec).not.toBeNull();
    });

    expect(result.current.flatSpec.flat_w).toBe(190);
    expect(result.current.flatSpec.flat_h).toBe(157.7);
  });

  test("calls /carton/flat-size endpoint", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFlatSpec,
    });

    renderHook(() => useFlatSize("bottom_side_lock", 45, 45, 83));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/carton/flat-size"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  test("does not fetch when dimensions are zero", () => {
    renderHook(() => useFlatSize("bottom_side_lock", 0, 0, 0));
    expect(fetch).not.toHaveBeenCalled();
  });

  test("sets error on failed fetch", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() =>
      useFlatSize("bottom_side_lock", 45, 45, 83)
    );

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
  });

  test("sets loading during fetch", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFlatSpec,
    });

    const { result } = renderHook(() =>
      useFlatSize("bottom_side_lock", 45, 45, 83)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});

// ══════════════════════════════════════════════════
// useLayout
// ══════════════════════════════════════════════════

describe("useLayout", () => {

  const layoutParams = {
    style: "bottom_side_lock",
    length: 45, width: 45, height: 83,
    sheet_w: 700, sheet_h: 1000, margin: 10,
  };

  test("returns empty stats initially", () => {
    const { result } = renderHook(() => useLayout());
    expect(result.current.stats).toEqual({});
  });

  test("returns null comparison initially", () => {
    const { result } = renderHook(() => useLayout());
    expect(result.current.comparison).toBeNull();
  });

  test("fetchLayout calls correct endpoint", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockLayoutData,
    });

    const { result } = renderHook(() => useLayout());

    await act(async () => {
      await result.current.fetchLayout("straight", layoutParams);
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/layout/straight"),
      expect.objectContaining({ method: "POST" })
    );
  });

  test("fetchLayout updates stats", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockLayoutData,
    });

    const { result } = renderHook(() => useLayout());

    await act(async () => {
      await result.current.fetchLayout("straight", layoutParams);
    });

    expect(result.current.stats.total_cartons).toBe(18);
  });

  test("fetchLayout sets error on failure", async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    const { result } = renderHook(() => useLayout());

    await act(async () => {
      await result.current.fetchLayout("straight", layoutParams);
    });

    expect(result.current.error).not.toBeNull();
  });

  test("fetchCompare calls /layout/compare", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        best_algorithm: "tumble",
        best_total: 21,
        comparison: [],
      }),
    });

    const { result } = renderHook(() => useLayout());

    await act(async () => {
      await result.current.fetchCompare(layoutParams);
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/layout/compare"),
      expect.objectContaining({ method: "POST" })
    );
  });

  test("fetchCompare updates comparison state", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        best_algorithm: "tumble",
        best_total: 21,
        comparison: [],
      }),
    });

    const { result } = renderHook(() => useLayout());

    await act(async () => {
      await result.current.fetchCompare(layoutParams);
    });

    expect(result.current.comparison).not.toBeNull();
    expect(result.current.comparison.best_algorithm).toBe("tumble");
  });

  test("setComparison clears comparison", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ best_algorithm: "tumble", best_total: 21, comparison: [] }),
    });

    const { result } = renderHook(() => useLayout());

    await act(async () => {
      await result.current.fetchCompare(layoutParams);
    });

    act(() => {
      result.current.setComparison(null);
    });

    expect(result.current.comparison).toBeNull();
  });
});
