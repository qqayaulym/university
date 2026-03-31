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

const CreateDeleteCourse = () => {
  const [courses, setCourses] = useState([]);
  const [applicationsByCourseId, setApplicationsByCourseId] = useState({});
  const [openApplications, setOpenApplications] = useState({});
  const [form, setForm] = useState({
    name: "",
    bio: ""
  });

  const [creating, setCreating] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", bio: "" });

  const [savingEdit, setSavingEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { t } = useI18n();

  const statusLabel = (s) => {
    if (s === "pending") return "Қаралуда";
    if (s === "accepted") return "Қабылданды";
    if (s === "rejected") return "Қабылданбады";
    return s;
  };

  const navigate = useNavigate()

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/courses/my-created");
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (_err) {
      setCourses([]);
      showToast("Курстарды жүктеу мүмкін болмады", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (courseId) => {
    try {
      const res = await api.get(`/course-applications/courses/${courseId}`);
      setApplicationsByCourseId((prev) => ({
        ...prev,
        [courseId]: Array.isArray(res.data) ? res.data : []
      }));
      setOpenApplications((prev) => ({ ...prev, [courseId]: true }));
    } catch (_err) {
      setApplicationsByCourseId((prev) => ({ ...prev, [courseId]: [] }));
    }
  };

  const toggleApplications = async (courseId) => {
    if (!openApplications[courseId] && !applicationsByCourseId[courseId]) {
      await fetchApplications(courseId);
      return;
    }

    setOpenApplications((prev) => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
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
    const bio = String(form.bio || "").trim();

    if (!name) {
      showToast("Курс атауын енгізіңіз", "error");
      return;
    }

    if (!bio) {
      showToast("Сипаттаманы енгізіңіз", "error");
      return;
    }

    setCreating(true);
    try {
      const res = await api.post("/courses", { name, bio });
      setForm({ name: "", bio: "" });
      showToast("Курс сәтті қосылды", "success");
      fetchCourses();
    } catch (err) {
      showToast(err.response?.data?.message || err.response?.data?.error || "Курс қосу кезінде қате шықты", "error");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (course) => {
    setEditingCourseId(course.id);
    setEditForm({
      name: String(course.name || ""),
      bio: String(course.bio || "")
    });
  };

  const cancelEdit = () => {
    setEditingCourseId(null);
    setEditForm({ name: "", bio: "" });
  };

  const saveEdit = async (courseId) => {
    const name = String(editForm.name || "").trim();
    const bio = String(editForm.bio || "").trim();

    if (!name) {
      showToast("Курс атауын енгізіңіз", "error");
      return;
    }
    if (!bio) {
      showToast("Сипаттаманы енгізіңіз", "error");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await api.put(`/courses/${courseId}`, { name, bio });
      setCourses((prev) => prev.map((c) => (c.id === courseId ? res.data : c)));
      showToast("Курс жаңартылды", "success");
      cancelEdit();
    } catch (err) {
      showToast(err.response?.data?.message || err.response?.data?.error || "Курсты жаңарту мүмкін болмады", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteCourse = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      setCourses(courses.filter(course => course.id !== id));
      showToast("Курс өшірілді", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Курсты өшіру кезінде қате шықты", "error");
      return;
    } finally {
      fetchCourses();
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="createCoursePage">
      <Button className="createCourseBackButton" variant="ghost" onClick={() => navigate("/course")}>{t("course_back")}</Button>
      <h2>{t("creator_manage_title")}</h2>
      {loading && <Loader />}

      <div className="coursesFormSection">
        <Input
          type="text"
          placeholder={t("creator_course_name")}
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <Input
          type="text"
          placeholder={t("creator_course_bio")}
          value={form.bio}
          onChange={e => setForm({ ...form, bio: e.target.value })}
        />
        <Button onClick={createCourse} disabled={creating || !String(form.name || "").trim() || !String(form.bio || "").trim()}>
          {creating ? t("creator_adding_course") : t("creator_add_course")}
        </Button>
      </div>

      <div>
        {courses.map(course => (
          <Card key={course.id} className="courseCard">
            {editingCourseId === course.id ? (
              <div>
                <Input
                  type="text"
                  placeholder={t("creator_course_name")}
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                />
                <Input
                  type="text"
                  placeholder={t("creator_course_bio")}
                  value={editForm.bio}
                  onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                />

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

            {openApplications[course.id] && Array.isArray(applicationsByCourseId[course.id]) && applicationsByCourseId[course.id].length > 0 && (
              <div>
                {applicationsByCourseId[course.id].map((a) => (
                  <Card key={a.id} className="courseCard">
                    <p>{a.username} ({a.email})</p>
                    <p>Статус: <b>{statusLabel(a.status)}</b></p>
                    {a.status === "pending" && (
                      <div>
                        <Button onClick={() => updateApplication(a.id, "accepted", course.id)}>{t("creator_accept")}</Button>
                        <Button variant="danger" onClick={() => updateApplication(a.id, "rejected", course.id)}>{t("creator_reject")}</Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
            <Button variant="danger" onClick={() => deleteCourse(course.id)}>{t("creator_delete")}</Button>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default CreateDeleteCourse;