import React, { useState, useEffect } from "react";
import gsap from "gsap";

const App = () => {
  const [cards, setCards] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mengambil API Key dari "Settings" Vercel secara otomatis
  const API_KEY = import.meta.env.VITE_POKEMON_API_KEY;

  // Daftar kartu awal (Mew, Gardevoir, Charizard, & Palkia)
  const initialIds = [
    "sv4pt5-232",
    "sv4pt5-233",
    "sv4pt5-234",
    "swsh12pt5gg-GG67",
  ];

  const fetchCard = async (id) => {
    // Langsung menembak ke API Pokémon tanpa proxy agar tidak kena CORS error di Vercel
    const url = `https://api.pokemontcg.io/v2/cards/${id}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": API_KEY, // Menggunakan key rahasia dari Vercel
        Accept: "application/json",
      },
    });

    if (!res.ok) throw new Error(`Kartu ${id} tidak ditemukan`);

    const result = await res.json();
    return result.data;
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = initialIds.map((id) => fetchCard(id));
        const results = await Promise.all(promises);
        setCards(results);
      } catch (err) {
        console.error(err);
        setError(
          "Gagal memuat data. Pastikan API Key di Vercel sudah benar dan lakukan Redeploy.",
        );
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
      alert("ID tidak ditemukan! Gunakan format: sv4pt5-234");
    } finally {
      setLoading(false);
    }
  };

  // Animasi GSAP agar kartu muncul dengan halus
  useEffect(() => {
    if (cards.length > 0) {
      gsap.fromTo(
        ".pokemon-card",
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
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
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={styles.title}>Pokémon Tracker Pro</h1>
        <p style={{ color: "#94a3b8" }}>Data Real-time • Murni API TCG</p>
      </header>

      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          style={styles.input}
          placeholder="Cari ID (e.g. swsh12pt5gg-GG67)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button type="submit" style={styles.button}>
          Cari
        </button>
      </form>

      {loading && (
        <div style={{ textAlign: "center", color: "#fb7185" }}>
          Menghubungkan ke server...
        </div>
      )}
      {error && (
        <div
          style={{ textAlign: "center", color: "#ef4444", fontWeight: "bold" }}
        >
          {error}
        </div>
      )}

      <div style={styles.grid}>
        {cards.map((card, i) => (
          <div key={card.id + i} className="pokemon-card" style={styles.card}>
            <img
              src={card.images.small}
              alt={card.name}
              style={{ width: "100%", borderRadius: "12px" }}
            />
            <h3 style={{ margin: "15px 0 5px 0", fontSize: "1.2rem" }}>
              {card.name}
            </h3>
            <div style={styles.priceTag}>
              Market Price: $
              {card.tcgplayer?.prices?.holofoil?.market ||
                card.tcgplayer?.prices?.normal?.market ||
                "N/A"}
            </div>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
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
    fontFamily: "sans-serif",
  },
  title: {
    color: "#fb7185",
    fontSize: "2.5rem",
    margin: "0",
    fontWeight: "bold",
  },
  searchForm: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "40px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "white",
    width: "280px",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#10b981",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
  },
  priceTag: {
    backgroundColor: "#4f46e5",
    padding: "10px",
    borderRadius: "10px",
    fontWeight: "bold",
    margin: "12px 0",
  },
};

export default App;
