import { useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import "../styles/auth.css"

const SignUp = () => {
    const [form, setform] = useState({
        username: "",
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
    };

    return (
        <form onSubmit={handleSubmit} className="authForm">
            <h2 className="authTitle">Тіркелу</h2>
            <input className="authInput" name="username" onChange={handleChange} placeholder="Username" />
            <input className="authInput" name="email" onChange={handleChange} placeholder="Email" />
            <input className="authInput" name="password" type="password" onChange={handleChange} placeholder="Password" />
            <button className="authButton" type="sumbit">Тіркелу</button>
            <p className="authLink">
                Аккаунтыңыз бар ма? <Link to="/">Кіру</Link>
            </p>
        </form>
    )
}

export default SignUp