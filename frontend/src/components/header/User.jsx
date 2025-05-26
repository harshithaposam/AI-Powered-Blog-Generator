// import React, { useEffect, useState } from "react"
// import { IoSettingsOutline } from "react-icons/io5"
// import { AiOutlineHeart } from "react-icons/ai"
// import { RiImageAddLine } from "react-icons/ri"
// import { Link } from "react-router-dom"
// import { auth } from "../../firebase";
// import { AiOutlineLogout } from "react-icons/ai";

// export const User = () => {
//  const [user, setUser] = useState(null)
//  const [loading, setLoading] = useState(true)
//  const [profileOpen, setProfileOpen] = useState(false)
//   useEffect(() => {
//    const unsubscribe = auth.onAuthStateChanged((user) => {
//      setUser(user)
//      setLoading(false)
//    });
//     // Add click event listener to handle outside clicks
//    const handleClickOutside = (event) => {
//      const profileElement = document.querySelector('.openProfile');
//      const profileButton = document.querySelector('.profile .img');
     
//      if (profileOpen && 
//          profileElement && 
//          !profileElement.contains(event.target) && 
//          !profileButton.contains(event.target)) {
//        setProfileOpen(false);
//      }
//    };
//     document.addEventListener('mousedown', handleClickOutside);
//     // Cleanup function
//    return () => {
//      unsubscribe();
//      document.removeEventListener('mousedown', handleClickOutside);
//    };
//  }, [profileOpen]);
//   const handleLogout = async () => {
//    try {
//      await auth.signOut();
//      alert("Logout successful!");
//    } catch (error) {
//      alert(error.message);
//    }
//  };
//   if (loading) {
//    return <div className="profile">
//      {/* Optional: Add a loading spinner or skeleton here */}
//      <div className="loading-placeholder"></div>
//    </div>
//  }
//   return (
//    <>
//      <div className='profile'>
//        {user ? (
//          <>
//            <button className='img' onClick={() => setProfileOpen(!profileOpen)}>
//              <img src='https://images.pexels.com/photos/1097456/pexels-photo-1097456.jpeg?auto=compress&cs=tinysrgb&w=600' alt='' />
//            </button>
//            {profileOpen && (
//              <div className='openProfile boxItems'>
//                <Link to='/account'>
//                  <div className='image'>
//                    <div className='img'>
//                      <img src='https://images.pexels.com/photos/1097456/pexels-photo-1097456.jpeg?auto=compress&cs=tinysrgb&w=600' alt='' />
//                    </div>
//                    <div className='text'>
//                      <h4>Eden Smith</h4>
//                      <label>Los Angeles, CA</label>
//                    </div>
//                  </div>
//                </Link>
//                <Link to='/create'>
//                  <button className='box'>
//                    <RiImageAddLine className='icon' />
//                    <h4>Create Post</h4>
//                  </button>
//                </Link>
//                <Link to='/login'>
//                  <button className='box'>
//                    <IoSettingsOutline className='icon' />
//                    <h4>My Account</h4>
//                  </button>
//                </Link>
//                <Link to='/bookmarks'>
//                  <button className='box'>
//                    <AiOutlineHeart className='icon' />
//                    <h4>BookMarks</h4>
//                  </button>
//                </Link>
//                <button className="box" onClick={handleLogout}>
//                  <AiOutlineLogout className='icon' />
//                  Logout
//                </button>
         
//              </div>
//            )}
//          </>
//        ) : (
//          <button>My Account</button>
//        )}
//      </div>
//    </>
//  );
// }

import React, { useEffect, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { AiOutlineHeart } from "react-icons/ai";
import { RiImageAddLine } from "react-icons/ri";
import { AiOutlineLogout } from "react-icons/ai";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useHistory } from "react-router-dom";
export const User = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userId, setUserId] = useState(null);
   const [userInfo, setUserInfo] = useState({
      user_name: "",
      email_id: "",
     
    });

    
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

  useEffect(() => {
    // Check for authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });


    // Handle click outside profile dropdown
    const handleClickOutside = (event) => {
      const profileElement = document.querySelector(".openProfile");
      const profileButton = document.querySelector(".profile .img");

      if (
        profileOpen &&
        profileElement &&
        !profileElement.contains(event.target) &&
        !profileButton.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert("Logout successful!");
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="profile">
        <div className="loading-placeholder"></div>
      </div>
    );
  }

  return (
    <>
      <div className="profile">
        {user ? (
          <>
            <button className="img" onClick={() => setProfileOpen(!profileOpen)}>
              <img
                src="https://static-00.iconduck.com/assets.00/person-icon-1901x2048-a9h70k71.png"
                alt=""
              />
            </button>
            {profileOpen && (
              <div className="openProfile boxItems">
                
               
                <Link to="/account">
                  <div className="image">
                    <div className="img">
                      <img
                        src="https://static-00.iconduck.com/assets.00/person-icon-1901x2048-a9h70k71.png"
                        alt=""
                      />
                    </div>
                    <div className="text">
                      <h4>{userInfo.user_name}</h4>
                      {/* <label>#########</label> */}
                    </div>
                  </div>
                </Link>
                <Link to="/create">
                  <button className="box">
                    <RiImageAddLine className="icon" />
                    <h4>Create Post</h4>
                  </button>
                </Link>

                <Link to="/bookmarks">
                  <button className="box">
                    <AiOutlineHeart className="icon" />
                    <h4>BookMarks</h4>
                  </button>
                </Link>
                <button className="box" onClick={handleLogout}>
                  <AiOutlineLogout className="icon" />
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <button>My Account</button>
        )}
      </div>
    </>
  );
};
