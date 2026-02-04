import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const App = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Memulai...");

  const fetchData = async () => {
    try {
      setLoading(true);
      setStatus("Menghubungkan ke Supabase...");

      // 1. Cek Supabase
      const { data: localData, error: dbError } = await supabase
        .from("cards")
        .select("*")
        .eq("id", "neo2-1")
        .single();

      if (localData) {
        setCard(localData.full_json);
        setStatus("Data diambil dari Database!");
        setLoading(false);
        return;
      }

      // 2. Ambil dari API (Gunakan header Accept untuk hindari error 406)
      setStatus("Mengambil data dari Pokémon API...");
      const res = await fetch("https://api.pokemontcg.io/v2/cards/neo2-1", {
        headers: {
          "X-Api-Key": import.meta.env.VITE_POKEMON_API_KEY,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`Server API Error: ${res.status}`);

      const result = await res.json();
      const cardData = result.data;

      // 3. Simpan ke Supabase (Upsert agar tidak double)
      await supabase.from("cards").upsert([
        {
          id: cardData.id,
          name: cardData.name,
          image_url: cardData.images.large,
          full_json: cardData,
        },
      ]);

      setCard(cardData);
      setStatus("Data berhasil dimuat dan disimpan!");
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div style={styles.info}>🔄 {status}</div>;

  return (
    <div style={styles.container}>
      <p style={styles.statusText}>{status}</p>
      {card && (
        <div className="card-box" style={styles.cardBox}>
          <img src={card.images.large} alt={card.name} style={styles.img} />
          <h1 style={styles.title}>{card.name}</h1>
          <div style={styles.detail}>
            <p>
              <strong>Set:</strong> {card.set.name}
            </p>
            <p>
              <strong>Artist:</strong> {card.artist}
            </p>
            <p style={styles.flavor}>{card.flavorText}</p>
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
  info: { color: "white", textAlign: "center", marginTop: "50px" },
  statusText: { fontSize: "0.8rem", color: "#10b981", marginBottom: "20px" },
  cardBox: {
    maxWidth: "400px",
    margin: "0 auto",
    backgroundColor: "#0f172a",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    textAlign: "center",
  },
  img: {
    width: "100%",
    borderRadius: "10px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  title: { color: "#fb7185", marginTop: "20px" },
  detail: { textAlign: "left", marginTop: "20px", fontSize: "0.9rem" },
  flavor: { fontStyle: "italic", color: "#64748b", marginTop: "10px" },
};

export default App;
