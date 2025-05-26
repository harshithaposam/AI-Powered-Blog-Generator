import React, { useState, useEffect } from "react";
import axios from "axios";
import "./comment.css"; // Create this CSS file for styling

const CommentsSection = ({ postId, userId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);
  const [showComments, setShowComments] = useState(false);

  // Fetch comments when the section is opened or new comments are added
  const fetchComments = async () => {
    if (postId) {
      try {
        const response = await axios.get(`http://localhost:5000/api/blogs/${postId}/comments`);
        setComments(response.data || []);
      } catch (error) {
        console.error("Failed to load comments:", error);
        setError("Failed to load comments");
      }
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setError("Comment cannot be empty.");
      return;
    }
    if (newComment.length > 300) {
      setError("Comment cannot exceed 300 characters.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${postId}/comment`,
        {
          content: newComment,
          user_id: userId,
        }
      );

      setNewComment(""); // Clear the input
      setError(null);

      // Fetch updated comments after adding a new one
      fetchComments();
    } catch (error) {
      console.error("Failed to add comment:", error.response?.data || error.message);
      setError("Failed to add comment.");
    }
  };

  return (
    <div className="post">
      {/* Comments Button */}
      <button
        className="open-comments-button"
        onClick={() => setShowComments(true)}
      >
        Comments
      </button>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section-overlay">
          <div className="comments-section">
            <button
              className="close-comments-button"
              onClick={() => setShowComments(false)}
            >
              Close
            </button>

            {/* Input for New Comment */}
            <div className="add-comment">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={handleAddComment}>Post</button>
            </div>

            {/* Error Message */}
            {error && <p className="error">{error}</p>}

            {/* Display Comments */}
            <div className="comments-list">
              {comments.map((comment, index) => (
                <div key={index} className="comment">
                  <span className="username">{comment.username}</span>{" "}
                  {comment.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
