import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { useAuthStore } from "../store/auth";
import "../styles/TeamPage.css";
import FloatingAIAssistant from "../components/FloatingAIAssistant";

export default function TeamPage() {
  const { id } = useParams(); // teamId
  const { user } = useAuthStore(); // current User
  const [team, setTeam] = useState(null); // 当前小组对象
  const [members, setMembers] = useState([]); // 小组成员数组

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const [evaluateeId, setEvaluateeId] = useState(""); // 被评价者的 ID
  const [score, setScore] = useState(5); // 打分（默认 5）
  const [comment, setComment] = useState(""); // 评价文字
  const [message, setMessage] = useState(""); // 提交后的提示信息

  const [anonymous, setAnonymous] = useState(true); // ✅ 默认匿名

  // 获取小组信息
  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await api.get(`/teams/${id}`);
        setTeam(res.data);
        setMembers(res.data.TeamMemberships.map((m) => m.User));
      } catch (err) {
        console.error(err);
      }
    }
    fetchTeam();
  }, [id]);

  // 公共函数
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500); // 2.5 秒后自动消失
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
      const res = await api.patch(`/teams/${id}`, { name: newName });
      setTeam({ ...team, name: newName });
      setIsEditing(false);
      showMessage("Team name updated!");
    } catch (err) {
      console.error(err);
      showMessage("❌ Failed to update team name");
    }
  };

  const submitEvaluation = async () => {
    try {
      await api.post(`/teams/${id}/evaluations`, {
        evaluateeId,
        score,
        comment,
        anonymousToPeers: anonymous,
      });
      showMessage("✅ Evaluation submitted!");
      setComment("");
    } catch (err) {
      console.error(err);
      showMessage("❌ Failed to submit");
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
            {m.name} ({m.email})
          </li>
        ))}
      </ul>

      <div className="evaluation-header">
        <h3>Give Evaluation</h3>
        <label className="anon-toggle-inline">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
          />
          anonymously
        </label>
      </div>

      <div>
        <label>Choose member:</label>
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
      </div>

      <div>
        <label>Score (1–5):</label>
        <input
          type="number"
          min="1"
          max="5"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
      </div>

      <div>
        <label>Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button className="submit-btn" onClick={submitEvaluation}>
        Submit
      </button>

      {/* AI 助手（条件渲染） */}
      {team?.Course?.aiEnabled && (
        <FloatingAIAssistant
          evaluateeName={
            members.find((m) => m.id === Number(evaluateeId))?.name ||
            "teammate"
          }
        />
      )}

      {/* {message && <p>{message}</p>} */}
      <h3>Seek Evaluation</h3>
      <div>
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

        <button
          className="request-btn"
          onClick={async () => {
            if (!evaluateeId)
              return setMessage("❌ Please choose a member first.");
            try {
              await api.post(`/teams/${id}/evaluation-requests`, {
                requestee_id: evaluateeId,
              });
              console.log(`Request sent to user ${evaluateeId}`);
              setMessage("✅ Evaluation request sent!");
              setTimeout(() => setMessage(""), 2500);
            } catch (err) {
              console.error(err);
              setMessage("❌ Failed to send request");
            }
          }}
        >
          Request Evaluation
        </button>
      </div>
    </div>
  );
}
