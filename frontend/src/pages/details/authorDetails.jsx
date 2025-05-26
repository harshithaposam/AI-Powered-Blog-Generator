import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  
} from "@mui/material";

export const AuthorDetails = () => {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/authors/${authorId}`)
      .then((response) => {
        setAuthor(response.data.author);
        setBlogs(response.data.blogs);
        console.log(response)
      })
      .catch((err) => {
        console.error("Error fetching author details:", err);
        setError("Failed to fetch author details. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [authorId]);

  if (loading) return <p>Loading author details...</p>;

  if (error) return <p>{error}</p>;

  if (!author) return <p>No author details found.</p>;

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "20px" ,marginTop: "100px" }}>
      {/* Author Details Card */}
      <Card style={{ flex: "1", maxWidth: "400px", padding: "20px" }}>
        <CardContent>
          <div style={{ textAlign: "center" }}>
            <img
              src="https://static-00.iconduck.com/assets.00/person-icon-1901x2048-a9h70k71.png"
              alt={author.name || "Author"}
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                marginBottom: "20px",
              }}
            />
            <Typography variant="h5">{author.name || "Unknown Author"}</Typography>
        
            <Typography variant="body2" style={{ marginTop: "10px", color: "black"  }}>
              Email: {author.email_id || "Not provided"}
            </Typography>
            {/* <Typography variant="body2" style={{ marginTop: "10px" }}>
              Joined: {new Date(author.created_at).toLocaleDateString()}
            </Typography> */}
            <Typography variant="body2" style={{ marginTop: "15px", fontStyle: "italic", textAlign: "justify", color: "black" }}>
  {author.bio ||
    `Dedicated to sustainability, ${author.name} writes about climate change, renewable energy, and eco-friendly innovations. Their blog highlights pressing environmental issues and practical solutions for a greener future. Through research-driven insights, they aim to inspire individuals and businesses to adopt sustainable practices.`}
</Typography>
          </div>
        </CardContent>
      </Card>

      {/* Blogs Card */}
      <Card style={{ flex: "1", maxWidth: "600px", padding: "20px" }}>
        <CardContent>
          <Typography variant="h5">Blogs by {author.name || "this author"}</Typography>
          <div style={{ marginTop: "20px" }}>
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <div
                  key={blog.id}
                  // style={{
                  //   marginBottom: "15px",
                  //   padding: "10px",
                  //   backgroundColor: "#f9f9f9",
                  //   borderRadius: "8px",
                  //   boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  // }}
                  style={{
                    marginTop: "10px",
                    backgroundColor: "rgb(229, 238, 229)", // Light gray background
                    padding: "15px",
                    borderRadius: "10px",
                    borderLeft: "5px solid rgb(38, 43, 38)", // Green left border for highlight
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Light shadow for depth
                  }}
                >
                  <Link to={`/details/${blog.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <Typography variant="h6" style={{ marginBottom: "5px" }}>
                      {blog.title}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#777" }}>
                      Published on: {new Date(blog.created_at).toLocaleDateString()}
                    </Typography>
                  </Link>
                </div>
              ))
            ) : (
              <Typography variant="body2">
                {author.name || "This author"} has not written any blogs yet.
              </Typography>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

