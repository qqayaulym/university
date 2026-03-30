import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../components/ToastProvider";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import "../styles/createCourse.css";

const CreateDeleteCourse = () => {
  const [courses, setCourses] = useState([]);
  const [applicationsByCourseId, setApplicationsByCourseId] = useState({});
  const [form, setForm] = useState({
    name: "",
    bio: "",
    startAt: "",
    endAt: ""
  });

  const [creating, setCreating] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", bio: "", startAt: "", endAt: "" });

  const [savingEdit, setSavingEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

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
    } catch (_err) {
      setApplicationsByCourseId((prev) => ({ ...prev, [courseId]: [] }));
    }
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
    const startAt = String(form.startAt || "").trim();
    const endAt = String(form.endAt || "").trim();

    if (!name) {
      showToast("Курс атауын енгізіңіз", "error");
      return;
    }

    if (!bio) {
      showToast("Сипаттаманы енгізіңіз", "error");
      return;
    }

    if (!startAt) {
      showToast("Басталу уақытын енгізіңіз", "error");
      return;
    }

    setCreating(true);
    try {
      const res = await api.post("/courses", { name, bio, startAt, endAt: endAt || null });
      setForm({ name: "", bio: "", startAt: "", endAt: "" });
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
      bio: String(course.bio || ""),
      startAt: course.start_at ? String(course.start_at).slice(0, 16) : "",
      endAt: course.end_at ? String(course.end_at).slice(0, 16) : "",
    });
  };

  const cancelEdit = () => {
    setEditingCourseId(null);
    setEditForm({ name: "", bio: "", startAt: "", endAt: "" });
  };

  const saveEdit = async (courseId) => {
    const name = String(editForm.name || "").trim();
    const bio = String(editForm.bio || "").trim();
    const startAt = String(editForm.startAt || "").trim();
    const endAt = String(editForm.endAt || "").trim();

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
      const res = await api.put(`/courses/${courseId}`, { name, bio, startAt, endAt: endAt || null });
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
      <Button className="createCourseBackButton" variant="ghost" onClick={() => navigate("/course")}>Артқа</Button>
      <h2>Курс басқару</h2>
      {loading && <Loader />}

      <div className="coursesFormSection">
        <Input
          type="text"
          placeholder="Курс атауы"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <Input
          type="text"
          placeholder="Сипаттама"
          value={form.bio}
          onChange={e => setForm({ ...form, bio: e.target.value })}
        />
        <Input
          type="datetime-local"
          placeholder="Басталу уақыты"
          value={form.startAt}
          onChange={e => setForm({ ...form, startAt: e.target.value })}
        />
        <Input
          type="datetime-local"
          placeholder="Аяқталу уақыты (міндетті емес)"
          value={form.endAt}
          onChange={e => setForm({ ...form, endAt: e.target.value })}
        />
        <Button onClick={createCourse} disabled={creating || !String(form.name || "").trim() || !String(form.bio || "").trim() || !String(form.startAt || "").trim()}>
          {creating ? "Қосылуда..." : "Курс қосу"}
        </Button>
      </div>

      <div>
        {courses.map(course => (
          <Card key={course.id} className="courseCard">
            {editingCourseId === course.id ? (
              <div>
                <Input
                  type="text"
                  placeholder="Курс атауы"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                />
                <Input
                  type="text"
                  placeholder="Сипаттама"
                  value={editForm.bio}
                  onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                />
                <Input
                  type="datetime-local"
                  placeholder="Басталу уақыты"
                  value={editForm.startAt}
                  onChange={(e) => setEditForm((p) => ({ ...p, startAt: e.target.value }))}
                />
                <Input
                  type="datetime-local"
                  placeholder="Аяқталу уақыты (міндетті емес)"
                  value={editForm.endAt}
                  onChange={(e) => setEditForm((p) => ({ ...p, endAt: e.target.value }))}
                />

                <div className="coursesFormSection">
                  <Button onClick={() => saveEdit(course.id)} disabled={savingEdit}>
                    {savingEdit ? "Сақталуда..." : "Сақтау"}
                  </Button>
                  <Button variant="secondary" onClick={cancelEdit} disabled={savingEdit}>
                    Болдырмау
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
                Өңдеу
              </Button>
            )}

            <Button variant="secondary" onClick={() => fetchApplications(course.id)}>Өтінімдер</Button>

            {Array.isArray(applicationsByCourseId[course.id]) && applicationsByCourseId[course.id].length > 0 && (
              <div>
                {applicationsByCourseId[course.id].map((a) => (
                  <Card key={a.id} className="courseCard">
                    <p>{a.username} ({a.email})</p>
                    <p>Статус: <b>{statusLabel(a.status)}</b></p>
                    {a.status === "pending" && (
                      <div>
                        <Button onClick={() => updateApplication(a.id, "accepted", course.id)}>Қабылдау</Button>
                        <Button variant="danger" onClick={() => updateApplication(a.id, "rejected", course.id)}>Қабылдамау</Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
            <Button variant="danger" onClick={() => deleteCourse(course.id)}>Өшіру</Button>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default CreateDeleteCourse;