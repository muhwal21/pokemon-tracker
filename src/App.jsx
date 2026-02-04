import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import gsap from "gsap";

const App = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Inisialisasi...");

  const TARGET_ID = "neo2-1"; // Espeon Neo Discovery

  const fetchData = async (id) => {
    try {
      setLoading(true);
      setStatus("Mengecek Database Supabase...");

      // 1. Ambil dari Supabase
      const { data: localData, error: dbError } = await supabase
        .from("cards")
        .select("*")
        .eq("id", id)
        .single();

      if (localData) {
        setStatus("Data ditemukan di Supabase (Instan!)");
        setCard(localData.full_json);
        setLoading(false);
        return;
      }

      // 2. Jika tidak ada, ambil dari API Pokémon
      setStatus("Database kosong, mengambil dari Pokémon API...");
      const response = await fetch(`https://api.pokemontcg.io/v2/cards/${id}`, {
        headers: { "X-Api-Key": import.meta.env.VITE_POKEMON_API_KEY },
      });
      const result = await response.json();
      const cardData = result.data;

      // 3. Simpan otomatis ke Supabase agar fetch berikutnya cepat
      setStatus("Menyimpan ke Database...");
      await supabase.from("cards").insert([
        {
          id: cardData.id,
          name: cardData.name,
          image_url: cardData.images.large,
          market_price: cardData.tcgplayer?.prices?.holofoil?.market || null,
          full_json: cardData, // Simpan semua data tanpa tersisa
        },
      ]);

      setCard(cardData);
      setStatus("Data berhasil disinkronkan!");
    } catch (err) {
      console.error(err);
      setStatus("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(TARGET_ID);
  }, []);

  // Animasi GSAP saat kartu muncul
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
      <div style={styles.statusBar}>Status: {status}</div>

      {loading ? (
        <div style={styles.loader}>Memproses Data...</div>
      ) : (
        card && (
          <div className="card-box" style={styles.cardWrapper}>
            <div style={styles.layout}>
              {/* Sisi Kiri: Gambar */}
              <div style={styles.left}>
                <img
                  src={card.images.large}
                  alt={card.name}
                  style={styles.img}
                />
              </div>

              {/* Sisi Kanan: Semua Data Tanpa Sisa */}
              <div style={styles.right}>
                <h1 style={styles.name}>
                  {card.name} <span style={styles.hp}>HP {card.hp}</span>
                </h1>
                <p style={styles.subTitle}>
                  {card.rarity} • {card.artist}
                </p>
                <p style={styles.flavor}>
                  {card.flavorText || "Cerita kartu tidak tersedia."}
                </p>

                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Serangan (Attacks)</h3>
                  {card.attacks?.map((atk, i) => (
                    <div key={i} style={styles.attackItem}>
                      <strong>{atk.name}</strong> - {atk.damage || "0"} DMG
                      <p style={styles.desc}>{atk.text}</p>
                    </div>
                  ))}
                </div>

                <div style={styles.priceTag}>
                  Harga Pasar: $
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
  statusBar: {
    position: "fixed",
    top: 10,
    left: 10,
    fontSize: "0.8rem",
    color: "#10b981",
  },
  loader: { textAlign: "center", marginTop: "100px", fontSize: "1.5rem" },
  cardWrapper: {
    backgroundColor: "#0f172a",
    padding: "30px",
    borderRadius: "24px",
    border: "1px solid #1e293b",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  layout: { display: "flex", gap: "40px", flexWrap: "wrap" },
  left: { flex: 1, minWidth: "300px" },
  right: { flex: 1.5, minWidth: "300px" },
  img: {
    width: "100%",
    borderRadius: "15px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  },
  name: { fontSize: "2.5rem", margin: "0" },
  hp: { color: "#f43f5e", fontSize: "1.2rem" },
  subTitle: { color: "#94a3b8", margin: "10px 0" },
  flavor: {
    fontStyle: "italic",
    color: "#64748b",
    margin: "20px 0",
    borderLeft: "3px solid #334155",
    paddingLeft: "15px",
  },
  section: { marginTop: "30px" },
  sectionTitle: {
    color: "#10b981",
    borderBottom: "1px solid #334155",
    paddingBottom: "5px",
  },
  attackItem: {
    backgroundColor: "#1e293b",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "10px",
  },
  desc: { fontSize: "0.9rem", color: "#94a3b8", marginTop: "5px" },
  priceTag: {
    backgroundColor: "#4f46e5",
    padding: "20px",
    borderRadius: "12px",
    fontWeight: "bold",
    marginTop: "30px",
    textAlign: "center",
    fontSize: "1.5rem",
  },
};

export default App;
