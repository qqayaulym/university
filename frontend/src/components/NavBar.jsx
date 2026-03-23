import React from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import "../styles/navbar.css"

const NavBar = () => {
    const navigate = useNavigate()

    const pages = [
        {name: 'Менің парақшам', to: '/myprofile'},
        {name: 'Іс-шаралар', to: './activities'},
        {name: 'Менің іс-шараларым', to: './myactivities'},
        {name: 'Баптаулар', to: './settings'},
    ]

    const LogOut = () => {
        localStorage.removeItem('token')
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