import React, { useState, useEffect } from "react";
import gsap from "gsap";

const App = () => {
  const [cards, setCards] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mengambil API Key dari Environment Variable Vercel
  const API_KEY = import.meta.env.VITE_POKEMON_API_KEY;

  const initialIds = [
    "sv4pt5-232",
    "sv4pt5-233",
    "sv4pt5-234",
    "swsh12pt5gg-GG67",
  ];

  const fetchCard = async (id) => {
    const url = `https://api.pokemontcg.io/v2/cards/${id}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": API_KEY,
        Accept: "application/json",
      },
    });

    if (!res.ok) throw new Error(`Gagal memuat ${id}`);
    const result = await res.json();
    return result.data;
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const loadedCards = [];
        // Menggunakan for-of agar request dikirim satu per satu (mencegah error 504)
        for (const id of initialIds) {
          const data = await fetchCard(id);
          loadedCards.push(data);
          setCards([...loadedCards]); // Update UI setiap satu kartu selesai dimuat
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Koneksi Timeout. Pastikan API Key di Vercel sudah benar.");
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
      alert("ID tidak ditemukan atau server sibuk.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cards.length > 0) {
      gsap.fromTo(
        ".pokemon-card",
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          stagger: 0.1,
          duration: 0.5,
          ease: "power1.out",
        },
      );
    }
  }, [cards]);

  return (
    <div style={styles.container}>
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#fb7185" }}>Pokémon Tracker Pro</h1>
        <p style={{ color: "#94a3b8" }}>Sequential Loading • Anti-Timeout</p>
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
          Memproses data kartu...
        </div>
      )}
      {error && (
        <div style={{ textAlign: "center", color: "#ef4444" }}>{error}</div>
      )}

      <div style={styles.grid}>
        {cards.map((card, i) => (
          <div key={card.id + i} className="pokemon-card" style={styles.card}>
            <img
              src={card.images.small}
              alt={card.name}
              style={{ width: "100%", borderRadius: "10px" }}
            />
            <h3>{card.name}</h3>
            <div style={styles.priceTag}>
              Price: ${card.tcgplayer?.prices?.holofoil?.market || "N/A"}
            </div>
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
  searchForm: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "40px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "white",
    width: "250px",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#10b981",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "15px",
    borderRadius: "15px",
    border: "1px solid #334155",
    textAlign: "center",
  },
  priceTag: {
    backgroundColor: "#4f46e5",
    padding: "8px",
    borderRadius: "8px",
    fontWeight: "bold",
    margin: "10px 0",
  },
};

export default App;
