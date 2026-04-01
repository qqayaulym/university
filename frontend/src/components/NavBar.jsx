import React, { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Menu, X, Home, User, BookOpen, Bell, Settings, PlusCircle, Shield, LogOut } from "lucide-react"
import "../styles/navbar.css"
import { clearAuth, hasRole } from "../utils/auth";
import { useI18n } from "../contexts/I18nContext";

const NavBar = () => {
  const navigate = useNavigate()
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(() => window.innerWidth > 900);

  const pages = [
    { name: t("nav_home"), to: "/", icon: Home },
    { name: t("nav_profile"), to: "/myprofile", icon: User },
    { name: t("nav_courses"), to: "/course", icon: BookOpen },
    { name: t("nav_notifications"), to: "/notifications", icon: Bell },
    { name: t("nav_settings"), to: "/settings", icon: Settings },
  ]

  if (hasRole(["creator", "admin"])) {
    pages.push({ name: t("nav_creator_manage"), to: "/createcourse", icon: PlusCircle })
  }

  if (hasRole(["admin"])) {
    pages.push({ name: t("nav_admin_panel"), to: "/admin", icon: Shield })
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsOpen(true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const logOut = () => {
    clearAuth()
    navigate("/login")
  }

  return (
    <>
      <button type="button" className="navToggleButton" onClick={() => setIsOpen((prev) => !prev)}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
        <span>{isOpen ? t("nav_collapse") : t("nav_menu")}</span>
      </button>

      <div className={`navOverlay ${isOpen ? "visible" : ""}`.trim()} onClick={() => setIsOpen(false)} />

      <nav className={`navBar ${isOpen ? "" : "closed"}`.trim()}>
        <div className="navHeader">
          <div>
            <strong className="navBrand">AITU Events</strong>
            <p className="navSubtitle">{t("page_home")}</p>
          </div>
        </div>

        <div className="navLinks">
          {pages.map((page, idx) => {
            const Icon = page.icon;
            return (
              <NavLink
                key={idx}
                to={page.to}
                end={page.to === "/" || page.to === "/course"}
                className={({ isActive }) => `navList ${isActive ? "active" : ""}`.trim()}
                onClick={() => window.innerWidth <= 900 && setIsOpen(false)}
              >
                {Icon && <Icon size={18} className="navIcon" />}
                <span className="navListText">{page.name}</span>
                {page.name}
              </NavLink>
            );
          })}
        </div>

        <button className="navLogOutButton" onClick={logOut}>
          <LogOut size={22} />
        </button>
      </nav>
    </>
  )
}

export default NavBar
