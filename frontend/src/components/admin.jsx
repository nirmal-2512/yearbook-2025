import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import defaultPic from "../img/proIcon.png";
import "./admin.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = window.localStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:5001/users/allusers`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        alert("You are not authorized or session expired.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.rollno?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleViewProfile = (user) => {
    navigate("/profile", { state: { rollno: user.rollno } });
  };

  const handleGiveTestimonial = (user) => {
    navigate("/writetestimonial", { state: { rollno: user.rollno } });
  };

  return (
    <>
      <Navbar />
      <div className="main-body">
        <div className="content">
          <div className="admin-container">
            <h2 className="admin-title">
              Admin Panel — All Users ({users.length})
            </h2>

            <input
              type="text"
              className="admin-search"
              placeholder="Search by name, roll no, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="admin-no-results">No users found.</p>
            ) : (
              <div className="admin-cards-grid">
                {filtered.map((user) => (
                  <div className="admin-card" key={user._id}>
                    {/* Left - Photo */}
                    <div className="admin-card-photo">
                      <img
                        src={
                          user.pro_pic
                            ? `http://localhost:5001/users/${user.pro_pic}`
                            : defaultPic
                        }
                        alt={user.name}
                        onError={(e) => {
                          e.target.src = defaultPic;
                        }}
                      />
                    </div>

                    {/* Right - Info + Buttons */}
                    <div className="admin-card-right">
                      <div className="admin-card-info">
                        <h5 className="admin-card-name">{user.name}</h5>
                        <p className="admin-card-text">{user.rollno || "—"}</p>
                        <p className="admin-card-text">{user.HOR || "—"}</p>
                        <p className="admin-card-text">
                          {user.department || "—"}
                        </p>
                      </div>
                      <div className="admin-card-actions">
                        {/* <button
                          className="admin-btn admin-btn-testimonial"
                          onClick={() => handleGiveTestimonial(user)}
                        >
                          Write Testimonial
                        </button> */}
                        <button
                          className="admin-btn admin-btn-view"
                          onClick={() => handleViewProfile(user)}
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
