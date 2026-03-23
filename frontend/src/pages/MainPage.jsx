import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"

const MainPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="main">
      <h2>Типа пр</h2>
      <button className="activitiesButton" onClick={() => navigate("/activities")}>Перейти к активам</button>
      <button><a href="https://astanait.edu.kz/">Перейти на сайт айту</a></button>
    </div>
  );
};

export default MainPage;