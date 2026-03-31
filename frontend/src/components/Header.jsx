import React from "react"
import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useI18n } from "../contexts/I18nContext";

const Header = () => {
    const location = useLocation();
    const { t } = useI18n();

    const getPageTitle = () => {
        const pathname = location.pathname;

        if (pathname === "/") return t("page_home");
        if (pathname === "/myprofile") return t("page_profile");
        if (pathname === "/course") return t("page_courses");
        if (pathname.startsWith("/course/")) return t("page_course_details");
        if (pathname === "/notifications") return t("page_notifications");
        if (pathname === "/settings") return t("page_settings");
        if (pathname === "/createcourse") return t("page_creator_manage");
        if (pathname === "/admin") return t("page_admin_panel");

        return t("page_home");
    };

    return (
        <header className="header">
            <Link to="/" className="headerLogo">
                <Sparkles size={24} />
                AITU <span>Events</span>
            </Link>
            <div className="headerPageTitle">{getPageTitle()}</div>
        </header>
    )
}

export default Header