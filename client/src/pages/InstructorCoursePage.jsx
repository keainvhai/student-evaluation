import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import "../styles/InstructorCoursePage.css";

export default function InstructorCoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [teams, setTeams] = useState([]);
  const [joinToken, setJoinToken] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showRoster, setShowRoster] = useState(false);
  const [loading, setLoading] = useState(false);

  const [description, setDescription] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const resCourses = await api.get("/courses/mine");
        const found = resCourses.data.find((c) => c.id === Number(id));
        setCourse(found);
        setDescription(found?.description || "");
        setJoinToken(found?.joinToken);

        const [resRoster, resTeams] = await Promise.all([
          api.get(`/courses/${id}/roster`),
          api.get(`/courses/${id}/teams`),
        ]);
        setRoster(resRoster.data);
        setTeams(resTeams.data);
      } catch (err) {
        console.error("Failed to load course:", err);
        alert("Failed to load course data. Please check login status.");
      }
    }
    fetchData();
  }, [id]);

  const saveDescription = async () => {
    try {
      await api.patch(`/courses/${id}/description`, { description });
      alert("✅ Description updated!");
      setEditingDesc(false);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update description");
    }
  };

  const rotateToken = async () => {
    try {
      setLoading(true);
      const res = await api.post(`/courses/${id}/join-token/rotate`);
      setJoinToken(res.data.joinToken);
      alert("✅ Join Token refreshed!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to refresh token");
    } finally {
      setLoading(false);
    }
  };

  const toggleQR = async () => {
    if (showQR) {
      setShowQR(false);
      return;
    }
    try {
      const res = await api.get(`/courses/${id}/join-qr`);
      setQrUrl(res.data.qrDataUrl);
      setShowQR(true);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to get QR code");
    }
  };

  if (!course) return <p>Loading...</p>;

  return (
    <div className="instructor-course-page">
      <h2 className="page-title">{course.title}</h2>
      <p className="course-meta">Course Code: {course.code}</p>

      {/* --- Description Section --- */}
      <section className="card-section">
        <div className="section-header">
          <h3>Course Description</h3>

          {!editingDesc ? (
            <button className="btn-edit" onClick={() => setEditingDesc(true)}>
              Edit
            </button>
          ) : (
            <div className="desc-buttons">
              <button className="btn-save" onClick={saveDescription}>
                Save
              </button>
              <button
                className="btn-cancel"
                onClick={() => {
                  setEditingDesc(false);
                  setDescription(course.description || ""); // 恢复原值
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {!editingDesc ? (
          <p className="course-desc">
            {description ? description : "No description yet."}
          </p>
        ) : (
          <textarea
            className="desc-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Enter course description..."
          />
        )}
      </section>

      {/* --- Join Section --- */}
      <section className="card-section">
        <div className="section-header">
          <h3>Join Information</h3>
        </div>
        <p className="token-display">Join Token: {joinToken}</p>
        <div className="button-group">
          <button onClick={rotateToken} disabled={loading}>
            Refresh Token
          </button>
          <button onClick={toggleQR}>{showQR ? "Hide QR" : "Show QR"}</button>
        </div>
        {showQR && (
          <div className="qr-section">
            <img src={qrUrl} alt="Join QR" width={200} />
          </div>
        )}
      </section>

      {/* --- Roster Section --- */}
      <section className="card-section">
        <div className="section-header">
          <h3>Roster</h3>
          <button
            className="toggle-btn"
            onClick={() => setShowRoster(!showRoster)}
          >
            {showRoster ? " Hide Roster" : "Show Roster"}
          </button>
        </div>
        {showRoster && (
          <ul className="roster-list">
            {roster.length === 0 ? (
              <p>No students enrolled yet.</p>
            ) : (
              roster.map((s) => (
                <li key={s.id}>
                  {s.name} <span className="email">({s.email})</span>
                </li>
              ))
            )}
          </ul>
        )}
      </section>

      {/* --- Teams Section --- */}
      <section className="card-section">
        <h3>Teams</h3>
        {teams.length === 0 ? (
          <p>No teams created yet.</p>
        ) : (
          <ul className="team-list">
            {teams.map((t) => (
              <li key={t.id} className="team-item">
                <span>{t.name}</span>
                <Link to={`/teams/${t.id}`}>
                  <button className="view-team">View</button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
