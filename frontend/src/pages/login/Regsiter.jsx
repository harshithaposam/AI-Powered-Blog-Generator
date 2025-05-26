import React, { useState } from "react";
import "./login.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useHistory } from "react-router-dom"; // Updated import for navigation
import back from "../../assets/images/my-account.jpg";
import { ToastContainer, toast } from "react-toastify"; // Import Toast
import "react-toastify/dist/ReactToastify.css";

export const Regsiter = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const history = useHistory(); // Updated hook for navigation

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid; // Get the Firebase UID

      // Send user details to the Flask backend
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          username,
          email,
          password
        }),
      });

      if (response.ok) {
        
        toast.success("Registrration Successful!");
        history.push("/"); // Redirect to login page after successful registration
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      // alert(`Registration failed: ${error.message}`);
      toast.error(`Registration failed: ${error.message}`);
    }
  };

  return (
    <section className="login">
      <div className="container">
    
          <img src={back} alt="" />
          <div className="text">
            <h3>Register</h3>
            <h1>My account</h1>
          </div>
       

        <form onSubmit={handleRegister}>
          <span>Email address *</span>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span>Username *</span>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <span>Password *</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span>Confirm Password *</span>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button className="button">Register</button>
        </form>
      </div>
      <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
    </section>
  );
};
