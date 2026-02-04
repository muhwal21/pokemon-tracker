import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const App = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Siap mencari...");
  const [searchId, setSearchId] = useState("swsh12pt5gg-GG67");

  const fetchData = async (id) => {
    if (!id) return;
    const cleanId = id.trim().toLowerCase();

    try {
      setLoading(true);
      setStatus("Mengecek Database...");

      // 1. Cek Supabase
      const { data: dbData } = await supabase
        .from("cards")
        .select("*")
        .eq("id", cleanId)
        .single();

      if (dbData) {
        setCard(dbData.full_json);
        setStatus("Data dari Database!");
        setLoading(false);
        return;
      }

      // 2. Ambil dari API jika di DB kosong
      setStatus("Mengambil dari Pokémon API...");
      const res = await fetch(`https://api.pokemontcg.io/v2/cards/${cleanId}`, {
        headers: {
          "X-Api-Key": import.meta.env.VITE_POKEMON_API_KEY,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`Kartu tidak ditemukan (${res.status})`);

      const result = await res.json();
      const cardData = result.data;

      // 3. Simpan ke Supabase dengan Data Lengkap (Agar Kolom Tidak Kosong)
      setStatus("Menyimpan ke Database...");
      await supabase.from("cards").upsert([
        {
          id: cardData.id,
          name: cardData.name,
          image_url: cardData.images.large,
          set_name: cardData.set.name,
          rarity: cardData.rarity,
          market_price:
            cardData.tcgplayer?.prices?.holofoil?.market ||
            cardData.tcgplayer?.prices?.unlimitedHolofoil?.market ||
            cardData.tcgplayer?.prices?.normal?.market ||
            null,
          full_json: cardData,
        },
      ]);

      setCard(cardData);
      setStatus("Selesai!");
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("swsh12pt5gg-GG67");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(searchId);
  };

  return (
    <div style={styles.container}>
      <div style={styles.searchBox}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px" }}>
          <input
            style={styles.input}
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="ID Kartu (e.g. e1-7)"
          />
          <button style={styles.button} type="submit">
            Cari
          </button>
        </form>
        <p style={styles.status}>{status}</p>
      </div>

      {loading ? (
        <div style={styles.center}>🔄 Memproses...</div>
      ) : (
        card && (
          <div style={styles.cardBox}>
            <div style={styles.header}>
              <h1 style={styles.title}>{card.name}</h1>
              <span style={styles.hp}>HP {card.hp}</span>
            </div>
            <img src={card.images.large} alt={card.name} style={styles.img} />
            <p style={styles.flavor}>
              "{card.flavorText || "No flavor text available."}"
            </p>

            <div style={styles.priceSection}>
              <p style={{ margin: 0, fontSize: "0.8rem" }}>Market Price</p>
              <h2 style={{ margin: "5px 0" }}>
                $
                {card.tcgplayer?.prices?.holofoil?.market ||
                  card.tcgplayer?.prices?.unlimitedHolofoil?.market ||
                  card.tcgplayer?.prices?.normal?.market ||
                  "N/A"}
              </h2>
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
  searchBox: { maxWidth: "400px", margin: "0 auto 30px" },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #1e293b",
    backgroundColor: "#0f172a",
    color: "white",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "10px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  status: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    textAlign: "center",
    marginTop: "10px",
  },
  cardBox: {
    maxWidth: "400px",
    margin: "0 auto",
    backgroundColor: "#0f172a",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    textAlign: "center",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  title: { fontSize: "1.5rem", margin: 0, color: "#fb7185" },
  hp: { color: "#f43f5e", fontWeight: "bold" },
  img: { width: "100%", borderRadius: "10px" },
  flavor: {
    fontStyle: "italic",
    color: "#94a3b8",
    fontSize: "0.85rem",
    margin: "20px 0",
  },
  priceSection: {
    backgroundColor: "#4f46e5",
    padding: "15px",
    borderRadius: "15px",
  },
  center: { textAlign: "center", marginTop: "50px" },
};

export default App;
