import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuthStore } from "../store/auth";
import "../styles/TeamPage.css";

export default function TeamPage() {
  const { id } = useParams(); // teamId
  const { user } = useAuthStore(); // 当前登录用户
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [evaluateeId, setEvaluateeId] = useState("");
  const [message, setMessage] = useState("");

  // 获取小组信息
  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await api.get(`/teams/${id}`);
        setTeam(res.data);
        setMembers(res.data.TeamMemberships.map((m) => m.User));
      } catch (err) {
        console.error("Failed to fetch team:", err);
      }
    }
    fetchTeam();
  }, [id]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setNewName(team.name);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewName("");
  };

  const saveTeamName = async () => {
    try {
      await api.patch(`/teams/${id}`, { name: newName });
      setTeam({ ...team, name: newName });
      setIsEditing(false);
      showMessage("✅ Team name updated!");
    } catch (err) {
      console.error(err);
      showMessage("❌ Failed to update team name.");
    }
  };

  const requestEvaluation = async () => {
    if (!evaluateeId) return showMessage("❌ Please choose a member first.");
    try {
      await api.post(`/teams/${id}/evaluation-requests`, {
        requestee_id: evaluateeId,
      });
      showMessage("✅ Evaluation request sent!");
    } catch (err) {
      console.error(err);
      showMessage("❌ Failed to send request.");
    }
  };

  if (!team) return <p>Loading...</p>;

  const isMember = members.some((m) => m.id === user?.id);

  return (
    <div className="team-page">
      <h2>
        Team:
        {isEditing ? (
          <>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ marginLeft: "8px" }}
            />
            <button className="save-btn" onClick={saveTeamName}>
              Save
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            {" "}
            {team.name}{" "}
            {isMember && (
              <button className="edit-btn" onClick={handleEdit}>
                ✏️
              </button>
            )}
          </>
        )}
      </h2>

      {message && (
        <div
          className={`toast ${message.startsWith("✅") ? "success" : "error"}`}
        >
          {message}
        </div>
      )}

      <h3>Members</h3>
      <ul>
        {members.map((m) => (
          <li key={m.id}>
            {m.name} ({m.email}){m.id === user?.id && " (You)"}
          </li>
        ))}
      </ul>

      <div className="actions">
        <h3>Actions</h3>
        <button
          className="go-eval-btn"
          onClick={() => navigate(`/teams/${id}/evaluations`)}
        >
          ⭐ Go to Evaluation
        </button>
        {/* <button
          className="discussion-btn"
          onClick={() => navigate(`/courses/${team.CourseId}/discussion`)}
        >
          💬 Discussion Board
        </button> */}
      </div>

      <div className="request-section">
        <h3>Ask for Evaluation</h3>
        <label>Ask this member to evaluate me:</label>
        <select
          value={evaluateeId}
          onChange={(e) => setEvaluateeId(e.target.value)}
        >
          <option value="">--select--</option>
          {members
            .filter((m) => m.id !== user?.id)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
        </select>
        <button className="request-btn" onClick={requestEvaluation}>
          Request Evaluation
        </button>
      </div>
    </div>
  );
}
