import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const CreateDeleteCourse = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    img: "",
    type: "",
    who_created: 1,
    deadline: "",
  });

  const navigate = useNavigate()

  const fetchCourses = async () => {
    const res = await fetch("http://localhost:8000/api/courses");
    const data = await res.json();
    setCourses(data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const createCourse = async () => {
    const res = await fetch("http://localhost:8000/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCourses([...courses, data]);
    setForm({ name: "", bio: "", img: "", type: "", who_created: 1, deadline: "" });
  };

  const deleteCourse = async (id) => {
    await fetch(`http://localhost:8000/api/courses/${id}`, { method: "DELETE" });
    setCourses(courses.filter(course => course.id !== id));
  };

  return (
    <div>
      <button onClick={() => navigate("/course")}>Назад</button>
      <h2>Админ: Курсы</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Название курса"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Описание"
          value={form.bio}
          onChange={e => setForm({ ...form, bio: e.target.value })}
        />
        <input
          type="text"
          placeholder="Тип"
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}
        />
        <input
          type="date"
          placeholder="Дедлайн"
          value={form.deadline}
          onChange={e => setForm({ ...form, deadline: e.target.value })}
        />
        <button onClick={createCourse}>Добавить курс</button>
      </div>

      <div>
        {courses.map(course => (
          <div key={course.id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
            <h3>{course.name}</h3>
            <p>{course.bio}</p>
            <p>Тип: {course.type}</p>
            <p>Дедлайн: {course.deadline}</p>
            <button onClick={() => deleteCourse(course.id)}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateDeleteCourse;