import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import "../styles/CoursePage.css";

export default function CoursePage() {
  const { id } = useParams(); // courseId
  const [course, setCourse] = useState(null);
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");

  // 获取课程信息 & 小组
  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${id}/teams`);
        setCourse({ id });
        setTeams(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCourse();
  }, [id]);

  // 创建新小组
  const createTeam = async () => {
    if (!newTeamName) return;
    try {
      const res = await api.post("/teams", {
        courseId: id,
        name: newTeamName,
      });
      setTeams([...teams, res.data]);
      setNewTeamName("");
    } catch (err) {
      console.error(err);
    }
  };

  const joinTeam = async (teamId) => {
    try {
      await api.post(`/teams/${teamId}/members`);
      alert("Joined the team!");
    } catch (err) {
      console.error(err);
      alert("Failed to join team");
    }
  };

  return (
    <div className="course-container">
      <h2 className="course-title">Course {id}</h2>

      <div className="teams-section">
        <h3 className="section-title">Teams</h3>
        {teams.length === 0 ? (
          <p className="empty-msg">No teams created yet.</p>
        ) : (
          <ul className="team-list">
            {teams.map((t) => (
              <li key={t.id} className="team-item">
                <span>{t.name}</span>
                <div>
                  <Link to={`/teams/${t.id}`}>
                    <button className="team-btn">Go to Team</button>
                  </Link>
                  <button className="join-btn" onClick={() => joinTeam(t.id)}>
                    Join
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="create-team">
        <h3 className="section-title">Create New Team</h3>
        <input
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="Team name"
        />
        <button onClick={createTeam} className="create-btn">
          Create
        </button>
      </div>
    </div>
  );
}
