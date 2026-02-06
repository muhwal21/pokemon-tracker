import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
// Kita pakai AreaChart supaya ada efek gradasi warna yang cantik
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MyCollection = () => {
  const [collection, setCollection] = useState([]);
  const [stats, setStats] = useState({ totalBeli: 0, totalSekarang: 0 });

  useEffect(() => {
    fetchMyCards();
  }, []);

  const fetchMyCards = async () => {
    const { data, error } = await supabase
      .from("user_collections")
      .select("*, cards(*)");

    if (!error && data) {
      setCollection(data);
      hitungStats(data);
    }
  };

  const hitungStats = (data) => {
    const beli = data.reduce(
      (acc, curr) => acc + (curr.acquired_price || 0),
      0,
    );
    const sekarang = data.reduce(
      (acc, curr) => acc + (curr.cards?.market_price || 0),
      0,
    );
    setStats({ totalBeli: beli, totalSekarang: sekarang });
  };

  const deleteCard = async (id) => {
    const confirmDelete = window.confirm("Yakin ingin menghapus kartu ini?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("user_collections")
      .delete()
      .eq("id", id);

    if (!error) {
      const updated = collection.filter((item) => item.id !== id);
      setCollection(updated);
      hitungStats(updated);
    }
  };

  // Data grafik: Membandingkan Modal vs Market per kartu
  const chartData = collection.map((item) => ({
    name: item.cards?.name.substring(0, 10),
    Modal: item.acquired_price || 0,
    Market: item.cards?.market_price || 0,
  }));

  const profit = stats.totalSekarang - stats.totalBeli;

  return (
    <div
      style={{
        padding: "30px",
        color: "white",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: "25px" }}>📊 Portfolio Sultan</h1>

      {/* --- STAT CARDS --- */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>MODAL AWAL</p>
          <h2 style={styles.statValue}>${stats.totalBeli.toFixed(2)}</h2>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>MARKET VALUE</p>
          <h2 style={styles.statValue}>${stats.totalSekarang.toFixed(2)}</h2>
        </div>
        <div
          style={{
            ...styles.statCard,
            borderLeft: `4px solid ${profit >= 0 ? "#10b981" : "#ef4444"}`,
          }}
        >
          <p style={styles.statLabel}>PROFIT / LOSS</p>
          <h2
            style={{
              ...styles.statValue,
              color: profit >= 0 ? "#10b981" : "#ef4444",
            }}
          >
            {profit >= 0 ? "▲" : "▼"} ${Math.abs(profit).toFixed(2)}
          </h2>
        </div>
      </div>

      {/* --- GRAFIK GARIS NAIK (AREA CHART) --- */}
      <div style={styles.chartSection}>
        <h3 style={{ marginBottom: "20px", color: "#94a3b8" }}>
          💹 Grafik Tren Nilai Koleksi
        </h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "none",
                  borderRadius: "8px",
                }}
              />

              {/* Garis Modal (Biru) */}
              <Area
                type="monotone"
                dataKey="Modal"
                stroke="#3b82f6"
                fillOpacity={0}
                strokeWidth={3}
              />
              {/* Garis Market (Hijau - Yang Naik Ke Atas) */}
              <Area
                type="monotone"
                dataKey="Market"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorMarket)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- GRID KOLEKSI --- */}
      <div style={styles.grid}>
        {collection.map((item) => (
          <div key={item.id} style={styles.cardWrapper}>
            <div style={{ position: "relative" }}>
              <img
                src={item.cards?.image_small}
                style={styles.cardImage}
                alt=""
              />
              <button
                onClick={() => deleteCard(item.id)}
                style={styles.deleteBtn}
              >
                ✕
              </button>
              {item.is_graded && (
                <div style={styles.psaBadge}>PSA {item.grade_value}</div>
              )}
            </div>
            <div style={{ padding: "15px" }}>
              <h4 style={{ margin: "0 0 10px 0" }}>{item.cards?.name}</h4>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: "#64748b" }}>
                  Beli: ${item.acquired_price}
                </span>
                <span style={{ color: "#10b981", fontWeight: "bold" }}>
                  Mkt: ${item.cards?.market_price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #334155",
  },
  statLabel: {
    fontSize: "10px",
    color: "#94a3b8",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  statValue: { margin: 0, fontSize: "26px", fontWeight: "bold" },
  chartSection: {
    background: "#1e293b",
    padding: "25px",
    borderRadius: "15px",
    border: "1px solid #334155",
    marginBottom: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
  },
  cardWrapper: {
    background: "#0f172a",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #1e293b",
    position: "relative",
  },
  cardImage: { width: "100%", display: "block" },
  psaBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#2563eb",
    color: "white",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "bold",
  },
  deleteBtn: {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "rgba(239, 68, 68, 0.9)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "25px",
    height: "25px",
    cursor: "pointer",
    zIndex: 10,
  },
};

export default MyCollection;
