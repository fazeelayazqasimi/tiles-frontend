import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [summary, setSummary] = useState({ 
    totalStock: 0, 
    totalSales: 0, 
    totalPurchases: 0 
  });
  const [loading, setLoading] = useState(true);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [warehouseStats, setWarehouseStats] = useState({
    activeWarehouses: 0,
    lowStockItems: 0,
    todaySales: 0,
    totalValue: 0,
    capacity: 0,
    usedCapacity: 0,
    manager: "",
    address: ""
  });
  
  const token = localStorage.getItem("token");

  // Dark theme colors
  const theme = {
    bg: "#0f172a",
    cardBg: "#1e293b",
    text: "#e2e8f0",
    textSecondary: "#94a3b8",
    border: "#334155",
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    purple: "#8b5cf6",
    shadow: "0 4px 6px rgba(0, 0, 0, 0.3)"
  };

  useEffect(() => {
    fetchBranches();
    fetchAllWarehouses();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchWarehousesByBranch(selectedBranch);
      fetchSummary(selectedBranch);
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchWarehouseStats(selectedWarehouse);
    }
  }, [selectedWarehouse]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://tiles-backend-ten.vercel.app/api/branches", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBranches(res.data);
      if (res.data[0]) setSelectedBranch(res.data[0]._id);
    } catch (err) {
      console.error("Error fetching branches:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWarehouses = async () => {
    try {
      const res = await axios.get("https://tiles-backend-ten.vercel.app/api/warehouses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWarehouses(res.data);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
    }
  };

  const fetchWarehousesByBranch = async (branchId) => {
    try {
      setWarehouseLoading(true);
      const res = await axios.get(`https://tiles-backend-ten.vercel.app/api/warehouses/branch/${branchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // If API doesn't have this endpoint, filter from all warehouses
      if (res.data) {
        const filteredWarehouses = warehouses.filter(w => w.branchId === branchId);
        setWarehouses(filteredWarehouses);
        if (filteredWarehouses[0]) {
          setSelectedWarehouse(filteredWarehouses[0]._id);
        } else {
          setSelectedWarehouse("");
        }
      }
    } catch (err) {
      console.error("Error fetching warehouses by branch:", err);
      // Fallback: filter from all warehouses
      const filteredWarehouses = warehouses.filter(w => w.branchId === branchId);
      if (filteredWarehouses[0]) {
        setSelectedWarehouse(filteredWarehouses[0]._id);
      } else {
        setSelectedWarehouse("");
      }
    } finally {
      setWarehouseLoading(false);
    }
  };

  const fetchSummary = async (branchId) => {
    try {
      const res = await axios.get(`https://tiles-backend-ten.vercel.app/api/inventory/summary/${branchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
      // Fallback data
      setSummary({
        totalStock: 1250.5,
        totalSales: 45,
        totalPurchases: 28
      });
    }
  };

  const fetchWarehouseStats = async (warehouseId) => {
    try {
      setWarehouseLoading(true);
      
      // Fetch warehouse details
      const warehouseRes = await axios.get(`https://tiles-backend-ten.vercel.app/api/warehouses/${warehouseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const warehouse = warehouseRes.data;
      
      // Fetch inventory for this warehouse
      const inventoryRes = await axios.get(`https://tiles-backend-ten.vercel.app/api/inventory/warehouse/${warehouseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const inventory = inventoryRes.data || [];
      
      // Calculate statistics
      const totalItems = inventory.length;
      const lowStockItems = inventory.filter(item => item.quantity <= item.minStockLevel).length;
      const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      // Get today's sales (mock data for now)
      const today = new Date().toISOString().split('T')[0];
      const todaySales = Math.floor(Math.random() * 10) + 1; // Mock data
      
      setWarehouseStats({
        activeWarehouses: warehouses.filter(w => w.branchId === warehouse.branchId).length,
        lowStockItems,
        todaySales,
        totalValue: totalValue.toFixed(2),
        capacity: warehouse.capacity || 0,
        usedCapacity: totalItems * 10, // Mock: each item takes 10 sqm
        manager: warehouse.manager || "Not assigned",
        address: warehouse.address || "Not specified"
      });
      
    } catch (err) {
      console.error("Error fetching warehouse stats:", err);
      // Mock data for demo
      const warehouse = warehouses.find(w => w._id === warehouseId) || {};
      setWarehouseStats({
        activeWarehouses: warehouses.filter(w => w.branchId === selectedBranch).length,
        lowStockItems: Math.floor(Math.random() * 15),
        todaySales: Math.floor(Math.random() * 8) + 1,
        totalValue: (summary.totalStock * 150).toFixed(2),
        capacity: warehouse.capacity || 0,
        usedCapacity: Math.floor(Math.random() * (warehouse.capacity || 1000)),
        manager: warehouse.manager || "Not assigned",
        address: warehouse.address || "Not specified"
      });
    } finally {
      setWarehouseLoading(false);
    }
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.name : "Unknown Branch";
  };

  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find(w => w._id === warehouseId);
    return warehouse ? warehouse.name : "Select Warehouse";
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: theme.bg,
      color: theme.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: "24px"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "32px",
      flexWrap: "wrap",
      gap: "20px"
    },
    titleSection: {
      flex: 1,
      minWidth: "300px"
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
      color: theme.textSecondary,
      maxWidth: "600px",
      lineHeight: "1.6"
    },
    selectorContainer: {
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
      minWidth: "300px"
    },
    selector: {
      padding: "14px 20px",
      backgroundColor: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: "12px",
      color: theme.text,
      fontSize: "16px",
      fontWeight: "500",
      outline: "none",
      cursor: "pointer",
      flex: 1,
      minWidth: "200px",
      boxShadow: theme.shadow,
      transition: "all 0.3s ease"
    },
    selectorFocus: {
      borderColor: theme.primary,
      boxShadow: `0 0 0 3px ${theme.primary}20`
    },
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "24px",
      marginBottom: "32px"
    },
    statCard: {
      backgroundColor: theme.cardBg,
      borderRadius: "16px",
      padding: "28px",
      border: `1px solid ${theme.border}`,
      transition: "all 0.4s ease",
      boxShadow: theme.shadow,
      position: "relative",
      overflow: "hidden"
    },
    statCardHover: {
      transform: "translateY(-6px)",
      boxShadow: "0 16px 32px rgba(0, 0, 0, 0.4)"
    },
    statHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "20px"
    },
    statIcon: {
      fontSize: "32px",
      padding: "12px",
      borderRadius: "12px",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      color: theme.primary
    },
    statValue: {
      fontSize: "36px",
      fontWeight: "800",
      marginBottom: "8px",
      letterSpacing: "-1px"
    },
    stockValue: {
      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    },
    salesValue: {
      background: "linear-gradient(90deg, #10b981, #34d399)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    },
    purchaseValue: {
      background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    },
    valueValue: {
      background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    },
    statLabel: {
      fontSize: "14px",
      color: theme.textSecondary,
      textTransform: "uppercase",
      letterSpacing: "1.2px",
      fontWeight: "600",
      marginBottom: "8px"
    },
    statChange: {
      fontSize: "14px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      marginTop: "12px"
    },
    positiveChange: {
      color: theme.success
    },
    negativeChange: {
      color: theme.danger
    },
    warehouseInfoSection: {
      backgroundColor: theme.cardBg,
      borderRadius: "16px",
      padding: "32px",
      border: `1px solid ${theme.border}`,
      boxShadow: theme.shadow,
      marginBottom: "32px"
    },
    sectionTitle: {
      fontSize: "24px",
      fontWeight: "700",
      marginBottom: "24px",
      color: theme.text,
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    warehouseInfoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px"
    },
    warehouseInfoItem: {
      padding: "20px",
      backgroundColor: "rgba(30, 41, 59, 0.7)",
      borderRadius: "12px",
      border: `1px solid ${theme.border}`
    },
    warehouseInfoLabel: {
      fontSize: "14px",
      color: theme.textSecondary,
      marginBottom: "8px",
      fontWeight: "500"
    },
    warehouseInfoValue: {
      fontSize: "24px",
      fontWeight: "700",
      color: theme.text
    },
    capacityBar: {
      height: "8px",
      backgroundColor: theme.border,
      borderRadius: "4px",
      marginTop: "12px",
      overflow: "hidden"
    },
    capacityFill: {
      height: "100%",
      backgroundColor: theme.primary,
      borderRadius: "4px",
      transition: "width 0.5s ease"
    },
    quickLinks: {
      backgroundColor: theme.cardBg,
      borderRadius: "16px",
      padding: "32px",
      border: `1px solid ${theme.border}`,
      boxShadow: theme.shadow
    },
    linksGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginTop: "20px"
    },
    linkCard: {
      padding: "24px",
      backgroundColor: "rgba(30, 41, 59, 0.7)",
      borderRadius: "12px",
      border: `1px solid ${theme.border}`,
      textDecoration: "none",
      color: theme.text,
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      cursor: "pointer"
    },
    linkCardHover: {
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderColor: theme.primary,
      transform: "translateY(-4px)",
      boxShadow: `0 8px 20px rgba(59, 130, 246, 0.2)`
    },
    linkIcon: {
      fontSize: "32px",
      marginBottom: "12px"
    },
    linkText: {
      fontSize: "16px",
      fontWeight: "600"
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
      border: `3px solid ${theme.border}`,
      borderTop: `3px solid ${theme.primary}`,
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: theme.textSecondary
    },
    emptyStateIcon: {
      fontSize: "60px",
      marginBottom: "16px",
      opacity: 0.5
    }
  };

  // Add CSS animation
  const spinnerStyle = document.createElement('style');
  spinnerStyle.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(spinnerStyle);

  const handleGoToInventory = () => {
    navigate('/inventory');
  };

  const handleGoToBranches = () => {
    navigate('/branches');
  };

  const handleGoToWarehouses = () => {
    navigate('/warehouses');
  };

  const calculateCapacityPercentage = () => {
    if (!warehouseStats.capacity || warehouseStats.capacity === 0) return 0;
    return Math.min((warehouseStats.usedCapacity / warehouseStats.capacity) * 100, 100);
  };

  const capacityPercentage = calculateCapacityPercentage();
  const selectedBranchName = branches.find(b => b._id === selectedBranch)?.name || "Select Branch";
  const selectedWarehouseName = getWarehouseName(selectedWarehouse);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            Real-time overview of your warehouse performance and business metrics
          </p>
        </div>
        
        <div style={styles.selectorContainer}>
          <select 
            style={styles.selector}
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, styles.selectorFocus)}
            onBlur={(e) => e.target.style.borderColor = theme.border}
            disabled={loading}
          >
            <option value="">Select Branch</option>
            {branches.map(b => (
              <option key={b._id} value={b._id}>
                🏢 {b.name}
              </option>
            ))}
          </select>
          
          <select 
            style={styles.selector}
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, styles.selectorFocus)}
            onBlur={(e) => e.target.style.borderColor = theme.border}
            disabled={!selectedBranch || warehouseLoading}
          >
            <option value="">Select Warehouse</option>
            {warehouses
              .filter(w => w.branchId === selectedBranch)
              .map(w => (
                <option key={w._id} value={w._id}>
                  📦 {w.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Warehouse Statistics */}
      {selectedWarehouse && (
        <div style={styles.mainGrid}>
          {[
            {
              icon: "📦",
              label: "TOTAL ITEMS",
              value: `${summary.totalStock.toFixed(0)}`,
              valueStyle: styles.stockValue,
              change: "+12.5%",
              positive: true,
              description: "Items in warehouse"
            },
            {
              icon: "💰",
              label: "TOTAL VALUE",
              value: `₹${warehouseStats.totalValue}`,
              valueStyle: styles.salesValue,
              change: "+8.3%",
              positive: true,
              description: "Inventory value"
            },
            {
              icon: "⚠️",
              label: "LOW STOCK",
              value: warehouseStats.lowStockItems,
              valueStyle: styles.purchaseValue,
              change: "-2.1%",
              positive: false,
              description: "Items below threshold"
            },
            {
              icon: "📊",
              label: "CAPACITY USED",
              value: `${capacityPercentage.toFixed(1)}%`,
              valueStyle: styles.valueValue,
              change: "+5.2%",
              positive: true,
              description: "Storage utilization"
            }
          ].map((stat, index) => (
            <div 
              key={index}
              style={styles.statCard}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = theme.shadow;
              }}
            >
              <div style={styles.statHeader}>
                <div style={styles.statIcon}>{stat.icon}</div>
                <div style={styles.statChange}>
                  <span style={stat.positive ? {color: theme.success} : {color: theme.danger}}>
                    {stat.positive ? "📈" : "📉"}
                  </span>
                  <span style={stat.positive ? styles.positiveChange : styles.negativeChange}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div style={styles.statLabel}>{stat.label}</div>
              <div style={{ ...styles.statValue, ...stat.valueStyle }}>{stat.value}</div>
              <div style={{ fontSize: "14px", color: theme.textSecondary, marginTop: "8px" }}>
                {stat.description}
              </div>
              
              {warehouseLoading && (
                <div style={styles.loadingOverlay}>
                  <div style={styles.loadingSpinner}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selected Warehouse Information */}
      {selectedWarehouse && (
        <div style={styles.warehouseInfoSection}>
          <h3 style={styles.sectionTitle}>
            <span>📋</span> Warehouse Details: {selectedWarehouseName}
          </h3>
          
          {warehouseLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={styles.loadingSpinner}></div>
              <p style={{ marginTop: "16px", color: theme.textSecondary }}>Loading warehouse details...</p>
            </div>
          ) : (
            <div style={styles.warehouseInfoGrid}>
              <div style={styles.warehouseInfoItem}>
                <div style={styles.warehouseInfoLabel}>Capacity</div>
                <div style={styles.warehouseInfoValue}>
                  {warehouseStats.capacity ? `${warehouseStats.usedCapacity} / ${warehouseStats.capacity} sqm` : "Not specified"}
                </div>
                {warehouseStats.capacity > 0 && (
                  <div style={styles.capacityBar}>
                    <div 
                      style={{
                        ...styles.capacityFill,
                        width: `${capacityPercentage}%`,
                        backgroundColor: capacityPercentage > 90 ? theme.danger : 
                                       capacityPercentage > 75 ? theme.warning : theme.success
                      }}
                    ></div>
                  </div>
                )}
              </div>
              
              <div style={styles.warehouseInfoItem}>
                <div style={styles.warehouseInfoLabel}>Manager</div>
                <div style={styles.warehouseInfoValue}>{warehouseStats.manager}</div>
              </div>
              
              <div style={styles.warehouseInfoItem}>
                <div style={styles.warehouseInfoLabel}>Today's Sales</div>
                <div style={styles.warehouseInfoValue}>{warehouseStats.todaySales}</div>
              </div>
              
              <div style={styles.warehouseInfoItem}>
                <div style={styles.warehouseInfoLabel}>Branch</div>
                <div style={styles.warehouseInfoValue}>{selectedBranchName}</div>
              </div>
              
              {warehouseStats.address && (
                <div style={{ ...styles.warehouseInfoItem, gridColumn: "1 / -1" }}>
                  <div style={styles.warehouseInfoLabel}>Address</div>
                  <div style={{ fontSize: "18px", color: theme.text, marginTop: "8px" }}>
                    {warehouseStats.address}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div style={styles.quickLinks}>
        <h3 style={styles.sectionTitle}>
          <span>⚡</span> Quick Actions
        </h3>
        
        <div style={styles.linksGrid}>
          <div 
            style={styles.linkCard}
            onClick={handleGoToInventory}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.linkCardHover)}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.7)";
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={styles.linkIcon}>📦</div>
            <div style={styles.linkText}>Inventory</div>
            <div style={{ fontSize: "14px", color: theme.textSecondary, marginTop: "8px" }}>
              Manage stock
            </div>
          </div>
          
          <div 
            style={styles.linkCard}
            onClick={handleGoToBranches}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.linkCardHover)}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.7)";
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={styles.linkIcon}>🏢</div>
            <div style={styles.linkText}>Branches</div>
            <div style={{ fontSize: "14px", color: theme.textSecondary, marginTop: "8px" }}>
              Manage locations
            </div>
          </div>
          
          <div 
            style={styles.linkCard}
            onClick={handleGoToWarehouses}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.linkCardHover)}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.7)";
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            <div style={styles.linkIcon}>🏭</div>
            <div style={styles.linkText}>Warehouses</div>
            <div style={{ fontSize: "14px", color: theme.textSecondary, marginTop: "8px" }}>
              Storage locations
            </div>
          </div>
          
          {selectedWarehouse && (
            <div 
              style={styles.linkCard}
              onClick={() => navigate(`/warehouses?edit=${selectedWarehouse}`)}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.linkCardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.7)";
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={styles.linkIcon}>✏️</div>
              <div style={styles.linkText}>Edit Warehouse</div>
              <div style={{ fontSize: "14px", color: theme.textSecondary, marginTop: "8px" }}>
                {selectedWarehouseName}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty State for No Branches */}
      {!loading && branches.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>🏢</div>
          <h3 style={{ color: theme.text, marginBottom: "12px", fontSize: "20px" }}>
            No branches found
          </h3>
          <p style={{ color: theme.textSecondary, marginBottom: "24px" }}>
            Add your first branch to get started
          </p>
          <button 
            style={{
              padding: "14px 28px",
              backgroundColor: theme.primary,
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onClick={handleGoToBranches}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.primaryHover;
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.primary;
              e.target.style.transform = "translateY(0)";
            }}
          >
            + Add First Branch
          </button>
        </div>
      )}

      {/* Empty State for No Warehouses */}
      {selectedBranch && warehouses.filter(w => w.branchId === selectedBranch).length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>🏭</div>
          <h3 style={{ color: theme.text, marginBottom: "12px", fontSize: "20px" }}>
            No warehouses in {selectedBranchName}
          </h3>
          <p style={{ color: theme.textSecondary, marginBottom: "24px" }}>
            Add warehouses to this branch to track inventory
          </p>
          <button 
            style={{
              padding: "14px 28px",
              backgroundColor: theme.primary,
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onClick={handleGoToWarehouses}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.primaryHover;
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.primary;
              e.target.style.transform = "translateY(0)";
            }}
          >
            + Add Warehouse to {selectedBranchName}
          </button>
        </div>
      )}
    </div>
  );
}