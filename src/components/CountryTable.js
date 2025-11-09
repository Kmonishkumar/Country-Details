import React, { useMemo, useState } from "react";

// Get cell value or render for table
const getCellValue = (country, key) => {
  try {
    if (key === "name") return country.name?.common ?? "";
    if (key === "capital") return (country.capital || []).join(", ");
    if (key === "currencies") {
      return Object.entries(country.currencies || {})
        .map(([code, obj]) => `${code}${obj?.symbol ? ` (${obj.symbol})` : ""}`)
        .join(", ");
    }
    if (key === "flag") {
      const flagUrl = country.flags?.png || country.flags?.svg;
      if (!flagUrl) return "";
      return (
        <img
          src={flagUrl}
          alt={country.name?.common}
          style={{ width: 40, height: 25, objectFit: "cover", borderRadius: 2 }}
        />
      );
    }
    if (key === "languages") return Object.values(country.languages || {}).join(", ");
    if (key === "continents") return (country.continents || []).join(", ");
    if (key === "timezones") return (country.timezones || []).join(", ");
    const val = country[key];
    if (val === undefined) return "";
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  } catch (e) {
    return "";
  }
};

const CountryTable = ({ countries = [], columns = [], rowsPerPage = 10 }) => {
  const [filterName, setFilterName] = useState("");
  const [filterCurrency, setFilterCurrency] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [page, setPage] = useState(1);

  // Filter countries
  const filtered = useMemo(() => {
    return countries.filter((c) => {
      const name = (c.name?.common || "").toLowerCase();
      const currs = Object.keys(c.currencies || {}).join(",").toLowerCase();
      if (filterName && !name.includes(filterName.toLowerCase())) return false;
      if (filterCurrency && !currs.includes(filterCurrency.toLowerCase())) return false;
      return true;
    });
  }, [countries, filterName, filterCurrency]);

  // Sort countries
  const sorted = useMemo(() => {
    if (!sortConfig.key) return filtered;
    const key = sortConfig.key;
    const direction = sortConfig.direction;
    return [...filtered].sort((a, b) => {
      const aVal = getCellValue(a, key);
      const bVal = getCellValue(b, key);

      // If the value is React element (like flag image), skip numeric comparison
      if (React.isValidElement(aVal) || React.isValidElement(bVal)) return 0;

      const numA = parseFloat(aVal);
      const numB = parseFloat(bVal);
      const isNumeric = !isNaN(numA) && !isNaN(numB);

      if (isNumeric) {
        return direction === "asc" ? numA - numB : numB - numA;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return direction === "asc" ? -1 : 1;
      if (aStr > bStr) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const actualPage = Math.min(page, totalPages);
  const paginated = sorted.slice((actualPage - 1) * rowsPerPage, actualPage * rowsPerPage);

  // Handle sorting click
  const handleSort = (key) => {
    setPage(1);
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  return (
    <div className="table-wrap">
      <div className="filters" style={{ marginBottom: 12 }}>
        <input
          placeholder="Filter by name"
          value={filterName}
          onChange={(e) => {
            setFilterName(e.target.value);
            setPage(1);
          }}
        />
        <input
          placeholder="Filter by currency"
          value={filterCurrency}
          onChange={(e) => {
            setFilterCurrency(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={sortConfig.key === col.key ? "sorted-column" : ""}
                >
                  {col.label}{" "}
                  {sortConfig.key === col.key
                    ? sortConfig.direction === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginated.map((c, idx) => (
              <tr key={c.cca3 ?? idx}>
                {columns.map((col) => (
                  <td key={col.key + (c.cca3 ?? idx)}>{getCellValue(c, col.key)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={actualPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Prev
        </button>
        <span>
          Page {actualPage} of {totalPages}
        </span>
        <button
          disabled={actualPage === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CountryTable;
