import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const EditBlog = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState({ title: "", content: "", image_url: "" });
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const history = useHistory();
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
    if (userId) {
      axios
        .get(`http://localhost:5000/api/blogs/${id}`, {
          headers: { "User-ID": userId },
        })
        .then((response) => setBlog(response.data))
        .catch((error) => {
          console.error("Error fetching blog:", error);
          setError("Failed to load blog details.");
        });
    }
  }, [id, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlog((prevBlog) => ({ ...prevBlog, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    axios
      .put(`http://localhost:5000/api/blogs/${id}`, blog, {
        headers: { "User-ID": userId },
      })
      .then(() => {
        alert("Blog updated successfully!");
        history.push(`/details/${id}`); // Redirect back to the blog details page
      })
      .catch((error) => {
        console.error("Error updating blog:", error);
        setError("Failed to update blog. Please try again.");
      });
  };

  if (!blog) return <p>Loading...</p>;

  return (
    <section className="editBlog">
      <div className="container">
        {error && <p className="error">{error}</p>}
        <h1>Edit Blog</h1>
        <form onSubmit={handleSave}>
          <div>
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={blog.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Content:</label>
            <textarea
              name="content"
              value={blog.content}
              onChange={handleInputChange}
              rows="10"
              required
            />
          </div>
          <div>
            <label>Image URL:</label>
            <input
              type="text"
              name="image_url"
              value={blog.image_url}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">Save Changes</button>
        </form>
      </div>
    </section>
  );
};
