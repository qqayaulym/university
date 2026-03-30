import React, { useEffect, useState } from "react"
import api from "../api/axios";
import Loader from "../components/ui/Loader";
import StatusMessage from "../components/ui/StatusMessage";

const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/auth/me");
                setProfile(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Профиль жүктелмеді");
            }
        };

        fetchProfile();
    }, []);

    if (error) {
        return <StatusMessage type="error">{error}</StatusMessage>;
    }

    if (!profile) {
        return <Loader />;
    }

    return(
        <div className="profileDiv">
            <h2 className="profileUsername">{profile.username}</h2>
            <p>Email: {profile.email}</p>
            <p>Рөлі: {profile.role}</p>
        </div>
    )
}

export default StudentProfile