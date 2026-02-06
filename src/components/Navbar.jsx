import React from "react";
import { supabase } from "../utils/supabaseClient";

const Navbar = ({ session }) => {
  return (
    <nav style={styles.nav}>
      <h2 style={{ margin: 0 }}>🃏 PokeVault</h2>
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <span>{session.user.user_metadata.full_name}</span>
        <button
          onClick={() => supabase.auth.signOut()}
          style={styles.logoutBtn}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 30px",
    background: "#0f172a",
    borderBottom: "1px solid #1e293b",
    alignItems: "center",
  },
  logoutBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Navbar;
