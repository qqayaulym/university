import React from "react"

const Header = ({title}) => {
    return (
        <header className="headerDiv">
            <img className="headerImg" src={null} alt="" />
            <h1 className="headerTitle">{title}Сайт атауы</h1>
        </header>
    )
}

export default Header