import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const App = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Siap mencari...");
  const [searchId, setSearchId] = useState("neo2-1"); // Default Espeon

  const fetchData = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      setStatus("Mengecek Database...");

      // 1. Cek Supabase
      const { data: dbData } = await supabase
        .from("cards")
        .select("*")
        .eq("id", id.toLowerCase())
        .single();

      if (dbData) {
        setCard(dbData.full_json);
        setStatus("Data ditemukan di Supabase!");
        setLoading(false);
        return;
      }

      // 2. Ambil dari API jika di DB kosong
      setStatus("Mengambil dari API Pokémon...");
      const res = await fetch(
        `https://api.pokemontcg.io/v2/cards/${id.toLowerCase()}`,
        {
          headers: {
            "X-Api-Key": import.meta.env.VITE_POKEMON_API_KEY,
            Accept: "application/json",
          },
        },
      );

      if (!res.ok)
        throw new Error(`Kartu tidak ditemukan (Error: ${res.status})`);

      const result = await res.json();
      const cardData = result.data;

      // 3. Simpan ke Supabase
      await supabase.from("cards").upsert([
        {
          id: cardData.id,
          name: cardData.name,
          image_url: cardData.images.large,
          full_json: cardData,
        },
      ]);

      setCard(cardData);
      setStatus("Berhasil dimuat!");
    } catch (err) {
      console.error(err);
      setStatus(err.message);
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  // Jalankan pencarian pertama kali
  useEffect(() => {
    fetchData("neo2-1");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(searchId);
  };

  return (
    <div style={styles.container}>
      {/* Search Bar Section */}
      <div style={styles.searchSection}>
        <form onSubmit={handleSearch} style={styles.form}>
          <input
            type="text"
            placeholder="Masukkan ID Kartu (contoh: e1-7 atau base1-4)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Cari Kartu
          </button>
        </form>
        <p style={styles.status}>{status}</p>
      </div>

      {loading ? (
        <div style={styles.center}>🔄 Sedang memproses...</div>
      ) : (
        card && (
          <div className="card-box" style={styles.cardBox}>
            <div style={styles.header}>
              <h1 style={styles.title}>{card.name}</h1>
              <span style={styles.hp}>HP {card.hp}</span>
            </div>

            <img src={card.images.large} alt={card.name} style={styles.img} />

            <p style={styles.subInfo}>
              {card.subtypes?.join(" ")} - {card.supertype}
            </p>

            <p style={styles.flavor}>
              "{card.flavorText || "Tidak ada deskripsi cerita."}"
            </p>

            {/* Attacks Section */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Attacks</h3>
              {card.attacks?.map((atk, i) => (
                <div key={i} style={styles.attackItem}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>{atk.name}</strong>
                    <span>{atk.damage}</span>
                  </div>
                  <p style={styles.attackText}>{atk.text}</p>
                </div>
              ))}
            </div>

            {/* Harga Pasar Dinamis */}
            <div style={styles.price}>
              Market Price: $
              {card.tcgplayer?.prices?.unlimitedHolofoil?.market ||
                card.tcgplayer?.prices?.holofoil?.market ||
                card.tcgplayer?.prices?.normal?.market ||
                "N/A"}
            </div>
          </div>
        )
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#020617",
    minHeight: "100vh",
    color: "white",
    padding: "40px",
    fontFamily: "sans-serif",
  },
  searchSection: {
    maxWidth: "400px",
    margin: "0 auto 30px",
    textAlign: "center",
  },
  form: { display: "flex", gap: "10px" },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "white",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#10b981",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  center: { textAlign: "center", marginTop: "50px" },
  status: { fontSize: "0.8rem", color: "#94a3b8", marginTop: "10px" },
  cardBox: {
    maxWidth: "400px",
    margin: "0 auto",
    backgroundColor: "#0f172a",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  title: { color: "#fb7185", margin: 0, fontSize: "1.8rem" },
  hp: { color: "#f43f5e", fontWeight: "bold" },
  img: {
    width: "100%",
    borderRadius: "10px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
  },
  subInfo: {
    fontSize: "0.7rem",
    color: "#94a3b8",
    textAlign: "center",
    margin: "10px 0",
  },
  flavor: {
    fontStyle: "italic",
    color: "#64748b",
    fontSize: "0.85rem",
    margin: "15px 0",
    textAlign: "center",
  },
  section: { marginTop: "20px", textAlign: "left" },
  sectionTitle: {
    fontSize: "0.9rem",
    color: "#10b981",
    borderBottom: "1px solid #334155",
    paddingBottom: "5px",
  },
  attackItem: {
    backgroundColor: "#1e293b",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "8px",
  },
  attackText: { fontSize: "0.75rem", color: "#cbd5e1", margin: "5px 0 0" },
  price: {
    marginTop: "20px",
    backgroundColor: "#4f46e5",
    padding: "12px",
    borderRadius: "10px",
    fontWeight: "bold",
    textAlign: "center",
  },
};

export default App;
