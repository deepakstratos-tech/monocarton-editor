import { useState, useCallback } from "react";
import { API_BASE, ALGORITHMS } from "../config/api";

const useLayout = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparison, setComparison] = useState(null);

  const fetchLayout = useCallback(async (algorithm, params) => {
    setLoading(true);
    setError(null);
    try {
      const selected = ALGORITHMS.find(a => a.id === algorithm);
      const response = await fetch(`${API_BASE}${selected.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error("Backend error");
      const data = await response.json();
      setStats(data);
      return data;
    } catch (err) {
      setError("Could not connect to backend.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompare = useCallback(async (params) => {
    try {
      const response = await fetch(`${API_BASE}/layout/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      setComparison(data);
    } catch (err) {
      setError("Could not fetch comparison.");
    }
  }, []);

  return { stats, loading, error, comparison, setComparison, fetchLayout, fetchCompare };
};

export default useLayout;