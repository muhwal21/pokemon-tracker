import React from "react";
import { supabase } from "./supabaseClient";

const Login = () => {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) console.error("Login Error:", error.message);
  };

  return (
    <div style={styles.loginPage}>
      <div style={styles.loginCard}>
        <h1>🐉 Pokémon Vault</h1>
        <p>Simpan koleksi kartu sultanmu di sini.</p>
        <button onClick={handleLogin} style={styles.googleBtn}>
          Masuk dengan Google
        </button>
      </div>
    </div>
  );
};

const styles = {
  loginPage: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#020617",
  },
  loginCard: {
    textAlign: "center",
    padding: "40px",
    background: "#0f172a",
    borderRadius: "16px",
    border: "1px solid #1e293b",
  },
  googleBtn: {
    padding: "12px 24px",
    fontSize: "16px",
    background: "#fff",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Login;
