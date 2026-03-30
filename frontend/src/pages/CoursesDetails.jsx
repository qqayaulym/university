import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/ui/Loader";
import StatusMessage from "../components/ui/StatusMessage";
import Button from "../components/ui/Button";
import { useToast } from "../components/ToastProvider";

const CoursesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { showToast } = useToast();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [myApplication, setMyApplication] = useState(null);
  const [applying, setApplying] = useState(false);

  const statusLabel = (s) => {
    if (s === "pending") return "Қаралуда";
    if (s === "accepted") return "Қабылданды";
    if (s === "rejected") return "Қабылданбады";
    return s;
  };

  const hoursToDeadline = (endAt) => {
    if (!endAt) return null;
    const end = new Date(endAt);
    if (Number.isNaN(end.getTime())) return null;
    const diffMs = end.getTime() - Date.now();
    return Math.ceil(diffMs / (1000 * 60 * 60));
  };

  const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
      } catch (err) {
        console.error(err);
        setError("Курс жүктелмеді");
      }
    };

    const fetchMyApplication = async () => {
      try {
        const res = await api.get("/course-applications/my");
        const list = Array.isArray(res.data) ? res.data : [];
        const found = list.find((a) => String(a.course_id) === String(id));
        setMyApplication(found || null);
      } catch (_err) {
        setMyApplication(null);
      }
    };

    fetchCourse();
    fetchMyApplication();
  }, [id]);

  const apply = async () => {
    setApplying(true);
    try {
      const res = await api.post(`/course-applications/courses/${id}/apply`);
      setMyApplication(res.data);
      showToast("Өтінім жіберілді", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Өтінімді жіберу мүмкін болмады", "error");
    } finally {
      setApplying(false);
    }
  };

  if (error) return <StatusMessage type="error">{error}</StatusMessage>;
  if (!course) return <Loader />;

  return (
    <div className="soloCoursesDiv">
      <button onClick={() => navigate(-1)}>← Артқа</button>

      <h2>{course.name}</h2>
      <p>{course.bio}</p>

      {course.start_at && (
        <p>
          Басталуы: <b>{formatDateTime(course.start_at)}</b>
        </p>
      )}
      {course.end_at && (
        <p>
          Аяқталуы: <b>{formatDateTime(course.end_at)}</b>
        </p>
      )}

      {course.end_at && (
        (() => {
          const h = hoursToDeadline(course.end_at);
          if (h === null) return null;
          return (
            <p>
              Дедлайнға: <b>{h <= 0 ? "аяқталды" : `${h} сағат`}</b>
            </p>
          );
        })()
      )}

      {myApplication?.status && (
        <p>
          Өтінім статусы: <b>{statusLabel(myApplication.status)}</b>
        </p>
      )}

      <Button onClick={apply} disabled={applying || myApplication?.status === "pending"}>
        Өтінім жіберу
      </Button>
    </div>
  );
};

export default CoursesDetails;