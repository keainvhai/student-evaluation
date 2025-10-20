import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import "../styles/CoursePage.css";
import { useAuthStore } from "../store/auth";

export default function CoursePage() {
  const { id } = useParams(); // courseId
  const [course, setCourse] = useState(null);
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");

  const { user } = useAuthStore();

  // 获取课程信息 & 小组
  useEffect(() => {
    async function fetchCourse() {
      try {
        // 先拿课程信息（含 title）
        const courseRes = await api.get(`/courses/${id}`);
        setCourse(courseRes.data);

        // 再拿课程下所有团队
        const teamRes = await api.get(`/courses/${id}/teams`);
        // setCourse({ id });
        setTeams(teamRes.data);
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
      const res = await api.post(`/courses/${id}/teams`, { name: newTeamName });
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
      // ✅ 更新前端状态（把自己加到 TeamMemberships）
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId
            ? {
                ...t,
                TeamMemberships: [
                  ...(t.TeamMemberships || []),
                  { UserId: user?.id, User: user },
                ],
              }
            : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to join team");
    }
  };

  const leaveTeam = async (teamId) => {
    const confirmLeave = window.confirm(
      "Are you sure you want to leave this team?\nYou will lose access to team evaluations and discussions."
    );

    if (!confirmLeave) return; // 用户点击取消，直接中断

    try {
      await api.delete(`/teams/${teamId}/members`);
      alert("✅ You have left the team.");
      // 更新前端视图
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId
            ? {
                ...t,
                TeamMemberships: t.TeamMemberships.filter(
                  (m) => m.UserId !== user?.id
                ),
              }
            : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("❌ Failed to leave team.");
    }
  };

  return (
    <div className="course-container">
      <h2 className="course-title">{course?.title || "Course"}</h2>

      <div className="teams-section">
        <h3 className="section-title">Teams</h3>
        {teams.length === 0 ? (
          <p className="empty-msg">No teams created yet.</p>
        ) : (
          <ul className="team-list">
            {teams.map((t) => {
              const isMember = t.TeamMemberships?.some(
                (m) => m.UserId === user?.id
              );

              return (
                <li key={t.id} className="team-item">
                  <span>{t.name}</span>
                  <div>
                    <Link to={`/teams/${t.id}`}>
                      <button className="team-btn">Go to Team</button>
                    </Link>

                    {isMember ? (
                      <button
                        className="leave-btn"
                        onClick={() => leaveTeam(t.id)}
                      >
                        Leave
                      </button>
                    ) : (
                      <button
                        className="join-btn"
                        onClick={() => joinTeam(t.id)}
                      >
                        Join
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
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
