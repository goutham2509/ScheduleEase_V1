import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/student"); // redirect wherever you want
    }
  }, [params, navigate]);

  return <p>Logging in...</p>;
};

export default AuthSuccess;
