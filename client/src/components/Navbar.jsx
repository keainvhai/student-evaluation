// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goHome = () => {
    if (user?.role === "instructor") navigate("/instructor");
    else if (user?.role === "student") navigate("/student");
    else navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span onClick={goHome} className="logo">
          Student Eval
        </span>
      </div>

      <div className="navbar-center">
        {user?.role === "instructor" && (
          <Link to="/instructor" className="nav-link">
            Instructor Dashboard
          </Link>
        )}
        {user?.role === "student" && (
          <Link to="/student" className="nav-link">
            Student Dashboard
          </Link>
        )}
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <span className="welcome">Hi, {user.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
