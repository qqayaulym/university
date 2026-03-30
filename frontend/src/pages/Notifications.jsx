import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/ui/Loader";
import StatusMessage from "../components/ui/StatusMessage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useI18n } from "../contexts/I18nContext";

const Notifications = () => {
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const lastIdRef = React.useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/notifications/my");
      const list = Array.isArray(res.data) ? res.data : [];
      setNotifications(list);

      if (list.length > 0) {
        const maxId = Math.max(...list.map((n) => Number(n.id) || 0));
        if (Number.isFinite(maxId) && maxId > 0) lastIdRef.current = maxId;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Хабарландыруларды жүктеу мүмкін болмады");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let stopped = false;

    const init = async () => {
      await fetchNotifications();
      setLoading(false);
    };

    const tick = async () => {
      try {
        const params = {};
        if (Number.isFinite(lastIdRef.current)) {
          params.afterId = lastIdRef.current;
        }
        const res = await api.get("/notifications/my", { params });
        const list = Array.isArray(res.data) ? res.data : [];
        if (list.length > 0) {
          const maxId = Math.max(...list.map((n) => Number(n.id) || 0));
          if (Number.isFinite(maxId) && maxId > 0) lastIdRef.current = maxId;
          setNotifications((prev) => [...list.reverse(), ...prev]);
        }
      } catch (_err) {
        return;
      }
    };

    init();

    const id = setInterval(() => {
      if (stopped) return;
      tick();
    }, 8000);

    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (_err) {
      return;
    }
  };

  return (
    <div className="notificationsPage">
      <h2>{t("notifications_title")}</h2>

      {loading && <Loader />}
      <StatusMessage type="error">{error}</StatusMessage>

      {!loading && !error && notifications.length === 0 && <p>{t("notifications_empty")}</p>}

      {notifications.map((n) => (
        <Card key={n.id} className="courseCard">
          <p>{n.message}</p>
          <p>
            {t("notifications_state")}: <b>{n.is_read ? t("notifications_state_read") : t("notifications_state_new")}</b>
          </p>
          {!n.is_read && (
            <Button variant="secondary" onClick={() => markRead(n.id)}>
              {t("notifications_mark_read")}
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
};

export default Notifications;
