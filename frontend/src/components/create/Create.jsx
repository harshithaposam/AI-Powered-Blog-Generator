
import React, { useState } from "react";
import axios from "axios"; // To make HTTP requests
import { getAuth } from "firebase/auth";
import { useHistory } from "react-router-dom";
import "./create.css"

export const CreateBlog = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image_url, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null; // Get the current user's UID
const history=useHistory();
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("User is not authenticated. Please log in.");
      return;
    }
    // Data to send to the backend
    const blogData = {
      title,
      content,
      image_url,
      category,
      user_id: userId,
    };

    setIsSubmitting(true);


    try {
      const response = await axios.post("http://localhost:5000/api/blogs", blogData);

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Blog created successfully!");
        // Reset form fields after successful submission
        setTitle("");
        setContent("");
        setImageUrl("");
        setCategory("")
          history.push("/");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || "An error occurred while creating the blog.");
      } else {
        setError("An error occurred. Please check your network and try again.");
      }
    }
    
  };



  return (
 
    <section className="blog-container">
  
    
      <form onSubmit={handleSubmit}>
        <div className="input-field">
          <label>Title</label>
          <input
            type="text"
            placeholder="Enter Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="input-field">
          <label>Content</label>
          <textarea
            placeholder="Enter Blog Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div className="input-field">
          <label>Image URL</label>
          <input
            type="text"
            placeholder="Enter Image URL"
            value={image_url}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
        </div>
        <div className="input-field">
  <label>Category</label>
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    required
  >
    <option value="" disabled>
      Select a category
    </option>
    <option value="Technology">Tech</option>
    <option value="Climate">Climate</option>
    <option value="Health">Health</option>
    <option value="Placement">Placement</option>
    <option value="Travel">Travel</option>
    {/* Add more categories as needed */}
  </select>
</div>

        <button className="create-blog-button" type="submit" disabled={isSubmitting}>
      
    {isSubmitting ? "Creating..." : "Create Blog"}
  </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

    </section>
 
  );
};
