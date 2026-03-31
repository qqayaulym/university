import React, { useEffect, useMemo, useState } from "react";
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
    if (role === "admin") return "Әкімші";
    if (role === "creator") return "Контент менеджер";
    if (role === "user") return "Пайдаланушы";
    return role;
  };

  const roleTone = (role) => {
    if (role === "admin") return "admin";
    if (role === "creator") return "creator";
    return "user";
  };

  const stats = useMemo(() => {
    const admins = users.filter((user) => user.role === "admin").length;
    const creators = users.filter((user) => user.role === "creator").length;
    const regularUsers = users.filter((user) => user.role === "user").length;

    return {
      total: users.length,
      admins,
      creators,
      regularUsers,
    };
  }, [users]);

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
      <section className="adminHero">
        <div>
          <p className="adminEyebrow">Admin workspace</p>
          <h2>Әкімші панелі</h2>
          <p className="adminLead">
            Мұнда қолданушылардың рөлдерін басқара аласыз: кім тек қарапайым пайдаланушы,
            кім курс жасай алады, ал кім толық әкімші құқығына ие.
          </p>
        </div>

        <div className="adminHelpCard">
          <h3>Рөлдер нені білдіреді?</h3>
          <ul>
            <li><strong>Пайдаланушы</strong> — платформадағы негізгі қатысушы.</li>
            <li><strong>Контент менеджер</strong> — курстар мен іс-шараларды жасай алады.</li>
            <li><strong>Әкімші</strong> — қолданушылар мен құқықтарды толық басқарады.</li>
          </ul>
        </div>
      </section>

      <section className="adminStatsGrid">
        <div className="adminStatCard">
          <span>Барлығы</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="adminStatCard">
          <span>Әкімшілер</span>
          <strong>{stats.admins}</strong>
        </div>
        <div className="adminStatCard">
          <span>Контент менеджерлер</span>
          <strong>{stats.creators}</strong>
        </div>
        <div className="adminStatCard">
          <span>Пайдаланушылар</span>
          <strong>{stats.regularUsers}</strong>
        </div>
      </section>

      <section className="adminUsersSection">
        <div className="adminSectionTop">
          <div>
            <h3>Қолданушылар тізімі</h3>
            <p>Төменде әр қолданушының ағымдағы рөлі мен оны өзгертуге арналған әрекеттер берілген.</p>
          </div>
        </div>

        {loading ? <Loader /> : null}

        {!loading ? (
          <div className="adminUserList">
            {users.map((user) => {
              const isCurrentUser = Number(currentUser?.id) === Number(user.id);
              return (
                <article key={user.id} className="adminUserCard">
                  <div className="adminUserMain">
                    <div className="adminUserIdentity">
                      <h4>{user.username}</h4>
                      <p>{user.email}</p>
                    </div>

                    <div className={`adminRoleBadge adminRoleBadge-${roleTone(user.role)}`}>
                      {roleLabel(user.role)}
                    </div>
                  </div>

                  <div className="adminUserFooter">
                    {isCurrentUser ? (
                      <span className="adminCurrentUserBadge">Бұл сіздің аккаунтыңыз</span>
                    ) : (
                      <div className="adminDashboardRoleActions">
                        {user.role !== "user" && (
                          <Button
                            className="adminRoleButton"
                            variant="secondary"
                            onClick={() => handleRoleChange(user.id, "user")}
                          >
                            Пайдаланушы ету
                          </Button>
                        )}
                        {user.role !== "creator" && (
                          <Button
                            className="adminRoleButton"
                            variant="secondary"
                            onClick={() => handleRoleChange(user.id, "creator")}
                          >
                            Контент менеджер ету
                          </Button>
                        )}
                        {user.role !== "admin" && (
                          <Button
                            className="adminRoleButton adminRoleButtonPrimary"
                            onClick={() => handleRoleChange(user.id, "admin")}
                          >
                            Әкімші ету
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default AdminDashBoard;
