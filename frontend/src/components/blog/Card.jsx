import React from "react";
import "./blog.css";
import { AiOutlineTags } from "react-icons/ai";
import { Link } from "react-router-dom";

export const Card = ({ blogs }) => {
  return (
    <section className="blog">
      <div
        className="container grid3"
        style={{
          backgroundSize: "cover",
          backgroundColor: "#00053D",
          backgroundImage:"url('https://images.pexels.com/photos/733853/pexels-photo-733853.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1') no-repeat center center fixed",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          height: "100%",
        }}
      >
        {blogs.length === 0 ? (
          <p style={{ color: "white" }}>No blogs available for this category.</p>
        ) : (
          blogs.map((item) => (
            <div className="box boxItems" key={item.post_id}>
              <div className="details">
                <div className="tag">
                  <AiOutlineTags className="icon" />
                  <a href="/">{`#${item.category}`}</a>
                </div>

                <Link to={`/details/${item.post_id}`} className="link">
                  <h3>{item.title}</h3>
                </Link>

                {item?.image_url ? (
                  <img
                    src={item.image_url}
                    alt={`${item.title}`}
                    className="blog-image"
                    style={{ maxWidth: "100%" }}
                  />
                ) : (
                  <p>No image available</p>
                )}

                <p>
                  {item.content
                    ? item.content.slice(0, 180)
                    : "No description available..."}
                  ...
                </p>

                <div className="date">
                  <label>{item.created_at || "No date available"}</label>
                </div>

                <div className="metrics">
                  <span>Likes: {item.likes_count || 0}</span>
                  <span>Comments: {item.comments_count || 0}</span>
                  <span>Shares: {item.shares_count || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
