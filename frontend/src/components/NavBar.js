import React from "react"
import { Link } from "react-router-dom"

const NavBar = () => {
    const pages = [
        {name: 'Менің парақшам', to: '/myprofile'},
        {name: 'Іс-шаралар', to: './activityes'},
        {name: 'Шығу', to: './signin'},
    ]

    return(
        <nav>
            {Links.map((pages, idx) => (
                <Link key={idx} to={pages.to} className='navList'>{pages.name}</Link>
            ))}
        </nav>
    )
}

export default NavBar