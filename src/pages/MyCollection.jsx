import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MyCollection = ({ session }) => {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBeli: 0,
    totalSekarang: 0,
    persen: 0,
  });

  useEffect(() => {
    if (session) fetchMyCards();
  }, [session]);

  const fetchMyCards = async () => {
    setLoading(true);
    // Kita panggil relasi cards(*) karena tabel user_collections baru kita bersih (hanya ID)
    const { data, error } = await supabase
      .from("user_collections")
      .select(
        `
        *,
        cards (
          name,
          image_small,
          market_price,
          cardmarket_trend_price
        )
      `,
      )
      .eq("user_id", session.user.id);

    if (!error && data) {
      setCollection(data);
      hitungStats(data);
    }
    setLoading(false);
  };

  const hitungStats = (data) => {
    const beli = data.reduce(
      (acc, curr) => acc + (curr.acquired_price || 0),
      0,
    );
    const sekarang = data.reduce(
      (acc, curr) =>
        acc +
        (curr.cards?.market_price || curr.cards?.cardmarket_trend_price || 0),
      0,
    );

    const selisih = sekarang - beli;
    const persen = beli > 0 ? (selisih / beli) * 100 : 0;

    setStats({ totalBeli: beli, totalSekarang: sekarang, persen: persen });
  };

  const deleteCard = async (id) => {
    const confirmDelete = window.confirm("Hapus kartu ini dari portfolio?");
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

  // Data grafik: Memetakan modal vs harga market sekarang
  const chartData = collection.map((item) => ({
    name: item.cards?.name ? item.cards.name.substring(0, 8) + ".." : "Unknown",
    Modal: item.acquired_price || 0,
    Market: item.cards?.market_price || item.cards?.cardmarket_trend_price || 0,
  }));

  const profit = stats.totalSekarang - stats.totalBeli;
  const isProfit = profit >= 0;

  if (loading)
    return (
      <div
        style={{
          padding: "100px",
          textAlign: "center",
          color: "white",
          fontSize: "20px",
        }}
      >
        🚀 Membuka Brankas Sultan...
      </div>
    );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "bold" }}>
            📈 Portfolio Investasi
          </h1>
          <p style={{ color: "#94a3b8", margin: "8px 0 0 0" }}>
            Pantau pertumbuhan nilai koleksi kartu kamu
          </p>
        </div>
      </header>

      {/* --- STAT CARDS --- */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>MODAL INVESTASI</p>
          <h2 style={styles.statValue}>${stats.totalBeli.toLocaleString()}</h2>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            Uang Keluar
          </span>
        </div>

        <div style={styles.statCard}>
          <p style={styles.statLabel}>MARKET VALUE</p>
          <h2 style={{ ...styles.statValue, color: "#3b82f6" }}>
            ${stats.totalSekarang.toLocaleString()}
          </h2>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            Estimasi Saat Ini
          </span>
        </div>

        <div
          style={{
            ...styles.statCard,
            borderBottom: `4px solid ${isProfit ? "#10b981" : "#ef4444"}`,
          }}
        >
          <p style={styles.statLabel}>ESTIMASI PROFIT</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <h2
              style={{
                ...styles.statValue,
                color: isProfit ? "#10b981" : "#ef4444",
              }}
            >
              {isProfit ? "+" : ""}${profit.toLocaleString()}
            </h2>
            <span
              style={{
                fontWeight: "bold",
                color: isProfit ? "#10b981" : "#ef4444",
              }}
            >
              ({stats.persen.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* --- AREA CHART SECTION --- */}
      <div style={styles.chartSection}>
        <h3
          style={{ marginBottom: "25px", fontSize: "18px", color: "#94a3b8" }}
        >
          Grafik Performa Portfolio
        </h3>
        <div style={{ width: "100%", height: 350 }}>
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
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                }}
                itemStyle={{ fontSize: "12px" }}
              />
              <Area
                type="monotone"
                dataKey="Market"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMarket)"
              />
              <Area
                type="monotone"
                dataKey="Modal"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="none"
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.chartLegend}>
          <span style={{ color: "#3b82f6" }}>● Modal Beli</span>
          <span style={{ color: "#10b981" }}>● Harga Pasar Sekarang</span>
        </div>
      </div>

      {/* --- ASSET LIST --- */}
      <h3 style={{ marginBottom: "25px", fontSize: "22px" }}>
        Rincian Koleksi
      </h3>
      <div style={styles.grid}>
        {collection.map((item) => {
          const currentPrice =
            item.cards?.market_price || item.cards?.cardmarket_trend_price || 0;
          const itemProfit = currentPrice - item.acquired_price;

          return (
            <div key={item.id} style={styles.assetCard}>
              <div style={styles.imgContainer}>
                <img
                  src={item.cards?.image_small}
                  style={styles.assetImg}
                  alt={item.cards?.name}
                />
              </div>
              <div style={styles.assetInfo}>
                <h4 style={styles.assetName}>
                  {item.cards?.name || "Unknown Card"}
                </h4>
                <div style={styles.priceRow}>
                  <div style={styles.priceCol}>
                    <span style={styles.priceLabel}>BELI</span>
                    <span style={{ color: "white", fontWeight: "bold" }}>
                      ${item.acquired_price}
                    </span>
                  </div>
                  <div style={styles.priceCol}>
                    <span style={styles.priceLabel}>PROFIT</span>
                    <span
                      style={{
                        color: itemProfit >= 0 ? "#10b981" : "#ef4444",
                        fontWeight: "bold",
                      }}
                    >
                      {itemProfit >= 0 ? "+" : ""}${itemProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteCard(item.id)}
                  style={styles.sellBtn}
                >
                  Hapus dari Portfolio
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    maxWidth: "1200px",
    margin: "0 auto",
    color: "white",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    marginBottom: "50px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
    marginBottom: "50px",
  },
  statCard: {
    background: "#1e293b",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid #334155",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  },
  statLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "800",
    marginBottom: "12px",
    letterSpacing: "1.5px",
  },
  statValue: { margin: 0, fontSize: "36px", fontWeight: "800" },
  chartSection: {
    background: "#1e293b",
    padding: "35px",
    borderRadius: "24px",
    border: "1px solid #334155",
    marginBottom: "50px",
  },
  chartLegend: {
    display: "flex",
    gap: "30px",
    justifyContent: "center",
    marginTop: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "30px",
  },
  assetCard: {
    background: "#0f172a",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid #1e293b",
    transition: "transform 0.2s ease-in-out",
    ":hover": { transform: "translateY(-5px)" },
  },
  imgContainer: {
    background: "#1e293b",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
  },
  assetImg: {
    width: "100%",
    height: "240px",
    objectFit: "contain",
  },
  assetInfo: { padding: "20px" },
  assetName: {
    margin: "0 0 15px 0",
    fontSize: "16px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  priceCol: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  priceLabel: {
    fontSize: "10px",
    color: "#64748b",
    fontWeight: "bold",
  },
  sellBtn: {
    width: "100%",
    padding: "10px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid #ef4444",
    color: "#ef4444",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold",
    transition: "0.2s",
  },
};

export default MyCollection;
