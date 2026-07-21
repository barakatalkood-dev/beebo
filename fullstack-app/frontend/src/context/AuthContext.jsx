import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const REMEMBER_KEY = "remember_me";
const SESSION_MARKER_KEY = "session_active";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // تحميل بيانات المستخدم عند تشغيل التطبيق
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const remembered = localStorage.getItem(REMEMBER_KEY) === "true";
    const sessionActive = sessionStorage.getItem(SESSION_MARKER_KEY) === "1";

    if (savedToken && savedUser) {
      if (remembered || sessionActive) {
        // "Remember me" was checked, or this is the same browser session
        // (tab reloaded/navigated) — keep the user signed in.
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        sessionStorage.setItem(SESSION_MARKER_KEY, "1");
      } else {
        // "Remember me" was not checked and the browser was fully closed
        // and reopened (sessionStorage doesn't survive that) — expire it.
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem(REMEMBER_KEY);
      }
    }

    setLoading(false);
  }, []);

  // تسجيل الدخول
  const login = (userData, jwtToken, remember = true) => {
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem(REMEMBER_KEY, remember ? "true" : "false");
    sessionStorage.setItem(SESSION_MARKER_KEY, "1");

    setUser(userData);
    setToken(jwtToken);
  };

  // تسجيل الخروج
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(SESSION_MARKER_KEY);

    setUser(null);
    setToken(null);
  };

  // تحديث بيانات المستخدم المحفوظة (بعد تعديل الملف الشخصي مثلاً)
  const updateUser = (partialUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...partialUserData };
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook جاهز للاستخدام
export function useAuth() {
  return useContext(AuthContext);
}
