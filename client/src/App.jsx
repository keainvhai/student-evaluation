import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import InstructorPage from "./pages/InstructorPage";
import StudentPage from "./pages/StudentPage";
import TeamPage from "./pages/TeamPage";
import CoursePage from "./pages/CoursePage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute role="instructor">
              <InstructorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentPage />
            </ProtectedRoute>
          }
        />

        {/* course and teams */}
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute role="student">
              <CoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:id"
          element={
            <ProtectedRoute role="student">
              <TeamPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent /> {/* ✅ 包裹起来 */}
    </BrowserRouter>
  );
}
