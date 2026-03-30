import React, { useEffect, useState } from "react"
import api from "../api/axios";
import StatusMessage from "../components/ui/StatusMessage";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import "../styles/settings.css";

const Settings = () => {
    const [profileForm, setProfileForm] = useState({
        username: "",
        email: ""
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: ""
    });
    const [message, setMessage] = useState("");
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
                setError(err.response?.data?.message || "Профиль жүктелмеді");
            }
        };

        fetchProfile();
    }, []);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            await api.put("/auth/me", profileForm);
            setMessage("Профиль сәтті жаңартылды");
        } catch (err) {
            setError(err.response?.data?.message || "Профиль жаңартылмады");
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const res = await api.put("/auth/change-password", passwordForm);
            setMessage(res.data?.message || "Құпиясөз сәтті жаңартылды");
            setPasswordForm({ currentPassword: "", newPassword: "" });
        } catch (err) {
            setError(err.response?.data?.message || "Құпиясөз жаңартылмады");
        }
    };

    return(
        <div className="settingsPage">
            <h2>Баптаулар</h2>
            <div className="settingsSection">
                <h3>Қолданушы профилі</h3>
                <form className="settingsForm" onSubmit={handleProfileSubmit}>
                    <Input
                        type="text"
                        placeholder="Username"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    />
                    <Input
                        type="email"
                        placeholder="Email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                    <Button type="submit">Профильді сақтау</Button>
                </form>
            </div>
            <div className="settingsSection">
                <h3>Құпиясөзді ауыстыру</h3>
                <form className="settingsForm" onSubmit={handlePasswordSubmit}>
                    <Input
                        type="password"
                        placeholder="Ағымдағы құпиясөз"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                    <Input
                        type="password"
                        placeholder="Жаңа құпиясөз"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                    <Button type="submit">Құпиясөзді жаңарту</Button>
                </form>
            </div>
            <StatusMessage type="success">{message}</StatusMessage>
            <StatusMessage type="error">{error}</StatusMessage>
        </div>
    )
}

export default Settings