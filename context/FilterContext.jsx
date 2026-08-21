import { createContext, useContext, useEffect, useState } from "react";
const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const now = new Date();
  const [dateRange, setDateRange] = useState({
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  });
//   useEffect(() => {
//     console.log("FilterProvider state changed:", { search, source, dateRange });
//   }, [search, source, dateRange]);

  return (
    <FilterContext.Provider
      value={{ search, setSearch, source, setSource, dateRange, setDateRange }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used within a FilterProvider");
  return ctx;
}
