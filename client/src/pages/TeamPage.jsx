import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function TeamPage() {
  const { id } = useParams(); // teamId
  const [team, setTeam] = useState(null); // 当前小组对象
  const [members, setMembers] = useState([]); // 小组成员数组
  const [evaluateeId, setEvaluateeId] = useState(""); // 被评价者的 ID
  const [score, setScore] = useState(5); // 打分（默认 5）
  const [comment, setComment] = useState(""); // 评价文字
  const [message, setMessage] = useState(""); // 提交后的提示信息

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

  const submitEvaluation = async () => {
    try {
      await api.post("/evaluations", {
        teamId: id,
        evaluateeId,
        score,
        comment,
        anonymousToPeers: true,
      });
      setMessage("✅ Evaluation submitted!");
      setComment("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit");
    }
  };

  if (!team) return <p>Loading...</p>;

  return (
    <div>
      <h2>Team: {team.name}</h2>

      <h3>Members</h3>
      <ul>
        {members.map((m) => (
          <li key={m.id}>
            {m.name} ({m.email})
          </li>
        ))}
      </ul>

      <h3>Give Evaluation</h3>
      <div>
        <label>Choose member:</label>
        <select
          value={evaluateeId}
          onChange={(e) => setEvaluateeId(e.target.value)}
        >
          <option value="">--select--</option>
          {members.map((m) => (
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

      <button onClick={submitEvaluation}>Submit</button>
      {message && <p>{message}</p>}
    </div>
  );
}
