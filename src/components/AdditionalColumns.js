import React, { useEffect, useState } from "react";
import { parseFieldsFromMarkdown } from "../ParseFields";

const FIELDS_RAW_URL =
  "https://gitlab.com/restcountries/restcountries/-/raw/master/FIELDS.md";

const AdditionalColumns = ({ baseColumnsKeys = [], extraColumns, onAddExtraColumn, onError }) => {
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState("");
  const [loadingFields, setLoadingFields] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchFields = async () => {
      setLoadingFields(true);
      try {
        const res = await fetch(FIELDS_RAW_URL);
        const text = await res.text();
        const parsed = parseFieldsFromMarkdown(text);

        const filtered = parsed.filter(
          (f) => !baseColumnsKeys.includes(f) && !extraColumns.includes(f)
        );

        if (mounted) setAvailable(filtered);
      } catch (err) {
        console.warn("Could not fetch fields.md, using fallback fields", err);
        const fallback = [
          "population",
          "area",
          "tld",
          "borders",
          "subregion",
          "startOfWeek",
          "independent",
          "fifa",
          "coatOfArms",
          "maps",
        ].filter((f) => !baseColumnsKeys.includes(f) && !extraColumns.includes(f));
        if (mounted) setAvailable(fallback);
      } finally {
        setLoadingFields(false);
      }
    };

    fetchFields();
    return () => (mounted = false);
  }, [baseColumnsKeys, extraColumns]);

  const handleShow = () => {
    if (!selected) return;
    const ok = onAddExtraColumn(selected);
    if (ok) {
      setAvailable((prev) => prev.filter((p) => p !== selected));
      setSelected("");
    }
  };

  return (
    <div className="dropdown-container">
      <label style={{ marginRight: 8 }}>Additional Columns:</label>
      {loadingFields ? (
        <span>Loading fields...</span>
      ) : (
        <>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Select field</option>
            {available.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <button style={{ marginLeft: 8 }} onClick={handleShow}>
            Show
          </button>
        </>
      )}
    </div>
  );
};

export default AdditionalColumns;
