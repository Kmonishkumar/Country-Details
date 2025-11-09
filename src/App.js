// src/App.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import CountryTable from "./components/CountryTable";
import AdditionalColumns from "./components/AdditionalColumns";
import "./App.css";

const App = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [extraColumns, setExtraColumns] = useState([]);

  // Base columns
  const baseColumns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "capital", label: "Capital" },
      { key: "currencies", label: "Currencies" },
      { key: "flag", label: "Flag" }, // Will render as image
      { key: "languages", label: "Languages" },
      { key: "continents", label: "Continents" },
      { key: "region", label: "Region" },
      { key: "timezones", label: "Timezones" },
    ],
    []
  );

  // Combine base + extra columns
  const allColumns = useMemo(
    () => [...baseColumns, ...extraColumns.map((f) => ({ key: f, label: f }))],
    [baseColumns, extraColumns]
  );

  // Build API endpoint for selected fields (useCallback)
  const buildEndpoint = useCallback((fields) => {
    const fieldNames = fields.join(",");
    return `https://restcountries.com/v3.1/all?fields=${fieldNames},flags,cca3`;
  }, []);

  // Fetch countries data (useCallback)
  const fetchCountries = useCallback(
    async (fields) => {
      setLoading(true);
      try {
        const endpoint = buildEndpoint(fields);
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setCountries(data);
        setErrorMsg("");
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to fetch country data.");
      } finally {
        setLoading(false);
      }
    },
    [buildEndpoint] // stable dependency
  );

  // Initial fetch
  useEffect(() => {
    const baseKeys = baseColumns.map((c) => c.key);
    fetchCountries(baseKeys);
  }, [baseColumns, fetchCountries]);

  // Handle adding extra columns
  const handleAddExtraColumn = useCallback(
    (field) => {
      const currentCount = baseColumns.length + extraColumns.length;
      if (currentCount >= 10) {
        setErrorMsg("Maximum number of columns reached");
        return false;
      }
      if (extraColumns.includes(field)) return false;

      const updated = [...extraColumns, field];
      setExtraColumns(updated);
      const newFields = [...baseColumns.map((c) => c.key), ...updated];
      fetchCountries(newFields);
      return true;
    },
    [baseColumns, extraColumns, fetchCountries]
  );

  return (
    <div className="app">
      <header>
        <h1>Country Details Display</h1>
      </header>

      <main className="container">
        {errorMsg && <div className="error">{errorMsg}</div>}

        <AdditionalColumns
          baseColumnsKeys={baseColumns.map((c) => c.key)}
          extraColumns={extraColumns}
          onAddExtraColumn={handleAddExtraColumn}
          onError={(msg) => setErrorMsg(msg)}
        />

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          countries.length > 0 && (
            <CountryTable countries={countries} columns={allColumns} rowsPerPage={10} />
          )
        )}
      </main>
    </div>
  );
};

export default App;
