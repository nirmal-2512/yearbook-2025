import React, { useState, useRef, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import styles from "./home.module.css";
import photo from "../img/proIcon.png";
import Navbar from "./Navbar";
import { FcOldTimeCamera } from "react-icons/fc";
import { FaImages, FaNewspaper, FaPlus } from "react-icons/fa";
import { BsEmojiFrown } from "react-icons/bs";
import axios from "axios";

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleNewPost, setIsVisibleNewPost] = useState(false);
  const [isVisibleNewArticle, setIsVisibleNewArticle] = useState(false);
  const [blur, setBlur] = useState(0);
  const [activeTab, setActiveTab] = useState("gallery"); // Default active tab
  const tableRef = useRef(null);
  const inputFile = useRef(null);
  const [content, setContent] = useState("");
  const [caption, setCaption] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posts, setPosts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [profile, setProfile] = useState({
    name: "",
    caption: "Your Caption Here!",
    rollno: "",
    HOR: "",
    email: "",
    department: "",
  });

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPostImage(e.target.files[0]);
    }
  };

  const handleupdateprofile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("image", postImage);
      formData.append("caption", caption);
      formData.append("user_id", profile._id);
      formData.append("type", "pro_pic");
      formData.append("rollno", profile.rollno);
      const token = window.localStorage.getItem("token");

      //request to backend

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/updateuser`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200) {
        alert("Profile updated successfully!");
        closeEditProfile();
      } else {
        alert("Failed to update profile!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  const handlelogout = () => {
    window.localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    if (!postImage) {
      alert("Please select an image to upload");
      return;
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("image", postImage);
      formData.append("caption", caption);
      formData.append("user_id", profile._id);
      formData.append("rollno", profile.rollno);
      formData.append("user_name", profile.name);
      formData.append("type", "post");
      const token = window.localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200) {
        alert("Post uploaded successfully!");
        // Update the posts array with the new post
        fetchPosts();
        closeNewPost();
      } else {
        alert("Failed to upload post!");
      }
    } catch (error) {
      console.error("Error uploading post:", error);
      alert("Error uploading post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewArticleSubmit = async () => {
    try {
      const token = window.localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/articles`,
        {
          content,
          rollno: profile.rollno,
          name: profile.name,
        },
        config,
      );
      if (response.status === 200) {
        alert("Article uploaded successfully!");
        // Update the articles array with the new article
        fetchArticles();
        setContent("");
        closeNewArticle();
      } else {
        alert("Failed to upload article!");
      }
    } catch (error) {
      console.error("Error creating article:", error);
      alert("Error creating article. Please try again.");
    }
  };

  const editProfile = () => {
    setIsVisible(true);
    setIsVisibleNewArticle(false);
    setIsVisibleNewPost(false);
    setBlur(5);
    document.body.style.overflow = "hidden";
  };

  const newPost = () => {
    setIsVisibleNewPost(true);
    setIsVisibleNewArticle(false);
    setIsVisible(false);
    setBlur(5);
    document.body.style.overflow = "hidden";
  };

  const newArticle = () => {
    setIsVisibleNewArticle(true);
    setIsVisible(false);
    setIsVisibleNewPost(false);
    setBlur(5);
    document.body.style.overflow = "hidden";
  };

  const closeEditProfile = () => {
    setIsVisible(false);
    setBlur(0);
    document.body.style.overflow = "auto";
  };

  const closeNewPost = () => {
    setIsVisibleNewPost(false);
    setCaption("");
    setPostImage(null);
    setBlur(0);
    document.body.style.overflow = "auto";
  };

  const closeNewArticle = () => {
    setIsVisibleNewArticle(false);
    setBlur(0);
    document.body.style.overflow = "auto";
  };

  const handleProfile = async () => {
    try {
      const token = window.localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/getuser`,
        config,
      );
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Invalid Credentials");
    }
  };

  const fetchPosts = async () => {
    try {
      const token = window.localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/getpost?type=user`,
        config,
      );

      console.log(response.data);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchArticles = async () => {
    try {
      const token = window.localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/articles/getarticles`,
        config,
      );
      setArticles(response.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  // Format date for articles
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Toggle active tab
  const toggleTab = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    handleProfile();
    fetchPosts();
    fetchArticles();
  }, []);

  return (
    <>
      <Navbar />
      <div className="main-body">
        <div className="content">
          <div
            className={`${styles.container} ${isVisible || isVisibleNewPost || isVisibleNewArticle ? styles.blurBackground : ""}`}
          >
            <div className={styles.profileCard}>
              <div className={styles.imageSection}>
                <img
                  src={
                    profile.pro_pic
                      ? `${import.meta.env.VITE_UPLOADS_URL}${profile.pro_pic}`
                      : photo
                  }
                  alt="Profile"
                  className={styles.profileImage}
                />
              </div>
              <div className={styles.infoSection}>
                <div className={styles.nameCaption}>
                  <h2>{profile.name}</h2>
                  <p>{profile.caption}</p>
                </div>
                <div className={styles.details}>
                  <h3>Introduction:</h3>
                  <div className={styles.detailsDiv}>
                    <div>
                      <strong>Roll No:</strong>
                      <strong className={styles.detailStrong}>
                        {profile.rollno}
                      </strong>
                    </div>
                    <div>
                      <strong>Hall of Residence:</strong>
                      <strong className={styles.detailStrong}>
                        {profile.HOR}
                      </strong>
                    </div>
                    <div>
                      <strong>Email:</strong>
                      <strong className={styles.detailStrong}>
                        {profile.email}
                      </strong>
                    </div>
                    <div>
                      <strong>Department:</strong>
                      <strong className={styles.detailStrong}>
                        {profile.department}
                      </strong>
                    </div>
                  </div>
                  <div className={styles.buttonContainer}>
                    <button className={styles.editButton} onClick={editProfile}>
                      Edit Profile
                    </button>
                    <button
                      className={styles.editButton}
                      onClick={handlelogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.addSection}>
              <a className={styles.testimonialButton} href="/yearbook/writetestimonial">
                Write Testimonials
              </a>
              <button className={styles.newPostButton} onClick={newPost}>
                <FaPlus style={{ marginRight: "5px" }} /> New Post
              </button>
              <button className={styles.newArticleButton} onClick={newArticle}>
                <FaPlus style={{ marginRight: "5px" }} /> New Article
              </button>
            </div>

            <div className={styles.tabs}>
              <button
                className={`${styles.Tab1} ${activeTab === "gallery" ? styles.active : ""}`}
                onClick={() => toggleTab("gallery")}
              >
                Gallery
              </button>
              <button
                className={`${styles.Tab1} ${activeTab === "articles" ? styles.active : ""}`}
                onClick={() => toggleTab("articles")}
              >
                Articles
              </button>
            </div>

            {/* Content Section with Gallery and Articles Cards */}
            <div className={styles.contentSection}>
              {/* Gallery Card */}
              {activeTab === "gallery" && (
                <div className={styles.galleryCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>
                      <FaImages style={{ marginRight: "10px" }} /> My Gallery
                    </h3>
                  </div>

                  {posts && posts.length > 0 ? (
                    <div className={styles.cardContent}>
                      {posts.slice(0, 6).map((post, index) => (
                        <div key={index} className={styles.galleryItem}>
                          <img
                            src={`${import.meta.env.VITE_UPLOADS_URL}${post.photo_url}`}
                            alt={post.caption || "Gallery image"}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <BsEmojiFrown className={styles.emptyIcon} />
                      <p className={styles.emptyText}>No photos to display</p>
                    </div>
                  )}

                  {posts && posts.length > 6 && (
                    <a href="#" className={styles.seeAll}>
                      See all photos
                    </a>
                  )}
                </div>
              )}

              {/* Articles Card */}
              {activeTab === "articles" && (
                <div className={styles.articlesCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>
                      <FaNewspaper style={{ marginRight: "10px" }} /> My
                      Articles
                    </h3>
                  </div>

                  {articles && articles.length > 0 ? (
                    <div className={styles.articlecontainer}>
                      {articles.slice(0, 4).map((article, index) => (
                        <div key={index} className={styles.articleItem}>
                          <h4 className={styles.articleTitle}>
                            {article.title || `Article ${index + 1}`}
                          </h4>
                          <p>
                            {article.content.length > 80
                              ? `${article.content.substring(0, 80)}...`
                              : article.content}
                          </p>
                          <p className={styles.articleDate}>
                            {article.date
                              ? formatDate(article.date)
                              : "Unknown date"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <BsEmojiFrown className={styles.emptyIcon} />
                      <p className={styles.emptyText}>No articles to display</p>
                    </div>
                  )}

                  {articles && articles.length > 4 && (
                    <a href="#" className={styles.seeAll}>
                      See all articles
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Modal for profile edit */}
          {isVisible && (
            <div className={styles.overlay}>
              <div className={styles.editProfile}>
                <RxCross2
                  className={styles.closeButton}
                  size={26}
                  onClick={closeEditProfile}
                />
                <h3>Edit Profile</h3>
                <form onSubmit={handleupdateprofile}>
                  <table className={styles.table}>
                    <tbody>
                      <tr>
                        <td>Change Profile Picture:</td>
                        <td>
                          <label htmlFor="pic" className={styles.fileLabel}>
                            <FcOldTimeCamera size={22} /> Browse File
                          </label>
                          <input
                            type="file"
                            id="pic"
                            className={styles.hiddenInput}
                            onChange={handleImageChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Caption:</td>
                        <td>
                          <input
                            type="text"
                            placeholder="Upload your Caption Here."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className={styles.input}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <button type="submit" className={styles.saveButton}>
                    Save
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Modal for new post */}
          {isVisibleNewPost && (
            <div className={styles.overlay}>
              <div className={styles.editProfile}>
                <RxCross2
                  className={styles.closeButton}
                  size={26}
                  onClick={closeNewPost}
                />
                <h3>Upload A New Post</h3>
                <form onSubmit={handleSubmission}>
                  <table className={styles.table}>
                    <tbody>
                      <tr>
                        <td>Select Picture:</td>
                        <td>
                          <label htmlFor="pic" className={styles.fileLabel}>
                            <FcOldTimeCamera size={22} /> Browse File
                          </label>
                          <input
                            type="file"
                            id="pic"
                            className={styles.hiddenInput}
                            onChange={handleImageChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Caption:</td>
                        <td>
                          <input
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className={styles.inputCapti}
                            placeholder="Upload your Caption Here."
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Uploading..." : "Upload Post"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Modal for new article */}
          {isVisibleNewArticle && (
            <div className={styles.overlay}>
              <div className={styles.editProfile}>
                <RxCross2
                  className={styles.closeButton}
                  size={26}
                  onClick={closeNewArticle}
                />
                <h3>Upload A New Article</h3>
                <textarea
                  placeholder="Write your article content here."
                  className={styles.textarea}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleNewArticleSubmit}
                  className={styles.saveButton}
                >
                  Upload Article
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
