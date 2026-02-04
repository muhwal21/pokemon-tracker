import React, { useState, useEffect } from "react";
import gsap from "gsap";

const App = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = import.meta.env.VITE_POKEMON_API_KEY;
  const PALKIA_ID = "neo2-1";

  // Pastikan nama fungsi ini konsisten
  const fetchCardData = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const cleanId = id.trim();
      const url = `https://api.pokemontcg.io/v2/cards/${cleanId}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-Api-Key": API_KEY,
          Accept: "application/json",
        },
      });

      if (res.status === 404)
        throw new Error("ID Kartu tidak terdaftar di database.");
      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const result = await res.json();
      setCard(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardData(PALKIA_ID); // Sudah diperbaiki panggilannya
  }, []);

  useEffect(() => {
    if (card) {
      gsap.fromTo(
        ".palkia-box",
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8 },
      );
    }
  }, [card]);

  return (
    <div style={styles.container}>
      <h1 style={{ color: "#fb7185", textAlign: "center" }}>
        Origin Forme Palkia Tracker
      </h1>

      {loading && <p>Menghubungi Server...</p>}
      {error && (
        <p style={{ color: "#ef4444", textAlign: "center" }}>{error}</p>
      )}

      {card && (
        <div className="palkia-box" style={styles.card}>
          <img src={card.images.large} alt={card.name} style={styles.img} />
          <h2>{card.name}</h2>
          <div style={styles.priceTag}>
            Market Price: ${card.tcgplayer?.prices?.holofoil?.market || "69.54"}
          </div>
          <button onClick={() => fetchCardData(PALKIA_ID)} style={styles.btn}>
            Refresh Harga
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
  card: {
    backgroundColor: "#1e293b",
    padding: "30px",
    borderRadius: "25px",
    textAlign: "center",
    border: "1px solid #334155",
    maxWidth: "350px",
  },
  img: { width: "100%", borderRadius: "15px" },
  priceTag: {
    backgroundColor: "#4f46e5",
    padding: "15px",
    borderRadius: "12px",
    fontWeight: "bold",
    margin: "20px 0",
    fontSize: "1.3rem",
  },
  btn: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
  },
};

export default App;
