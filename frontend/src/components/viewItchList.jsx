import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./viewItchList.css";
import Navbar from "./Navbar";
import { MdDialpad, MdSportsVolleyball } from "react-icons/md";
import { TbTrekking } from "react-icons/tb";
import { IoColorPaletteSharp } from "react-icons/io5";
import { BsBuildingsFill } from "react-icons/bs";
import { GiLoveSong, GiBeerStein, GiCampfire } from "react-icons/gi";
import { LuWaves } from "react-icons/lu";
import { FaRoad } from "react-icons/fa6";

function ViewItchList() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const postsPerPage = 25;

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]); // Fetch posts when category changes

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/itchlist/getitch?type=${selectedCategory}`,
      );
      setPosts(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setIsLoading(false);
    }
  };

  // Filter posts based on selected category
  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter((post) => post.type === selectedCategory);

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  // Animate category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing categories
  };

  return (
    <>
      <Navbar />
      <div className="main-body">
        <motion.div
          className="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Category Header */}
          <motion.div
            className="category-header"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>
              {selectedCategory === "all" ? "All Memories" : selectedCategory}
            </h1>
            <p>Explore and relive your favorite moments</p>
          </motion.div>

          {/* Filter Buttons */}
          <motion.div
            className="filter-container"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange("all")}
              className={selectedCategory === "all" ? "active-category" : ""}
            >
              <MdDialpad />
              <span>ALL</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange("2.2")}
              className={selectedCategory === "2.2" ? "active-category" : ""}
            >
              <FaRoad />
              <span>2.2</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange("ILLU")}
              className={selectedCategory === "ILLU" ? "active-category" : ""}
            >
              <IoColorPaletteSharp />
              <span>ILLU</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange("HOLI")}
              className={selectedCategory === "HOLI" ? "active-category" : ""}
            >
              <IoColorPaletteSharp />
              <span>HOLI</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange("TREAT")}
              className={selectedCategory === "TREAT" ? "active-category" : ""}
            >
              <GiBeerStein />
              <span>TREAT</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange("BONFIRE")}
              className={
                selectedCategory === "BONFIRE" ? "active-category" : ""
              }
            >
              <GiCampfire />
              <span>BONFIRE</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange("GC")}
              className={selectedCategory === "GC" ? "active-category" : ""}
            >
              <MdSportsVolleyball />
              <span>G.C.</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange("TREK")}
              className={selectedCategory === "TREK" ? "active-category" : ""}
            >
              <TbTrekking />
              <span>TREK</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange("HALL DAY")}
              className={
                selectedCategory === "HALL DAY" ? "active-category" : ""
              }
            >
              <BsBuildingsFill />
              <span>HALL DAY</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange("PROM")}
              className={selectedCategory === "PROM" ? "active-category" : ""}
            >
              <GiLoveSong />
              <span>PROM</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange("BEACH TRIP")}
              className={
                selectedCategory === "BEACH TRIP" ? "active-category" : ""
              }
            >
              <LuWaves />
              <span>BEACH TRIP</span>
            </motion.button>
          </motion.div>

          {/* Loading State */}
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading memories...</p>
            </div>
          ) : (
            <>
              {/* Display Posts */}
              <div className="itch-container">
                <AnimatePresence mode="wait">
                  {currentPosts.length === 0 ? (
                    <motion.div
                      className="no-posts"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key="no-posts"
                    >
                      <p>No memories found for this category.</p>
                      <p>Be the first to add one!</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="posts-grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={selectedCategory}
                    >
                      {currentPosts.map((post, index) => (
                        <motion.div
                          className="post"
                          key={post._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{
                            y: -5,
                            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          <div className="post-header">
                            <div className="user-info">
                              <span className="author">{post.user_name}</span>
                              <span className="post-date">
                                {new Date(
                                  post.date || Date.now(),
                                ).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="category-badge">{post.type}</div>
                          </div>

                          <div className="post-content">
                            <motion.div
                              className="post-image"
                              whileHover={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <img
                                src={`http://localhost:5001${post.photo_url}`}
                                alt="post"
                                loading="lazy"
                              />
                            </motion.div>

                            {post.caption && (
                              <p className="post-caption">{post.caption}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              <motion.div
                className="pagination-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="page-indicator">
                  Page {currentPage} of {totalPages || 1}
                </div>

                {totalPages > 1 && (
                  <motion.div
                    className="pagination"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {currentPage > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="page-nav prev"
                      >
                        Prev
                      </motion.button>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => (
                      <motion.button
                        key={i + 1}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? "active" : ""}
                      >
                        {i + 1}
                      </motion.button>
                    ))}

                    {currentPage < totalPages && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="page-nav next"
                      >
                        Next
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}

export default ViewItchList;
