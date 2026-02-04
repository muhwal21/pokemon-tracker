import React, { useState, useEffect } from "react";
import gsap from "gsap";

const App = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = import.meta.env.VITE_POKEMON_API_KEY;
  const TARGET_ID = "neo2-1"; // ID Kartu Espeon Neo Discovery

  const fetchCardData = async (id) => {
    // 1. Cek Memori Lokal (LocalStorage) agar tidak terkena limit API/CORS berulang kali
    const cachedData = localStorage.getItem(`pokemon-card-${id}`);
    if (cachedData) {
      setCard(JSON.parse(cachedData));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = `https://api.pokemontcg.io/v2/cards/${id}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-Api-Key": API_KEY, // Mengirim API Key di Header
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP Error! Status: ${res.status}`);
      }

      const result = await res.json();

      // 2. Simpan ke Memori Lokal agar loading berikutnya instan
      localStorage.setItem(`pokemon-card-${id}`, JSON.stringify(result.data));
      setCard(result.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("CORS atau Koneksi Timeout. Silakan Redeploy Vercel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardData(TARGET_ID);
  }, []);

  useEffect(() => {
    if (card) {
      gsap.fromTo(
        ".card-box",
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power2.out" },
      );
    }
  }, [card]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Neo Discovery Tracker</h1>

      {loading && <p style={{ color: "#fb7185" }}>Menghubungi Server...</p>}

      {error && <div style={styles.errorBox}>{error}</div>}

      {card && (
        <div className="card-box" style={styles.card}>
          <img src={card.images.large} alt={card.name} style={styles.img} />
          <h2 style={{ margin: "15px 0" }}>{card.name}</h2>
          <p style={{ color: "#94a3b8" }}>
            {card.set.name} • #{card.number}
          </p>

          <div style={styles.priceTag}>
            Market Price: ${card.tcgplayer?.prices?.holofoil?.market || "N/A"}
          </div>

          <button
            onClick={() => {
              localStorage.removeItem(`pokemon-card-${TARGET_ID}`); // Paksa hapus cache
              fetchCardData(TARGET_ID);
            }}
            style={styles.btn}
          >
            Refresh & Update Harga
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
  title: { color: "#fb7185", fontSize: "2rem", marginBottom: "30px" },
  errorBox: {
    border: "1px solid #ef4444",
    padding: "15px",
    borderRadius: "10px",
    color: "#ef4444",
    marginBottom: "20px",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "30px",
    borderRadius: "25px",
    textAlign: "center",
    border: "1px solid #334155",
    maxWidth: "350px",
  },
  img: {
    width: "100%",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
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
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
  },
};

export default App;
