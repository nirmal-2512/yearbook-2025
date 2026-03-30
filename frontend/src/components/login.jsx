import React, { useRef, useState, useEffect } from "react";
import "./login.css";
import axios from "axios";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import kgplogo from "../img/kgplogo_white.png";

function LoginPage() {
  const rollNumberRef = useRef(null);
  const dobRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Responsive breakpoints
  const isTablet = useMediaQuery({ maxWidth: 992 });
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    const interval = setInterval(() => {
      const token = window.localStorage.getItem("token");
      if (token) {
        window.location.href = "/yearbokk/admin";
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const rollNumber = rollNumberRef.current.value;
    const dob = dobRef.current.value;

    if (!rollNumber || !dob) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        {
          rollno: rollNumber,
          dob: dob,
        },
      );

      console.log(response.data);
      window.localStorage.setItem("token", response.data.token);
      console.log("Token:", response.data.token);
      window.location.href = "/yearbook/admin";
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <motion.div
        className="sac-name"
        initial={{ opacity: 0, x: isMobile ? -50 : -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        STUDENTS' ALUMNI CELL
      </motion.div>

      <motion.div
        className="logo-container"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: isMobile ? 0.5 : 0.8,
          delay: isMobile ? 0.1 : 0.2,
        }}
      >
        <img src={kgplogo} alt="Logo" />
        <h2 className="portal-title">YEARBOOK PORTAL</h2>
        <div className="year">2025</div>
      </motion.div>

      <motion.div
        className="login-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="form-title">
          Login To <span className="highlight">Yearbook Portal</span>{" "}
          <span className="year-text">2026</span>
        </h2>

        <form method="POST" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-group">
              <label htmlFor="rollNumber" className="label-login">
                Roll Number
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
                type="text"
                id="rollNumber"
                placeholder="Enter roll number (e.g. 21DD10090)"
                className="login-input login-roll"
                ref={rollNumberRef}
              />
            </div>

            <div className="input-group">
              <label htmlFor="dob" className="label-login">
                Date of Birth
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
                type="date"
                id="dob"
                className="login-input login-dob"
                ref={dobRef}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <motion.button
              className={`btn-login btn ${isLoading ? "loading" : ""}`}
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {isLoading ? <span className="loading-spinner"></span> : "LOGIN"}
            </motion.button>

            <motion.div
              className="btn-test btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a href="/yearbook/writetestimonial">Write Testimonials</a>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default LoginPage;
