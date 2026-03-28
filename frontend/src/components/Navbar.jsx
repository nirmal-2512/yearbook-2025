import { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "./navbar.css";
import kgplogo from "../img/kgplogo_white.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Navbar background on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const token = window.localStorage.getItem("token");
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/search?q=${encodeURIComponent(searchQuery)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSearchResults(data);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (user) => {
    setSearchQuery("");
    setShowDropdown(false);
    setSearchResults([]);
    // Navigate to the user's profile — pass rollno as state so Body.jsx can use it
    navigate("/profile", { state: { rollno: user.rollno } });
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const navLinks = [
    { to: "/home", label: "Home" },
    { to: "/trending", label: "Trending" },
    { to: "/ItchListPage", label: "Fill Itch List" },
    { to: "/ViewItchList", label: "View Itch List" },
    { to: "/Polls", label: "Polls" },
    { to: "/testimonialgiven", label: "Testimonials" },
  ];

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* Logo */}
        <div className="logo">
          <img src={kgplogo} alt="Logo" />
          <h2>YEARBOOK</h2>
        </div>

        {/* Desktop Links */}
        <ul className="nav-links">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  isActive ? "navbar-active" : "nav-link"
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Search */}
        <div className="navbar-right">
          <div
            className={`search-container ${isSearchFocused ? "focused" : ""}`}
            ref={searchRef}
          >
            <input
              type="text"
              placeholder="Search friends…"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setIsSearchFocused(true);
                if (searchResults.length) setShowDropdown(true);
              }}
              onBlur={() => setIsSearchFocused(false)}
              autoComplete="off"
            />
            <button className="search-button" onClick={() => {}}>
              {searchLoading ? (
                <span style={{ color: "#A5D7E8", fontSize: 11 }}>…</span>
              ) : (
                <FaSearch className="search-icon" />
              )}
            </button>

            {/* Results dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <ul className="search-dropdown">
                {searchResults.map((user) => (
                  <li
                    key={user.rollno}
                    onMouseDown={() => handleResultClick(user)}
                  >
                    <div className="search-result-avatar">
                      {user.pro_pic ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}${user.pro_pic}`}
                          alt={user.name}
                        />
                      ) : (
                        <span>{getInitials(user.name)}</span>
                      )}
                    </div>
                    <div className="search-result-info">
                      <strong>{user.name}</strong>
                      <span>
                        {user.rollno} · {user.department}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {showDropdown &&
              searchQuery.length >= 2 &&
              searchResults.length === 0 &&
              !searchLoading && (
                <div className="search-no-results">No users found</div>
              )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <FaTimes className="icon-times" />
          ) : (
            <FaBars className="icon-bars" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <div className="mobile-logo">
              <img src={kgplogo} alt="Logo" />
              <h2>YEARBOOK</h2>
            </div>
            <button className="close-menu-btn" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>
          <ul>
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    isActive ? "mobile-active" : ""
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
