import React from "react";
import { supabase } from "../utils/supabaseClient";

const Login = () => {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={{ fontSize: "3rem" }}>🐉</h1>
        <h2>PokeVault</h2>
        <p style={{ color: "#94a3b8" }}>
          Kelola koleksi kartu Pokémon Sultan kamu.
        </p>
        <button onClick={handleLogin} style={styles.btn}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt=""
            style={{ width: "18px", marginRight: "10px" }}
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#020617",
    color: "white",
  },
  card: {
    textAlign: "center",
    padding: "40px",
    background: "#0f172a",
    borderRadius: "24px",
    border: "1px solid #1e293b",
    width: "350px",
  },
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "20px",
    padding: "12px",
    background: "white",
    color: "black",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Login;
