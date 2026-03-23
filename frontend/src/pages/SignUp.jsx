import { useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import "../styles/auth.css"

const SignUp = () => {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    })

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:8000/api/auth/register", form);

            if (res.status === 201) {
                alert("Сәтті тіркелдіңіз!");
                setForm({ username: "", email: "", password: "" });
            } else {
                alert("Қате тіркеу!");
            }

        } catch (err) {
            console.log(err.response?.data || err.message);
            alert(err.response?.data?.message || "Қате тіркеу");
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            navigate("/")
        }
    }, [navigate])

    return (
        <form onSubmit={handleSubmit} className="authForm">
            <h2 className="authTitle">Тіркелу</h2>
            <input className="authInput" value={form.username} name="username" onChange={handleChange} placeholder="Username" />
            <input className="authInput" value={form.email} name="email" onChange={handleChange} placeholder="Email" />
            <input className="authInput" value={form.password} name="password" type="password" onChange={handleChange} placeholder="Password" />
            <button className="authButton" type="submit">Тіркелу</button>
            <p className="authLink">
                Аккаунтыңыз бар ма? <Link to="/login">Кіру</Link>
            </p>
        </form>
    )
}

export default SignUp