import React, { useEffect, useRef } from "react"
import NavBar from "../components/NavBar"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { Outlet } from "react-router-dom"
import api from "../api/axios";
import { useToast } from "../components/ToastProvider";
import "../styles/footerHeader.css"

const MainLayout = ({children}) => {
    const { showToast } = useToast();
    const lastIdRef = useRef(null);

    useEffect(() => {
        let stopped = false;

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
                    if (Number.isFinite(maxId) && maxId > 0) {
                        lastIdRef.current = maxId;
                    }

                    list.forEach((n) => {
                        showToast(n.message, "info");
                    });
                }
            } catch (_err) {
                return;
            }
        };

        const init = async () => {
            try {
                const res = await api.get("/notifications/my");
                const list = Array.isArray(res.data) ? res.data : [];
                if (list.length > 0) {
                    const maxId = Math.max(...list.map((n) => Number(n.id) || 0));
                    if (Number.isFinite(maxId) && maxId > 0) {
                        lastIdRef.current = maxId;
                    }
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
    }, [showToast]);

    return (
        <div className="mainLayout">
            <Header />
            <NavBar />
            <div className="mainContent">
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}

export default MainLayout