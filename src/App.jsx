import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const App = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Memulai...");

  const fetchData = async () => {
    try {
      setLoading(true);
      setStatus("Mengecek Database...");

      // 1. Cek Supabase
      const { data: dbData } = await supabase
        .from("cards")
        .select("*")
        .eq("id", "neo2-1")
        .single();

      if (dbData) {
        setCard(dbData.full_json);
        setStatus("Data dari Supabase (Cepat!)");
        setLoading(false);
        return;
      }

      // 2. Ambil dari API jika di DB kosong
      setStatus("Mengambil dari API Pokémon...");
      const res = await fetch("https://api.pokemontcg.io/v2/cards/neo2-1", {
        headers: {
          "X-Api-Key": import.meta.env.VITE_POKEMON_API_KEY,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`API Error: ${res.status}`);

      const result = await res.json();
      const cardData = result.data;

      // 3. Simpan ke Supabase agar tidak kena 504/Limit lagi
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
      setStatus(`Masalah: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div style={styles.center}>🔄 {status}</div>;

  return (
    <div style={styles.container}>
      <p style={styles.status}>{status}</p>
      {card && (
        <div className="card-box" style={styles.cardBox}>
          <img src={card.images.large} alt={card.name} style={styles.img} />
          <h1 style={styles.title}>{card.name}</h1>
          <p style={styles.flavor}>{card.flavorText}</p>
          <div style={styles.price}>
            Market Price: ${card.tcgplayer?.prices?.holofoil?.market || "N/A"}
          </div>
        </div>
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
  center: { textAlign: "center", marginTop: "50px", color: "white" },
  status: { fontSize: "0.8rem", color: "#10b981", textAlign: "center" },
  cardBox: {
    maxWidth: "350px",
    margin: "20px auto",
    backgroundColor: "#0f172a",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    textAlign: "center",
  },
  img: { width: "100%", borderRadius: "10px" },
  title: { color: "#fb7185", margin: "15px 0" },
  flavor: { fontStyle: "italic", color: "#94a3b8", fontSize: "0.85rem" },
  price: {
    marginTop: "20px",
    backgroundColor: "#4f46e5",
    padding: "10px",
    borderRadius: "10px",
    fontWeight: "bold",
  },
};

export default App;
