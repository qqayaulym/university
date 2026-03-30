import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../components/ToastProvider";
import { getCurrentUserFromToken } from "../utils/auth";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import "../styles/adminDashboard.css";

const AdminDashBoard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const currentUser = getCurrentUserFromToken();

  const roleLabel = (role) => {
    if (role === "admin") return "әкімші";
    if (role === "creator") return "крейтор";
    if (role === "user") return "пайдаланушы";
    return role;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/users");
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        showToast("Қолданушыларды жүктеу қатесі", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [showToast]);

  const handleRoleChange = async (id, role) => {
    try {
      const res = await api.put(`/admin/users/${id}/role`, { role });

      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
      showToast("Рөл сәтті жаңартылды", "success");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Рөлді жаңарту сәтсіз", "error");
    }
  };

  return (
    <div className="adminDashboard">
      <h2>Әкімші панелі</h2>
      <h3>Курс құру құқығын беру/алу</h3>
      {loading && <Loader />}

      <table className="adminDashboardTable">
        <thead>
          <tr>
            <th>Пайдаланушы аты</th>
            <th>Email</th>
            <th>Рөлі</th>
            <th>Әрекет</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{roleLabel(user.role)}</td>
              <td>
                {Number(currentUser?.id) === Number(user.id) ? (
                  <span>Өзіңіз</span>
                ) : (
                  <div className="adminDashboardRoleActions">
                    {user.role !== "user" && (
                      <Button
                        className="adminRoleButton"
                        variant="secondary"
                        onClick={() => handleRoleChange(user.id, "user")}
                      >
                        пайдаланушы
                      </Button>
                    )}
                    {user.role !== "creator" && (
                      <Button
                        className="adminRoleButton"
                        variant="secondary"
                        onClick={() => handleRoleChange(user.id, "creator")}
                      >
                        крейтор
                      </Button>
                    )}
                    {user.role !== "admin" && (
                      <Button
                        className="adminRoleButton"
                        onClick={() => handleRoleChange(user.id, "admin")}
                      >
                        әкімші
                      </Button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashBoard;