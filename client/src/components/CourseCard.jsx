import { useNavigate } from "react-router-dom";
import "../styles/CourseCard.css";

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  return (
    <div
      className="course-card"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <h4 className="course-card-title">{course.title}</h4>
      <p className="course-card-meta">
        ({course.code}) <br />
        Instructor: {course.instructor?.name}
      </p>
    </div>
  );
}
