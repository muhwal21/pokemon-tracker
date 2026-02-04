import React, { useState, useEffect } from "react";
import gsap from "gsap";

const App = () => {
  const [cards, setCards] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API Key yang sudah kamu miliki
  const API_KEY = "3c8fed90-404a-4db8-8fe0-e99ad48c82d7";

  // Daftar koleksi awal (Mew, Gardevoir, Charizard, & Palkia)
  const initialIds = [
    "sv4pt5-232",
    "sv4pt5-233",
    "sv4pt5-234",
    "swsh12pt5gg-GG67",
  ];

  const fetchCard = async (id) => {
    const proxy = "https://api.allorigins.win/get?url=";
    const target = encodeURIComponent(
      `https://api.pokemontcg.io/v2/cards/${id}`,
    );

    const res = await fetch(`${proxy}${target}`, {
      headers: { "X-Api-Key": API_KEY },
    });

    if (!res.ok) throw new Error("Gagal mengambil data");

    const json = await res.json();
    const data = JSON.parse(json.contents).data;
    return data;
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const promises = initialIds.map((id) => fetchCard(id));
        const results = await Promise.all(promises);
        setCards(results);
      } catch (err) {
        setError("Koneksi API bermasalah. Coba refresh halaman.");
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId) return;
    setLoading(true);
    try {
      const newCard = await fetchCard(searchId);
      setCards((prev) => [newCard, ...prev]);
      setSearchId("");
    } catch (err) {
      alert("ID tidak ditemukan! Pastikan format benar (contoh: sv4pt5-234)");
    } finally {
      setLoading(false);
    }
  };

  // Animasi GSAP agar tampilan terlihat profesional
  useEffect(() => {
    if (cards.length > 0) {
      gsap.fromTo(
        ".card-box",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          stagger: 0.15,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
      );
    }
  }, [cards]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Pokémon Tracker Pro</h1>
        <p>Real-time Market Price dari API Pokémon TCG</p>
      </header>

      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          style={styles.input}
          placeholder="Cari ID (e.g. sv4pt5-234)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button type="submit" style={styles.button}>
          Cari Kartu
        </button>
      </form>

      {loading && <div style={styles.loading}>Sedang memuat data...</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.grid}>
        {cards.map((card, i) => (
          <div key={card.id + i} className="card-box" style={styles.card}>
            <img src={card.images.small} alt={card.name} style={styles.img} />
            <h3 style={styles.cardName}>{card.name}</h3>
            <div style={styles.priceContainer}>
              <span style={styles.priceLabel}>Market Price:</span>
              <span style={styles.priceValue}>
                $
                {card.tcgplayer?.prices?.holofoil?.market ||
                  card.tcgplayer?.prices?.normal?.market ||
                  "N/A"}
              </span>
            </div>
            <p style={styles.setInfo}>
              {card.set.name} (#{card.number})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    padding: "40px 20px",
    color: "white",
    fontFamily: "Inter, sans-serif",
  },
  header: { textAlign: "center", marginBottom: "40px" },
  title: { color: "#fb7185", fontSize: "2.5rem", margin: "0" },
  searchForm: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "50px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "white",
    width: "280px",
    fontSize: "1rem",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#10b981",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "25px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #334155",
    textAlign: "center",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  },
  img: { width: "100%", borderRadius: "10px", marginBottom: "15px" },
  cardName: { margin: "10px 0", fontSize: "1.2rem" },
  priceContainer: {
    backgroundColor: "#334155",
    padding: "10px",
    borderRadius: "12px",
    margin: "10px 0",
  },
  priceLabel: { display: "block", fontSize: "0.8rem", color: "#94a3b8" },
  priceValue: { fontSize: "1.2rem", fontWeight: "bold", color: "#10b981" },
  setInfo: { fontSize: "0.8rem", color: "#64748b" },
  loading: { textAlign: "center", color: "#fb7185", marginBottom: "20px" },
  error: { textAlign: "center", color: "#ef4444", marginBottom: "20px" },
};

export default App;
