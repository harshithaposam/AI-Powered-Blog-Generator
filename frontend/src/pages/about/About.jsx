import React, { useState, useEffect } from "react";
import save_earth from "../../assets/images/save_earth.png";
import logo from "../../assets/images/logo.png";
import "./about.css";
import Card from "./Card2";
import { useHistory } from "react-router-dom";

export const About = () => {
  const colors = [
    "#ffffff",
    "#fcfcfc",
    "#e4f7f0",
    "#d1f0e5",
    "#bee6d8",
    "#d1f0e5",
    "#e4f7f0",
    "#fcfcfc",
  ];
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const history = useHistory();
  useEffect(() => {
    const changeColor = () => {
      setCurrentColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    };
    const interval = setInterval(changeColor, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="about-container"
      style={{ backgroundColor: colors[currentColorIndex] }}
    >
      <img src={logo} className="logo" alt="ClimateConnect Logo" />

      <div className="hero-section">
        <h2 className="hero-content">
          <p className="about-title">About Us</p>
          Welcome
          <p className="hero-subtitle">
            – your go-to platform for exploring insights and stories about
            climate change, technology advancements, and health innovations.
            Discover expert opinions, research-backed articles, and AI-driven
            insights tailored for a sustainable and healthier future.
          </p>
          <button
            className="get-started-button"
            onClick={() => history.push("/")}
          >
            Explore Now
          </button>
        </h2>
        {/* <img src={save_earth} className="hero-image" alt="Save Earth Illustration" /> */}
      </div>

      <div className="vision-section">
        <h2 className="vision-title">Our Vision</h2>
        <p className="vision-text">
          We envision a world where knowledge empowers action. Whether it's
          climate change, cutting-edge technology, or health & wellness – we aim
          to create an informed and engaged community.
        </p>
      </div>

      <div className="offers-section">
        <h2 className="offers-title">What We Offer</h2>
        <div className="card-container">
          <Card
            heading="1. Blog Categories for Everyone"
            text="Explore insightful blogs on Climate Change, Technology, Health, and Sustainability."
            marginLeft="auto"
            marginRight="auto"
          />
          <Card
            heading="2. AI-Powered Summarization"
            text="Get quick takeaways with AI-driven summaries of lengthy articles."
            marginLeft="auto"
            marginRight="auto"
          />
          <Card
            heading="3. Sentiment Analysis"
            text="Understand global opinions on various topics with real-time sentiment insights."
            marginLeft="auto"
            marginRight="auto"
          />
          <Card
            heading="4. Personalized Content Recommendations"
            text="Discover articles that align with your interests and reading patterns."
            marginLeft="auto"
            marginRight="auto"
          />
          <Card
            heading="5. Respectful Discussions"
            text="Enjoy a moderated space with automatic foul language detection for a positive experience."
            marginLeft="auto"
            marginRight="auto"
          />
        </div>

        <div className="divider"></div>
        <p className="join-text">
          Join us on this journey as we harness innovation, amplify diverse
          voices, and take meaningful steps toward a better future.
        </p>
      </div>

      <div className="footer">
        {/* <p className="copyright">© 2024 ClimateConnect Inc., All rights reserved.</p> */}
      </div>
    </div>
  );
};

export default About;
