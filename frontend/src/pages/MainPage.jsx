import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="main">
      <h1>Главная страница</h1>
      <p>Вы успешно вошли в систему 🎉</p>

      <button onClick={handleLogout}>Выйти</button>
    </div>
  );
};

export default MainPage;