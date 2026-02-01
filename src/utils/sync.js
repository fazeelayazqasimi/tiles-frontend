import axios from "axios";

export const syncNow = async () => {
  const queue = JSON.parse(localStorage.getItem("syncQueue") || "[]");
  const token = localStorage.getItem("token");

  for (let item of queue) {
    await axios.post("http://localhost:5000/api/inventory", item, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  localStorage.removeItem("syncQueue");
  alert("Synced all offline items!");
};
