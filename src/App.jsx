import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import gsap from "gsap";

const App = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const TARGET_ID = "neo2-1";

  const getCardData = async (id) => {
    setLoading(true);
    setStatus("Mencari di Database Supabase...");

    // 1. CEK SUPABASE DULU (CS Strategy: Caching)
    const { data: existingCard, error: supabaseError } = await supabase
      .from("cards")
      .select("*")
      .eq("id", id)
      .single();

    if (existingCard) {
      console.log("Data ditemukan di Supabase!");
      setStatus("Data ditemukan di Supabase (Instan!)");
      setCard(existingCard.full_json);
      setLoading(false);
      return;
    }

    // 2. JIKA TIDAK ADA, AMBIL DARI POKEMON API
    setStatus("Database kosong, mengambil dari Pokémon API...");
    try {
      const res = await fetch(`https://api.pokemontcg.io/v2/cards/${id}`, {
        headers: { "X-Api-Key": import.meta.env.VITE_POKEMON_API_KEY },
      });
      const result = await res.json();
      const cardData = result.data;

      // 3. SIMPAN OTOMATIS KE SUPABASE (Data Mirroring)
      const { error: insertError } = await supabase.from("cards").insert([
        {
          id: cardData.id,
          name: cardData.name,
          image_url: cardData.images.large,
          set_name: cardData.set.name,
          market_price:
            cardData.tcgplayer?.prices?.holofoil?.market ||
            cardData.tcgplayer?.prices?.normal?.market ||
            null,
          full_json: cardData, // Simpan JSON lengkap tanpa sisa
        },
      ]);

      if (insertError) console.error("Gagal simpan ke Supabase:", insertError);

      setCard(cardData);
      setStatus("Data baru berhasil disimpan ke Database!");
    } catch (err) {
      console.error("Error Fetching:", err);
      setStatus("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCardData(TARGET_ID);
  }, []);

  useEffect(() => {
    if (card) {
      gsap.fromTo(
        ".card-box",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1 },
      );
    }
  }, [card]);

  return (
    <div style={styles.container}>
      <p style={{ color: "#10b981", fontSize: "0.8rem" }}>Status: {status}</p>

      {loading ? (
        <p>Tunggu sebentar...</p>
      ) : (
        card && (
          <div className="card-box" style={styles.cardWrapper}>
            <div style={styles.header}>
              <img src={card.images.large} alt={card.name} style={styles.img} />
              <div style={styles.mainInfo}>
                <h1>
                  {card.name} <span style={styles.hp}>HP {card.hp}</span>
                </h1>
                <p style={styles.flavor}>{card.flavorText}</p>

                <div style={styles.section}>
                  <h3>Attacks</h3>
                  {card.attacks?.map((atk, i) => (
                    <div key={i} style={styles.atkItem}>
                      <strong>{atk.name}</strong> - {atk.damage || "0"} DMG
                      <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                        {atk.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={styles.priceTag}>
                  Market Price: $
                  {card.tcgplayer?.prices?.holofoil?.market || "N/A"}
                </div>
              </div>
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
  cardWrapper: {
    backgroundColor: "#0f172a",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: { display: "flex", gap: "30px", flexWrap: "wrap" },
  img: {
    width: "300px",
    borderRadius: "15px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  },
  mainInfo: { flex: 1 },
  hp: { color: "#f43f5e", fontSize: "1.2rem" },
  flavor: { fontStyle: "italic", color: "#64748b", margin: "15px 0" },
  section: { marginTop: "20px" },
  atkItem: {
    backgroundColor: "#1e293b",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "10px",
  },
  priceTag: {
    backgroundColor: "#4f46e5",
    padding: "15px",
    borderRadius: "12px",
    fontWeight: "bold",
    marginTop: "20px",
    textAlign: "center",
    fontSize: "1.2rem",
  },
};

export default App;
