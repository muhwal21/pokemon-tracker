import React, { useState, useEffect } from "react";
import gsap from "gsap";

const App = () => {
  const [cards, setCards] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API Key kamu untuk stabilitas data
  const API_KEY = "3c8fed90-404a-4db8-8fe0-e99ad48c82d7";

  // ID kartu awal yang akan otomatis muncul saat web dibuka
  const initialIds = [
    "sv4pt5-232",
    "sv4pt5-233",
    "sv4pt5-234",
    "swsh12pt5gg-GG67",
  ];

  const fetchCard = async (id) => {
    // Proxy AllOrigins untuk menembus blokir ISP/CORS di browser
    const proxy = "https://api.allorigins.win/get?url=";
    const target = encodeURIComponent(
      `https://api.pokemontcg.io/v2/cards/${id}`,
    );

    const res = await fetch(`${proxy}${target}`, {
      headers: { "X-Api-Key": API_KEY },
    });

    if (!res.ok) throw new Error("Gagal mengambil data dari API");

    const json = await res.json();
    const data = JSON.parse(json.contents).data;
    return data;
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
        setError(
          "Gagal memuat koleksi. Pastikan internet lancar atau buka via link Vercel.",
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
      alert("ID tidak ditemukan! Contoh format: sv4pt5-234");
    } finally {
      setLoading(false);
    }
  };

  // Efek animasi kartu saat muncul
  useEffect(() => {
    if (cards.length > 0) {
      gsap.fromTo(
        ".card-box",
        { opacity: 0, scale: 0.8, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
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
        <p>Data murni dari API Pokémon TCG</p>
      </header>

      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          style={styles.input}
          placeholder="Masukkan ID (e.g. swsh12pt5gg-GG67)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button type="submit" style={styles.button}>
          Cari Kartu
        </button>
      </form>

      {loading && <div style={styles.loading}>Menghubungkan ke server...</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.grid}>
        {cards.map((card, i) => (
          <div key={card.id + i} className="card-box" style={styles.card}>
            <img src={card.images.small} alt={card.name} style={styles.img} />
            <h3 style={styles.cardName}>{card.name}</h3>
            <div style={styles.priceTag}>
              Market: $
              {card.tcgplayer?.prices?.holofoil?.market ||
                card.tcgplayer?.prices?.normal?.market ||
                "N/A"}
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
    fontFamily: "sans-serif",
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
    padding: "12px",
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
  img: { width: "100%", borderRadius: "10px" },
  cardName: { margin: "15px 0 10px 0", fontSize: "1.2rem" },
  priceTag: {
    backgroundColor: "#4f46e5",
    padding: "10px",
    borderRadius: "10px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  setInfo: { fontSize: "0.8rem", color: "#64748b" },
  loading: { textAlign: "center", color: "#fb7185" },
  error: { textAlign: "center", color: "#ef4444", fontWeight: "bold" },
};

export default App;
