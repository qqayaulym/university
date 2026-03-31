import React, { useEffect, useState } from "react"
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2"
import api from "../api/axios";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import StatusMessage from "../components/ui/StatusMessage";
import { useI18n } from "../contexts/I18nContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../components/ToastProvider";
import "../styles/settings.css";

const Settings = () => {
    const { lang, setLang, t } = useI18n();
    const { theme, setTheme } = useTheme();
    const { showToast } = useToast();

    const [profileForm, setProfileForm] = useState({
        username: "",
        email: ""
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false
    });
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {

            try {
                const res = await api.get("/auth/me");
                setProfileForm({
                    username: res.data.username || "",
                    email: res.data.email || ""
                });
            } catch (err) {
                setError(err.response?.data?.message || "Парақша жүктелмеді");
            }
        };
        fetchProfile();
    }, []);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await api.put("/auth/me", profileForm);
            showToast("Парақша сәтті жаңартылды", "success");
        } catch (err) {
            const msg = err.response?.data?.message || "Парақшаны жаңарту мүмкін болмады";
            setError(msg);
            showToast(msg, "error");
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await api.put("/auth/change-password", passwordForm);
            showToast(res.data?.message || "Құпиясөз сәтті жаңартылды", "success");
            setPasswordForm({ currentPassword: "", newPassword: "" });
        } catch (err) {
            const msg = err.response?.data?.message || "Құпиясөз жаңартылмады";
            setError(msg);
            showToast(msg, "error");
        }
    };

    return (
        <div className="settingsPage">
            <h2>{t("settings_title")}</h2>

            <div className="settingsSection">
                <h3>{t("settings_language")}</h3>
                <select
                    className="uiInput"
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                >
                    <option value="kk">Қазақша</option>
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                </select>
            </div>

            <div className="settingsSection">
                <h3>{t("settings_theme")}</h3>
                <select
                    className="uiInput"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                >
                    <option value="light">{t("settings_theme_light")}</option>
                    <option value="dark">{t("settings_theme_dark")}</option>
                </select>
            </div>

            <div className="settingsSection settingsSectionStack">
                <h3>{t("settings_profile_section")}</h3>
                <form className="settingsForm" onSubmit={handleProfileSubmit}>
                    <Input
                        type="text"
                        placeholder={t("settings_username")}
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    />
                    <Input
                        type="email"
                        placeholder={t("settings_email")}
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                    <Button type="submit">{t("settings_save_profile")}</Button>
                </form>
            </div>

            <div className="settingsSection settingsSectionStack">
                <h3>{t("settings_password_section")}</h3>
                <form className="settingsForm" onSubmit={handlePasswordSubmit}>
                    <div className="settingsPasswordWrap">
                        <Input
                            className="settingsPasswordInput"
                            type={showPasswords.current ? "text" : "password"}
                            placeholder={t("settings_current_password")}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        />
                        <button
                            type="button"
                            className="settingsIconButton"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            aria-label={showPasswords.current ? t("auth_hide_password") : t("auth_show_password")}
                            title={showPasswords.current ? t("auth_hide_password") : t("auth_show_password")}
                        >
                            {showPasswords.current ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                        </button>
                    </div>

                    <div className="settingsPasswordWrap">
                        <Input
                            className="settingsPasswordInput"
                            type={showPasswords.new ? "text" : "password"}
                            placeholder={t("settings_new_password")}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                        <button
                            type="button"
                            className="settingsIconButton"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            aria-label={showPasswords.new ? t("auth_hide_password") : t("auth_show_password")}
                            title={showPasswords.new ? t("auth_hide_password") : t("auth_show_password")}
                        >
                            {showPasswords.new ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                        </button>
                    </div>

                    <Button type="submit">{t("settings_save_password")}</Button>
                </form>
            </div>

            <StatusMessage type="error">{error}</StatusMessage>
        </div>
    )
}

export default Settings
