import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Branches from "./pages/Branches";
import Warehouse from "./pages/Warehouse";
import { useState, useEffect } from "react";

// Theme configuration
const themes = {
  light: {
    bg: "#f8fafc",
    text: "#0f172a",
    textSecondary: "#475569",
    cardBg: "#ffffff",
    border: "#e2e8f0",
    primary: "#3b82f6",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    purple: "#8b5cf6",
    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
  },
  dark: {
    bg: "#0f172a",
    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    cardBg: "#1e293b",
    border: "#334155",
    primary: "#3b82f6",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    purple: "#8b5cf6",
    shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.25)"
  }
};

export default function App() {
  const [themeMode, setThemeMode] = useState("dark");
  const token = localStorage.getItem("token");

  // Check theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setThemeMode(savedTheme);
  }, []);

  return (
    <div style={{ backgroundColor: themes[themeMode].bg, minHeight: "100vh" }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            token ? <Dashboard theme={themes[themeMode]} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/inventory" 
          element={
            token ? <Inventory theme={themes[themeMode]} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/branches" 
          element={
            token ? <Branches theme={themes[themeMode]} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/warehouses" 
          element={
            token ? <Warehouse theme={themes[themeMode]} /> : <Navigate to="/login" />
          } 
        />
      </Routes>
    </div>
  );
}