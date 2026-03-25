import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import "../styles/mainpage.css"

const MainPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="main">
      <h2 className="mainH2">AITU студенттік өмірінің орталығына қош келдіңіз!</h2>
      <p className="mainP">Мұнда сіз университет қабырғасында өтетін барлық қызықты іс-шараларды тауып, бірнеше секунд ішінде тіркеле аласыз. Кино кештерінен бастап, спорттық секцияларға дейін — бәрі осында!</p>
      <img className="mainPhoto" src="none" alt="" />
      <h2 className="mainH2">Жақында болатын іс-шаралар</h2>
      <h2 className="mainH2">Апталық күнтізбе</h2>
      <button className="activitiesButton" onClick={() => navigate("/activities")}>Перейти к активам</button>
      <button className="aituButton"><a href="https://astanait.edu.kz/">Перейти на сайт айту</a></button>
    </div>
  );
};

export default MainPage;