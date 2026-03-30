import React, { useEffect, useState } from "react"
import api from "../api/axios";
import Loader from "../components/ui/Loader";
import StatusMessage from "../components/ui/StatusMessage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [memberCourses, setMemberCourses] = useState([]);
    const [applications, setApplications] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [photoFile, setPhotoFile] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const statusLabel = (s) => {
      if (s === "pending") return "Қаралуда";
      if (s === "accepted") return "Қабылданды";
      if (s === "rejected") return "Қабылданбады";
      return s;
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/auth/me");
                setProfile(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Парақша жүктелмеді");
            }
        };

        const fetchPhotos = async () => {
          try {
            const res = await api.get("/profile/photos");
            setPhotos(Array.isArray(res.data) ? res.data : []);
          } catch (_err) {
            setPhotos([]);
          }
        };

        const fetchMemberCourses = async () => {
          try {
            const res = await api.get("/courses/my");
            setMemberCourses(Array.isArray(res.data) ? res.data : []);
          } catch (_err) {
            setMemberCourses([]);
          }
        };

        const fetchApplications = async () => {
          try {
            const res = await api.get("/course-applications/my");
            setApplications(Array.isArray(res.data) ? res.data : []);
          } catch (_err) {
            setApplications([]);
          }
        };

        fetchProfile();
        fetchMemberCourses();
        fetchApplications();
        fetchPhotos();
    }, []);

    const hoursToDeadline = (endAt) => {
      if (!endAt) return null;
      const end = new Date(endAt);
      if (Number.isNaN(end.getTime())) return null;
      const diffMs = end.getTime() - Date.now();
      const hours = Math.ceil(diffMs / (1000 * 60 * 60));
      return hours;
    };

    const uploadPhoto = async () => {
      if (!photoFile) return;
      setUploadingPhoto(true);
      try {
        const fd = new FormData();
        fd.append("file", photoFile);
        await api.post("/profile/photos", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setPhotoFile(null);
        const res = await api.get("/profile/photos");
        setPhotos(Array.isArray(res.data) ? res.data : []);
      } catch (_err) {
        return;
      } finally {
        setUploadingPhoto(false);
      }
    };

    const deletePhoto = async (id) => {
      try {
        await api.delete(`/profile/photos/${id}`);
        setPhotos((prev) => prev.filter((p) => p.id !== id));
      } catch (_err) {
        return;
      }
    };

    if (error) {
        return <StatusMessage type="error">{error}</StatusMessage>;
    }

    if (!profile) {
        return <Loader />;
    }

    return(
        <div className="profileDiv">
            <h2 className="profileUsername">{profile.username}</h2>
            <p>Email: {profile.email}</p>
            <p>Рөлі: {profile.role}</p>

            {photos.length === 0 ? (
              <p>Фото жоқ</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                {photos.map((p) => (
                  <Card key={p.id} className="courseCard">
                    <img
                      src={`http://localhost:8000${p.url}`}
                      alt="profile"
                      style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10 }}
                    />
                    <Button variant="danger" onClick={() => deletePhoto(p.id)}>
                      Өшіру
                    </Button>
                  </Card>
                ))}
              </div>
            )}

            <h3>Менің курстарым</h3>
            {memberCourses.length === 0 ? (
              <p>Әзірге жоқ</p>
            ) : (
              memberCourses.map((c) => (
                <Card key={c.id} className="courseCard">
                  <h4>{c.name}</h4>
                  <p>{c.bio}</p>
                  {c.end_at && (
                    (() => {
                      const h = hoursToDeadline(c.end_at);
                      if (h === null) return null;
                      return <p>Дедлайнға: <b>{h <= 0 ? "аяқталды" : `${h} сағат`}</b></p>;
                    })()
                  )}
                </Card>
              ))
            )}

            <h3>Менің өтінімдерім</h3>
            {applications.length === 0 ? (
              <p>Әзірге жоқ</p>
            ) : (
              applications.map((a) => (
                <Card key={a.id} className="courseCard">
                  <h4>{a.course_name}</h4>
                  <p>Статус: <b>{statusLabel(a.status)}</b></p>
                </Card>
              ))
            )}
        </div>
    )
}

export default StudentProfile