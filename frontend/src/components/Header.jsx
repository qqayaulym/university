import React from "react"
import { Link } from "react-router-dom";
import { getCurrentUserFromToken } from "../utils/auth";

const Header = () => {
    const user = getCurrentUserFromToken();

    const roleLabel = (role) => {
        if (role === "admin") return "әкімші";
        if (role === "creator") return "крейтор";
        if (role === "user") return "пайдаланушы";
        return role;
    };

    return (
        <header className="header">
            <Link to="/" className="headerLogo">
                AITU <span>Events</span>
            </Link>

            <div className="headerUserAction">
                {user && (
                    <div className="headerUserInfo">
                        <span className="userName">{user.id}</span>
                        <span className="userStatus">{roleLabel(user.role)}</span>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header