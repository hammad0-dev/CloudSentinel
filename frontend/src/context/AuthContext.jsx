import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("cloudsentinel_token");
      if (!token) return setLoading(false);
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("cloudsentinel_token");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: ({ user: nextUser, token }) => {
        localStorage.setItem("cloudsentinel_token", token);
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem("cloudsentinel_token");
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
