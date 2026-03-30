import React from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/navbar.css"
import { clearAuth, hasRole } from "../utils/auth";

const NavBar = () => {
    const navigate = useNavigate()

    const pages = [
        {name: 'Басты бет', to: '/'},
        {name: 'Менің парақшам', to: '/myprofile'},
        {name: 'Іс-шаралар', to: '/course'},
        {name: 'Баптаулар', to: '/settings'},
    ]

    if (hasRole(["creator", "admin"])) {
      pages.push({ name: "Курс басқару", to: "/createcourse" });
    }

    if (hasRole(["admin"])) {
      pages.push({ name: "Админ панелі", to: "/admin" });
    }

    const LogOut = () => {
        clearAuth()
        navigate("/login")
    }

    return(
        <nav className="navBar">
            {pages.map((page, idx) => (
                <Link key={idx} to={page.to} className='navList'>{page.name}</Link>
            ))}
            <button className="navLogOutButton" onClick={LogOut}>Шығу</button>
        </nav>
    )
}

export default NavBar