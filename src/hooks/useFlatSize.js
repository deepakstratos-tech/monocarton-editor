import { useState, useEffect } from "react";
import { API_BASE } from "../config/api";

const useFlatSize = (boxStyle, length, width, height) => {
  const [flatSpec, setFlatSpec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!length || !width || !height) return;

    const fetchFlatSize = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/carton/flat-size`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ style: boxStyle, length, width, height }),
        });
        if (!response.ok) throw new Error("Failed to fetch flat size");
        const data = await response.json();
        setFlatSpec(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlatSize();
  }, [boxStyle, length, width, height]);

  return { flatSpec, loading, error };
};

export default useFlatSize;