import { useState, useEffect } from "react";
import "./trending.css";
import TrendingPost from "./trendingPost";
import Navbar from "./Navbar";
import axios from "axios";

function Trending() {
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(25);
  const [filter, setFilter] = useState("TimeStamp");
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  //api call for posts

  const getallposts = async (type) => {
    try {
      const token = window.localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/getpost?type=${type}`,
        config,
      );
      setPosts(response.data); // Now, you set posts after the API response
    } catch (error) {
      console.error("Error fetching posts", error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    let type;

    setTimeout(() => {
      if (filter === "Most Liked") {
        type = "likes";
        getallposts(type); // Call getallposts and wait for the response
      } else if (filter === "TimeStamp") {
        type = "date";
        getallposts(type); // Call getallposts and wait for the response
      }

      setIsLoading(false);
    }, 800);
  }, [filter]);

  // Calculate the total number of pages
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // Get the posts for the current page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  // Handle page change
  const paginate = (pageNumber) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(pageNumber);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  return (
    <>
      <Navbar />
      <div className="main-body">
        <div className="content">
          {/* Filter Dropdown with improved styling */}
          <div className="filter-container">
            <label htmlFor="category-filter">Filter by: </label>
            <select
              className="category-filter-trending"
              id="category-filter"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="TimeStamp">Most Recent</option>
              <option value="Most Liked">Most Liked</option>
            </select>

            <label htmlFor="posts-per-page" className="posts-per-page-label">
              Show:
            </label>
            <select
              className="posts-per-page"
              id="posts-per-page"
              value={postsPerPage}
              onChange={(e) => {
                setPostsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading trending posts...</p>
            </div>
          ) : (
            <div className="trending-container">
              {currentPosts.map((post, index) => (
                <div
                  key={post._id}
                  className="post-wrapper"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <TrendingPost post={post} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination Bar with visual improvements */}
          {!isLoading && totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="pagination-nav"
              >
                &laquo;
              </button>

              {/* Show page numbers with ellipsis for many pages */}
              {Array.from({ length: totalPages }, (_, i) => {
                // Show first page, last page, and pages around current page
                if (
                  i === 0 ||
                  i === totalPages - 1 ||
                  (i >= currentPage - 2 && i <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={currentPage === i + 1 ? "active" : ""}
                    >
                      {i + 1}
                    </button>
                  );
                } else if (i === currentPage - 3 || i === currentPage + 3) {
                  return (
                    <span key={i} className="pagination-ellipsis">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="pagination-nav"
              >
                &raquo;
              </button>
            </div>
          )}

          {!isLoading && (
            <div className="page-info">
              Showing {indexOfFirstPost + 1}-
              {Math.min(indexOfLastPost, posts.length)} of {posts.length} posts
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Trending;
