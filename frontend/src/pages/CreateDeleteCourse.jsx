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
  const [form, setForm] = useState({
    name: "",
    bio: ""
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const navigate = useNavigate()

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/courses");
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (_err) {
      setCourses([]);
      showToast("Курстарды жүктеу мүмкін болмады", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const createCourse = async () => {
    try {
      const res = await api.post("/courses", form);
      setCourses([...courses, res.data]);
      setForm({ name: "", bio: "" });
      showToast("Курс сәтті қосылды", "success");
    } catch (err) {
      showToast(err.response?.data?.message || err.response?.data?.error || "Курс қосу кезінде қате шықты", "error");
      return;
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
    }
  };

  return (
    <div className="createCoursePage">
      <Button className="createCourseBackButton" variant="ghost" onClick={() => navigate("/course")}>Назад</Button>
      <h2>Админ: Курсы</h2>
      {loading && <Loader />}

      <div className="coursesFormSection">
        <Input
          type="text"
          placeholder="Название курса"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <Input
          type="text"
          placeholder="Описание"
          value={form.bio}
          onChange={e => setForm({ ...form, bio: e.target.value })}
        />
        <Button onClick={createCourse}>Добавить курс</Button>
      </div>

      <div>
        {courses.map(course => (
          <Card key={course.id} className="courseCard">
            <h3>{course.name}</h3>
            <p>{course.bio}</p>
            <Button variant="danger" onClick={() => deleteCourse(course.id)}>Удалить</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CreateDeleteCourse;