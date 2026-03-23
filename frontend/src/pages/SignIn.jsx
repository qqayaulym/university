import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import "../styles/auth.css"

const SignIn = () => {
    const navigate = useNavigate();

    const [form, setform] = useState({
        email: "",
        password: ""
    })

    const handleChange = (e) => {
        setform({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try{
            const res = await axios.post(
                "http://localhost:8000/api/auth/login",
                form
            )

            localStorage.setItem("token", res.data.token);
            alert("Қайта қош келдіңіз!")
            setform({ email: "", password: "" })
            navigate("/")
        } catch (err) {
            alert(err.response?.data?.message || "Қате")
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            navigate("/")
        }
    }, [navigate])

    return(
        <form onSubmit={handleSubmit} className="authForm">
            <h2 className="authTitle">Логин</h2>

            <input
                name="email"
                value={form.email}
                placeholder="Email"
                onChange={handleChange}
                className="authInput"
            />

            <input
                name="password"
                value={form.password}
                type="password"
                placeholder="Password"
                onChange={handleChange}
                className="authInput"
            />

            <button type="submit" className="authButton" disabled={!form.email || !form.password}>Sign In</button>
            <p className="authLink">
                Аккаунтыңыз жоқ па? <Link to="/register">Тіркеліңіз</Link>
            </p>
    </form>
    )
}

export default SignIn