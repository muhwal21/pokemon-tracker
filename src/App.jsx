import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  Link, // Tambahkan Link untuk membungkus Logo
} from "react-router-dom";
import { supabase } from "./utils/supabaseClient";
import Login from "./pages/Login";
import SearchPage from "./pages/SearchPage";
import MyCollection from "./pages/MyCollection";

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  if (!session) return <Login />;

  const user = session.user.user_metadata;

  return (
    <Router>
      <div
        style={{
          background: "#020617",
          minHeight: "100vh",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <nav style={styles.nav}>
          {/* Logo PokeInvest - Klik logo akan balik ke halaman utama */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <h2
              style={{
                marginRight: "20px",
                color: "#3b82f6",
                cursor: "pointer",
              }}
            >
              📈 PokeInvest
            </h2>
          </Link>

          {/* Menu Navigasi */}
          <NavLink
            to="/"
            style={({ isActive }) =>
              isActive ? styles.activeNavLink : styles.navLink
            }
          >
            Marketplace
          </NavLink>

          <NavLink
            to="/collection"
            style={({ isActive }) =>
              isActive ? styles.activeNavLink : styles.navLink
            }
          >
            Portfolio
          </NavLink>

          <div style={styles.profileSection}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                {user?.full_name}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                Active Investor
              </div>
            </div>
            <img src={user?.avatar_url} alt="Profile" style={styles.avatar} />
            <button
              onClick={() => supabase.auth.signOut()}
              style={styles.logoutBtn}
            >
              Logout
            </button>
          </div>
        </nav>

        <main style={styles.mainContainer}>
          <Routes>
            <Route path="/" element={<SearchPage session={session} />} />
            <Route
              path="/collection"
              element={<MyCollection session={session} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
    padding: "10px 25px",
    background: "#0f172a",
    borderBottom: "1px solid #1e293b",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  navLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
    padding: "8px 12px",
    borderRadius: "6px",
    transition: "0.2s",
  },
  activeNavLink: {
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "bold",
    background: "rgba(59, 130, 246, 0.1)",
    padding: "8px 12px",
    borderRadius: "6px",
  },
  profileSection: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "2px solid #2563eb",
    objectFit: "cover",
  },
  logoutBtn: {
    color: "#ef4444",
    background: "none",
    border: "1px solid #ef4444",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "0.2s",
  },
  mainContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
};
