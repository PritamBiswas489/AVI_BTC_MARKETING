import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import { FilterProvider } from "../context/FilterContext";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <FilterProvider>
        <Component {...pageProps} />
      </FilterProvider>
    </AuthProvider>
  );
}
