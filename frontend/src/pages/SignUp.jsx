import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineLockClosed, HiOutlineEnvelope, HiOutlineUser } from "react-icons/hi2"
import "../styles/auth.css"
import api from "../api/axios";
import { clearAuth, isTokenExpired } from "../utils/auth";
import { useToast } from "../components/ToastProvider";
import { useI18n } from "../contexts/I18nContext";

const SignUp = () => {
    const navigate = useNavigate()
    const { t } = useI18n();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    })

    const [showPassword, setShowPassword] = useState(false)
    const [legalModal, setLegalModal] = useState("")

    const { showToast } = useToast();

    const legalContent = {
        terms: {
            title: t("auth_legal_terms_title"),
            intro: t("auth_legal_terms_intro"),
            items: [
                t("auth_legal_terms_item_1"),
                t("auth_legal_terms_item_2"),
                t("auth_legal_terms_item_3"),
                t("auth_legal_terms_item_4"),
            ],
        },
        privacy: {
            title: t("auth_legal_privacy_title"),
            intro: t("auth_legal_privacy_intro"),
            items: [
                t("auth_legal_privacy_item_1"),
                t("auth_legal_privacy_item_2"),
                t("auth_legal_privacy_item_3"),
                t("auth_legal_privacy_item_4"),
            ],
        },
    }

    const activeLegal = legalModal ? legalContent[legalModal] : null

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post("/auth/register", form);

            if (res.status === 201) {
                showToast("Аккаунт сәтті құрылды", "success");
                setForm({ username: "", email: "", password: "" });
            } else {
                const msg = "Қате тіркеу!";
                showToast(msg, "error");
            }

        } catch (err) {
            const msg = err.response?.data?.message || "Қате тіркеу";
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
        <div className="authPageShell authPageShellWide">
            <div className="authBackdropOrb authBackdropOrb-left" />
            <div className="authBackdropOrb authBackdropOrb-right" />

            <div className="authSplitLayout">
                <section className="authShowcase">
                    <div className="authPill">{t("auth_signup_showcase_badge")}</div>
                    <h2 className="authShowcaseTitle">{t("auth_signup_showcase_title")}</h2>
                    <p className="authShowcaseText">{t("auth_signup_showcase_text")}</p>
                    <div className="authShowcaseCards">
                        <div className="authMiniCard">
                            <strong>{t("auth_signup_showcase_card_1_title")}</strong>
                            <span>{t("auth_signup_showcase_card_1_text")}</span>
                        </div>
                        <div className="authMiniCard">
                            <strong>{t("auth_signup_showcase_card_2_title")}</strong>
                            <span>{t("auth_signup_showcase_card_2_text")}</span>
                        </div>
                    </div>
                </section>

                <form onSubmit={handleSubmit} className="authForm authForm-rich authFormSignup">
                    <div className="authTop">
                        <div className="authPill">AITU Events</div>
                        <h2 className="authTitle">{t("auth_signup_title")}</h2>
                        <p className="authSubtitle">{t("auth_signup_subtitle")}</p>
                    </div>

                    <div className="authFieldBlock">
                        <label className="formLabel">{t("auth_username_label")}</label>
                        <div className="authInputWrap">
                            <span className="authInputIcon"><HiOutlineUser /></span>
                            <input
                                className="authInput authInputWithIcon"
                                value={form.username}
                                name="username"
                                onChange={handleChange}
                                placeholder={t("auth_username_label")}
                            />
                        </div>
                    </div>

                    <div className="authFieldBlock">
                        <label className="formLabel">{t("auth_email_label")}</label>
                        <div className="authInputWrap">
                            <span className="authInputIcon"><HiOutlineEnvelope /></span>
                            <input
                                className="authInput authInputWithIcon"
                                value={form.email}
                                name="email"
                                onChange={handleChange}
                                placeholder={t("auth_email_label")}
                            />
                        </div>
                    </div>

                    <div className="authFieldBlock">
                        <label className="formLabel">{t("auth_password_label")}</label>
                        <div className="authInputWrap">
                            <span className="authInputIcon"><HiOutlineLockClosed /></span>
                            <input
                                className="authInput authInputWithIcon authInputWithAction"
                                value={form.password}
                                name="password"
                                type={showPassword ? "text" : "password"}
                                onChange={handleChange}
                                placeholder={t("auth_password_placeholder")}
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

                    <p className="autConfig">
                        {t("auth_terms_prefix")}
                        <button type="button" className="authInlineButton" onClick={() => setLegalModal("terms")}>{t("auth_terms_link")}</button>
                        {t("auth_terms_middle")}
                        <button type="button" className="authInlineButton" onClick={() => setLegalModal("privacy")}>{t("auth_privacy_link")}</button>
                        {t("auth_terms_suffix")}
                    </p>

                    <button className="authButton" type="submit">{t("auth_signup_button")}</button>

                    <div className="authBottomRow">
                        <p className="authLink">
                            {t("auth_have_account")} <Link to="/login">{t("auth_go_login")}</Link>
                        </p>
                    </div>

                    {activeLegal ? (
                        <div className="authModalOverlay" onClick={() => setLegalModal("")}>
                            <div className="authModal" onClick={(e) => e.stopPropagation()}>
                                <div className="authModalHeader">
                                    <h3>{activeLegal.title}</h3>
                                    <button type="button" className="authModalClose" onClick={() => setLegalModal("")}>{t("auth_legal_close")}</button>
                                </div>
                                <p className="authModalIntro">{activeLegal.intro}</p>
                                <ul className="authModalList">
                                    {activeLegal.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                                <button type="button" className="authButton" onClick={() => setLegalModal("")}>{t("auth_legal_accept")}</button>
                            </div>
                        </div>
                    ) : null}
                </form>
            </div>
        </div>
    )
}

export default SignUp
