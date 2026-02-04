import React, { useState, useEffect } from "react";
import gsap from "gsap";

const App = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = import.meta.env.VITE_POKEMON_API_KEY;
  const PALKIA_ID = "swsh12pt5gg-GG67";

  const fetchWithTimeout = async (url, options, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  };

  const fetchCardData = async (id, attempt = 1) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.pokemontcg.io/v2/cards/${id}`;
      const res = await fetchWithTimeout(url, {
        method: "GET",
        headers: {
          "X-Api-Key": API_KEY,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const result = await res.json();
      setCard(result.data);
    } catch (err) {
      if (attempt < 3) {
        console.log(`Percobaan ${attempt} gagal, mencoba lagi...`);
        setTimeout(() => fetchCardData(id, attempt + 1), 2000);
      } else {
        setError(
          "Server API sedang sibuk (504). Coba refresh beberapa saat lagi.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardData(PALKIA_ID);
  }, []);

  useEffect(() => {
    if (card) {
      gsap.fromTo(
        ".palkia-card",
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1 },
      );
    }
  }, [card]);

  return (
    <div style={styles.container}>
      <h1 style={{ color: "#fb7185" }}>Palkia VSTAR Live Tracker</h1>
      {loading && <p>Menghubungkan ke database Pokémon...</p>}
      {error && <p style={styles.errorText}>{error}</p>}
      {card && (
        <div className="palkia-card" style={styles.card}>
          <img
            src={card.images.large}
            alt={card.name}
            style={{ width: "100%", borderRadius: "15px" }}
          />
          <h2>{card.name}</h2>
          <div style={styles.priceTag}>
            Market Price: ${card.tcgplayer?.prices?.holofoil?.market || "N/A"}
          </div>
          <button onClick={() => fetchCardData(PALKIA_ID)} style={styles.btn}>
            Cek Ulang Harga
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
    maxWidth: "380px",
  },
  priceTag: {
    backgroundColor: "#4f46e5",
    padding: "15px",
    borderRadius: "12px",
    fontWeight: "bold",
    margin: "20px 0",
    fontSize: "1.2rem",
  },
  btn: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
    width: "100%",
    fontWeight: "bold",
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
    padding: "10px",
    border: "1px solid #ef4444",
    borderRadius: "8px",
  },
};

export default App;
