import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./itchList.css";
import "./trending.css";
import Navbar from "./Navbar";

const ItchListPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedItem, setSelectedItem] = useState("2.2"); // Default selection
  const [itches, setItches] = useState([]); // Store fetched posts
  const [uploading, setUploading] = useState(false); // Track upload status
  const [user, setUser] = useState(null); // Store user data
  const [isUploaded, setIsUploaded] = useState(false); // For upload success animation

  // Fetch user data when component mounts
  useEffect(() => {
    handleUser();
  }, []);

  // Fetch user details
  const handleUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found! Please log in.");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/getuser`,
        config,
      );
      setUser(response.data);

      // Fetch user's uploaded itches
      fetchUserItches(response.data._id);
    } catch (error) {
      console.error("Error fetching user:", error);
      alert("Invalid Credentials");
    }
  };

  // Fetch user's uploaded itches
  const fetchUserItches = async (userId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/itchlist/user/${userId}`,
      );
      setItches(response.data);
    } catch (error) {
      console.error("Error fetching user's itches:", error);
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file.");

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found! Please log in again.");
      return;
    }

    if (!user || !user._id || !user.rollno || !user.name) {
      alert("User information is missing. Please refresh and try again.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("user_id", user._id);
    formData.append("rollno", user.rollno);
    formData.append("user_name", user.name);
    formData.append("type", selectedItem);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/itchlist/newitch`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSelectedFile(null);
      setIsUploaded(true);

      // Show success animation then reset
      setTimeout(() => {
        setIsUploaded(false);
      }, 3000);

      // Refresh the user's itches list
      fetchUserItches(user._id);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed! ❌ Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const items = [
    "2.2",
    "ILLU",
    "HOLI",
    "TREAT",
    "BEACH TRIP",
    "BONFIRE",
    "G.C.",
    "TREK",
    "HALL DAY",
    "PROM",
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
    exit: {
      scale: 1.2,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <Navbar />
      <motion.div
        className="main-body"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="content">
          <motion.div
            className="itch-list-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="itch-list-row">
                {items.map((item, index) => (
                  <motion.button
                    key={index}
                    className={`itch-button ${
                      item === selectedItem ? "active" : ""
                    }`}
                    onClick={() => setSelectedItem(item)}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                  </motion.button>
                ))}
            </div>

            {/* Itch List Card - Dynamic Content */}
            <AnimatePresence mode="wait">
              <motion.div
                className="itch-card"
                key={selectedItem}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <motion.h2
                  className="itch-title"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {selectedItem}
                </motion.h2>
                <div className="upload-section">
                  <motion.label
                    className="upload-label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Choose Photo
                  </motion.label>
                  <motion.input
                    className="upload-select"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  />
                  {selectedFile && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Selected File: {selectedFile.name}
                    </motion.p>
                  )}

                  <motion.button
                    className="upload-button"
                    onClick={handleUpload}
                    disabled={uploading}
                    whileHover={{ scale: 1.05, backgroundColor: "#76b5c5" }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </motion.button>

                  <AnimatePresence>
                    {isUploaded && (
                      <motion.div
                        className="success-message"
                        variants={successVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <span role="img" aria-label="success">
                          ✅
                        </span>{" "}
                        Photo uploaded successfully!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Display Uploaded Photos */}
                <motion.div
                  className="itch-gallery"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {itches.length > 0 ? (
                    itches
                      .filter((itch) => itch.type === selectedItem)
                      .map((itch, index) => (
                        <motion.div
                          key={index}
                          className="itch-item"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 * index }}
                          whileHover={{
                            scale: 1.05,
                            transition: { duration: 0.2 },
                          }}
                        >
                          <img
                            src={`${import.meta.env.VITE_UPLOADS_URL}/image?imageName = ${itch.photo_url}`}
                            alt="Uploaded"
                          />
                          <p>{itch.user_name}</p>
                        </motion.div>
                      ))
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      No images uploaded yet for {selectedItem}.
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default ItchListPage;
