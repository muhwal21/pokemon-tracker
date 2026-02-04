import React, { useState, useEffect } from "react";
import gsap from "gsap";

const App = () => {
  const [cards, setCards] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Daftar ID kartu awal (termasuk Palkia favoritmu)
  const initialIds = [
    "sv4pt5-232",
    "sv4pt5-233",
    "sv4pt5-234",
    "swsh12pt5gg-GG67",
  ];

  const fetchCard = async (id) => {
    // Menembak langsung ke API resmi
    const url = `https://api.pokemontcg.io/v2/cards/${id}`;

    const res = await fetch(url, {
      method: "GET",
      // Kita coba tanpa API Key dulu untuk mengetes apakah koneksi dasar diizinkan
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) throw new Error("Gagal mengambil data dari server");

    const result = await res.json();
    return result.data;
  };

  // Mengambil data kartu saat pertama kali dibuka
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = initialIds.map((id) => fetchCard(id));
        const results = await Promise.all(promises);
        setCards(results);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Gagal memuat koleksi. Coba gunakan VPN atau Paket Data HP.");
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, []);

  // Fungsi untuk mencari kartu berdasarkan ID manual
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

  // Animasi GSAP agar kartu muncul dengan efek smooth
  useEffect(() => {
    if (cards.length > 0) {
      gsap.fromTo(
        ".pokemon-card",
        { opacity: 0, scale: 0.9, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.6,
          ease: "power2.out",
        },
      );
    }
  }, [cards]);

  return (
    <div style={styles.container}>
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={styles.title}>Pokémon Tracker Pro</h1>
        <p style={{ color: "#94a3b8" }}>Murni API • Testing Koneksi Langsung</p>
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
          Sedang memanggil data Pokémon...
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
            <h3 style={{ margin: "15px 0 5px 0" }}>{card.name}</h3>
            <div style={styles.priceTag}>
              Market Price: ${card.tcgplayer?.prices?.holofoil?.market || "N/A"}
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
