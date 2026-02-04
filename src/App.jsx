import React, { useState, useEffect } from "react";
import gsap from "gsap";

const App = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mengambil API Key dari Environment Variable Vercel
  const API_KEY = import.meta.env.VITE_POKEMON_API_KEY;
  const PALKIA_ID = "swsh12pt5gg-GG67";

  const fetchSingleCard = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.pokemontcg.io/v2/cards/${id}`;

      // Menghapus header kustom yang sering memicu kegagalan Preflight CORS
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-Api-Key": API_KEY,
        },
      });

      if (!res.ok)
        throw new Error("Gagal memuat kartu. Cek API Key di Vercel.");
      const result = await res.json();
      setCard(result.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        "CORS atau Koneksi diblokir browser. Coba buka di HP dengan Paket Data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSingleCard(PALKIA_ID);
  }, []);

  useEffect(() => {
    if (card) {
      gsap.fromTo(
        ".palkia-box",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
      );
    }
  }, [card]);

  return (
    <div style={styles.container}>
      <h1 style={{ color: "#fb7185" }}>Palkia VSTAR Tracker</h1>

      {loading && <p>Menghubungi Server...</p>}
      {error && <p style={{ color: "#ef4444", fontWeight: "bold" }}>{error}</p>}

      {card && (
        <div className="palkia-box" style={styles.card}>
          <img
            src={card.images.small}
            alt={card.name}
            style={{ width: "100%", borderRadius: "10px" }}
          />
          <h2>{card.name}</h2>
          <div style={styles.priceTag}>
            Market: ${card.tcgplayer?.prices?.holofoil?.market || "N/A"}
          </div>
          <p>{card.set.name}</p>
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
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "20px",
    textAlign: "center",
    border: "1px solid #334155",
    width: "300px",
  },
  priceTag: {
    backgroundColor: "#4f46e5",
    padding: "10px",
    borderRadius: "10px",
    fontWeight: "bold",
    margin: "15px 0",
  },
};

export default App;
