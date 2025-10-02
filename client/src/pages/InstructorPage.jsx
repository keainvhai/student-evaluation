import { useEffect, useState } from "react";
import api from "../api";
import "../styles/InstructorPage.css";

export default function InstructorPage() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

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
      const res = await api.post("/courses", { title, code });
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
        <button onClick={createCourse} disabled={loading}>
          {loading ? "Creating..." : "Create Course"}
        </button>
      </div>

      <ul className="course-list">
        {courses.map((c) => (
          <li key={c.id} className="course-item">
            <span className="course-title">{c.title}</span>
            <span className="join-token">Token: {c.joinToken}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
