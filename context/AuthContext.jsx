import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({
  loggedIn: false,
  ready: false,
  login: () => {},
  logout: () => {},
});

const STORAGE_KEY = "voyage_logged_in";

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  // Restore session on first load so a page refresh on a dashboard route doesn't kick the user out.
  useEffect(() => {
    const stored = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY);
    setLoggedIn(stored === "true");
    setReady(true);
  }, []);

  const login = () => {
    setLoggedIn(true);
    window.localStorage.setItem(STORAGE_KEY, "true");
  };

  const logout = () => {
    setLoggedIn(false);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
