// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";

// import "./header.css";
// import { nav } from "../../assets/data/data";
// import { auth } from "../../firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { User } from "./User";
// import { GoogleTranslate }  from "./GoogleTranslate"



// // Main Header component
// export const Header = () => {
//   console.log("Header rendered");
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setIsLoggedIn(!!user);
//     });

//     const handleScroll = () => {
//       const header = document.querySelector(".header");
//       if (header) {
//         header.classList.toggle("active", window.scrollY > 100);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);

//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//       unsubscribe();
//     };
//   }, []);

//   return (
//     <header className="header">
//       <div className="scontainer flex">
//         <nav>
//           <ul>
//             {nav.map((link) => (
//               <li key={link.id}>
//                 <Link to={link.url}>{link.text}</Link>
                
//               </li>
//             ))}
//               <h2 style={{textAlign:"center", marginLeft:"350px",marginTop:"2px",color:"#1E3A5F"}}>Dynamic Blog Generator</h2>

//           </ul>
//         </nav>

//         <div className="right-section flexCenter">
//           <GoogleTranslate />
//           <div className="account flexCenter">
//             {isLoggedIn ? (
//               <User />
//             ) : (
//               <Link to="/login">
//                 <button className="login-btn">Login / Register</button>
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { nav } from "../../assets/data/data";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { User } from "./User";
import { GoogleTranslate } from "./GoogleTranslate";
import "./header.css";

export const Header = () => {
  console.log("Header rendered");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    const handleScroll = () => {
      const header = document.querySelector(".header");
      if (header) {
        header.classList.toggle("active", window.scrollY > 100);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubscribe();
    };
  }, []);

  return (
    <header className="header">
      <div className="scontainer flex">
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          ☰ {/* Hamburger Icon */}
        </div>

        <nav className={menuOpen ? "open" : ""}>
          <ul>
            {nav.map((link) => (
              <li key={link.id}>
                <Link to={link.url} onClick={() => setMenuOpen(false)}>
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <h2 className="title">Dynamic Blog Generator</h2>

        <div className="right-section flexCenter">
          <GoogleTranslate />
          <div className="account flexCenter">
            {isLoggedIn ? (
              <User />
            ) : (
              <Link to="/login">
                <button className="login-btn">Login / Register</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
