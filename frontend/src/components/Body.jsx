import React, { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import styles from "./Body.module.css";
import photo from "../img/proIcon.png";
import Navbar from "./Navbar";
import axios from "axios";
import { FcOldTimeCamera } from "react-icons/fc";
import { useLocation } from "react-router-dom";
import TrendingPost from "./trendingPost";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api$/, "");
const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5001";

const Body = () => {
  const location = useLocation();
  const viewingRollno = location.state?.rollno || null;
  const isOwnProfile = !viewingRollno;

  const [isVisible, setIsVisible] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    caption: "",
    rollno: "",
    HOR: "",
    email: "",
    department: "",
    pro_pic: "",
  });

  const [loggedInUserName, setLoggedInUserName] = useState("");
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // ================= PROFILE =================
  const handleprofile = async () => {
    try {
      const token = window.localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isOwnProfile) {
        const res = await axios.get(`${BASE_URL}/api/users/getuser`, config);
        setProfile(res.data);
        setLoggedInUserName(res.data.name);
      } else {
        const friendRes = await axios.get(
          `${BASE_URL}/api/users/getuser/${viewingRollno}`,
          config,
        );
        setProfile(friendRes.data);

        const ownRes = await axios.get(`${BASE_URL}/api/users/getuser`, config);
        setLoggedInUserName(ownRes.data.name);
      }
    } catch (err) {
      console.error("Profile error:", err);
    }
  };

  // ================= POSTS =================
  const fetchPosts = async (rollno) => {
    try {
      setPostsLoading(true);
      const token = window.localStorage.getItem("token");

      const { data } = await axios.get(
        `${BASE_URL}/api/posts/getpost?rollno=${rollno}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setPosts(data);
    } catch (err) {
      console.error("Post fetch error:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    handleprofile();
  }, [viewingRollno]);

  useEffect(() => {
    const roll = viewingRollno || profile.rollno;
    if (roll) fetchPosts(roll);
  }, [profile.rollno, viewingRollno]);

  // ================= UI =================
  const handlelogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const profileImageSrc = profile.pro_pic
    ? `${UPLOADS_URL}${profile.pro_pic}`
    : photo;

  return (
    <>
      <Navbar />

      <div className="main-body">
        <div className="content">
          <div
            className={`${styles.container} ${
              isVisible ? styles.blurBackground : ""
            }`}
          >
            {/* ── Exact original profile card ── */}
            <div className={styles.profileCard}>
              <div className={styles.imageSection}>
                <img
                  src={profileImageSrc}
                  alt="Profile"
                  className={styles.profileImage}
                  onError={(e) => {
                    e.target.src = photo;
                  }}
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
                      <strong>
                        <svg
                          width="25"
                          height="25"
                          viewBox="0 0 25 25"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_73_953)">
                            <path
                              d="M17.6338 15.8133V22.9415C17.6338 23.0333 17.6095 23.1234 17.5633 23.2027C17.5171 23.282 17.4507 23.3476 17.3709 23.3928C17.291 23.4381 17.2006 23.4613 17.1089 23.4602C17.0171 23.4591 16.9273 23.4337 16.8486 23.3865L12.4474 20.7456L8.04623 23.3865C7.96744 23.4337 7.87752 23.4592 7.78568 23.4602C7.69383 23.4613 7.60335 23.4379 7.52348 23.3926C7.44362 23.3472 7.37723 23.2815 7.33111 23.202C7.285 23.1226 7.2608 23.0323 7.26101 22.9405V15.8144C5.91892 14.7398 4.94372 13.275 4.47017 11.6222C3.99661 9.9695 4.04809 8.21048 4.61749 6.58826C5.18689 4.96604 6.24609 3.56073 7.64872 2.56653C9.05135 1.57233 10.7282 1.03833 12.4474 1.03833C14.1666 1.03833 15.8434 1.57233 17.2461 2.56653C18.6487 3.56073 19.7079 4.96604 20.2773 6.58826C20.8467 8.21048 20.8982 9.9695 20.4246 11.6222C19.9511 13.275 18.9759 14.7398 17.6338 15.8144V15.8133ZM9.33556 17.0301V20.1938L12.4474 18.3267L15.5592 20.1938V17.0301C14.5705 17.4299 13.5139 17.6349 12.4474 17.6338C11.3809 17.6349 10.3243 17.4299 9.33556 17.0301ZM12.4474 15.5592C14.098 15.5592 15.681 14.9035 16.8482 13.7363C18.0154 12.5692 18.6711 10.9861 18.6711 9.33552C18.6711 7.6849 18.0154 6.10189 16.8482 4.93472C15.681 3.76756 14.098 3.11185 12.4474 3.11185C10.7968 3.11185 9.21376 3.76756 8.0466 4.93472C6.87943 6.10189 6.22373 7.6849 6.22373 9.33552C6.22373 10.9861 6.87943 12.5692 8.0466 13.7363C9.21376 14.9035 10.7968 15.5592 12.4474 15.5592Z"
                              fill="#A5D7E8"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_73_953">
                              <rect
                                width="24.8947"
                                height="24.8947"
                                fill="white"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                        Roll No:
                      </strong>
                      <strong className={styles.detailStrong}>
                        {" "}
                        {profile.rollno}
                      </strong>
                    </div>
                    <div>
                      <strong>
                        <svg
                          width="25"
                          height="25"
                          viewBox="0 0 25 25"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_73_950)">
                            <path
                              d="M21.7829 21.7829H3.11186C2.83676 21.7829 2.57292 21.6736 2.3784 21.4791C2.18387 21.2845 2.07458 21.0207 2.07458 20.7456V12.9525C2.07457 12.8043 2.10632 12.6578 2.16769 12.5229C2.22906 12.388 2.31863 12.2678 2.43037 12.1704L6.2237 8.86252V4.14913C6.2237 3.87402 6.33298 3.61019 6.52751 3.41566C6.72204 3.22113 6.98588 3.11185 7.26098 3.11185L21.7829 3.11185C22.058 3.11185 22.3218 3.22113 22.5164 3.41566C22.7109 3.61019 22.8202 3.87402 22.8202 4.14913V20.7456C22.8202 21.0207 22.7109 21.2845 22.5164 21.4791C22.3218 21.6736 22.058 21.7829 21.7829 21.7829ZM9.33554 19.7083H12.4474V13.4245L8.29826 9.80644L4.14914 13.4245V19.7083H7.26098V15.5592H9.33554V19.7083ZM14.5219 19.7083H20.7456V5.1864H8.29826V7.3927C8.54098 7.3927 8.78474 7.47775 8.97975 7.6489L14.1661 12.1704C14.2779 12.2678 14.3675 12.388 14.4288 12.5229C14.4902 12.6578 14.5219 12.8043 14.5219 12.9525V19.7083ZM16.5965 11.4101H18.671V13.4846H16.5965V11.4101ZM16.5965 15.5592H18.671V17.6337H16.5965V15.5592ZM16.5965 7.26096H18.671V9.33552H16.5965V7.26096ZM12.4474 7.26096H14.5219V9.33552H12.4474V7.26096Z"
                              fill="#A5D7E8"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_73_950">
                              <rect
                                width="24.8947"
                                height="24.8947"
                                fill="white"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                        Hall of Residence:
                      </strong>
                      <strong className={styles.detailStrong}>
                        {" "}
                        {profile.HOR}
                      </strong>
                    </div>
                    <div>
                      <strong>
                        <svg
                          width="25"
                          height="25"
                          viewBox="0 0 25 25"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_73_952)">
                            <path
                              d="M21.7828 19.7083H23.8574V21.7829H1.03723V19.7083H3.11179V4.14913C3.11179 3.87402 3.22107 3.61019 3.4156 3.41566C3.61013 3.22113 3.87396 3.11185 4.14907 3.11185L14.5219 3.11185C14.797 3.11185 15.0608 3.22113 15.2553 3.41566C15.4499 3.61019 15.5591 3.87402 15.5591 4.14913V19.7083H19.7083V11.4101H17.6337V9.33552H20.7455C21.0206 9.33552 21.2845 9.4448 21.479 9.63933C21.6735 9.83386 21.7828 10.0977 21.7828 10.3728V19.7083ZM5.18635 5.1864V19.7083H13.4846V5.1864H5.18635ZM7.2609 11.4101H11.41V13.4846H7.2609V11.4101ZM7.2609 7.26096H11.41V9.33552H7.2609V7.26096Z"
                              fill="#A5D7E8"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_73_952">
                              <rect
                                width="24.8947"
                                height="24.8947"
                                fill="white"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                        Department:
                      </strong>
                      <strong className={styles.detailStrong}>
                        {profile.department}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== POSTS ===== */}
          <div className="bp-section">
            <h3>{isOwnProfile ? "My Posts" : `${profile.name}'s Posts`}</h3>

            {postsLoading ? (
              <p>Loading...</p>
            ) : posts.length === 0 ? (
              <p>No posts yet.</p>
            ) : (
              <div className="bp-posts-grid">
                {posts.map((post) => (
                  <TrendingPost key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* ===== EDIT MODAL ===== */}
          {isOwnProfile && isVisible && (
            <div className={styles.overlay}>
              <div className={styles.editProfile}>
                <RxCross2 onClick={() => setIsVisible(false)} />
                <h3>Edit Profile</h3>
                <input type="file" />
                <input placeholder="Caption" />
                <input placeholder="Roll No" />
                <input placeholder="Hall" />
                <input placeholder="Department" />
                <button onClick={() => setIsVisible(false)}>Save</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Body;