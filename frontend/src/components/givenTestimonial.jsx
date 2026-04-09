import React, { useState, useEffect } from "react";
import "./givenTestimonial.css";
import Navbar from "./Navbar";
import axios from "axios";

// Fallback to "" so Vite's dev proxy handles /api/... in local dev.
// In production set VITE_API_URL=https://your-render-backend.onrender.com

const TestimonialGiven = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    caption: "Your Caption Here!",
    rollno: "",
    HOR: "",
    email: "",
    department: "",
    testimonials: [],
  });

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const token = window.localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const user = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/getuser`,
          config,
        );
        setProfile(user.data);
        setTestimonials(user.data.testimonials || []);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setError("Failed to load testimonials. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <>
      <Navbar />
      <div className="main-body">
        <div className="content">
          <h3 className="testimonials-heading">Testimonials Received</h3>

          {isLoading && (
            <div className="testimonials-loading">
              <div className="loading-spinner"></div>
              <p>Loading testimonials…</p>
            </div>
          )}

          {error && <p className="testimonials-error">{error}</p>}

          {!isLoading && !error && testimonials.length === 0 && (
            <div className="testimonials-empty">
              <p>No testimonials yet.</p>
              <p>
                Share your roll number with friends so they can write you one!
              </p>
            </div>
          )}

          {testimonials.length > 0 && (
            <div className="testimonial-list">
              {testimonials.map((t, i) => (
                <div key={i} className="testimonial-card">
                  <div className="testimonial-avatar">
                    {getInitials(t.from_user)}
                  </div>
                  <div className="testimonial-body">
                    <div className="testimonial-author">{t.from_user}</div>
                    <div className="testimonial-text">{t.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <a
            href="/yearbook/writetestimonial"
            className="write-testimonial-link"
          >
            ✏️ Write a testimonial for someone
          </a>
        </div>
      </div>
    </>
  );
};

export default TestimonialGiven;
