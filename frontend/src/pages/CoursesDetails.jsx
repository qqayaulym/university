import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/ui/Loader";
import StatusMessage from "../components/ui/StatusMessage";
import Button from "../components/ui/Button";
import { useToast } from "../components/ToastProvider";
import { useI18n } from "../contexts/I18nContext";
import { getCourseTypeLabel } from "./CreateDeleteCourse";

// Returns { label, urgent } describing time left until deadline
const deadlineCountdown = (iso) => {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return { label: "Дедлайн өтіп кетті", expired: true, urgent: false };

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0)  return { label: `${days} күн ${hours} сағат қалды`, expired: false, urgent: days <= 3 };
  if (hours > 0) return { label: `${hours} сағат ${minutes} мин қалды`, expired: false, urgent: true };
  return { label: `${minutes} минут қалды`, expired: false, urgent: true };
};

const CoursesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useI18n();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [myApplication, setMyApplication] = useState(null);
  const [applying, setApplying] = useState(false);
  const [, setTick] = useState(0); // for live countdown re-render

  const statusLabel = (s) => {
    if (s === "pending")  return "Қаралуда";
    if (s === "accepted") return "Қабылданды";
    if (s === "rejected") return "Қабылданбады";
    return s;
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
        const found = list.find(a => String(a.course_id) === String(id));
        setMyApplication(found || null);
      } catch {
        setMyApplication(null);
      }
    };

    fetchCourse();
    fetchMyApplication();
  }, [id]);

  // Update countdown every minute
  useEffect(() => {
    const timer = setInterval(() => setTick(n => n + 1), 60_000);
    return () => clearInterval(timer);
  }, []);

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

  const isAccepted     = myApplication?.status === "accepted";
  const countdown      = deadlineCountdown(course.deadline);
  const deadlineExpired = countdown?.expired ?? false;

  const canApply =
    !applying &&
    myApplication?.status !== "pending" &&
    !isAccepted &&
    !deadlineExpired;

  return (
    <div className="soloCoursesDiv">
      <Button variant="ghost" onClick={() => navigate(-1)}>{t("course_back")}</Button>

      <div className="courseDetailHeader">
        <h2>{course.name}</h2>

        <div className="courseDetailBadges">
          {course.is_new && (
            <span className="courseBadge courseBadgeNew">Жаңа</span>
          )}
          {course.course_type && (
            <span className="courseBadge courseBadgeType">
              {getCourseTypeLabel(course.course_type)}
            </span>
          )}
        </div>
      </div>

      <p className="courseDetailBio">{course.bio}</p>

      <div className="courseDetailMeta">
        {course.created_at && (
          <p>Құрылды: <b>{formatDateTime(course.created_at)}</b></p>
        )}
        {course.start_at && (
          <p>Басталу: <b>{formatDateTime(course.start_at)}</b></p>
        )}
        {course.author && (
          <p>Авторы: <b>{course.author}</b></p>
        )}

        {course.deadline && (
          <div className={`courseDeadlineBlock ${countdown?.urgent ? "courseDeadlineUrgent" : ""} ${deadlineExpired ? "courseDeadlineExpired" : ""}`}>
            <p>Дедлайн: <b>{formatDateTime(course.deadline)}</b></p>
            {countdown && (
              <p className="courseCountdown">{countdown.label}</p>
            )}
          </div>
        )}
      </div>

      {myApplication?.status && (
        <p className="courseApplicationStatus">
          {t("course_application_status")}: <b>{statusLabel(myApplication.status)}</b>
        </p>
      )}

      {isAccepted && <p className="courseAlreadyMember">{t("course_already_member")}</p>}

      {deadlineExpired && !isAccepted && (
        <p className="courseDeadlineExpiredNote">Дедлайн өтіп кетті — өтінім жіберу мүмкін емес</p>
      )}

      <Button onClick={apply} disabled={!canApply}>
        {t("course_apply")}
      </Button>
    </div>
  );
};

export default CoursesDetails;