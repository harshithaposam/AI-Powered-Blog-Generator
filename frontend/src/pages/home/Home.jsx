import React, { useEffect, useState } from "react";
import { Card } from "../../components/blog/Card";
import { Category } from "../../components/category/Category";
import axios from "axios";

export const Home = () => {
  const [allBlogs, setAllBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/blogs") // Replace with your API endpoint
      .then((response) => {
        setAllBlogs(response.data);
        setFilteredBlogs(response.data); // Show all blogs initially
      })
      .catch((error) => console.error("Error fetching blogs:", error));
  }, []);

  const handleCategorySelect = (category) => {
    if (category === "All") {
      setFilteredBlogs(allBlogs);
    } else {
      setFilteredBlogs(allBlogs.filter((blog) => blog.category === category));
    }
  };

  return (
    <div className="home-background" style={{ backgroundImage: "url('https://images.pexels.com/photos/733853/pexels-photo-733853.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1') no-repeat center center fixed", height: "100%" }}>
      <Category onCategorySelect={handleCategorySelect} />
      <Card blogs={filteredBlogs} />
    </div>
  );
};
