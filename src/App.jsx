import React, { useState, useEffect } from "react";
import gsap from "gsap";

const App = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mengambil API Key dari Environment Variable Vercel
  const API_KEY = import.meta.env.VITE_POKEMON_API_KEY;
  const PALKIA_ID = "swsh12pt5gg-GG67";

  const fetchCardData = async (id) => {
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

      if (!res.ok) throw new Error(`Gagal memuat data (Status: ${res.status})`);

      const result = await res.json();
      setCard(result.data);
    } catch (err) {
      console.error(err);
      setError("Koneksi Timeout atau API Key salah. Cek Settings Vercel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardData(PALKIA_ID);
  }, []);

  // Animasi GSAP agar tampilan profesional
  useEffect(() => {
    if (card) {
      gsap.fromTo(
        ".palkia-container",
        { opacity: 0, scale: 0.8, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
        },
      );
    }
  }, [card]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Origin Forme Palkia Tracker</h1>

      {loading && (
        <p style={styles.statusText}>Sedang memanggil data Palkia...</p>
      )}
      {error && <p style={styles.errorText}>{error}</p>}

      {card && (
        <div className="palkia-container" style={styles.cardBox}>
          {/* Gambar kartu beresolusi tinggi */}
          <img src={card.images.large} alt={card.name} style={styles.cardImg} />

          <h2 style={{ margin: "10px 0" }}>{card.name}</h2>
          <p style={{ color: "#94a3b8" }}>
            {card.set.name} • {card.rarity}
          </p>

          <div style={styles.priceContainer}>
            <span style={{ fontSize: "0.9rem", display: "block" }}>
              Market Price
            </span>
            <span style={{ fontSize: "2rem" }}>
              ${card.tcgplayer?.prices?.holofoil?.market || "N/A"}
            </span>
          </div>

          <button onClick={() => fetchCardData(PALKIA_ID)} style={styles.btn}>
            Cek Harga Terbaru
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
  title: {
    color: "#fb7185",
    marginBottom: "30px",
    fontSize: "2.2rem",
    textAlign: "center",
  },
  statusText: { color: "#fb7185", fontWeight: "bold" },
  errorText: {
    color: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: "10px",
    borderRadius: "8px",
  },
  cardBox: {
    backgroundColor: "#1e293b",
    padding: "30px",
    borderRadius: "25px",
    border: "1px solid #334155",
    textAlign: "center",
    maxWidth: "400px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  cardImg: { width: "100%", borderRadius: "15px", marginBottom: "15px" },
  priceContainer: {
    backgroundColor: "#4f46e5",
    padding: "15px",
    borderRadius: "15px",
    fontWeight: "bold",
    margin: "20px 0",
  },
  btn: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  },
};

export default App;
