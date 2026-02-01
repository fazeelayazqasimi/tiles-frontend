import { useState, useEffect } from "react";
import axios from "axios";

export default function Warehouse({ theme }) {
  // If theme is not provided, use default dark theme
  const defaultTheme = {
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
  };

  const activeTheme = theme || defaultTheme;

  const [name, setName] = useState("");
  const [branchId, setBranchId] = useState("");
  const [capacity, setCapacity] = useState("");
  const [manager, setManager] = useState("");
  const [address, setAddress] = useState("");
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("all");
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("Warehouse Component Mounted");
    console.log("Token:", token);
    console.log("Theme:", activeTheme);
    
    if (token) {
      fetchBranches();
      fetchWarehouses();
    } else {
      console.error("No token found!");
    }
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://tiles-backend-ten.vercel.app/api/branches", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Branches fetched:", res.data);
      setBranches(res.data);
    } catch (err) {
      console.error("Error fetching branches:", err);
      showNotification("Failed to load branches", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://tiles-backend-ten.vercel.app/api/warehouses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Warehouses fetched:", res.data);
      setWarehouses(res.data);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      showNotification("Failed to load warehouses", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveWarehouse = async () => {
    if (!name.trim()) {
      showNotification("Please enter warehouse name", "warning");
      return;
    }
    if (!branchId) {
      showNotification("Please select a branch", "warning");
      return;
    }

    try {
      setLoading(true);
      const warehouseData = { 
        name, 
        branchId, 
        capacity: capacity || undefined,
        manager: manager || undefined,
        address: address || undefined,
        status: "active"
      };

      console.log("Saving warehouse:", warehouseData);

      if (editingId) {
        // Update existing warehouse
        await axios.put(
          `https://tiles-backend-ten.vercel.app/api/warehouses/${editingId}`,
          warehouseData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification("Warehouse updated successfully!", "success");
      } else {
        // Create new warehouse
        await axios.post(
          "https://tiles-backend-ten.vercel.app/api/warehouses",
          warehouseData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification("Warehouse added successfully!", "success");
      }

      // Reset form
      setName("");
      setBranchId("");
      setCapacity("");
      setManager("");
      setAddress("");
      setEditingId(null);
      
      // Refresh list
      fetchWarehouses();
    } catch (err) {
      console.error("Error saving warehouse:", err);
      showNotification("Failed to save warehouse", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteWarehouse = async (warehouseId) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`https://tiles-backend-ten.vercel.app/api/warehouses/${warehouseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification("Warehouse deleted successfully!", "success");
      fetchWarehouses();
    } catch (err) {
      console.error("Error deleting warehouse:", err);
      showNotification("Failed to delete warehouse", "error");
    } finally {
      setLoading(false);
    }
  };

  const editWarehouse = (warehouse) => {
    setName(warehouse.name);
    setBranchId(warehouse.branchId);
    setCapacity(warehouse.capacity || "");
    setManager(warehouse.manager || "");
    setAddress(warehouse.address || "");
    setEditingId(warehouse._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setName("");
    setBranchId("");
    setCapacity("");
    setManager("");
    setAddress("");
    setEditingId(null);
  };

  const showNotification = (message, type = "info") => {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background-color: ${type === 'success' ? activeTheme.success : 
                         type === 'error' ? activeTheme.danger : 
                         type === 'warning' ? activeTheme.warning : activeTheme.cardBg};
      color: white;
      border-radius: 8px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);

    // Add animation styles if not already added
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.name : "Unknown Branch";
  };

  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = 
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (warehouse.address && warehouse.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (warehouse.manager && warehouse.manager.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesBranch = selectedBranchFilter === "all" || warehouse.branchId === selectedBranchFilter;
    
    return matchesSearch && matchesBranch;
  });

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: activeTheme.bg,
      color: activeTheme.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: "24px"
    },
    header: {
      marginBottom: "32px"
    },
    title: {
      fontSize: "36px",
      fontWeight: "800",
      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "8px",
      letterSpacing: "-0.5px"
    },
    subtitle: {
      fontSize: "16px",
      color: activeTheme.textSecondary,
      maxWidth: "600px",
      lineHeight: "1.6"
    },
    formCard: {
      backgroundColor: activeTheme.cardBg,
      borderRadius: "16px",
      padding: "32px",
      border: `1px solid ${activeTheme.border}`,
      boxShadow: activeTheme.shadow,
      marginBottom: "32px"
    },
    formHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "24px"
    },
    formTitle: {
      fontSize: "24px",
      fontWeight: "700",
      color: activeTheme.text,
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    editBadge: {
      padding: "6px 16px",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      color: activeTheme.warning,
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginBottom: "28px"
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    },
    label: {
      fontSize: "14px",
      fontWeight: "600",
      color: activeTheme.textSecondary,
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    required: {
      color: activeTheme.danger
    },
    input: {
      padding: "14px 16px",
      backgroundColor: "rgba(30, 41, 59, 0.7)",
      border: `1px solid ${activeTheme.border}`,
      borderRadius: "10px",
      color: activeTheme.text,
      fontSize: "15px",
      outline: "none",
      transition: "all 0.2s ease"
    },
    inputFocus: {
      borderColor: activeTheme.primary,
      boxShadow: `0 0 0 3px ${activeTheme.primary}20`
    },
    select: {
      padding: "14px 16px",
      backgroundColor: "rgba(30, 41, 59, 0.7)",
      border: `1px solid ${activeTheme.border}`,
      borderRadius: "10px",
      color: activeTheme.text,
      fontSize: "15px",
      outline: "none",
      cursor: "pointer",
      transition: "all 0.2s ease"
    },
    buttonGroup: {
      display: "flex",
      gap: "12px",
      justifyContent: "flex-end"
    },
    primaryButton: {
      padding: "14px 32px",
      backgroundColor: activeTheme.primary,
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      minWidth: "140px",
      justifyContent: "center"
    },
    secondaryButton: {
      padding: "14px 32px",
      backgroundColor: "transparent",
      color: activeTheme.textSecondary,
      border: `1px solid ${activeTheme.border}`,
      borderRadius: "10px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    buttonHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 20px rgba(59, 130, 246, 0.4)"
    },
    secondaryButtonHover: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderColor: activeTheme.textSecondary
    },
    listCard: {
      backgroundColor: activeTheme.cardBg,
      borderRadius: "16px",
      padding: "32px",
      border: `1px solid ${activeTheme.border}`,
      boxShadow: activeTheme.shadow
    },
    listHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      flexWrap: "wrap",
      gap: "16px"
    },
    listTitle: {
      fontSize: "24px",
      fontWeight: "700",
      color: activeTheme.text,
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    filters: {
      display: "flex",
      gap: "16px",
      flexWrap: "wrap"
    },
    searchInput: {
      padding: "14px 20px",
      backgroundColor: "rgba(30, 41, 59, 0.7)",
      border: `1px solid ${activeTheme.border}`,
      borderRadius: "10px",
      color: activeTheme.text,
      fontSize: "15px",
      outline: "none",
      minWidth: "250px",
      transition: "all 0.2s ease"
    },
    branchFilter: {
      padding: "14px 20px",
      backgroundColor: "rgba(30, 41, 59, 0.7)",
      border: `1px solid ${activeTheme.border}`,
      borderRadius: "10px",
      color: activeTheme.text,
      fontSize: "15px",
      outline: "none",
      cursor: "pointer",
      minWidth: "200px"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px"
    },
    tableHeader: {
      backgroundColor: "#334155",
      borderBottom: `2px solid ${activeTheme.border}`
    },
    tableHeaderCell: {
      padding: "18px",
      textAlign: "left",
      fontSize: "14px",
      fontWeight: "600",
      color: activeTheme.textSecondary,
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    tableRow: {
      borderBottom: `1px solid ${activeTheme.border}`,
      transition: "all 0.2s ease"
    },
    tableRowHover: {
      backgroundColor: "rgba(59, 130, 246, 0.1)"
    },
    tableCell: {
      padding: "20px",
      fontSize: "15px",
      color: activeTheme.text
    },
    actionButtons: {
      display: "flex",
      gap: "8px"
    },
    editButton: {
      padding: "8px 16px",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      color: activeTheme.warning,
      border: `1px solid ${activeTheme.warning}40`,
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },
    deleteButton: {
      padding: "8px 16px",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      color: activeTheme.danger,
      border: `1px solid ${activeTheme.danger}40`,
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },
    buttonHoverSmall: {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: activeTheme.textSecondary
    },
    emptyStateIcon: {
      fontSize: "60px",
      marginBottom: "16px",
      opacity: 0.5
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "16px",
      zIndex: 10
    },
    loadingSpinner: {
      width: "40px",
      height: "40px",
      border: `3px solid ${activeTheme.border}`,
      borderTop: `3px solid ${activeTheme.primary}`,
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    },
    badge: {
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "13px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      display: "inline-block"
    },
    activeBadge: {
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      color: activeTheme.success,
      border: `1px solid ${activeTheme.success}40`
    },
    inactiveBadge: {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      color: activeTheme.danger,
      border: `1px solid ${activeTheme.danger}40`
    },
    capacityBadge: {
      padding: "8px 16px",
      backgroundColor: "rgba(139, 92, 246, 0.1)",
      color: activeTheme.purple,
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: "600",
      display: "inline-block"
    },
    branchBadge: {
      padding: "8px 16px",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      color: activeTheme.primary,
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: "600",
      display: "inline-block"
    }
  };

  // If no token, show login redirect message
  if (!token) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <h1 style={{ color: activeTheme.danger, marginBottom: "20px" }}>Access Denied</h1>
          <p style={{ color: activeTheme.textSecondary, marginBottom: "30px" }}>
            You need to login to access this page
          </p>
          <button 
            style={styles.primaryButton}
            onClick={() => window.location.href = "/login"}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Add spinner animation styles */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Warehouse Management</h1>
        <p style={styles.subtitle}>
          Create and manage warehouses under branches. Track capacity and managers.
        </p>
      </div>

      {/* Add/Edit Warehouse Form */}
      <div style={styles.formCard}>
        <div style={styles.formHeader}>
          <h3 style={styles.formTitle}>
            <span>{editingId ? "✏️" : "➕"}</span>
            {editingId ? "Edit Warehouse" : "Add New Warehouse"}
          </h3>
          {editingId && (
            <div style={styles.editBadge}>
              <span>✏️</span>
              Editing Mode
            </div>
          )}
        </div>
        
        <div style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span>🏢</span> Select Branch <span style={styles.required}>*</span>
            </label>
            <select 
              style={styles.select}
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              disabled={loading}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = activeTheme.border}
            >
              <option value="">Select a branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span>📦</span> Warehouse Name <span style={styles.required}>*</span>
            </label>
            <input
              style={styles.input}
              placeholder="Enter warehouse name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = activeTheme.border}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span>📏</span> Capacity (sqm)
            </label>
            <input
              style={styles.input}
              placeholder="Enter storage capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = activeTheme.border}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span>👤</span> Manager Name
            </label>
            <input
              style={styles.input}
              placeholder="Enter manager name"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = activeTheme.border}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span>📍</span> Address
            </label>
            <input
              style={styles.input}
              placeholder="Enter warehouse address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = activeTheme.border}
              disabled={loading}
            />
          </div>
        </div>

        <div style={styles.buttonGroup}>
          {editingId && (
            <button 
              style={styles.secondaryButton}
              onClick={cancelEdit}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) Object.assign(e.target.style, styles.secondaryButtonHover);
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.borderColor = activeTheme.border;
                }
              }}
            >
              Cancel Edit
            </button>
          )}
          <button 
            style={styles.primaryButton}
            onClick={saveWarehouse}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) Object.assign(e.target.style, styles.buttonHover);
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = activeTheme.primary;
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            {loading ? (
              <>
                <div style={styles.loadingSpinner}></div>
                {editingId ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <span>{editingId ? "💾" : "➕"}</span>
                {editingId ? "Update Warehouse" : "Add Warehouse"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Warehouses List */}
      <div style={styles.listCard}>
        <div style={styles.listHeader}>
          <h3 style={styles.listTitle}>
            <span>📋</span> All Warehouses ({filteredWarehouses.length})
          </h3>
          
          <div style={styles.filters}>
            <input
              style={styles.searchInput}
              placeholder="Search warehouses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = activeTheme.border}
            />
            
            <select 
              style={styles.branchFilter}
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && warehouses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", position: "relative" }}>
            <div style={styles.loadingSpinner}></div>
            <p style={{ marginTop: "16px", color: activeTheme.textSecondary }}>Loading warehouses...</p>
          </div>
        ) : filteredWarehouses.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>🏭</div>
            <h3 style={{ color: activeTheme.text, marginBottom: "8px" }}>
              {searchTerm || selectedBranchFilter !== "all" ? "No matching warehouses found" : "No warehouses added yet"}
            </h3>
            <p style={{ color: activeTheme.textSecondary }}>
              {searchTerm || selectedBranchFilter !== "all" ? "Try a different search or filter" : "Start by adding your first warehouse above"}
            </p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Warehouse</th>
                <th style={styles.tableHeaderCell}>Branch</th>
                <th style={styles.tableHeaderCell}>Capacity</th>
                <th style={styles.tableHeaderCell}>Manager</th>
                <th style={styles.tableHeaderCell}>Address</th>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarehouses.map((warehouse) => (
                <tr 
                  key={warehouse._id}
                  style={styles.tableRow}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.tableRowHover)}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={styles.tableCell}>
                    <div style={{ fontWeight: "600", fontSize: "16px" }}>
                      📦 {warehouse.name}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.branchBadge}>
                      🏢 {getBranchName(warehouse.branchId)}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    {warehouse.capacity ? (
                      <span style={styles.capacityBadge}>
                        📏 {warehouse.capacity} sqm
                      </span>
                    ) : (
                      <span style={{ color: activeTheme.textSecondary, fontStyle: "italic" }}>
                        Not specified
                      </span>
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    {warehouse.manager || (
                      <span style={{ color: activeTheme.textSecondary, fontStyle: "italic" }}>
                        Not assigned
                      </span>
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    {warehouse.address ? (
                      <div style={{ fontSize: "14px" }}>{warehouse.address}</div>
                    ) : (
                      <span style={{ color: activeTheme.textSecondary, fontStyle: "italic" }}>
                        Not specified
                      </span>
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.badge,
                      ...(warehouse.status === 'active' ? styles.activeBadge : styles.inactiveBadge)
                    }}>
                      {warehouse.status || 'active'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.editButton}
                        onClick={() => editWarehouse(warehouse)}
                        disabled={loading}
                        onMouseEnter={(e) => {
                          if (!loading) Object.assign(e.target.style, styles.buttonHoverSmall);
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }
                        }}
                        title="Edit warehouse"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        style={styles.deleteButton}
                        onClick={() => deleteWarehouse(warehouse._id)}
                        disabled={loading}
                        onMouseEnter={(e) => {
                          if (!loading) Object.assign(e.target.style, styles.buttonHoverSmall);
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }
                        }}
                        title="Delete warehouse"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}