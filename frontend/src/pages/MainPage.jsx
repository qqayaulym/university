import { useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react";
import "../styles/mainpage.css"
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import StatusMessage from "../components/ui/StatusMessage";
import api from "../api/axios";

const MainPage = () => {
  const navigate = useNavigate();

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
    return d.toLocaleString();
  };

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
    <div className="main">
      <h2 className="mainH2">AITU студенттік өмірінің орталығына қош келдіңіз!</h2>
      <p className="mainP">Мұнда сіз университет қабырғасында өтетін барлық қызықты іс-шараларды тауып, бірнеше секунд ішінде тіркеле аласыз. Кино кештерінен бастап, спорттық секцияларға дейін — бәрі осында!</p>
      <img className="mainPhoto" src="none" alt="" />

      <Button className="activitiesButton" onClick={() => navigate("/course")}>Іс-шараларға өту</Button>
      <Button className="aituButton" variant="secondary" onClick={() => window.open("https://astanait.edu.kz/", "_blank")}>AITU сайтына өту</Button>
    </div>
  );
};

export default MainPage;