import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const Courses = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/courses")
        const validCourses = res.data.filter(c => c.name && c.name.trim() !== "")
        setCourses(validCourses)
      } catch (err) {
        console.error("Ошибка при получении курсов:", err)
        setError("Не удалось загрузить курсы")
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

  return (
    <div className="coursesListDiv">
      <h2>Іс-шаралар</h2>

      <input
        className="coursesInput"
        type="text"
        placeholder="Іздеу..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {filteredCourses.length === 0 ? (
        <p>Ештеңе табылмады</p>
      ) : (
        filteredCourses.map(course => (
          <div key={course.id}>
            <h3>{course.name}</h3>
            <p>{course.bio ? course.bio : "Описание отсутствует"}</p>
            <button
              className="showDetailsButton"
              onClick={() => getCourseById(course.id)}
            >
              Толығырақ
            </button>
          </div>
        ))
      )}
      <button onClick={() => navigate("/createcourse")}>Курс құру</button>
    </div>
  )
}

export default Courses