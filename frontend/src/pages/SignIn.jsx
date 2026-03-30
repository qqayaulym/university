import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import "../styles/auth.css"
import api from "../api/axios";
import { clearAuth, isTokenExpired } from "../utils/auth";
import { useToast } from "../components/ToastProvider";
import StatusMessage from "../components/ui/StatusMessage";
import { useI18n } from "../contexts/I18nContext";

const SignIn = () => {
    const navigate = useNavigate();

    const { t } = useI18n();

    const [form, setform] = useState({
        email: "",
        password: ""
    })
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { showToast } = useToast();

    const handleChange = (e) => {
        setform({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("");
        setSuccess("");

        try{
            const res = await api.post(
                "/auth/login",
                form
            )

            localStorage.setItem("token", res.data.token);
            setSuccess("Қайта қош келдіңіз!");
            showToast("Сәтті кірдіңіз", "success");
            setform({ email: "", password: "" })
            navigate("/")
        } catch (err) {
            const msg = err.response?.data?.message || "Қате";
            setError(msg)
            showToast(msg, "error");
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            if (isTokenExpired()) {
                clearAuth();
            } else {
                navigate("/")
            }
        }
    }, [navigate])

    return(
        <form onSubmit={handleSubmit} className="authForm">
            <h2 className="authTitle">{t("auth_login_title")}</h2>

            <label htmlFor="email" className="formLabel">Email:</label>
            <input
                name="email"
                value={form.email}
                placeholder="Email"
                onChange={handleChange}
                className="authInput"
            />

            <label htmlFor="password" className="formLabel">Құпиясөз:</label>
            <input
                name="password"
                value={form.password}
                type="password"
                placeholder={t("auth_password_placeholder")}
                onChange={handleChange}
                className="authInput"
            />

            <button type="submit" className="authButton" disabled={!form.email || !form.password}>{t("auth_login_button")}</button>
            <StatusMessage type="success">{success}</StatusMessage>
            <StatusMessage type="error">{error}</StatusMessage>
            <p className="authLink">
                Аккаунтыңыз жоқ па? <Link to="/register" className="authLink">Тіркеліңіз</Link>
            </p>
    </form>
    )
}

export default SignIn