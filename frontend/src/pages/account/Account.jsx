

import React, { useState, useEffect } from "react";
import "./account.css"; // Add your styles here
import defaultProfileImage from "../../assets/images/person.png"; // Default profile image
import { useParams, useHistory } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const Account = () => {
  const [userInfo, setUserInfo] = useState({
    user_name: "",
    email_id: "",
    profile_image: defaultProfileImage, // Default image
  });

  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
  const [previewImage, setPreviewImage] = useState(null); // For profile picture preview
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

  // Fetch user info from Flask backend
  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/api/user/${userId}`) // Flask endpoint
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error("Error fetching user data:", data.error);
          } else {
            setUserInfo(data); // Set fetched user info to state
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [userId]);

  // Handle changes to form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  // Handle profile image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result); // Preview image
        setUserInfo((prevInfo) => ({
          ...prevInfo,
          profile_image: reader.result, // Temporarily store the image in state
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle edit mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Save updated user info
  const handleSave = () => {
    fetch(`http://localhost:5000/api/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInfo),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert("Error updating user info.");
        } else {
          alert(data.message); // Success message
          setIsEditing(false); // Exit edit mode
        }
      })
      .catch((error) => {
        console.error("Error updating user info:", error);
      });
  };

  return (
    <div className="account-container">
      <h1>Account Information</h1>
      <div className="profile-section">
        <img
          src="https://static-00.iconduck.com/assets.00/person-icon-1901x2048-a9h70k71.png"
          alt="Profile"
          className="profile-image"
        />
        {isEditing && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
        )}
      </div>
      <div className="info-section">
        <label>Username</label>
        <input
          type="text"
          name="user_name"
          value={userInfo.user_name}
          onChange={handleChange}
          disabled={!isEditing}
          className={!isEditing ? "readonly" : ""}
        />
        <label>Email</label>
        <input
          type="email"
          name="email_id"
          value={userInfo.email_id}
          onChange={handleChange}
          disabled={!isEditing}
          className={!isEditing ? "readonly" : ""}
        />

        <div className="button-section">
          {isEditing ? (
            <button onClick={handleSave} className="save-button">
              Save
            </button>
          ) : (
            <button onClick={handleEditToggle} className="edit-button">
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
