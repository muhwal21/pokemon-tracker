import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

const SearchPage = ({ session }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 8;

  const [selectedCard, setSelectedCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [buyPrice, setBuyPrice] = useState(0);

  // --- 1. LOGIKA PERSISTENCE (AMBIL DATA SAAT RE-RENDER) ---
  useEffect(() => {
    const savedSearch = localStorage.getItem("lastSearchTerm");
    const savedCards = localStorage.getItem("lastSearchResults");

    if (savedSearch) setSearchTerm(savedSearch);
    if (savedCards) setCards(JSON.parse(savedCards));
  }, []);

  const renderPriceDetails = (card) => {
    const prices = [
      { label: "TCG Market", value: card.market_price, color: "#10b981" },
      {
        label: "Europe Avg",
        value: card.cardmarket_trend_price,
        color: "#3b82f6",
      },
    ];

    const activePrices = prices.filter((p) => p.value && p.value > 0);

    if (activePrices.length === 0) {
      return (
        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "5px" }}>
          Price: N/A
        </div>
      );
    }

    return (
      <div style={styles.priceContainer}>
        {activePrices.map((p, i) => (
          <div key={i} style={styles.priceRow}>
            <span>{p.label}</span>
            <span style={{ color: p.color }}>${p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const fetchCards = async () => {
    if (!searchTerm) return;
    setLoading(true);

    let query = supabase.from("cards").select("*");

    if (searchTerm.includes("-")) {
      query = query.eq("id", searchTerm.trim());
    } else {
      query = query.ilike("name", `%${searchTerm}%`);
    }

    if (sortBy === "price_low")
      query = query.order("market_price", { ascending: true });
    else if (sortBy === "price_high")
      query = query.order("market_price", { ascending: false });

    const { data, error } = await query;
    if (!error) {
      setCards(data);
      setCurrentPage(1);

      // --- 2. SIMPAN HASIL KE LOCALSTORAGE ---
      localStorage.setItem("lastSearchTerm", searchTerm);
      localStorage.setItem("lastSearchResults", JSON.stringify(data));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (searchTerm) fetchCards();
  }, [sortBy]);

  const currentCards = cards.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage,
  );
  const totalPages = Math.ceil(cards.length / cardsPerPage);

  const openModal = (card) => {
    setSelectedCard(card);
    setBuyPrice(card.market_price || card.cardmarket_trend_price || 0);
    setShowModal(true);
  };

  const saveToCollection = async () => {
    const { error } = await supabase.from("user_collections").insert([
      {
        user_id: session.user.id,
        card_id: selectedCard.id,
        acquired_price: parseFloat(buyPrice),
        current_market_price:
          selectedCard.market_price || selectedCard.cardmarket_trend_price,
        bought_at: new Date(),
      },
    ]);
    if (!error) {
      alert("✅ Berhasil masuk koleksi!");
      setShowModal(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <div style={styles.headerAction}>
        <div style={styles.searchBar}>
          <input
            style={styles.input}
            placeholder="Cari Nama atau ID (svp-196)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && fetchCards()}
          />
          <button style={styles.btn} onClick={fetchCards}>
            {loading ? "..." : "Cari"}
          </button>

          {/* Tombol Reset biar kalau mau bersihin localStorage gampang */}
          <button
            style={{ ...styles.btn, background: "#334155" }}
            onClick={() => {
              setCards([]);
              setSearchTerm("");
              localStorage.removeItem("lastSearchTerm");
              localStorage.removeItem("lastSearchResults");
            }}
          >
            Clear
          </button>
        </div>

        <select
          style={styles.sortSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="default">Urutkan</option>
          <option value="price_low">Termurah</option>
          <option value="price_high">Termahal</option>
        </select>
      </div>

      <div style={styles.cardGrid}>
        {currentCards.map((card) => (
          <div key={card.id} style={styles.cardItem}>
            <div style={{ position: "relative" }}>
              <img src={card.image_small} style={styles.cardImg} alt="" />
            </div>
            <h4 style={styles.cardTitle}>{card.name}</h4>
            <p
              style={{
                fontSize: "10px",
                color: "#64748b",
                marginBottom: "5px",
              }}
            >
              ID: {card.id}
            </p>
            {renderPriceDetails(card)}
            <button style={styles.addBtn} onClick={() => openModal(card)}>
              + Koleksi
            </button>
          </div>
        ))}
      </div>

      {/* Pagination & Modal tetap sama */}
      {cards.length > cardsPerPage && (
        <div style={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            style={styles.pageBtn}
          >
            ‹
          </button>
          <span style={{ fontSize: "14px", color: "#94a3b8" }}>
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            style={styles.pageBtn}
          >
            ›
          </button>
        </div>
      )}

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: "15px" }}>Konfirmasi Harga</h3>
            <div style={styles.priceInputWrapper}>
              <span>$</span>
              <input
                type="number"
                style={styles.priceInput}
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={styles.confirmBtn} onClick={saveToCollection}>
                Simpan
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ... Styles tetap sama seperti sebelumnya ...
const styles = {
  headerAction: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  searchBar: { flex: 2, display: "flex", gap: "10px", minWidth: "300px" },
  input: {
    flex: 1,
    padding: "12px",
    background: "#0f172a",
    border: "1px solid #1e293b",
    color: "white",
    borderRadius: "8px",
  },
  btn: {
    padding: "12px 20px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  sortSelect: {
    flex: 1,
    padding: "12px",
    background: "#1e293b",
    color: "white",
    border: "1px solid #334155",
    borderRadius: "8px",
    minWidth: "150px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "20px",
  },
  cardItem: {
    background: "#0f172a",
    padding: "12px",
    borderRadius: "15px",
    border: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
  },
  cardImg: { width: "100%", borderRadius: "10px", marginBottom: "10px" },
  cardTitle: {
    fontSize: "13px",
    margin: "5px 0 2px 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  priceContainer: {
    background: "rgba(0,0,0,0.2)",
    padding: "8px",
    borderRadius: "8px",
    marginTop: "5px",
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10px",
    marginBottom: "2px",
  },
  addBtn: {
    marginTop: "auto",
    width: "100%",
    padding: "8px",
    background: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "40px",
    gap: "20px",
  },
  pageBtn: {
    padding: "8px 20px",
    background: "#1e293b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modalContent: {
    background: "#1e293b",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid #334155",
    width: "300px",
    textAlign: "center",
  },
  priceInputWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "25px",
    fontSize: "24px",
    color: "#10b981",
  },
  priceInput: {
    background: "#0f172a",
    border: "2px solid #10b981",
    color: "white",
    padding: "10px",
    borderRadius: "10px",
    width: "120px",
    textAlign: "center",
    fontSize: "20px",
  },
  confirmBtn: {
    flex: 1,
    padding: "12px",
    background: "#10b981",
    border: "none",
    color: "white",
    borderRadius: "8px",
    fontWeight: "bold",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    background: "#ef4444",
    border: "none",
    color: "white",
    borderRadius: "8px",
  },
};

export default SearchPage;
