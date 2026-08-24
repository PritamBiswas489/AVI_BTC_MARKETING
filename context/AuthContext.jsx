import { createContext, useContext, useEffect, useState } from "react";
import {
  AUTH_STORAGE_KEY,
  clearAuthCookie,
  hasAuthCookie,
  isValidCredential,
  setAuthCookie,
} from "../lib/auth";

const AuthContext = createContext({
  loggedIn: false,
  ready: false,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  // Restore session on first load so a page refresh on a dashboard route doesn't kick the user out.
  useEffect(() => {
    const stored = typeof window !== "undefined" && window.localStorage.getItem(AUTH_STORAGE_KEY);
    const authenticated = stored === "true" || hasAuthCookie();
    setLoggedIn(authenticated);
    if (authenticated && typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
      setAuthCookie();
    }
    setReady(true);
  }, []);

  const login = (username, password) => {
    if (!isValidCredential(username, password)) {
      return false;
    }
    setLoggedIn(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
      setAuthCookie();
    }
    return true;
  };

  const logout = () => {
    setLoggedIn(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      clearAuthCookie();
    }
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
