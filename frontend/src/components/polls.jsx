import { useState, useEffect } from "react";
import { BsBarChartLine } from "react-icons/bs";
import { FaCheckCircle, FaTrophy } from "react-icons/fa";
import "./polls.css";
import Navbar from "./Navbar";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "";

function Polls() {
  // polls come entirely from the DB — no hardcoded list
  const [polls, setPolls] = useState([]);
  const [inputs, setInputs] = useState({}); // { [title]: display string }
  const [rollnoMap, setRollnoMap] = useState({}); // { [title]: actual rollno to submit }
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
      const { data } = await axios.get(`${API}/api/polls/getall`, {
        headers: authHeaders,
      });
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

  // Debounced search — fires 400ms after the user stops typing
  const handleInputChange = (title, value) => {
    setInputs((prev) => ({ ...prev, [title]: value }));
    setErrors((prev) => ({ ...prev, [title]: "" }));
    // If user edits the field after selecting a suggestion, clear the stored rollno
    setRollnoMap((prev) => ({ ...prev, [title]: "" }));

    if (value.length < 2) {
      setSearchResults((prev) => ({ ...prev, [title]: [] }));
      return;
    }

    clearTimeout(window[`pollSearch_${title}`]);
    window[`pollSearch_${title}`] = setTimeout(async () => {
      try {
        setSearchLoading((prev) => ({ ...prev, [title]: true }));
        const { data } = await axios.get(
          `${API}/api/users/search?q=${encodeURIComponent(value)}`,
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

  // When a user clicks a suggestion — store name for display, rollno for submission
  const selectCandidate = (title, rollno, name) => {
    setInputs((prev) => ({ ...prev, [title]: `${name} (${rollno})` }));
    setRollnoMap((prev) => ({ ...prev, [title]: rollno }));
    setSearchResults((prev) => ({ ...prev, [title]: [] }));
  };

  const handleSubmit = async (title, e) => {
    e.preventDefault();
    // Use the selected rollno; fall back to raw input (in case user typed directly)
    const candirollno = (rollnoMap[title] || inputs[title] || "").trim();

    if (!candirollno) {
      setErrors((prev) => ({
        ...prev,
        [title]: "Please search and select a classmate.",
      }));
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, [title]: true }));
      setErrors((prev) => ({ ...prev, [title]: "" }));

      await axios.post(
        `${API}/api/polls/addvote`,
        { title, candirollno },
        { headers: authHeaders },
      );

      // Refresh to get updated hasVoted + totalVotes from server
      await fetchPolls();

      // Clear inputs for this poll
      setInputs((prev) => {
        const n = { ...prev };
        delete n[title];
        return n;
      });
      setRollnoMap((prev) => {
        const n = { ...prev };
        delete n[title];
        return n;
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit vote.";
      setErrors((prev) => ({ ...prev, [title]: msg }));
    } finally {
      setSubmitting((prev) => ({ ...prev, [title]: false }));
    }
  };

  const votedCount = polls.filter((p) => p.hasVoted).length;
  const totalPolls = polls.length;

  return (
    <>
      <Navbar />
      <div className="main-body">
        <div className="content">
          <h3 className="header animate-title">Yearbook Polls</h3>

          {/* Progress bar */}
          {!isLoading && totalPolls > 0 && (
            <div className="polls-progress-wrap">
              <p className="polls-description">
                You've voted in <strong>{votedCount}</strong> of{" "}
                <strong>{totalPolls}</strong> polls. Type a name or roll number
                to search your classmate.
              </p>
              <div className="polls-progress-bar">
                <div
                  className="polls-progress-fill"
                  style={{ width: `${(votedCount / totalPolls) * 100}%` }}
                />
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p>Loading polls…</p>
            </div>
          ) : (
            <div className="poll_container">
              {polls.map((poll, index) => {
                const results = searchResults[poll.title] || [];
                return (
                  <div
                    key={poll._id}
                    className={`option ${poll.hasVoted ? "option--voted" : ""}`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    {/* Header */}
                    <div className="info">
                      <span className="icon">
                        <BsBarChartLine size={15} />
                      </span>
                      <span className="name">
                        <h4>{poll.title}</h4>
                        <small className="vote-count-badge">
                          {poll.totalVotes} vote
                          {poll.totalVotes !== 1 ? "s" : ""}
                        </small>
                      </span>
                      {poll.hasVoted && (
                        <FaCheckCircle
                          className="voted-checkmark"
                          title="You voted"
                        />
                      )}
                    </div>

                    {/* Top nominees mini-leaderboard */}
                    {poll.topNominees && poll.topNominees.length > 0 && (
                      <div className="top-nominees">
                        {poll.topNominees.map((n, i) => (
                          <span key={i} className="nominee-chip">
                            {i === 0 && (
                              <FaTrophy
                                style={{ color: "#ffd700", marginRight: 3 }}
                              />
                            )}
                            {n.rollno} <em>({n.count})</em>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Voted state — show who they nominated */}
                    {poll.hasVoted ? (
                      <div className="submission-result">
                        <FaCheckCircle
                          style={{ color: "#74c0fc", marginRight: 6 }}
                        />
                        Your nomination: <strong>{poll.votedFor}</strong>
                      </div>
                    ) : (
                      /* Voting form */
                      <form
                        onSubmit={(e) => handleSubmit(poll.title, e)}
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
                              value={inputs[poll.title] || ""}
                              onChange={(e) =>
                                handleInputChange(poll.title, e.target.value)
                              }
                              autoComplete="off"
                            />
                            <button
                              type="submit"
                              className="submit_btn"
                              disabled={submitting[poll.title]}
                            >
                              {submitting[poll.title] ? "…" : "Vote"}
                            </button>
                          </div>

                          {/* Search dropdown */}
                          {results.length > 0 && (
                            <ul className="poll-search-dropdown">
                              {results.map((user) => (
                                <li
                                  key={user.rollno}
                                  onMouseDown={() =>
                                    selectCandidate(
                                      poll.title,
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

                          {searchLoading[poll.title] && (
                            <div className="poll-search-loading">
                              Searching…
                            </div>
                          )}
                        </div>

                        {errors[poll.title] && (
                          <p className="poll-error">{errors[poll.title]}</p>
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
