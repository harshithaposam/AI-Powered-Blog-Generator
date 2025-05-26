import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./details.css";
import "../../components/header/header.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useHistory } from "react-router-dom";
import CommentsSection from "./CommentSection";
import { Recommendations } from "../../components/recommendations/Recommendations";
import { Card, CardContent } from "@mui/material";

export const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const history = useHistory();
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        history.push("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    setLoading(true);
    axios
      .get(`http://localhost:5000/api/blogs/${id}`, {
        headers: { "User-ID": userId },
      })
      .then((response) => {
        setBlog(response.data);
        setLikeCount(response.data.like_count);
        setIsLiked(response.data.is_liked);
        setIsBookmarked(response.data.is_bookmarked || false);
        setIsAdmin(response.data.is_admin);
        // setPost(response.data);
        console.log("Received blog data:", response.data);
        setLoading(false);
      })
      .catch(() => setError("Failed to load blog details."))
      .finally(() => setLoading(false));
  }, [id, userId]);

  const handleLike = async () => {
    const action = isLiked ? "unlike" : "like";
    console.log("Before like action:", {
      currentIsLiked: isLiked,
      action: action,
      userId: userId,
    });
    setIsLiked(!isLiked);
    setLikeCount((prevCount) => (isLiked ? prevCount - 1 : prevCount + 1));

    try {
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${id}/like`,
        {
          action: action,
          user_id: userId,
        }
      );

      console.log("Like response:", response.data.like_count); // Debug log

      setLikeCount(response.data.like_count);
      setIsLiked(response.data.isLiked);
      setError(null);
    } catch (error) {
      // Revert optimistic update
      setIsLiked(isLiked);
      setLikeCount((prevCount) => (isLiked ? prevCount + 1 : prevCount - 1));

      // console.error('Like error:', error.response?.data || error.message);
      console.error(
        "Like error:",
        error.response ? error.response.data : error.message
      );

      setError(
        error.response?.data?.error ||
          "Failed to update like status. Please try again."
      );
    }
  };

  const handleShare = async () => {
    const postId = blog.post_id;
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.content,
          url: window.location.href,
        });
        // Update share count only if the share dialog was opened
        updateShareCount(postId);
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Link copied to clipboard!"))
        .catch(() => alert("Failed to copy the link."));
    }
  };

  const updateShareCount = async (postId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${postId}/share`
      );
      console.log("Share count updated:", response.data.shares_count);
      // Optionally update the UI with the new share count
      // setShareCount(response.data.shares_count);
    } catch (error) {
      console.error(
        "Error updating share count:",
        error.response?.data || error.message
      );
    }
  };

  const handleBookmark = async () => {
    try {
      const action = isBookmarked ? "unbookmark" : "bookmark";
      console.log("Before bookmark action:", {
        currentIsBookmarked: isBookmarked,
        action: action,
        userId: userId,
      });
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${id}/bookmark`,
        {
          action: action,
          user_id: userId,
        }
      );
      console.log("Bookmark response:", response.data);
      setIsBookmarked(response.data.isBookmarked);
      setError(null);
    } catch (error) {
      console.error("Bookmark error:", error.response?.data || error.message);
      // Don't change the bookmark state if there's an error
      setError(
        error.response?.data?.error ||
          "Failed to update bookmark status. Please try again."
      );
    }
  };
  const handleSummarize = async () => {
    try {
      setIsSummarizing(true);
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${id}/summarize`,
        {
          content: blog.content,
        }
      );
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Summarization error:", error);
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!blog) return <p></p>;

  const BookmarkIcon = ({ filled }) => (
    <svg
      aria-label="Save"
      fill={filled ? "black" : "none"}
      height="24"
      viewBox="0 0 24 24"
      width="24"
      stroke="black"
      strokeWidth="2"
    >
      <polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21" />
    </svg>
  );

  console.log(
    "Author ID:",
    blog.author_id,
    "User ID:",
    userId,
    "Is Admin:",
    isAdmin
  );
  return (
    <div>
      {error && <p className="error">{error}</p>}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          textAlign: "justify",
          gap: "20px",
          marginTop: "100px",
        }}
      >
        {/* First Card - Blog Content */}
        <Card style={{ maxWidth: "800px", padding: "20px", flex: "1" }}>
          <CardContent>
            <h1 className="blog-title">{blog.title}</h1>

            <div className="bookmark-section">
              <button
                onClick={handleBookmark}
                className="bookmark-button"
                title={isBookmarked ? "Remove from saved" : "Save"}
              >
                <BookmarkIcon filled={isBookmarked} />
              </button>

              {/* Edit Button */}
              <div className="edit-section">
                {(blog.author_id === userId || isAdmin) && (
                  <button
                    className="edit-button"
                    onClick={() => history.push(`/edit/${id}`)}
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>
            </div>

            {/* Blog Image */}
            <div className="image">
              {blog?.image_url ? (
                <img
                  src={blog.image_url}
                  alt="Blog image"
                  className="blog-image"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              ) : (
                <p>No image available</p>
              )}
            </div>

            {/* Blog Content */}
            <div>
              {blog.content.split("\n").map((line, index) => (
                <React.Fragment key={`line-${index}`}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>

            {/* Metadata */}
            <div className="metadata">
              <span>Posted on: {blog.created_at || "No date available"}</span>
            </div>
            <div className="metadata">
              <span>Author: {blog.author_name || "No date available"}</span>
            </div>

            {/* Like & Share Section */}
            <div className="action-section">
              <div className="like-section">
                <button className="like-button" onClick={handleLike}>
                  {isLiked ? (
                    <span className="liked">❤️</span>
                  ) : (
                    <span className="unliked">🤍</span>
                  )}
                </button>
                <span>{likeCount} likes</span>
              </div>
              {/* Comments Section */}
              <CommentsSection
                postId={id}
                userId={userId}
                comments={comments}
                setComments={setComments}
              />
              <div className="share-section">
                <button className="share-button" onClick={handleShare}>
                  📤 Share
                </button>
              </div>
            </div>

            <div className="summary-section">
              <button
                className="summarize-button"
                onClick={handleSummarize}
                disabled={isSummarizing}
              >
                {isSummarizing ? "Summarizing..." : "📝 Generate Summary"}
              </button>
              {summary && (
                <div className="summary-content">
                  <br></br>
                  <p className="box">{summary}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Second Card - Recommendations */}
        <Card
          style={{
            maxWidth: "400px",
            padding: "20px",
            flex: "1",
            backgroundColor: "#f9f9f9",
          }}
        >
          <CardContent>
            <h2 className="text-left text-xl font-bold">Author </h2>

            <div
              className="author-section flex flex-col justify-center mt-4 cursor-pointer"
              onClick={() => history.push(`/authors/${blog.author_id}`)}
            >
              <div className="image_profile w-16 h-16 items-center rounded-full overflow-hidden bg-gray-200">
                <img
                  className="w-full h-full object-cover"
                  src="https://static-00.iconduck.com/assets.00/person-icon-1901x2048-a9h70k71.png"
                  alt="Author"
                />
                <div className="text-lg font-semibold text-gray-900 mt-2">
                  {blog.author_name || "Unknown Author"}
                </div>
              </div>
            </div>

            {/* <Typography variant="h5">Recommended Blogs</Typography> */}
            <Recommendations userId={userId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
