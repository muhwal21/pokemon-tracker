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
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-Api-Key": API_KEY,
          Accept: "application/json",
        },
      });

      if (!res.ok)
        throw new Error("Gagal memuat kartu. Cek API Key di Vercel.");
      const result = await res.json();
      setCard(result.data);
    } catch (err) {
      setError(err.message);
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
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
      );
    }
  }, [card]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Pokémon Single Tracker</h1>

      {loading && <p>Mencari Palkia VSTAR di server...</p>}
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}

      {card && (
        <div className="palkia-box" style={styles.card}>
          <img src={card.images.large} alt={card.name} style={styles.img} />
          <h2 style={{ color: "#fb7185" }}>{card.name}</h2>
          <div style={styles.priceTag}>
            Market Price: ${card.tcgplayer?.prices?.holofoil?.market || "N/A"}
          </div>
          <p style={{ color: "#94a3b8" }}>
            {card.set.name} • {card.rarity}
          </p>
          <button
            onClick={() => fetchSingleCard(PALKIA_ID)}
            style={styles.refreshBtn}
          >
            Update Harga
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
  title: { marginBottom: "30px", color: "#fb7185" },
  card: {
    backgroundColor: "#1e293b",
    padding: "30px",
    borderRadius: "20px",
    textAlign: "center",
    border: "1px solid #334155",
    maxWidth: "400px",
  },
  img: {
    width: "100%",
    borderRadius: "15px",
    marginBottom: "20px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
  },
  priceTag: {
    backgroundColor: "#4f46e5",
    padding: "15px",
    borderRadius: "12px",
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: "20px 0",
  },
  refreshBtn: {
    marginTop: "15px",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#10b981",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default App;
