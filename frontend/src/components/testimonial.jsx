import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import axios from "axios";
import "./login.css"; // Reusing the same CSS
import kgplogo from "../img/kgplogo_white.png";

function WriteTestimonialPage() {
  const toUserNameRef = useRef(null);
  const toUserRollNoRef = useRef(null);
  const fromUserRef = useRef(null);
  const contentRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Responsive breakpoints (same as login)
  const isTablet = useMediaQuery({ maxWidth: 992 });
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const toUserName = toUserNameRef.current.value;
    const toUserRollNo = toUserRollNoRef.current.value;
    const fromUser = fromUserRef.current.value;
    const content = contentRef.current.value;

    if (!toUserName || !toUserRollNo || !fromUser || !content) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/addtestimonial`,
        {
          to_user_name: toUserName,
          to_user_rollno: toUserRollNo,
          from_user: fromUser,
          content: content,
        },
      );

      console.log(response.data);
      setSuccess("Testimonial submitted successfully!");

      // Clear form fields after successful submission
      toUserNameRef.current.value = "";
      toUserRollNoRef.current.value = "";
      contentRef.current.value = "";
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      setError("Failed to submit testimonial. Please try again.");
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
        <div className="year">2026</div>
      </motion.div>

      <motion.div
        className="login-container testimonial-container testimonial-layout"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="form-title">
          Write <span className="highlight">Testimonial</span>{" "}
          <span className="year-text">2026</span>
        </h2>
        <div className="form-subtitle">
          Share your memories and wishes for your fellow KGPians
        </div>
        <div className="layout-info">
          Please fill in all the required information
        </div>

        <form method="POST" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="form-layout">
              <div className="form-left">
                <div className="input-group">
                  <label htmlFor="recipientName" className="label-login">
                    Recipient's Name
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    type="text"
                    id="recipientName"
                    placeholder="Enter recipient's name"
                    className="login-input recipient-input"
                    ref={toUserNameRef}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="recipientRollNo" className="label-login">
                    Recipient's Roll Number
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    type="text"
                    id="recipientRollNo"
                    placeholder="Enter recipient's roll number (e.g. 21DD10090)"
                    className="login-input recipient-input"
                    ref={toUserRollNoRef}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="fromUser" className="label-login">
                    Your Name
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    type="text"
                    id="fromUser"
                    placeholder="Enter your name"
                    className="login-input sender-input"
                    ref={fromUserRef}
                  />
                </div>
              </div>

              <div className="form-right">
                <div className="input-group">
                  <label htmlFor="content" className="label-login">
                    Your Message
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    id="content"
                    placeholder="Write your testimonial here..."
                    className="login-input testimonial-content"
                    ref={contentRef}
                    rows="12"
                  />
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <motion.button
              className={`btn-login btn submit-testimonial-btn ${isLoading ? "loading" : ""}`}
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                "SUBMIT TESTIMONIAL"
              )}
            </motion.button>

            <motion.div
              className="btn-test btn back-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a href="/yearbook/">Back to Login</a>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default WriteTestimonialPage;
