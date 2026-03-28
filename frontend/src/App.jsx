import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashBoard = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Қолданушыларды жүктеу қатесі:", err);
      }
    };
    fetchUsers();
  }, [token]);

  const handleRoleChange = async (id, role) => {
    try {
      const res = await axios.put(
        `http://localhost:8000/api/admin/users/${id}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(users.map(u => (u.id === id ? res.data : u)));
    } catch (err) {
      console.error("Роль өзгерту қатесі:", err);
    }
  };

  return (
    <div>
      <h2>Әкімші панелі</h2>
      <h3>Курс құру құқығын беру/алу</h3>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Пайдаланушы аты</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Әрекет</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {user.role !== "admin" && (
                  <>
                    {user.role !== "creator" && (
                      <button onClick={() => handleRoleChange(user.id, "creator")}>
                        Курс құруға рұқсат беру
                      </button>
                    )}
                    {user.role === "creator" && (
                      <button onClick={() => handleRoleChange(user.id, "user")}>
                        Құқықты алу
                      </button>
                    )}
                  </>
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