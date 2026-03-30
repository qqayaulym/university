import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { hasRole } from "../utils/auth";
import api from "../api/axios";
import StatusMessage from "../components/ui/StatusMessage";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import "../styles/courses.css";

const Courses = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses")
        const validCourses = res.data.filter(c => c.name && c.name.trim() !== "")
        setCourses(validCourses)
      } catch (err) {
        console.error("Курстарды алу кезінде қате:", err)
        setError("Курстарды жүктеу мүмкін болмады")
      }
    }
    fetchCourses()
  }, [])

  const getCourseById = (id) => {
    navigate(`/course/${id}`)
  }

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(search.toLowerCase())
  )

  const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  };

  const hoursToDeadline = (endAt) => {
    if (!endAt) return null;
    const end = new Date(endAt);
    if (Number.isNaN(end.getTime())) return null;
    const diffMs = end.getTime() - Date.now();
    return Math.ceil(diffMs / (1000 * 60 * 60));
  };

  return (
    <div className="coursesListDiv">
      <h2>Іс-шаралар</h2>

      <Input
        className="coursesSearchInput"
        type="text"
        placeholder="Іздеу..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <StatusMessage type="error">{error}</StatusMessage>

      {filteredCourses.length === 0 ? (
        <p>Ештеңе табылмады</p>
      ) : (
        filteredCourses.map(course => (
          <Card key={course.id} className="coursesCard">
            <h3>{course.name}</h3>
            <p>{course.bio ? course.bio : "Сипаттама жоқ"}</p>
            {course.start_at && <p>Басталу уақыты: {formatDateTime(course.start_at)}</p>}
            {course.end_at && <p>Аяқталу уақыты: {formatDateTime(course.end_at)}</p>}
            {course.end_at && (
              (() => {
                const h = hoursToDeadline(course.end_at);
                if (h === null) return null;
                return <p>Дедлайнға: <b>{h <= 0 ? "аяқталды" : `${h} сағат`}</b></p>;
              })()
            )}
            <Button variant="secondary" onClick={() => getCourseById(course.id)}>
              Толығырақ
            </Button>
          </Card>
        ))
      )}
      {hasRole(["creator", "admin"]) && (
        <Button onClick={() => navigate("/createcourse")}>Курс құру</Button>
      )}
    </div>
  )
}

export default Courses