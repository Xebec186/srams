// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { authApi, registerAuthHandlers } from "../api";

const AuthContext = createContext(null);

function normalizeRole(role) {
  if (!role) return role;
  const value = String(role).toUpperCase();
  return value.startsWith("ROLE_") ? value.slice(5) : value;
}

function normalizeStoredUser(user) {
  if (!user) return null;
  return { ...user, role: normalizeRole(user.role) };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("srams_user");
      return stored ? normalizeStoredUser(JSON.parse(stored)) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    registerAuthHandlers({
      onRefresh: (token, refreshToken) => {
        setUser((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, token, refreshToken };
          return updated;
        });
      },
      onLogout: () => {
        setUser(null);
      },
    });
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await authApi.login({ username, password });
    const { token, refreshToken, role, fullName, userId, schoolId, studentId } =
      res.data;
    const userData = {
      token,
      refreshToken,
      role: normalizeRole(role),
      fullName,
      userId,
      schoolId,
      studentId,
      username,
    };
    localStorage.setItem("srams_token", token);
    localStorage.setItem("srams_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("srams_token");
    localStorage.removeItem("srams_user");
    setUser(null);
  }, []);

  const isRole = useCallback(
    (...roles) => {
      return user && roles.includes(user.role);
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, isRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
