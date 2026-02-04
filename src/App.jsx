import React, { useState, useEffect } from "react";
import gsap from "gsap";

const App = () => {
  const [cards, setCards] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = "3c8fed90-404a-4db8-8fe0-e99ad48c82d7";

  // Daftar ID yang ingin ditampilkan saat aplikasi pertama kali dibuka
  const initialIds = [
    "sv4pt5-232",
    "sv4pt5-233",
    "sv4pt5-234",
    "swsh12pt5gg-GG67",
  ];

  const fetchCard = async (id) => {
    // Menggunakan proxy untuk stabilitas koneksi di localhost
    const proxy = "https://api.allorigins.win/get?url=";
    const target = encodeURIComponent(
      `https://api.pokemontcg.io/v2/cards/${id}`,
    );

    const res = await fetch(`${proxy}${target}`, {
      headers: { "X-Api-Key": API_KEY },
    });

    if (!res.ok) throw new Error(`Kartu ${id} tidak ditemukan`);

    const json = await res.json();
    const data = JSON.parse(json.contents).data;

    if (!data) throw new Error("Data kartu kosong");
    return data;
  };

  useEffect(() => {
    const loadInitialCards = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = initialIds.map((id) => fetchCard(id));
        const results = await Promise.all(promises);
        setCards(results);
      } catch (err) {
        setError("Gagal memuat koleksi awal. Cek koneksi internet kamu.");
      } finally {
        setLoading(false);
      }
    };
    loadInitialCards();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId) return;

    setLoading(true);
    try {
      const newCard = await fetchCard(searchId);
      // Masukkan kartu hasil pencarian ke urutan paling depan
      setCards((prev) => [newCard, ...prev]);
      setSearchId("");
    } catch (err) {
      alert(
        "ID Kartu tidak ditemukan! Pastikan format benar (contoh: sv4pt5-234)",
      );
    } finally {
      setLoading(false);
    }
  };

  // Animasi GSAP agar kartu muncul dengan efek smooth
  useEffect(() => {
    if (cards.length > 0) {
      gsap.fromTo(
        ".card-node",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 },
      );
    }
  }, [cards]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Live Pokémon TCG Tracker</h1>

      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          style={styles.input}
          placeholder="Masukkan ID (e.g. sv4pt5-234)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button type="submit" style={styles.button}>
          Cari
        </button>
      </form>

      {error && <p style={styles.errorText}>{error}</p>}
      {loading && (
        <p style={{ textAlign: "center" }}>Menghubungkan ke API...</p>
      )}

      <div style={styles.grid}>
        {cards.map((card, index) => (
          <div
            key={`${card.id}-${index}`}
            className="card-node"
            style={styles.cardBox}
          >
            <img
              src={card.images.small}
              alt={card.name}
              style={styles.cardImg}
            />
            <h3 style={styles.cardName}>{card.name}</h3>
            <p style={styles.cardInfo}>Set: {card.set.name}</p>
            <div style={styles.priceTag}>
              Market Price: ${card.tcgplayer?.prices?.holofoil?.market || "N/A"}
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
    padding: "40px",
    color: "white",
    fontFamily: "Arial, sans-serif",
  },
  title: { textAlign: "center", color: "#fb7185", marginBottom: "30px" },
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  cardBox: {
    backgroundColor: "#1e293b",
    padding: "15px",
    borderRadius: "16px",
    textAlign: "center",
    border: "1px solid #334155",
  },
  cardImg: { width: "100%", borderRadius: "8px", marginBottom: "12px" },
  cardName: { fontSize: "1.1rem", marginBottom: "5px" },
  cardInfo: { color: "#94a3b8", fontSize: "0.9rem", marginBottom: "10px" },
  priceTag: {
    backgroundColor: "#4f46e5",
    padding: "8px",
    borderRadius: "8px",
    fontWeight: "bold",
  },
  errorText: { color: "#ef4444", textAlign: "center", fontWeight: "bold" },
};

export default App;
