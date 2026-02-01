import { useState, useEffect } from "react";
import axios from "axios";

export default function Branch() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [manager, setManager] = useState("");
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://tiles-backend-ten.vercel.app/api/branches", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBranches(res.data);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load branches", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveBranch = async () => {
    if (!name.trim()) {
      showNotification("Please enter branch name", "warning");
      return;
    }

    try {
      setLoading(true);
      const branchData = { 
        name, 
        address, 
        phone, 
        email, 
        manager,
        status: "active"
      };

      if (editingId) {
        // Update existing branch
        await axios.put(
          `https://tiles-backend-ten.vercel.app/api/branches/${editingId}`,
          branchData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification("Branch updated successfully!", "success");
      } else {
        // Create new branch
        await axios.post(
          "https://tiles-backend-ten.vercel.app/api/branches",
          branchData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification("Branch added successfully!", "success");
      }

      // Reset form
      setName("");
      setAddress("");
      setPhone("");
      setEmail("");
      setManager("");
      setEditingId(null);
      
      // Refresh list
      fetchBranches();
    } catch (err) {
      console.error(err);
      showNotification("Failed to save branch", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteBranch = async (branchId) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`https://tiles-backend-ten.vercel.app/api/branches/${branchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification("Branch deleted successfully!", "success");
      fetchBranches();
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete branch", "error");
    } finally {
      setLoading(false);
    }
  };

  const editBranch = (branch) => {
    setName(branch.name);
    setAddress(branch.address || "");
    setPhone(branch.phone || "");
    setEmail(branch.email || "");
    setManager(branch.manager || "");
    setEditingId(branch._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setName("");
    setAddress("");
    setPhone("");
    setEmail("");
    setManager("");
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
      background-color: ${type === 'success' ? theme.success : 
                         type === 'error' ? theme.danger : 
                         type === 'warning' ? theme.warning : theme.cardBg};
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

    // Add animation styles
    const style = document.createElement('style');
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
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (branch.address && branch.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (branch.manager && branch.manager.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: theme.bg,
      color: theme.text,
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
      color: theme.textSecondary,
      maxWidth: "600px",
      lineHeight: "1.6"
    },
    formCard: {
      backgroundColor: theme.cardBg,
      borderRadius: "16px",
      padding: "32px",
      border: `1px solid ${theme.border}`,
      boxShadow: theme.shadow,
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
      color: theme.text,
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    editBadge: {
      padding: "6px 16px",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      color: theme.warning,
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
      color: theme.textSecondary,
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    required: {
      color: theme.danger
    },
    input: {
      padding: "14px 16px",
      backgroundColor: "rgba(30, 41, 59, 0.7)",
      border: `1px solid ${theme.border}`,
      borderRadius: "10px",
      color: theme.text,
      fontSize: "15px",
      outline: "none",
      transition: "all 0.2s ease"
    },
    inputFocus: {
      borderColor: theme.primary,
      boxShadow: `0 0 0 3px ${theme.primary}20`
    },
    buttonGroup: {
      display: "flex",
      gap: "12px",
      justifyContent: "flex-end"
    },
    primaryButton: {
      padding: "14px 32px",
      backgroundColor: theme.primary,
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
      color: theme.textSecondary,
      border: `1px solid ${theme.border}`,
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
      borderColor: theme.textSecondary
    },
    listCard: {
      backgroundColor: theme.cardBg,
      borderRadius: "16px",
      padding: "32px",
      border: `1px solid ${theme.border}`,
      boxShadow: theme.shadow
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
      color: theme.text,
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    searchInput: {
      padding: "14px 20px",
      backgroundColor: "rgba(30, 41, 59, 0.7)",
      border: `1px solid ${theme.border}`,
      borderRadius: "10px",
      color: theme.text,
      fontSize: "15px",
      outline: "none",
      minWidth: "300px",
      transition: "all 0.2s ease"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px"
    },
    tableHeader: {
      backgroundColor: "#334155",
      borderBottom: `2px solid ${theme.border}`
    },
    tableHeaderCell: {
      padding: "18px",
      textAlign: "left",
      fontSize: "14px",
      fontWeight: "600",
      color: theme.textSecondary,
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    tableRow: {
      borderBottom: `1px solid ${theme.border}`,
      transition: "all 0.2s ease"
    },
    tableRowHover: {
      backgroundColor: "rgba(59, 130, 246, 0.1)"
    },
    tableCell: {
      padding: "20px",
      fontSize: "15px",
      color: theme.text
    },
    actionButtons: {
      display: "flex",
      gap: "8px"
    },
    editButton: {
      padding: "8px 16px",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      color: theme.warning,
      border: `1px solid ${theme.warning}40`,
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
      color: theme.danger,
      border: `1px solid ${theme.danger}40`,
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
      color: theme.textSecondary
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
      border: `3px solid ${theme.border}`,
      borderTop: `3px solid ${theme.primary}`,
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
      color: theme.success,
      border: `1px solid ${theme.success}40`
    },
    inactiveBadge: {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      color: theme.danger,
      border: `1px solid ${theme.danger}40`
    }
  };

  // Add CSS animation for spinner
  const spinnerStyle = document.createElement('style');
  spinnerStyle.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(spinnerStyle);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Branch Management</h1>
        <p style={styles.subtitle}>
          Create and manage branches for your tile business. Each branch can have multiple warehouses.
        </p>
      </div>

      {/* Add/Edit Branch Form */}
      <div style={styles.formCard}>
        <div style={styles.formHeader}>
          <h3 style={styles.formTitle}>
            <span>{editingId ? "✏️" : "➕"}</span>
            {editingId ? "Edit Branch" : "Add New Branch"}
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
              <span>🏢</span> Branch Name <span style={styles.required}>*</span>
            </label>
            <input
              style={styles.input}
              placeholder="Enter branch name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = theme.border}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span>📍</span> Address
            </label>
            <input
              style={styles.input}
              placeholder="Enter branch address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = theme.border}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span>📞</span> Phone Number
            </label>
            <input
              style={styles.input}
              placeholder="Enter contact number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = theme.border}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span>📧</span> Email Address
            </label>
            <input
              style={styles.input}
              placeholder="Enter email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.borderColor = theme.border}
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
              onBlur={(e) => e.target.style.borderColor = theme.border}
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
                  e.target.style.borderColor = theme.border;
                }
              }}
            >
              Cancel Edit
            </button>
          )}
          <button 
            style={styles.primaryButton}
            onClick={saveBranch}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) Object.assign(e.target.style, styles.buttonHover);
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = theme.primary;
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
                {editingId ? "Update Branch" : "Add Branch"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Branches List */}
      <div style={styles.listCard}>
        <div style={styles.listHeader}>
          <h3 style={styles.listTitle}>
            <span>📋</span> All Branches ({filteredBranches.length})
          </h3>
          <input
            style={styles.searchInput}
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => e.target.style.borderColor = theme.border}
          />
        </div>

        {loading && branches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", position: "relative" }}>
            <div style={styles.loadingSpinner}></div>
            <p style={{ marginTop: "16px", color: theme.textSecondary }}>Loading branches...</p>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>🏢</div>
            <h3 style={{ color: theme.text, marginBottom: "8px" }}>
              {searchTerm ? "No matching branches found" : "No branches added yet"}
            </h3>
            <p style={{ color: theme.textSecondary }}>
              {searchTerm ? "Try a different search term" : "Start by adding your first branch above"}
            </p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Branch Name</th>
                <th style={styles.tableHeaderCell}>Address</th>
                <th style={styles.tableHeaderCell}>Contact</th>
                <th style={styles.tableHeaderCell}>Manager</th>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map((branch) => (
                <tr 
                  key={branch._id}
                  style={styles.tableRow}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.tableRowHover)}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={styles.tableCell}>
                    <div style={{ fontWeight: "600", fontSize: "16px" }}>
                      🏢 {branch.name}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    {branch.address || (
                      <span style={{ color: theme.textSecondary, fontStyle: "italic" }}>
                        Not specified
                      </span>
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    <div>
                      {branch.phone && <div style={{ marginBottom: "4px" }}>📞 {branch.phone}</div>}
                      {branch.email && <div>📧 {branch.email}</div>}
                      {!branch.phone && !branch.email && (
                        <span style={{ color: theme.textSecondary, fontStyle: "italic" }}>
                          No contact info
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    {branch.manager || (
                      <span style={{ color: theme.textSecondary, fontStyle: "italic" }}>
                        Not assigned
                      </span>
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.badge,
                      ...(branch.status === 'active' ? styles.activeBadge : styles.inactiveBadge)
                    }}>
                      {branch.status || 'active'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.editButton}
                        onClick={() => editBranch(branch)}
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
                        title="Edit branch"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        style={styles.deleteButton}
                        onClick={() => deleteBranch(branch._id)}
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
                        title="Delete branch"
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