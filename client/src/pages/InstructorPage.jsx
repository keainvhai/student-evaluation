import { useEffect, useState } from "react";
import api from "../api";
import "../styles/InstructorPage.css";
import { Link } from "react-router-dom";
import CourseCard from "../components/CourseCard";

export default function InstructorPage() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/mine");
        setCourses(res.data); // 后端返回课程数组
      } catch (err) {
        console.error("Failed to load courses", err);
        alert("Course loading failed. Please check your login status.");
      }
    };
    fetchCourses();
  }, []);

  const createCourse = async () => {
    if (!title || !code) {
      alert("Please enter the course name and course code");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/courses", { title, code, aiEnabled });
      setCourses([...courses, res.data]);
      setTitle("");
      setCode("");
    } catch (err) {
      console.error("Create course failed", err);
      alert(
        "Course creation failed:" + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="instructor-container">
      <h2 className="dashboard-title">Instructor Dashboard</h2>

      <div className="form-container">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Course title"
        />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Course code"
        />
        <label>
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => setAiEnabled(e.target.checked)}
          />
          Enable AI Assistant
        </label>
        <button onClick={createCourse} disabled={loading}>
          {loading ? "Creating..." : "Create Course"}
        </button>
      </div>

      <h3 className="course-header">My Courses</h3>
      {courses.length === 0 ? (
        <p className="empty-msg">You haven't created any courses yet.</p>
      ) : (
        <div className="course-grid">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} isInstructor={true} />
          ))}
        </div>
      )}
    </div>
  );
}
