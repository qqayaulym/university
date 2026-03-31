import React from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/navbar.css"
import { clearAuth, hasRole } from "../utils/auth";
import { useI18n } from "../contexts/I18nContext";

const NavBar = () => {
  const navigate = useNavigate()
  const { t } = useI18n();

  const pages = [
    {name: t('nav_home'), to: '/'},
    {name: t('nav_profile'), to: '/myprofile'},
    {name: t('nav_courses'), to: '/course'},
    {name: t('nav_notifications'), to: '/notifications'},
    {name: t('nav_settings'), to: '/settings'},
  ]

  if (hasRole(["creator", "admin"])) {
    pages.push({ name: t("nav_creator_manage"), to: "/createcourse" }) // или /manage-courses
  }

  if (hasRole(["admin"])) {
    pages.push({ name: t("nav_admin_panel"), to: "/admin" })
  }

  const LogOut = () => {
    clearAuth()
    navigate("/login")
  }

  return (
    <nav className="navBar">
      {pages.map((page, idx) => (
        <Link key={idx} to={page.to} className='navList'>{page.name}</Link>
      ))}
      <button className="navLogOutButton" onClick={LogOut}>Шығу</button>
    </nav>
  )
}

export default NavBar