// src/components/Login.js
import React from "react";

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return <button onClick={handleGoogleLogin}>Login with Google</button>;
};

export default Login;
