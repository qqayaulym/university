import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Search, X, ArrowRight, Filter } from "lucide-react";
import { hasRole } from "../utils/auth";
import api from "../api/axios";
import StatusMessage from "../components/ui/StatusMessage";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import { useI18n } from "../contexts/I18nContext";
import { COURSE_TYPES, getCourseTypeLabel } from "./CreateDeleteCourse";
import "../styles/courses.css";

const Courses = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // Filters
  const [typeFilter, setTypeFilter]       = useState("");   // course_type value or ""
  const [dateFrom, setDateFrom]           = useState("");   // YYYY-MM-DD
  const [dateTo, setDateTo]               = useState("");   // YYYY-MM-DD
  const [showFilters, setShowFilters]     = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/with-status").catch(() => api.get("/courses"));
        const validCourses = res.data.filter(c => c.name && c.name.trim() !== "");
        setCourses(validCourses);
      } catch (err) {
        console.error("Курстарды алу кезінде қате:", err);
        setError("Курстарды жүктеу мүмкін болмады");
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (search && !course.name.toLowerCase().includes(search.toLowerCase())) return false;

      if (typeFilter && course.course_type !== typeFilter) return false;

      if (dateFrom) {
        if (!course.start_at) return false;
        if (new Date(course.start_at) < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        if (!course.start_at) return false;
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (new Date(course.start_at) > endOfDay) return false;
      }

      return true;
    });
  }, [courses, search, typeFilter, dateFrom, dateTo]);

  const getCourseById = (id) => navigate(`/course/${id}`);

  const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  };

  const deadlineInfo = (iso) => {
    if (!iso) return null;
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return { label: "Дедлайн өтті", expired: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return { label: "Дедлайн — бүгін!", expired: false, urgent: true };
    return { label: `${days} күн қалды`, expired: false, urgent: days <= 3 };
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="coursesListDiv">
      <div className="coursesHero">
        <div>
          <h2>{t("courses_title")}</h2>
          <p className="coursesLead">
            {filteredCourses.length > 0 ? `${filteredCourses.length}` : t("courses_empty")}
          </p>
        </div>
      </div>

      <div className="coursesToolbar">
        <Input
          className="coursesSearchInput"
          type="text"
          placeholder={t("courses_search")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={Search}
        />
        <Button
          variant="secondary"
          icon={Filter}
          onClick={() => setShowFilters(v => !v)}
        >
          Сүзгілер
        </Button>
        <Button variant="secondary" icon={X} onClick={clearFilters}>
          {t("courses_clear")}
        </Button>
      </div>

      {showFilters && (
        <div className="coursesFilterPanel">
          {/* Type */}
          <div className="coursesFilterGroup">
            <label>Мероприятие түрі</label>
            <select
              className="courseTypeSelect"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">Барлығы</option>
              {COURSE_TYPES.map(ct => (
                <option key={ct.value} value={ct.value}>{ct.label}</option>
              ))}
            </select>
          </div>

          <div className="coursesFilterGroup">
            <label>Басталу күні (бастап)</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
          </div>
          <div className="coursesFilterGroup">
            <label>Басталу күні (дейін)</label>
            <Input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
        </div>
      )}

      <StatusMessage type="error">{error}</StatusMessage>

      {filteredCourses.length === 0 ? (
        <div className="emptyState coursesEmptyState">
          <p>{t("courses_empty")}</p>
        </div>
      ) : (
        <div className="coursesGrid">
          {filteredCourses.map(course => {
            const dl = deadlineInfo(course.deadline);
            const isOwn = course.status === "my_created";

            return (
              <Card key={course.id} className="coursesCard courseCard">
                <div className="coursesCardBadges">
                  {course.is_new && (
                    <span className="courseBadge courseBadgeNew">Жаңа | </span>
                  )}
                  {isOwn && (
                    <span className="courseBadge courseBadgeMine">Сіздің іс-шараңыз </span>
                  )}
                  {course.status === "my_member" && (
                    <span className="courseBadge courseBadgeMember"> Қатысушы</span>
                  )}
                  {course.course_type && (
                    <span className="courseBadge courseBadgeType">
                      {getCourseTypeLabel(course.course_type)}
                    </span>
                  )}
                </div>

                <div className="coursesCardBody">
                  <h3>{course.name}</h3>
                  <p>{course.bio ? course.bio : t("courses_no_description")}</p>
                </div>

                <div className="coursesCardFooter">
                  <div className="coursesCardMeta">
                    {course.start_at && (
                      <p className="coursesCardStart">
                        {t("courses_start")}: {formatDateTime(course.start_at)}
                      </p>
                    )}

                    {/* Deadline */}
                    {course.deadline && (
                      <p className={`coursesCardDeadline ${dl?.urgent ? "deadlineUrgent" : ""} ${dl?.expired ? "deadlineExpired" : ""}`}>
                         {dl?.label ?? formatDateTime(course.deadline)}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="secondary"
                    icon={ArrowRight}
                    onClick={() => getCourseById(course.id)}
                  >
                    {t("courses_details")}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Courses;