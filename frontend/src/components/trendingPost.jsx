import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Decode the current user's ID from their JWT once (outside component — stable reference)
const getCurrentUserId = () => {
  try {
    const token = window.localStorage.getItem("token");
    if (!token) return null;
    return jwtDecode(token).id;
  } catch {
    return null;
  }
};

const TrendingPost = ({ post }) => {
  const currentUserId = getCurrentUserId();

  // Derive initial liked state from real DB data — survives page refreshes
  const [likedBy, setLikedBy] = useState(post.likedBy || []);
  const liked = likedBy.includes(currentUserId);
  const likesCount = likedBy.length;

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleLike = async (post_id) => {
    if (!currentUserId) return; // Not logged in — button is inert

    const token = window.localStorage.getItem("token");

    // Optimistic UI update
    if (liked) {
      setLikedBy(likedBy.filter((id) => id !== currentUserId));
    } else {
      setLikedBy([...likedBy, currentUserId]);
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/like`,
        { post_id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      // Roll back optimistic update on failure
      setLikedBy(likedBy);
      console.error("Error updating like:", error);
    }
  };

  const handleToggleComments = () => setShowComments(!showComments);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    const comment = {
      user_name: post.user_name,
      date: Date.now(),
      comment: newComment,
    };

    await axios.post(`${import.meta.env.VITE_API_URL}/posts/comment`, {
      post_id: post._id,
      comment: newComment,
      user_name: post.user_name,
    });

    setComments([...comments, comment]);
    setNewComment("");
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="post">
      <div className="post-header">
        <div className="avatar-initials">{getInitials(post.user_name)}</div>
        <div className="profile-name">{post.user_name}</div>
        <div className="post-timestamp">{formatDate(post.date)}</div>
      </div>

      {post.photo_url && (
        <div className="post-image" style={{ width: "100%", height: "100%" }}>
          <img
            src={`${import.meta.env.VITE_API_URL}${post.photo_url}`}
            alt="Post"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      )}

      <div className="caption">{post.caption}</div>

      <div className="post-actions">
        <button
          className={liked ? "liked" : ""}
          onClick={() => handleLike(post._id)}
          title={liked ? "Unlike" : "Like"}
        >
          {liked ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="#A5D7E8"
              stroke="#A5D7E8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          )}
          <span className="like-count">{likesCount}</span>
        </button>

        <button onClick={handleToggleComments}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <span className="like-count">{comments.length}</span>
        </button>
      </div>

      {showComments && (
        <div className="comment-section">
          <div className="comments-header">
            {comments.length > 0
              ? `${comments.length} Comment${comments.length !== 1 ? "s" : ""}`
              : "No comments yet"}
          </div>

          {comments.map((comment, index) => (
            <div key={index} className="comment">
              <div className="comment-avatar">
                {getInitials(comment.user_name)}
              </div>
              <div className="comment-content">
                <div className="comment-author">{comment.user_name}</div>
                <div className="comment-text">{comment.comment}</div>
              </div>
            </div>
          ))}

          <form className="add-comment" onSubmit={handleAddComment}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="post-btn">
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TrendingPost;
