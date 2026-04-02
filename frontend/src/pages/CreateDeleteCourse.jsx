import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../components/ToastProvider";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import { useI18n } from "../contexts/I18nContext";
import "../styles/createCourse.css";

// All available course types — cannot be changed after creation
export const COURSE_TYPES = [
  { value: "sport",    label: "Спорт" },
  { value: "edu",      label: "Оқу / Білім" },
  { value: "culture",  label: "Мәдениет" },
  { value: "science",  label: "Ғылым" },
  { value: "tech",     label: "Технология" },
  { value: "health",   label: "Денсаулық" },
  { value: "other",    label: "Басқа" },
];

export const getCourseTypeLabel = (value) =>
  COURSE_TYPES.find(t => t.value === value)?.label || value || "—";

const CreateDeleteCourse = () => {
  const [courses, setCourses] = useState([]);
  const [applicationsByCourseId, setApplicationsByCourseId] = useState({});
  const [openApplications, setOpenApplications] = useState({});
  const [form, setForm] = useState({ name: "", bio: "", deadline: "", course_type: "" });

  const [creating, setCreating] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", bio: "", deadline: "" });

  const [savingEdit, setSavingEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { t } = useI18n();
  const navigate = useNavigate();

  const statusLabel = (s) => {
    if (s === "pending")  return "Қаралуда";
    if (s === "accepted") return "Қабылданды";
    if (s === "rejected") return "Қабылданбады";
    return s;
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/courses/my-created");
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCourses([]);
      showToast("Курстарды жүктеу мүмкін болмады", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (courseId) => {
    try {
      const res = await api.get(`/course-applications/courses/${courseId}`);
      setApplicationsByCourseId(prev => ({
        ...prev,
        [courseId]: Array.isArray(res.data) ? res.data : []
      }));
      setOpenApplications(prev => ({ ...prev, [courseId]: true }));
    } catch {
      setApplicationsByCourseId(prev => ({ ...prev, [courseId]: [] }));
    }
  };

  const toggleApplications = async (courseId) => {
    if (!openApplications[courseId] && !applicationsByCourseId[courseId]) {
      await fetchApplications(courseId);
      return;
    }
    setOpenApplications(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const updateApplication = async (applicationId, status, courseId) => {
    try {
      await api.put(`/course-applications/${applicationId}/status`, { status });
      showToast("Статус жаңартылды", "success");
      fetchApplications(courseId);
    } catch (err) {
      showToast(err.response?.data?.message || "Статусты жаңарту мүмкін болмады", "error");
    }
  };

  const createCourse = async () => {
    const name = String(form.name || "").trim();
    const bio  = String(form.bio  || "").trim();

    if (!name) { showToast("Курс атауын енгізіңіз", "error"); return; }
    if (!bio)  { showToast("Сипаттаманы енгізіңіз", "error"); return; }

    setCreating(true);
    try {
      await api.post("/courses", {
        name,
        bio,
        deadline:    form.deadline    || undefined,
        course_type: form.course_type || undefined,
      });
      setForm({ name: "", bio: "", deadline: "", course_type: "" });
      showToast("Курс сәтті қосылды", "success");
      fetchCourses();
    } catch (err) {
      showToast(
        err.response?.data?.message || err.response?.data?.error || "Курс қосу кезінде қате шықты",
        "error"
      );
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (course) => {
    setEditingCourseId(course.id);
    setEditForm({
      name:     String(course.name     || ""),
      bio:      String(course.bio      || ""),
      deadline: course.deadline ? course.deadline.slice(0, 16) : "",
    });
  };

  const cancelEdit = () => {
    setEditingCourseId(null);
    setEditForm({ name: "", bio: "", deadline: "" });
  };

  const saveEdit = async (courseId) => {
    const name = String(editForm.name || "").trim();
    const bio  = String(editForm.bio  || "").trim();

    if (!name) { showToast("Курс атауын енгізіңіз", "error"); return; }
    if (!bio)  { showToast("Сипаттаманы енгізіңіз", "error"); return; }

    setSavingEdit(true);
    try {
      const res = await api.put(`/courses/${courseId}`, {
        name,
        bio,
        deadline: editForm.deadline || null,
      });
      setCourses(prev => prev.map(c => c.id === courseId ? res.data : c));
      showToast("Курс жаңартылды", "success");
      cancelEdit();
    } catch (err) {
      showToast(
        err.response?.data?.message || err.response?.data?.error || "Курсты жаңарту мүмкін болмады",
        "error"
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteCourse = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      showToast("Курс өшірілді", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Курсты өшіру кезінде қате шықты", "error");
    } finally {
      fetchCourses();
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const formatDeadline = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString();
  };

  return (
    <div className="createCoursePage">
      <Button className="createCourseBackButton" variant="ghost" onClick={() => navigate("/course")}>
        {t("course_back")}
      </Button>
      <h2>{t("creator_manage_title")}</h2>
      {loading && <Loader />}

      <div className="coursesFormSection">
        <label className="courseFieldLabel">Іс-шара атауы</label>
        <Input
          type="text"
          placeholder={t("creator_course_name")}
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <label className="courseFieldLabel">Іс-шара сипаттамасы</label>
        <Input
          type="text"
          placeholder={t("creator_course_bio")}
          value={form.bio}
          onChange={e => setForm({ ...form, bio: e.target.value })}
        />

        <label className="courseFieldLabel">Дедлайн</label>
        <Input
          type="datetime-local"
          value={form.deadline}
          onChange={e => setForm({ ...form, deadline: e.target.value })}
        /> 

        <label className="courseFieldLabel">Іс-шара түрі</label>
        <select
          className="courseTypeSelect"
          value={form.course_type}
          onChange={e => setForm({ ...form, course_type: e.target.value })}
        >
          <option value="">— Түрін таңдаңыз —</option>
          {COURSE_TYPES.map(ct => (
            <option key={ct.value} value={ct.value}>{ct.label}</option>
          ))}
        </select>

        <Button
          onClick={createCourse}
          disabled={creating || !String(form.name || "").trim() || !String(form.bio || "").trim()}
        >
          {creating ? t("creator_adding_course") : t("creator_add_course")}
        </Button>
      </div>

      {/* ── Course list ── */}
      <div>
        {courses.map(course => (
          <Card key={course.id} className="courseCard">
            {editingCourseId === course.id ? (
              <div>
                <Input
                  type="text"
                  placeholder={t("creator_course_name")}
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                />
                <Input
                  type="text"
                  placeholder={t("creator_course_bio")}
                  value={editForm.bio}
                  onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                />
                <label className="courseFieldLabel">Дедлайн</label>
                <Input
                  type="datetime-local"
                  value={editForm.deadline}
                  onChange={e => setEditForm(p => ({ ...p, deadline: e.target.value }))}
                />
                {/* course_type is read-only after creation */}
                <p className="courseTypeReadonly">
                  Түрі: <b>{getCourseTypeLabel(course.course_type)}</b> (өзгертуге болмайды)
                </p>
                <div className="coursesFormSection">
                  <Button onClick={() => saveEdit(course.id)} disabled={savingEdit}>
                    {savingEdit ? t("creator_saving") : t("creator_save")}
                  </Button>
                  <Button variant="secondary" onClick={cancelEdit} disabled={savingEdit}>
                    {t("creator_cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3>{course.name}</h3>
                <p>{course.bio}</p>
                {course.course_type && (
                  <p className="courseTypeTag">{getCourseTypeLabel(course.course_type)}</p>
                )}
                {course.deadline && (
                  <p className="courseDeadlineInfo">⏰ Дедлайн: {formatDeadline(course.deadline)}</p>
                )}
              </div>
            )}

            {editingCourseId !== course.id && (
              <Button variant="secondary" onClick={() => startEdit(course)}>
                {t("creator_edit")}
              </Button>
            )}

            <Button variant="secondary" onClick={() => toggleApplications(course.id)}>
              {openApplications[course.id] ? t("creator_hide_applications") : t("creator_applications")}
            </Button>

            {openApplications[course.id] &&
              Array.isArray(applicationsByCourseId[course.id]) &&
              applicationsByCourseId[course.id].length > 0 && (
                <div>
                  {applicationsByCourseId[course.id].map(a => (
                    <Card key={a.id} className="courseCard">
                      <p>{a.username} ({a.email})</p>
                      <p>Статус: <b>{statusLabel(a.status)}</b></p>
                      {a.status === "pending" && (
                        <div>
                          <Button onClick={() => updateApplication(a.id, "accepted", course.id)}>
                            {t("creator_accept")}
                          </Button>
                          <Button variant="danger" onClick={() => updateApplication(a.id, "rejected", course.id)}>
                            {t("creator_reject")}
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}

            <Button variant="danger" onClick={() => deleteCourse(course.id)}>
              {t("creator_delete")}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CreateDeleteCourse;