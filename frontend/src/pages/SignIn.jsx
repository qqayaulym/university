import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineLockClosed, HiOutlineEnvelope } from "react-icons/hi2"
import "../styles/auth.css"
import api from "../api/axios";
import { clearAuth, isTokenExpired } from "../utils/auth";
import { useToast } from "../components/ToastProvider";
import { useI18n } from "../contexts/I18nContext";

const SignIn = () => {
    const navigate = useNavigate();
    const { t } = useI18n();

    const [form, setForm] = useState({
        email: "",
        password: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const { showToast } = useToast();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await api.post("/auth/login", form);
            localStorage.setItem("token", res.data.token);
            showToast("Сәтті кірдіңіз", "success");
            setForm({ email: "", password: "" });
            navigate("/");
        } catch (err) {
            const msg = err.response?.data?.message || "Қате";
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
        <div className="authPageShell">
            <div className="authBackdropOrb authBackdropOrb-left" />
            <div className="authBackdropOrb authBackdropOrb-right" />

            <form onSubmit={handleSubmit} className="authForm authForm-rich">
                <div className="authTop">
                    <div className="authPill">AITU Events</div>
                    <h2 className="authTitle">{t("auth_login_title")}</h2>
                    <p className="authSubtitle">{t("auth_login_subtitle")}</p>
                </div>

                <div className="authFieldBlock">
                    <label className="formLabel">{t("auth_email_label")}</label>
                    <div className="authInputWrap">
                        <span className="authInputIcon"><HiOutlineEnvelope /></span>
                        <input
                            name="email"
                            value={form.email}
                            placeholder={t("auth_email_label")}
                            onChange={handleChange}
                            className="authInput authInputWithIcon"
                        />
                    </div>
                </div>

                <div className="authFieldBlock">
                    <label className="formLabel">{t("auth_password_label")}</label>
                    <div className="authInputWrap">
                        <span className="authInputIcon"><HiOutlineLockClosed /></span>
                        <input
                            name="password"
                            value={form.password}
                            type={showPassword ? "text" : "password"}
                            placeholder={t("auth_password_placeholder")}
                            onChange={handleChange}
                            className="authInput authInputWithIcon authInputWithAction"
                        />
                        <button
                            type="button"
                            className="authVisibilityButton"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? t("auth_hide_password") : t("auth_show_password")}
                            title={showPassword ? t("auth_hide_password") : t("auth_show_password")}
                        >
                            {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="authButton" disabled={!form.email || !form.password}>
                    {t("auth_login_button")}
                </button>

                <div className="authBottomRow">
                    <p className="authLink">
                        {t("auth_no_account")} <Link to="/register">{t("auth_go_signup")}</Link>
                    </p>
                </div>
            </form>
        </div>
    )
}

export default SignIn
