import React, { useState, useEffect } from "react";
import gsap from "gsap";

const App = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mengambil API Key dari "Settings > Environment Variables" di Vercel
  // Pastikan namanya sama persis: VITE_POKEMON_API_KEY
  const API_KEY = import.meta.env.VITE_POKEMON_API_KEY;
  const PALKIA_ID = "swsh12pt5gg-GG67";

  const fetchSingleCard = async (id) => {
    setLoading(true);
    setError(null);
    try {
      // Menembak langsung ke API resmi tanpa proxy pihak ketiga
      const url = `https://api.pokemontcg.io/v2/cards/${id}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-Api-Key": API_KEY, // Key rahasia kamu
          Accept: "application/json",
        },
      });

      // Jika server memberikan error 504 atau 403, ini akan menangkapnya
      if (!res.ok) {
        throw new Error(`Server Error: ${res.status}. Cek API Key di Vercel.`);
      }

      const result = await res.json();
      setCard(result.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(
        "Gagal memuat kartu. Pastikan API Key benar dan Redeploy di Vercel.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Memuat kartu secara otomatis saat aplikasi dibuka
  useEffect(() => {
    fetchSingleCard(PALKIA_ID);
  }, []);

  // Animasi GSAP agar kartu muncul dengan efek "Pop"
  useEffect(() => {
    if (card) {
      gsap.fromTo(
        ".palkia-box",
        { opacity: 0, scale: 0.8, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" },
      );
    }
  }, [card]);

  return (
    <div style={styles.container}>
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={styles.title}>Palkia VSTAR Live Tracker</h1>
        <p style={{ color: "#94a3b8" }}>Data Real-time dari Pokémon TCG API</p>
      </header>

      {loading && (
        <div style={{ textAlign: "center", color: "#fb7185" }}>
          <p>Sedang memanggil Palkia dari server...</p>
        </div>
      )}

      {error && <div style={styles.errorBox}>{error}</div>}

      {card && (
        <div className="palkia-box" style={styles.card}>
          <img src={card.images.large} alt={card.name} style={styles.img} />
          <h2 style={{ margin: "15px 0 5px 0", fontSize: "1.8rem" }}>
            {card.name}
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
            {card.set.name} • {card.rarity}
          </p>

          <div style={styles.priceTag}>
            Market Price: ${card.tcgplayer?.prices?.holofoil?.market || "N/A"}
          </div>

          <button
            onClick={() => fetchSingleCard(PALKIA_ID)}
            style={styles.refreshBtn}
          >
            Update Harga Terbaru
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontFamily: "sans-serif",
    padding: "20px",
  },
  title: { color: "#fb7185", fontSize: "2.5rem", margin: "0" },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid #ef4444",
    padding: "15px",
    borderRadius: "10px",
    color: "#ef4444",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "30px",
    borderRadius: "25px",
    textAlign: "center",
    border: "1px solid #334155",
    maxWidth: "400px",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  img: {
    width: "100%",
    borderRadius: "15px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
  },
  priceTag: {
    backgroundColor: "#4f46e5",
    padding: "15px",
    borderRadius: "12px",
    fontSize: "1.4rem",
    fontWeight: "bold",
    margin: "20px 0",
  },
  refreshBtn: {
    marginTop: "10px",
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#10b981",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "transform 0.2s",
  },
};

export default App;
