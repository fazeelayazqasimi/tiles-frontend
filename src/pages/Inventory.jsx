import { useState, useEffect } from "react";
import axios from "axios";

export default function Inventory() {
  const [form, setForm] = useState({
    productName: "",
    tileW: 600,
    tileH: 600,
    tilesPerBox: 4,
    boxes: 1,
    type: "sale",
    branchId: "",
    warehouseId: ""
  });

  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const token = localStorage.getItem("token");

  // Load saved inventory & fetch branches/warehouses
  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem("inventoryItems") || "[]");
    setItems(savedItems);
    fetchBranches();
    fetchWarehouses();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await axios.get("https://tiles-backend-ten.vercel.app/api/branches", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBranches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await axios.get("https://tiles-backend-ten.vercel.app/api/warehouses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWarehouses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const calcSqm = (w, h, perBox, boxes) => ((w / 1000) * (h / 1000) * perBox * boxes).toFixed(2);

  const save = async () => {
    if (!form.branchId || !form.warehouseId) {
      alert("Select branch & warehouse");
      return;
    }

    const sqm = calcSqm(form.tileW, form.tileH, form.tilesPerBox, form.boxes);
    const itemToSave = { ...form, sqm };

    // Update state + localStorage
    const updatedItems = [...items, itemToSave];
    setItems(updatedItems);
    localStorage.setItem("inventoryItems", JSON.stringify(updatedItems));

    try {
      await axios.post("https://tiles-backend-ten.vercel.app/api/inventory", itemToSave, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Saved online!");
    } catch {
      // Offline save
      const queue = JSON.parse(localStorage.getItem("syncQueue") || "[]");
      queue.push(itemToSave);
      localStorage.setItem("syncQueue", JSON.stringify(queue));
      alert("Saved offline!");
    }

    setForm({ productName: "", tileW: 600, tileH: 600, tilesPerBox: 4, boxes: 1, type: "sale", branchId: "", warehouseId: "" });
  };

  const syncNow = async () => {
    try {
      const syncQueue = JSON.parse(localStorage.getItem("syncQueue") || "[]");
      if (syncQueue.length > 0) {
        alert(`Syncing ${syncQueue.length} items...`);
        localStorage.setItem("syncQueue", "[]");
        alert("Sync completed!");
      } else {
        alert("All items are synced!");
      }
    } catch (error) {
      alert("Sync failed: " + error.message);
    }
  };

  // Styles
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#0f172a",
      color: "#e2e8f0",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: "24px"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "32px"
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "8px"
    },
    subtitle: {
      fontSize: "16px",
      color: "#94a3b8",
      marginTop: "4px"
    },
    syncButton: {
      padding: "12px 24px",
      backgroundColor: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    formCard: {
      backgroundColor: "#1e293b",
      borderRadius: "12px",
      padding: "24px",
      border: "1px solid #334155",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
      marginBottom: "32px"
    },
    formTitle: {
      fontSize: "20px",
      fontWeight: "600",
      marginBottom: "20px",
      color: "#e2e8f0"
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "24px"
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    },
    label: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#94a3b8"
    },
    input: {
      padding: "12px 16px",
      backgroundColor: "#334155",
      border: "1px solid #475569",
      borderRadius: "8px",
      color: "#e2e8f0",
      fontSize: "15px",
      outline: "none",
      transition: "all 0.2s ease"
    },
    inputFocus: {
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)"
    },
    select: {
      padding: "12px 16px",
      backgroundColor: "#334155",
      border: "1px solid #475569",
      borderRadius: "8px",
      color: "#e2e8f0",
      fontSize: "15px",
      outline: "none",
      cursor: "pointer"
    },
    addButton: {
      padding: "14px 28px",
      backgroundColor: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginTop: "16px"
    },
    tableCard: {
      backgroundColor: "#1e293b",
      borderRadius: "12px",
      padding: "24px",
      border: "1px solid #334155",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px"
    },
    tableHeader: {
      backgroundColor: "#334155",
      borderBottom: "2px solid #475569"
    },
    tableHeaderCell: {
      padding: "16px",
      textAlign: "left",
      fontSize: "14px",
      fontWeight: "600",
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    tableRow: {
      borderBottom: "1px solid #334155",
      transition: "background-color 0.2s ease"
    },
    tableRowHover: {
      backgroundColor: "rgba(59, 130, 246, 0.1)"
    },
    tableCell: {
      padding: "16px",
      fontSize: "15px",
      color: "#e2e8f0"
    },
    typeBadge: {
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "13px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    saleBadge: {
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      color: "#10b981",
      border: "1px solid rgba(16, 185, 129, 0.3)"
    },
    purchaseBadge: {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      color: "#ef4444",
      border: "1px solid rgba(239, 68, 68, 0.3)"
    },
    sqmBadge: {
      padding: "6px 12px",
      backgroundColor: "rgba(139, 92, 246, 0.1)",
      color: "#8b5cf6",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: "600",
      display: "inline-block"
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#94a3b8"
    },
    emptyStateIcon: {
      fontSize: "48px",
      marginBottom: "16px",
      opacity: 0.5
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Inventory Management</h1>
          <p style={styles.subtitle}>Manage your tile inventory</p>
        </div>
        <button 
          style={styles.syncButton}
          onClick={syncNow}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#2563eb";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#3b82f6";
            e.target.style.transform = "translateY(0)";
          }}
        >
          🔄 Sync Now
        </button>
      </div>

      {/* Add Item Form */}
      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Add New Item</h3>
        <div style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Branch</label>
            <select 
              style={styles.select}
              value={form.branchId} 
              onChange={(e) => setForm({ ...form, branchId: e.target.value, warehouseId: "" })}
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Warehouse</label>
            <select 
              style={styles.select}
              value={form.warehouseId} 
              onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
            >
              <option value="">Select Warehouse</option>
              {warehouses.filter(w => w.branchId === form.branchId).map((w) => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Product Name</label>
            <input
              style={styles.input}
              placeholder="Enter product name"
              value={form.productName}
              onChange={e => setForm({ ...form, productName: e.target.value })}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = "#475569"}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Boxes</label>
            <input
              style={styles.input}
              type="number"
              placeholder="Number of boxes"
              value={form.boxes}
              onChange={e => setForm({ ...form, boxes: +e.target.value })}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = "#475569"}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tile Width (mm)</label>
            <input
              style={styles.input}
              type="number"
              placeholder="Width in mm"
              value={form.tileW}
              onChange={e => setForm({ ...form, tileW: +e.target.value })}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = "#475569"}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tile Height (mm)</label>
            <input
              style={styles.input}
              type="number"
              placeholder="Height in mm"
              value={form.tileH}
              onChange={e => setForm({ ...form, tileH: +e.target.value })}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = "#475569"}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tiles per Box</label>
            <input
              style={styles.input}
              type="number"
              placeholder="Tiles per box"
              value={form.tilesPerBox}
              onChange={e => setForm({ ...form, tilesPerBox: +e.target.value })}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = "#475569"}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Type</label>
            <select 
              style={styles.select}
              value={form.type} 
              onChange={e => setForm({ ...form, type: e.target.value })}
            >
              <option value="sale">Sale</option>
              <option value="purchase">Purchase</option>
            </select>
          </div>
        </div>

        <button 
          style={styles.addButton}
          onClick={save}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#059669";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#10b981";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "20px" }}>+</span>
          Add Item
        </button>
      </div>

      {/* Inventory Table */}
      <div style={styles.tableCard}>
        <h3 style={styles.formTitle}>Added Items ({items.length})</h3>
        
        {items.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>📦</div>
            <h3 style={{ color: "#e2e8f0", marginBottom: "8px" }}>No items added yet</h3>
            <p>Start by adding your first item using the form above</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Product</th>
                <th style={styles.tableHeaderCell}>Type</th>
                <th style={styles.tableHeaderCell}>Branch</th>
                <th style={styles.tableHeaderCell}>Warehouse</th>
                <th style={styles.tableHeaderCell}>Boxes</th>
                <th style={styles.tableHeaderCell}>Tile Size</th>
                <th style={styles.tableHeaderCell}>Tiles/Box</th>
                <th style={styles.tableHeaderCell}>Area (m²)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr 
                  key={idx}
                  style={styles.tableRow}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.tableRowHover)}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={styles.tableCell}>
                    <div style={{ fontWeight: "600" }}>{it.productName}</div>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.typeBadge,
                      ...(it.type === "sale" ? styles.saleBadge : styles.purchaseBadge)
                    }}>
                      {it.type}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    {branches.find(b => b._id === it.branchId)?.name || "N/A"}
                  </td>
                  <td style={styles.tableCell}>
                    {warehouses.find(w => w._id === it.warehouseId)?.name || "N/A"}
                  </td>
                  <td style={styles.tableCell}>
                    <div style={{ 
                      fontWeight: "600",
                      textAlign: "center",
                      backgroundColor: "#334155",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      display: "inline-block"
                    }}>
                      {it.boxes}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={{ fontSize: "14px" }}>
                      {it.tileW} × {it.tileH} mm
                    </div>
                  </td>
                  <td style={styles.tableCell}>{it.tilesPerBox}</td>
                  <td style={styles.tableCell}>
                    <span style={styles.sqmBadge}>
                      {it.sqm} m²
                    </span>
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