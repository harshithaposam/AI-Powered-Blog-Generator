import React, { useState, useEffect } from "react";
import "./login.css";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useHistory } from "react-router-dom"; // Import useNavigate for navigation

import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null); // State to manage the user
  const history = useHistory(); // Initialize useNavigate

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      history.push("/"); // Redirect to home page
    } catch (error) {
     
      toast.error(`${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
        await signOut(auth); // Attempt to log the user out
        toast.success("Logout successful!"); // Show a toast on success
        history.push("/login"); // Redirect to the login page
    } catch (error) {
        console.error("Logout error:", error); // Log the error for debugging
        toast.error(`Logout failed: ${error.message}`); // Show error toast
    }
};



  return (
    <section className="login">
      <div className="container">
            <div className="text">
            <h3>Login</h3>
            <h1>My account</h1>
          </div>
    

        {!user ? (
          <form onSubmit={handleLogin}>
            <span>Email *</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span>Password *</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="button">Log in</button>
          </form>
        ) : (
          <div>
            <p>Welcome, {user.email}!</p>
            <button className="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
       <div className="signup-link">
<p>Don't have an account?</p>
<Link to="/register" className="link">Sign up here</Link>
</div>
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




// import React, { useState } from "react";
// import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
// import { initializeApp } from "firebase/app";
// import personIcon from "../../assets/images/person.png";
// import emailIcon from "../../assets/images/email.png";
// import passwordIcon from "../../assets/images/password.png";
// import "./login.css";
// import { useNavigate } from "react-router-dom"; 
// // Firebase Configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBLPD0b2GlgnYk4V0iz-fzbbqq8gDt0His",
//   authDomain: "dbms-4a089.firebaseapp.com",
//   projectId: "dbms-4a089",
//   storageBucket: "dbms-4a089.appspot.com",
//   messagingSenderId: "469729546773",
//   appId: "1:469729546773:web:193ba32dc6aa4b52acf41c",
//   measurementId: "G-BF3STH7FWY",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// export const LoginSignup = () => {
//   const [username, setUsername] = useState(""); // For Sign Up
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isSignUp, setIsSignUp] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate(); 
//   // Handle form submission for Login or Sign Up
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null); // Reset error on new attempt

//     try {
//       if (isSignUp) {
//         // Sign Up Flow
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         console.log("Sign Up Successful:", user);

//         alert("Sign Up Successful!");
//         // Optional: Save username to backend or Firebase user profile if needed
//       } else {
//         // Login Flow
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         console.log("Login Successful:", user);
//         navigate("/");
//         const idToken = await user.getIdToken();
//         // Token verification with backend
//         const response = await fetch("http://127.0.0.1:5000/verify-token", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${idToken}`,
//           },
//           body: JSON.stringify({ token: idToken }),
//         });

//         const result = await response.json();
//         if (response.ok) {
//           console.log("Token verification result:", result);
//           alert("Login Successful and Token Verified!");
//         } else {
//           throw new Error(result.message || "Token verification failed");
//         }
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "An error occurred");
//     }
//   };

//   return (
//     <div className="container">
//       <div className="header">
//         <div className="text">{isSignUp ? "Sign Up" : "Login"}</div>
//         <div className="underline"></div>
//       </div>
//       <form className="inputs" onSubmit={handleSubmit}>
//         {isSignUp && (
//           <div className="input">
//             <img src={personIcon} alt="Person Icon" />
//             <input
//               type="text"
//               placeholder="Enter Username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               aria-label="Name"
//               required
//             />
//           </div>
//         )}
//         <div className="input">
//           <img src={emailIcon} alt="Email Icon" />
//           <input
//             type="email"
//             placeholder="Enter Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             aria-label="Email"
//             required
//           />
//         </div>
//         <div className="input">
//           <img src={passwordIcon} alt="Password Icon" />
//           <input
//             type="password"
//             placeholder="Enter Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             aria-label="Password"
//             required
//           />
//         </div>
//         <div className="submit-container">
//           <button type="submit" className="submit">
//             {isSignUp ? "Sign Up" : "Login"}
//           </button>
//         </div>
//       </form>
//       <p className="forgot-password">
//         {isSignUp ? "Already have an account?" : "Don't have an account?"}
//         <span onClick={() => setIsSignUp(!isSignUp)}>
//           {isSignUp ? " Login" : " Sign Up"}
//         </span>
//       </p>
//       {error && <p className="error">{error}</p>}
//     </div>
//   );
// };

// //export default LoginSignup;

