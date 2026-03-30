import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="centeredPage">
      <h2>404 - Бет табылмады</h2>
      <p>Сұралған бет жоқ немесе жылжытылған.</p>
      <Link to="/">Басты бетке оралу</Link>
    </div>
  );
};

export default NotFound;
