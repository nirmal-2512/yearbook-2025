import { useState, useEffect } from "react";
import { BsBarChartLine } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";
import "./polls.css";
import Navbar from "./Navbar";
import axios from "axios";

const POLL_TITLES = [
  "Nightangle of the batch",
  "Richie Rich",
  "Protein Master of the batch",
  "The Wifi Magnet",
  "Jugaadu of the batch",
  "High on life",
  "The Algorithm Alchemist",
  "Neta of the batch",
  "Sleep Scheduler",
  "Shinchan of the batch",
  "Social Butterfly",
  "Bob Marley of the batch",
  "Swagmaster of the batch",
  "Jetha lal of the batch",
  "Naina Talwaar of the Batch",
];

function Polls() {
  const [polls, setPolls] = useState([]);
  const [inputs, setInputs] = useState({}); // { [title]: display string }
  const [rollnos, setRollnos] = useState({}); // { [title]: validated rollno }
  const [submitting, setSubmitting] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState({});
  const [searchLoading, setSearchLoading] = useState({});

  const token = window.localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchPolls = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/polls/getall`,
        { headers: authHeaders },
      );
      setPolls(data);
    } catch (err) {
      console.error("Failed to fetch polls:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  // FIX 1: clear the stored rollno whenever the user edits the text field
  const handleInputChange = (title, value) => {
    setInputs((prev) => ({ ...prev, [title]: value }));
    setRollnos((prev) => ({ ...prev, [title]: "" })); // ← wipe rollno on edit
    setErrors((prev) => ({ ...prev, [title]: "" }));

    if (value.length < 2) {
      setSearchResults((prev) => ({ ...prev, [title]: [] }));
      return;
    }

    clearTimeout(window[`pollSearch_${title}`]);
    window[`pollSearch_${title}`] = setTimeout(async () => {
      try {
        setSearchLoading((prev) => ({ ...prev, [title]: true }));
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/search?q=${encodeURIComponent(value)}`,
          { headers: authHeaders },
        );
        setSearchResults((prev) => ({ ...prev, [title]: data }));
      } catch {
        setSearchResults((prev) => ({ ...prev, [title]: [] }));
      } finally {
        setSearchLoading((prev) => ({ ...prev, [title]: false }));
      }
    }, 400);
  };

  // Selecting from dropdown sets both the display string and the clean rollno
  const selectCandidate = (title, rollno, name) => {
    setInputs((prev) => ({ ...prev, [title]: `${name} (${rollno})` }));
    setRollnos((prev) => ({ ...prev, [title]: rollno })); // ← store rollno separately
    setSearchResults((prev) => ({ ...prev, [title]: [] }));
    setErrors((prev) => ({ ...prev, [title]: "" }));
  };

  // FIX 2: only submit if a candidate was properly selected from the dropdown
  const handleSubmit = async (title, e) => {
    e.preventDefault();
    const candirollno = rollnos[title]?.trim();

    if (!candirollno) {
      setErrors((prev) => ({
        ...prev,
        [title]: "Please select a candidate from the suggestions.",
      }));
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, [title]: true }));
      setErrors((prev) => ({ ...prev, [title]: "" }));

      await axios.post(
        `${import.meta.env.VITE_API_URL}/polls/addvote`,
        { title, candirollno },
        { headers: authHeaders },
      );

      await fetchPolls();

      setInputs((prev) => {
        const n = { ...prev };
        delete n[title];
        return n;
      });
      setRollnos((prev) => {
        const n = { ...prev };
        delete n[title];
        return n;
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to submit vote. Please try again.";
      setErrors((prev) => ({ ...prev, [title]: msg }));
    } finally {
      setSubmitting((prev) => ({ ...prev, [title]: false }));
    }
  };

  return (
    <>
      <Navbar />
      <div className="main-body">
        <div className="content">
          <h3 className="header animate-title">Yearbook Polls</h3>
          <p className="polls-description">
            Vote for your classmates in the categories below. Search by name or
            roll number and select from the suggestions. Results will be
            published in the yearbook.
          </p>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading polls...</p>
            </div>
          ) : (
            <div className="poll_container">
              {POLL_TITLES.map((title, index) => {
                const poll = polls.find((p) => p.title === title) || {
                  title,
                  hasVoted: false,
                  votedFor: null,
                  totalVotes: 0,
                };
                const results = searchResults[title] || [];

                return (
                  <div
                    key={title}
                    className="option"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="info">
                      <span className="icon">
                        <BsBarChartLine size={15} />
                      </span>
                      <span className="name">
                        <h4>{title}</h4>
                        <small style={{ color: "#74c0fc", fontSize: "12px" }}>
                          {poll.totalVotes} vote
                          {poll.totalVotes !== 1 ? "s" : ""}
                        </small>
                      </span>
                    </div>

                    {poll.hasVoted ? (
                      <div className="submission-result">
                        <FaCheckCircle
                          style={{ color: "#74c0fc", marginRight: 6 }}
                        />
                        You nominated: <strong>{poll.votedFor}</strong>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => handleSubmit(title, e)}
                        className="input_container"
                        style={{ flexDirection: "column", gap: 8 }}
                        autoComplete="off"
                      >
                        <div style={{ position: "relative", width: "100%" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              type="text"
                              className="input_field"
                              placeholder="Search by name or roll no…"
                              value={inputs[title] || ""}
                              onChange={(e) =>
                                handleInputChange(title, e.target.value)
                              }
                              autoComplete="off"
                            />
                            <button
                              type="submit"
                              className="submit_btn"
                              disabled={submitting[title] || !rollnos[title]}
                              style={{ opacity: rollnos[title] ? 1 : 0.45 }}
                            >
                              {submitting[title] ? "…" : "Vote"}
                            </button>
                          </div>

                          {results.length > 0 && (
                            <ul className="poll-search-dropdown">
                              {results.map((user) => (
                                <li
                                  key={user.rollno}
                                  onClick={() =>
                                    selectCandidate(
                                      title,
                                      user.rollno,
                                      user.name,
                                    )
                                  }
                                >
                                  <strong>{user.name}</strong>
                                  <span>
                                    {user.rollno} · {user.department}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {searchLoading[title] && (
                            <div className="poll-search-loading">
                              Searching…
                            </div>
                          )}
                        </div>

                        {errors[title] && (
                          <p
                            style={{
                              color: "#ff6b6b",
                              fontSize: 13,
                              margin: 0,
                            }}
                          >
                            {errors[title]}
                          </p>
                        )}
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Polls;
