import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/auth.css"
import api from "../api/axios";
import { clearAuth, isTokenExpired } from "../utils/auth";
import { useToast } from "../components/ToastProvider";
import StatusMessage from "../components/ui/StatusMessage";

const SignUp = () => {
    const navigate = useNavigate()

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
            console.log(err.response?.data || err.message);
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
            <h2 className="authTitle">Тіркелу</h2>
            <label htmlFor="username" className="formLabel">Юзернейм:</label>
            <input className="authInput" value={form.username} name="username" onChange={handleChange} placeholder="Username" />
            <label htmlFor="email" className="formLabel">Email:</label>
            <input className="authInput" value={form.email} name="email" onChange={handleChange} placeholder="Email" />
            <label htmlFor="password" className="formLabel">Құпиясөз:</label>
            <input className="authInput" value={form.password} name="password" type="password" onChange={handleChange} placeholder="Password" />
            <p className="autConfig">Создавая учетную запись, вы соглашаетесь с нашим <a href="#" className="autConfig">Условия и конфиденциальность</a>.</p>
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