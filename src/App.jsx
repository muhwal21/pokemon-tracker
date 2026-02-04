import React, { useState, useEffect } from "react";
import gsap from "gsap";

const App = () => {
  const [cards, setCards] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);

  const API_KEY = "3c8fed90-404a-4db8-8fe0-e99ad48c82d7";
  const initialIds = [
    "sv4pt5-232",
    "sv4pt5-233",
    "sv4pt5-234",
    "swsh12pt5gg-GG67",
  ];

  const fetchCard = async (id) => {
    const proxy = "https://api.allorigins.win/get?url=";
    const target = encodeURIComponent(
      `https://api.pokemontcg.io/v2/cards/${id}`,
    );
    const res = await fetch(`${proxy}${target}`, {
      headers: { "X-Api-Key": API_KEY },
    });
    const json = await res.json();
    return JSON.parse(json.contents).data;
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const promises = initialIds.map((id) => fetchCard(id));
        const results = await Promise.all(promises);
        setCards(results);
      } catch (err) {
        console.log("Gagal load awal");
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
      const data = await fetchCard(searchId);
      setCards((prev) => [data, ...prev]);
      setSearchId("");
    } catch (err) {
      alert("ID tidak ditemukan!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        minHeight: "100vh",
        padding: "20px",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#fb7185" }}>
        Pokémon Tracker Pro
      </h1>

      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "30px",
        }}
      >
        <input
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            width: "200px",
          }}
          placeholder="Cari ID Kartu..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#10b981",
            color: "white",
            cursor: "pointer",
          }}
        >
          Cari
        </button>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {cards.map((card, i) => (
          <div
            key={card.id + i}
            style={{
              backgroundColor: "#1e293b",
              padding: "15px",
              borderRadius: "15px",
              textAlign: "center",
            }}
          >
            <img
              src={card.images.small}
              alt={card.name}
              style={{ width: "100%", borderRadius: "8px" }}
            />
            <h3>{card.name}</h3>
            <p style={{ color: "#10b981", fontWeight: "bold" }}>
              ${card.tcgplayer?.prices?.holofoil?.market || "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
