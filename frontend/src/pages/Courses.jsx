import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlusCircle, Search, X, ArrowRight } from "lucide-react"
import { hasRole } from "../utils/auth";
import api from "../api/axios";
import StatusMessage from "../components/ui/StatusMessage";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import { useI18n } from "../contexts/I18nContext";
import "../styles/courses.css";

const Courses = () => {
  const navigate = useNavigate()
  const { t } = useI18n();
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

  const clearSearch = () => setSearch("")

  return (
    <div className="coursesListDiv">
      <div className="coursesHero">
        <div>
          <h2>{t("courses_title")}</h2>
          <p className="coursesLead">{filteredCourses.length > 0 ? `${filteredCourses.length}` : t("courses_empty")}</p>
        </div>

        {hasRole(["creator", "admin"]) && (
          <Button icon={PlusCircle} onClick={() => navigate("/createcourse")}>{t("courses_create")}</Button>
        )}
      </div>

      <div className="coursesToolbar">
        <Input
          className="coursesSearchInput"
          type="text"
          placeholder={t("courses_search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />
        <Button variant="secondary" icon={X} onClick={clearSearch}>{t("courses_clear")}</Button>
      </div>

      <StatusMessage type="error">{error}</StatusMessage>

      {filteredCourses.length === 0 ? (
        <div className="emptyState coursesEmptyState">
          <p>{t("courses_empty")}</p>
        </div>
      ) : (
        <div className="coursesGrid">
          {filteredCourses.map(course => (
            <Card key={course.id} className="coursesCard courseCard">
              <div className="coursesCardBody">
                <h3>{course.name}</h3>
                <p>{course.bio ? course.bio : t("courses_no_description")}</p>
              </div>
              <div className="coursesCardFooter">
                {course.start_at ? <p>{t("courses_start")}: {formatDateTime(course.start_at)}</p> : <span />}
                <Button variant="secondary" icon={ArrowRight} onClick={() => getCourseById(course.id)}>
                  {t("courses_details")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Courses