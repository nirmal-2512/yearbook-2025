import React, { useState } from "react";
import axios from "axios";

const TrendingPost = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
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

  // Toggle like status
  const handleLike = async (post_id) => {
    try {
      await axios.post("http://localhost:5001/api/posts/like", {
        post_id,
        liked,
      });

      if (liked) {
        setLikesCount(likesCount - 1);
      } else {
        setLikesCount(likesCount + 1);
      }

      setLiked(!liked);
    } catch (error) {
      console.log("error liking");
    }
  };

  // Toggle comments visibility
  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  // Add new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    const comment = {
      user_name: post.user_name,
      date: Date.now(),
      comment: newComment,
    };

    // Send comment to backend
    await axios.post("http://localhost:5001/api/posts/comment", {
      post_id: post._id,
      comment: newComment,
      user_name: post.user_name,
    });

    setComments([...comments, comment]);
    setNewComment("");
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="post">
      {/* Post header with profile info */}
      <div className="post-header">
        <div className="avatar-initials">{getInitials(post.user_name)}</div>

        <div className="profile-name">{post.user_name}</div>
        <div className="post-timestamp">{formatDate(post.date)}</div>
      </div>

      {/* Post image if available */}
      {post.photo_url && (
        <div className="post-image" style={{ width: "100%", height: "100%" }}>
          <img
            src={`http://localhost:5001${post.photo_url}`}
            alt="Post"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain", // Ensures the image covers the container
            }}
          />
        </div>
      )}

      {/* Post caption */}
      <div className="caption">{post.caption}</div>

      {/* Post actions (like, comment) */}
      <div className="post-actions">
        <button
          className={liked ? "liked" : ""}
          onClick={() => handleLike(post._id)} // Pass the post.id when calling handleLike
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

      {/* Comments section */}
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

          <form className="add-comment" onSubmit={(e) => handleAddComment(e)}>
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
