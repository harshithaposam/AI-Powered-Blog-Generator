import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export const Recommendations = ({ userId }) => {
  const [recommendations, setRecommendations] = useState({
    similar_content_blogs: [],
    similar_users_blogs: [],
    trending_blogs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/recommendations/${userId}`)
      .then((response) => {
        setRecommendations(response.data);
      })
      .catch((error) => console.error("Error fetching recommendations:", error))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p className="text-center text-gray-500">Loading recommendations...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* <h2 className="text-xl font-semibold mb-4">📌 Blogs You Might Like</h2>
      <ul className="space-y-2">
        {recommendations.similar_content_blogs.length > 0 ? (
          recommendations.similar_content_blogs.map((blog) => (
            <li key={blog.post_id} className="p-3 bg-gray-100 rounded-md hover:bg-gray-200 transition"   style={{
              marginTop: "10px",
              backgroundColor: "rgb(229, 238, 229)", // Light gray background
              padding: "15px",
              borderRadius: "10px",
              borderLeft: "5px solid rgb(38, 43, 38)", // Green left border for highlight
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Light shadow for depth
            }} >
              <Link to={`/details/${blog.post_id}`} className="text-blue-600 font-medium">
                {blog.title}
              </Link>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No similar content blogs found.</p>
        )}
      </ul> */}

      <h2 className="text-xl font-semibold mt-6 mb-4">👥 Readers Also Liked</h2>
      <ul className="space-y-2" >
        {recommendations.similar_users_blogs.length > 0 ? (
          recommendations.similar_users_blogs.map((blog) => (
            <li key={blog.post_id || blog} className="p-3 bg-gray-100 rounded-md hover:bg-gray-200 transition"   
            style={{
              marginTop: "10px",
              backgroundColor: "rgb(229, 238, 229)", // Light gray background
              padding: "15px",
              borderRadius: "10px",
              borderLeft: "5px solid rgb(38, 43, 38)", // Green left border for highlight
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Light shadow for depth
            }}>
              <Link to={`/details/${blog.post_id || blog}`} className="text-blue-600 font-medium">
                {blog.title}
              </Link>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No similar user blogs found.</p>
        )}
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-4">🔥 Trending Blogs</h2>
      <ul className="space-y-2">
        {recommendations.trending_blogs.length > 0 ? (
          recommendations.trending_blogs.map((blog) => (
            <li key={blog.post_id} className="p-3 bg-gray-100 rounded-md hover:bg-gray-200 transition"    style={{
              marginTop: "10px",
              backgroundColor: "rgb(229, 238, 229)", // Light gray background
              padding: "15px",
              borderRadius: "10px",
              borderLeft: "5px solid rgb(38, 43, 38)", // Green left border for highlight
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Light shadow for depth
            }}>
              <Link to={`/details/${blog.post_id}`} className="text-blue-600 font-medium">
                {blog.title}
              </Link>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No trending blogs found.</p>
        )}
      </ul>
    </div>
  );
}; 