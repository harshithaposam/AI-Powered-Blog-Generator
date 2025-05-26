import React, { useEffect, useState } from "react";
import "../../components/blog/blog.css";
import { Link } from "react-router-dom";
import { AiOutlineTags } from "react-icons/ai";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Add onAuthStateChanged
import { useHistory } from "react-router-dom";

export const Card1 = () => {
 const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [user, setUser] = useState(null);
 const history = useHistory();

  // Handle authentication state
 useEffect(() => {
   const auth = getAuth();
   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
     setUser(currentUser);
     if (!currentUser) {
       history.push("./login");
       setLoading(false);
     }
   });
    // Cleanup subscription
   return () => unsubscribe();
 }, []);
  // Fetch bookmarks after authentication is confirmed
 useEffect(() => {
   const fetchBookmarkedBlogs = async () => {
     if (!user) return;
      try {
       setLoading(true);
       const response = await axios.get(
         `http://localhost:5000/api/bookmarks/${user.uid}`
       );
        if (response.data.bookmarked_blogs) {
         setBookmarkedBlogs(response.data.bookmarked_blogs);
       }
       setLoading(false);
     } catch (error) {
       console.error("Error fetching bookmarked blogs:", error);
       setError("Failed to load bookmarked blogs");
       setLoading(false);
     }
   };
    fetchBookmarkedBlogs();
 }, [user]); // Depend on user instead of running once

  if (loading) return (
   <div className="loading">
     <div className="spinner"></div>
     Loading...
   </div>
 );
 
 if (error) return (
   <div className="error-container">
     <div className="error-message">{error}</div>
   </div>
 );
  return (
   <section className="blog">
           <div className="container grid3"  style={{
       
        backgroundSize: "cover", // Ensures the image covers the whole container
        backgroundColor: "#00053D",
        backgroundPosition: "center", // Centers the image
        backgroundAttachment: "fixed", // Keeps the background fixed while scrolling
        height: "100%", // Makes sure it takes up the full container height
        marginTop: "100px" ,
        marginBottom: "100px"
      }}>
       {bookmarkedBlogs.length === 0 ? (
         <div className="no-bookmarks"  style={{ color: '#FFFFFF' }}>No bookmarked blogs found</div>
       ) : (
         bookmarkedBlogs.map((blog) => (
           <div className="box boxItems" key={blog.post_id}>
             <div className="details">
               <div className="tag">
                 <AiOutlineTags className="icon" />
                 <a href="/">{`#${blog.category}`}</a>
               </div>
                <Link to={`/details/${blog.post_id}`} className="link">
                 <h3>{blog.title}</h3>
               </Link>
                {blog?.image_url ? (
                 <img
                   src={blog.image_url}
                   alt="Blog"
                   className="blog-image"
                   style={{ maxWidth: "100%" }}
                 />
               ) : (
                 <p >No image available</p>
               )}
                <p>
                 {blog.content
                   ? blog.content.slice(0, 180) + "..."
                   : "No description available..."}
               </p>
                <div className="date">
                 <label>Posted: {blog.created_at}</label>
                 <label>Bookmarked: {blog.bookmark_date}</label>
               </div>
              
             </div>
           </div>
         ))
       )}
     </div>
   </section>
 );
};