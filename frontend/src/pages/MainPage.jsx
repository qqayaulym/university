import { useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react";
import { Calendar, TrendingUp, Users, ArrowRight, ExternalLink } from "lucide-react"
import "../styles/mainpage.css"
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import StatusMessage from "../components/ui/StatusMessage";
import api from "../api/axios";
import { useI18n } from "../contexts/I18nContext";

const MainPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const [upcoming, setUpcoming] = useState([]);
  const [week, setWeek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const weekGroups = useMemo(() => {
    const groups = {};
    (Array.isArray(week) ? week : []).forEach((c) => {
      const d = c.start_at ? new Date(c.start_at) : null;
      const key = d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "unknown";
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return groups;
  }, [week]);

  const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(lang === "kk" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDay = (dateKey) => {
    if (!dateKey || dateKey === "unknown") return t("home_week_unknown");
    const d = new Date(dateKey);
    if (Number.isNaN(d.getTime())) return t("home_week_unknown");
    return d.toLocaleDateString(lang === "kk" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const statItems = [
    { title: t("home_stats_1_title"), text: t("home_stats_1_text"), icon: TrendingUp },
    { title: t("home_stats_2_title"), text: t("home_stats_2_text"), icon: Users },
    { title: t("home_stats_3_title"), text: t("home_stats_3_text"), icon: ArrowRight },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [uRes, wRes] = await Promise.all([
          api.get("/courses/upcoming", { params: { limit: 5 } }),
          api.get("/courses/week"),
        ]);

        setUpcoming(Array.isArray(uRes.data) ? uRes.data : []);
        setWeek(Array.isArray(wRes.data) ? wRes.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Деректерді жүктеу мүмкін болмады");
        setUpcoming([]);
        setWeek([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="mainPageShell">
      <section className="mainHero uiCard">
        <div className="mainHeroContent">
          <span className="mainBadge">{t("home_badge")}</span>
          <h2 className="mainH2">{t("home_title")}</h2>
          <p className="mainP">{t("home_description")}</p>
          <div className="mainActions">
            <Button className="activitiesButton" icon={Calendar} onClick={() => navigate("/course")}>
              {t("home_primary_cta")}
            </Button>
            <Button className="aituButton" variant="secondary" icon={ExternalLink} onClick={() => window.open("https://astanait.edu.kz/", "_blank")}>
              {t("home_secondary_cta")}
            </Button>
          </div>
        </div>

        <div className="mainVisual">
          {statItems.map((item, index) => (
            <Card key={item.title} className={`mainStatCard mainStatCard-${index + 1}`}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <StatusMessage type="error">{error}</StatusMessage>

      {loading ? (
        <div className="mainLoadingWrap">
          <Loader />
        </div>
      ) : (
        <>
          <section className="mainSection">
            <div className="mainSectionHeader">
              <h3>{t("home_upcoming_title")}</h3>
            </div>
            {upcoming.length === 0 ? (
              <Card className="mainEmptyCard">
                <p>{t("home_upcoming_empty")}</p>
              </Card>
            ) : (
              <div className="mainSectionGrid">
                {upcoming.map((course) => (
                  <Card key={course.id} className="mainCourseCard">
                    <div className="mainCardTop">
                      <h4>{course.name}</h4>
                      {course.start_at ? <span>{formatDateTime(course.start_at)}</span> : null}
                    </div>
                    <p>{course.bio || t("courses_no_description")}</p>
                    <Button variant="secondary" icon={ArrowRight} onClick={() => navigate(`/course/${course.id}`)}>
                      {t("home_open_course")}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="mainSection">
            <div className="mainSectionHeader">
              <h3>{t("home_week_title")}</h3>
            </div>
            {Object.keys(weekGroups).length === 0 ? (
              <Card className="mainEmptyCard">
                <p>{t("home_week_empty")}</p>
              </Card>
            ) : (
              <div className="mainWeekGrid">
                {Object.entries(weekGroups).map(([day, items]) => (
                  <Card key={day} className="mainWeekDay">
                    <div className="mainCardTop">
                      <h4>{formatDay(day)}</h4>
                      <span>{t("home_week_count")}: {items.length}</span>
                    </div>
                    {items.map((item) => (
                      <div key={item.id} className="mainWeekItem">
                        <strong>{item.name}</strong>
                        <p>{formatDateTime(item.start_at)}</p>
                      </div>
                    ))}
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default MainPage;