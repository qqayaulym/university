import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/auth.css"
import api from "../api/axios";
import { clearAuth, isTokenExpired } from "../utils/auth";
import { useToast } from "../components/ToastProvider";
import StatusMessage from "../components/ui/StatusMessage";
import { useI18n } from "../contexts/I18nContext";

const SignUp = () => {
    const navigate = useNavigate()

    const { t } = useI18n();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    })
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { showToast } = useToast();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await api.post("/auth/register", form);

            if (res.status === 201) {
                setSuccess("Сәтті тіркелдіңіз!");
                showToast("Аккаунт сәтті құрылды", "success");
                setForm({ username: "", email: "", password: "" });
            } else {
                const msg = "Қате тіркеу!";
                setError(msg);
                showToast(msg, "error");
            }

        } catch (err) {
            const msg = err.response?.data?.message || "Қате тіркеу";
            setError(msg);
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

    return (
        <form onSubmit={handleSubmit} className="authForm">
            <h2 className="authTitle">{t("auth_signup_title")}</h2>
            <label htmlFor="username" className="formLabel">Пайдаланушы аты:</label>
            <input className="authInput" value={form.username} name="username" onChange={handleChange} placeholder="Пайдаланушы аты" />
            <label htmlFor="email" className="formLabel">Email:</label>
            <input className="authInput" value={form.email} name="email" onChange={handleChange} placeholder="Email" />
            <label htmlFor="password" className="formLabel">Құпиясөз:</label>
            <input className="authInput" value={form.password} name="password" type="password" onChange={handleChange} placeholder="Құпиясөз" />
            <p className="autConfig">Тіркелу арқылы сіз біздің <a href="#" className="autConfig">Шарттар және құпиялылық</a> ережелерімізбен келісесіз.</p>
            <button className="authButton" type="submit">Тіркелу</button>
            <StatusMessage type="success">{success}</StatusMessage>
            <StatusMessage type="error">{error}</StatusMessage>
            <p className="authLink">
                Аккаунтыңыз бар ма? <Link to="/login">Кіру</Link>
            </p>
        </form>
    )
}

export default SignUp